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
