import fs from 'fs';
import path from 'path';

export function saveManifest(outputDir, model, results) {
  fs.mkdirSync(outputDir, { recursive: true });
  
  const manifest = {
    model,
    generated_at: new Date().toISOString(),
    demos: results.map(r => ({
      key: r.key,
      label: r.label,
      status: r.status,
      video_url: r.video_url,
      settings: r.settings || null,
      error: r.error || null,
    })),
  };

  const filePath = path.join(outputDir, `${model}-demos.json`);
  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
  return filePath;
}
