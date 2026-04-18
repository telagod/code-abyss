'use strict';

const { walkFiles, relativeTo, classifyPath, safeWriteFile } = require('./runtime');
const path = require('path');

function generateDocs(targetDir, options = {}) {
  const moduleName = path.basename(targetDir);
  const readmePath = path.join(targetDir, 'README.md');
  const designPath = path.join(targetDir, 'DESIGN.md');
  const readme = `# ${moduleName}\n\n## Purpose\n\nDescribe what this module does and why it exists.\n\n## Responsibilities\n\n- primary responsibility\n- key inputs and outputs\n- integration points\n\n## Public Surface\n\n- primary entry points\n- external callers or consumers\n- important flags or configuration\n\n## Verification\n\n- main test path\n- smoke command or validation step\n`;
  const design = `# ${moduleName} Design\n\n## Scope\n\nDescribe the business or system boundary.\n\n## Data Flow\n\n- producer\n- transform\n- consumer\n\n## Dependencies\n\n- upstream systems\n- downstream systems\n- local modules or shared runtime\n\n## Failure Modes\n\n- main failure mode\n- user-visible effect\n- rollback or mitigation\n`;
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
  const files = walkFiles(targetDir, options);
  const relFiles = files.map(file => relativeTo(targetDir, file));
  const findings = [];
  const hasReadme = relFiles.includes('README.md');
  const hasDesign = relFiles.includes('DESIGN.md');
  const hasTests = relFiles.some(file => classifyPath(file) === 'test');
  const hasCode = relFiles.some(file => classifyPath(file) === 'code');
  const hasScripts = relFiles.some(file => file.startsWith('scripts/'));

  if (!hasCode) findings.push({ severity: 'error', message: 'no source-like files were detected in the module' });
  if (!hasReadme) findings.push({ severity: 'warning', file: 'README.md', message: 'README.md is missing' });
  if (!hasDesign) findings.push({ severity: 'warning', file: 'DESIGN.md', message: 'DESIGN.md is missing' });
  if (hasCode && !hasTests) findings.push({ severity: 'warning', message: 'code exists but no test-like files were detected' });
  if (hasScripts && !relFiles.some(file => file.startsWith('scripts/') && file.endsWith('.md'))) {
    findings.push({ severity: 'info', message: 'scripts exist; consider documenting operational usage' });
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
      hasScripts
    },
    nextSteps: [
      'add missing design or README artifacts',
      'ensure test coverage exists for real code paths'
    ]
  };
}

module.exports = {
  generateDocs,
  analyzeModule
};
