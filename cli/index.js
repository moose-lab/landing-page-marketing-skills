#!/usr/bin/env node
/**
 * videoskills CLI
 * Usage:
 *   node cli/index.js generate-demo --model kling3 --scenes product_showcase,cinematic_landscape
 *   node cli/index.js list-scenes
 *   node cli/index.js status --task-id <id>
 */

import { Command } from 'commander';
import { generateDemo } from './commands/generate-demo.js';
import { listScenes } from './commands/list-scenes.js';
import { checkStatus } from './commands/status.js';

const program = new Command();

program
  .name('videoskills')
  .description('CLI to generate multi-scene AI video demos for landing pages')
  .version('1.0.0');

program
  .command('generate-demo')
  .description('Generate video demos for specified scenes and model')
  .requiredOption('--model <model>', 'Model to use (e.g. kling3)')
  .option('--scenes <scenes>', 'Comma-separated scene keys (default: all)', 'all')
  .option('--output <dir>', 'Output directory for demo metadata', './public/demos')
  .option('--dry-run', 'Print prompts and settings without calling API')
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

program.parse(process.argv);
