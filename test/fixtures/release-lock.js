'use strict';

const fs = require('fs');

const [, , lockPath, fdRaw, delayRaw] = process.argv;
const fd = Number(fdRaw);
const delay = Number(delayRaw || '0');

setTimeout(() => {
  try { fs.closeSync(fd); } catch {}
  try { fs.unlinkSync(lockPath); } catch {}
  process.exit(0);
}, delay);
