# Session Boundary Security Repair

Audit and repair `src/session-boundary.js`. Preserve the exported API and use only Node.js built-ins.

## Public API

### `issueSession(user, secret, options?)`

Returns `<payload>.<signature>`. The payload is base64url-encoded UTF-8 JSON and the signature is base64url HMAC-SHA256 over the encoded payload. The payload contains only:

- `sub`: non-empty string from `user.id`
- `role`: `"user"` or `"admin"`
- `iat`: integer Unix seconds
- `exp`: integer Unix seconds

`options.now` is milliseconds since epoch and defaults to `Date.now()`. `options.ttlSeconds` defaults to 900 and must be a positive integer. `secret` must be a string or Buffer with at least 32 bytes.

### `verifySession(token, secret, options?)`

Authenticates the token and returns `{ sub, role, iat, exp }`. `options.now` has the same meaning as above. Reject malformed, non-canonical, tampered, expired, not-yet-valid, or wrongly typed tokens. A token is expired when `exp <= floor(now / 1000)`. Allow at most 30 seconds of future clock skew for `iat`.

### `sanitizeNext(value)`

Returns a safe same-origin absolute path beginning with one `/`, or `/` for unsafe input. Query strings and fragments are allowed. Reject protocol-relative URLs, schemes, user-info tricks, backslashes, control characters, and encoded forms that decode into those constructs. Invalid percent-encoding is unsafe.

### `applyProfilePatch(current, patch)`

Returns a new plain object retaining `current.id` and `current.role`. Only own `displayName` and `timezone` string properties from `patch` may be changed. Ignore inherited properties and all other keys. Do not mutate either argument and do not permit prototype pollution.
