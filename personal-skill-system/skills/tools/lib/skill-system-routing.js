'use strict';

const EXPLICIT_HINTS = [
  'use ',
  'run ',
  'invoke ',
  'execute ',
  'using ',
  'please use ',
  'please run ',
  'please execute ',
  '\u4f7f\u7528',
  '\u8fd0\u884c',
  '\u6267\u884c',
  '\u8c03\u7528',
  '\u8bf7\u7528',
  '\u8bf7\u8fd0\u884c',
  '\u8bf7\u6267\u884c'
];

const INTENT_SIGNAL_MAP = {
  validate: [
    'validate',
    'verify',
    'scan',
    'audit',
    'check',
    'gate',
    'lint',
    'test',
    '\u6821\u9a8c',
    '\u626b\u63cf',
    '\u5ba1\u8ba1',
    '\u68c0\u67e5'
  ],
  execute: [
    'implement',
    'fix',
    'bug',
    'debug',
    'investigate',
    'refactor',
    'build',
    'develop',
    '\u4fee\u590d',
    '\u7f3a\u9677',
    '\u6392\u67e5',
    '\u91cd\u6784'
  ],
  design: [
    'design',
    'architecture',
    'boundary',
    'strategy',
    'plan',
    'ui',
    'ux',
    '\u8bbe\u8ba1',
    '\u67b6\u6784',
    '\u7b56\u7565'
  ],
  knowledge: [
    'explain',
    'why',
    'what',
    'how',
    'guide',
    'reference',
    '\u4ec0\u4e48',
    '\u4e3a\u4ec0\u4e48',
    '\u600e\u4e48',
    '\u6559\u7a0b'
  ],
  orchestrate: [
    'orchestration',
    'coordination',
    'decompose',
    'decomposition',
    'parallel',
    'multi-agent',
    '\u7f16\u6392',
    '\u534f\u540c',
    '\u5e76\u884c'
  ],
  release: [
    'release',
    'deploy',
    'ship',
    'merge',
    'promotion',
    'pre-merge',
    'pre-commit',
    '\u53d1\u5e03',
    '\u90e8\u7f72',
    '\u5408\u5e76'
  ]
};

