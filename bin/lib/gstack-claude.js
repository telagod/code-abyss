'use strict';

const fs = require('fs');
const path = require('path');

const {
  copyRecursive,
  rmSafe,
} = require('./utils');
const {
  getGstackConfig,
  extractNameAndDescription,
  listTopLevelSkillDirs,
  resolveGstackSource,
  condenseDescription,
  copySkillRuntimeFiles,
} = require('./gstack-codex');

function readFrontmatterBlock(content) {
  const fmStart = content.indexOf('---\n');
  if (fmStart !== 0) return null;
  const fmEnd = content.indexOf('\n---', fmStart + 4);
  if (fmEnd === -1) return null;
  return content.slice(fmStart + 4, fmEnd);
}

function extractAllowedTools(content) {
  const block = readFrontmatterBlock(content);
  if (!block) return 'Read';

  const lines = block.split('\n');
  const tools = [];
  let inTools = false;

  for (const line of lines) {
    if (/^allowed-tools:\s*$/.test(line)) {
      inTools = true;
      continue;
    }
    if (inTools) {
      const item = line.match(/^\s*-\s+(.+)$/);
      if (item) {
        tools.push(item[1].trim());
        continue;
      }
      if (!/^\s/.test(line)) break;
    }
  }

  return tools.length > 0 ? tools.join(', ') : 'Read';
}

function buildClaudeCommand(name, description, allowedTools, skillPath) {
  const escapedDescription = condenseDescription(description, 180).replace(/"/g, '\\"');
  return [
    '---',
    `name: ${name}`,
    `description: "${escapedDescription}"`,
    `allowed-tools: ${allowedTools || 'Read'}`,
    '---',
    '',
    '读取以下秘典，根据内容为用户提供专业指导：',
    '',
    '```',
    skillPath,
    '```',
    '',
  ].join('\n');
}

function backupPathIfExists(targetPath, backupPath, manifest, rootName, relPath, info) {
  if (!fs.existsSync(targetPath)) return false;
  rmSafe(backupPath);
  copyRecursive(targetPath, backupPath);
  manifest.backups.push({ root: rootName, path: relPath });
  info(`备份: ${rootName}/${relPath}`);
  return true;
}

function installGstackClaudePack({
  HOME,
  backupDir,
  manifest,
  info = () => {},
  ok = () => {},
  warn = () => {},
  env = process.env,
  sourceMode = 'pinned',
  projectRoot = null,
  fallback = false,
}) {
  const resolved = resolveGstackSource({ HOME, env, warn, sourceMode, projectRoot, hostName: 'claude', fallback });
  const sourceRoot = resolved.sourceRoot;
  if (!sourceRoot) return { installed: false, sourceMode: resolved.mode, reason: resolved.reason };

  const config = getGstackConfig('claude');
  const skillRoot = path.join(HOME, '.claude', 'skills', 'gstack');
  const commandsRoot = path.join(HOME, '.claude', 'commands');

  backupPathIfExists(
    skillRoot,
    path.join(backupDir, 'claude', 'skills', 'gstack'),
    manifest,
    'claude',
    'skills/gstack',
    info
  );

  rmSafe(skillRoot);
  fs.mkdirSync(skillRoot, { recursive: true });
  fs.mkdirSync(commandsRoot, { recursive: true });

  config.runtimeDirs.forEach((dirName) => {
    const src = path.join(sourceRoot, dirName);
    if (!fs.existsSync(src)) return;
    copyRecursive(src, path.join(skillRoot, dirName));
  });

  config.runtimeFiles.forEach((fileName) => {
    const src = path.join(sourceRoot, fileName);
    if (!fs.existsSync(src)) return;
    copyRecursive(src, path.join(skillRoot, fileName));
  });

  listTopLevelSkillDirs(sourceRoot, 'claude').forEach((skillDirName) => {
    const srcDir = path.join(sourceRoot, skillDirName);
    const destDir = path.join(skillRoot, skillDirName);
    copySkillRuntimeFiles(srcDir, destDir);

    const content = fs.readFileSync(path.join(srcDir, 'SKILL.md'), 'utf8');
    const { name, description } = extractNameAndDescription(content);
    const allowedTools = extractAllowedTools(content);
    const skillPath = `~/.claude/skills/gstack/${skillDirName}/SKILL.md`;

    const commandNames = [name, ...((config.commandAliases && config.commandAliases[name]) || [])];
    commandNames.forEach((commandName) => {
      const relPath = `commands/${commandName}.md`;
      backupPathIfExists(
        path.join(commandsRoot, `${commandName}.md`),
        path.join(backupDir, 'claude', relPath),
        manifest,
        'claude',
        relPath,
        info
      );
      fs.writeFileSync(
        path.join(commandsRoot, `${commandName}.md`),
        buildClaudeCommand(commandName, description, allowedTools, skillPath)
      );
      manifest.installed.push({ root: 'claude', path: relPath });
    });
  });

  manifest.installed.push({ root: 'claude', path: 'skills/gstack' });
  ok('claude/skills/gstack (gstack runtime)');
  return { installed: true, sourceMode: resolved.mode, reason: null };
}

module.exports = {
  extractAllowedTools,
  buildClaudeCommand,
  installGstackClaudePack,
};
