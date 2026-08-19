import test from "node:test"
import assert from "node:assert/strict"
import { retryWithBackoff } from "../src/retry-with-backoff.js"

test("returns the first successful result", async () => {
  const attempts = []
  const result = await retryWithBackoff(async (attempt) => {
    attempts.push(attempt)
    return "ready"
  })

  assert.equal(result, "ready")
  assert.deepEqual(attempts, [1])
})

test("retries with injected exponential delays", async () => {
  const attempts = []
  const delays = []
  const result = await retryWithBackoff((attempt) => {
    attempts.push(attempt)
    if (attempt < 3) throw new Error(`failure-${attempt}`)
    return attempt
  }, {
    maxAttempts: 3,
    baseDelayMs: 5,
    sleep: async (delayMs, attempt) => delays.push([delayMs, attempt]),
  })

  assert.equal(result, 3)
  assert.deepEqual(attempts, [1, 2, 3])
  assert.deepEqual(delays, [[5, 1], [10, 2]])
})
