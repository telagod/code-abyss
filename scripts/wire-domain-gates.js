'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = '/home/telagod/project/code-abyss';

// exec skill -> kernel domain (COMPOSE: judgment layer above execution)
const MAP = {
  'developing-software': 'backend',
  'designing-architectures': 'backend',
  'provisioning-infrastructure': 'backend',
  'engineering-data-pipelines': 'backend',
  'automating-devops': 'backend',
  'applying-ui-design-system': 'frontend',
  'developing-mobile-apps': 'frontend',
  'designing-hardware-products': 'hardware',
  'operating-kicad-eda': 'hardware',
  'building-agent-systems': 'ml',
  'securing-systems': 'security',
  'analyzing-security': 'security',
  'architecting-security': 'security',
  'defending-applications': 'security',
  'detecting-and-responding': 'security',
  'securing-cloud-and-supply-chain': 'security',
};

const MARKER = 'skills/_kernel/';
function gate(domain) {
  return (
    '> **判断先于执行**：决定「是否做 / 选什么 / 如何取舍」（栈、方案、架构、权衡）前，' +
    '先读领域判断内核 `skills/_kernel/' + domain + '/SKILL.md`——它管 judgment，' +
    '本秘典管 execution；冲突时以内核判断为准。'
  );
}

let patched = 0, skipped = 0;
for (const [skill, domain] of Object.entries(MAP)) {
  const p = path.join(ROOT, 'skills', skill, 'SKILL.md');
  let t = fs.readFileSync(p, 'utf8');
  if (t.includes(MARKER)) { skipped++; continue; }
  const lines = t.split('\n');
  // Frontmatter may contain `# ...` YAML comment lines, so find the CLOSING
  // `---` first, then locate the real H1 in the body after it.
  if (lines[0].trim() !== '---') { console.log('WARN no frontmatter: ' + skill); skipped++; continue; }
  let fmEnd = -1;
  for (let i = 1; i < lines.length; i++) { if (lines[i].trim() === '---') { fmEnd = i; break; } }
  if (fmEnd === -1) { console.log('WARN unterminated frontmatter: ' + skill); skipped++; continue; }
  let h1 = -1;
  for (let i = fmEnd + 1; i < lines.length; i++) { if (/^# /.test(lines[i])) { h1 = i; break; } }
  if (h1 === -1) { console.log('WARN no H1: ' + skill); skipped++; continue; }
  // insert gate as a blockquote after the H1 (with surrounding blank lines)
  lines.splice(h1 + 1, 0, '', gate(domain));
  fs.writeFileSync(p, lines.join('\n'));
  patched++;
}
console.log('domain gates: patched=' + patched + ' skipped=' + skipped + ' (of ' + Object.keys(MAP).length + ')');
