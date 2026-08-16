# A Cross-Harness Evaluation of Coding-Agent Deployment Systems

## Cursor/Grok, OpenCode/GPT-5.6, and a Post-Hoc Luna Solo Supplement

**Date:** 2026-08-15
**Environment:** Linux x86_64, 4 logical CPUs, 15.5 GiB RAM
**Cursor Agent CLI:** `2026.08.11-e8db854`, authenticated subscription
**OpenCode:** `1.18.18`, authenticated subscription
**New experiment:** `reproducibility/cross-harness/`
**Exploratory supplement:** `reproducibility/cross-harness/exploratory/luna-solo/`
**Prior experiment:** `reproducibility/`

## Abstract

An earlier experiment on this machine found that a GPT-5.6 Sol/xhigh parent
with three bounded Terra/medium workers completed one separable coding workload
faster than Sol/xhigh alone in OpenCode and Pi. That study did not compare the
best practical alternative: a fast single-agent system in Cursor CLI. This
omission made its operating recommendation incomplete.

This extension predeclared seven deployment arms in a local protocol frozen
before outcomes and ran five randomized complete blocks, producing 35 fresh
outcome runs on the same hidden-graded, three-package workload. The arms were
solo Cursor Grok 4.5 high, Grok 4.6 high,
and Grok 4.6 xhigh; OpenCode Sol/xhigh solo; bounded Sol+Terra/medium; bounded
Sol+Luna/max; and a production-like Sol+Luna/max configuration. Cursor's Task
tool was excluded and raw streams confirmed zero subagent calls. The workload
was deliberately separable, favoring parallel delegation.

The pre-outcome freeze was local rather than an externally archived immutable
preregistration. Current analysis checks artifact and score integrity, but cannot
prove that the source files were unchanged before execution.

Solo Grok 4.5 high was both fastest and highest-scoring: 113/120 hidden checks
in 109.5 seconds mean agent time. OpenCode Sol/xhigh solo scored 112/120 in
486.8 seconds. Grok 4.5 reduced aggregate agent time by 77.5% versus Sol solo;
all five blocks favored Grok, and the mean paired reduction was 77.0% with a
descriptive 95% small-sample t interval of 69.2-84.7%. Bounded Terra scored
106/120 in 405.1 seconds, so Grok 4.5 was 73.0% faster and seven checks better.
Bounded and production-like Luna scored 110/120 in 949.4 and at least 1190.2
seconds mean respectively; the natural arm timed out once. Grok 4.6 high and
xhigh did not improve aggregate quality and were 4.0 and 5.7 times slower than
Grok 4.5.

After the parent analysis, a requested post-hoc supplement randomized Luna/max
solo and Luna/xhigh solo within five new blocks. Luna/xhigh scored 110/120 in
750.9 seconds mean agent time; Luna/max scored 109/120 in 779.4 seconds.
Xhigh's aggregate time was 3.7% lower, but it was faster in only two of five
blocks and its mean paired interval crossed zero. Against the earlier, non-
concurrent outcomes, Grok 4.5 used 85.4-86.0% less aggregate time and Sol/xhigh
used 35.2-37.5% less, while both also scored higher. Because this supplement was
post-hoc and its historical baselines were not rerun concurrently, it supports
the recommendation descriptively but does not alter the frozen selection rule.

No arm achieved a perfect run. Every Grok 4.5 run missed the full invalid-
concurrency check, and two missed a redirect-sanitization edge. The result is
therefore not "trust a fast agent without tests." It is a deployment decision:

> **Default to solo Cursor Agent with Grok 4.5 high for this workflow. Keep
> subagents disabled unless a new task-specific benchmark shows a verified
> advantage. If OpenCode is required, use Sol/xhigh solo. Disable Luna/max
> subagents; treat bounded Terra as experimental rather than a default.**

The conclusion is strong for this fixture and observation window, moderate as
a personal workflow recommendation, and not a universal model ranking.

## 1. Decision

### 1.1 Recommended Default

Use Cursor Agent CLI with `cursor-grok-4.5-high` as one agent. A practical
production command is:

```bash
agent -p --force --trust \
  --model cursor-grok-4.5-high \
  --output-format stream-json \
  --exclude-tools task_tool_call \
  "<task>"
```

This is not the exact isolated benchmark invocation. The harness additionally
used a fresh `CURSOR_CONFIG_DIR` and `--data-dir`, an explicit workspace,
`--single-turn`, `--sandbox disabled`, and flags disabling project config,
indexing, and codebase references. Reproduction should use `run.mjs`, not infer
the protocol from this shorter operational command.

