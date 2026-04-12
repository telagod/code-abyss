'use strict';

const fs = require('fs');
const path = require('path');

const {
  applySnippetToFile,
  hasSnippetBlock,
} = require('./pack-docs');

function renderReadmeSnippet(lock) {
  const lines = [
    '## AI Pack Bootstrap',
    '',
    'This repository declares Code Abyss packs in `.code-abyss/packs.lock.json`.',
    '',
  ];

  ['claude', 'codex', 'gemini'].forEach((host) => {
    const cfg = lock.hosts[host];
    lines.push(`- ${host}: required=[${cfg.required.join(', ') || 'none'}], optional=[${cfg.optional.join(', ') || 'none'}], optional_policy=${cfg.optional_policy}`);
  });

  lines.push(
    '',
    'Recommended install:',
    '',
    '```bash',
    'npx code-abyss --target claude -y',
    'npx code-abyss --target codex -y',
    'npx code-abyss --target gemini -y',
    '```',
    ''
  );
  return lines.join('\n');
}

function renderContributingSnippet(lock) {
  return [
    '## AI Tooling',
    '',
    'This repository uses `.code-abyss/packs.lock.json` to declare AI packs.',
    '',
    '- Update the lock with `npm run packs:update -- [flags]`.',
    '- Validate it with `npm run packs:check`.',
    '- Re-run `npx code-abyss --target claude|codex|gemini -y` after pack changes.',
    '',
    `Current host policies: claude=${lock.hosts.claude.optional_policy}, codex=${lock.hosts.codex.optional_policy}, gemini=${lock.hosts.gemini.optional_policy}`,
    '',
  ].join('\n');
}

function writeBootstrapSnippets(projectRoot, lock) {
  const snippetDir = path.join(projectRoot, '.code-abyss', 'snippets');
  fs.mkdirSync(snippetDir, { recursive: true });
  fs.writeFileSync(path.join(snippetDir, 'README.packs.md'), `${renderReadmeSnippet(lock)}\n`);
  fs.writeFileSync(path.join(snippetDir, 'CONTRIBUTING.packs.md'), `${renderContributingSnippet(lock)}\n`);
  return snippetDir;
}

function applyBootstrapDocs(projectRoot, lock, mode = 'all') {
  const operations = [
    { filePath: path.join(projectRoot, 'README.md'), kind: 'readme', content: renderReadmeSnippet(lock) },
    { filePath: path.join(projectRoot, 'CONTRIBUTING.md'), kind: 'contributing', content: renderContributingSnippet(lock) },
  ];

  const results = [];
  operations.forEach((op) => {
    if (mode === 'markers-only' && !hasSnippetBlock(op.filePath, op.kind)) {
      results.push({ filePath: op.filePath, action: 'skipped' });
      return;
    }
    results.push(applySnippetToFile(op.filePath, op.kind, op.content));
  });

  return results;
}

function syncProjectBootstrapArtifacts(projectRoot, lock) {
  const snippetDir = writeBootstrapSnippets(projectRoot, lock);
  const docs = applyBootstrapDocs(projectRoot, lock, 'markers-only');
  return { snippetDir, docs };
}

module.exports = {
  renderReadmeSnippet,
  renderContributingSnippet,
  writeBootstrapSnippets,
  applyBootstrapDocs,
  syncProjectBootstrapArtifacts,
};
