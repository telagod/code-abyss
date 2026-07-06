const I18N = {
  en: {
    'site.title': 'Code Abyss — Personality, depth, and a security spine',
    'site.desc': 'Composable persona + style + 30 engineering skills with 4 native security domains and a self-evolution forge. For Claude Code, Codex, Gemini CLI & OpenClaw. Code graph intelligence is provided by the separate abyss Rust CLI.',
    'nav.how': 'How',
    'nav.security': 'Security',
    'nav.graph': 'Companion',
    'nav.evolve': 'Evolve',
    'nav.personas': 'Personas',
    'nav.spec': 'Spec',
    'nav.install': 'Install',
    'hero.badge': '4.10 — Mythos Kernel · Persona Voice Card',
    'hero.title.1': 'Give your AI agent',
    'hero.title.2': 'a personality.',
    'hero.sub': 'Composable identity, style, and <b>30 engineering skills</b><br>— including <b>4 native security domains</b> and a <b>self-evolution forge</b>.',
    'hero.browse': 'Browse Personas',
    'hero.submit': 'Submit Yours',
    'hero.runs': 'Runs on',
    'how.label': 'Architecture',
    'how.title': 'Voice, judgment, style',
    'how.desc': 'Mix any persona with any style. Judgment is a separate, lazily-invoked layer neither one can override.',
    'how.identity.title': 'Who it sounds like',
    'how.identity.desc': 'Self/user address, language style, register, emoji policy — a closed vocabulary with no field shaped like a decision table.',
    'how.behavior.title': 'How it decides',
    'how.behavior.desc': '9 discipline-kernel bundles, invoked lazily by a thin router — never baked into every prompt, never overridden by voice or style.',
    'how.style.title': 'Output Style',
    'how.style.desc': 'Tone, report skeletons, formatting. Template vars make cross-combo safe.',
    'how.formula.pre': 'personas',
    'how.formula.mid': 'styles',
    'how.formula.post': 'validated combos',
    'security.label': 'Security Spine',
    'security.title': 'Four native security domains',
    'security.desc': 'v4 ships <b>4073 lines of original defense engineering</b>, replacing the Apache-2.0 coff0xc upstream. Builders, blue/purple teams, and architects each get their own dedicated skill.',
    'security.app.title': 'defending-applications',
    'security.app.desc': 'Web/API/GraphQL hardening, OAuth/OIDC/JWT/Session, LLM AppSec (prompt injection, RAG poisoning, agent authz). 785 lines.',
    'security.cloud.title': 'securing-cloud-and-supply-chain',
    'security.cloud.desc': 'Container escape defense, K8s RBAC/PSS/NetworkPolicy, SLSA/Sigstore/SBOM, cloud IAM, IaC security. 1246 lines.',
    'security.detect.title': 'detecting-and-responding',
    'security.detect.desc': 'Sigma/YARA rule writing, EDR primitives, NIST 800-61 IR, forensics (Win/Linux/Mac/Cloud), threat hunting. 942 lines.',
    'security.arch.title': 'architecting-security',
    'security.arch.desc': 'STRIDE/PASTA/LINDDUN threat modeling, zero-trust identity (WebAuthn, Kerberos, PAM JIT), SOC2/PCI/HIPAA/GDPR. 1100 lines.',
    'security.cta': 'Browse on GitHub',
    'graph.label': 'Code Intelligence',
    'graph.title': 'Your agent sees code relationships',
    'graph.desc': 'The <code>abyss</code> CLI — a Rust-powered code relationship graph that builds in <b>seconds</b>. Call graph, impact analysis, hotspot detection, change coupling. <b>Zero cloud dependencies.</b>',
    'graph.impact.title': 'Impact Analysis',
    'graph.impact.desc': 'See blast radius before you edit. Direct/transitive callers, affected tests, uncovered paths, risk score.',
    'graph.context.title': 'File Context',
    'graph.context.desc': 'One command returns all callers, dependencies, hotspot score, and coupled files for any file. No function name needed.',
    'graph.hotspot.title': 'Hotspot Map',
    'graph.hotspot.desc': 'Churn × complexity = risk. Find the most dangerous files instantly. Git-powered change coupling detects hidden dependencies.',
    'graph.evolution.title': 'Evolution Trace',
    'graph.evolution.desc': 'Why does this code look the way it does? Commit history, coupled files, churn rate — per function, not just per file.',
    'graph.bench': 'Resolution vs SCIP ground truth:',
    'graph.cta': 'abyss CLI on GitHub',
    'evolve.label': 'Self-Evolution',
    'evolve.title': 'The forge that grows itself',
    'evolve.desc': 'Two meta-skills close the loop. The agent watches for <b>repeated workflows</b> and <b>stable voice patterns</b>, then proposes distillation — never silent. Every output passes a <b>default-deny safety scan</b> before landing.',
    'evolve.skills.desc': 'Distill repeated workflows into reusable skills. Scaffold, lint, scan, improve, promote across L0/L1/L2 tiers. Default-deny on dangerous tools, prompt injection, hardcoded secrets.',
    'evolve.personas.desc': 'Distill a stable self/user address and speech pattern into a Persona Voice Card v1.0. Reuses the existing submit portal — three legal/platform/content red lines enforced.',
    'evolve.l0': 'L0 · Local',
    'evolve.l0.desc': '~/.claude/skills/local/ — explicit invocation only',
    'evolve.l1': 'L1 · Project',
    'evolve.l1.desc': 'repo .claude/skills/ — team-shared, warn-blocking',
    'evolve.l2': 'L2 · Community',
    'evolve.l2.desc': 'upstream PR — full block + warn enforced',
    'gallery.label': 'Gallery',
    'gallery.title': 'Persona presets',
    'gallery.desc': 'Six built-in personas. Community submissions open.',
    'spec.label': 'Open Standard',
    'spec.title': 'Persona Voice Card v1.0',
    'spec.desc': 'A closed-vocabulary voice format — not a document.<br>No field shaped like a decision table anywhere in the type.',
    'spec.voice': 'Structured Voice',
    'spec.voice.desc': 'self / user / language / register / emoji_policy',
    'spec.caps': 'Non-invasive by construction',
    'spec.caps.desc': 'additionalProperties:false — no authorization tiers, no priority orderings, nowhere for judgment to hide',
    'spec.scenarios': 'Flourish',
    'spec.scenarios.desc': 'up to 2 short signature phrases — catchphrases, not instructions',
    'spec.portable': 'Portable',
    'spec.portable.desc': 'CharaCard V2, GPT Instructions',
    'spec.read': 'Read the Spec',
    'install.label': 'Get Started',
    'install.title': 'One command away',
    'install.desc': 'Pick your platform. Code Abyss handles auth detection, config merge, and skill installation.',
    'install.alt': 'or',
    'install.tip': 'Mix freely:',
    'install.graph': 'Enable the code-graph engine:',
    'footer.submit': 'Submit Persona',
    'footer.gallery': 'Gallery',
    'submit.label': 'Community',
    'submit.title': 'Submit a Persona',
    'submit.desc': 'Share your Persona Voice Card with the gallery. Reviewed via GitHub Issues.',
    'submit.desc2': 'Three steps: ask your AI to generate it, review, submit as GitHub Issue.',
    'submit.s1.title': 'Ask your AI to generate the persona',
    'submit.s1.desc': 'Copy this prompt and paste it into Claude, ChatGPT, or any AI. Describe your idea where it says [YOUR IDEA]. The AI will output a single persona voice card JSON.',
    'submit.s2.title': 'Review what the AI generated',
    'submit.s2.desc': 'Check the JSON fields against the schema. Add personal touches the AI missed. Make sure the voice feels distinct.',
    'submit.s3.title': 'Submit as GitHub Issue',
    'submit.s3.desc': 'Click the button below. It opens a pre-configured Issue template. Paste your persona voice card JSON into the corresponding field.',
    'submit.open': 'Open Issue Template on GitHub',
    'submit.check.1': 'self and user feel natural',
    'submit.check.2': 'description is a single clear sentence',
    'submit.check.3': 'no field reads as an instruction or a decision rule — voice only',
    'submit.check.4': 'the persona is different from the 6 built-in ones',
    'submit.example.title': 'See a complete example (Stoic Architect)',
    'guide.ai.copy': 'Copy Prompt',
    'guide.ai.tips.title': 'Tips for good results',
    'guide.ai.tips.1': 'Be specific about the character concept -- "grumpy Unix guru" beats "helpful engineer"',
    'guide.ai.tips.2': 'Mention the language you want (English, Chinese, mixed)',
    'guide.ai.tips.3': 'Describe 2-3 example situations and how the persona should react',
  },
  zh: {
    'site.title': 'Code Abyss — 人格、深度，与一根安全脊柱',
    'site.desc': '可组合的人格 + 风格 + 30 项工程技能，含 4 个原生安全领域与自我进化炼炉。支持 Claude Code, Codex, Gemini CLI 和 OpenClaw。代码图谱由独立的 abyss Rust CLI 提供（github.com/telagod/abyss）。',
    'nav.how': '原理',
    'nav.security': '安全',
    'nav.graph': '协同',
    'nav.evolve': '进化',
    'nav.personas': '人格',
    'nav.spec': '规范',
    'nav.install': '安装',
    'hero.badge': '4.10 — mythos 纪律内核 · Persona Voice Card',
    'hero.title.1': '给你的 AI 助手',
    'hero.title.2': '一个人格。',
    'hero.sub': '可组合的身份、风格，与 <b>30 项工程技能</b><br>—— 内含 <b>4 个原生安全领域</b> 与 <b>自我进化炼炉</b>。',
    'hero.browse': '浏览人格',
    'hero.submit': '提交你的',
    'hero.runs': '运行于',
    'how.label': '架构',
    'how.title': '声音、判断、风格',
    'how.desc': '任意人格搭配任意风格。判断是独立的懒加载层，两边都不能覆盖它。',
    'how.identity.title': '听起来像谁',
    'how.identity.desc': '自称/称呼用户、语言风格、语体、emoji 策略——一套封闭词表，没有一个字段能装下决策表。',
    'how.behavior.title': '怎么做决定',
    'how.behavior.desc': '9 个纪律内核 bundle，由一个精简路由懒加载调用——不塞进每次 prompt，也不会被声音或风格覆盖。',
    'how.style.title': '输出风格',
    'how.style.desc': '语气、报告骨架、格式。模板变量保证跨配安全。',
    'how.formula.pre': '个人格',
    'how.formula.mid': '种风格',
    'how.formula.post': '种组合已验证',
    'security.label': '安全脊柱',
    'security.title': '四个原生安全领域',
    'security.desc': 'v4 自带 <b>4073 行原创防御工程内容</b>，取代 Apache-2.0 coff0xc 上游。开发者、蓝紫队、安全架构师各得专属 skill。',
    'security.app.title': 'defending-applications',
    'security.app.desc': 'Web/API/GraphQL 防御、OAuth/OIDC/JWT/Session、LLM AppSec（Prompt 注入、RAG 投毒、Agent 越权）。785 行。',
    'security.cloud.title': 'securing-cloud-and-supply-chain',
    'security.cloud.desc': '容器逃逸、K8s RBAC/PSS/NetworkPolicy、SLSA/Sigstore/SBOM、云 IAM、IaC 安全。1246 行。',
    'security.detect.title': 'detecting-and-responding',
    'security.detect.desc': 'Sigma/YARA 规则编写、EDR 原语、NIST 800-61 IR、取证（Win/Linux/Mac/Cloud）、威胁狩猎。942 行。',
    'security.arch.title': 'architecting-security',
    'security.arch.desc': 'STRIDE/PASTA/LINDDUN 威胁建模、零信任身份（WebAuthn/Kerberos/PAM JIT）、SOC2/PCI/HIPAA/GDPR。1100 行。',
    'security.cta': '在 GitHub 浏览',
    'graph.label': '代码智能',
    'graph.title': '你的 Agent 能看见代码关系了',
    'graph.desc': '<code>abyss</code> CLI —— 一个 Rust 驱动的代码关系图引擎，<b>秒级</b>构建。调用图、影响面分析、热点检测、变更耦合。<b>零云端依赖。</b>',
    'graph.impact.title': '影响面分析',
    'graph.impact.desc': '改之前就知道会炸什么。直接/传递调用方、受影响测试、未覆盖路径、风险评分。',
    'graph.context.title': '文件上下文',
    'graph.context.desc': '一条命令返回任意文件的所有调用方、依赖、热点评分和耦合文件。不需要知道函数名。',
    'graph.hotspot.title': '热点地图',
    'graph.hotspot.desc': '变更频率 × 复杂度 = 风险。秒级定位最危险的文件。Git 变更耦合发现隐藏依赖。',
    'graph.evolution.title': '演化追溯',
    'graph.evolution.desc': '这段代码为什么长这样？提交历史、耦合文件、变更密度——精确到函数级别，不只是文件级。',
    'graph.bench': '对标 SCIP 真值的解析精度：',
    'graph.cta': 'abyss CLI 仓库',
    'evolve.label': '自我进化',
    'evolve.title': '会自己长大的炼炉',
    'evolve.desc': '两枚 meta-skill 闭合循环。Agent 观察 <b>重复方法论</b> 与 <b>稳定声音模式</b>，主动提议沉淀——绝不静默。所有产出都先过 <b>默认拒绝的安全扫描</b>，再行落盘。',
    'evolve.skills.desc': '把重复操作沉淀为可复用 skill。脚手架、lint、扫描、改进、L0/L1/L2 三级升级一体。默认拒绝危险工具、prompt 注入、硬编码密钥。',
    'evolve.personas.desc': '把稳定的自称/称呼用户和语体沉淀为 Persona Voice Card v1.0。复用既有提交门户——三条法律/平台/内容红线强制执行。',
    'evolve.l0': 'L0 · 本地',
    'evolve.l0.desc': '~/.claude/skills/local/ —— 仅显式调用',
    'evolve.l1': 'L1 · 项目',
    'evolve.l1.desc': 'repo .claude/skills/ —— 团队共享，warn 阻断',
    'evolve.l2': 'L2 · 社区',
    'evolve.l2.desc': 'upstream PR —— 全 block + 全 warn 阻断',
    'gallery.label': '画廊',
    'gallery.title': '人格预设',
    'gallery.desc': '六个内置人格预设，社区提交已开放。',
    'spec.label': '开放标准',
    'spec.title': 'Persona Voice Card v1.0',
    'spec.desc': '一个封闭词表的语音格式——不是文档。<br>类型里没有一个字段形状能装下决策表。',
    'spec.voice': '结构化声音',
    'spec.voice.desc': 'self / user / language / register / emoji_policy',
    'spec.caps': '结构性不可侵犯',
    'spec.caps.desc': 'additionalProperties:false——没有授权分级，没有优先级排序，判断内容无处可藏',
    'spec.scenarios': 'Flourish',
    'spec.scenarios.desc': '最多 2 条短签名短语——是口头禅，不是指令',
    'spec.portable': '可移植',
    'spec.portable.desc': 'CharaCard V2, GPT Instructions',
    'spec.read': '阅读规范',
    'install.label': '开始使用',
    'install.title': '一条命令即可',
    'install.desc': '选择你的平台。Code Abyss 自动处理认证检测、配置合并、技能安装。',
    'install.alt': '或',
    'install.tip': '自由混搭：',
    'install.graph': '启用代码图引擎：',
    'footer.submit': '提交人格',
    'footer.gallery': '画廊',
    'submit.label': '社区',
    'submit.title': '提交人格预设',
    'submit.desc': '分享你的 Persona Voice Card。通过 GitHub Issues 审核。',
    'submit.desc2': '三步走：让 AI 帮你生成、检查、提交到 GitHub Issue。',
    'submit.s1.title': '让 AI 帮你生成人格',
    'submit.s1.desc': '复制下方提示词，粘贴到 Claude、ChatGPT 或任意 AI 中。在 [YOUR IDEA] 处填入你的想法。AI 会输出单个人格语音卡 JSON。',
    'submit.s2.title': '检查 AI 生成的内容',
    'submit.s2.desc': '对照 schema 检查 JSON 字段。补充 AI 遗漏的个人风味。确保声音足够独特。',
    'submit.s3.title': '提交为 GitHub Issue',
    'submit.s3.desc': '点击下方按钮，打开预配置的 Issue 模板。把人格语音卡 JSON 粘贴到对应字段即可。',
    'submit.open': '在 GitHub 上打开 Issue 模板',
    'submit.check.1': 'self 和 user 感觉自然',
    'submit.check.2': 'description 是一句清晰的话',
    'submit.check.3': '没有任何字段读起来像指令或判断规则——只有声音',
    'submit.check.4': '和内置的 6 个人格有明显区别',
    'submit.example.title': '查看完整示例（Stoic Architect）',
    'guide.ai.copy': '复制提示词',
    'guide.ai.tips.title': '获得好结果的技巧',
    'guide.ai.tips.1': '描述要具体——「暴躁的 Unix 老炮」比「有帮助的工程师」好',
    'guide.ai.tips.2': '说明你想要的语言（英文、中文、混合）',
    'guide.ai.tips.3': '描述 2-3 个具体场景和人格应该如何反应',
  }
};

function getLang() {
  const hash = location.hash.replace('#', '');
  if (hash === 'zh' || hash === 'en') return hash;
  const nav = navigator.language || '';
  return nav.startsWith('zh') ? 'zh' : 'en';
}

function setLang(lang) {
  location.hash = lang;
  applyLang(lang);
}

function t(key, lang) {
  return (I18N[lang] && I18N[lang][key]) || (I18N.en[key]) || key;
}

function applyLang(lang) {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key, lang);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = val;
    } else if (el.hasAttribute('data-i18n-html')) {
      el.innerHTML = val; // eslint-disable-line -- trusted static i18n strings only
    } else {
      el.textContent = val;
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'), lang);
  });

  document.title = t('site.title', lang);
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = t('site.desc', lang);

  document.querySelectorAll('.lang-switch [data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyLang(getLang());
  window.addEventListener('hashchange', () => applyLang(getLang()));
});
