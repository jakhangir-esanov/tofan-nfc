# Roadmap

Scope agreed 2026-09-21. Phase 1 is what v1 ships.

## Phase 1 — scan, auth, passport (current)

Frontend

- Project setup: Optimus UI 2 + theme preset, Tailwind, ESLint, Sheriff, path aliases, `core/http`,
  `core/auth`, `core/layout` mobile shell, i18n for `uz`/`ru`/`en`
- `features/scan`: scan landing, activation, authenticity, invalid states
- `features/auth`: register (name, email, password), login, `returnUrl` handling
- `features/passport`: booklet with cover, data page and stamps page; stamps read-only
- Locked passport for the expired state, with a disabled renew action
- Required tests, including the security set in `.claude/rules/testing.md`

Backend (blocking, `tofan` repository)

- Garment module: entity, 128-bit token, claim, passport query, revoke
- Rate limiting on scan and claim
- Stamp storage and read endpoint

Out of scope: payments, stamp awarding, the multi-shirt list, the admin panel.

### Open items inside phase 1

- `src/locale/messages.ru.xlf` and `messages.en.xlf` are generated with `state="new"` targets that still
  hold the Uzbek source. The ru and en builds therefore render Uzbek text until a translator fills them.
- The passport booklet turns pages with a horizontal slide. The 3D page-turn and the stamp press
  animation are still to be built.
- Password fields use a plain `pInputText`; a `shared/components` wrapper implementing
  `FormValueControl` would bring back the Optimus password control (see `docs/pages.md`).
- Distinct copy for a revoked, transferred or admin-hidden chip waits on the backend sending a `reason`
  with the `Invalid` state (`docs/backend-contract.md`).
- A registration whose profile step fails leaves the account usable and warns with a toast; a dedicated
  "finish your profile" screen is still to be built.

## Phase 2 — validity and payment

- Renewal screen, Payme/Click integration, webhook-driven state change
- Locked passport becomes actionable; reminders 7 and 1 days before expiry (push, not SMS)
- Open questions to answer first: price, period

## Phase 3 — stamps and rating

- Stamp award animation and push notification
- Stamp kinds: personal record, achievement, rank, special
- Rating on the cover and the stamps page
- Open question to answer first: how rating is computed, per account or per shirt

## Phase 4 — multiple shirts and admin

- `/my/garments` list, switching between passports
- Admin screens in `tofan-ui`: create shirts, CSV import, export links, regenerate a token,
  extend validity, award a special stamp, block an account
- Ownership transfer, if the product owner wants resold shirts to move

## Deferred

- SMS verification: no provider on the platform. Registration stays email-based until that changes.
- Dynamic-signature (rolling code) chips: hardware decision, changes the backend token check, not the UI.
- Deep link into the mobile app after activation: needs the app's scheme and a store fallback.
