import { runtime } from "./config.js"
import { deliver } from "./delivery.js"
import { normalizeBilling } from "./normalize.js"
import { authenticate, SIGNATURE_HEADER } from "./signature.js"

export function registerBillingRoute(router, adapters) {
  router.post(runtime.routes.billing, async (request, response) => {
    const signature = request.headers[SIGNATURE_HEADER.toLowerCase()]
    if (!authenticate(request.rawBody, signature, adapters.webhookSecret)) {
      response.statusCode = 401
      response.end("invalid signature")
      return
    }

    const message = normalizeBilling(JSON.parse(request.rawBody))
    if (!message) {
      response.statusCode = 202
      response.end("ignored")
      return
    }

    await deliver(message, adapters)
    response.statusCode = 202
    response.end("accepted")
  })
}
