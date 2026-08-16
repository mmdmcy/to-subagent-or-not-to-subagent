const aliases = new Map([
  ["invoice.settled", "invoice.paid"],
  ["subscription.ended", "subscription.cancelled"],
])

const accepted = new Set([
  "invoice.paid",
  "invoice.failed",
  "subscription.cancelled",
])

export function normalizeBilling(input) {
  const type = aliases.get(input.type) ?? input.type
  if (!accepted.has(type)) return undefined
  return {
    tenantId: String(input.account),
    event: {
      id: String(input.id),
      type,
      occurredAt: input.created,
    },
  }
}

export const acceptedBillingEvents = Object.freeze([...accepted])
