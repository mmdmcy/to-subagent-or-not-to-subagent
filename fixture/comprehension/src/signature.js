import crypto from "node:crypto"

export const SIGNATURE_HEADER = "X-Katteke-Signature-256"

export function authenticate(rawBody, signature, secret) {
  if (typeof signature !== "string") return false
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
  const actual = signature.replace(/^sha256=/, "")
  if (actual.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
}
