'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

const { getCacheDir, isPersonaCached, CACHE_BASE } = require('../bin/lib/persona-fetch');

describe('persona-fetch', () => {
  test('getCacheDir returns path under ~/.code-abyss/personas/', () => {
    const dir = getCacheDir('scholar');
    expect(dir).toBe(path.join(os.homedir(), '.code-abyss', 'personas', 'scholar'));
  });

  test('isPersonaCached returns false for non-existent slug', () => {
    expect(isPersonaCached('__nonexistent_test_persona__')).toBe(false);
  });

  test('CACHE_BASE is under home directory', () => {
    expect(CACHE_BASE).toContain('.code-abyss');
    expect(CACHE_BASE).toContain('personas');
  });
});
