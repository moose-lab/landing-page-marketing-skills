import fs from 'fs';
import path from 'path';
import { scanHtmlForAssets, mergeWithTemplates } from '../lib/asset-scanner.js';
import { loadPresets } from '../lib/presets.js';

export function analyzeAssets(options) {
  const { input, output = './asset-requirements.json', model = 'nano-banana-2' } = options;

  if (!input) {
    console.error('Please specify an input HTML file with --input <path>');
    process.exit(1);
  }

  console.log(`\n🔍 assetskills — analyze-assets`);
  console.log(`   input  : ${input}`);
  console.log(`   output : ${output}`);
  console.log(`   model  : ${model}\n`);

  const inputPath = path.resolve(input);
  const presets = loadPresets(model);

  // Handle single file or directory
  const htmlFiles = [];
  if (fs.statSync(inputPath).isDirectory()) {
    const files = fs.readdirSync(inputPath).filter(f => f.endsWith('.html'));
    htmlFiles.push(...files.map(f => path.join(inputPath, f)));
  } else {
    htmlFiles.push(inputPath);
  }

  const allSlots = [];
  for (const file of htmlFiles) {
    console.log(`  📄 Scanning ${path.basename(file)}...`);
    const slots = scanHtmlForAssets(file);
    console.log(`     Found ${slots.length} asset slot(s)`);
    allSlots.push(...slots);
  }

  // Merge with preset templates
  const merged = mergeWithTemplates(allSlots, presets);

  // Summary by category
  const byCat = {};
  for (const slot of merged) {
    const cat = slot.suggested_category;
    byCat[cat] = (byCat[cat] || 0) + 1;
  }

  console.log(`\n📊 Summary:`);
  for (const [cat, count] of Object.entries(byCat)) {
    const tag = merged.some(s => s.suggested_category === cat && s.tag === 'suggestion') ? ' (suggested)' : '';
    console.log(`   ${cat.padEnd(24)} ${count} slot(s)${tag}`);
  }

  // Write requirements
  const outputPath = path.resolve(output);
  const requirements = {
    scanned_at: new Date().toISOString(),
    source_files: htmlFiles.map(f => path.basename(f)),
    model,
    total_slots: merged.length,
    slots: merged,
  };

  fs.writeFileSync(outputPath, JSON.stringify(requirements, null, 2));
  console.log(`\n✅ Requirements saved → ${outputPath}`);
  console.log(`   Feed into: node cli/index.js generate-images --custom-presets ${output} --output ./public/demos\n`);
}
