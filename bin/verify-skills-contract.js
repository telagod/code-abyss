'use strict';

const fs = require('fs');
const path = require('path');
const { collectSkills } = require('./lib/skill-registry');
const { validatePersonaVoiceCard } = require('./lib/persona-voice-card');

function resolveSkillsDir() {
  return process.env.SAGE_SKILLS_DIR
    ? path.resolve(process.env.SAGE_SKILLS_DIR)
    : path.join(__dirname, '..', 'skills');
}

function resolvePersonasDir() {
  return path.join(__dirname, '..', 'config', 'personas');
}

// Persona voice cards are the one authoring surface where non-invasiveness
// depends on a schema gate actually running, not just existing — verify
// every `<slug>.json` here (index.json/_shared are not persona cards).
function verifyPersonas() {
  const personasDir = resolvePersonasDir();
  const files = fs.readdirSync(personasDir).filter((f) => f.endsWith('.json') && f !== 'index.json');
  let checked = 0;
  for (const file of files) {
    const cardPath = path.join(personasDir, file);
    let card;
    try {
      card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
    } catch (e) {
      throw new Error(`${file} 解析失败: ${e.message}`);
    }
    const { valid, errors } = validatePersonaVoiceCard(card);
    if (!valid) {
      throw new Error(`${file} 未通过 persona-voice-card 校验:\n  ${errors.join('\n  ')}`);
    }
    checked += 1;
  }
  return checked;
}

function main() {
  const skillsDir = resolveSkillsDir();
  const skills = collectSkills(skillsDir);
  console.log(`技能契约验证通过: ${skills.length} skills`);
  const personaCount = verifyPersonas();
  console.log(`persona voice card 校验通过: ${personaCount} personas`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { main, resolveSkillsDir };