The installed CLI accepted `--exclude-tools task_tool_call`, although that flag
was not shown in the normal help output. Raw events contained one session ID per
run and no Task call. Cursor's documented built-in subagent behavior means that
model selection alone is not proof of solo execution; tool telemetry must be
checked when this distinction matters.

### 1.2 OpenCode Fallback

If OpenCode-specific features are required, use Sol/xhigh with `task` denied.
The new Sol-solo arm was quality-eligible and reliable, but much slower than
Grok 4.5 on this workload. The post-hoc supplement also found Sol's historical
mean 35.2-37.5% faster than Luna/xhigh or Luna/max solo, with higher quality.

### 1.3 What To Stop Doing

Do not use Luna as the routine OpenCode owner or subagent. Luna/max delegation
added latency, model sessions, reasoning tokens, and nominal resource cost
without improving hidden quality over Sol solo. The production-like Luna arm
was slower than Sol solo in all five blocks and timed out once. In the post-hoc
solo supplement, Luna/xhigh and Luna/max also scored below Sol and had 750.9 and
779.4 second means.

Do not enable bounded Terra by default based only on the earlier paper. In the
contemporaneous run it was faster than Sol solo in only three of five blocks,
its time interval included no benefit, and it lost six aggregate hidden checks,
including four extra security misses. It remains a plausible opt-in for low-
risk, cleanly separable work with strong tests, not the default owner of code.

## 2. Why The Earlier Thesis Was Incomplete

The prior study asked whether subagents improved an OpenCode-centered workflow.
Its controlled results were real within that scope:

| Prior harness | Single | Delegated | Aggregate time change | Quality |
|---|---:|---:|---:|---:|
| OpenCode 1.18.7, five pairs | 19.5m mean | 11.3m mean | -42.1% | 108/120 vs 112/120 corrected |
| Pi 0.80.6, three pairs | 12.2m mean | 8.0m mean | -33.9% | 68/72 vs 66/72 |

That experiment answered a within-harness architecture question. It did not
answer the user's actual deployment question: whether to use OpenCode and its
subagents at all. Sol/xhigh was treated as an established default rather than
tested against Cursor/Grok. The previous report disclosed that weakness, but
its recommendation still overreached the evidence.

This distinction matters because agent-computer interfaces can materially
change model behavior and efficiency. SWE-agent explicitly demonstrated that
interface design affects coding-agent performance, while Agentless showed that
simple systems can outperform more elaborate agents. A deployment study must
therefore compare complete usable systems, not optimize one architecture in
isolation and call it the default.

## 3. Research Questions

- **RQ1:** Which tested solo Cursor/Grok configuration is quality-eligible and
  fastest on the frozen workload?
- **RQ2:** Does the best solo Cursor arm beat OpenCode Sol/xhigh alone on
  hidden quality and user-perceived completion time?
- **RQ3:** Does the best solo Cursor arm beat the earlier recommended bounded
  Sol+Terra architecture?
- **RQ4:** Within current OpenCode, do Terra or Luna subagents improve verified
  completion time without unacceptable quality loss?
- **RQ5:** Do the tested higher-effort configurations improve quality enough to
  justify their latency?
- **RQ6:** What operating policy is defensible after combining production
  history, the earlier cross-harness experiment, and the new comparison?

After the parent study was complete, the user requested one additional
exploratory question: how do Luna/max and Luna/xhigh perform as solo OpenCode
owners? It is not retroactively designated a preregistered RQ.

The estimand is the performance of a deployable system: model, harness, tool
loop, reasoning effort, and distributed model capacity together. This is not a
pure causal estimate of concurrency or model family.

Capacity was asymmetric by design. OpenCode solo had 36 parent turns; bounded
arms had 12 parent turns plus up to 36 child turns, and the natural arm could
continue until the common wall cap. Cursor exposed no equivalent turn cap. The
study compares usable architectures, not equal-compute treatments.

## 4. Preregistered Design

### 4.1 Arms

| Arm | Parent / solo model | Child model | Delegation policy |
|---|---|---|---|
| Cursor Grok 4.5 | Grok 4.5 high | None | Task tool excluded |
| Cursor Grok 4.6 high | Grok 4.6 high | None | Task tool excluded |
| Cursor Grok 4.6 xhigh | Grok 4.6 xhigh | None | Task tool excluded |
| OpenCode solo | Sol/xhigh, 36 turns | None | `task` denied |
| OpenCode bounded Terra | Sol/xhigh, 12 turns | Three Terra/medium, 12 turns each | One package per child, no recursion |
| OpenCode bounded Luna | Sol/xhigh, 12 turns | Three Luna/max, 12 turns each | One package per child, no recursion |
| OpenCode natural Luna | Sol/xhigh | Luna/max | Broad optional recursive delegation |

