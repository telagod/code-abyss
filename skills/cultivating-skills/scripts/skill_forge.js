#!/usr/bin/env node
'use strict';

// safety-scan: ignore SUDO_DISABLE_SEC,RM_RF_ROOT,CURL_PIPE_SH,EVAL_INPUT,OS_SYSTEM_VAR,TOKEN_EXFIL
// 本文件正则模式定义本身需匹配这些字符串以扫描其他 skill。

/**
 * skill_forge — single dispatcher for cultivating-skills
 *
 * Subcommands:
 *   init <slug>           Scaffold a new skill (default tier: local)
 *   lint <skill-dir>      Validate frontmatter, references, allowed-tools
 *   scan <skill-dir>      Safety scan (block/warn/info)
 *   improve <skill-dir>   Generate a diff-mode improvement template
 *   promote <skill-dir>   Move/copy across L0→L1→L2 tiers
 *
 * Exit codes: 0 ok, 1 blocked, 2 usage error.
 */

const fs = require('fs');
const path = require('path');

const NAME_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOOL_NAME_RE = /^[A-Z][A-Za-z0-9]*$/;
const DEFAULT_TOOLS = ['Read'];
const PRIVILEGED_TOOLS = new Set(['Bash', 'Write', 'Edit', 'WebFetch', 'NotebookEdit']);

