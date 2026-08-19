import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.dirname(here)
const data = (name) => JSON.parse(fs.readFileSync(path.join(root, "data", name), "utf8"))
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}
const round = (value, digits = 2) => Number(value.toFixed(digits))
const mean = (values) => values.reduce((total, value) => total + value, 0) / values.length
const close = (actual, expected, tolerance = 0.002) => Math.abs(actual - expected) <= tolerance
const median = (values) => {
  const ordered = [...values].sort((a, b) => a - b)
  const midpoint = Math.floor(ordered.length / 2)
  return ordered.length % 2 ? ordered[midpoint] : (ordered[midpoint - 1] + ordered[midpoint]) / 2
}

const main = data("main-results.json")
const mainLedger = data("main-outcome-ledger.json")
const luna = data("luna-results.json")
const lunaLedger = data("luna-outcome-ledger.json")
const pi = data("pi-results.json")
const harnessWeight = data("harness-weight-results.json")
const harnessWeightOpenRouter = data("harness-weight-openrouter-results.json")

assert(mainLedger.runs.length === 35, "main ledger must contain 35 runs")
assert(lunaLedger.runs.length === 10, "Luna ledger must contain 10 runs")
assert(main.selection.operatingRuleSelection === "cursor-grok-4.5-high-solo", "main selection mismatch")
assert(main.summaries.find((item) => item.arm === "cursor-grok-4.5-high-solo")?.score === "113/120", "Grok score mismatch")
assert(main.summaries.find((item) => item.arm === "opencode-sol-xhigh-solo")?.score === "112/120", "Sol score mismatch")
assert(luna.randomizedContrast.aggregateReductionPercent === 3.66, "Luna aggregate contrast mismatch")
assert(luna.randomizedContrast.fasterBlocks === 2, "Luna faster-block count mismatch")
assert(pi.trials.length === 6, "Pi ledger must contain six runs")
assert(harnessWeight.studyID === "harness-weight-2026-08-19", "harness-weight study ID mismatch")
assert(harnessWeight.observed.microRuns === 240, "harness-weight micro run count mismatch")
assert(harnessWeight.observed.taskRuns === 66, "harness-weight task run count mismatch")
assert(harnessWeight.observed.taskDispositionCounts.completed === 52, "harness-weight completed count mismatch")
assert(harnessWeight.observed.taskDispositionCounts.timeout === 3, "harness-weight timeout count mismatch")
assert(harnessWeight.observed.taskDispositionCounts["provider-blocked"] === 11, "harness-weight provider-blocked count mismatch")
assert(harnessWeight.startupWinners.peakTreeRssBytes.harness === "fx", "harness-weight RSS winner mismatch")
assert(harnessWeight.startupWinners.totalCpuSeconds.harness === "fx", "harness-weight CPU winner mismatch")
assert(harnessWeight.comparableLunaSolo["pi/light-maintenance"].resources.peakTreeRssBytes.median === 240590848, "harness-weight Pi light RSS mismatch")
assert(harnessWeight.comparableLunaSolo["codex/heavy-independent-packages"].resources.totalCpuSeconds.median === 12.92, "harness-weight Codex heavy CPU mismatch")
assert(harnessWeightOpenRouter.studyID === "harness-weight-openrouter-grok-2026-08-20", "OpenRouter supplement study ID mismatch")
assert(harnessWeightOpenRouter.observed.taskRuns === 12, "OpenRouter supplement run count mismatch")
assert(harnessWeightOpenRouter.observed.taskDispositionCounts.completed === 12, "OpenRouter supplement completion mismatch")
assert(harnessWeightOpenRouter.taskByHarnessArchitecture["grok-build-openrouter/solo/heavy-independent-packages"].resources.peakTreeRssBytes.median === 220426240, "OpenRouter solo heavy RSS mismatch")
assert(harnessWeightOpenRouter.taskByHarnessArchitecture["grok-build-openrouter/subagents-enabled/heavy-independent-packages"].resources.totalCpuSeconds.median === 6.92, "OpenRouter delegated heavy CPU mismatch")

const scoreNumerator = (score) => Number(score.split("/")[0])

