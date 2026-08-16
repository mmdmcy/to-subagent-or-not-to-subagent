# Raw Data Disposition

## Included

- Sanitized per-run outcome ledgers with scores, times, exit status, model class,
  and topology counts.
- Aggregate analyses and block-level contrasts.
- Public fixture and public tests.
- Protocol, deviations, methodology audit, and Pi summary.

## Withheld

- Full Cursor/OpenCode/Pi streams.
- Encrypted or internal reasoning payloads.
- Session IDs, internal request IDs, and host-specific paths.
- Hidden grader source and raw grader output.
- OAuth copies, local databases, and live configuration.

These artifacts are withheld because they contain unnecessary internal metadata,
transcripts, absolute paths, and hidden expected answers. Their absence means
the public repository is an auditable report package, not a fully replayable
provider-inference archive. The aggregate claims are tied to the private raw
archive by the local SHA-256 manifests, which are not themselves sufficient to
recover withheld files.
