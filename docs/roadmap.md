# Roadmap

Scope agreed 2026-09-21. Phase 1 is what v1 ships.

## Phase 1 — scan, auth, passport (current)

Frontend

- Project setup: Optimus UI 2 + theme preset, Tailwind, ESLint, Sheriff, path aliases, `core/http`,
  `core/auth`, `core/layout` mobile shell, i18n for `uz`/`ru`/`en`
- `features/scan`: scan landing, activation, authenticity, invalid states
- `features/auth`: register (name, email, password), login, `returnUrl` handling
- `features/passport`: booklet with cover, data page and, when the backend sends `standing`, a rating
  page (rank, lifetime DP, level); no stamps page until the backend sends stamps
- Locked passport for the expired state, with a disabled renew action
- Required tests, including the security set in `.claude/rules/testing.md`

Backend (`tofan` repository)

- Garment module: entity, 160-bit token, scan, claim, passport, `me/garments`, admin status and
  extend — **done** (2026-09-22), not yet exercised against a deployed server
- Rate limiting: dropped by the backend; a 160-bit token cannot be enumerated, DoS protection sits in
  nginx
- Stamp storage and read endpoint: moved to phase 3 with Gamification

Out of scope: payments, stamp awarding, the multi-shirt list, the admin panel.

### Open items inside phase 1

- `src/locale/messages.ru.xlf` and `messages.en.xlf`: every unit translated (`state="translated"`).
- Password fields: wrapped in `shared/components/password-input` implementing `FormValueControl` over Optimus `p-password`.
- `auth-token.interceptor` and `session.interceptor`: specs written and passing.
- The passport booklet turns pages with a horizontal slide. The 3D page-turn and the stamp press
  animation are still to be built.
- A registration whose profile step fails leaves the account usable and warns with a toast; a dedicated
  "finish your profile" screen is still to be built.

## Phase 2 — validity and payment

- Renewal screen, Payme/Click integration, webhook-driven state change
- Locked passport becomes actionable; reminders 7 and 1 days before expiry (push, not SMS)
- Open questions to answer first: price, period

## Phase 3 — stamps

- Stamp award animation and push notification
- Stamp kinds: personal record, achievement, rank, special
- Stamps page in the booklet — needs the backend to add `stamps` to the passport response first
- The rating already ships on its own booklet page (2026-10-11)

## Phase 4 — multiple shirts and admin

- `/my/garments` list, switching between passports
- `/my/garments` reads `GET /me/garments`, which already exists
- Admin screens in `tofan-ui`: create shirts, export links (`.xlsx`), status, extend validity, award a
  special stamp, block an account. There is no regenerate-token endpoint, by design
- Ownership transfer, if the product owner wants resold shirts to move

## Deferred

- SMS verification: no provider on the platform. Registration stays email-based until that changes.
- Dynamic-signature (rolling code) chips: hardware decision, changes the backend token check, not the UI.
- Deep link into the mobile app after activation: needs the app's scheme and a store fallback.