The natural arm reproduces the important characteristics of the user's former
configuration rather than imposing the bounded treatment on it. It exposes
only `general`, `explore`, and `scout`, all Luna/max.

### 4.2 Workload

Every run received a fresh copy of three independent JavaScript packages:

- a bounded-concurrency mapping implementation;
- a session/authentication security repair;
- an event-pipeline comprehension task producing eight exact facts.

Each package contributed eight hidden checks, for 24 per run. Agents saw public
tests. Grader files were not copied into their workspaces, and exact grader
paths did not appear in streams, but OS-level non-access was not enforced. The
comprehension path was fixed before outcomes to `comprehension/answer.json`; no
score-improving fallback was allowed.

This fixture is favorable to subagents because the package boundaries are
explicit and independent. It does not test coupled refactors. If a solo system
wins here, the result cannot be dismissed as a workload that prevented useful
parallelism.

### 4.3 Sampling And Randomization

Five randomized complete blocks were frozen before outcomes. Every block
contained all seven arms once. A seeded generator fixed the 35-run order, and
top-level runs executed sequentially to avoid direct host contention. The arm
order, prompt hash, fixture hash, model IDs, five-block sample, common
30-minute cap, and decision rule were fixed before outcome inspection.

Excluded pilots found two harness issues before outcomes:

- Cursor rejected `--exclude-workspace-context` for this account, so the flag
  was removed for every Cursor arm.
- The first natural-Luna pilot could see benchmark-only worker definitions, so
  it was restricted to the three agents in the user's live configuration.

Both failed pilots remain in the raw bundle and are excluded from estimates.

### 4.4 Endpoints And Decision Rule

Primary quality was hidden checks passed. Primary performance was agent-process
wall time; verified wall time added deterministic grading and is reported as a
secondary near-identical measure. Reliability included normal exit, timeout,
model identity, malformed streams, subagent calls, and file-scope integrity.

The frozen operating rule required:

1. no timeout or abnormal process exit;
2. no observed model mismatch or forbidden final fixture change;
3. aggregate quality within one check of the highest-scoring arm; and
4. no run losing more than one of eight security checks.

Among eligible arms, the rule selects the lowest aggregate verified time.

### 4.5 Analysis

Checks are clustered within a run and are not treated as independent samples.
Planned contrasts use block-level paired differences. The report gives every
pair, aggregate reduction, mean paired percentage reduction, mean absolute
change, and a descriptive 95% Student-t interval. With five blocks and one
fixture, intervals summarize run-to-run variation here; they do not establish
population-wide model superiority.

### 4.6 Post-Hoc Luna Solo Supplement

On August 15, after the parent result was known, a separate manifest froze two
exploratory arms before their own outcomes: OpenCode Luna/max solo and
Luna/xhigh solo. Each used a 36-step cap, denied `task`, and received the same
fixture, prompt, graders, and 1,800-second timeout. Five seeded blocks randomized
the order of those two arms and ran sequentially, producing ten outcomes.

The max-versus-xhigh comparison is randomized within this supplement.
Comparisons to August 14 Grok and Sol runs are non-concurrent descriptive
comparisons, not paired causal effects. The supplement does not retroactively
change the parent manifest or its frozen operating-rule winner. Its 43 raw
artifacts are hash-pinned; config, runner, analyzer, and grader hashes are a
post-outcome source snapshot rather than proof of a pre-outcome source freeze.

## 5. Main Results

### 5.1 Arm-Level Outcomes

| Arm | Hidden checks | Mean agent time | Median | Range | Timeouts |
|---|---:|---:|---:|---:|---:|
| **Cursor Grok 4.5 high solo** | **113/120** | **109.5s** | **107.0s** | 89.3-139.8s | 0/5 |
| Cursor Grok 4.6 high solo | 112/120 | 433.9s | 427.4s | 398.4-470.9s | 0/5 |
| Cursor Grok 4.6 xhigh solo | 111/120 | 622.8s | 592.9s | 558.0-687.8s | 0/5 |
| OpenCode Sol/xhigh solo | 112/120 | 486.8s | 468.3s | 401.0-573.6s | 0/5 |
| OpenCode Sol+Terra bounded | 106/120 | 405.1s | 402.0s | 229.9-584.2s | 0/5 |
| OpenCode Sol+Luna bounded | 110/120 | 949.4s | 880.9s | 790.4-1346.4s | 0/5 |
| OpenCode Sol+Luna natural | 110/120 | >=1190.2s | 1083.9s | 893.5s to >1800s | 1/5 |

