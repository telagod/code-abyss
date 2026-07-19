#!/usr/bin/env node
'use strict';

/**
 * persona_forge — Persona Voice Card validate/distill/publish helper.
 *
 * Subcommands:
 *   validate <persona.json>   Schema (structural) + content-safety + differentiation
 *   distill --voice-hint <text>  Output a card skeleton from observation
 *   publish <persona.json>    Generate submission payload (json + checklist)
 *
 * The schema check itself is no longer this file's job to hand-roll — a
 * persona-voice-card has no freeform field left to hide judgment content in
 * (no identity.md, no scenarios, no capabilities/authorization), so
 * "schema valid" and "content-safe" are now the whole gate. The shared
 * validatePersonaVoiceCard() in bin/lib/persona-voice-card.js is the single
 * source for the structural half; this file only adds the content-safety and
 * differentiation checks a JSON schema can't express.
 */

const fs = require('fs');
const path = require('path');
const { validatePersonaVoiceCard } = require('../../../bin/lib/persona-voice-card');
const { resolveSafePath } = require('../../_lib/shared.js');

const FORBIDDEN_TERMS = [
  /\b(linus torvalds|elon musk|donald trump|joe biden)\b/i,
  /\b(iron man|spider-man|jedi|harry potter)\b/i,
];

const BUILTIN_PERSONAS_DIR = path.join(__dirname, '..', '..', '..', 'config', 'personas');

function usage(code = 2) {
  process.stderr.write(`用法: persona_forge <validate|distill|publish> [args]

  validate <persona.json>
  distill --voice-hint "<observation>"
  publish <persona.json>
`);
  process.exit(code);
}

function readCard(cardPath) {
  if (!fs.existsSync(cardPath)) throw new Error(`未找到 ${cardPath}`);
  const raw = fs.readFileSync(cardPath, 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    throw new Error(`${cardPath} 解析失败: ${e.message}`);
  }
  return { path: cardPath, raw, json };
}

function textFieldsOf(card) {
  return [card.self, card.user, card.label, card.description, ...(card.flourish || []), ...(card.tags || []), ...(card.sample_prompts || [])]
    .filter((v) => typeof v === 'string');
}

function validateContentSafety(card, findings) {
  const fields = textFieldsOf(card);
  for (const text of fields) {
    for (const re of FORBIDDEN_TERMS) {
      if (re.test(text)) findings.block.push({ id: 'FORBIDDEN_TERM', msg: `字段含敏感词 (${re}): "${text}"` });
    }
  }
}

function validateNaturalness(card, findings) {
  const isCJK = (s) => /[一-鿿]/.test(s);
  ['self', 'user'].forEach((f) => {
    const v = card[f];
    if (typeof v === 'string' && v.length === 1 && !isCJK(v)) {
      findings.warn.push({ id: `${f.toUpperCase()}_THIN`, msg: `${f} 是单个非中文字符，可能不自然: "${v}"` });
    }
  });
  if (card.description && card.description.length > 0 && card.description.length < 10) {
    findings.warn.push({ id: 'DESC_TOO_SHORT', msg: `description 过短 (${card.description.length} 字)，建议至少说清"这是谁"` });
  }
  if (/\b(powerful|the best|comprehensive|world-class)\b/i.test(card.description || '')) {
    findings.warn.push({ id: 'DESC_MARKETING_TONE', msg: 'description 带营销腔，建议改为陈述式' });
  }
}

function loadBuiltinPersonas(excludeSlug) {
  if (!fs.existsSync(BUILTIN_PERSONAS_DIR)) return [];
  return fs.readdirSync(BUILTIN_PERSONAS_DIR)
    .filter((f) => f.endsWith('.json') && f !== 'index.json' && f !== `${excludeSlug}.json`)
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(BUILTIN_PERSONAS_DIR, f), 'utf8'));
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);
}

// With scenarios/capabilities/domains gone, there is far less surface to
// diff — differentiation now just means "does this collide on the small set
// of voice fields that actually exist" rather than a 30%-of-many-dimensions
// heuristic.
function validateDifferentiation(card, findings) {
  const others = loadBuiltinPersonas(card.slug);
  for (const other of others) {
    if (card.self === other.self && card.user === other.user) {
      findings.block.push({ id: 'VOICE_COLLISION', msg: `self/user 与内置人格 ${other.slug} 完全相同，改一个或 fork` });
    } else if (card.register === other.register && card.emoji_policy === other.emoji_policy && card.language === other.language) {
      findings.warn.push({ id: 'VOICE_LOW_DIFF', msg: `register/emoji_policy/language 与 ${other.slug} 完全一致，建议至少改一项` });
    }
  }
}

function runChecks(cardPath) {
  const findings = { block: [], warn: [], info: [] };
  const { json: card } = readCard(cardPath);

  const { valid, errors } = validatePersonaVoiceCard(card);
  if (!valid) {
    errors.forEach((msg) => findings.block.push({ id: 'SCHEMA_INVALID', msg }));
  }
  validateContentSafety(card, findings);
  validateNaturalness(card, findings);
  validateDifferentiation(card, findings);

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
  const cardPath = args[0];
  if (!cardPath) usage();
  const { findings } = runChecks(cardPath);
  printFindings(findings, cardPath);
  return findings.block.length > 0 ? 1 : 0;
}

function cmdDistill(args) {
  const idx = args.indexOf('--voice-hint');
  const hint = idx >= 0 ? args[idx + 1] : '<观察笔记>';
  const skeleton = {
    spec: 'persona-voice-card',
    spec_version: '1.0',
    slug: '<kebab-case-slug>',
    label: '<Display Name>',
    description: '<一句话答清是谁、适合什么场景>',
    self: '<自称>',
    user: '<称呼用户>',
    language: '中文为主，术语保留英文',
    register: 'casual',
    emoji_policy: 'minimal',
    flourish: [`<${hint}>`],
  };

  process.stdout.write('### <slug>.json 骨架\n```json\n');
  process.stdout.write(JSON.stringify(skeleton, null, 2));
  process.stdout.write('\n```\n\n下一步:\n  1. 填实尖括号占位符（register/emoji_policy 见 docs/specs/persona-voice-card.schema.json 枚举值）\n  2. 落盘到 config/personas/<slug>.json\n  3. node scripts/persona_forge.js validate config/personas/<slug>.json\n');
  return 0;
}

function cmdPublish(args) {
  const cardPath = args[0];
  if (!cardPath) usage();
  const { card, findings } = runChecks(cardPath);
  printFindings(findings, cardPath);

  if (findings.block.length > 0) {
    process.stderr.write('\n✗ 发布阻断: 有 block 级问题，先修\n');
    return 1;
  }
  if (findings.warn.length > 0) {
    process.stderr.write('\n✗ 社区门槛要求 warn 也清零\n');
    return 1;
  }

  const safeCardPath = resolveSafePath(cardPath);
  const outDir = path.join(path.dirname(safeCardPath), 'submission');
  fs.mkdirSync(outDir, { recursive: true });
  fs.copyFileSync(safeCardPath, path.join(outDir, `${card.slug}.json`));

  const checklist = `# 提交前自检 · ${card.slug}

- [ ] persona-voice-card schema 通过（node scripts/persona_forge.js validate 已跑）
- [ ] self / user 自然且独特，与内置人格无冲突
- [ ] description 一句话清晰，不含营销腔
- [ ] 不含真实人名 / 商标 / 政治宗教内容
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