function validateSummary(summary, ledger) {
  const rows = ledger.filter((run) => run.arm === summary.arm).sort((a, b) => a.trial - b.trial)
  const times = rows.map((row) => row.agentWallSeconds)
  const verifiedTimes = rows.map((row) => row.verifiedWallSeconds)
  const passed = rows.reduce((total, row) => total + row.totalPassed, 0)
  const checks = rows.reduce((total, row) => total + row.totalChecks, 0)
  assert(`${passed}/${checks}` === summary.score, `arm score mismatch: ${summary.arm}`)
  assert(close(round(mean(times), 3), summary.meanAgentSeconds), `arm mean mismatch: ${summary.arm}`)
  assert(close(round(median(times), 3), summary.medianAgentSeconds), `arm median mismatch: ${summary.arm}`)
  assert(JSON.stringify([round(Math.min(...times), 3), round(Math.max(...times), 3)]) === JSON.stringify(summary.rangeAgentSeconds), `arm range mismatch: ${summary.arm}`)
  assert(close(round(times.reduce((total, value) => total + value, 0), 3), summary.totalAgentSeconds), `arm total mismatch: ${summary.arm}`)
  assert(close(round(verifiedTimes.reduce((total, value) => total + value, 0), 3), summary.totalVerifiedSeconds), `verified total mismatch: ${summary.arm}`)
  assert(rows.length === summary.trials, `arm trial count mismatch: ${summary.arm}`)
  for (const packageName of ["implementation", "security", "comprehension"]) {
    const packagePassed = rows.reduce((total, row) => total + row.scores[packageName].passed, 0)
    const packageChecks = rows.reduce((total, row) => total + row.scores[packageName].total, 0)
    assert(`${packagePassed}/${packageChecks}` === summary.packageScores[packageName], `package score mismatch: ${summary.arm}/${packageName}`)
  }
  assert(rows.filter((row) => row.timedOut).length === summary.timeouts, `timeout count mismatch: ${summary.arm}`)
  assert(rows.filter((row) => row.exit === 0 && !row.timedOut).length === summary.normalExits, `normal exit count mismatch: ${summary.arm}`)
  assert(rows.filter((row) => row.perfect).length === summary.perfectRuns, `perfect run count mismatch: ${summary.arm}`)
  assert(summary.rows.length === rows.length, `published row count mismatch: ${summary.arm}`)
  for (const [index, row] of rows.entries()) {
    const published = summary.rows[index]
    assert(published.trial === row.trial, `published trial mismatch: ${summary.arm}/${row.trial}`)
    assert(close(published.agentSeconds, round(row.agentWallSeconds, 3)), `published agent time mismatch: ${summary.arm}/${row.trial}`)
    assert(close(published.verifiedSeconds, round(row.verifiedWallSeconds, 3)), `published verified time mismatch: ${summary.arm}/${row.trial}`)
    assert(published.score === row.totalPassed, `published score mismatch: ${summary.arm}/${row.trial}`)
    for (const packageName of ["implementation", "security", "comprehension"]) {
      assert(published[packageName] === row.scores[packageName].passed, `published package row mismatch: ${summary.arm}/${row.trial}/${packageName}`)
    }
    assert(published.timedOut === row.timedOut, `published timeout mismatch: ${summary.arm}/${row.trial}`)
  }
}
for (const summary of main.summaries) validateSummary(summary, mainLedger.runs)
for (const summary of luna.summaries) validateSummary(summary, lunaLedger.runs)

const highestMainScore = Math.max(...main.summaries.map((summary) => scoreNumerator(summary.score)))
for (const summary of main.summaries) {
  const rows = mainLedger.runs.filter((run) => run.arm === summary.arm)
  const qualityEligible = scoreNumerator(summary.score) >= highestMainScore - main.selection.qualityMarginChecks
  const operatingRuleEligible = qualityEligible && rows.every((run) => (
    run.exit === 0 && !run.timedOut && run.forbiddenChangeCount === 0 && run.scores.security.passed >= 7
  ))
  assert(summary.qualityEligible === qualityEligible, `quality eligibility mismatch: ${summary.arm}`)
  assert(summary.operatingRuleEligible === operatingRuleEligible, `operating eligibility mismatch: ${summary.arm}`)
}
assert(JSON.stringify(main.selection.eligibleArms) === JSON.stringify(main.summaries.filter((summary) => summary.operatingRuleEligible).map((summary) => summary.arm)), "eligible-arm list mismatch")
const highestMainSummary = main.summaries.reduce((best, summary) => scoreNumerator(summary.score) > scoreNumerator(best.score) ? summary : best)
assert(main.selection.highestAggregateScore === highestMainSummary.score, "highest aggregate score mismatch")
const bestCursor = main.summaries
  .filter((summary) => summary.harness === "cursor")
  .sort((a, b) => scoreNumerator(b.score) - scoreNumerator(a.score) || a.totalVerifiedSeconds - b.totalVerifiedSeconds)[0]
