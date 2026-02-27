import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MODEL_PRESET_MAP = {
  kling3: path.resolve(__dirname, '../../skills/kling3/scene-presets.json'),
  'nano-banana-2': path.resolve(__dirname, '../../skills/nano-banana-2/asset-presets.json'),
};

/**
 * Load scene presets for a model.
 * @param {string} model - Model key (e.g. "kling3")
 * @param {string} [customPath] - Optional path to a custom presets JSON file
 */
export function loadPresets(model, customPath) {
  if (customPath) {
    const resolved = path.resolve(customPath);
    if (!fs.existsSync(resolved)) {
      console.error(`❌ Custom presets file not found: ${resolved}`);
      return null;
    }
    return JSON.parse(fs.readFileSync(resolved, 'utf-8'));
  }

  const filePath = MODEL_PRESET_MAP[model];
  if (!filePath || !fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
