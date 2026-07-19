'use strict';

const fs = require('fs');

const [, , lockPath, kind, delayRaw] = process.argv;
const delay = Number(delayRaw || '0');

setTimeout(() => {
  try {
    if (kind === 'dir') fs.rmSync(lockPath, { recursive: true, force: true });
    else fs.unlinkSync(lockPath);
  } catch {}
  process.exit(0);
}, delay);
