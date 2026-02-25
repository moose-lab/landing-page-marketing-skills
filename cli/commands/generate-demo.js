import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadPresets } from '../lib/presets.js';
import { createKlingTask, pollTask } from '../lib/kling-api.js';
import { saveManifest } from '../lib/manifest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generateDemo(options) {
  const { model, scenes: scenesArg, output, dryRun } = options;

  console.log(`\n🎬 videoskills — generate-demo`);
  console.log(`   model   : ${model}`);
  console.log(`   scenes  : ${scenesArg}`);
  console.log(`   output  : ${output}`);
  if (dryRun) console.log(`   mode    : DRY RUN (no API calls)\n`);

  // Load scene presets for model
  const presets = loadPresets(model);
  if (!presets) {
    console.error(`❌ No presets found for model: ${model}`);
    process.exit(1);
  }

  // Resolve which scenes to generate
  const allKeys = Object.keys(presets.scenes);
  const targetKeys = scenesArg === 'all'
    ? allKeys
    : scenesArg.split(',').map(s => s.trim()).filter(s => allKeys.includes(s));

  if (targetKeys.length === 0) {
    console.error(`❌ No valid scene keys found. Available: ${allKeys.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n📋 Generating ${targetKeys.length} scene(s):\n`);

  const results = [];

  for (const key of targetKeys) {
    const scene = presets.scenes[key];
    console.log(`  ▶ [${key}] ${scene.label}`);

    if (dryRun) {
      console.log(`    Settings:`, JSON.stringify(scene.settings, null, 2));
      if (scene.multi_shot) {
        console.log(`    Shots:`);
        scene.shots.forEach((s, i) => console.log(`      Shot ${i + 1}: "${s.prompt.slice(0, 80)}..." (${s.duration}s)`));
      } else {
        console.log(`    Prompt: "${scene.prompt?.slice(0, 80)}..."`);
      }
      console.log('');
      results.push({ key, label: scene.label, status: 'dry-run', video_url: null });
      continue;
    }

    try {
      // Build API payload
      const payload = buildPayload(presets.model, scene);
      const task = await createKlingTask(payload);
      console.log(`    Task ID: ${task.task_id}`);

      // Poll until complete
      const result = await pollTask(task.task_id);
      if (result.status === 'completed') {
        console.log(`    ✅ Done: ${result.video_url}`);
        results.push({ key, label: scene.label, status: 'completed', video_url: result.video_url, settings: scene.settings });
      } else {
        console.log(`    ❌ Failed: ${result.error}`);
        results.push({ key, label: scene.label, status: 'failed', video_url: null, error: result.error });
      }
    } catch (err) {
      console.error(`    ❌ Error: ${err.message}`);
      results.push({ key, label: scene.label, status: 'error', video_url: null, error: err.message });
    }

    console.log('');
  }

  // Save manifest for landing page
  const manifest = saveManifest(output, model, results);
  console.log(`\n✅ Manifest saved → ${manifest}`);
  console.log(`   Start landing page: node landing/server.js\n`);
}

function buildPayload(modelName, scene) {
  const base = {
    model: 'kling',
    task_type: 'video_generation',
    input: {
      model_name: modelName,
      ...scene.settings,
    }
  };

  if (scene.multi_shot) {
    base.input.multi_shot = true;
    base.input.multi_prompt = scene.shots;
  } else {
    base.input.prompt = scene.prompt;
  }

  return base;
}