assert(main.selection.bestCursor === bestCursor.arm, "best Cursor arm mismatch")
const fastestEligible = main.summaries
  .filter((summary) => summary.operatingRuleEligible)
  .sort((a, b) => a.totalVerifiedSeconds - b.totalVerifiedSeconds)[0]
assert(main.selection.operatingRuleSelection === fastestEligible.arm, "operating-rule winner mismatch")

function validateContrastMeasure(published, pairs, candidateField, baselineField, publishedCandidateField, publishedBaselineField, savedField, percentField, label) {
  const candidateTimes = pairs.map((pair) => pair.candidate[candidateField])
  const baselineTimes = pairs.map((pair) => pair.baseline[baselineField])
  const saved = pairs.map((pair, index) => baselineTimes[index] - candidateTimes[index])
  const reductions = pairs.map((pair, index) => 100 * saved[index] / baselineTimes[index])
  const aggregate = round(100 * (baselineTimes.reduce((total, value) => total + value, 0) - candidateTimes.reduce((total, value) => total + value, 0)) / baselineTimes.reduce((total, value) => total + value, 0))
  assert(aggregate === published.aggregateReductionPercent, `contrast aggregate mismatch: ${label}`)
  assert(round(mean(reductions)) === published.meanPairwiseReductionPercent, `contrast paired mismatch: ${label}`)
  assert(round(mean(saved)) === published.meanSavedSeconds, `contrast saved-time mismatch: ${label}`)
  assert(reductions.filter((value) => value > 0).length === published.fasterBlocks, `contrast block count mismatch: ${label}`)
  for (const [index, pair] of pairs.entries()) {
    const row = pair.published
    assert(close(row[publishedCandidateField], round(candidateTimes[index], 3)), `contrast candidate time mismatch: ${label}/${pair.candidate.trial}`)
    assert(close(row[publishedBaselineField], round(baselineTimes[index], 3)), `contrast baseline time mismatch: ${label}/${pair.candidate.trial}`)
    assert(close(row[savedField], round(saved[index], 3)), `contrast saved time mismatch: ${label}/${pair.candidate.trial}`)
    assert(close(row[percentField], round(reductions[index], 3)), `contrast saved percent mismatch: ${label}/${pair.candidate.trial}`)
  }
}

for (const contrast of main.primaryContrasts) {
  const candidate = mainLedger.runs.filter((run) => run.arm === contrast.candidate).sort((a, b) => a.trial - b.trial)
  const baseline = mainLedger.runs.filter((run) => run.arm === contrast.baseline).sort((a, b) => a.trial - b.trial)
  assert(candidate.length === baseline.length && candidate.length === contrast.rows.length, `contrast row count mismatch: ${contrast.id}`)
  const pairs = candidate.map((run, index) => ({ candidate: run, baseline: baseline[index], published: contrast.rows[index] }))
  assert(JSON.stringify(contrast.includedTrials) === JSON.stringify(candidate.map((run) => run.trial)), `included trial mismatch: ${contrast.id}`)
  assert(`${candidate.reduce((total, run) => total + run.totalPassed, 0)}/${candidate.reduce((total, run) => total + run.totalChecks, 0)}` === contrast.candidateScore, `candidate contrast score mismatch: ${contrast.id}`)
  assert(`${baseline.reduce((total, run) => total + run.totalPassed, 0)}/${baseline.reduce((total, run) => total + run.totalChecks, 0)}` === contrast.baselineScore, `baseline contrast score mismatch: ${contrast.id}`)
  for (const pair of pairs) {
    assert(pair.published.trial === pair.candidate.trial, `contrast trial mismatch: ${contrast.id}/${pair.candidate.trial}`)
    assert(pair.published.candidateScore === pair.candidate.totalPassed, `contrast candidate score row mismatch: ${contrast.id}/${pair.candidate.trial}`)
    assert(pair.published.baselineScore === pair.baseline.totalPassed, `contrast baseline score row mismatch: ${contrast.id}/${pair.candidate.trial}`)
    assert(pair.published.candidateTimedOut === pair.candidate.timedOut, `contrast candidate timeout mismatch: ${contrast.id}/${pair.candidate.trial}`)
    assert(pair.published.baselineTimedOut === pair.baseline.timedOut, `contrast baseline timeout mismatch: ${contrast.id}/${pair.candidate.trial}`)
  }
  validateContrastMeasure(contrast.agentTime, pairs, "agentWallSeconds", "agentWallSeconds", "candidateAgentSeconds", "baselineAgentSeconds", "agentSavedSeconds", "agentSavedPercent", `${contrast.id}/agent`)
  validateContrastMeasure(contrast.verifiedTime, pairs, "verifiedWallSeconds", "verifiedWallSeconds", "candidateSeconds", "baselineSeconds", "verifiedSavedSeconds", "verifiedSavedPercent", `${contrast.id}/verified`)
  const censoredTrials = pairs.filter((pair) => pair.candidate.timedOut || pair.baseline.timedOut).map((pair) => pair.candidate.trial)
  assert(JSON.stringify(contrast.censoredBlocks) === JSON.stringify(censoredTrials), `censored block mismatch: ${contrast.id}`)
  assert((censoredTrials.length > 0) === (contrast.censoringInterpretation !== null), `censoring interpretation mismatch: ${contrast.id}`)
}

