#!/usr/bin/env node
'use strict';

/**
 * persona_forge — Tech Persona Card distillation/validation/publish helper.
 *
 * Subcommands:
 *   validate <persona-dir>       Schema + voice consistency + identity 三段
 *   distill --voice-hint <text>  Output a card skeleton from observation
 *   publish <persona-dir>        Generate submission payload (json + md + checklist)
 */

const fs = require('fs');
const path = require('path');

const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_RE = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
const REGISTER = ['formal', 'casual', 'literary', 'playful'];
const EMOJI = ['none', 'minimal', 'moderate', 'heavy'];

const REQUIRED_IDENTITY_SECTIONS = [
  { id: 'ANCHOR', re: /角色锚定|Role Anchoring|role anchor/i, name: '角色锚定' },
  { id: 'TRAITS', re: /性格特征|Personality Traits|traits/i, name: '性格特征' },
  { id: 'EMOTION', re: /情绪模式|情绪节奏|Emotional Patterns|emotion/i, name: '情绪模式' },
];

const FORBIDDEN_TERMS = [
  /\b(linus torvalds|elon musk|donald trump|joe biden)\b/i,
  /\b(iron man|spider-man|jedi|harry potter)\b/i,
];

function usage(code = 2) {
  process.stderr.write(`用法: persona_forge <validate|distill|publish> [args]

  validate <persona-dir>
  distill --voice-hint "<observation>"
  publish <persona-dir>
`);
  process.exit(code);
}

function readCard(personaDir) {
  const cardPath = path.join(personaDir, 'persona-card.json');
  if (!fs.existsSync(cardPath)) throw new Error(`未找到 ${cardPath}`);
  const raw = fs.readFileSync(cardPath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`persona-card.json 解析失败: ${e.message}`);
  }
  return { path: cardPath, raw, json: parsed };
}

function readIdentity(personaDir, identityRel) {
  const idPath = path.join(personaDir, identityRel);
  if (!fs.existsSync(idPath)) {
    return { path: idPath, content: null, missing: true };
  }
  return { path: idPath, content: fs.readFileSync(idPath, 'utf8'), missing: false };
}

function validateSchema(card, findings) {
  if (card.spec !== 'tech-persona-card') findings.block.push({ id: 'SPEC_INVALID', msg: `spec 应为 tech-persona-card，实际 ${card.spec}` });
  if (!card.spec_version) findings.block.push({ id: 'SPEC_VERSION_MISSING', msg: 'spec_version 缺失' });

  const data = card.data || {};
  const required = ['name', 'display_name', 'description', 'version', 'voice', 'identity'];
  required.forEach((f) => {
    if (data[f] === undefined || data[f] === null || data[f] === '') {
      findings.block.push({ id: `DATA_${f.toUpperCase()}_MISSING`, msg: `data.${f} 缺失` });
    }
  });

  if (data.name && !NAME_RE.test(data.name)) findings.block.push({ id: 'NAME_INVALID', msg: `name 必须 kebab-case: ${data.name}` });
  if (data.version && !SEMVER_RE.test(data.version)) findings.block.push({ id: 'VERSION_INVALID', msg: `version 必须 SemVer: ${data.version}` });
  if (data.description && data.description.length > 500) findings.block.push({ id: 'DESC_TOO_LONG', msg: `description ${data.description.length} > 500` });
  if (data.description && data.description.length < 40) findings.warn.push({ id: 'DESC_TOO_SHORT', msg: `description ${data.description.length} < 40` });
}

function validateVoice(card, findings) {
  const v = (card.data && card.data.voice) || {};
  if (!v.self || !v.user) findings.block.push({ id: 'VOICE_INCOMPLETE', msg: 'voice.self / voice.user 必填' });
  if (v.self && v.self.length === 1 && !/[一-龥]/.test(v.self)) findings.warn.push({ id: 'VOICE_SELF_THIN', msg: `voice.self 过短: ${v.self}` });

  if (v.register && !REGISTER.includes(v.register)) findings.warn.push({ id: 'REGISTER_UNKNOWN', msg: `register 应为 ${REGISTER.join('|')}` });
  if (v.emoji_policy && !EMOJI.includes(v.emoji_policy)) findings.warn.push({ id: 'EMOJI_UNKNOWN', msg: `emoji_policy 应为 ${EMOJI.join('|')}` });

  if (v.register === 'formal' && v.emoji_policy === 'heavy') findings.warn.push({ id: 'VOICE_INCONSISTENT', msg: 'register=formal 与 emoji_policy=heavy 矛盾' });
  if (v.register === 'literary' && v.emoji_policy === 'heavy') findings.warn.push({ id: 'VOICE_INCONSISTENT', msg: 'register=literary 与 emoji_policy=heavy 矛盾' });
}

