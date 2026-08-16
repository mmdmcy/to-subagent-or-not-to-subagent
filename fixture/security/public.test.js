import test from "node:test"
import assert from "node:assert/strict"
import { applyProfilePatch, issueSession, sanitizeNext, verifySession } from "./src/session-boundary.js"

const secret = "0123456789abcdef0123456789abcdef"

test("round trips a valid session", () => {
  const token = issueSession({ id: "u1", role: "user" }, secret, { now: 1_700_000_000_000 })
  assert.deepEqual(verifySession(token, secret, { now: 1_700_000_001_000 }), {
    sub: "u1",
    role: "user",
    iat: 1_700_000_000,
    exp: 1_700_000_900,
  })
})

test("keeps internal redirects", () => {
  assert.equal(sanitizeNext("/account?tab=billing"), "/account?tab=billing")
  assert.equal(sanitizeNext("https://evil.example"), "/")
})

test("profile patch preserves authority", () => {
  assert.deepEqual(applyProfilePatch({ id: "u1", role: "user" }, { displayName: "A", role: "admin" }), {
    id: "u1",
    role: "user",
    displayName: "A",
  })
})
