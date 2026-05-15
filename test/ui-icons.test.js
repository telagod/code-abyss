// test/ui-icons.test.js
const { TARGET_ICONS, TARGET_HINTS, PERSONA_ICONS } = require('../bin/lib/ui/icons.js');

describe('bin/lib/ui/icons', () => {
  test('TARGET_ICONS covers all install targets', () => {
    expect(Object.keys(TARGET_ICONS).sort()).toEqual(
      ['claude', 'codex', 'gemini', 'openclaw'].sort()
    );
  });

  test('TARGET_HINTS covers all install targets', () => {
    expect(Object.keys(TARGET_HINTS).sort()).toEqual(
      ['claude', 'codex', 'gemini', 'openclaw'].sort()
    );
  });

  test('TARGET_HINTS values are non-empty strings', () => {
    Object.values(TARGET_HINTS).forEach((hint) => {
      expect(typeof hint).toBe('string');
      expect(hint.length).toBeGreaterThan(0);
    });
  });

  test('PERSONA_ICONS has male/female/other', () => {
    expect(PERSONA_ICONS).toHaveProperty('male');
    expect(PERSONA_ICONS).toHaveProperty('female');
    expect(PERSONA_ICONS).toHaveProperty('other');
  });
});
