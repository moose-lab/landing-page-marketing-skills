import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = path.resolve(__dirname, '../../skills');

export async function updateSkills({ source, skill }) {
  console.log(`\n🔄 videoskills — update-skills`);
  console.log(`   source : ${source}`);
  console.log(`   skill  : ${skill}\n`);

  const tmpDir = path.join(SKILLS_DIR, '.tmp-update');

  try {
    // Clone latest to temp directory
    console.log('  📥 Fetching latest skills...');
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
    execFileSync('git', ['clone', '--depth', '1', source, tmpDir], { stdio: 'pipe' });

    // Copy skill files
    const srcSkill = path.join(tmpDir, 'skills', skill);
    const destSkill = path.join(SKILLS_DIR, skill);

    if (!fs.existsSync(srcSkill)) {
      console.error(`  ❌ Skill "${skill}" not found in remote repo`);
      return;
    }

    // Back up current presets
    const presetsPath = path.join(destSkill, 'scene-presets.json');
    if (fs.existsSync(presetsPath)) {
      const backupPath = presetsPath.replace('.json', '.backup.json');
      fs.copyFileSync(presetsPath, backupPath);
      console.log(`  💾 Backed up current presets → ${path.basename(backupPath)}`);
    }

    // Copy new files
    copyDir(srcSkill, destSkill);
    console.log(`  ✅ Updated skill: ${skill}`);
    console.log(`     Files in: ${destSkill}\n`);

  } catch (err) {
    console.error(`  ❌ Update failed: ${err.message}`);
  } finally {
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
