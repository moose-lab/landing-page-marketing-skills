import { loadPresets } from '../lib/presets.js';

export function listScenes({ model }) {
  const presets = loadPresets(model);
  if (!presets) {
    console.error(`❌ No presets found for model: ${model}`);
    process.exit(1);
  }

  console.log(`\n🎬 Available scenes for model: ${model}\n`);
  console.log(`${'Key'.padEnd(28)} ${'Label'.padEnd(28)} ${'Tier'.padEnd(8)} ${'Duration'.padEnd(10)} Ratio`);
  console.log('─'.repeat(85));

  for (const [key, scene] of Object.entries(presets.scenes)) {
    const { duration, aspect_ratio } = scene.settings;
    const tier = scene.model_tier || presets.default_model || 'std';
    const shots = scene.multi_prompt ? `${scene.multi_prompt.length} shots` : '1 shot';
    const sound = scene.settings.sound ? ' 🎵' : '';
    console.log(
      `${key.padEnd(28)} ${scene.label.padEnd(28)} ${tier.padEnd(8)} ${String(duration + 's').padEnd(10)} ${aspect_ratio}${sound}  (${shots})`
    );
  }

  console.log(`\nTotal: ${Object.keys(presets.scenes).length} scenes`);
  console.log(`\nUsage: node cli/index.js generate-demo --model ${model} --scenes product_showcase,cinematic_landscape\n`);
}
