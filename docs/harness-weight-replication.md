# Harness-Weight Replication Guide

This guide records the exact reasoning, setup, commands, model choices, and
failure dispositions for `harness-weight-2026-08-19`. It is intended to let a
later run reproduce the design or extend it without mixing incompatible
results.

## What Was Measured

The study has two separate questions.

1. **Cold CLI footprint:** how much local CPU and resident memory a fresh CLI
   process uses for `--version` and `--help`, without model inference.
2. **Coding deployment footprint:** how much CPU, peak memory, wall time,
   process topology, and task work a fresh agent process tree uses while
   attempting a fixed coding task.

The primary resource fields are:

- `peakTreeRssBytes`: maximum summed resident memory of the process and all
  descendants observed together;
- `totalCpuSeconds`: summed user plus system CPU time across observed processes;
- `wallSeconds`: agent-process elapsed time, excluding the later grader;
- `peakProcesses` and `peakThreads`: maximum observed process and thread counts.

The result is a deployment-envelope comparison. It is not a pure measurement
of binary size, provider-side compute, model quality, energy, network traffic,
or a universal benchmark of coding agents.

## Frozen Study Snapshot

- Study ID: `harness-weight-2026-08-19`
- Public release commit: `b5c7327`
- Host: Linux x86-64, four logical CPUs, approximately 15.5 GiB RAM
- Startup trials: 20 `--version` and 20 `--help` trials per harness
- Task trials: three trials per arm/task cell
- Resource sample interval: 20 ms
- Task timeout: 1800 seconds
- Order: sequential, seeded permutation from `orderSeed: 8192026`
- Public aggregate manifest hash: `573b87c8b910c1a93789b2de93ac64dcfe2a458d847773e51a65232d00c18e69`

The complete planned matrix was 240 startup runs and 66 task runs. The observed
task disposition was 52 completed, three fx timeouts, and eleven Grok quota
blocks.

## Harness Matrix

### Matched Luna-Max Arms

These are the closest task comparison because they request GPT-5.6 Luna max.

| Harness | Model and effort | Solo arm | Delegated arm |
| --- | --- | --- | --- |
| OpenCode | `openai/gpt-5.6-luna`, variant `max` | `task` denied | bounded Luna workers |
| Codex CLI | `gpt-5.6-luna`, `model_reasoning_effort=max` | `multi_agent` disabled | `multi_agent` enabled |
| Cursor Agent | `gpt-5.6-luna-max` | `task_tool_call` excluded | task tool enabled |
| Pi | `openai-codex/gpt-5.6-luna`, `--thinking max` | extensions disabled | `luna-worker` extension |

### Native-Model Arms

These are included for practical harness coverage but are not model-matched to
the Luna subset.

| Harness | Model | Delegation |
| --- | --- | --- |
| Grok Build | `grok-4.6` | solo `--no-subagents`; delegated default |
| fx | default `zai/glm-5.2` | no comparable subagent flag in this CLI |

## Executable Identity

Grok Build initially installed an `agent` alias that pointed to its own binary.
That collided with Cursor Agent, which also uses the `agent` command.

The final setup was:

```text
agent        -> ~/.local/bin/cursor-agent
cursor-agent -> Cursor Agent installation
grok         -> Grok Build installation
```

The benchmark never relies on PATH resolution for the two ambiguous tools. It
uses `~/.local/bin/cursor-agent` and `~/.local/bin/grok`, then checks their
resolved targets. Verify before rerunning:

```bash
command -v agent
command -v cursor-agent
command -v grok
readlink -f "$(command -v agent)"
readlink -f "$(command -v cursor-agent)"
readlink -f "$(command -v grok)"
agent --version
cursor-agent --version
grok --version
```

If a Grok installer restores its `agent` alias, restore the Cursor alias or set
the runner's explicit `CURSOR_AGENT_COMMAND` path. Do not use the ambiguous
`agent` name as evidence of which harness ran.

## Authentication Checks

Authentication is local state and must never be copied into the repository.
Run only the public status/version checks below.

### OpenCode

The task runner expects the normal OpenCode auth file and copies it into an
isolated temporary state directory for each run. The copied file is deleted
with the private run state.

