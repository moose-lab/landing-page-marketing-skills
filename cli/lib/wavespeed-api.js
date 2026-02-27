/**
 * WaveSpeed.ai API wrapper
 * Reads WAVESPEED_API_KEY from environment
 */

const BASE_URL = 'https://api.wavespeed.ai/api/v3';
const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 120; // 10 minutes max
const FETCH_RETRIES = 3;

function getKey() {
  const key = process.env.WAVESPEED_API_KEY;
  if (!key) {
    throw new Error('WAVESPEED_API_KEY environment variable is not set. Get your key at wavespeed.ai');
  }
  return key;
}

async function fetchWithRetry(url, options, retries = FETCH_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1000 * attempt);
    }
  }
}

/**
 * Create a video generation task on WaveSpeed.
 * @param {string} modelPath - e.g. "kwaivgi/kling-v3.0-std/text-to-video"
 * @param {object} input - Request body (prompt, duration, aspect_ratio, etc.)
 * @returns {{ id: string, status: string, urls: { get: string } }}
 */
export async function createTask(modelPath, input) {
  const res = await fetchWithRetry(`${BASE_URL}/${modelPath}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (data.code !== 200) {
    throw new Error(`WaveSpeed API error ${data.code}: ${data.message}`);
  }
  return data.data;
}

/**
 * Create an image generation task on WaveSpeed.
 * @param {string} modelPath - e.g. "google/nano-banana-2/text-to-image"
 * @param {object} input - Request body (prompt, aspect_ratio, resolution, etc.)
 * @returns {object} Task data — if sync mode, includes outputs[] directly
 */
export async function createImageTask(modelPath, input) {
  const res = await fetchWithRetry(`${BASE_URL}/${modelPath}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (data.code !== 200) {
    throw new Error(`WaveSpeed API error ${data.code}: ${data.message}`);
  }
  return data.data;
}

/**
 * Poll a task until it completes or fails.
 * @param {string} taskId
 * @param {{ once?: boolean }} opts
 * @returns {{ status: string, video_url: string|null, error: string|null }}
 */
export async function pollTask(taskId, { once = false } = {}) {
  const key = getKey();
  let polls = 0;

  while (polls < MAX_POLLS) {
    const res = await fetchWithRetry(`${BASE_URL}/predictions/${taskId}/result`, {
      headers: { 'Authorization': `Bearer ${key}` },
    });

    const data = await res.json();
    if (data.code !== 200) throw new Error(`Poll error: ${data.message}`);

    const task = data.data;

    if (once || task.status === 'completed' || task.status === 'failed') {
      return {
        status: task.status,
        video_url: task.outputs?.[0] || null,
        output_url: task.outputs?.[0] || null,
        error: task.error || null,
      };
    }

    process.stdout.write(`    ⏳ ${task.status}... (${(polls + 1) * POLL_INTERVAL_MS / 1000}s)\r`);
    await sleep(POLL_INTERVAL_MS);
    polls++;
  }

  return { status: 'timeout', video_url: null, output_url: null, error: 'Max poll time exceeded' };
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
