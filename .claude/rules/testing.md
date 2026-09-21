---
paths:
  - "src/**/*.spec.ts"
---

# Test rules (Vitest)

- Arrange / Act / Assert, one behaviour per test, name: `should <result> when <condition>`.
- Stores: `TestBed` with the feature service replaced by `{ provide: GarmentsService, useValue: {...} }`.
  Never mock `HttpClient` in store tests.
- Mappers and pure model rules: plain unit tests, no TestBed.
- `core/http` and `core/auth`: `HttpTestingController` is allowed there.
- Components: `TestBed.createComponent`, set inputs with `fixture.componentRef.setInput()`.
- Time: pass `now` explicitly or use `vi.useFakeTimers()`. No real waits.
- No snapshot tests of Optimus UI markup.
- Every bug fix starts with a failing test.

## Required coverage for this project

These are not optional; a review rejects a change that lands without them.

**Scan state machine** — one test per state, proving the page renders the matching screen:
`unclaimed`, `claimable`, `owned`, `expired`, `foreign`, `invalid`.

**Security**

- `foreign`: the rendered DOM contains no owner name, no activation date, no stamp and no rating.
  Assert on the text content, not on a CSS class — hiding with CSS is not passing.
- Anonymous scan of a claimed shirt: renders the authenticity screen, and the passport service is
  never called.
- `expired`: renders the locked passport; stamp and rating elements are absent.
- The store never upgrades a state on its own: given `foreign` from the service, `state()` stays
  `foreign` even when an `AuthStore` session exists.
- The token never reaches `console`, `localStorage`, `sessionStorage` or a query string.

**Cross-feature reach**

A feature's spec may not import another feature (Sheriff and ESLint both reject it), so "the passport
service is never called from the scan flow" is proven by the boundary, not by a spy. What a scan spec
asserts instead is that its own service was used for reading only — `claim` is never called for a
state the server did not mark `claimable`.

**Auth redirect**

- An unauthenticated user on `/t/:token/activate` is sent to `/auth/login` with
  `returnUrl=/t/<token>/activate`.
- After login the user lands back on the same token route, not on a home page.
- A session that expires mid-flow refreshes once and retries, and on failure sends the user to login
  with the same `returnUrl`.
