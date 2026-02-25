import { pollTask } from '../lib/kling-api.js';

export async function checkStatus({ taskId }) {
  console.log(`\n🔍 Checking task: ${taskId}\n`);
  const result = await pollTask(taskId, { once: true });
  console.log(`Status : ${result.status}`);
  if (result.video_url) console.log(`Video  : ${result.video_url}`);
  if (result.error)     console.log(`Error  : ${result.error}`);
  console.log('');
}
