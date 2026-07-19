#!/usr/bin/env node
/**
 * Skills 运行入口
 * 跨平台统一调用各 skill 脚本
 *
 * 用法:
 *     node run_skill.js <skill_name> [args...]
 *
 * 示例:
 *     node run_skill.js verify-module ./my-project -v
 *     node run_skill.js verify-security ./src --json
 *     node run_skill.js verify-change --mode staged
 *     node run_skill.js verify-quality ./src
 *     node run_skill.js gen-docs ./new-module --force
 */

const { spawn } = require('child_process');
const { statSync, mkdirSync, rmdirSync, writeFileSync } = require('fs');
const { join, resolve } = require('path');
const { createHash } = require('crypto');
const { homedir } = require('os');
const { resolveExecutableSkillScript } = require('../bin/lib/skill-registry');

function getSkillsDir() {
  const override = process.env.SAGE_SKILLS_DIR;
  if (!override) return __dirname;
  const resolved = resolve(override);
  const stat = statSync(resolved, { throwIfNoEntry: false });
  if (!stat || !stat.isDirectory()) {
    throw new Error(`SAGE_SKILLS_DIR 不是有效目录: ${resolved}`);
  }
  return resolved;
}

function sleep(ms) {
  return new Promise(resolveSleep => setTimeout(resolveSleep, ms));
}

function getScriptEntry(skillName) {
  const skillsDir = getSkillsDir();
  const { skill, scriptPath, reason } = resolveExecutableSkillScript(skillsDir, skillName);

  if (reason === 'missing') {
    console.error(`错误: 未知的 skill '${skillName}'. Try: node run_skill.js --help to list available skills`);
    process.exit(1);
  }

  if (reason === 'no-script') {
    console.error(`错误: skill '${skillName}' 的 runtimeType 不是 scripted`);
    console.error(`请先阅读: ${skill.skillPath}`);
    process.exit(1);
  }

  return { skill, scriptPath };
}

const STALE_LOCK_MAX_AGE_MS = 60000;

function getLockBaseDir() {
  const dir = join(homedir(), '.code-abyss', 'locks');
  mkdirSync(dir, { recursive: true });
  return dir;
}

function isStaleLock(lockPath) {
  try {
    const stat = statSync(lockPath);
    return (Date.now() - stat.mtimeMs) > STALE_LOCK_MAX_AGE_MS;
  } catch { return false; }
}

async function acquireTargetLock(skillName, args) {
  const target = args.find(a => !a.startsWith('-')) || process.cwd();
  const hash = createHash('md5').update(`${skillName}:${resolve(target)}`).digest('hex').slice(0, 12);
  const lockDir = join(getLockBaseDir(), `sage_skill_${hash}.lock`);

  const deadline = Date.now() + 30000;
  let first = true;
  while (true) {
    try {
      mkdirSync(lockDir);
      const pidPath = join(lockDir, 'pid');
      try {
        writeFileSync(pidPath, String(process.pid), { flag: 'wx' });
      } catch {
        // pid file may already exist from a race; keep the lock directory
      }
      return { lockDir, target };
    } catch (e) {
      if (e.code !== 'EEXIST') return { lockDir: null, target };
      if (first) {
        console.log(`⏳ 等待锁释放: ${skillName} @ ${target}`);
        first = false;
      }
      if (isStaleLock(lockDir)) {
        console.log(`⏳ 检测到过期锁，尝试清理: ${lockDir}`);
        try { rmdirSync(lockDir, { recursive: true }); } catch { /* best-effort */ }
        continue;
      }
      if (Date.now() >= deadline) {
        console.error(`⏳ 等待锁超时: ${skillName} @ ${target}. Try: rm -rf ${lockDir}`);
        process.exit(1);
      }
      await sleep(200);
    }
  }
}

function releaseLock(lock) {
  if (!lock || !lock.lockDir) return;
  try { rmdirSync(lock.lockDir, { recursive: true }); } catch {}
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    console.log(__filename.split('/').pop() + ' <skill_name> [args...]');
    process.exit(args.length === 0 ? 1 : 0);
  }

  const skillName = args[0];
  const { scriptPath } = getScriptEntry(skillName);
  const scriptArgs = args.slice(1);
  const lock = await acquireTargetLock(skillName, scriptArgs);
  let lockReleased = false;
  const releaseOnce = () => {
    if (lockReleased) return;
    lockReleased = true;
    releaseLock(lock);
  };

  const child = spawn(process.execPath, [scriptPath, ...scriptArgs], {
    stdio: 'inherit',
  });

  child.on('close', (code) => {
    releaseOnce();
    process.exit(code || 0);
  });

  child.on('error', (err) => {
    console.error(`执行错误: ${err.message}`);
    releaseOnce();
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log('\n已取消');
    child.kill('SIGINT');
    releaseOnce();
    process.exit(130);
  });

  process.on('SIGTERM', () => {
    console.log('\n已终止');
    child.kill('SIGTERM');
    releaseOnce();
    process.exit(143);
  });
}

main().catch((err) => {
  console.error(`执行错误: ${err.message}`);
  process.exit(1);
});
