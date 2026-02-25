import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MODEL_PRESET_MAP = {
  kling3: path.resolve(__dirname, '../../skills/kling3/scene-presets.json'),
};

export function loadPresets(model) {
  const filePath = MODEL_PRESET_MAP[model];
  if (!filePath || !fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