Grok 4.5, Grok 4.6 high, and OpenCode Sol solo passed the quality and
reliability gate. Grok 4.5 was selected mechanically because it had the lowest
aggregate verified time. Grok 4.6 xhigh, Terra, and both Luna arms were outside
the one-check quality margin; natural Luna also timed out.

### 5.2 Best Cursor Versus OpenCode Solo

| Trial | Grok 4.5 | Sol solo | Agent time saved | Grok score | Sol score |
|---:|---:|---:|---:|---:|---:|
| 1 | 89.3s | 553.4s | 83.9% | 22/24 | 22/24 |
| 2 | 89.5s | 401.0s | 77.7% | 23/24 | 22/24 |
| 3 | 122.1s | 468.3s | 73.9% | 23/24 | 22/24 |
| 4 | 139.8s | 437.6s | 68.0% | 22/24 | 23/24 |
| 5 | 107.0s | 573.6s | 81.3% | 23/24 | 23/24 |

Aggregate agent-time reduction was 77.5%. Mean paired reduction was 77.0%,
with descriptive 95% interval 69.2-84.7%. Mean absolute savings were 377.3
seconds, interval 275.0-479.5 seconds. All five blocks favored Grok 4.5. Quality
was 113/120 versus 112/120, too close to claim broad intelligence superiority.
There was no observed speed-quality tradeoff under the prespecified margin.

### 5.3 All Preregistered Contrasts

Block-level agent-time reductions for the candidate named first:

| Contrast | T1 | T2 | T3 | T4 | T5 |
|---|---:|---:|---:|---:|---:|
| Grok 4.5 vs Sol solo | 83.9% | 77.7% | 73.9% | 68.0% | 81.3% |
| Grok 4.5 vs bounded Terra | 81.9% | 77.7% | 61.5% | 39.2% | 81.7% |
| Bounded Terra vs Sol solo | 11.1% | -0.2% | 32.2% | 47.5% | -1.8% |
| Bounded Terra vs bounded Luna | 44.7% | 52.1% | 59.9% | 82.9% | 33.7% |
| Sol solo vs natural Luna | 50.2% | 62.2% | 47.6% | >=75.7% censored | 47.1% |

| Contrast | Aggregate | Mean paired reduction, 95% interval | Quality | Faster blocks | Perfect runs | Timeouts |
|---|---:|---:|---:|---:|---:|---:|
| Grok 4.5 vs Sol solo | 77.5% | 77.0% [69.2, 84.7] | 113 vs 112 | 5/5 | 0 vs 0 | 0 vs 0 |
| Grok 4.5 vs bounded Terra | 73.0% | 68.4% [45.6, 91.2] | 113 vs 106 | 5/5 | 0 vs 0 | 0 vs 0 |
| Bounded Terra vs Sol solo | 16.8% | 17.7% [-8.9, 44.4] | 106 vs 112 | 3/5 | 0 vs 0 | 0 vs 0 |
| Bounded Terra vs bounded Luna | 57.3% | 54.7% [31.7, 77.7] | 106 vs 110 | 5/5 | 0 vs 0 | 0 vs 0 |
| Sol solo vs natural Luna | >=59.1% | 56.6% [41.2, 71.9], capped | 112 vs 110 | 5/5 | 0 vs 0 | 0 vs 1 |

Natural-Luna trial 4 is right-censored. Its reduction is a lower bound; the
interval using the timeout cap is descriptive, not a completion-time interval.

Mean absolute agent-time savings with 95% intervals were: Grok 4.5 versus Sol,
377.3 seconds [275.0, 479.5]; Grok 4.5 versus Terra, 295.5 [102.1, 489.0];
Terra versus Sol, 81.7 [-36.8, 200.2]; Terra versus Luna, 544.3 [138.7, 949.8];
and Sol versus natural Luna, 703.4 [233.9, 1173.0] using the capped timeout and
therefore not an exact completion-time interval.

### 5.4 Best Cursor Versus Bounded Terra

Grok 4.5 was faster in all five blocks. Aggregate agent-time reduction was
73.0%; mean paired reduction was 68.4%, interval 45.6-91.2%. It also passed
113/120 checks versus Terra's 106/120. Terra scored only 5/8 on security in two
runs and failed the preregistered safety gate.

This directly changes the earlier recommendation. Bounded Terra was not a
competitive default once the external solo baseline was included.

### 5.5 Current OpenCode: Delegation Was Not Robust

Bounded Terra reduced aggregate agent time by 16.8% versus current Sol solo,
but was faster in only three of five blocks. Mean paired reduction was 17.7%,
with interval -8.9% to 44.4%. Terra lost six checks overall: 106/120 versus
112/120. The clean-block sensitivity excluding the transient-test-edit run was
similar: 20.1% aggregate reduction, interval -12.6% to 57.1%, and 84/96 versus
90/96 checks.