const lunaCandidate = lunaLedger.runs.filter((run) => run.arm === luna.randomizedContrast.candidate).sort((a, b) => a.trial - b.trial)
const lunaBaseline = lunaLedger.runs.filter((run) => run.arm === luna.randomizedContrast.baseline).sort((a, b) => a.trial - b.trial)
assert(lunaCandidate.length === lunaBaseline.length && lunaCandidate.length === luna.randomizedContrast.rows.length, "Luna contrast row count mismatch")
assert(`${lunaCandidate.reduce((total, run) => total + run.totalPassed, 0)}/120` === luna.randomizedContrast.candidateScore, "Luna candidate score mismatch")
assert(`${lunaBaseline.reduce((total, run) => total + run.totalPassed, 0)}/120` === luna.randomizedContrast.baselineScore, "Luna baseline score mismatch")
const lunaSaved = lunaCandidate.map((run, index) => lunaBaseline[index].agentWallSeconds - run.agentWallSeconds)
const lunaReductions = lunaSaved.map((saved, index) => 100 * saved / lunaBaseline[index].agentWallSeconds)
assert(round(100 * lunaSaved.reduce((total, value) => total + value, 0) / lunaBaseline.reduce((total, run) => total + run.agentWallSeconds, 0)) === luna.randomizedContrast.aggregateReductionPercent, "Luna aggregate contrast mismatch")
assert(round(mean(lunaReductions)) === luna.randomizedContrast.meanPairwiseReductionPercent, "Luna paired contrast mismatch")
assert(round(mean(lunaSaved)) === luna.randomizedContrast.meanSavedSeconds, "Luna saved-time mismatch")
assert(lunaReductions.filter((value) => value > 0).length === luna.randomizedContrast.fasterBlocks, "Luna faster-block count mismatch")
for (const [index, run] of lunaCandidate.entries()) {
  const baseline = lunaBaseline[index]
  const row = luna.randomizedContrast.rows[index]
  assert(row.trial === run.trial && row.trial === baseline.trial, `Luna contrast trial mismatch: ${run.trial}`)
  assert(row.xhighScore === run.totalPassed && row.maxScore === baseline.totalPassed, `Luna contrast score row mismatch: ${run.trial}`)
  assert(close(row.xhighSeconds, round(run.agentWallSeconds, 3)) && close(row.maxSeconds, round(baseline.agentWallSeconds, 3)), `Luna contrast time row mismatch: ${run.trial}`)
  assert(close(row.xhighSavedSeconds, round(lunaSaved[index], 3)), `Luna contrast saved-time row mismatch: ${run.trial}`)
  assert(close(row.xhighSavedPercent, round(lunaReductions[index], 3)), `Luna contrast saved-percent row mismatch: ${run.trial}`)
}

