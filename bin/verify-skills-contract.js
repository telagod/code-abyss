'use strict';

const path = require('path');
const { collectSkills } = require('./lib/skill-registry');

function resolveSkillsDir() {
  return process.env.SAGE_SKILLS_DIR
    ? path.resolve(process.env.SAGE_SKILLS_DIR)
    : path.join(__dirname, '..', 'personal-skill-system', 'skills');
}

function main() {
  const skillsDir = resolveSkillsDir();
  const skills = collectSkills(skillsDir);
  console.log(`技能契约验证通过: ${skills.length} skills`);
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
