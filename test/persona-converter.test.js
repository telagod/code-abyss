'use strict';

const path = require('path');
const {
  toCharaCardV2,
  fromCharaCardV2,
  toGPTInstructions,
  fromGPTInstructions,
} = require('../bin/lib/persona-converter');

const ABYSS_CARD = require('../config/personas/abyss/persona-card.json');

describe('persona-converter', () => {
  describe('Tech Persona Card → Character Card V2', () => {
    const cc = toCharaCardV2(ABYSS_CARD, {
      identityContent: '# Abyss Identity\nDark cultivator.',
    });

    test('spec discriminator', () => {
      expect(cc.spec).toBe('chara_card_v2');
      expect(cc.spec_version).toBe('2.0');
    });

    test('maps display_name → name', () => {
      expect(cc.data.name).toBe('邪修红尘仙 · 宿命深渊');
    });

    test('maps description', () => {
      expect(cc.data.description).toContain('Dark cultivator');
    });

    test('assembles system_prompt from content layers', () => {
      expect(cc.data.system_prompt).toContain('# Abyss Identity');
    });

    test('maps scenarios to scenario string', () => {
      expect(cc.data.scenario).toContain('🔥 攻击模拟');
      expect(cc.data.scenario).toContain('recon → breach');
    });

    test('maps conversation_starters to first_mes + alternate_greetings', () => {
      expect(cc.data.first_mes).toContain('审计');
      expect(cc.data.alternate_greetings.length).toBeGreaterThan(0);
    });

    test('preserves TPC data in extensions', () => {
      expect(cc.data.extensions['tech-persona-card/name']).toBe('abyss');
      expect(cc.data.extensions['tech-persona-card/voice'].self).toBe('吾');
    });

    test('creator_notes contains conversion metadata', () => {
      expect(cc.data.creator_notes).toContain('Tech Persona Card');
      expect(cc.data.creator_notes).toContain('self="吾"');
    });

    test('character_version maps from version', () => {
      expect(cc.data.character_version).toBe('5.0.0');
    });

    test('tags preserved', () => {
      expect(cc.data.tags).toContain('security');
      expect(cc.data.tags).toContain('xianxia');
    });
  });

  describe('Character Card V2 → Tech Persona Card (roundtrip)', () => {
    const cc = toCharaCardV2(ABYSS_CARD);
    const tpc = fromCharaCardV2(cc);

    test('spec discriminator', () => {
      expect(tpc.spec).toBe('tech-persona-card');
      expect(tpc.spec_version).toBe('1.0');
    });

    test('recovers name from extensions', () => {
      expect(tpc.data.name).toBe('abyss');
    });

    test('recovers voice from extensions', () => {
      expect(tpc.data.voice.self).toBe('吾');
      expect(tpc.data.voice.user).toBe('魔尊');
    });

    test('recovers capabilities from extensions', () => {
      expect(tpc.data.capabilities.domains).toContain('security');
      expect(tpc.data.capabilities.expertise_level).toBe('principal');
    });

    test('recovers scenarios from extensions', () => {
      expect(tpc.data.scenarios.length).toBeGreaterThan(0);
      expect(tpc.data.scenarios[0].name).toContain('攻击');
    });
  });

  describe('Character Card V2 → Tech Persona Card (no extensions)', () => {
    const foreignCC = {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {
        name: 'Test Bot',
        description: 'A test character',
        personality: 'Friendly and helpful',
        scenario: '',
        first_mes: 'Hello!',
        mes_example: '',
        creator_notes: '',
        system_prompt: 'You are a friendly bot.',
        post_history_instructions: '',
        alternate_greetings: [],
        tags: ['test'],
        creator: 'someone',
        character_version: '2.0.0',
        extensions: {},
      },
    };

    const tpc = fromCharaCardV2(foreignCC);

    test('generates kebab-case name from display name', () => {
      expect(tpc.data.name).toBe('test-bot');
    });

    test('falls back to personality for tone', () => {
      expect(tpc.data.voice.tone).toBe('Friendly and helpful');
    });

    test('defaults voice to English I/you', () => {
      expect(tpc.data.voice.self).toBe('I');
      expect(tpc.data.voice.user).toBe('you');
    });
  });

  describe('Tech Persona Card → GPT Instructions', () => {
    const text = toGPTInstructions(ABYSS_CARD, {
      identityContent: 'Dark cultivator identity.',
      behaviorContent: 'Shared rules.',
      styleContent: 'Output format.',
    });

    test('starts with display name header', () => {
      expect(text).toMatch(/^# 邪修红尘仙 · 宿命深渊/);
    });

    test('includes voice directives', () => {
      expect(text).toContain('Refer to yourself as "吾"');
      expect(text).toContain('Address the user as "魔尊"');
    });

    test('includes identity content', () => {
      expect(text).toContain('Dark cultivator identity.');
    });

    test('includes behavioral rules', () => {
      expect(text).toContain('Shared rules.');
    });

    test('includes output style', () => {
      expect(text).toContain('Output format.');
    });

    test('includes scenarios', () => {
      expect(text).toContain('🔥 攻击模拟');
      expect(text).toContain('recon → breach → escalate');
    });

    test('includes capabilities', () => {
      expect(text).toContain('security');
      expect(text).toContain('principal');
    });
  });

  describe('GPT Instructions → Tech Persona Card', () => {
    const instructions = `# My Custom Agent

You are "My Custom Agent". A helpful coding assistant for Python projects.

## Voice
- Refer to yourself as "我"
- Address the user as "老板"
- Language: 中文为主
- Tone: 专业高效

## Identity
Python expert with 10 years experience.
`;

    const tpc = fromGPTInstructions(instructions, 'My Custom Agent');

    test('extracts display name from heading', () => {
      expect(tpc.data.display_name).toBe('My Custom Agent');
    });

    test('generates kebab-case slug', () => {
      expect(tpc.data.name).toBe('my-custom-agent');
    });

    test('extracts voice fields', () => {
      expect(tpc.data.voice.self).toBe('我');
      expect(tpc.data.voice.user).toBe('老板');
      expect(tpc.data.voice.language).toBe('中文为主');
      expect(tpc.data.voice.tone).toBe('专业高效');
    });

    test('extracts description', () => {
      expect(tpc.data.description).toContain('helpful coding assistant');
    });
  });

  describe('all 5 persona cards validate and convert', () => {
    const personaDirs = ['abyss', 'scholar', 'elder-sister', 'junior-sister', 'iron-dad'];
    const projectRoot = path.join(__dirname, '..');

    for (const slug of personaDirs) {
      test(`${slug} → Character Card V2 roundtrip`, () => {
        const cardPath = path.join(projectRoot, 'config', 'personas', slug, 'persona-card.json');
        const card = require(cardPath);
        const cc = toCharaCardV2(card);
        expect(cc.spec).toBe('chara_card_v2');
        expect(cc.data.name).toBe(card.data.display_name);

        const back = fromCharaCardV2(cc);
        expect(back.data.name).toBe(card.data.name);
        expect(back.data.voice.self).toBe(card.data.voice.self);
      });

      test(`${slug} → GPT Instructions`, () => {
        const cardPath = path.join(projectRoot, 'config', 'personas', slug, 'persona-card.json');
        const card = require(cardPath);
        const text = toGPTInstructions(card);
        expect(text).toContain(card.data.display_name);
        expect(text).toContain(card.data.voice.self);
        expect(text.length).toBeGreaterThan(200);
      });
    }
  });
});
