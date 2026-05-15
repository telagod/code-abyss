// bin/lib/lifecycle/command-generation.js
// 纯函数：根据 skill metadata 生成 Claude commands/*.md 与 Gemini commands/*.toml 内容
// 无依赖注入、无副作用、无 closure 绑定 — 只接 path 标准库

const path = require('path');

const CLAUDE_COMMAND_TARGET = {
  dir: 'commands',
  label: '斜杠命令',
  skillRoot: '~/.claude/skills',
};

const GEMINI_COMMAND_TARGET = {
  dir: 'commands',
  label: 'Gemini commands',
  skillRoot: '~/.gemini/skills',
};

function getSkillPath(skillRoot, skillRelPath) {
  const normalizedRelPath = skillRelPath
    ? String(skillRelPath).split(path.sep).join('/')
    : '';
  return normalizedRelPath
    ? `${skillRoot}/${normalizedRelPath}/SKILL.md`
    : `${skillRoot}/SKILL.md`;
}

function buildCommandFrontmatter(skill) {
  const desc = (skill.description || '').replace(/"/g, '\\"');
  const argHint = skill.argumentHint;
  const tools = Array.isArray(skill.allowedTools)
    ? skill.allowedTools.join(', ')
    : (skill.allowedTools || 'Read');
  const lines = ['---', `name: ${skill.name}`, `description: "${desc}"`];

  if (argHint) lines.push(`argument-hint: "${argHint}"`);
  lines.push(`allowed-tools: ${tools}`);
  lines.push('---', '');
  return lines;
}

function buildClaudeCommandSpec(skill) {
  const runtimeType = skill.runtimeType || 'knowledge';
  const allowedTools = Array.isArray(skill.allowedTools)
    ? skill.allowedTools.join(', ')
    : (skill.allowedTools || 'Read');
  return {
    name: skill.name,
    description: skill.description,
    argumentHint: skill.argumentHint || '',
    allowedTools,
    relPath: skill.relPath,
    runtimeType,
    scriptRunner: `node ${CLAUDE_COMMAND_TARGET.skillRoot}/run_skill.js ${skill.name} $ARGUMENTS`,
    skillPath: getSkillPath(CLAUDE_COMMAND_TARGET.skillRoot, skill.relPath),
  };
}

function buildClaudeBody(spec) {
  const lines = [];
  if (spec.runtimeType === 'scripted') {
    lines.push('以下所有步骤一气呵成，不要在步骤间停顿等待用户输入：', '');
    lines.push(`1. 读取规范：${spec.skillPath}`);
    lines.push(`2. 执行命令：\`${spec.scriptRunner}\``);
    lines.push('3. 按规范分析输出，完成后续动作', '');
    lines.push('全程不要停顿，不要询问是否继续。');
    return lines;
  }

  lines.push('读取以下技能文档，根据内容为用户提供专业指导：', '');
  lines.push('```', spec.skillPath, '```');
  return lines;
}

function normalizeGeneratedSkill(meta, skillRelPath, runtimeType) {
  return {
    ...meta,
    description: meta.description || '',
    argumentHint: meta.argumentHint || '',
    allowedTools: meta.allowedTools || 'Read',
    relPath: skillRelPath,
    runtimeType,
  };
}

function generateCommandContent(meta, skillRelPath, runtimeType = 'knowledge') {
  const skill = normalizeGeneratedSkill(meta, skillRelPath, runtimeType);
  const spec = buildClaudeCommandSpec(skill);
  return [...buildCommandFrontmatter(spec), ...buildClaudeBody(spec), ''].join('\n');
}

function buildGeminiCommandSpec(skill) {
  const runtimeType = skill.runtimeType || 'knowledge';
  return {
    name: skill.name,
    description: skill.description || '',
    relPath: skill.relPath,
    runtimeType,
    scriptRunner: `node ${GEMINI_COMMAND_TARGET.skillRoot}/run_skill.js ${skill.name}`,
    skillPath: getSkillPath(GEMINI_COMMAND_TARGET.skillRoot, skill.relPath),
  };
}

function escapeTomlMultiline(value) {
  return String(value || '').replace(/"""/g, '\"\"\"').trim();
}

function buildGeminiPromptBody(spec) {
  const lines = [
    `Read \`${spec.skillPath}\` before acting.`,
    '',
    'If Gemini CLI appended the raw command invocation after these instructions, parse any extra arguments from that appended invocation before acting.',
    '',
  ];

  if (spec.runtimeType === 'scripted') {
    lines.push(`Then run \`${spec.scriptRunner} <parsed-arguments>\` and complete the task end-to-end.`);
    lines.push('Do not stop between steps unless blocked by permissions or missing required input.');
  } else {
    lines.push('Use that skill as the authoritative playbook for the task.');
    lines.push('Respond with concrete actions instead of generic advice.');
  }

  return lines.join('\n').trim();
}

function generateGeminiCommandContent(meta, skillRelPath, runtimeType = 'knowledge') {
  const skill = normalizeGeneratedSkill(meta, skillRelPath, runtimeType);
  const spec = buildGeminiCommandSpec(skill);
  const description = escapeTomlMultiline(spec.description).replace(/"/g, '\\"');
  const prompt = escapeTomlMultiline(buildGeminiPromptBody(spec));
  return [
    `description = "${description}"`,
    'prompt = """',
    prompt,
    '"""',
    '',
  ].join('\n');
}

module.exports = {
  CLAUDE_COMMAND_TARGET,
  GEMINI_COMMAND_TARGET,
  getSkillPath,
  buildCommandFrontmatter,
  buildClaudeCommandSpec,
  buildClaudeBody,
  normalizeGeneratedSkill,
  generateCommandContent,
  buildGeminiCommandSpec,
  escapeTomlMultiline,
  buildGeminiPromptBody,
  generateGeminiCommandContent,
};
