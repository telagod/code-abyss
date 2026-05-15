// bin/lib/ui/ansi.js
// ANSI 颜色工具：纯函数，无副作用，零依赖

const c = {
  b: s => `\x1b[1m${s}\x1b[0m`,
  d: s => `\x1b[2m${s}\x1b[0m`,
  red: s => `\x1b[31m${s}\x1b[0m`,
  grn: s => `\x1b[32m${s}\x1b[0m`,
  ylw: s => `\x1b[33m${s}\x1b[0m`,
  blu: s => `\x1b[34m${s}\x1b[0m`,
  mag: s => `\x1b[35m${s}\x1b[0m`,
  cyn: s => `\x1b[36m${s}\x1b[0m`,
  wht: s => `\x1b[37m${s}\x1b[0m`,
  gray: s => `\x1b[90m${s}\x1b[0m`,
};

function stripAnsi(input) {
  return String(input).replace(/\x1b\[[0-9;]*m/g, '');
}

function cell(input, width) {
  const raw = stripAnsi(input);
  const pad = Math.max(0, width - raw.length);
  return `${input}${' '.repeat(pad)}`;
}

module.exports = { c, stripAnsi, cell };