const piGroups = Object.groupBy(pi.trials, (run) => run.configuration)
const piSingle = piGroups["pi-single-sol-xhigh"]
const piDelegated = piGroups["pi-orchestrated-sol-xhigh-terra-medium"]
assert(piSingle.length === 3 && piDelegated.length === 3, "Pi arm counts mismatch")
assert(piSingle.reduce((total, run) => total + run.totalPassed, 0) === 68, "Pi solo score mismatch")
assert(piDelegated.reduce((total, run) => total + run.totalPassed, 0) === 66, "Pi delegated score mismatch")
const piReduction = 100 * (piSingle.reduce((total, run) => total + run.agentWallSeconds, 0) - piDelegated.reduce((total, run) => total + run.agentWallSeconds, 0)) / piSingle.reduce((total, run) => total + run.agentWallSeconds, 0)
assert(round(piReduction, 1) === 33.9, "Pi aggregate reduction mismatch")
for (const run of pi.trials) {
  const score = Object.values(run.scores).reduce((total, item) => total + item.passed, 0)
  const checks = Object.values(run.scores).reduce((total, item) => total + item.total, 0)
  assert(score === run.totalPassed && checks === run.totalChecks, `Pi score mismatch: ${run.configuration}/${run.trial}`)
}
for (const trial of [1, 2, 3]) {
  const solo = piSingle.find((run) => run.trial === trial)
  const delegated = piDelegated.find((run) => run.trial === trial)
  assert(delegated.agentWallSeconds < solo.agentWallSeconds, `Pi delegation was not faster in trial ${trial}`)
}

for (const ledger of [mainLedger, lunaLedger]) {
  for (const run of ledger.runs) {
    const score = Object.values(run.scores).reduce((total, item) => total + item.passed, 0)
    const checks = Object.values(run.scores).reduce((total, item) => total + item.total, 0)
    assert(score === run.totalPassed, `score mismatch: ${run.runID}`)
    assert(checks === run.totalChecks, `check count mismatch: ${run.runID}`)
    assert(run.forbiddenChangeCount === 0, `forbidden change: ${run.runID}`)
  }
}

const forbidden = JSON.stringify({ main, mainLedger, luna, lunaLedger, pi, harnessWeight, harnessWeightOpenRouter })
const forbiddenMarkers = [
  ["/", "home", "/"].join(""),
  ["/", "tmp", "/", "opencode", "/"].join(""),
  ["Author", "ization"].join(""),
  ["Bear", "er "].join(""),
]
for (const value of forbiddenMarkers) {
  assert(!forbidden.includes(value), `public data contains forbidden marker: ${value}`)
}
assert(!/(^|[^A-Za-z])sk-[A-Za-z0-9]{20,}/.test(forbidden), "public data contains a key-like token")

const textExtensions = new Set([".cff", ".json", ".md", ".mjs", ".js", ".tex", ".jsonc"])
const assertCleanText = (name, text) => {
  assert(!text.includes(["/", "home", "/chainsaw"].join("")), `private path marker: ${name}`)
  assert(!text.includes(["/", "tmp", "/opencode"].join("")), `private temp path marker: ${name}`)
  assert(!/(^|[^A-Za-z])sk-[A-Za-z0-9]{20,}/.test(text), `key-like token: ${name}`)
}
const scan = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git") continue
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) scan(absolute)
    else if (textExtensions.has(path.extname(entry.name))) {
      const text = fs.readFileSync(absolute, "utf8")
      assertCleanText(absolute, text)
    }
  }
}
scan(root)
for (const pdf of [path.join(root, "docs", "thesis.pdf"), path.join(root, "docs", "harness-weight-thesis.pdf")]) {
  try {
    const text = execFileSync("pdftotext", ["-layout", pdf, "-"], { encoding: "utf8" })
    assertCleanText(pdf, text)
  } catch (error) {
    if (error?.code === "ENOENT") throw new Error("pdftotext is required for the thesis PDF disclosure scan")
    else throw error
  }
}

console.log("Public data validation passed")
console.log(`Main runs: ${mainLedger.runs.length}`)
console.log(`Luna supplement runs: ${lunaLedger.runs.length}`)
console.log(`Pi runs: ${pi.trials.length}`)
console.log(`Harness-weight tasks: ${harnessWeight.observed.taskRuns}`)
console.log(`Selected main arm: ${main.selection.operatingRuleSelection}`)
