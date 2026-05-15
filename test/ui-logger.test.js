// test/ui-logger.test.js
const { makeBanner, divider, step, ok, warn, info, fail } = require('../bin/lib/ui/logger.js');
const { stripAnsi } = require('../bin/lib/ui/ansi.js');

function captureLog(fn) {
  const lines = [];
  const original = console.log;
  console.log = (msg) => lines.push(String(msg));
  try {
    fn();
  } finally {
    console.log = original;
  }
  return lines;
}

describe('bin/lib/ui/logger', () => {
  test('makeBanner returns a function that prints version', () => {
    const banner = makeBanner('9.9.9');
    const lines = captureLog(() => banner());
    const joined = lines.map(stripAnsi).join('\n');
    expect(joined).toMatch(/Code Abyss/);
    expect(joined).toMatch(/v9\.9\.9/);
  });

  test('divider prints the title', () => {
    const lines = captureLog(() => divider('Test Section'));
    expect(stripAnsi(lines.join('\n'))).toMatch(/Test Section/);
  });

  test('step prints n/total + msg', () => {
    const lines = captureLog(() => step(2, 5, 'doing thing'));
    const joined = stripAnsi(lines.join('\n'));
    expect(joined).toMatch(/2\/5/);
    expect(joined).toMatch(/doing thing/);
  });

  test('ok/warn/info/fail print with respective markers', () => {
    expect(stripAnsi(captureLog(() => ok('a'))[0])).toMatch(/◆ a/);
    expect(stripAnsi(captureLog(() => warn('b'))[0])).toMatch(/▲ b/);
    expect(stripAnsi(captureLog(() => info('c'))[0])).toMatch(/◇ c/);
    expect(stripAnsi(captureLog(() => fail('d'))[0])).toMatch(/✖ d/);
  });
});
