# Concurrent Task Pool

Implement `mapConcurrent` in `src/task-pool.js`.

## Contract

```js
mapConcurrent(iterable, worker, options?)
```

- `iterable` may be a synchronous or asynchronous iterable.
- `worker(value, index)` may return a value or a promise.
- Return a promise for an array of results in input order.
- `options.concurrency` defaults to `4` and must be a positive integer.
- Never have more than `concurrency` worker promises active at once.
- Empty iterables resolve to `[]`.
- On the first worker failure, stop pulling new input, close the iterator when possible, wait for already-started workers to settle, and reject with the original error.
- Support `options.signal`. If it is already aborted, do not consume input. If it aborts during work, stop pulling, close the iterator, wait for started workers, and reject with an `AbortError` whose `cause` is `signal.reason` when one exists.
- Do not leak unhandled promise rejections.

Keep the public API unchanged and use only Node.js built-ins.
