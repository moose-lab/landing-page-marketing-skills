import fs from 'fs';
import path from 'path';

const DOWNLOAD_RETRIES = 3;

/**
 * Download an image from URL to local disk.
 * @param {string} url - Remote image URL
 * @param {string} outputDir - Base output directory
 * @param {string} filename - Target filename (e.g. "hero_gradient.png")
 * @returns {Promise<string>} Local path relative to outputDir
 */
export async function downloadImage(url, outputDir, filename) {
  const imagesDir = path.join(outputDir, 'images');
  fs.mkdirSync(imagesDir, { recursive: true });

  const localPath = path.join(imagesDir, filename);

  for (let attempt = 1; attempt <= DOWNLOAD_RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(localPath, buffer);

      return `images/${filename}`;
    } catch (err) {
      if (attempt === DOWNLOAD_RETRIES) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}
