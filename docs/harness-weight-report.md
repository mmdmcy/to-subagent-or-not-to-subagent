# Harness Weight Study

## Executive Summary

This follow-up study measures local resource weight across OpenCode, Codex CLI,
Cursor Agent CLI, Pi, xAI/SpaceX Grok Build, and Vercel fx. The primary
endpoints are peak resident memory (RSS) of the complete local process tree and
total user plus system CPU seconds. Wall time, process count, thread count,
context switches, I/O, task score, and provider availability are secondary.

There is no single winner across every endpoint:

- fx is the lightest cold-start CLI: median peak RSS was 1.47 MB and median
  measured CPU time was below the 0.01-second reporting resolution.
- Among repeated Luna-max solo coding tasks, Pi had the lowest median process-
  tree RSS on both the light task (240.6 MB) and heavy task (535.8 MB).
- Codex had the lowest median CPU time on the Luna-max heavy task (12.92 s).
- Cursor had the lowest median wall time on the Luna-max heavy task (458.3 s).
- OpenCode was the heaviest repeated Luna-max solo task tree in this setup,
  especially on the light task (742.8 MB median RSS) and heavy task (899.6 MB).

These are deployment measurements, not pure implementation overhead. The task
resource envelope includes the harness, its local child processes, tool use,
model response handling, and any delegated work. The closest matched task
comparison is the four-way Luna-max solo subset: OpenCode, Codex, Cursor, and
Pi. fx uses its native `zai/glm-5.2` model, and Grok Build uses native Grok 4.6.

## Design

The study has two estimands.

1. **Cold CLI startup:** each executable ran fresh `--version` and `--help`
   commands, 20 trials per command. No model request was made.
2. **Coding deployment:** each arm received a fresh workspace and one of two
   fixed tasks, three trials per arm/task cell.

The light task is a small maintenance issue implementing an async retry helper
with deterministic hidden checks. The heavy task is the earlier three-package
independent implementation, security, and comprehension workload. It is an
industry-inspired controlled task pair, not an official SWE-bench,
Terminal-Bench, or HumanEval run.

The host was Linux x86-64 with four logical CPUs and approximately 15.5 GiB of
RAM. Runs were sequential and ordered by a frozen seeded permutation. Every task
started from a fresh copy of the fixture. Grading happened after the agent
measurement window and is not included in the agent CPU/RSS figures.

## Harness Configuration

The matched task arms explicitly requested GPT-5.6 Luna max where the harness
supported it:

| Harness | Task model | Solo treatment | Delegated treatment |
| --- | --- | --- | --- |
| OpenCode | `openai/gpt-5.6-luna`, `max` | task denied | bounded Luna workers |
| Codex CLI | `gpt-5.6-luna`, effort `max` | `multi_agent` disabled | `multi_agent` enabled |
| Cursor Agent | `gpt-5.6-luna-max` | `task_tool_call` excluded | task tool enabled |
| Pi | `openai-codex/gpt-5.6-luna`, `max` | extensions disabled | Luna-max worker extension |
| Grok Build | `grok-4.6` | `--no-subagents` | subagents enabled |
| fx | `zai/glm-5.2` | native solo CLI | not exposed by this CLI |

The Cursor executable was pinned to `~/.local/bin/cursor-agent`. Grok Build was
pinned to `~/.local/bin/grok`. The ambiguous `agent` name was restored as a
Cursor alias after Grok Build had installed it as a Grok alias. The runner
records and verifies the resolved executable paths before measuring.

## Measurement

The runner samples `/proc` every 20 ms and follows descendants of the launched
CLI process. It records summed tree RSS, largest individual RSS, summed CPU
ticks, process count, thread count, context switches, and process I/O. Very
short native startup commands can exit before a `/proc` sample; those commands
also run under GNU `time -v`, whose child rusage supplies the fallback RSS and
CPU values. This fallback was applied consistently to the startup phase.

The task result records contain hashes and summaries rather than full public
transcripts. Private raw stdout/stderr remains outside the public release.

## Startup Results

Values below are medians across 20 version/help trials per harness, combining
the two startup commands for readability.

| Harness | Peak tree RSS | CPU seconds | Approx. wall seconds | Interpretation |
| --- | ---: | ---: | ---: | --- |
| fx | 1.47 MB | <0.01 | 0.21 | smallest native cold start |
| Grok Build | 27.0 MB | 0.02 | 0.22 | small native binary |
| Codex CLI | 50.5 MB | 0.09 | 0.24 | smallest non-native-runtime CLI |
| Pi | 157.9 MB | 2.51 | 2.36 | Node-based CLI |
| OpenCode | 187.5 MB | 1.85 | 1.67 | Node-based CLI with larger startup tree |
| Cursor Agent | 206.4 MB | 1.76 | 1.70 | largest measured startup RSS |