```bash
opencode --version
opencode debug config
```

### Codex CLI

Codex was configured as:

```toml
model = "gpt-5.6-luna"
model_reasoning_effort = "max"
```

Check authentication and model selection:

```bash
codex doctor
codex exec --help
```

The noninteractive runner uses `codex exec --json --ephemeral`, passes
`--model gpt-5.6-luna`, overrides `model_reasoning_effort="max"`, and uses
`--approve-for-me`. In this Codex version, `--ask-for-approval` is not a valid
`exec` option; using it produces an immediate argument error.

### Pi

Pi must expose the OpenAI Codex OAuth provider and Luna model:

```bash
pi --list-models | grep gpt-5.6-luna
pi --provider openai-codex --model gpt-5.6-luna --thinking max --no-session --print "Reply with exactly OK."
```

The delegated arm copies `pi-luna-worker.md` into its isolated agent directory.
The worker frontmatter requests `openai-codex/gpt-5.6-luna:max`.

### Cursor Agent

Use the dedicated Cursor executable, not a generic `agent` command:

```bash
cursor-agent --version
cursor-agent models | grep gpt-5.6-luna-max
```

### Grok Build

Grok Build uses its own account and quota:

```bash
grok --version
grok models
grok -p "Reply with exactly OK." --no-subagents --output-format streaming-json --max-turns 1
```

The run completed one initial light solo task and one initial delegated heavy
task before the free Grok Build quota was exhausted. Later attempts returned an
explicit usage-limit message. Those attempts are provider-blocked, not fast
task failures and not evidence about Grok's resource use.

### Grok Build with OpenRouter

Grok Build is provider-configurable. The supplement used a separate manifest and
private `GROK_HOME` with this model definition:

```toml
[models]
default = "openrouter-grok-4-6"

[model.openrouter-grok-4-6]
model = "x-ai/grok-4.6"
base_url = "https://openrouter.ai/api/v1"
name = "Grok 4.6 via OpenRouter"
env_key = "OPENROUTER_API_KEY"
```

The API key was read from a private `.env` file and was never printed, written
to the config, or stored in raw results. The supplement used a 3600-second
task timeout and 64 agent turns. All 12 task cells completed: light solo and
delegated arms scored 8/8; heavy solo and delegated arms scored 23/24 median.

This removes the native Grok Build quota block, but it is a new provider arm.
It does not replace the native `grok-build` result and does not make Grok Build
equivalent to Codex CLI. Running the same OpenRouter model through Codex would
measure Codex as the harness and should receive a distinct arm ID.

### fx

fx exposes a public model catalog without necessarily granting inference access:

```bash
fx --version
fx status --json
fx models | grep glm-5.2
```

`fx status --json` should show an authenticated state such as `fx login` or an
AI Gateway setup. `fx setup` requires an AI Gateway key. The completed run used
`fx ask --json --yolo --no-save --no-color -- PROMPT` with the native default
`zai/glm-5.2` model. fx completed all light trials but timed out on all three
heavy trials at 1800 seconds.

## Workloads

### Light Task

The light fixture is a small everyday maintenance issue:

```text
Implement retryWithBackoff in src/retry-with-backoff.js.
```

The requirements specify synchronous/asynchronous operations, one-based attempt
numbers, configurable attempts and base delay, injected exponential sleep, last
error propagation, no final sleep, and invalid-option validation. The task has
eight hidden checks. The public fixture intentionally keeps the implementation
as a placeholder and publishes only two visible tests.

### Heavy Task

The heavy fixture contains three independent packages:

- implementation;
- security;
- comprehension.

The root prompt asks the agent to complete all three package READMEs and run
their checks. The hidden grader has 24 checks. The comprehension prompt is the
clarified version that requires `comprehension/answer.json`.

The fixture is synthetic and separable. That makes delegation measurable, but
it is not a representative sample of real repositories and must not be called
SWE-bench or Terminal-Bench.

## Running the Private Benchmark

The complete runner and hidden grader remain in the private research workspace;
the public repository contains sanitized aggregates, the public fixture, and
the protocol but not provider transcripts or hidden graders.

From the private `reproducibility/harness-weight/` directory:

```bash
node --check run.mjs
node --check analyze.mjs
node run.mjs --dry-run
node run.mjs --phase micro
node run.mjs --phase task
node analyze.mjs
```

For the OpenRouter supplement, use a separate raw directory and manifest:

```bash
export HARNESS_WEIGHT_MANIFEST="$PWD/manifest-openrouter.json"
export HARNESS_WEIGHT_RAW_ROOT="$PWD/raw-openrouter"
export HARNESS_WEIGHT_RUN_ROOT="${TMPDIR:-/tmp}/harness-weight-openrouter-grok"
node run.mjs --dry-run
node run.mjs --phase task
HARNESS_WEIGHT_ANALYSIS_OUTPUT="$PWD/analysis-openrouter-results.json" node analyze.mjs
```

To run one arm/task pilot:

```bash
node run.mjs --phase task --arm pi-solo-luna-max --task light-maintenance --max-runs 1
node run.mjs --phase task --arm codex-solo-luna-max --task light-maintenance --max-runs 1
node run.mjs --phase task --arm cursor-solo-luna-max --task light-maintenance --max-runs 1
node run.mjs --phase task --arm grok-solo-grok-4.6 --task light-maintenance --max-runs 1
node run.mjs --phase task --arm fx-solo-glm-5.2 --task light-maintenance --max-runs 1
```

The runner is resumable. It skips a run ID that already has a result file.
Before a genuinely fresh rerun, remove only the private benchmark outputs and
temporary workspaces, not source code or other projects:

```bash
rm -rf raw/micro raw/tasks raw/outputs raw/metadata.json
export HARNESS_WEIGHT_RUN_ROOT="${TMPDIR:-/tmp}/harness-weight-study"
rm -rf "$HARNESS_WEIGHT_RUN_ROOT"
```

Then run the micro phase, pilots, remaining task phase, and analysis again.
Keep a new study ID and output directory if changing versions, prompts, models,
timeouts, or fixtures. Do not append incompatible runs to this study.

## Why the Design Is Defensible

The comparison controls the main sources of accidental resource variance:

- each task starts from a fresh fixture;
- the task prompt and hidden grader are fixed;
- the four primary task arms request the same Luna-max model family;
- startup order is frozen and randomized by a seed;
- task runs are sequential, avoiding intentional cross-run contention;
- the process-tree sampler includes child processes;
- short native commands use the same GNU-time fallback;
- grading is separated from the agent resource window;
- provider quota failures and task timeouts are retained with explicit statuses.

The design still cannot control model/provider implementation, network latency,
tool selection, delegated work amount, persistent daemon state, OS scheduling,
or provider-side computation. With three task trials per cell, use medians and
IQRs descriptively; do not infer universal rankings or statistical causation.

## Interpreting the Results

The strongest result is the startup result: fx had the lowest fresh-process RSS
and CPU in this environment. The matched task result is multidimensional:

- Pi had the lowest Luna-max solo peak tree RSS on both tasks;
- Codex had the lowest Luna-max solo heavy-task CPU;
- Cursor had the lowest Luna-max solo heavy-task wall time;
- OpenCode had the highest repeated Luna-max solo tree RSS in this setup.

Running Grok through Codex CLI would not reproduce Grok Build. It would measure
Codex CLI as the harness, with an xAI model/provider if Codex were configured to
support one. It would have different process topology, permissions, session
state, and resource results. It is a valid future arm called something like
`codex-xai-grok`, but it must not be merged into the `grok-build` arm or used as
a workaround for Grok Build quota.

Likewise, running Luna through Codex is useful and was done here, but it answers
the Codex-harness question. It does not say anything about Grok Build or fx.

## Public Data Boundary

The public release includes:

- `data/harness-weight-results.json`;
- `docs/harness-weight-manifest.json`;
- `docs/harness-weight-report.md`;
- `docs/harness-weight-thesis.pdf` and source;
- the public light fixture;
- the updated public validator.

It excludes raw JSONL/event streams, model transcripts, internal reasoning,
provider session identifiers, hidden grader source/output, private auth files,
temporary workspaces, and host-specific absolute paths. Those exclusions are
intentional privacy and licensing boundaries, not missing analysis files.