function validateIdentity(personaDir, identityRel, findings) {
  const id = readIdentity(personaDir, identityRel);
  if (id.missing) {
    findings.block.push({ id: 'IDENTITY_MISSING', msg: `identity 文件不存在: ${id.path}` });
    return;
  }
  REQUIRED_IDENTITY_SECTIONS.forEach((s) => {
    if (!s.re.test(id.content)) findings.block.push({ id: `IDENTITY_${s.id}_MISSING`, msg: `identity.md 缺"${s.name}"段落` });
  });
  if (id.content.length > 4000) findings.warn.push({ id: 'IDENTITY_TOO_LONG', msg: `identity.md ${id.content.length} 字 > 4000` });
  if (/^You are\b/m.test(id.content) || /^You should\b/m.test(id.content)) findings.warn.push({ id: 'IDENTITY_PROMPT_STYLE', msg: 'identity.md 写成 prompt，建议改叙述式' });

  FORBIDDEN_TERMS.forEach((re) => {
    if (re.test(id.content)) findings.block.push({ id: 'FORBIDDEN_TERM', msg: `identity 含敏感词: ${re}` });
  });
}

function validateScenarios(card, findings) {
  const scenarios = (card.data && card.data.scenarios) || [];
  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    findings.warn.push({ id: 'SCENARIOS_EMPTY', msg: 'scenarios 为空，建议至少 3 个' });
    return;
  }
  scenarios.forEach((s, i) => {
    if (!s.name) findings.block.push({ id: `SCEN_${i}_NAME`, msg: `scenarios[${i}] 缺 name` });
    if (!Array.isArray(s.triggers) || s.triggers.length === 0) findings.warn.push({ id: `SCEN_${i}_TRIGGERS`, msg: `scenarios[${i}] triggers 为空` });
    if (!Array.isArray(s.chain) || s.chain.length < 3) findings.warn.push({ id: `SCEN_${i}_CHAIN_THIN`, msg: `scenarios[${i}] chain < 3 步` });
  });
}

function runChecks(personaDir) {
  const findings = { block: [], warn: [], info: [] };
  const { json: card } = readCard(personaDir);
  validateSchema(card, findings);
  validateVoice(card, findings);
  validateScenarios(card, findings);
  if (card.data && card.data.identity) {
    validateIdentity(personaDir, card.data.identity, findings);
  }
  return { card, findings };
}

function printFindings(findings, label) {
  process.stdout.write(`校验: ${label}\n`);
  if (findings.block.length === 0 && findings.warn.length === 0) {
    process.stdout.write(`✓ 通过\n`);
    return;
  }
  findings.block.forEach((f) => process.stdout.write(`  [BLOCK] ${f.id}: ${f.msg}\n`));
  findings.warn.forEach((f) => process.stdout.write(`  [WARN]  ${f.id}: ${f.msg}\n`));
  findings.info.forEach((f) => process.stdout.write(`  [INFO]  ${f.id}: ${f.msg}\n`));
  process.stdout.write(`\n汇总: block=${findings.block.length} warn=${findings.warn.length} info=${findings.info.length}\n`);
}

function cmdValidate(args) {
  const personaDir = args[0];
  if (!personaDir) usage();
  const { findings } = runChecks(personaDir);
  printFindings(findings, personaDir);
  return findings.block.length > 0 ? 1 : 0;
}