Bounded Terra was 57.3% faster than bounded Luna but lost four checks. Excluding
the Terra transient-edit block and the Luna worker-resume block left three clean
pairs: Terra remained 45.6% faster and scored 64/72 versus 66/72.

Sol solo was faster than natural Luna in all five blocks. Using the capped
intention-to-treat duration, Sol reduced time by at least 59.1% and scored
112/120 versus 110/120. Excluding the right-censored timeout block, Sol remained
51.9% faster across four completed pairs and scored 89/96 versus 88/96.

### 5.6 Higher-Effort Configurations Did Not Dominate

Within Cursor, Grok 4.5 high dominated both Grok 4.6 settings tested:

| Contrast | Aggregate agent-time reduction for Grok 4.5 | Quality |
|---|---:|---:|
| vs Grok 4.6 high | 74.8% | 113/120 vs 112/120 |
| vs Grok 4.6 xhigh | 82.4% | 113/120 vs 111/120 |

Grok 4.6 xhigh spent 5.7 times as long as Grok 4.5 without improving aggregate
quality. This comparison changes both model generation and effort, so it does
not isolate a causal effect of reasoning effort. The earlier same-model worker
screen also found Terra/high did not beat Terra/medium, while Luna/max was slow
and timeout-prone. The supported conclusion is operational: higher-effort
tested configurations did not guarantee better quality here.

### 5.7 Post-Hoc Luna Solo Results

| Exploratory arm | Hidden checks | Mean agent time | Median | Range | Timeouts |
|---|---:|---:|---:|---:|---:|
| Luna/xhigh solo | 110/120 | 750.9s | 780.5s | 620.9-816.2s | 0/5 |
| Luna/max solo | 109/120 | 779.4s | 768.3s | 682.2-909.1s | 0/5 |

Both arms used exactly one observed Luna parent per run, created no child
session, made no Task call, exited normally, and changed only allowed paths.
Xhigh reduced aggregate time by 3.7% versus max and scored one check higher, but
was faster in only two of five randomized blocks. Mean paired reduction was
3.1%, with descriptive 95% interval -11.5% to 17.7%; mean absolute savings were
28.5 seconds, interval -86.2 to 143.2 seconds. This does not establish a clear
latency effect between Luna effort settings.

Historical comparisons were unfavorable to both Luna solo arms:

| Non-concurrent baseline | Versus Luna/xhigh | Versus Luna/max | Quality |
|---|---:|---:|---:|
| Grok 4.5 high solo | 85.4% less aggregate time | 86.0% less | 113 vs 110 / 109 |
| Sol/xhigh solo | 35.2% less aggregate time | 37.5% less | 112 vs 110 / 109 |

The historical timing gaps are large enough to reinforce the operating choice,
but they are not randomized within-block effects because service and host time
differed between observation windows.

## 6. Quality Analysis

No preregistered arm produced a 24/24 run, and all seven preregistered arms
solved comprehension perfectly. The remaining misses were concentrated rather
than random:

| Arm | Implementation | Security | Comprehension |
|---|---:|---:|---:|
| Grok 4.5 | 35/40 | 38/40 | 40/40 |
| Grok 4.6 high | 35/40 | 37/40 | 40/40 |
| Grok 4.6 xhigh | 36/40 | 35/40 | 40/40 |
| Sol solo | 37/40 | 35/40 | 40/40 |
| Bounded Terra | 35/40 | 31/40 | 40/40 |
| Bounded Luna | 35/40 | 35/40 | 40/40 |
| Natural Luna | 35/40 | 35/40 | 40/40 |

Every Grok 4.5 run failed the hidden check requiring rejection of all invalid
concurrency values. The common implementation accepted at least one value such
as `null` because defaulting and validation interacted incorrectly. Two Grok
4.5 runs also missed redirect-parser adversaries. Every OpenCode Sol run missed
the redirect check; three missed invalid concurrency. Terra additionally missed
profile-patch protections in two runs.

Neither exploratory Luna solo arm produced a perfect run. Both scored 35/40 on
implementation and 35/40 on security, systematically missing invalid-
concurrency and redirect-parser checks. Luna/xhigh scored 40/40 on comprehension;
Luna/max scored 39/40 after one `dedupeKey` miss.

The practical lesson is stronger than a model ranking: public tests were not
sufficient to certify completion. Fast agent output must still pass contract-
focused tests, especially for nullability, parsing layers, authentication,
redirects, cancellation, and cleanup races.

## 7. Resource Use

Cursor emitted token telemetry but no authoritative subscription charge or
reasoning-token field. Across five runs:

