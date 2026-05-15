// bin/lib/ui/icons.js
// Target / persona 图标与提示文案常量

const TARGET_ICONS = { claude: '◆', codex: '◇', gemini: '✦', openclaw: '◈' };

const TARGET_HINTS = {
  claude: 'CLAUDE.md · output-styles · commands · skills',
  codex: 'AGENTS.md · instruction.md · config.toml · skills',
  gemini: 'GEMINI.md · commands · skills',
  openclaw: '~/.openclaw skills · workspace AGENTS/SOUL',
};

const PERSONA_ICONS = { male: '♂', female: '♀', other: '⚧' };

module.exports = { TARGET_ICONS, TARGET_HINTS, PERSONA_ICONS };
