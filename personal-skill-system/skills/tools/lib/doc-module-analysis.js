'use strict';

const { walkFiles, relativeTo, classifyPath, safeWriteFile } = require('./runtime');
const path = require('path');

function collectModuleSignals(targetDir, options = {}) {
  const files = walkFiles(targetDir, options);
  const relFiles = files.map(file => relativeTo(targetDir, file));
  const languages = new Set();
  const codeFiles = [];
  const testFiles = [];
  const configFiles = [];
  const scriptFiles = [];
  const entryCandidates = [];

  for (const rel of relFiles) {
    const ext = path.extname(rel).toLowerCase();
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) languages.add('JavaScript/TypeScript');
    if (ext === '.py') languages.add('Python');
    if (ext === '.go') languages.add('Go');
    if (ext === '.rs') languages.add('Rust');
    if (ext === '.java') languages.add('Java');

    const kind = classifyPath(rel);
    if (kind === 'code') codeFiles.push(rel);
    if (kind === 'test') testFiles.push(rel);
    if (kind === 'config') configFiles.push(rel);
    if (rel.startsWith('scripts/')) scriptFiles.push(rel);
    if (/(^|\/)(index|main|app|server|cli|run)\.(js|jsx|ts|tsx|py|go|rs|java)$/.test(rel)) {
      entryCandidates.push(rel);
    }
  }

  return {
    relFiles,
    codeFiles,
    testFiles,
    configFiles,
    scriptFiles,
    languages: [...languages].sort(),
    entryCandidates: entryCandidates.slice(0, 5)
  };
}

function generateDocs(targetDir, options = {}) {
  const moduleName = path.basename(targetDir);
  const readmePath = path.join(targetDir, 'README.md');
  const designPath = path.join(targetDir, 'DESIGN.md');
  const signals = collectModuleSignals(targetDir, options);
  const languageLine = signals.languages.length ? signals.languages.join(', ') : 'Unknown';
  const entryLines = signals.entryCandidates.length ? signals.entryCandidates.map(item => `- ${item}`).join('\n') : '- primary runtime entry still needs to be identified';
  const configLines = signals.configFiles.length ? signals.configFiles.slice(0, 5).map(item => `- ${item}`).join('\n') : '- no obvious config files detected yet';
  const verificationHint = signals.testFiles.length
    ? signals.testFiles.slice(0, 5).map(item => `- existing test surface: ${item}`).join('\n')
    : '- define the first smoke or regression path for this module';

  const readme = `# ${moduleName}\n\n## Purpose\n\nDescribe what this module does and why it exists.\n\n## Responsibilities\n\n- primary responsibility\n- key inputs and outputs\n- integration points\n\n## Runtime Signals\n\n- detected languages: ${languageLine}\n- code files detected: ${signals.codeFiles.length}\n- test files detected: ${signals.testFiles.length}\n- config files detected: ${signals.configFiles.length}\n\n## Public Surface\n\n${entryLines}\n\n## Configuration Surface\n\n${configLines}\n\n## Verification\n\n${verificationHint}\n- add the narrowest reliable validation command for this module\n`;
  const design = `# ${moduleName} Design\n\n## Scope\n\nDescribe the business or system boundary.\n\n## Runtime Boundary\n\n- primary entry or trigger\n- trusted inputs\n- untrusted inputs\n- outputs or side effects\n\n## Data Flow\n\n- producer\n- transform\n- consumer\n\n## Dependencies\n\n- upstream systems\n- downstream systems\n- local modules or shared runtime\n\n## Failure Modes\n\n- main failure mode\n- user-visible effect\n- rollback or mitigation\n\n## Verification Strategy\n\n- smallest reliable smoke path\n- regression path for risky behavior\n- operational or deployment notes if this module is release-sensitive\n`;
  const outputs = [];

  if (options.write) {
    if (safeWriteFile(readmePath, readme, options)) outputs.push(relativeTo(targetDir, readmePath));
    if (safeWriteFile(designPath, design, options)) outputs.push(relativeTo(targetDir, designPath));
  }

  return {
    tool: 'gen-docs',
    target: targetDir,
    summary: options.write ? 'Generated documentation skeletons where allowed.' : 'Prepared documentation skeletons for preview.',
    moduleName,
    signals,
    outputs,
    preview: {
      'README.md': readme,
      'DESIGN.md': design
    },
    nextSteps: [
      'fill in purpose, public surface, and ownership details',
      'document dependencies, data flow, and failure modes',
      'link verification, rollback, and operational notes'
    ]
  };
}

function analyzeModule(targetDir, options = {}) {
  const {
    relFiles,
    codeFiles,
    testFiles,
    configFiles,
    scriptFiles,
    languages,
    entryCandidates
  } = collectModuleSignals(targetDir, options);
  const findings = [];
  const hasReadme = relFiles.includes('README.md');
  const hasDesign = relFiles.includes('DESIGN.md');
  const hasTests = testFiles.length > 0;
  const hasCode = codeFiles.length > 0;
  const hasScripts = scriptFiles.length > 0;

  if (!hasCode) findings.push({ severity: 'error', message: 'no source-like files were detected in the module' });
  if (!hasReadme) findings.push({ severity: 'warning', file: 'README.md', message: 'README.md is missing' });
  if (!hasDesign) findings.push({ severity: 'warning', file: 'DESIGN.md', message: 'DESIGN.md is missing' });
  if (hasCode && !hasTests) findings.push({ severity: 'warning', message: 'code exists but no test-like files were detected' });
  if (hasScripts && !relFiles.some(file => file.startsWith('scripts/') && file.endsWith('.md'))) {
    findings.push({ severity: 'info', message: 'scripts exist; consider documenting operational usage' });
  }
  if (hasCode && configFiles.length > 0 && !hasDesign) {
    findings.push({ severity: 'warning', message: 'runtime or config surface exists but DESIGN.md is missing' });
  }
  if (hasCode && entryCandidates.length === 0) {
    findings.push({ severity: 'info', message: 'no obvious runtime entry point detected; document entry flow explicitly' });
  }

  return {
    tool: 'verify-module',
    target: targetDir,
    summary: `Scanned ${relFiles.length} files for module completeness.`,
    findings,
    moduleSignals: {
      hasReadme,
      hasDesign,
      hasTests,
      hasCode,
      hasScripts,
      languages,
      entryCandidates,
      configFiles: configFiles.length
    },
    nextSteps: [
      'add missing design or README artifacts',
      'ensure test coverage exists for real code paths',
      'document entry points and runtime boundaries when the module is non-trivial'
    ]
  };
}

module.exports = {
  generateDocs,
  analyzeModule
};