| Cursor arm | Input | Output | Cache read |
|---|---:|---:|---:|
| Grok 4.5 high | 135,151 | 51,494 | 649,600 |
| Grok 4.6 high | 523,892 | 143,195 | 1,432,192 |
| Grok 4.6 xhigh | 889,517 | 197,714 | 2,333,568 |

OpenCode's isolated database exposed parent and child usage. Using the same
nominal API-equivalent rates as the prior study, not actual OAuth subscription
charges:

| OpenCode arm | Sessions | Input | Output | Reasoning | Cache read | Nominal proxy |
|---|---:|---:|---:|---:|---:|---:|
| Sol solo | 5 | 212,008 | 37,775 | 79,682 | 1,066,496 | $5.117 |
| Bounded Terra | 20 | 368,169 | 67,375 | 64,343 | 1,270,784 | $4.720 |
| Bounded Luna | 20 | 691,841 | 97,013 | 303,225 | 3,567,104 | $5.741 |
| Natural Luna | 21 | 890,564 | 102,395 | 403,134 | 5,648,384 | $6.432 |
| Luna/xhigh solo, post-hoc | 5 | 426,285 | 60,729 | 130,879 | 3,205,632 | $1.896 |
| Luna/max solo, post-hoc | 5 | 373,067 | 49,511 | 153,038 | 3,028,480 | $1.891 |

These telemetry schemas are not directly comparable across vendors. The user
pays subscriptions rather than these nominal invoices, so elapsed time,
quality, and rate-limit behavior are the actionable outcomes. Token data explain
mechanism: slower high-effort systems consumed much more model work.

## 8. Protocol Deviations And Integrity

All 35 expected outcomes exist, match the frozen start order, share the same
fixture and prompt digests, and match the stored grader outputs and current
artifact hashes. An artifact manifest verified 163 raw files before reanalysis. Requested and
observed models matched; Cursor emitted zero Task calls; final fixture changes
were in scope. No exact grader filename or grader-directory path appeared in a
model stream.

Two bounded runs had deviations discovered during adversarial review:

- Terra trial 2 temporarily edited `security/public.test.js`. The Sol parent
  resumed the same worker with a fourth Task call and restored the file before
  grading.
- Luna trial 4 resumed an implementation worker after it reported reaching its
  configured step cap, weakening a strict 12-turn-budget interpretation.

Both remain in the intention-to-treat analysis. Clean-block sensitivity results
are reported above. Neither affects the Grok-versus-Sol contrast.

Isolation was policy-based, not an OS security boundary. Agents ran in fresh
workspaces with disabled project configuration and hidden graders outside the
workspace, but Cursor used `--sandbox disabled`, processes inherited the host
environment, and subscription credentials were available to the harness. The
absence of grader paths in streams is evidence against observed leakage, not
proof that access was impossible. Future publication-grade replication should
use containers or namespaces and credential brokering unavailable to model-
executed shell commands.

The post-hoc supplement separately retained ten outcomes, streams, stderr
records, and grader outputs. Its 43-file artifact manifest verified before
reanalysis; all observed parents were Luna with the requested `xhigh` or `max`
variant, and all runs were solo and in scope. Its analyzer also verifies the
parent study's 163-file artifact manifest and binds historical comparisons to
the parent `runs.json` digest. Independent audit found no arithmetic or current
artifact-integrity error; methodological limits remain material. Source/config
hashes were recorded after outcomes and are disclosed as such.

## 9. Reconciling Old And New Evidence

The old and new OpenCode experiments used nearly the same separable fixture but
produced materially different effect sizes:

| OpenCode study | Sol mean | Terra mean | Aggregate reduction | Quality change |
|---|---:|---:|---:|---:|
| August 12, OpenCode 1.18.7 | 19.5m | 11.3m | 42.1% | +4/120 corrected |
| August 14, OpenCode 1.18.18 | 8.1m | 6.8m | 16.8% | -6/120 |

This is not a contradiction to hide. It is evidence that agent-system results
are temporally unstable under provider sampling, server conditions, harness
versions, and model behavior. Repeating one fixture estimates repeatability at
one time, not a permanent architecture constant.

The defensible synthesis is:

1. Parallel delegation can compress the critical path when scopes are truly
   independent.
2. That benefit is conditional and can be modest or unreliable even on a
   favorable workload.
3. Child quality and parent correction determine whether speed survives hidden
   grading.
4. A faster single-agent harness/model can dominate the entire delegated
   architecture.
5. Architecture selection must include strong external baselines and be
   reevaluated as models and harnesses change.

