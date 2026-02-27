import fs from 'fs';
import path from 'path';

export function saveManifest(outputDir, model, results) {
  fs.mkdirSync(outputDir, { recursive: true });

  const filePath = path.join(outputDir, `${model}-demos.json`);

  // Merge with existing manifest if present (append new results, update existing keys)
  let existing = { demos: [] };
  if (fs.existsSync(filePath)) {
    try {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {}
  }

  const newResults = results.map(r => ({
    key: r.key,
    label: r.label,
    status: r.status,
    video_url: r.video_url,
    thumbnail_url: r.thumbnail_url || null,
    prompt: r.prompt || null,
    multi_prompt: r.multi_prompt || null,
    settings: r.settings || null,
    error: r.error || null,
  }));

  // Merge: update existing keys, append new ones
  const merged = new Map();
  for (const demo of (existing.demos || [])) {
    merged.set(demo.key, demo);
  }
  for (const demo of newResults) {
    merged.set(demo.key, demo);
  }

  const manifest = {
    model,
    provider: 'wavespeed',
    generated_at: new Date().toISOString(),
    demos: [...merged.values()],
  };

  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
  return filePath;
}

export function saveImageManifest(outputDir, model, results) {
  fs.mkdirSync(outputDir, { recursive: true });

  const filePath = path.join(outputDir, `${model}-demos.json`);

  let existing = { demos: [] };
  if (fs.existsSync(filePath)) {
    try {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {}
  }

  const newResults = results.map(r => ({
    key: r.key,
    label: r.label,
    category: r.category,
    status: r.status,
    image_url: r.image_url || null,
    local_path: r.local_path || null,
    prompt: r.prompt || null,
    negative_prompt: r.negative_prompt || null,
    settings: r.settings || null,
    tags: r.tags || [],
    error: r.error || null,
  }));

  const merged = new Map();
  for (const demo of (existing.demos || [])) {
    merged.set(demo.key, demo);
  }
  for (const demo of newResults) {
    merged.set(demo.key, demo);
  }

  const manifest = {
    model,
    provider: 'wavespeed',
    asset_type: 'image',
    generated_at: new Date().toISOString(),
    demos: [...merged.values()],
  };

  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
  return filePath;
}
