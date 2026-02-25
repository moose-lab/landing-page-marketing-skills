import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function handler(req, res) {
  // Extract model from path: /api/demos/kling3
  const model = req.url.split('/api/demos/')[1]?.split('?')[0] || 'kling3';

  const filePath = join(__dirname, '../public/demos', `${model}-demos.json`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (!existsSync(filePath)) {
    res.status(404).json({ error: `No demos found for model: ${model}` });
    return;
  }

  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read manifest' });
  }
}
