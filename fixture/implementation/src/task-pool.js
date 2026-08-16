function abortError(reason) {
  const error = new Error("The operation was aborted")
  error.name = "AbortError"
  if (reason !== undefined) error.cause = reason
  return error
}

export async function mapConcurrent(iterable, worker, options = {}) {
  const concurrency = options.concurrency ?? 4
  const signal = options.signal

  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new RangeError("concurrency must be a positive integer")
  }
  if (signal?.aborted) throw abortError(signal.reason)

  const results = []
  let index = 0

  // This implementation is deliberately incomplete: it is correct only for
  // synchronous iterables and executes every item serially.
  for (const value of iterable) {
    if (signal?.aborted) throw abortError(signal.reason)
    results[index] = await worker(value, index)
    index += 1
  }

  return results
}
