'use strict';

// bin/lib/ui/safe-import.js
// A resolution failure on @inquirer/* (missing/corrupt node_modules) currently
// hard-crashes with a raw ERR_MODULE_NOT_FOUND-style stack wherever any adapter
// dynamically imports it. Route every such import through here so the failure
// becomes one actionable message instead of N duplicated try/catch blocks.

async function safeImport(specifier) {
  try {
    return await import(specifier);
  } catch (e) {
    throw new Error(
      `Interactive install requires "${specifier}" — run \`npm install\` or pass -y for a non-interactive install. (${e.message})`
    );
  }
}

function loadInquirerPrompts() {
  return safeImport('@inquirer/prompts');
}

function loadInquirerCore() {
  return safeImport('@inquirer/core');
}

function loadInquirerAnsi() {
  return safeImport('@inquirer/ansi');
}

module.exports = { safeImport, loadInquirerPrompts, loadInquirerCore, loadInquirerAnsi };
