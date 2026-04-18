'use strict';

function positiveSignalCount(route, queryLower) {
  let hits = 0;
  const skillName = String(route.skill || '').toLowerCase();
  if (skillName && queryLower.includes(skillName)) hits += 1;
  const triggerKeywords = (((route || {}).activation || {})['trigger-keywords']) || [];
  for (const keyword of triggerKeywords) {
    const value = String(keyword || '').trim().toLowerCase();
    if (value && queryLower.includes(value)) hits += 1;
  }
  return hits;
}

function routeHeuristicScore(route, queryLower, scoring) {
  let total = Number(route.priority || 0);
  const skillName = String(route.skill || '').toLowerCase();
  if (skillName && queryLower.includes(skillName)) {
    total += scoring['exact-match'] || 0;
  }

  const activation = route.activation || {};
  const triggerKeywords = activation['trigger-keywords'] || [];
  const negativeKeywords = activation['negative-keywords'] || [];

  for (const keyword of triggerKeywords) {
    const value = String(keyword || '').trim().toLowerCase();
    if (value && queryLower.includes(value)) total += scoring['keyword-hit'] || 0;
  }
  for (const keyword of negativeKeywords) {
    const value = String(keyword || '').trim().toLowerCase();
    if (value && queryLower.includes(value)) total += scoring['negative-hit'] || 0;
  }
  return total;
}

function chooseRouteFromFixtures(query, routeMap) {
  const queryLower = String(query || '').toLowerCase();
  const routes = Array.isArray(routeMap.routes) ? routeMap.routes : [];
  const scoring = routeMap.scoring || {};
  const threshold = Number(routeMap['default-threshold'] || 0);

  const candidates = routes
    .map(route => ({
      route,
      signals: positiveSignalCount(route, queryLower),
      score: routeHeuristicScore(route, queryLower, scoring)
    }))
    .filter(item => item.signals > 0 && item.score >= threshold)
    .sort((a, b) => b.score - a.score || String(a.route.skill).localeCompare(String(b.route.skill)));

  return candidates.length ? candidates[0].route.skill : null;
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

function validateRouteFixtures(targetDir, fixturesPath, fixturesData, routeMapData, registryNames, findings, rel) {
  const fixtures = Array.isArray(fixturesData && fixturesData.cases) ? fixturesData.cases : [];

  for (const fixture of fixtures) {
    if (!registryNames.has(fixture.expect)) {
      findings.push({ severity: 'error', file: rel(targetDir, fixturesPath), message: `route fixture '${fixture.name}' expects unknown skill '${fixture.expect}'` });
      continue;
    }
    const predicted = chooseRouteFromFixtures(fixture.query, routeMapData || {});
    if (predicted !== fixture.expect) {
      findings.push({
        severity: 'error',
        file: rel(targetDir, fixturesPath),
        message: `route fixture '${fixture.name}' predicted '${predicted || 'none'}' instead of '${fixture.expect}'`
      });
    }
  }

  return fixtures;
}

module.exports = {
  chooseRouteFromFixtures,
  validateRouteMap,
  validateRouteFixtures
};