function escapeRegExp(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasCjk(input) {
  return /[\u4e00-\u9fff]/.test(String(input || ''));
}

function containsSignal(queryLower, rawValue) {
  const value = String(rawValue || '').trim().toLowerCase();
  if (!value) return false;

  if (hasCjk(value)) {
    return queryLower.includes(value);
  }

  const pattern = `(^|[^a-z0-9-])${escapeRegExp(value)}([^a-z0-9-]|$)`;
  return new RegExp(pattern).test(queryLower);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeThreshold(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function collectSignalHits(queryLower, signals) {
  const list = Array.isArray(signals) ? signals : [];
  return list.filter(signal => containsSignal(queryLower, signal));
}

function isExplicitMention(queryLower, token, allowLoose) {
  const value = String(token || '').trim().toLowerCase();
  if (!value || !containsSignal(queryLower, value)) return false;

  if (hasCjk(value)) {
    const cjkPatterns = [
      `\u4f7f\u7528${value}`,
      `\u8fd0\u884c${value}`,
      `\u6267\u884c${value}`,
      `\u8c03\u7528${value}`,
      `\u8bf7\u7528${value}`,
      `\u8bf7\u8fd0\u884c${value}`,
      `\u8bf7\u6267\u884c${value}`
    ];
    if (cjkPatterns.some(pattern => queryLower.includes(pattern))) return true;
    return allowLoose;
  }

  const explicitRegex = new RegExp(`\\b(use|run|invoke|execute|using|call)\\s+${escapeRegExp(value)}\\b`);
  if (explicitRegex.test(queryLower)) return true;

  if (EXPLICIT_HINTS.some(hint => queryLower.includes(hint) && containsSignal(queryLower, value))) return true;

  if (!allowLoose) return false;
  const startsWithToken = new RegExp(`^${escapeRegExp(value)}([^a-z0-9-]|$)`).test(queryLower);
  return startsWithToken || containsSignal(queryLower, value);
}

function collectMatches(route, queryLower) {
  const activation = route.activation || {};
  const triggerKeywords = Array.isArray(activation['trigger-keywords']) ? activation['trigger-keywords'] : [];
  const negativeKeywords = Array.isArray(activation['negative-keywords']) ? activation['negative-keywords'] : [];
  const aliases = Array.isArray(route.aliases) ? route.aliases : [];
  const skillName = String(route.skill || '').toLowerCase();

  return {
    skillNameMatch: Boolean(skillName && containsSignal(queryLower, skillName)),
    matchedAliases: aliases.filter(alias => containsSignal(queryLower, alias)),
    matchedKeywords: triggerKeywords.filter(keyword => containsSignal(queryLower, keyword)),
    matchedNegatives: negativeKeywords.filter(keyword => containsSignal(queryLower, keyword))
  };
}

function detectExplicitInvocation(route, queryLower, matches) {
  const activation = route.activation || {};
  const requiresExplicit = Boolean(activation['requires-explicit-invocation']);
  const allowLooseMention = !requiresExplicit;
  const skillName = String(route.skill || '').toLowerCase();

  if (matches.skillNameMatch && isExplicitMention(queryLower, skillName, allowLooseMention)) {
    return { matched: true, via: 'skill', token: route.skill, requiresExplicit };
  }

  for (const alias of matches.matchedAliases) {
    if (isExplicitMention(queryLower, alias, allowLooseMention)) {
      return { matched: true, via: 'alias', token: alias, requiresExplicit };
    }
  }

  if (requiresExplicit) {
    const triggerKeywords = Array.isArray(activation['trigger-keywords']) ? activation['trigger-keywords'] : [];
    for (const keyword of triggerKeywords) {
      if (isExplicitMention(queryLower, keyword, false)) {
        return { matched: true, via: 'keyword', token: keyword, requiresExplicit };
      }
    }
  }

  return { matched: false, via: 'none', token: null, requiresExplicit };
}

function scoreRoute(route, scoring, matches) {
  const basePriority = Number(route.priority || 0);
  const exactMatchBonus = matches.skillNameMatch ? Number(scoring['exact-match'] || 0) : 0;
  const aliasBonus = matches.matchedAliases.length * Number(scoring['alias-match'] || 0);
  const keywordBonus = matches.matchedKeywords.length * Number(scoring['keyword-hit'] || 0);
  const negativePenalty = matches.matchedNegatives.length * Number(scoring['negative-hit'] || 0);
  const total = basePriority + exactMatchBonus + aliasBonus + keywordBonus + negativePenalty;

  return { basePriority, exactMatchBonus, aliasBonus, keywordBonus, negativePenalty, total };
}

function inferQueryIntents(queryLower) {
  const tags = [];
  for (const [tag, signals] of Object.entries(INTENT_SIGNAL_MAP)) {
    if (signals.some(signal => containsSignal(queryLower, signal))) tags.push(tag);
  }

  if (!tags.length && /[?？]/.test(queryLower)) {
    tags.push('knowledge');
  }

  return tags;
}

function computeSemanticSignals(route, queryLower, queryIntents, matches, explicit) {
  const rationale = route.rationale || {};
  const activation = route.activation || {};
  const winsWhen = Array.isArray(rationale['wins-when']) ? rationale['wins-when'] : [];
  const avoidWhen = Array.isArray(rationale['avoid-when']) ? rationale['avoid-when'] : [];
  const intentTags = Array.isArray(activation['intent-tags']) ? activation['intent-tags'] : [];

  const matchedWins = collectSignalHits(queryLower, winsWhen);
  const matchedAvoid = collectSignalHits(queryLower, avoidWhen);
  const matchedIntents = intentTags.filter(tag => queryIntents.includes(tag));
  const requiresExplicitWithoutInvocation = Boolean(activation['requires-explicit-invocation']) && !explicit.matched;

  const winsBonus = Math.min(3, matchedWins.length) * 12;
  const intentBonus = Math.min(2, matchedIntents.length) * 16;
  const avoidPenalty = Math.min(3, matchedAvoid.length) * 10;
  const negativePenalty = Math.min(3, matches.matchedNegatives.length) * 8;
  const explicitPenalty = requiresExplicitWithoutInvocation ? 18 : 0;
  const total = winsBonus + intentBonus - avoidPenalty - negativePenalty - explicitPenalty;

  return {
    matchedWins,
    matchedAvoid,
    matchedIntents,
    requiresExplicitWithoutInvocation,
    winsBonus,
    intentBonus,
    avoidPenalty,
    negativePenalty,
    explicitPenalty,
    conflictPenalty: 0,
    conflictSignals: [],
    total
  };
}

function applyConflictPenalty(candidates) {
  const bySkill = new Map(candidates.map(candidate => [candidate.skill, candidate]));
  for (const candidate of candidates) {
    const conflicts = Array.isArray(candidate.route['conflicts-with']) ? candidate.route['conflicts-with'] : [];
    let penalty = 0;
    const conflictSignals = [];

    for (const conflictSkill of conflicts) {
      const peer = bySkill.get(conflictSkill);
      if (!peer || peer.positiveSignals <= 0) continue;
      const gap = Math.abs(candidate.rerankScore - peer.rerankScore);
      if (gap <= 16) {
        penalty += 6;
        conflictSignals.push({ skill: peer.skill, gap });
      }
    }

    candidate.semantic.conflictPenalty = penalty;
    candidate.semantic.conflictSignals = conflictSignals;
    candidate.semantic.total -= penalty;
    candidate.rerankScore -= penalty;
  }
}

function assessCandidateConfidence(candidate, runnerUp, defaultThreshold) {
  const profile = candidate.route.confidence || {};
  const minimumScore = normalizeThreshold(profile['minimum-score'], defaultThreshold);
  const strongScore = normalizeThreshold(profile['strong-score'], clamp(minimumScore + 15, 0, 100));
  const veryStrongScore = normalizeThreshold(profile['very-strong-score'], clamp(strongScore + 12, 0, 100));

  const matchScore =
    (candidate.matches.skillNameMatch ? 20 : 0) +
    Math.min(2, candidate.matches.matchedAliases.length) * 15 +
    Math.min(4, candidate.matches.matchedKeywords.length) * 8;

  const semanticScore =
    Math.min(3, candidate.semantic.matchedWins.length) * 7 +
    Math.min(2, candidate.semantic.matchedIntents.length) * 12;

  const penaltyScore =
    Math.min(3, candidate.matches.matchedNegatives.length) * 10 +
    Math.min(3, candidate.semantic.matchedAvoid.length) * 8 +
    (candidate.semantic.requiresExplicitWithoutInvocation ? 20 : 0);

  let competitivePenalty = 0;
  const margin = runnerUp ? candidate.rerankScore - runnerUp.rerankScore : null;
  if (runnerUp && runnerUp.positiveSignals > 0) {
    if (margin <= 6) competitivePenalty += 12;
    else if (margin <= 12) competitivePenalty += 6;
  }

  const explicitBonus = candidate.explain.explicit.matched ? 35 : 0;
  const baseSignal = candidate.positiveSignals > 0 ? 18 + Math.min(3, candidate.positiveSignals) * 4 : 0;
  const rerankEvidence = Math.max(0, candidate.rerankScore - Number(candidate.route.priority || 0));
  const rerankEvidenceBonus = Math.min(25, Math.round(rerankEvidence * 0.5));
  let score = clamp(
    Math.round(baseSignal + explicitBonus + matchScore + semanticScore + rerankEvidenceBonus - penaltyScore - competitivePenalty),
    0,
    100
  );

  if (candidate.semantic.requiresExplicitWithoutInvocation) {
    score = Math.min(score, Math.max(0, minimumScore - 1));
  }

  const band = score >= veryStrongScore
    ? 'very-strong'
    : score >= strongScore
      ? 'strong'
      : score >= minimumScore
        ? 'minimum'
        : 'low';

  return {
    score,
    band,
    passedMinimum: score >= minimumScore,
    minimumScore,
    strongScore,
    veryStrongScore,
    requiresFallbackBelowMinimum: Boolean(profile['requires-fallback-below-minimum']),
    marginToRunnerUp: margin
  };
}

function summarizeCandidateReason(candidate) {
  const parts = [];
  const explicit = candidate.explain.explicit;

  if (explicit.matched) parts.push(`explicit=${explicit.via}:${explicit.token}`);
  if (candidate.matches.skillNameMatch) parts.push('skill-name-match');
  if (candidate.matches.matchedAliases.length) parts.push(`aliases=${candidate.matches.matchedAliases.join(',')}`);
  if (candidate.matches.matchedKeywords.length) parts.push(`keywords=${candidate.matches.matchedKeywords.slice(0, 5).join(',')}`);
  if (candidate.semantic.matchedIntents.length) parts.push(`intents=${candidate.semantic.matchedIntents.join(',')}`);
  if (candidate.semantic.matchedWins.length) parts.push(`wins=${candidate.semantic.matchedWins.slice(0, 3).join(',')}`);
  if (candidate.semantic.matchedAvoid.length) parts.push(`avoid=${candidate.semantic.matchedAvoid.slice(0, 3).join(',')}`);
  if (candidate.semantic.requiresExplicitWithoutInvocation) parts.push('requires-explicit-without-explicit');
  if (candidate.semantic.conflictSignals.length) parts.push(`conflicts=${candidate.semantic.conflictSignals.map(item => `${item.skill}:${item.gap}`).join(',')}`);

  parts.push(`heuristic=${candidate.score}`);
  parts.push(`rerank=${candidate.rerankScore}`);
  parts.push(`confidence=${candidate.confidenceAssessment.score}`);
  return parts.join(' | ');
}

function sortCandidates(list) {
  return [...list].sort((a, b) => {
    return b.rerankScore - a.rerankScore
      || b.score - a.score
      || b.positiveSignals - a.positiveSignals
      || String(a.skill).localeCompare(String(b.skill));
  });
}

function generateRouteCandidates(query, routeMap) {
  const queryLower = String(query || '').toLowerCase();
  const routes = Array.isArray(routeMap.routes) ? routeMap.routes : [];
  const scoring = routeMap.scoring || {};
  const threshold = Number(routeMap['default-threshold'] || 0);
  const queryIntents = inferQueryIntents(queryLower);

  const candidates = routes.map(route => {
    const matches = collectMatches(route, queryLower);
    const explicit = detectExplicitInvocation(route, queryLower, matches);
    const scoreBreakdown = scoreRoute(route, scoring, matches);
    const positiveSignals = (matches.skillNameMatch ? 1 : 0) + matches.matchedAliases.length + matches.matchedKeywords.length;
    const semantic = computeSemanticSignals(route, queryLower, queryIntents, matches, explicit);

    const candidate = {
      route,
      skill: route.skill,
      kind: route.kind,
      score: scoreBreakdown.total,
      rerankScore: scoreBreakdown.total + semantic.total,
      threshold,
      positiveSignals,
      thresholdPassed: positiveSignals > 0 && scoreBreakdown.total >= threshold,
      matches,
      explain: { explicit, inferredIntents: queryIntents },
      scoreBreakdown,
      semantic,
      rationale: route.rationale || null,
      confidence: route.confidence || null,
      fallback: route.fallback || null
    };

    candidate.confidenceAssessment = assessCandidateConfidence(candidate, null, threshold);
    return candidate;
  });

  applyConflictPenalty(candidates);

  for (const candidate of candidates) {
    candidate.confidenceAssessment = assessCandidateConfidence(candidate, null, threshold);
    candidate.reason = summarizeCandidateReason(candidate);
  }

  return sortCandidates(candidates);
}

function buildFallbackDecision(selected, confidence, modeOverride) {
  const fallback = selected.fallback || {};
  const mode = modeOverride || fallback.mode || 'ask-one-question';
  return {
    required: true,
    mode,
    clarifyQuestion: fallback['clarify-question'] || null,
    defaultAction: fallback['default-action'] || null,
    safeSkill: fallback['safe-skill'] || null,
    forSkill: selected.skill,
    confidenceScore: confidence.score,
    minimumScore: confidence.minimumScore
  };
}

function selectBestRouteCandidate(candidates, routeMap) {
  const sorted = sortCandidates(Array.isArray(candidates) ? candidates : []);
  const threshold = Number((routeMap || {})['default-threshold'] || 0);

  const explicitCandidates = sorted.filter(item => item.explain.explicit.matched);
  if (explicitCandidates.length) {
    const explicitSorted = [...explicitCandidates].sort((a, b) => {
      const aRequires = a.explain.explicit.requiresExplicit ? 1 : 0;
      const bRequires = b.explain.explicit.requiresExplicit ? 1 : 0;
      return bRequires - aRequires || b.rerankScore - a.rerankScore || String(a.skill).localeCompare(String(b.skill));
    });

    const selected = explicitSorted[0];
    const runnerUp = explicitSorted[1] || sorted.find(item => item.skill !== selected.skill) || null;
    selected.confidenceAssessment = assessCandidateConfidence(selected, runnerUp, threshold);
    return {
      selected,
      selectedSkill: selected.skill,
      selectionReason: `explicit invocation precedence (${selected.explain.explicit.via}:${selected.explain.explicit.token})`,
      fallback: { required: false, mode: null, clarifyQuestion: null, defaultAction: null, safeSkill: null }
    };
  }

  const eligible = sorted.filter(item => item.positiveSignals > 0 && item.score >= threshold);
  if (!eligible.length) {
    return {
      selected: null,
      selectedSkill: null,
      selectionReason: 'no candidate exceeded threshold',
      fallback: { required: false, mode: null, clarifyQuestion: null, defaultAction: null, safeSkill: null }
    };
  }

  const selected = eligible[0];
  const runnerUp = eligible[1] || null;
  selected.confidenceAssessment = assessCandidateConfidence(selected, runnerUp, threshold);
  const confidence = selected.confidenceAssessment;

  if (!confidence.passedMinimum && confidence.requiresFallbackBelowMinimum) {
    const fallback = buildFallbackDecision(selected, confidence);
    return {
      selected,
      selectedSkill: null,
      selectionReason: `confidence ${confidence.score} below minimum ${confidence.minimumScore}; fallback '${fallback.mode}'`,
      fallback
    };
  }

  return {
    selected,
    selectedSkill: selected.skill,
    selectionReason: `semantic rerank winner (${selected.rerankScore}) with confidence ${confidence.score}`,
    fallback: { required: false, mode: null, clarifyQuestion: null, defaultAction: null, safeSkill: null }
  };
}

function explainRouteSelection(query, routeMap) {
  const candidates = generateRouteCandidates(query, routeMap);
  const decision = selectBestRouteCandidate(candidates, routeMap);

  return {
    query,
    inferredIntents: candidates[0] ? candidates[0].explain.inferredIntents : [],
    selectedSkill: decision.selectedSkill,
    selectionReason: decision.selectionReason,
    fallback: decision.fallback,
    confidence: decision.selected ? decision.selected.confidenceAssessment : null,
    rankedCandidates: candidates.map(item => ({
      skill: item.skill,
      kind: item.kind,
      score: item.score,
      rerankScore: item.rerankScore,
      positiveSignals: item.positiveSignals,
      thresholdPassed: item.thresholdPassed,
      explicitInvocation: item.explain.explicit,
      matched: {
        skillName: item.matches.skillNameMatch,
        aliases: item.matches.matchedAliases,
        keywords: item.matches.matchedKeywords,
        negativeKeywords: item.matches.matchedNegatives
      },
      semantic: {
        matchedIntents: item.semantic.matchedIntents,
        matchedWins: item.semantic.matchedWins,
        matchedAvoid: item.semantic.matchedAvoid,
        requiresExplicitWithoutInvocation: item.semantic.requiresExplicitWithoutInvocation,
        conflictSignals: item.semantic.conflictSignals,
        score: item.semantic.total
      },
      confidence: item.confidenceAssessment,
      scoreBreakdown: item.scoreBreakdown,
      reason: item.reason
    }))
  };
}

function chooseRouteFromFixtures(query, routeMap) {
  return explainRouteSelection(query, routeMap).selectedSkill;
}

function validateRouteMap(targetDir, routeMapPath, routeMapData, registryNames, skillRecords, moduleNames, findings, rel) {
  const routes = Array.isArray(routeMapData && routeMapData.routes) ? routeMapData.routes : [];
  const routeNames = new Set();

  for (const route of routes) {
    routeNames.add(route.skill);
    if (!registryNames.has(route.skill)) {
      findings.push({ severity: 'error', file: rel(targetDir, routeMapPath), message: `route map references unknown skill '${route.skill}'` });
    }

    if (Array.isArray(route['auto-chain'])) {
      for (const chained of route['auto-chain']) {
        if (!registryNames.has(chained)) {
          findings.push({ severity: 'error', file: rel(targetDir, routeMapPath), message: `route '${route.skill}' auto-chains unknown skill '${chained}'` });
        }
      }
    }

    if (Array.isArray(route['expert-modules'])) {
      for (const moduleName of route['expert-modules']) {
        if (!moduleNames.has(moduleName)) {
          findings.push({ severity: 'error', file: rel(targetDir, routeMapPath), message: `route '${route.skill}' references unknown expert module '${moduleName}'` });
        }
      }
    }
  }

  for (const record of skillRecords) {
    if (record.userInvocable && record.kind !== 'router' && !routeNames.has(record.name)) {
      findings.push({ severity: 'error', file: record.file, message: `user-invocable skill '${record.name}' is missing from route-map.generated.json` });
    }
  }

  if (routes.length !== skillRecords.filter(item => item.userInvocable && item.kind !== 'router').length) {
    findings.push({
      severity: 'warning',
      file: rel(targetDir, routeMapPath),
      message: 'route count does not match the count of routed user-invocable skills'
    });
  }

  return routes;
}

function summarizeTopCandidates(explain, max = 3) {
  const list = Array.isArray(explain.rankedCandidates) ? explain.rankedCandidates.slice(0, max) : [];
  return list.map(item => `${item.skill}(${item.rerankScore ?? item.score})`).join(', ');
}

function parseFixtureExpectations(fixture) {
  const expectedSkill = typeof fixture.expect === 'string' && fixture.expect.trim() ? fixture.expect : null;
  const expectedFallbackMode = typeof fixture['expect-fallback-mode'] === 'string' && fixture['expect-fallback-mode'].trim()
    ? fixture['expect-fallback-mode']
    : null;
  const expectedFallbackQuestionContains = typeof fixture['expect-fallback-question-contains'] === 'string' && fixture['expect-fallback-question-contains'].trim()
    ? fixture['expect-fallback-question-contains'].toLowerCase()
    : null;
  const expectNoFallback = fixture['expect-no-fallback'] === true;

  return {
    expectedSkill,
    expectedFallbackMode,
    expectedFallbackQuestionContains,
    expectNoFallback
  };
}

function validateRouteFixtures(targetDir, fixturesPath, fixturesData, routeMapData, registryNames, findings, rel) {
  const fixtures = Array.isArray(fixturesData && fixturesData.cases) ? fixturesData.cases : [];

  for (const fixture of fixtures) {
    const expectations = parseFixtureExpectations(fixture);
    if (expectations.expectedSkill && !registryNames.has(expectations.expectedSkill)) {
      findings.push({ severity: 'error', file: rel(targetDir, fixturesPath), message: `route fixture '${fixture.name}' expects unknown skill '${expectations.expectedSkill}'` });
      continue;
    }

    const explain = explainRouteSelection(fixture.query, routeMapData || {});
    const predicted = explain.selectedSkill;
    const top = summarizeTopCandidates(explain);

    if (expectations.expectedSkill && predicted !== expectations.expectedSkill) {
      findings.push({
        severity: 'error',
        file: rel(targetDir, fixturesPath),
        message: `route fixture '${fixture.name}' predicted '${predicted || 'none'}' instead of '${expectations.expectedSkill}' (reason: ${explain.selectionReason}; top: ${top || 'none'})`
      });
    }

    if (expectations.expectedFallbackMode) {
      if (!explain.fallback || !explain.fallback.required) {
        findings.push({
          severity: 'error',
          file: rel(targetDir, fixturesPath),
          message: `route fixture '${fixture.name}' expected fallback '${expectations.expectedFallbackMode}' but routing selected '${predicted || 'none'}'`
        });
      } else if (explain.fallback.mode !== expectations.expectedFallbackMode) {
        findings.push({
          severity: 'error',
          file: rel(targetDir, fixturesPath),
          message: `route fixture '${fixture.name}' expected fallback mode '${expectations.expectedFallbackMode}' but got '${explain.fallback.mode || 'none'}'`
        });
      }

      if (!expectations.expectedSkill && predicted !== null) {
        findings.push({
          severity: 'error',
          file: rel(targetDir, fixturesPath),
          message: `route fixture '${fixture.name}' expected no selected skill during fallback, but got '${predicted}'`
        });
      }

      if (expectations.expectedFallbackQuestionContains) {
        const question = String((explain.fallback || {}).clarifyQuestion || '').toLowerCase();
        if (!question.includes(expectations.expectedFallbackQuestionContains)) {
          findings.push({
            severity: 'error',
            file: rel(targetDir, fixturesPath),
            message: `route fixture '${fixture.name}' fallback question did not contain '${expectations.expectedFallbackQuestionContains}'`
          });
        }
      }
    }

    if (expectations.expectNoFallback && explain.fallback && explain.fallback.required) {
      findings.push({
        severity: 'error',
        file: rel(targetDir, fixturesPath),
        message: `route fixture '${fixture.name}' expected direct routing but fallback '${explain.fallback.mode}' was triggered`
      });
    }
  }

  return fixtures;
}

module.exports = {
  chooseRouteFromFixtures,
  explainRouteSelection,
  generateRouteCandidates,
  selectBestRouteCandidate,
  validateRouteMap,
  validateRouteFixtures
};
