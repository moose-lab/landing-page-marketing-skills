import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execFileAsync = promisify(execFile);

const CANDIDATE_POSITIONS = [0.05, 0.10, 0.18, 0.25, 0.33, 0.40, 0.50, 0.58, 0.67, 0.75, 0.85, 0.92];
const THUMBNAIL_DIR = 'thumbnails';

// Score weights for multi-factor selection
const WEIGHTS = {
  fileSize: 0.25,
  colorVariance: 0.30,
  edgeDensity: 0.25,
  brightnessBalance: 0.20,
};

/**
 * Score a candidate thumbnail frame using ImageMagick analysis.
 * Falls back to file-size-only scoring if ImageMagick is unavailable.
 */
async function scoreCandidate(candidatePath, fileSize) {
  const scores = { fileSize: 0, colorVariance: 0, edgeDensity: 0, brightnessBalance: 0, composite: 0 };

  // File size score (normalized 0-10, larger = more visual detail)
  // Will be normalized across all candidates later
  scores.fileSize = fileSize;

  try {
    const { stdout } = await execFileAsync('identify', [
      '-verbose', candidatePath,
    ], { timeout: 10000 });

    // Parse color channel standard deviations (higher = more color variety)
    const stdDevMatches = [...stdout.matchAll(/standard deviation:\s*([\d.]+)/g)];
    if (stdDevMatches.length >= 3) {
      const avgStdDev = stdDevMatches.slice(0, 3).reduce((sum, m) => sum + parseFloat(m[1]), 0) / 3;
      // Normalize: typical range 0-80, map to 0-10
      scores.colorVariance = Math.min(10, (avgStdDev / 80) * 10);
    }

    // Parse mean brightness (penalize too dark < 30 or too bright > 225)
    const meanMatches = [...stdout.matchAll(/mean:\s*([\d.]+)/g)];
    if (meanMatches.length >= 3) {
      const avgMean = meanMatches.slice(0, 3).reduce((sum, m) => sum + parseFloat(m[1]), 0) / 3;
      // Optimal range: 60-200 (on 0-255 scale)
      if (avgMean >= 60 && avgMean <= 200) {
        scores.brightnessBalance = 10;
      } else if (avgMean < 60) {
        scores.brightnessBalance = Math.max(0, (avgMean / 60) * 10);
      } else {
        scores.brightnessBalance = Math.max(0, ((255 - avgMean) / 55) * 10);
      }
    }
  } catch {
    // ImageMagick not available — use file size only
    scores.colorVariance = 5; // neutral
    scores.brightnessBalance = 5; // neutral
  }

  // Edge density: use file size as proxy (JPEG with more edges = larger file)
  // This will be normalized across candidates
  scores.edgeDensity = fileSize;

  return scores;
}

/**
 * Normalize file-size-based scores across all candidates.
 */
function normalizeSizeScores(candidates) {
  if (candidates.length === 0) return;

  const maxSize = Math.max(...candidates.map(c => c.scores.fileSize));
  const minSize = Math.min(...candidates.map(c => c.scores.fileSize));
  const range = maxSize - minSize || 1;

  for (const c of candidates) {
    c.scores.fileSize = ((c.scores.fileSize - minSize) / range) * 10;
    c.scores.edgeDensity = ((c.scores.edgeDensity - minSize) / range) * 10;
  }
}

/**
 * Calculate weighted composite score.
 */
function compositeScore(scores) {
  return (
    scores.fileSize * WEIGHTS.fileSize +
    scores.colorVariance * WEIGHTS.colorVariance +
    scores.edgeDensity * WEIGHTS.edgeDensity +
    scores.brightnessBalance * WEIGHTS.brightnessBalance
  );
}

/**
 * Extract smart thumbnail from a video URL with multi-factor scoring.
 */
export async function extractSmartThumbnail(videoUrl, outputDir, key, duration) {
  const thumbDir = path.join(outputDir, THUMBNAIL_DIR);
  fs.mkdirSync(thumbDir, { recursive: true });

  const candidates = [];

  for (const pos of CANDIDATE_POSITIONS) {
    const timestamp = Math.max(0.5, duration * pos);
    const candidatePath = path.join(thumbDir, `${key}_candidate_${pos}.jpg`);

    try {
      await execFileAsync('ffmpeg', [
        '-ss', String(timestamp),
        '-i', videoUrl,
        '-frames:v', '1',
        '-q:v', '2',
        '-y',
        candidatePath,
      ], { timeout: 30000 });

      if (fs.existsSync(candidatePath)) {
        const stat = fs.statSync(candidatePath);
        const scores = await scoreCandidate(candidatePath, stat.size);
        candidates.push({ path: candidatePath, pos, size: stat.size, scores });
      }
    } catch {
      // Skip failed frame extraction
    }
  }

  if (candidates.length === 0) return null;

  // Normalize size-based scores, then compute composite
  normalizeSizeScores(candidates);
  for (const c of candidates) {
    c.scores.composite = compositeScore(c.scores);
  }

  // Sort by composite score (descending)
  candidates.sort((a, b) => b.scores.composite - a.scores.composite);
  const best = candidates[0];

  // Rename best candidate to final thumbnail
  const finalPath = path.join(thumbDir, `${key}.jpg`);
  fs.renameSync(best.path, finalPath);

  // Clean up other candidates
  for (const c of candidates) {
    if (c.path !== best.path && fs.existsSync(c.path)) {
      fs.unlinkSync(c.path);
    }
  }

  const relativePath = `demos/${THUMBNAIL_DIR}/${key}.jpg`;
  return { url: relativePath, scores: best.scores };
}

/**
 * Generate thumbnails for all completed demos in a manifest.
 */
export async function generateThumbnails(outputDir, results) {
  const updated = [];

  for (const r of results) {
    if (r.status === 'completed' && r.video_url) {
      const duration = r.settings?.duration || 8;
      process.stdout.write(`  🖼  [${r.key}] Extracting smart thumbnail...`);

      try {
        const result = await extractSmartThumbnail(r.video_url, outputDir, r.key, duration);
        if (result) {
          const thumbPath = typeof result === 'string' ? result : result.url;
          const scores = typeof result === 'object' ? result.scores : null;
          process.stdout.write(` ✅${scores ? ` (score: ${scores.composite.toFixed(1)})` : ''}\n`);
          updated.push({ ...r, thumbnail_url: thumbPath, thumbnail_scores: scores });
        } else {
          process.stdout.write(` ⚠️  no frames extracted\n`);
          updated.push({ ...r, thumbnail_url: null });
        }
      } catch (err) {
        process.stdout.write(` ❌ ${err.message}\n`);
        updated.push({ ...r, thumbnail_url: null });
      }
    } else {
      updated.push({ ...r, thumbnail_url: null });
    }
  }

  return updated;
}