function cmdDistill(args) {
  const idx = args.indexOf('--voice-hint');
  const hint = idx >= 0 ? args[idx + 1] : '<观察笔记>';
  const skeleton = {
    spec: 'tech-persona-card',
    spec_version: '1.0',
    data: {
      name: '<kebab-case-slug>',
      display_name: '<Display Name>',
      description: '<一句话答清是谁、适合什么场景，≥40 字 ≤500 字>',
      version: '0.1.0',
      voice: {
        self: '<自称>',
        user: '<称呼用户>',
        language: '中文为主，术语保留英文',
        tone: hint,
        register: 'casual',
        emoji_policy: 'minimal',
      },
      identity: 'identity.md',
      capabilities: {
        domains: ['<领域>'],
        expertise_level: 'senior',
      },
      scenarios: [
        {
          name: '<场景名>',
          triggers: ['<关键词>'],
          chain: ['<步骤 1>', '<步骤 2>', '<步骤 3>'],
          priority: '<a > b > c>',
        },
      ],
    },
  };

  const identityTemplate = `# <人格名> · identity\n\n## 角色锚定\n\n<这个人格"是什么"——身份、人设、不会做什么。3-5 行>\n\n## 性格特征\n\n- <性格点 1，要具体>\n- <性格点 2>\n- <性格点 3>\n\n## 情绪模式\n\n| 时机 | 措辞 |\n|------|------|\n| 开劫 | <短语> |\n| 推进 | <短语> |\n| 受阻 | <短语> |\n| 收口 | <短语> |\n`;

  process.stdout.write('### persona-card.json 骨架\n```json\n');
  process.stdout.write(JSON.stringify(skeleton, null, 2));
  process.stdout.write('\n```\n\n### identity.md 骨架\n```markdown\n');
  process.stdout.write(identityTemplate);
  process.stdout.write('```\n\n下一步:\n  1. 填实尖括号占位符\n  2. 落盘到 config/personas/<slug>/\n  3. node scripts/persona_forge.js validate config/personas/<slug>/\n');
  return 0;
}

function cmdPublish(args) {
  const personaDir = args[0];
  if (!personaDir) usage();
  const { card, findings } = runChecks(personaDir);
  printFindings(findings, personaDir);

  if (findings.block.length > 0) {
    process.stderr.write('\n✗ 发布阻断: 有 block 级问题，先修\n');
    return 1;
  }
  if (findings.warn.length > 0) {
    process.stderr.write('\n✗ 社区门槛要求 warn 也清零\n');
    return 1;
  }

  const outDir = path.join(personaDir, 'submission');
  fs.mkdirSync(outDir, { recursive: true });

  fs.copyFileSync(path.join(personaDir, 'persona-card.json'), path.join(outDir, 'persona-card.json'));
  if (card.data && card.data.identity) {
    const idSrc = path.join(personaDir, card.data.identity);
    if (fs.existsSync(idSrc)) {
      fs.copyFileSync(idSrc, path.join(outDir, 'identity.md'));
    }
  }

  const checklist = `# 提交前自检 · ${card.data && card.data.name}

- [ ] persona-card.json schema 通过
- [ ] voice.self / voice.user 自然且独特
- [ ] description 一句话清晰，不含营销腔
- [ ] identity.md 含角色锚定 + 性格特征 + 情绪模式
- [ ] 与 6 个内置人格差异度 ≥ 30%
- [ ] 不含真实人名 / 商标 / 政治宗教内容
- [ ] 已自我测试 ≥ 3 个场景
- [ ] author 字段填了真实可联络的 GitHub handle
- [ ] LICENSE 同意以 MIT 贡献

## 提交渠道
表单提交（推荐）: https://telagod.github.io/code-abyss/submit.html
直接 Issue: https://github.com/telagod/code-abyss/issues/new?template=persona-submission.yml
`;
  fs.writeFileSync(path.join(outDir, 'checklist.md'), checklist);

  process.stdout.write(`\n✓ submission payload 已生成: ${outDir}\n`);
  process.stdout.write(`下一步: 打开 https://telagod.github.io/code-abyss/submit.html 粘贴内容\n`);
  return 0;
}

function main(argv) {
  const [cmd, ...rest] = argv;
  switch (cmd) {
    case 'validate': return cmdValidate(rest);
    case 'distill': return cmdDistill(rest);
    case 'publish': return cmdPublish(rest);
    case '--help':
    case '-h':
    case undefined: usage(0); return 0;
    default:
      process.stderr.write(`✗ 未知子命令: ${cmd}\n`);
      usage();
  }
  return 0;
}

if (require.main === module) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (err) {
    process.stderr.write(`✗ ${err.message}\n`);
    process.exit(1);
  }
}

module.exports = { main, runChecks };
