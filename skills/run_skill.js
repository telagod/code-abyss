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
const { unlinkSync, closeSync, openSync } = require('fs');
const { join, resolve } = require('path');
const { createHash } = require('crypto');
const { tmpdir } = require('os');
const { resolveExecutableSkillScript } = require('../bin/lib/skill-registry');

function getSkillsDir() {
  const override = process.env.SAGE_SKILLS_DIR;
  if (override) return resolve(override);
  return __dirname;
}

function sleep(ms) {
  return new Promise(resolveSleep => setTimeout(resolveSleep, ms));
}

function getScriptEntry(skillName) {
  const skillsDir = getSkillsDir();
  const { skill, scriptPath, reason } = resolveExecutableSkillScript(skillsDir, skillName);

  if (reason === 'missing') {
    console.error(`错误: 未知的 skill '${skillName}'`);
    process.exit(1);
  }

  if (reason === 'no-script') {
    console.error(`错误: skill '${skillName}' 的 runtimeType 不是 scripted`);
    console.error(`请先阅读: ${skill.skillPath}`);
    process.exit(1);
  }

  return { skill, scriptPath };
}

async function acquireTargetLock(args) {
  const target = args.find(a => !a.startsWith('-')) || process.cwd();
  const hash = createHash('md5').update(resolve(target)).digest('hex').slice(0, 12);
  const lockPath = join(tmpdir(), `sage_skill_${hash}.lock`);

  const deadline = Date.now() + 30000;
  let first = true;
  while (true) {
    try {
      const fd = openSync(lockPath, 'wx');
      return { fd, lockPath, target };
    } catch (e) {
      if (e.code !== 'EEXIST') return { fd: null, lockPath: null, target };
      if (first) {
        console.log(`⏳ 等待锁释放: ${target}`);
        first = false;
      }
      if (Date.now() >= deadline) {
        console.error(`⏳ 等待锁超时: ${target}`);
        process.exit(1);
      }
      await sleep(200);
    }
  }
}

function releaseLock({ fd, lockPath }) {
  if (fd !== null) {
    try { closeSync(fd); } catch {}
  }
  if (lockPath) {
    try { unlinkSync(lockPath); } catch {}
  }
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
  const lock = await acquireTargetLock(scriptArgs);

  const child = spawn(process.execPath, [scriptPath, ...scriptArgs], {
    stdio: 'inherit',
  });

  child.on('close', (code) => {
    releaseLock(lock);
    process.exit(code || 0);
  });

  child.on('error', (err) => {
    console.error(`执行错误: ${err.message}`);
    releaseLock(lock);
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log('\n已取消');
    child.kill('SIGINT');
    releaseLock(lock);
    process.exit(130);
  });
}

main().catch((err) => {
  console.error(`执行错误: ${err.message}`);
  process.exit(1);
});