The August 15 solo supplement adds a same-harness descriptive check: Luna/xhigh
and Luna/max averaged 12.5 and 13.0 minutes, compared with the August 14 Sol
mean of 8.1 minutes. Because Sol was not rerun concurrently, this is corroborating
evidence rather than a randomized Sol-versus-Luna estimate.

## 10. Adversarial Defense

### Objection 1: One synthetic fixture cannot select a universal winner

**Sustained.** The result selects a personal default, not a universal coding
agent. SWE-bench-scale, multi-language, coupled-refactor, interactive, and
long-horizon replication is required for general claims.

### Objection 2: The workload was engineered for subagents

**Sustained, but conservative for the result.** Independent packages make
parallel delegation easier. Grok 4.5 still won, so this objection cannot explain
its advantage. The study says less about coupled tasks, where delegation may be
even less useful or could help through independent review rather than editing.

### Objection 3: Harness and model are confounded

**Sustained by design.** The user chooses a deployment system, not an abstract
model under a common API. SWE-agent motivates treating the interface as part of
the intervention. A separate factorial study would be needed to attribute the
advantage to Grok versus Cursor's agent loop.

### Objection 4: Cursor had no turn cap

**Sustained.** Cursor exposes no equivalent control. A common 30-minute wall
cap was used. This favors whichever system manages its work efficiently, which
is the practical estimand.

### Objection 5: Five blocks are too few

**Sustained for broad inference.** The Grok-vs-Sol gap was large and favored
Grok in every block, but the sample cannot map the task population. Intervals
are descriptive and the recommendation is reversible.

### Objection 6: Scores differ by only one check

**Sustained.** No intelligence superiority is claimed. The key result is that
Grok 4.5 achieved quality parity under the frozen one-check margin while using
far less time. All systems still need stronger verification.

### Objection 7: The natural timeout biases the mean

**Sustained.** Its duration is right-censored. The capped comparison is a lower
bound on Sol's speed advantage. The four completed pairs still favor Sol by
51.9% aggregate time.

### Objection 8: Subscription economics are missing

**Sustained.** Both systems used existing subscriptions, and Cursor emitted no
authoritative billing value. Actual rate limits and monthly allowances should
be monitored during real use. Invented cross-provider dollar equivalence would
be less defensible than reporting this gap.

### Objection 9: Graders may have been reachable

**Sustained as a security-design limitation.** No stream showed grader paths,
but only an OS sandbox can establish non-access. The artifacts support an
honest no-observed-leakage claim, not a proof.

### Objection 10: Luna solo was added only after seeing the main result

**Sustained.** The Luna supplement is explicitly post-hoc relative to the
parent decision and cannot repair that omission retroactively. Its own two-arm
order was frozen before those ten outcomes, so Luna/xhigh versus Luna/max is a
valid within-supplement randomized comparison. Comparisons to Grok and Sol are
reported only as non-concurrent descriptive evidence.

## 11. Operating Policy

### Default Mode

Use solo Cursor/Grok 4.5 high. Keep Task/subagent invocation disabled when
latency and architectural attribution matter. Give one coherent task, require
tests, and inspect diffs.

### Verification Gate

Before accepting agent work:

1. run repository tests rather than trusting the final summary;
2. add focused checks for contract boundaries not covered publicly;
3. inspect changed-file scope, including tests and configuration;
4. review security parsing and cancellation paths manually or independently;
5. reject "done" when final edits were not followed by rerun checks.

### OpenCode Mode

Use Sol/xhigh solo with `task` denied when OpenCode is needed. The post-hoc solo
screen does not support replacing Sol with Luna/xhigh or Luna/max. Do not leave
broad Luna agents available by default. Preserve a bounded Terra mode only as an
explicit experiment for low-risk independent packages with deterministic
package tests and parent review; the new data do not justify recommending it
for security-sensitive work.

### Rebenchmark Trigger

Rerun a smaller frozen comparison when any of these changes:

- Cursor or OpenCode major agent-loop version;
- model generation or reasoning-effort behavior;
- subscription routing or rate limits;
- primary language/repository scale;
- workload changes from independent packages to coupled refactors.

Use real completed-work logs to test whether the benchmark predicts daily
latency and correction burden.

## 12. Threats To Validity

### Internal Validity

- Provider sampling was nondeterministic.
- Harness, model, and reasoning effort were intentionally bundled.
- Two bounded runs had documented deviations.
- Top-level order was randomized but five blocks cannot balance every temporal
  pattern perfectly.
- Isolation was not OS-enforced.
- The Luna solo supplement was requested after the parent result, and its source
  hashes were captured post-outcome.

### Construct Validity

- Hidden checks measured selected correctness edges, not maintainability,
  readability, architectural quality, or all security properties.
