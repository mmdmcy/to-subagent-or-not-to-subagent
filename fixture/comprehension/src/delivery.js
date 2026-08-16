import { runtime } from "./config.js"

export function dedupeKey(message) {
  return `${message.tenantId}:${message.event.id}`
}

export async function deliver(message, adapters) {
  for (let attempt = 1; attempt <= runtime.delivery.maxAttempts; attempt += 1) {
    try {
      await adapters.publish(runtime.delivery.topic, message, {
        key: dedupeKey(message),
      })
      return "delivered"
    } catch (error) {
      if (attempt === runtime.delivery.maxAttempts) {
        await adapters.deadLetter(message, {
          reason: "delivery_attempts_exhausted",
          cause: error,
        })
        return "dead-lettered"
      }
      await adapters.sleep(runtime.delivery.retryDelaysMs[attempt - 1])
    }
  }
}
