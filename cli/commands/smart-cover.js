import fs from 'fs';
import path from 'path';
import { extractSmartThumbnail } from '../lib/thumbnail.js';
import { createImageTask } from '../lib/wavespeed-api.js';

export async function smartCover(options) {
  const {
    manifest: manifestPath = './public/demos/kling3-demos.json',
    output = './public/demos',
    candidates = 12,
    enhance = false,
  } = options;

  console.log(`\n🎬 assetskills — smart-cover`);
  console.log(`   manifest   : ${manifestPath}`);
  console.log(`   output     : ${output}`);
  console.log(`   candidates : ${candidates}`);
  console.log(`   enhance    : ${enhance}\n`);

  const resolved = path.resolve(manifestPath);
  if (!fs.existsSync(resolved)) {
    console.error(`❌ Manifest not found: ${resolved}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(resolved, 'utf-8'));
  const videos = (manifest.demos || []).filter(d => d.status === 'completed' && d.video_url);

  if (videos.length === 0) {
    console.log('No completed videos found in manifest.');
    return;
  }

  console.log(`📋 Processing ${videos.length} video(s):\n`);

  for (const video of videos) {
    const duration = video.settings?.duration || 8;
    process.stdout.write(`  ▶ [${video.key}] ${video.label}...`);

    try {
      const result = await extractSmartThumbnail(video.video_url, output, video.key, duration);
      if (result) {
        const thumbPath = typeof result === 'string' ? result : result.url;
        const scores = typeof result === 'object' ? result.scores : null;

        video.thumbnail_url = thumbPath;
        video.thumbnail_scores = scores || null;

        if (scores) {
          process.stdout.write(` ✅ (composite: ${scores.composite.toFixed(1)})\n`);
          console.log(`    Scores: size=${scores.fileSize.toFixed(1)} color=${scores.colorVariance.toFixed(1)} edge=${scores.edgeDensity.toFixed(1)} brightness=${scores.brightnessBalance.toFixed(1)}`);
        } else {
          process.stdout.write(` ✅\n`);
        }

        // Optional: enhance the best frame via nano-banana-2/edit
        if (enhance && thumbPath) {
          try {
            process.stdout.write(`    ✨ Enhancing via Nano Banana 2...`);
            const thumbFullPath = path.join(output, thumbPath.replace('demos/', ''));
            // Read image and convert to base64 for the edit endpoint
            const imageBuffer = fs.readFileSync(thumbFullPath);
            const base64 = imageBuffer.toString('base64');

            const editResult = await createImageTask('google/nano-banana-2/edit', {
              image: `data:image/jpeg;base64,${base64}`,
              prompt: 'Enhance this video frame: increase sharpness, improve color vibrancy, add subtle cinematic color grading, maintain natural look',
              output_format: 'jpeg',
              enable_sync_mode: true,
            });

            if (editResult.outputs && editResult.outputs[0]) {
              // Download enhanced version
              const res = await fetch(editResult.outputs[0]);
              const buffer = Buffer.from(await res.arrayBuffer());
              fs.writeFileSync(thumbFullPath, buffer);
              process.stdout.write(` ✅ enhanced\n`);
            } else {
              process.stdout.write(` ⚠️ no output\n`);
            }
          } catch (err) {
            process.stdout.write(` ⚠️ ${err.message}\n`);
          }
        }
      } else {
        process.stdout.write(` ⚠️ no frames extracted\n`);
      }
    } catch (err) {
      process.stdout.write(` ❌ ${err.message}\n`);
    }

    console.log('');
  }

  // Save updated manifest
  manifest.generated_at = new Date().toISOString();
  fs.writeFileSync(resolved, JSON.stringify(manifest, null, 2));
  console.log(`✅ Manifest updated → ${resolved}\n`);
}
