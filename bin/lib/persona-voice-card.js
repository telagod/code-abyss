'use strict';

// Persona Voice Card — the single validator + renderer for the persona format.
//
// Design intent (persona system redesign, post persona-architecture-v3): a persona
// is a closed-vocabulary voice record substituted into a code-owned template, never
// a freeform file a persona author controls. Every field is either an enum or a
// length/character-bounded string sized below what a decision table (authorization
// tiers, verification-skip instructions, priority orderings) needs to exist. This
// module is the ONE place that shape is defined and enforced — style-registry.js's
// render path, persona_forge.js's validate/publish commands, and CI all call the
// same validatePersonaVoiceCard()/renderPersonaIdentity() so there is no second
// copy of the rule to drift out of sync.

const SPEC = 'persona-voice-card';
const SPEC_VERSION = '1.0';

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const BANNED_CHARS_RE = /[\n>|#→]/;

const REGISTER_VALUES = ['formal', 'casual', 'literary', 'playful', 'authoritative'];
const EMOJI_POLICY_VALUES = ['none', 'minimal', 'natural', 'abundant'];

const MAX_SELF_USER_LEN = 16;
const MAX_LANGUAGE_LEN = 60;
const MAX_FLOURISH_ITEMS = 2;
const MAX_FLOURISH_ITEM_LEN = 32;
// self(<=16) + user(<=16) + flourish(<=2x32=64) could sum to 96 at the
// per-field caps alone — this budget must sit BELOW that ceiling to do any
// real work; otherwise it's decorative and the per-field caps already imply
// a looser effective bound than the "aggregate" was meant to enforce.
const MAX_AGGREGATE_VOICE_BUDGET = 60; // self + user + Σflourish
const MAX_LABEL_LEN = 60;
const MAX_DESCRIPTION_LEN = 200;
const MAX_TAGS = 20;
const MAX_SAMPLE_PROMPTS = 10;
const MAX_SAMPLE_PROMPT_LEN = 300;

// Fields the RENDER path actually touches. Everything else is UI/picker metadata,
// never dereferenced when building the prompt — kept structurally disjoint so a
// reviewer can tell at a glance which fields can possibly reach the model.
const RENDERED_FIELDS = ['self', 'user', 'language', 'register', 'emoji_policy', 'flourish'];
const UI_ONLY_FIELDS = ['slug', 'label', 'description', 'creator', 'license', 'tags', 'sample_prompts'];
const TOP_LEVEL_FIELDS = new Set(['spec', 'spec_version', ...RENDERED_FIELDS, ...UI_ONLY_FIELDS]);

// Code-owned template sentences. A persona picks one of these via `register` /
// `emoji_policy` — it never writes prose here. This is what makes the identity
// layer a fixed template rather than a freeform file: there is no `{{body}}` or
// `{{content}}` catch-all anywhere in renderPersonaIdentity().
const REGISTER_SENTENCES = {
  formal: '语气正式庄重，用词精确克制。',
  casual: '语气轻松随和，像日常对话。',
  literary: '语气带文采与书卷气，用词讲究。',
  playful: '语气活泼跳脱，带俏皮感。',
  authoritative: '语气沉稳有分量，直接不绕弯。',
};

const EMOJI_SENTENCES = {
  none: '不使用 emoji。',
  minimal: '极少使用 emoji，仅在恰当处点缀。',
  natural: '按对话自然节奏适度使用 emoji。',
  abundant: '较多使用 emoji 增强表现力。',
};

// Used by style-registry.js when a persona file fails validation at render time
// (hand-edited, stale cache, compromised community fork). Never renders
// unvalidated content — falls back to this instead and the caller logs a warning.
const NEUTRAL_FALLBACK_PERSONA = Object.freeze({
  slug: 'neutral-fallback',
  label: '中性回退',
  description: 'Fallback voice used when a persona file fails validation.',
  self: '我',
  user: '你',
  language: '中文为主，术语保留英文',
  register: 'casual',
  emoji_policy: 'minimal',
  flourish: [],
});

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function pushErr(errors, msg) {
  errors.push(msg);
}

// Structural + enum + length + banned-char + aggregate-budget + unknown-key
// validation. Deliberately hand-rolled (no Ajv dependency) — the shape is small
// enough that a ~100-line function is both the schema AND the enforcement,
// with docs/specs/persona-voice-card.schema.json kept as the published mirror
// for external consumers, not as a second source of truth for this repo's own
// enforcement.
function validatePersonaVoiceCard(card) {
  const errors = [];
  if (!card || typeof card !== 'object') {
    return { valid: false, errors: ['persona voice card 不是对象'] };
  }

  Object.keys(card).forEach((k) => {
    if (!TOP_LEVEL_FIELDS.has(k)) pushErr(errors, `未知字段: ${k}（persona voice card 不接受自由字段）`);
  });

  if (card.spec !== SPEC) pushErr(errors, `spec 应为 "${SPEC}"，实际 ${JSON.stringify(card.spec)}`);
  if (!/^\d+\.\d+$/.test(card.spec_version || '')) pushErr(errors, `spec_version 应形如 "1.0"，实际 ${JSON.stringify(card.spec_version)}`);

  if (!isNonEmptyString(card.slug) || !SLUG_RE.test(card.slug) || card.slug.length > 40) {
    pushErr(errors, `slug 必须是 kebab-case 且 ≤40 字符: ${JSON.stringify(card.slug)}`);
  }
  if (!isNonEmptyString(card.label) || card.label.length > MAX_LABEL_LEN) {
    pushErr(errors, `label 必须非空且 ≤${MAX_LABEL_LEN} 字符`);
  }
  if (card.description !== undefined && (typeof card.description !== 'string' || card.description.length > MAX_DESCRIPTION_LEN)) {
    pushErr(errors, `description 必须是字符串且 ≤${MAX_DESCRIPTION_LEN} 字符`);
  }

  ['self', 'user'].forEach((f) => {
    const v = card[f];
    if (!isNonEmptyString(v) || v.length > MAX_SELF_USER_LEN || BANNED_CHARS_RE.test(v)) {
      pushErr(errors, `${f} 必须非空、≤${MAX_SELF_USER_LEN} 字符、且不含换行/>/|/#/→: ${JSON.stringify(v)}`);
    }
  });

  if (!isNonEmptyString(card.language) || card.language.length > MAX_LANGUAGE_LEN || BANNED_CHARS_RE.test(card.language)) {
    pushErr(errors, `language 必须非空、≤${MAX_LANGUAGE_LEN} 字符、且不含换行/>/|/#/→: ${JSON.stringify(card.language)}`);
  }

  if (!REGISTER_VALUES.includes(card.register)) {
    pushErr(errors, `register 必须是 ${REGISTER_VALUES.join('|')} 之一，实际 ${JSON.stringify(card.register)}`);
  }
  if (!EMOJI_POLICY_VALUES.includes(card.emoji_policy)) {
    pushErr(errors, `emoji_policy 必须是 ${EMOJI_POLICY_VALUES.join('|')} 之一，实际 ${JSON.stringify(card.emoji_policy)}`);
  }

  let flourish = [];
  if (card.flourish !== undefined) {
    if (!Array.isArray(card.flourish) || card.flourish.length > MAX_FLOURISH_ITEMS) {
      pushErr(errors, `flourish 必须是数组且最多 ${MAX_FLOURISH_ITEMS} 项`);
    } else {
      flourish = card.flourish;
      flourish.forEach((f, i) => {
        if (typeof f !== 'string' || f.length === 0 || f.length > MAX_FLOURISH_ITEM_LEN || BANNED_CHARS_RE.test(f)) {
          pushErr(errors, `flourish[${i}] 必须非空、≤${MAX_FLOURISH_ITEM_LEN} 字符、且不含换行/>/|/#/→: ${JSON.stringify(f)}`);
        }
      });
    }
  }

  // Aggregate budget closes the "split into individually-compliant array items,
  // reconstruct a table" loophole an adversarial enforceability review found in
  // an earlier candidate design.
  const selfLen = isNonEmptyString(card.self) ? card.self.length : 0;
  const userLen = isNonEmptyString(card.user) ? card.user.length : 0;
  const flourishLen = flourish.reduce((sum, f) => sum + (typeof f === 'string' ? f.length : 0), 0);
  if (selfLen + userLen + flourishLen > MAX_AGGREGATE_VOICE_BUDGET) {
    pushErr(errors, `self+user+flourish 总长 ${selfLen + userLen + flourishLen} 超过预算 ${MAX_AGGREGATE_VOICE_BUDGET}`);
  }

  if (card.creator !== undefined) {
    if (typeof card.creator !== 'object' || card.creator === null || !isNonEmptyString(card.creator.name)) {
      pushErr(errors, 'creator 若存在必须是 { name, url? } 且 name 非空');
    }
  }
  if (card.license !== undefined && typeof card.license !== 'string') {
    pushErr(errors, 'license 若存在必须是字符串');
  }
  if (card.tags !== undefined) {
    if (!Array.isArray(card.tags) || card.tags.length > MAX_TAGS || card.tags.some((t) => typeof t !== 'string')) {
      pushErr(errors, `tags 若存在必须是字符串数组且 ≤${MAX_TAGS} 项`);
    }
  }
  if (card.sample_prompts !== undefined) {
    if (!Array.isArray(card.sample_prompts) || card.sample_prompts.length > MAX_SAMPLE_PROMPTS
      || card.sample_prompts.some((p) => typeof p !== 'string' || p.length > MAX_SAMPLE_PROMPT_LEN)) {
      pushErr(errors, `sample_prompts 若存在必须是字符串数组，≤${MAX_SAMPLE_PROMPTS} 项，每项 ≤${MAX_SAMPLE_PROMPT_LEN} 字符`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// Fixed, allowlisted template — named interpolation only. There is no
// `{{body}}`/`{{content}}` slot here for a persona to write prose into; a
// future edit that tried to add one would be a diff a reviewer sees directly
// in this function, not a silently-reopened prose channel in some data file.
function renderPersonaIdentity(persona) {
  const registerSentence = REGISTER_SENTENCES[persona.register] || '';
  const emojiSentence = EMOJI_SENTENCES[persona.emoji_policy] || '';
  const flourishLines = (persona.flourish || []).map((f) => `> ${f}`).join('\n');

  return [
    '## 人格',
    `自称：${persona.self} ｜ 称呼你：${persona.user} ｜ 语言：${persona.language}`,
    registerSentence,
    emojiSentence,
    flourishLines,
  ].filter(Boolean).join('\n');
}

module.exports = {
  SPEC,
  SPEC_VERSION,
  REGISTER_VALUES,
  EMOJI_POLICY_VALUES,
  REGISTER_SENTENCES,
  EMOJI_SENTENCES,
  RENDERED_FIELDS,
  UI_ONLY_FIELDS,
  MAX_SELF_USER_LEN,
  MAX_LANGUAGE_LEN,
  MAX_FLOURISH_ITEMS,
  MAX_FLOURISH_ITEM_LEN,
  MAX_AGGREGATE_VOICE_BUDGET,
  BANNED_CHARS_RE,
  NEUTRAL_FALLBACK_PERSONA,
  validatePersonaVoiceCard,
  renderPersonaIdentity,
};
