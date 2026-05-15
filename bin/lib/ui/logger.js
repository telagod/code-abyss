// bin/lib/ui/logger.js
// 控制台 logger：banner/divider/step/ok/warn/info/fail
// 依赖 ansi.js 的 c (color) 工具

const { c } = require('./ansi.js');

function makeBanner(version) {
  return () => {
    console.log(`\n${c.mag(c.b('Code Abyss'))} ${c.gray(`v${version}`)} ${c.gray('· Claude / Codex / Gemini / OpenClaw')}\n`);
  };
}

function divider(title) {
  console.log(`\n${c.gray('─')} ${c.b(title)}`);
}

function step(n, total, msg) {
  console.log(`\n  ${c.cyn(`${n}/${total}`)} ${c.b(msg)}`);
}

function ok(msg) { console.log(`  ${c.grn('◆')} ${msg}`); }
function warn(msg) { console.log(`  ${c.ylw('▲')} ${msg}`); }
function info(msg) { console.log(`  ${c.cyn('◇')} ${msg}`); }
function fail(msg) { console.log(`  ${c.red('✖')} ${msg}`); }

module.exports = { makeBanner, divider, step, ok, warn, info, fail };
