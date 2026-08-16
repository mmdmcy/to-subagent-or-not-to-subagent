# Public Protocol Summary

## Main Study

The main study was frozen before its August 14 outcomes. It used five randomized
complete blocks, one sequential run per arm per block, a 1,800-second process
cap, and a three-package JavaScript fixture with 24 hidden checks per run.

The arms were:

1. Cursor Grok 4.5 high solo.
2. Cursor Grok 4.6 high solo.
3. Cursor Grok 4.6 xhigh solo.
4. OpenCode Sol/xhigh solo.
5. OpenCode Sol/xhigh with three bounded Terra/medium workers.
6. OpenCode Sol/xhigh with three bounded Luna/max workers.
7. OpenCode Sol/xhigh with production-like Luna/max delegation.

The primary quality endpoint was hidden checks passed. The primary performance
endpoint was agent-process wall time. The operating rule required normal exits,
no observed model mismatch or forbidden changes, quality within one check of the
best aggregate score, and at least 7/8 security checks in every run. Among
eligible arms, lowest aggregate verified time was selected.

## Supplement

After the main result was known, five new randomized blocks compared OpenCode
Luna/max solo with Luna/xhigh solo. This supplement is post-hoc. Its internal
comparison is randomized; comparisons with historical main-study arms are
non-concurrent and descriptive.

## Historical Pi Replication

The earlier Pi replication used Pi 0.80.6 with the native `openai-codex` provider:
Sol/xhigh alone versus Sol/xhigh plus exactly three Terra/medium workers, three
pairs. It was a conceptual replication, not a full cross-harness rerun.
