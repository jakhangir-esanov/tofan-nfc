---
paths:
  - "src/app/features/scan/**/*.ts"
  - "src/app/features/passport/**/*.ts"
  - "src/app/core/auth/**/*.ts"
---

# NFC security rules

## Threat model

The chip is a passive tag holding a plain URL. It can be read by any phone, photographed, forwarded and
replayed. Assume the token is public the moment the shirt leaves the factory.

Real risks, in order:

1. **Someone else claims an unactivated shirt.** A shirt in a shop window, a returned parcel, a leaked
   link sheet. Mitigation is server-side: one claim per shirt, rate limit per token and per account,
   admin can revoke and reissue a token.
2. **A stranger reads the owner's data.** Whoever taps a claimed shirt in a gym must see nothing
   personal. This is the frontend's main obligation.
3. **A cloned chip.** The token alone cannot prevent this; it only proves the *link* is genuine. The TZ
   raises dynamic-signature chips (rolling code) — that is a hardware and backend decision, not ours.
   Never claim in the UI that a shirt is verified beyond what the backend actually asserts.

## Rules

- The token proves nothing. It selects a shirt; it never authenticates a person.
- The server returns the scan state. The frontend renders it. It never infers a state from an HTTP
  status, from `AuthStore`, from the clock or from a previous scan.
- A `foreign` or anonymous response must not contain owner name, activation date, expiry, rating or
  stamps. If a payload contains them, that is a backend bug — report it, do not filter it in the mapper
  and call it fixed.
- Ownership, expiry and claim limits are enforced server-side on every request. A hidden button is UX.
- The token lives in the URL and in the API path. It must never appear in:
  `console`, an analytics or error-reporting payload, `localStorage`/`sessionStorage`, a query string, a
  `Referer` sent to a third party, or a page title. Set `<meta name="referrer" content="no-referrer">`
  and keep external links `rel="noreferrer"`.
- Never put the token into the passport's share or deep link into the mobile app. Deep links use the
  garment id from an authenticated response.
- Handle these states explicitly, never as a generic error: revoked token, transferred shirt,
  rate-limited scan (429), shirt hidden by admin.
- Registration and claim are separate steps in the UI but must be safe in any order: a user who
  registers and abandons must be able to return and claim; a claim on an already-claimed shirt shows
  "this shirt is already activated" and never reveals who activated it.
- Ask before adding anything that transmits scan data off-platform (analytics, heatmaps, session replay).