const DANGER_PATTERNS = [
  { id: 'RM_RF_ROOT', re: /rm\s+-rf\s+(\/|\$HOME|\$\{?HOME\}?|\$1\b|\$\*)/i,
    msg: '危险的递归删除模式' },
  { id: 'CURL_PIPE_SH', re: /(curl|wget)\s+[^\n|`]*\|\s*(sh|bash|zsh)\b/i,
    msg: '远程脚本管道执行' },
  { id: 'EVAL_INPUT', re: /\b(eval|exec)\s*\(\s*[^)]*\b(input|stdin|argv|request|user_input|userInput|\$1|\$\*)\b/i,
    msg: 'eval/exec 直接执行用户输入' },
  { id: 'OS_SYSTEM_VAR', re: /os\.system\s*\(\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\)/,
    msg: 'os.system 直接传变量' },
  { id: 'SUDO_DISABLE_SEC', re: /SELINUX\s*=\s*disabled|setenforce\s+0|--no-verify\b/i,
    msg: '关闭安全防护的危险默认' },
  { id: 'TOKEN_EXFIL', re: /(curl|wget)\s+[^\n]*\$(GITHUB_TOKEN|NPM_TOKEN|AWS_SECRET|API_KEY)/i,
    msg: '凭据外发' },
];

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+(instructions|prompts)/i,
  /you\s+are\s+now\s+(?:a|an)\b/i,
  /reveal\s+(your\s+)?system\s+prompt/i,
  /override\s+(your\s+)?instructions/i,
  /disregard\s+all\s+prior/i,
  /forget\s+everything\s+above/i,
];

const SECRET_PATTERNS = [
  { id: 'AWS_KEY', re: /AKIA[0-9A-Z]{16}/, msg: 'AWS Access Key' },
  { id: 'PRIVATE_KEY', re: /-----BEGIN\s+(RSA\s+|EC\s+|DSA\s+|OPENSSH\s+)?PRIVATE KEY-----/, msg: '私钥' },
  { id: 'GITHUB_PAT', re: /ghp_[A-Za-z0-9]{36}/, msg: 'GitHub PAT' },
  { id: 'SLACK_TOKEN', re: /xox[baprs]-[A-Za-z0-9-]{10,}/, msg: 'Slack token' },
];

function usage(code = 2) {
  process.stderr.write(`用法: skill_forge <init|lint|scan|improve|promote> [args]

  init <slug> [--tier local|project|community] [--scripted]
  lint <skill-dir>
  scan <skill-dir> [--force]
  improve <skill-dir>
  promote <skill-dir> --to <project|community>
`);
  process.exit(code);
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { meta: null, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return { meta: null, body: raw };
  const yaml = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\n/, '');
  const meta = {};
  yaml.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!m) return;
    meta[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  });
  return { meta, body };
}

function readSkill(dir) {
  const md = path.join(dir, 'SKILL.md');
  if (!fs.existsSync(md)) throw new Error(`未找到 ${md}`);
  const raw = fs.readFileSync(md, 'utf8');
  const { meta, body } = parseFrontmatter(raw);
  if (!meta) throw new Error(`SKILL.md frontmatter 缺失: ${md}`);
  return { dir, md, raw, meta, body };
}

// Parse `safety-scan: ignore RULE_ID[,RULE_ID...] [reason]` directives.
// Supports markdown comments `<!-- ... -->` and JS line comments `// ...`.
function parseIgnoreDirectives(text) {
  const ignored = new Set();
  const re = /(?:<!--|\/\/|#)\s*safety-scan:\s*ignore\s+([A-Z0-9_,\s]+?)(?:\s|-->|$)/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    m[1].split(',').forEach((id) => {
      const trimmed = id.trim();
      if (trimmed) ignored.add(trimmed);
    });
  }
  return ignored;
}

function addFinding(findings, severity, ignored, id, msg) {
  if (ignored.has(id)) return;
  findings[severity].push({ id, msg });
}

function listScripts(dir) {
  const scriptsDir = path.join(dir, 'scripts');
  if (!fs.existsSync(scriptsDir)) return [];
  return fs.readdirSync(scriptsDir).filter((f) => f.endsWith('.js'));
}

function listReferences(dir) {
  const refDir = path.join(dir, 'references');
  if (!fs.existsSync(refDir)) return [];
  return fs.readdirSync(refDir).filter((f) => f.endsWith('.md'));
}

function cmdInit(args) {
  const slug = args[0];
  if (!slug) usage();
  if (!NAME_SLUG_RE.test(slug)) {
    process.stderr.write(`✗ slug 必须为 kebab-case: ${slug}\n`);
    process.exit(2);
  }

  const tierIdx = args.indexOf('--tier');
  const tier = tierIdx >= 0 ? args[tierIdx + 1] : 'local';
  const scripted = args.includes('--scripted');

  const baseDir = {
    local: path.join(process.env.HOME || '.', '.claude', 'skills', 'local'),
    project: path.join(process.cwd(), '.claude', 'skills'),
    community: path.join(process.cwd(), 'skills'),
  }[tier];

  if (!baseDir) {
    process.stderr.write(`✗ 未知 tier: ${tier}\n`);
    process.exit(2);
  }

  const target = path.join(baseDir, slug);
  if (fs.existsSync(target)) {
    process.stderr.write(`✗ 已存在: ${target}\n`);
    process.exit(1);
  }
  fs.mkdirSync(path.join(target, 'references'), { recursive: true });
  if (scripted) fs.mkdirSync(path.join(target, 'scripts'));

  const tools = scripted ? 'Bash, Read' : 'Read';
  const userInvocable = scripted ? 'true' : 'false';
  const frontmatter = [
    '---',
    `name: ${slug}`,
    `description: <动词开头，说明做什么 + 何时触发，≥40 字>`,
    scripted ? 'compatibility: node>=18' : null,
    `user-invocable: ${userInvocable}`,
    `allowed-tools: ${tools}`,
    '---',
  ].filter(Boolean).join('\n');

  const body = `\n\n# ${slug}\n\n> 一句话定位。\n\n## 何时使用\n\n| 场景 | 使用 | 理由 |\n|------|------|------|\n| <场景 1> | ✅ | <为何> |\n\n## 何时不使用\n\n- ❌ <反场景>\n\n## 主流程\n\n1. <步骤>\n\n## 与其他 skill 联动\n\n- <相关 skill 链接>\n\n## 收口\n\n<验收标准>\n`;

  fs.writeFileSync(path.join(target, 'SKILL.md'), frontmatter + body);
  fs.writeFileSync(
    path.join(target, 'references', 'workflow.md'),
    `# ${slug} · 工作流\n\n> 重内容下沉，SKILL.md ≤ 90 行。\n`,
  );

  if (scripted) {
    fs.writeFileSync(
      path.join(target, 'scripts', `${slug.replace(/-/g, '_')}.js`),
      `#!/usr/bin/env node\n'use strict';\n\n// ${slug} runner\n\nfunction main(argv) {\n  // TODO: 实现\n  return 0;\n}\n\nprocess.exit(main(process.argv.slice(2)));\n`,
    );
  }

  process.stdout.write(`✓ 已生成: ${target}\n`);
  process.stdout.write(`下一步:\n  1. 编辑 SKILL.md（frontmatter 中的 description）\n  2. node ${path.basename(__filename)} lint ${target}\n  3. node ${path.basename(__filename)} scan ${target}\n`);
  return 0;
}

function validateFrontmatter(meta, findings, ignored) {
  const name = meta.name;
  if (!name) addFinding(findings, 'block', ignored, 'FM_NAME_MISSING', 'name 缺失');
  else if (!NAME_SLUG_RE.test(name)) addFinding(findings, 'block', ignored, 'FM_NAME_INVALID', `name 必须 kebab-case: ${name}`);

  const desc = meta.description;
  if (!desc) addFinding(findings, 'block', ignored, 'FM_DESC_MISSING', 'description 缺失');
  else if (desc.length < 40) addFinding(findings, 'block', ignored, 'FM_DESC_TOO_SHORT', `description 过短 (${desc.length} < 40)`);
  else if (/\b(various|general|helper|utility|misc)\b/i.test(desc)) addFinding(findings, 'block', ignored, 'FM_DESC_VAGUE', 'description 含通用词，边界不清');

  if (meta['user-invocable'] === undefined) addFinding(findings, 'block', ignored, 'FM_INVOCABLE_MISSING', 'user-invocable 缺失');
  else if (!/^(true|false)$/.test(String(meta['user-invocable']))) addFinding(findings, 'block', ignored, 'FM_INVOCABLE_INVALID', 'user-invocable 必须为 true/false');

  const tools = meta['allowed-tools'];
  if (tools) {
    if (tools.includes('*')) addFinding(findings, 'block', ignored, 'FM_TOOLS_WILDCARD', 'allowed-tools 含通配符');
    const parts = String(tools).split(',').map((t) => t.trim()).filter(Boolean);
    parts.forEach((t) => {
      if (!TOOL_NAME_RE.test(t)) addFinding(findings, 'block', ignored, 'FM_TOOLS_INVALID', `非法工具名: ${t}`);
    });
    const privileged = parts.filter((t) => PRIVILEGED_TOOLS.has(t));
    if (privileged.length > 0) addFinding(findings, 'warn', ignored, 'TOOLS_PRIVILEGED', `特权工具: ${privileged.join(', ')}（SKILL.md 应说明理由）`);
  }
}

function validateBody(body, findings, ignored) {
  const lines = body.split('\n');
  if (lines.length > 90) addFinding(findings, 'warn', ignored, 'BODY_TOO_LONG', `SKILL.md ${lines.length} 行 > 90，应下沉 references`);

  if (!/何时不使用|when not|when NOT/i.test(body)) addFinding(findings, 'info', ignored, 'NO_NEGATIVE_CASE', '建议补"何时不使用"段落');

  DANGER_PATTERNS.forEach(({ id, re, msg }) => {
    if (re.test(body)) addFinding(findings, 'block', ignored, id, msg);
  });
  INJECTION_PATTERNS.forEach((re) => {
    if (re.test(body)) addFinding(findings, 'block', ignored, 'PROMPT_INJECTION', `prompt injection 反模式: ${re}`);
  });
  SECRET_PATTERNS.forEach(({ id, re, msg }) => {
    if (re.test(body)) addFinding(findings, 'block', ignored, id, msg);
  });
}

function validateReferences(skillDir, body, findings, ignored) {
  const refDir = path.join(skillDir, 'references');
  const linkRe = /\[[^\]]*\]\((references\/[^)]+)\)/g;
  let m;
  while ((m = linkRe.exec(body)) !== null) {
    const ref = m[1];
    const refPath = path.join(skillDir, ref);
    if (!fs.existsSync(refPath)) {
      addFinding(findings, 'block', ignored, 'REF_DANGLING', `引用悬空: ${ref}`);
    }
  }
  if (fs.existsSync(refDir)) {
    fs.readdirSync(refDir).filter((f) => f.endsWith('.md')).forEach((f) => {
      const refPath = path.join(refDir, f);
      const stat = fs.statSync(refPath);
      const lineCount = fs.readFileSync(refPath, 'utf8').split('\n').length;
      if (lineCount > 800) addFinding(findings, 'warn', ignored, 'REF_TOO_LONG', `${f} ${lineCount} 行 > 800，建议拆分`);
      if (stat.size === 0) addFinding(findings, 'block', ignored, 'REF_EMPTY', `${f} 为空文件`);
    });
  }
}