The startup result is the clearest harness-overhead result because no model
behavior or task work is involved. It still measures the installed CLI and its
startup environment, not a permanently resident daemon or editor session.

## Luna-Max Solo Tasks

Median values across three completed runs are shown. `RSS` is total process-tree
peak RSS; CPU is total tree CPU seconds; wall is agent elapsed time.

### Light Maintenance

| Harness | RSS | CPU | Wall | Score |
| --- | ---: | ---: | ---: | ---: |
| Pi | 240.6 MB | 3.70 s | 52.6 s | 8/8 |
| Cursor | 363.4 MB | 6.23 s | 59.1 s | 8/8 |
| Codex CLI | 441.1 MB | 4.79 s | 72.7 s | 8/8 |
| OpenCode | 742.8 MB | 19.57 s | 81.0 s | 8/8 |

### Heavy Independent Packages

| Harness | RSS | CPU | Wall | Median score |
| --- | ---: | ---: | ---: | ---: |
| Pi | 535.8 MB | 18.86 s | 1047.5 s | 22/24 |
| Cursor | 565.0 MB | 18.53 s | 458.3 s | 22/24 |
| Codex CLI | 608.9 MB | 12.92 s | 851.7 s | 22/24 |
| OpenCode | 899.6 MB | 49.52 s | 836.5 s | 22/24 |

The CPU and wall-time winners differ. Codex consumed the least measured local
CPU on the heavy task, while Cursor completed it fastest. Pi used the least
peak process-tree RSS but had the slowest median wall time. This is why the
study reports separate resource endpoints instead of a single "lightest"
label.

## Delegation Effects

Delegation is a change in work topology, not a pure harness toggle. Median
delegated/solo ratios for the matched Luna arms were:

| Harness/task | RSS ratio | CPU ratio | Wall ratio |
| --- | ---: | ---: | ---: |
| OpenCode/light | 0.93 | 1.01 | 0.83 |
| OpenCode/heavy | 0.87 | 1.36 | 1.14 |
| Codex/light | 1.01 | 1.03 | 1.28 |
| Codex/heavy | 1.16 | 2.41 | 1.17 |
| Cursor/light | 0.86 | 1.14 | 0.91 |
| Cursor/heavy | 0.90 | 2.22 | 1.30 |
| Pi/light | 0.84 | 1.09 | 1.10 |
| Pi/heavy | 1.38 | 2.31 | 1.07 |

Delegated arms generally consumed more CPU on the heavy task, as expected from
additional model/tool work. RSS did not increase uniformly because peak memory
depends on whether children overlap and when the parent releases context. The
ratios are descriptive with only three observations per cell.

## Native Exceptions and Availability

fx completed all three light tasks with 8/8. Its three heavy attempts reached
the 1800-second task limit with scores 2/24, 14/24, and 2/24. Its low local CPU
and RSS therefore cannot be interpreted as a successful heavy-task efficiency
win. fx is an especially interesting result for the harness question: it is
very small locally, but the native model/provider response dominates completion
behavior.

Grok Build completed one light solo task and one delegated heavy task before the
free Grok Build usage quota was exhausted. The remaining 11 Grok task attempts
were provider-blocked with the explicit quota message. They are excluded from
repeated-task resource rankings, not silently treated as fast failures.

## Validity and Limits

The protocol is valid for the narrow question "what local resource envelope did
these installed deployment stacks exhibit on this machine under these fixed
tasks?" It is not valid for universal claims about harnesses, model quality, or
all user workloads.

Important limits are:

- startup results measure fresh CLI processes, not persistent IDE sessions;
- task results include model/provider behavior and tool choices;
- Luna max is matched across four harnesses, but fx and Grok use different
  native models;
- the task sample is three trials per cell, so medians and IQRs are more honest
  than significance tests;
- one machine, OS image, account setup, and service window were used;
- no GPU, network bandwidth, energy, or provider-side compute was measured;
- the heavy fixture is synthetic and separable, not a representative software
  repository distribution;
- delegated arms do not have identical subagent implementations across tools;
- Grok's free quota prevents a stable repeated-task estimate;
- fx's heavy timeouts are outcomes, not missing data.

## Reproduction

From this directory:

```bash
node run.mjs --phase micro
node run.mjs --phase task
node analyze.mjs
```

The runner writes private raw records under `raw/`. The generated
`analysis-results.json` contains aggregate resource metrics, dispositions,
startup winners, matched Luna comparisons, and delegation ratios.
