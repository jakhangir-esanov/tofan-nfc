# passport

## Purpose

Renders the shirt's digital passport for its owner: a booklet with a cover, a data page and a stamps
page.

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
  models/{passport,stamp}.ts
  services/{passport.dto,passport.mapper,passport.service}.ts
  passport.store.ts
  pages/passport-page/
  passport.routes.ts
```

The booklet container is `shared/components/passport-book`; pages inside it carry the global
`.passport-page` class so the track can lay them out.

## State

`PassportStore` holds the passport, `loading`, `loadError`, and derives `locked` from the server's
`isExpired` flag and `stamps` from the payload. It never compares `expiresAt` to the device clock.

## Security notes

The route needs a session, but ownership is enforced by the backend: a non-owner gets 403 and the
screen shows an error rather than inventing a state. When the passport is expired the server omits
stamps and rating entirely, so the locked view has nothing to hide.

## Decisions

Page turning is a CSS transform on a track plus pointer-event swipe and keyboard arrows — no carousel
library. Motion tokens collapse under `prefers-reduced-motion`. The 3D page-turn and stamp press
animation are phase 3.
