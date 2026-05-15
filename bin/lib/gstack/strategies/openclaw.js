'use strict';

// bin/lib/gstack/strategies/openclaw.js
// OpenClaw host: 写入 ~/.openclaw/skills/gstack/，无 commands 产出
// 形态接近 codex（skills-only），但根目录从 ~/.agents 改成 ~/.openclaw
// 不做 codex 那种 frontmatter 收敛 / preamble 注入；仅 pathRewrites 替换

const fs = require('fs');
const path = require('path');

const { copyRecursive, rmSafe } = require('../../utils');
const {
  getGstackConfig,
  listTopLevelSkillDirs,
  copyRuntimeAssets,
  copySkillRuntimeFiles,
  backupPathIfExists,
} = require('../core');

function rewriteOpenClawPaths(content) {
  return (getGstackConfig('openclaw').pathRewrites || [])
    .reduce((current, [from, to]) => current.split(from).join(to), content);
}

function transformOpenClawSkillContent(content) {
  return rewriteOpenClawPaths(content);
}

function installToHost({
  HOME,
  backupDir,
  manifest,
  sourceRoot,
  info = () => {},
  ok = () => {},
}) {
  const config = getGstackConfig('openclaw');
  const skillRoot = path.join(HOME, '.openclaw', 'skills', 'gstack');

  backupPathIfExists(
    skillRoot,
    path.join(backupDir, 'openclaw', 'skills', 'gstack'),
    manifest,
    'openclaw',
    'skills/gstack',
    info
  );

  rmSafe(skillRoot);
  fs.mkdirSync(skillRoot, { recursive: true });

  copyRuntimeAssets(sourceRoot, skillRoot, config);

  // 根 SKILL.md 走 pathRewrites（如果 manifest 配了）
  const rootSkillSrc = path.join(sourceRoot, 'SKILL.md');
  if (fs.existsSync(rootSkillSrc)) {
    const rootSkillDest = path.join(skillRoot, 'SKILL.md');
    if (fs.existsSync(rootSkillDest)) rmSafe(rootSkillDest);
    fs.writeFileSync(rootSkillDest, transformOpenClawSkillContent(fs.readFileSync(rootSkillSrc, 'utf8')));
  }

  // 顶层子 skill 全部带 pathRewrites
  listTopLevelSkillDirs(sourceRoot, 'openclaw').forEach((skillDirName) => {
    copySkillRuntimeFiles(
      path.join(sourceRoot, skillDirName),
      path.join(skillRoot, skillDirName),
      { transformSkill: transformOpenClawSkillContent }
    );
  });

  manifest.installed.push({ root: 'openclaw', path: 'skills/gstack' });
  ok('openclaw/skills/gstack (gstack runtime)');
  return { installed: true, reason: null };
}

module.exports = {
  rewriteOpenClawPaths,
  transformOpenClawSkillContent,
  installToHost,
};
