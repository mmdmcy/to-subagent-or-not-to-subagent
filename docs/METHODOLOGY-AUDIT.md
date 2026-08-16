# Methodology Audit

## Verdict

The main study is defensible for this narrow estimand:

> Among the seven predeclared deployment configurations, on one fixed synthetic
> separable JavaScript workload, one machine, one account, and the observed
> August 14 service window, which configuration produced the best quality-first
> combination of hidden-check score, normal completion, and elapsed agent time?

The answer is Cursor Grok 4.5 high solo. This does not prove that Grok is
universally better, that Cursor caused the advantage, or that no-subagent
architectures are always superior.

## Strengths

- The seven main arms, prompt, fixture, timeout, order seed, sample size, and
  quality-first rule were fixed before main outcomes.
- Five randomized complete blocks put every main arm in every block.
- The complete run, not an individual hidden check, was the experimental unit.
- Fixture files were copied and hashed per run.
- Deviations were documented and retained in the primary intention-to-treat
  analysis.
- The Grok 4.5 versus Sol contrast favored Grok in all five blocks and did not
  depend on one corrected score.

## Identification Boundary

Harness, model, reasoning effort, tool loop, permissions, turn budget, and
delegation policy differ together. The intervention is therefore a complete
deployment configuration. The study does not identify a pure causal effect of
subagents, Cursor, OpenCode, Grok, GPT-5.6, reasoning effort, or model capacity.

Unequal turn and capacity budgets are intentional for a practical deployment
comparison. They make the result unsuitable for equal-compute efficiency claims.

## Limitations

- One repeated synthetic workload favors separable delegation and does not
  represent coupled refactors, large repositories, UI work, or maintenance.
- Runs were sequential, not simultaneous. Random order reduces systematic order
  bias but cannot remove provider or host drift.
- Five blocks provide descriptive intervals, not broad population inference.
- The 24 hidden checks are a narrow constructed endpoint; they do not measure
  maintainability, human preference, or complete production security.
- OS-level isolation was not enforced. No hidden grader path appeared in a
  stream, but absence of observed leakage is not proof of non-access.
- Main-study source/config/runner/grader files were not externally immutable or
  hash-pinned before outcomes. The supplement records those hashes only after
  outcomes.
- Two bounded runs deviated from strict intended budgets, and natural Luna was
  right-censored at timeout. Intention-to-treat remains primary.

## Safe Claim

The safe public claim is:

> This benchmark provides substantial but narrow within-fixture evidence for a personal default
> among the tested deployment configurations, not a universal ranking or causal
> theory of coding agents.

## Stronger Follow-Up

A stronger study should precommit and externally archive hashes for the complete
source/config/runner/grader bundle; use containers or namespaces with read-only
graders, credential brokering, network policy, and filesystem auditing; use
multiple independent workloads and order seeds across days; equalize capacity or
analyze the capacity tradeoff explicitly; and add blinded human or rubric-based
quality review.
