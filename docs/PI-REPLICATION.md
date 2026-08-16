# Pi Replication

The earlier study did test GPT-5.6 models in Pi, but only one focused
architecture comparison.

## Arms

- `pi-single-sol-xhigh`: GPT-5.6 Sol, xhigh, solo.
- `pi-orchestrated-sol-xhigh-terra-medium`: GPT-5.6 Sol/xhigh parent with
  exactly three GPT-5.6 Terra/medium workers, one package per worker, and no
  worker delegation.

Pi was version 0.80.6 using its native `openai-codex` provider. Each arm ran
three trials, for six scored Pi outcomes. Delegation was faster in all three
pairs: 33.9% aggregate time reduction. Solo quality was 68/72; delegated
quality was 66/72. The descriptive paired time interval was wide because there
were only three pairs.

GPT-5.6 Luna was not used in any scored Pi arm. Luna was tested in the older
OpenCode worker screen and in the later OpenCode bounded, natural, and solo
supplement arms.

Pi was a conceptual cross-harness replication, not a full rerun of the later
Cursor/OpenCode matrix. It used different tools, a different extension, and a
clarified comprehension path.
