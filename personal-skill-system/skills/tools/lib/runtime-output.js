'use strict';

function formatFileSuffix(item) {
  return item.file ? ` [${item.file}${item.line_number ? `:${item.line_number}` : ''}]` : '';
}

function printList(label, items, formatter) {
  if (!Array.isArray(items) || items.length === 0) return;
  console.log(`${label}: ${items.length}`);
  for (const item of items.slice(0, 20)) {
    console.log(formatter(item));
  }
}

function printBlock(label, items) {
  if (!Array.isArray(items) || items.length === 0) return;
  console.log(`${label}:`);
  for (const item of items) {
    console.log(`- ${item}`);
  }
}

function printHumanReport(report) {
  const summary = report.summary || '';
  if (report.tool) console.log(`tool: ${report.tool}`);
  if (report.guard) console.log(`guard: ${report.guard}`);
  if (report.mode) console.log(`mode: ${report.mode}`);
  if (report.target) console.log(`target: ${report.target}`);
  if (summary) console.log(`summary: ${summary}`);

  printList('findings', report.findings, item => `- ${item.severity || 'info'}${formatFileSuffix(item)}: ${item.message}`);
  printList('issues', report.issues, item => `- ${item.severity || 'info'}${formatFileSuffix(item)}: ${item.message}`);
  printBlock('blockers', report.blockers);
  printBlock('outputs', report.outputs);
  printBlock('next-steps', report.nextSteps);
}

module.exports = {
  printHumanReport
};
