# Coding-Agent Deployment Study

This repository contains a sanitized public release of a small empirical study comparing
coding-agent deployment configurations. It is not a universal benchmark or a
causal test of "subagents versus no subagents."

Author: [mmdmcy](https://github.com/mmdmcy) · Affiliation: Katteke
Repository: [to-subagent-or-not-to-subagent](https://github.com/mmdmcy/to-subagent-or-not-to-subagent)

The author publishes under the GitHub identity `mmdmcy`. For legal-name
attribution, please contact `mmdmcy` through GitHub.

## Main Result

The August 14 study predeclared and locally froze 35 outcomes in five randomized
complete blocks across seven configurations on one synthetic, separable
JavaScript workload. The source freeze was not externally immutable:

| Configuration | Hidden checks | Mean agent time |
|---|---:|---:|
| Cursor Grok 4.5 high, solo | 113/120 | 109.5 s |
| Cursor Grok 4.6 high, solo | 112/120 | 433.9 s |
| Cursor Grok 4.6 xhigh, solo | 111/120 | 622.8 s |
| OpenCode Sol/xhigh, solo | 112/120 | 486.8 s |
| OpenCode Sol + Terra/medium, bounded | 106/120 | 405.1 s |
| OpenCode Sol + Luna/max, bounded | 110/120 | 949.4 s |
| OpenCode Sol + Luna/max, natural | 110/120 | >=1190.2 s, one timeout |

The frozen quality-first rule selected Cursor Grok 4.5 high solo. It was faster
in all five paired blocks against OpenCode Sol solo and bounded Terra. This is a
personal deployment recommendation for the tested fixture and observation
window, not a claim of universal model superiority.

## Luna Solo Follow-Up

At the user's request, a separate post-hoc supplement ran five randomized blocks
comparing Luna/max solo with Luna/xhigh solo:

| Configuration | Hidden checks | Mean agent time |
|---|---:|---:|
| OpenCode Luna/xhigh, solo | 110/120 | 750.9 s |
| OpenCode Luna/max, solo | 109/120 | 779.4 s |

Luna/xhigh was 3.7% faster in aggregate but faster in only 2/5 blocks; its
descriptive interval crossed zero. Comparisons with historical Grok and Sol
outcomes are non-concurrent and descriptive. They do not change the frozen main
study selection.

## Pi Coverage

Yes, GPT-5.6 models were tested in Pi in the historical August 12-13 study:

- Pi Sol/xhigh solo: 3 trials.
- Pi Sol/xhigh plus three Terra/medium workers: 3 trials.
- Pi provider: native `openai-codex`, Pi 0.80.6.
- Pi result: delegation was faster in all 3 pairs, 33.9% aggregate reduction,
  but delegated quality was 66/72 versus 68/72 for solo.
- GPT-5.6 Luna was not used in any scored Pi arm.

Pi was a conceptual replication, not a full rerun of the later Cursor/OpenCode
matrix.

## Harness Weight Follow-Up

The separate harness-weight study measured local CPU and memory across OpenCode,
Codex CLI, Cursor Agent CLI, Pi, Grok Build, and Vercel fx. It used fresh
`--version`/`--help` startup trials plus light and heavyweight coding tasks.
GPT-5.6 Luna max was used for the matched OpenCode, Codex, Cursor, and Pi task
arms. fx used its native `zai/glm-5.2` model, and Grok Build used Grok 4.6.

The cold-start minimum was fx at approximately 1.47 MB median peak RSS. In the
matched Luna-max solo task subset, Pi had the lowest median process-tree RSS;
Codex used the least heavy-task CPU; and Cursor completed the heavy task fastest.
These are separate endpoints, not one universal harness ranking. fx completed
the light task but timed out on all three heavyweight attempts. Grok Build was
quota-censored after its initial successful requests.

See `docs/harness-weight-report.md`, `docs/harness-weight-thesis.pdf`, and
`data/harness-weight-results.json` for the complete sanitized analysis. See
`docs/harness-weight-replication.md` for exact setup, commands, model choices,
quota dispositions, and validity boundaries.

### OpenRouter Grok Supplement

Because the native Grok Build arm exhausted its free quota, a separate
OpenRouter supplement ran Grok Build with `x-ai/grok-4.6`. All 12 light/heavy
solo/delegated attempts completed. Median heavy-task peak RSS was 220.4 MB for
solo and 307.7 MB for delegated; median scores were 23/24 for both. This is
reported as Grok Build with OpenRouter, not as the native `grok-build` service
or as a Codex CLI result.

See `docs/harness-weight-openrouter-report.md` and
`data/harness-weight-openrouter-results.json` for the supplement.

## Methodological Status

The narrow operational estimand is defensible because the main arms, prompt,
fixture, timeout, order seed, sample, and decision rule were frozen before the
main outcomes; order was randomized within complete blocks; outcomes were
analyzed at the run level; and deviations were retained intention-to-treat.
The freeze was local rather than an externally archived preregistration; current
checks cannot prove that source files were unchanged before execution.

The design cannot establish a pure effect of Cursor, Grok, OpenCode, model
family, reasoning effort, or subagents because these factors are bundled. It is
also limited by one workload, five blocks, sequential execution, unequal model
capacity, narrow hidden checks, and non-OS-enforced isolation. See
`docs/METHODOLOGY-AUDIT.md` before interpreting or citing the result.

## Contents

- `data/main-results.json`: sanitized aggregate main-study results.
- `data/main-outcome-ledger.json`: sanitized per-run main outcomes.
- `data/luna-results.json`: sanitized Luna supplement analysis.
- `data/luna-outcome-ledger.json`: sanitized per-run Luna outcomes.
- `data/pi-results.json`: sanitized historical Pi results.
- `fixture/`: public fixture and public tests; hidden graders are withheld.
- `docs/METHODOLOGY-AUDIT.md`: validity assessment and release boundaries.
- `docs/STUDY-PROTOCOL.md`: public protocol summary.
- `docs/PI-REPLICATION.md`: exact Pi model and arm coverage.
- `docs/RAW-DATA-DISPOSITION.md`: what is withheld and why.
- `docs/study-report.md`: sanitized technical report.
- `docs/thesis.pdf` and `docs/thesis.tex`: sanitized thesis-style report.
- `data/harness-weight-results.json`: sanitized CPU/RSS startup and task analysis.
- `docs/harness-weight-report.md`: separate harness-weight report and limitations.
- `docs/harness-weight-replication.md`: complete replication and troubleshooting guide.
- `data/harness-weight-openrouter-results.json`: sanitized OpenRouter Grok supplement analysis.
- `docs/harness-weight-openrouter-report.md`: OpenRouter supplement methods and results.
- `docs/harness-weight-openrouter-manifest.json`: OpenRouter supplement protocol.
- `docs/harness-weight-thesis.pdf` and `docs/harness-weight-thesis.tex`: separate follow-up thesis.
- `docs/harness-weight-manifest.json`: harness-weight protocol and model arms.
- `scripts/validate-public-data.mjs`: arithmetic and disclosure checks (requires Node.js and `pdftotext`).

## Reproduce The Public Checks

This repository does not reproduce provider inference or hidden grading without
the original authenticated environments. It does reproduce the published
arithmetic and runs the visible fixture tests:

```bash
node scripts/validate-public-data.mjs
node --test fixture/implementation/public.test.js
```

The untouched security fixture is intentionally incomplete. Its public suite is
expected to fail on two of three checks until an agent repairs it; that failure
is part of the benchmark input, not a release validation failure. The fixture is
not production authentication code.

The harness-weight light fixture is also intentionally incomplete. Its two
public tests are expected to fail before an agent implements the task; hidden
checks remain withheld.

The private archive used for the original analysis is not included because it
contains full model transcripts, encrypted/internal reasoning payloads, session
identifiers, host paths, and hidden grader outputs. Those materials are not
needed to inspect the public claims and should not be committed without a
separate privacy and licensing review.

## Status

The release metadata identifies `mmdmcy` and Katteke. Code is MIT-licensed;
reports and aggregate data are CC BY 4.0. Raw transcripts, reasoning payloads,
hidden graders, and session artifacts remain private and are not covered by the
data license.
