# passport

## Purpose

Renders the shirt's digital passport for its owner: a booklet with a cover and a data page. The
stamps page and the rating arrive with Gamification; the backend sends neither today.

## Routes

| Route                | Guard       | Screen         |
| -------------------- | ----------- | -------------- |
| `/t/:token/passport` | `authGuard` | `PassportPage` |

Registered above `/t/:token` in `routes/app.routes.ts` so the more specific path wins.

## Backend endpoints

| Endpoint                               | Method | Used by                |
| -------------------------------------- | ------ | ---------------------- |
| `/garments/by-token/{token}/passport`   | GET    | `PassportService.read` |

## Structure

```text
features/passport/
  models/passport.ts            Passport, holderName
  models/rescan-rule.ts         which backend codes send the page back to the scan
  services/{passport.dto,passport.mapper,passport.service}.ts
  passport.store.ts
  pages/passport-page/
  passport.routes.ts
```

The booklet container is `shared/components/passport-book`; pages inside it carry the global
`.passport-page` class so the track can lay them out. Both pages use the site's dark surface
(`.passport-page--cover`, `.passport-page--paper` in `src/styles/styles.css`); long values such as a
26-character ULID serial wrap instead of overflowing at 375px.

## State

`PassportStore` holds the passport, `loading`, `loadError`, and derives `locked` from the server's
`isExpired` flag. It never compares `expiresAt` to the device clock. On `Garment.NotOwner` (400),
`Garment.NotFound` (404) or `Garment.NotAvailable` (409) it sets `rescanNeeded`, and the page goes back
to `/t/:token` so the scan endpoint decides what the visitor sees.

## Security notes

The route needs a session (checked in the browser: on the server there is never a session, so `authGuard`
lets server rendering through and the passport is only fetched after hydration; otherwise every reload
or language switch detoured through the login page), but ownership is enforced by the backend: a non-owner gets
`Garment.NotOwner` and is sent back to the scan rather than the page inventing a state. The rescan rule
switches on the backend `code`, never on the HTTP status.

## Decisions

Page turning is a CSS transform on a track plus pointer-event swipe and keyboard arrows — no carousel
library. Motion tokens collapse under `prefers-reduced-motion`. The 3D page-turn and stamp press
animation are phase 3.
