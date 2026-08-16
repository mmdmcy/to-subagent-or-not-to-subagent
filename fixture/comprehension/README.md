# Event Pipeline Comprehension

Inspect this package and write `answer.json` in this package directory (`comprehension/answer.json` from the combined repository root). Do not change source files.

The file must be valid JSON with exactly these keys:

```json
{
  "billingRoute": "",
  "acceptedBillingEvents": [],
  "billingTopic": "",
  "dedupeKey": "",
  "maxDeliveryAttempts": 0,
  "retryDelaysMs": [],
  "deadLetterReason": "",
  "signatureHeader": ""
}
```

Use literal values from the effective runtime path, not comments or obsolete exports. For `dedupeKey`, write the JavaScript template expression without backticks. Preserve event names and header casing exactly as implemented.
