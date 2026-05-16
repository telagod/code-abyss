'use strict';

const fs = require('fs');
const path = require('path');

function toCharaCardV2(tpc, opts = {}) {
  const d = tpc.data;
  const identityText = opts.identityContent || '';
  const behaviorText = opts.behaviorContent || '';
  const styleText = opts.styleContent || '';

  const systemPrompt = [identityText, behaviorText, styleText]
    .filter(Boolean)
    .join('\n\n');

  const personality = [
    d.voice.tone,
    d.voice.register ? `Register: ${d.voice.register}` : '',
    d.voice.emoji_policy ? `Emoji: ${d.voice.emoji_policy}` : '',
  ].filter(Boolean).join('. ');

  const scenario = (d.scenarios || [])
    .map(s => `${s.name}: ${s.chain.join(' → ')}`)
    .join('\n');

  return {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: d.display_name,
      description: d.description,
      personality,
      scenario: scenario || '',
      first_mes: (d.conversation_starters && d.conversation_starters[0]) || '',
      mes_example: '',
      creator_notes: [
        `Converted from Tech Persona Card v${tpc.spec_version}`,
        `Voice: self="${d.voice.self}", user="${d.voice.user}"`,
        `Language: ${d.voice.language}`,
        d.capabilities ? `Domains: ${d.capabilities.domains.join(', ')}` : '',
        d.capabilities ? `Level: ${d.capabilities.expertise_level}` : '',
      ].filter(Boolean).join('\n'),
      system_prompt: systemPrompt,
      post_history_instructions: '',
      alternate_greetings: (d.conversation_starters || []).slice(1),
      tags: d.tags || [],
      creator: d.creator ? d.creator.name : '',
      character_version: d.version,
      extensions: {
        'tech-persona-card/name': d.name,
        'tech-persona-card/voice': d.voice,
        'tech-persona-card/capabilities': d.capabilities || null,
        'tech-persona-card/scenarios': d.scenarios || [],
      },
    },
  };
}

function fromCharaCardV2(cc) {
  const d = cc.data;
  const ext = d.extensions || {};
  const tpcVoice = ext['tech-persona-card/voice'];
  const tpcName = ext['tech-persona-card/name'];

  const voice = tpcVoice || {
    self: 'I',
    user: 'you',
    language: 'English',
    tone: d.personality || 'neutral',
  };

  return {
    spec: 'tech-persona-card',
    spec_version: '1.0',
    data: {
      name: tpcName || d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      display_name: d.name,
      description: d.description,
      version: d.character_version || '1.0.0',
      voice,
      identity: 'identity.md',
      capabilities: ext['tech-persona-card/capabilities'] || undefined,
      scenarios: ext['tech-persona-card/scenarios'] || undefined,
      creator: d.creator ? { name: d.creator } : undefined,
      tags: d.tags || [],
      license: 'MIT',
      extensions: {},
    },
  };
}

function toGPTInstructions(tpc, opts = {}) {
  const d = tpc.data;
  const identityText = opts.identityContent || '';
  const behaviorText = opts.behaviorContent || '';
  const styleText = opts.styleContent || '';

  const parts = [];

  parts.push(`# ${d.display_name}`);
  parts.push('');
  parts.push(`You are "${d.display_name}". ${d.description}`);
  parts.push('');

  parts.push('## Voice');
  parts.push(`- Refer to yourself as "${d.voice.self}"`);
  parts.push(`- Address the user as "${d.voice.user}"`);
  parts.push(`- Language: ${d.voice.language}`);
  parts.push(`- Tone: ${d.voice.tone}`);
  if (d.voice.register) parts.push(`- Register: ${d.voice.register}`);
  if (d.voice.emoji_policy) parts.push(`- Emoji usage: ${d.voice.emoji_policy}`);
  parts.push('');

  if (identityText) {
    parts.push('## Identity');
    parts.push(identityText.trim());
    parts.push('');
  }

  if (behaviorText) {
    parts.push('## Behavioral Rules');
    parts.push(behaviorText.trim());
    parts.push('');
  }

  if (styleText) {
    parts.push('## Output Style');
    parts.push(styleText.trim());
    parts.push('');
  }

  if (d.scenarios && d.scenarios.length > 0) {
    parts.push('## Scenarios');
    for (const s of d.scenarios) {
      parts.push(`### ${s.name}`);
      parts.push(`Triggers: ${s.triggers.join(', ')}`);
      parts.push(`Chain: ${s.chain.join(' → ')}`);
      if (s.priority) parts.push(`Priority: ${s.priority}`);
      parts.push('');
    }
  }

  if (d.capabilities) {
    parts.push('## Capabilities');
    if (d.capabilities.domains) {
      parts.push(`Domains: ${d.capabilities.domains.join(', ')}`);
    }
    if (d.capabilities.expertise_level) {
      parts.push(`Expertise: ${d.capabilities.expertise_level}`);
    }
    parts.push('');
  }

  return parts.join('\n');
}

function fromGPTInstructions(text, name) {
  const slug = (name || 'imported')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const titleMatch = text.match(/^#\s+(.+)$/m);
  const displayName = titleMatch ? titleMatch[1].trim() : name || 'Imported Persona';

  const descMatch = text.match(/You are "[^"]*"\.\s*(.+?)(?:\n|$)/);
  const description = descMatch
    ? descMatch[1].trim().slice(0, 500)
    : 'Imported from GPT Instructions';

  let self = 'I';
  let user = 'you';
  let language = 'English';
  let tone = 'neutral';

  const selfMatch = text.match(/Refer to yourself as "([^"]+)"/);
  if (selfMatch) self = selfMatch[1];
  const userMatch = text.match(/Address the user as "([^"]+)"/);
  if (userMatch) user = userMatch[1];
  const langMatch = text.match(/Language:\s*(.+?)(?:\n|$)/);
  if (langMatch) language = langMatch[1].trim();
  const toneMatch = text.match(/Tone:\s*(.+?)(?:\n|$)/);
  if (toneMatch) tone = toneMatch[1].trim();

  return {
    spec: 'tech-persona-card',
    spec_version: '1.0',
    data: {
      name: slug,
      display_name: displayName,
      description,
      version: '1.0.0',
      voice: { self, user, language, tone },
      identity: 'identity.md',
      extensions: {},
    },
  };
}

function loadCardWithContent(cardPath) {
  const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
  const dir = path.dirname(cardPath);
  const d = card.data;
  const result = { card };

  if (d.identity) {
    const p = path.join(dir, d.identity);
    result.identityContent = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  }
  if (d.behavior) {
    const p = path.join(dir, d.behavior);
    result.behaviorContent = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  }
  if (d.style) {
    const p = path.join(dir, d.style);
    result.styleContent = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  }

  return result;
}

module.exports = {
  toCharaCardV2,
  fromCharaCardV2,
  toGPTInstructions,
  fromGPTInstructions,
  loadCardWithContent,
};
