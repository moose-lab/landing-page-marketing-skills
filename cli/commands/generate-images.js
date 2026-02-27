import { loadPresets } from '../lib/presets.js';
import { createImageTask, pollTask } from '../lib/wavespeed-api.js';
import { saveImageManifest } from '../lib/manifest.js';
import { downloadImage } from '../lib/image-downloader.js';

export async function generateImages(options) {
  const { model, categories: catsArg, output, dryRun, customPresets, aspectRatio, resolution, format } = options;

  if (!output) {
    console.error('Please specify an output directory with --output <path>');
    process.exit(1);
  }

  console.log(`\n🖼  assetskills — generate-images`);
  console.log(`   model      : ${model}`);
  console.log(`   categories : ${catsArg}`);
  console.log(`   output     : ${output}`);
  console.log(`   provider   : WaveSpeed.ai`);
  if (customPresets) console.log(`   presets    : ${customPresets}`);
  if (dryRun) console.log(`   mode       : DRY RUN (no API calls)\n`);

  const presets = loadPresets(model, customPresets);
  if (!presets) {
    console.error(`❌ No presets found for model: ${model}`);
    process.exit(1);
  }

  const allCatKeys = Object.keys(presets.categories);
  const targetCats = catsArg === 'all'
    ? allCatKeys
    : catsArg.split(',').map(s => s.trim()).filter(s => allCatKeys.includes(s));

  if (targetCats.length === 0) {
    console.error(`❌ No valid categories. Available: ${allCatKeys.join(', ')}`);
    process.exit(1);
  }

  // Collect all presets from selected categories
  const tasks = [];
  for (const catKey of targetCats) {
    const category = presets.categories[catKey];
    for (const preset of category.presets) {
      tasks.push({ catKey, category, preset });
    }
  }

  console.log(`\n📋 Generating ${tasks.length} image(s) across ${targetCats.length} categor${targetCats.length === 1 ? 'y' : 'ies'}:\n`);

  const results = [];

  for (const { catKey, category, preset } of tasks) {
    console.log(`  ▶ [${preset.key}] ${preset.label} (${catKey})`);

    // Merge settings: defaults < category settings < CLI overrides
    const settings = { ...presets.defaults, ...category.settings };
    if (aspectRatio) settings.aspect_ratio = aspectRatio;
    if (resolution) settings.resolution = resolution;
    if (format) settings.output_format = format;

    if (dryRun) {
      console.log(`    Settings: ${JSON.stringify(settings)}`);
      console.log(`    Prompt: "${preset.prompt.slice(0, 100)}..."`);
      if (preset.negative_prompt) console.log(`    Negative: "${preset.negative_prompt.slice(0, 80)}..."`);
      console.log('');
      results.push({
        key: preset.key, label: preset.label, category: catKey,
        status: 'dry-run', image_url: null, local_path: null,
        prompt: preset.prompt, negative_prompt: preset.negative_prompt,
        settings, tags: preset.tags,
      });
      continue;
    }

    try {
      const modelPath = presets.models[presets.default_model];
      const payload = {
        prompt: preset.prompt,
        negative_prompt: preset.negative_prompt || undefined,
        aspect_ratio: settings.aspect_ratio,
        resolution: settings.resolution,
        output_format: settings.output_format,
        enable_sync_mode: settings.enable_sync_mode !== false,
      };

      console.log(`    Model: ${modelPath}`);
      const task = await createImageTask(modelPath, payload);

      let imageUrl;
      if (task.outputs && task.outputs[0]) {
        // Sync mode — result returned immediately
        imageUrl = task.outputs[0];
        console.log(`    ✅ Sync complete`);
      } else if (task.id) {
        // Async mode — poll
        console.log(`    Task ID: ${task.id}`);
        const result = await pollTask(task.id);
        if (result.status === 'completed') {
          imageUrl = result.output_url;
        } else {
          throw new Error(result.error || 'Generation failed');
        }
      }

      // Download image locally
      const ext = settings.output_format || 'png';
      const filename = `${preset.key}.${ext}`;
      const localPath = await downloadImage(imageUrl, output, filename);
      console.log(`    ✅ Downloaded → ${localPath}`);

      results.push({
        key: preset.key, label: preset.label, category: catKey,
        status: 'completed', image_url: imageUrl, local_path: localPath,
        prompt: preset.prompt, negative_prompt: preset.negative_prompt,
        settings, tags: preset.tags,
      });
    } catch (err) {
      console.error(`    ❌ Error: ${err.message}`);
      results.push({
        key: preset.key, label: preset.label, category: catKey,
        status: 'error', image_url: null, local_path: null,
        prompt: preset.prompt, negative_prompt: preset.negative_prompt,
        settings, tags: preset.tags, error: err.message,
      });
    }

    console.log('');
  }

  // Save manifest
  const manifest = saveImageManifest(output, model, results);
  console.log(`\n✅ Manifest saved → ${manifest}`);
  console.log(`   Start landing page: node landing/server.js\n`);
}
