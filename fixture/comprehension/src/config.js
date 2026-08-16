const legacy = {
  topic: "billing.events.v1",
  maxAttempts: 9,
}

export const runtime = Object.freeze({
  routes: {
    billing: "/hooks/billing/v2",
  },
  delivery: {
    topic: process.env.BILLING_TOPIC || "billing.events.v3",
    maxAttempts: 4,
    retryDelaysMs: [250, 1000, 4000],
  },
  legacy,
})
