---
name: scan-screen
description: Builds or changes a screen driven by the NFC scan state (scan landing, activation, authenticity, locked passport) in the Peaktofan NFC app. Use whenever the user asks for an NFC screen, a new scan state, "skan sahifasi", "aktivatsiya", /nfc or /scan.
---

# Scan-driven screen

Every screen behind `/t/:token` is a projection of one server-owned state. Adding a screen means
adding a state to the union and a branch to the switch — never an `if` in a component.

## Before writing code

1. Which state does this screen serve? `unclaimed`, `claimable`, `owned`, `expired`, `foreign`,
   `invalid` — or a new one that the backend must return.
2. What does the backend send for that state, and what must it **not** send
   (`docs/backend-contract.md`)? If a state needs a field the API does not return, stop: this is a
   backend change, not a frontend workaround.
3. What does a stranger holding only the token see on this screen?

## Build order

1. **models** — add the member to the `GarmentScan` union in `features/scan/models/garment-scan.ts`.
   The compiler now lists every place to update. Add its label and copy to the state map.
2. **services** — extend `garment-scan.dto.ts` with the integer enum member and map it by name in
   `garment-scan.mapper.ts`. Add a mapper spec for the new state, including which fields stay absent.
3. **store** — nothing to decide: `ScanStore` stores what the server returned. Add a command method
   only if the screen performs a write (claim, renew), and reload the scan from the server after it.
4. **page** — add a branch to the `@switch` in `scan-page.html`, rendering a screen component.
   Redirects (to login, to the passport) happen in the page, not in the store.
5. **components** — build the screen with `shared/components/state-screen` and `garment-preview`.
   Mobile first, one primary action in the sticky bottom bar, `i18n` on every string.
6. **tests** — a state test and the security assertions from `.claude/rules/testing.md`.
7. **verify** — `npm run lint && npm test && npm run build`, then `architecture-reviewer` and
   `nfc-security-reviewer`.

## Quality bar

- Loading is a branded splash, not a bare spinner: the user just tapped a shirt and expects Peaktofan.
- A network failure shows a retry, never an "invalid shirt" message. Mixing the two teaches customers
  that a genuine shirt looks fake on bad Wi-Fi.
- Every outcome has a next step: register, activate, open the app, contact support. No dead ends.
- Anonymous states render without a session and without calling a protected endpoint.
- The token stays in the URL. It never reaches a log, an analytics call or storage.
