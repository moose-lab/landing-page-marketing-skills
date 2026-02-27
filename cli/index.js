#!/usr/bin/env node
/**
 * assetskills CLI
 * Usage:
 *   node cli/index.js generate-demo --model kling3 --scenes product_showcase,cinematic_landscape
 *   node cli/index.js generate-images --model nano-banana-2 --categories hero_backgrounds --output ./public/demos
 *   node cli/index.js list-scenes
 *   node cli/index.js list-presets --model nano-banana-2
 *   node cli/index.js analyze-assets --input ./public/index.html
 *   node cli/index.js smart-cover --manifest ./public/demos/kling3-demos.json
 *   node cli/index.js status --task-id <id>
 *   node cli/index.js update-skills
 */

import { Command } from 'commander';
import { generateDemo } from './commands/generate-demo.js';
import { generateImages } from './commands/generate-images.js';
import { listScenes } from './commands/list-scenes.js';
import { listPresets } from './commands/list-presets.js';
import { analyzeAssets } from './commands/analyze-assets.js';
import { smartCover } from './commands/smart-cover.js';
import { checkStatus } from './commands/status.js';
import { updateSkills } from './commands/update-skills.js';

const program = new Command();

program
  .name('assetskills')
  .description('CLI to generate AI video demos and images for landing pages (powered by WaveSpeed.ai)')
  .version('3.0.0');

program
  .command('generate-demo')
  .description('Generate video demos for specified scenes and model')
  .requiredOption('--model <model>', 'Model to use (e.g. kling3)')
  .option('--scenes <scenes>', 'Comma-separated scene keys (default: all)', 'all')
  .option('--output <dir>', 'Output directory for demo metadata', './public/demos')
  .option('--dry-run', 'Print prompts and settings without calling API')
  .option('--custom-presets <path>', 'Path to a custom scene presets JSON file')
  .action(generateDemo);

program
  .command('list-scenes')
  .description('List all available scene presets for a model')
  .option('--model <model>', 'Model (default: kling3)', 'kling3')
  .action(listScenes);

program
  .command('status')
  .description('Check status of a generation task')
  .requiredOption('--task-id <id>', 'Task ID returned by generate-demo')
  .action(checkStatus);

program
  .command('generate-images')
  .description('Generate images for specified categories and model')
  .requiredOption('--model <model>', 'Model to use (e.g. nano-banana-2)')
  .option('--categories <cats>', 'Comma-separated category keys (default: all)', 'all')
  .option('--output <dir>', 'Output directory for images and manifest')
  .option('--dry-run', 'Print prompts and settings without calling API')
  .option('--custom-presets <path>', 'Path to a custom presets JSON file')
  .option('--aspect-ratio <ratio>', 'Override aspect ratio')
  .option('--resolution <res>', 'Override resolution (1k, 2k, 4k)')
  .option('--format <fmt>', 'Output format (png, jpeg)')
  .action(generateImages);

program
  .command('list-presets')
  .description('List all available image presets for a model')
  .option('--model <model>', 'Model (default: nano-banana-2)', 'nano-banana-2')
  .action(listPresets);

program
  .command('analyze-assets')
  .description('Scan HTML files for image asset slots and generate requirements')
  .option('--input <path>', 'HTML file or directory to scan')
  .option('--output <path>', 'Output path for requirements JSON', './asset-requirements.json')
  .option('--model <model>', 'Model for preset matching', 'nano-banana-2')
  .action(analyzeAssets);

program
  .command('smart-cover')
  .description('Generate AI-scored smart thumbnails for video demos')
  .option('--manifest <path>', 'Path to video manifest JSON', './public/demos/kling3-demos.json')
  .option('--output <dir>', 'Output directory for thumbnails', './public/demos')
  .option('--candidates <n>', 'Number of candidate frames to extract', '12')
  .option('--enhance', 'Enhance best frame via Nano Banana 2 edit API')
  .action(smartCover);

program
  .command('update-skills')
  .description('Pull latest scene presets and skill definitions from remote')
  .option('--source <url>', 'Git repo URL', 'https://github.com/moose-lab/landing-page-marketing-skills.git')
  .option('--skill <name>', 'Specific skill to update', 'kling3')
  .action(updateSkills);

program.parse(process.argv);
