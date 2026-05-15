// test/ui-ansi.test.js
const { c, stripAnsi, cell } = require('../bin/lib/ui/ansi.js');

describe('bin/lib/ui/ansi', () => {
  describe('c (color)', () => {
    test('wraps with bold ANSI', () => {
      expect(c.b('x')).toBe('\x1b[1mx\x1b[0m');
    });
    test('wraps with red ANSI', () => {
      expect(c.red('x')).toBe('\x1b[31mx\x1b[0m');
    });
    test('all colors return wrapped strings', () => {
      ['b', 'd', 'red', 'grn', 'ylw', 'blu', 'mag', 'cyn', 'wht', 'gray'].forEach((key) => {
        expect(c[key]('x')).toMatch(/^\x1b\[\d+m.+\x1b\[0m$/);
      });
    });
  });

  describe('stripAnsi', () => {
    test('removes ANSI escape sequences', () => {
      expect(stripAnsi(c.red('hello'))).toBe('hello');
    });
    test('handles plain text unchanged', () => {
      expect(stripAnsi('plain')).toBe('plain');
    });
    test('handles non-string input via String()', () => {
      expect(stripAnsi(123)).toBe('123');
    });
  });

  describe('cell', () => {
    test('pads plain text to width', () => {
      expect(cell('ab', 5)).toBe('ab   ');
    });
    test('measures padding by visible width (ignoring ANSI)', () => {
      const colored = c.red('ab');
      const padded = cell(colored, 5);
      expect(stripAnsi(padded)).toBe('ab   ');
    });
    test('does not truncate longer input', () => {
      expect(cell('abcdef', 3)).toBe('abcdef');
    });
  });
});
