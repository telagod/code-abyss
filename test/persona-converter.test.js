'use strict';

const path = require('path');
const fs = require('fs');
const {
  toCharaCardV2,
  fromCharaCardV2,
  toGPTInstructions,
  fromGPTInstructions,
} = require('../bin/lib/persona-converter');

const ABYSS_CARD = require('../config/personas/abyss.json');

describe('persona-converter', () => {
  describe('Persona Voice Card → Character Card V2', () => {
    const cc = toCharaCardV2(ABYSS_CARD);

    test('spec discriminator', () => {
      expect(cc.spec).toBe('chara_card_v2');
      expect(cc.spec_version).toBe('2.0');
    });

    test('maps label → name', () => {
      expect(cc.data.name).toBe('邪修红尘仙 · 宿命深渊');
    });

    test('maps description', () => {
      expect(cc.data.description).toContain('Dark cultivator');
    });

    test('system_prompt is the fixed-template rendered identity (no freeform content)', () => {
      expect(cc.data.system_prompt).toContain('自称：吾');
      expect(cc.data.system_prompt).toContain('称呼你：魔尊');
    });

    test('maps sample_prompts to first_mes + alternate_greetings', () => {
      expect(cc.data.first_mes).toContain('审计');
      expect(cc.data.alternate_greetings.length).toBeGreaterThan(0);
    });

    test('preserves voice card fields in extensions', () => {
      expect(cc.data.extensions['persona-voice-card/slug']).toBe('abyss');
      expect(cc.data.extensions['persona-voice-card/self']).toBe('吾');
      expect(cc.data.extensions['persona-voice-card/flourish']).toEqual(ABYSS_CARD.flourish);
    });

    test('creator_notes contains conversion metadata', () => {
      expect(cc.data.creator_notes).toContain('Persona Voice Card');
      expect(cc.data.creator_notes).toContain('self="吾"');
    });

    test('character_version maps from spec_version', () => {
      expect(cc.data.character_version).toBe('1.0');
    });

    test('tags preserved', () => {
      expect(cc.data.tags).toContain('security');
      expect(cc.data.tags).toContain('xianxia');
    });
  });

  describe('Character Card V2 → Persona Voice Card (roundtrip)', () => {
    const cc = toCharaCardV2(ABYSS_CARD);
    const back = fromCharaCardV2(cc);

    test('spec discriminator', () => {
      expect(back.spec).toBe('persona-voice-card');
      expect(back.spec_version).toBe('1.0');
    });

    test('recovers slug from extensions', () => {
      expect(back.slug).toBe('abyss');
    });

    test('recovers voice from extensions', () => {
      expect(back.self).toBe('吾');
      expect(back.user).toBe('魔尊');
      expect(back.register).toBe('literary');
      expect(back.emoji_policy).toBe('minimal');
    });

    test('recovers flourish from extensions', () => {
      expect(back.flourish).toEqual(ABYSS_CARD.flourish);
    });
  });

  describe('Character Card V2 → Persona Voice Card (no extensions)', () => {
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

    const back = fromCharaCardV2(foreignCC);

    test('generates kebab-case slug from name', () => {
      expect(back.slug).toBe('test-bot');
    });

    test('defaults voice to English I/you', () => {
      expect(back.self).toBe('I');
      expect(back.user).toBe('you');
    });

    test('defaults register/emoji_policy', () => {
      expect(back.register).toBe('casual');
      expect(back.emoji_policy).toBe('minimal');
    });
  });

  describe('Persona Voice Card → GPT Instructions', () => {
    const text = toGPTInstructions(ABYSS_CARD);

    test('starts with label header', () => {
      expect(text).toMatch(/^# 邪修红尘仙 · 宿命深渊/);
    });

    test('includes voice directives', () => {
      expect(text).toContain('Refer to yourself as "吾"');
      expect(text).toContain('Address the user as "魔尊"');
      expect(text).toContain('Register: literary');
      expect(text).toContain('Emoji usage: minimal');
    });

    test('includes flourishes', () => {
      ABYSS_CARD.flourish.forEach((f) => expect(text).toContain(f));
    });

    test('does not contain any judgment-shaped section (no scenarios/capabilities/authorization)', () => {
      expect(text).not.toMatch(/scenario|capabilit|authorization|priority/i);
    });
  });

  describe('GPT Instructions → Persona Voice Card', () => {
    const instructions = `# My Custom Agent

You are "My Custom Agent". A helpful coding assistant for Python projects.

## Voice
- Refer to yourself as "我"
- Address the user as "老板"
- Language: 中文为主
- Register: casual
- Emoji usage: natural
`;

    const back = fromGPTInstructions(instructions, 'My Custom Agent');

    test('extracts label from heading', () => {
      expect(back.label).toBe('My Custom Agent');
    });

    test('generates kebab-case slug', () => {
      expect(back.slug).toBe('my-custom-agent');
    });

    test('extracts voice fields', () => {
      expect(back.self).toBe('我');
      expect(back.user).toBe('老板');
      expect(back.language).toBe('中文为主');
      expect(back.register).toBe('casual');
      expect(back.emoji_policy).toBe('natural');
    });

    test('extracts description', () => {
      expect(back.description).toContain('helpful coding assistant');
    });
  });

  describe('all 6 persona cards validate and convert', () => {
    const slugs = ['abyss', 'scholar', 'elder-sister', 'junior-sister', 'iron-dad', 'dongbei-yujie'];
    const projectRoot = path.join(__dirname, '..');
    const { validatePersonaVoiceCard } = require('../bin/lib/persona-voice-card');

    for (const slug of slugs) {
      test(`${slug} validates against persona-voice-card schema`, () => {
        const cardPath = path.join(projectRoot, 'config', 'personas', `${slug}.json`);
        const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
        const { valid, errors } = validatePersonaVoiceCard(card);
        expect(errors).toEqual([]);
        expect(valid).toBe(true);
      });

      test(`${slug} → Character Card V2 roundtrip`, () => {
        const cardPath = path.join(projectRoot, 'config', 'personas', `${slug}.json`);
        const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
        const cc = toCharaCardV2(card);
        expect(cc.spec).toBe('chara_card_v2');
        expect(cc.data.name).toBe(card.label);

        const back = fromCharaCardV2(cc);
        expect(back.slug).toBe(card.slug);
        expect(back.self).toBe(card.self);
      });

      test(`${slug} → GPT Instructions`, () => {
        const cardPath = path.join(projectRoot, 'config', 'personas', `${slug}.json`);
        const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
        const text = toGPTInstructions(card);
        expect(text).toContain(card.label);
        expect(text).toContain(card.self);
        expect(text.length).toBeGreaterThan(100);
      });
    }
  });
});