function validateScripts(skillDir, findings, ignored) {
  const scripts = listScripts(skillDir);
  if (scripts.length > 1) addFinding(findings, 'block', ignored, 'SCRIPT_MULTI_ENTRY', `scripts/ 多入口 (${scripts.length})，registry 必拒`);

  scripts.forEach((s) => {
    const code = fs.readFileSync(path.join(skillDir, 'scripts', s), 'utf8');
    // Per-file ignore directives merge with parent + accept un-prefixed IDs (e.g. RM_RF_ROOT matches SCRIPT_RM_RF_ROOT)
    const fileLocal = parseIgnoreDirectives(code);
    const fileIgnored = new Set();
    [...ignored, ...fileLocal].forEach((id) => {
      fileIgnored.add(id);
      fileIgnored.add(`SCRIPT_${id}`);
    });
    DANGER_PATTERNS.forEach(({ id, re, msg }) => {
      if (re.test(code)) addFinding(findings, 'block', fileIgnored, `SCRIPT_${id}`, `scripts/${s}: ${msg}`);
    });
    SECRET_PATTERNS.forEach(({ id, re, msg }) => {
      if (re.test(code)) addFinding(findings, 'block', fileIgnored, `SCRIPT_${id}`, `scripts/${s}: ${msg}`);
    });
    if (/https?:\/\//.test(code) && /(https\.request|http\.request|fetch\(|axios\.)/.test(code)) {
      addFinding(findings, 'warn', fileIgnored, 'SCRIPT_NETWORK', `scripts/${s} 调用网络，需声明`);
    }
  });
}

