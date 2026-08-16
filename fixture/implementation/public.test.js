import test from "node:test"
import assert from "node:assert/strict"
import { mapConcurrent } from "./src/task-pool.js"

test("maps values in input order", async () => {
  const result = await mapConcurrent([3, 1, 2], async (value) => {
    await new Promise((resolve) => setTimeout(resolve, value * 2))
    return value * 10
  }, { concurrency: 2 })
  assert.deepEqual(result, [30, 10, 20])
})

test("rejects invalid concurrency", async () => {
  await assert.rejects(() => mapConcurrent([], (value) => value, { concurrency: 0 }), RangeError)
})
