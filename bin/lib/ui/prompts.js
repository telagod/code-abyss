// bin/lib/ui/prompts.js
// @inquirer/prompts 封装 + 自定义 horizontal select prompt
// 依赖 ansi.js 的 c (color) 工具

const { c } = require('./ansi.js');

const modernPromptTheme = {
  prefix: { idle: c.mag('◆'), done: c.grn('◆') },
  icon: { cursor: c.mag('❯') },
  style: {
    answer: (text) => c.cyn(text),
    message: (text) => c.b(text),
    help: (text) => c.gray(text),
    highlight: (text) => c.mag(c.b(text)),
    description: (text) => c.cyn(text),
    disabled: (text) => c.gray(text),
    disabledChoice: (text) => c.gray(text),
    keysHelpTip: (keys) => c.gray(keys.map(([key, action]) => `${key} ${action}`).join(' · ')),
  },
  indexMode: 'hidden',
};

const modernCheckboxTheme = {
  ...modernPromptTheme,
  icon: {
    cursor: c.mag('❯'),
    checked: c.grn('◉'),
    unchecked: c.gray('○'),
  },
};

async function promptSelect(config) {
  const { select } = await import('@inquirer/prompts');
  return select({
    loop: false,
    pageSize: 10,
    theme: modernPromptTheme,
    instructions: {
      navigation: '↑↓ navigate · enter select',
      pager: '↑↓ navigate · page scroll · enter select',
    },
    ...config,
  });
}

async function promptCheckbox(config) {
  const { checkbox } = await import('@inquirer/prompts');
  return checkbox({
    loop: false,
    pageSize: 8,
    theme: modernCheckboxTheme,
    shortcuts: { all: null, invert: null },
    ...config,
  });
}

let horizontalSelectPrompt = null;

async function promptHorizontalSelect(config) {
  if (!horizontalSelectPrompt) {
    const core = await import('@inquirer/core');
    const ansi = await import('@inquirer/ansi');
    const {
      createPrompt,
      isDownKey,
      isEnterKey,
      isTabKey,
      isUpKey,
      makeTheme,
      useKeypress,
      useMemo,
      usePrefix,
      useState,
    } = core;
    const { cursorHide } = ansi;

    horizontalSelectPrompt = createPrompt((promptConfig, done) => {
      const theme = makeTheme(modernPromptTheme, promptConfig.theme);
      const [status, setStatus] = useState('idle');
      const prefix = usePrefix({ status, theme });
      const choices = useMemo(() => promptConfig.choices.map((choice) => ({
        value: choice.value,
        name: choice.name ?? String(choice.value),
        short: choice.short ?? choice.name ?? String(choice.value),
        description: choice.description,
      })), [promptConfig.choices]);
      const defaultIndex = choices.findIndex(choice => choice.value === promptConfig.default);
      const [active, setActive] = useState(defaultIndex >= 0 ? defaultIndex : 0);
      const selected = choices[active];
      const move = (offset) => setActive((active + offset + choices.length) % choices.length);

      useKeypress((key) => {
        if (isEnterKey(key)) {
          setStatus('done');
          done(selected.value);
        } else if (isTabKey(key) || isDownKey(key)) {
          move(1);
        } else if (isUpKey(key) || key.name === 'left') {
          move(-1);
        } else if (key.name === 'right') {
          move(1);
        }
      });

      const message = theme.style.message(promptConfig.message, status);
      if (status === 'done') {
        return [prefix, message, theme.style.answer(selected.short)].filter(Boolean).join(' ');
      }

      const tabs = choices.map((choice, index) => {
        const label = index === active ? `❯ ${choice.name}` : `  ${choice.name}`;
        return index === active ? theme.style.highlight(`[${label}]`) : theme.style.disabled(`[${label}]`);
      }).join('  ');
      const description = selected.description ? theme.style.description(selected.description) : '';
      const help = theme.style.help('tab/→ next · ↑/← prev · enter select');
      const lines = [
        [prefix, message].filter(Boolean).join(' '),
        tabs,
        description,
        help,
      ].filter(Boolean).join('\n').trimEnd();

      return `${lines}${cursorHide}`;
    });
  }

  return horizontalSelectPrompt(config);
}

module.exports = {
  modernPromptTheme,
  modernCheckboxTheme,
  promptSelect,
  promptCheckbox,
  promptHorizontalSelect,
};
