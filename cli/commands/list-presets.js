import { loadPresets } from '../lib/presets.js';

export function listPresets({ model }) {
  const presets = loadPresets(model);
  if (!presets) {
    console.error(`❌ No presets found for model: ${model}`);
    process.exit(1);
  }

  console.log(`\n🖼  Available presets for model: ${model}\n`);
  console.log(`${'Key'.padEnd(30)} ${'Label'.padEnd(28)} ${'Category'.padEnd(22)} ${'Ratio'.padEnd(8)} ${'Res'.padEnd(6)} Format`);
  console.log('─'.repeat(100));

  let total = 0;
  for (const [catKey, category] of Object.entries(presets.categories)) {
    for (const preset of category.presets) {
      const settings = { ...presets.defaults, ...category.settings };
      console.log(
        `${preset.key.padEnd(30)} ${preset.label.padEnd(28)} ${catKey.padEnd(22)} ${(settings.aspect_ratio || '—').padEnd(8)} ${(settings.resolution || '—').padEnd(6)} ${settings.output_format || '—'}`
      );
      total++;
    }
  }

  console.log(`\nTotal: ${total} presets across ${Object.keys(presets.categories).length} categories`);
  console.log(`\nUsage: node cli/index.js generate-images --model ${model} --categories hero_backgrounds --output ./public/demos\n`);
}
