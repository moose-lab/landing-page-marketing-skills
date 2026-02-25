/**
 * Kling API wrapper (via PiAPI)
 * Reads PIAPI_KEY from environment
 */

const BASE_URL = 'https://api.piapi.ai/api/v1';
const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 120; // 10 minutes max

function getKey() {
  const key = process.env.PIAPI_KEY;
  if (!key) {
    throw new Error('PIAPI_KEY environment variable is not set. Get your key at piapi.ai');
  }
  return key;
}

export async function createKlingTask(payload) {
  const res = await fetch(`${BASE_URL}/task`, {
    method: 'POST',
    headers: {
      'x-api-key': getKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (data.code !== 200) {
    throw new Error(`API error ${data.code}: ${data.message}`);
  }
  return data.data;
}

export async function pollTask(taskId, { once = false } = {}) {
  const key = getKey();
  let polls = 0;

  while (polls < MAX_POLLS) {
    const res = await fetch(`${BASE_URL}/task/${taskId}`, {
      headers: { 'x-api-key': key },
    });

    const data = await res.json();
    if (data.code !== 200) throw new Error(`Poll error: ${data.message}`);

    const task = data.data;

    if (once || task.status === 'completed' || task.status === 'failed') {
      return {
        status: task.status,
        video_url: task.output?.video_url || task.output?.works?.[0]?.resource?.resource || null,
        error: task.error?.message || null,
      };
    }

    process.stdout.write(`    ⏳ ${task.status}... (${(polls + 1) * POLL_INTERVAL_MS / 1000}s)\r`);
    await sleep(POLL_INTERVAL_MS);
    polls++;
  }

  return { status: 'timeout', video_url: null, error: 'Max poll time exceeded' };
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