function runAllChecks(skill) {
  const findings = { block: [], warn: [], info: [] };
  const ignored = parseIgnoreDirectives(skill.raw);
  validateFrontmatter(skill.meta, findings, ignored);
  validateBody(skill.body, findings, ignored);
  validateReferences(skill.dir, skill.body, findings, ignored);
  validateScripts(skill.dir, findings, ignored);
  return findings;
}

function cmdLint(args) {
  const skillDir = args[0];
  if (!skillDir) usage();
  const skill = readSkill(skillDir);
  const findings = runAllChecks(skill);
  printFindings(findings, skill.dir);
  return findings.block.length > 0 ? 1 : 0;
}

function cmdScan(args) {
  const force = args.includes('--force');
  const skillDir = args.find((a) => !a.startsWith('--'));
  if (!skillDir) usage();
  const skill = readSkill(skillDir);
  const findings = runAllChecks(skill);
  printFindings(findings, skill.dir);

  if (findings.block.length > 0) return 1;
  if (findings.warn.length > 0 && !force) {
    process.stderr.write(`\n⚠ 有 ${findings.warn.length} 个 warn。--force 可强制通过，但 PR 需记录。\n`);
    return 1;
  }
  return 0;
}

function cmdImprove(args) {
  const skillDir = args[0];
  if (!skillDir) usage();
  const skill = readSkill(skillDir);

  process.stdout.write(`## 改进 ${skill.meta.name}\n\n`);
  process.stdout.write(`当前 frontmatter:\n`);
  Object.entries(skill.meta).forEach(([k, v]) => process.stdout.write(`  ${k}: ${v}\n`));
  process.stdout.write(`\nSKILL.md 行数: ${skill.body.split('\n').length}\n`);
  process.stdout.write(`references: ${listReferences(skill.dir).join(', ') || '(none)'}\n`);
  process.stdout.write(`scripts: ${listScripts(skill.dir).join(', ') || '(none)'}\n\n`);

  process.stdout.write(`改进等级判断:\n`);
  process.stdout.write(`  L1 微调 → 直接 PR\n`);
  process.stdout.write(`  L2 增补 → PR + 说明\n`);
  process.stdout.write(`  L3 重写 → 先 Issue 讨论\n\n`);

  process.stdout.write(`PR 草案模板:\n\n`);
  process.stdout.write(`---\n## 改进 ${skill.meta.name}\n\n### 病灶\n<描述>\n\n### 修改\n<diff 摘要>\n\n### 验证\n- [ ] safety_scan\n- [ ] verify:skills\n- [ ] npm test\n---\n`);
  return 0;
}

