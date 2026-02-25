import { loadPresets } from '../lib/presets.js';

export function listScenes({ model }) {
  const presets = loadPresets(model);
  if (!presets) {
    console.error(`❌ No presets found for model: ${model}`);
    process.exit(1);
  }

  console.log(`\n🎬 Available scenes for model: ${model}\n`);
  console.log(`${'Key'.padEnd(28)} ${'Label'.padEnd(28)} ${'Mode'.padEnd(8)} ${'Duration'.padEnd(10)} Ratio`);
  console.log('─'.repeat(85));

  for (const [key, scene] of Object.entries(presets.scenes)) {
    const { mode, duration, aspect_ratio } = scene.settings;
    const shots = scene.multi_shot ? `${scene.shots?.length || 1} shots` : '1 shot';
    console.log(
      `${key.padEnd(28)} ${scene.label.padEnd(28)} ${mode.padEnd(8)} ${String(duration + 's').padEnd(10)} ${aspect_ratio}  (${shots})`
    );
  }

  console.log(`\nTotal: ${Object.keys(presets.scenes).length} scenes`);
  console.log(`\nUsage: node cli/index.js generate-demo --model ${model} --scenes product_showcase,cinematic_landscape\n`);
}