- Agent wall time measures user waiting but not interactive steering burden.
- Nominal OpenCode cost is not an invoice; Cursor cost was unavailable.
- A repeated combined fixture overrepresents deterministic package completion.

### External Validity

- One JavaScript fixture, machine, account, and three-day observation window.
- Explicit package separability favors delegation.
- No large monorepository, UI, database migration, dependency upgrade, or
  multi-hour task.
- No Cursor subagent architecture was tested; only Cursor solo was relevant to
  the user's counterclaim.
- Results do not establish that Grok 4.5 beats later models on other tasks.

### Statistical Conclusion Validity

- Five blocks yield imprecise estimates for modest effects.
- The 24 checks within a run are clustered.
- Best-Cursor selection used a fixed quality-first rule but still evaluates
  three Cursor variants on one fixture.
- The natural timeout is censored and excluded in completed-case sensitivity.
- Luna max-versus-xhigh has five blocks; its comparisons to historical Grok and
  Sol arms are non-concurrent and not paired effects.

## 13. Reproducibility

The private research archive contains:

- `reproducibility/cross-harness/manifest.json`: frozen arms and sample;
- `PROTOCOL.md`: preregistered design and pilot amendments;
- `DEVIATIONS.md`: post-outcome deviation ledger;
- `opencode-config.json`: isolated arm definitions;
- `run.mjs`: fixture hashing, randomized execution, grading, telemetry, and
  resumable outcome collection;
- `raw/runs.json`: 35 consolidated outcome records;
- `raw/outcomes/`, `raw/streams/`, and `raw/graders/`: per-run evidence;
- `raw/artifact-sha256.json`: 163 raw-artifact hashes;
- `analyze.mjs` and `analysis-results.json`: standard-library-only analysis of
  stored outcomes and grader outputs.
- `exploratory/luna-solo/`: the frozen post-hoc two-arm manifest, isolated
  config, ten outcomes, 43 raw-artifact hashes, and independent analysis.

Recompute:

```bash
cd path/to/reproducibility/cross-harness
node analyze.mjs
cd exploratory/luna-solo
node analyze.mjs
```

The analyzer verifies current manifest and fixture digests, recomputes package
scores from stored grader output, and checks run counts/order, prompt digests,
requested-versus-observed model identity, Cursor Task calls, abnormal graders,
consolidated/per-run record mismatches, exact hidden-grader path appearances,
and changed raw artifact hashes. These checks do not prove that source files
were immutable before outcomes or that the host prevented grader access.

## 14. Conclusion

The original study was right about mechanism but wrong to stop at the
OpenCode boundary. Bounded delegation can reduce critical-path time. That does
not imply it is the best way to get work done, and it does not make subagents a
good default.

In the missing head-to-head comparison, solo Cursor/Grok 4.5 high was 77.5%
faster than OpenCode Sol/xhigh solo, 73.0% faster than the recommended bounded
Terra architecture, and more accurate in aggregate than both. Luna/max
subagents were substantially slower in the tested delegated configurations. The requested follow-up also found
Luna/xhigh and Luna/max solo slower and lower-scoring than the historical Sol
and Grok baselines; xhigh did not clearly beat max within the randomized
supplement. Higher-effort configurations did not improve the decision outcome.
The user's concern about wasting time on subagent orchestration is supported,
and switching the solo OpenCode owner from Sol to Luna is not supported either.

The final thesis is narrower and more useful:

> **Optimize the complete coding system, not the number of agents. Start with
> the fastest quality-eligible solo agent among the configurations actually
> tested. Add delegation only after a task-specific, hidden-graded comparison
> shows that its integration overhead and quality risk are worth paying. On
> this fixture and observation window, that means Cursor Agent with Grok 4.5
> high, no subagents, and mandatory verification.**

## References

1. Jimenez et al., "SWE-bench: Can Language Models Resolve Real-World GitHub
   Issues?" ICLR 2024, arXiv:2310.06770.
2. Yang et al., "SWE-agent: Agent-Computer Interfaces Enable Automated Software
   Engineering," arXiv:2405.15793.
3. Xia et al., "Agentless: Demystifying LLM-based Software Engineering
   Agents," arXiv:2407.01489.
4. Cursor, "Using Headless CLI," <https://cursor.com/docs/cli/headless>.
5. Cursor, "Output format," <https://cursor.com/docs/cli/reference/output-format>.
6. Cursor, "Subagents," <https://cursor.com/docs/subagents>.
7. OpenCode, "Agents," <https://opencode.ai/docs/agents/>.
8. OpenCode, "Models," <https://opencode.ai/docs/models/>.
9. Original local report,
   `opencode-subagent-performance-audit-2026-08-12.md`.
