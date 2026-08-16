import crypto from "node:crypto"

const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url")

export function issueSession(user, secret, options = {}) {
  const now = Math.floor((options.now ?? Date.now()) / 1000)
  const ttl = options.ttlSeconds ?? 900
  const payload = encode({ ...user, sub: user.id, iat: now, exp: now + ttl })
  const signature = crypto.createHash("sha256").update(payload + String(secret)).digest("base64url")
  return `${payload}.${signature}`
}

export function verifySession(token, secret, options = {}) {
  const [payload] = token.split(".")
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
}

export function sanitizeNext(value) {
  if (typeof value !== "string" || !value.startsWith("/")) return "/"
  return value
}

export function applyProfilePatch(current, patch) {
  return Object.assign({}, current, patch)
}
