# Grok Build OpenRouter Supplement

## Purpose

The original Grok Build arm used the native `grok-build` service and exhausted
the free Grok Build usage quota after its first successful requests. This
supplement keeps the Grok Build harness but routes it to `x-ai/grok-4.6` through
OpenRouter using a private API key. It answers whether the quota problem can be
separated from the local harness measurement.

This is a new study, not a replacement for the native-model arm:

- study ID: `harness-weight-openrouter-grok-2026-08-20`;
- model: `x-ai/grok-4.6` through `https://openrouter.ai/api/v1`;
- harness: Grok Build 1.0.5;
- task timeout: 3600 seconds;
- agent turn limit: 64;
- task trials: three per solo/delegated arm and task;
- observed task runs: 12/12 completed.

## Private Configuration

The runner generated this private config in an isolated per-run `GROK_HOME`:

```toml
[models]
default = "openrouter-grok-4-6"

[model.openrouter-grok-4-6]
model = "x-ai/grok-4.6"
base_url = "https://openrouter.ai/api/v1"
name = "Grok 4.6 via OpenRouter"
env_key = "OPENROUTER_API_KEY"
```

The API key was read from the local `.env` file without printing it, writing it
to the config, storing it in result records, or committing it. Native xAI
credentials were removed from the custom arm environment so the request route
was unambiguous.

## Results

Median values across three trials. RSS is peak resident memory of the local
process tree, CPU is summed user plus system CPU time, and wall is agent elapsed
time excluding grading.

| Arm | Task | Peak RSS | CPU | Wall | Score |
| --- | --- | ---: | ---: | ---: | ---: |
| Solo | Light | 213.9 MB | 0.54 s | 27.0 s | 8/8 |
| Delegated | Light | 163.6 MB | 0.60 s | 29.1 s | 8/8 |
| Solo | Heavy | 220.4 MB | 1.41 s | 380.7 s | 23/24 |
| Delegated | Heavy | 307.7 MB | 6.92 s | 692.6 s | 23/24 |

All 12 custom-provider task attempts completed. Delegation increased median
heavy-task RSS by approximately 40%, CPU by approximately 391%, and wall time by
approximately 82% in this supplement. The delegated arm did more work and is
not a pure harness-overhead control.

## Interpretation

This result resolves the practical quota question: Grok Build can use a custom
OpenAI-compatible model endpoint, and using OpenRouter removed the native free
quota block for this run. The local Grok Build process tree remained relatively
small compared with the Luna-max OpenCode/Codex/Cursor/Pi task arms.

The result does not prove that OpenRouter Grok is universally more efficient.
The route, provider backend, model serving behavior, tool calls, prompt state,
and model output all differ from the native `grok-build` service. The correct
label is **Grok Build with OpenRouter Grok 4.6**, not simply Grok Build.

Running Grok 4.6 through Codex CLI would be a different arm again: **Codex CLI
with an xAI/OpenRouter model**. It may be useful as a future cross-harness
comparison, but it cannot be substituted for this Grok Build measurement.

## Reproduction

Set `OPENROUTER_API_KEY` in a private environment or `.env` file. Never commit
that file. From the private harness-weight directory:

```bash
export HARNESS_WEIGHT_MANIFEST="$PWD/manifest-openrouter.json"
export HARNESS_WEIGHT_RAW_ROOT="$PWD/raw-openrouter"
export HARNESS_WEIGHT_RUN_ROOT="${TMPDIR:-/tmp}/harness-weight-openrouter-grok"

node run.mjs --dry-run
node run.mjs --phase task
HARNESS_WEIGHT_ANALYSIS_OUTPUT="$PWD/analysis-openrouter-results.json" node analyze.mjs
```

The public release contains the sanitized manifest and aggregate analysis, but
not the API key, raw event streams, private workspaces, or hidden grader.

## References

- [Grok Build source repository](https://github.com/xai-org/grok-build)
- [Grok Build custom-model configuration](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-pager/docs/user-guide/05-configuration.md)
- [Grok Build authentication](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-pager/docs/user-guide/02-authentication.md)
- [OpenRouter model catalog](https://openrouter.ai/models)
