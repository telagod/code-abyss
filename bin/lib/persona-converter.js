'use strict';

const { renderPersonaIdentity, REGISTER_SENTENCES, EMOJI_SENTENCES } = require('./persona-voice-card');

// Converts a persona-voice-card (flat: slug/label/self/user/language/register/
// emoji_policy/flourish/...) to/from external character-card formats. There is
// no more identity/behavior/style file content to assemble — the "system
// prompt" a converter needs is exactly what renderPersonaIdentity() already
// produces from the card's own fields.

function slugify(name) {
  return (name || 'imported')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'imported';
}

function toCharaCardV2(card) {
  const systemPrompt = renderPersonaIdentity(card);
  const personality = [REGISTER_SENTENCES[card.register], EMOJI_SENTENCES[card.emoji_policy]]
    .filter(Boolean)
    .join(' ');
  const samplePrompts = card.sample_prompts || [];

  return {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: card.label,
      description: card.description || '',
      personality,
      scenario: '',
      first_mes: samplePrompts[0] || '',
      mes_example: '',
      creator_notes: [
        `Converted from Persona Voice Card v${card.spec_version}`,
        `Voice: self="${card.self}", user="${card.user}"`,
        `Language: ${card.language}`,
      ].join('\n'),
      system_prompt: systemPrompt,
      post_history_instructions: '',
      alternate_greetings: samplePrompts.slice(1),
      tags: card.tags || [],
      creator: card.creator ? card.creator.name : '',
      character_version: card.spec_version,
      extensions: {
        'persona-voice-card/slug': card.slug,
        'persona-voice-card/self': card.self,
        'persona-voice-card/user': card.user,
        'persona-voice-card/language': card.language,
        'persona-voice-card/register': card.register,
        'persona-voice-card/emoji_policy': card.emoji_policy,
        'persona-voice-card/flourish': card.flourish || [],
      },
    },
  };
}

function fromCharaCardV2(cc) {
  const d = cc.data;
  const ext = d.extensions || {};
  const hasVoiceCardExt = ext['persona-voice-card/self'] !== undefined;

  return {
    spec: 'persona-voice-card',
    spec_version: '1.0',
    slug: ext['persona-voice-card/slug'] || slugify(d.name),
    label: d.name,
    description: d.description || '',
    self: hasVoiceCardExt ? ext['persona-voice-card/self'] : 'I',
    user: hasVoiceCardExt ? ext['persona-voice-card/user'] : 'you',
    language: hasVoiceCardExt ? ext['persona-voice-card/language'] : 'English',
    register: ext['persona-voice-card/register'] || 'casual',
    emoji_policy: ext['persona-voice-card/emoji_policy'] || 'minimal',
    flourish: ext['persona-voice-card/flourish'] || [],
    creator: d.creator ? { name: d.creator } : undefined,
    license: 'MIT',
    tags: d.tags || [],
  };
}

function toGPTInstructions(card) {
  const parts = [];

  parts.push(`# ${card.label}`);
  parts.push('');
  parts.push(`You are "${card.label}". ${card.description || ''}`.trim());
  parts.push('');

  parts.push('## Voice');
  parts.push(`- Refer to yourself as "${card.self}"`);
  parts.push(`- Address the user as "${card.user}"`);
  parts.push(`- Language: ${card.language}`);
  parts.push(`- Register: ${card.register}`);
  parts.push(`- Emoji usage: ${card.emoji_policy}`);
  parts.push('');

  if (card.flourish && card.flourish.length > 0) {
    parts.push('## Flourishes');
    card.flourish.forEach((f) => parts.push(`- ${f}`));
    parts.push('');
  }

  return parts.join('\n');
}

function fromGPTInstructions(text, name) {
  const slug = slugify(name);

  const titleMatch = text.match(/^#\s+(.+)$/m);
  const label = titleMatch ? titleMatch[1].trim() : name || 'Imported Persona';

  const descMatch = text.match(/You are "[^"]*"\.\s*(.+?)(?:\n|$)/);
  const description = descMatch ? descMatch[1].trim().slice(0, 200) : '';

  let self = 'I';
  let user = 'you';
  let language = 'English';
  let register = 'casual';
  let emoji_policy = 'minimal';

  const selfMatch = text.match(/Refer to yourself as "([^"]+)"/);
  if (selfMatch) self = selfMatch[1];
  const userMatch = text.match(/Address the user as "([^"]+)"/);
  if (userMatch) user = userMatch[1];
  const langMatch = text.match(/Language:\s*(.+?)(?:\n|$)/);
  if (langMatch) language = langMatch[1].trim();
  const registerMatch = text.match(/Register:\s*(.+?)(?:\n|$)/);
  if (registerMatch) register = registerMatch[1].trim();
  const emojiMatch = text.match(/Emoji usage:\s*(.+?)(?:\n|$)/);
  if (emojiMatch) emoji_policy = emojiMatch[1].trim();

  return {
    spec: 'persona-voice-card',
    spec_version: '1.0',
    slug,
    label,
    description,
    self,
    user,
    language,
    register,
    emoji_policy,
    flourish: [],
  };
}

module.exports = {
  toCharaCardV2,
  fromCharaCardV2,
  toGPTInstructions,
  fromGPTInstructions,
};