function cmdPromote(args) {
  const skillDir = args[0];
  const toIdx = args.indexOf('--to');
  const target = toIdx >= 0 ? args[toIdx + 1] : null;
  if (!skillDir || !target) usage();
  if (!['project', 'community'].includes(target)) {
    process.stderr.write(`✗ --to 必须为 project 或 community\n`);
    process.exit(2);
  }

  const skill = readSkill(skillDir);
  const findings = runAllChecks(skill);
  printFindings(findings, skill.dir);
  if (findings.block.length > 0) {
    process.stderr.write(`\n✗ 升级阻断: 有 block 级问题，先修\n`);
    return 1;
  }
  if (target === 'community' && findings.warn.length > 0) {
    process.stderr.write(`\n✗ L2 升级要求 warn 也清零\n`);
    return 1;
  }

  process.stdout.write(`\n✓ 通过升级闸到 ${target}\n`);
  process.stdout.write(`手动迁移步骤:\n`);
  if (target === 'project') {
    process.stdout.write(`  cp -r ${skillDir} <repo>/.claude/skills/${skill.meta.name}\n`);
    process.stdout.write(`  git add <repo>/.claude/skills/${skill.meta.name}\n`);
  } else {
    process.stdout.write(`  1. fork upstream\n`);
    process.stdout.write(`  2. cp -r ${skillDir} skills/${skill.meta.name}\n`);
    process.stdout.write(`  3. npm run verify:skills && npm test\n`);
    process.stdout.write(`  4. 推送分支 skill/${skill.meta.name}，开 PR\n`);
    process.stdout.write(`  或访问 https://telagod.github.io/code-abyss/submit.html\n`);
  }
  return 0;
}

function printFindings(findings, skillDir) {
  process.stdout.write(`扫描: ${skillDir}\n`);
  if (findings.block.length === 0 && findings.warn.length === 0 && findings.info.length === 0) {
    process.stdout.write(`✓ 无问题\n`);
    return;
  }
  findings.block.forEach((f) => process.stdout.write(`  [BLOCK] ${f.id}: ${f.msg}\n`));
  findings.warn.forEach((f) => process.stdout.write(`  [WARN]  ${f.id}: ${f.msg}\n`));
  findings.info.forEach((f) => process.stdout.write(`  [INFO]  ${f.id}: ${f.msg}\n`));
  process.stdout.write(`\n汇总: block=${findings.block.length} warn=${findings.warn.length} info=${findings.info.length}\n`);
}

function main(argv) {
  const [cmd, ...rest] = argv;
  switch (cmd) {
    case 'init': return cmdInit(rest);
    case 'lint': return cmdLint(rest);
    case 'scan': return cmdScan(rest);
    case 'improve': return cmdImprove(rest);
    case 'promote': return cmdPromote(rest);
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

module.exports = { main, parseFrontmatter };
