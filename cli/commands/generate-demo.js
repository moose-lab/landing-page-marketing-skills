import { loadPresets } from '../lib/presets.js';
import { createTask, pollTask } from '../lib/wavespeed-api.js';
import { saveManifest } from '../lib/manifest.js';
import { generateThumbnails } from '../lib/thumbnail.js';

export async function generateDemo(options) {
  const { model, scenes: scenesArg, output, dryRun, customPresets } = options;

  console.log(`\n🎬 assetskills — generate-demo`);
  console.log(`   model   : ${model}`);
  console.log(`   scenes  : ${scenesArg}`);
  console.log(`   output  : ${output}`);
  console.log(`   provider: WaveSpeed.ai`);
  if (customPresets) console.log(`   presets : ${customPresets}`);
  if (dryRun) console.log(`   mode    : DRY RUN (no API calls)\n`);

  // Load scene presets (built-in or custom)
  const presets = loadPresets(model, customPresets);
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
      if (scene.multi_prompt) {
        console.log(`    Shots:`);
        scene.multi_prompt.forEach((s, i) => console.log(`      Shot ${i + 1}: "${s.prompt.slice(0, 80)}..." (${s.duration}s)`));
      } else {
        console.log(`    Prompt: "${scene.prompt?.slice(0, 80)}..."`);
      }
      console.log('');
      results.push({
        key, label: scene.label, status: 'dry-run', video_url: null,
        prompt: scene.prompt || null,
        multi_prompt: scene.multi_prompt || null,
        settings: scene.settings,
      });
      continue;
    }

    try {
      // Resolve model endpoint path
      const modelPath = resolveModelPath(presets, scene);
      const payload = buildPayload(scene);

      console.log(`    Model: ${modelPath}`);
      const task = await createTask(modelPath, payload);
      console.log(`    Task ID: ${task.id}`);

      // Poll until complete
      const result = await pollTask(task.id);
      if (result.status === 'completed') {
        console.log(`    ✅ Done: ${result.video_url}`);
        results.push({
          key, label: scene.label, status: 'completed', video_url: result.video_url,
          prompt: scene.prompt || null,
          multi_prompt: scene.multi_prompt || null,
          settings: scene.settings,
        });
      } else {
        console.log(`    ❌ Failed: ${result.error}`);
        results.push({
          key, label: scene.label, status: 'failed', video_url: null,
          prompt: scene.prompt || null,
          multi_prompt: scene.multi_prompt || null,
          error: result.error,
        });
      }
    } catch (err) {
      console.error(`    ❌ Error: ${err.message}`);
      results.push({
        key, label: scene.label, status: 'error', video_url: null,
        prompt: scene.prompt || null,
        multi_prompt: scene.multi_prompt || null,
        error: err.message,
      });
    }

    console.log('');
  }

  // Generate smart thumbnails for completed videos
  const completedCount = results.filter(r => r.status === 'completed').length;
  if (completedCount > 0 && !dryRun) {
    console.log(`\n🖼  Generating smart thumbnails for ${completedCount} video(s):\n`);
    const resultsWithThumbs = await generateThumbnails(output, results);
    results.length = 0;
    results.push(...resultsWithThumbs);
  }

  // Save manifest for landing page
  const manifest = saveManifest(output, model, results);
  console.log(`\n✅ Manifest saved → ${manifest}`);
  console.log(`   Start landing page: node landing/server.js\n`);
}

function resolveModelPath(presets, scene) {
  const tier = scene.model_tier || presets.default_model || 'std';
  return presets.models[tier] || presets.models['std'];
}

function buildPayload(scene) {
  const payload = { ...scene.settings };

  if (scene.multi_prompt) {
    payload.multi_prompt = scene.multi_prompt;
    // Use first prompt as the main prompt field (required by API)
    payload.prompt = scene.multi_prompt[0].prompt;
  } else {
    payload.prompt = scene.prompt;
  }

  if (scene.negative_prompt) {
    payload.negative_prompt = scene.negative_prompt;
  }

  return payload;
}
