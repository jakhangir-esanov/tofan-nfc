# Peaktofan NFC

Customer-facing web app for Peaktofan shirts with an NFC chip. Tapping a phone on a shirt opens
`https://<domain>/t/<token>`; the server decides what that token means for the visitor, and the app
renders the matching screen — registration, activation, the shirt's digital passport, or a plain
authenticity check for a stranger.

Part of the Tofan ecosystem: the backend is `tofan` (.NET 10), the admin panel is `tofan-ui`.
This repository is neither.

Angular 22 · TypeScript 6 (strict) · Optimus UI 2 · SSR · Vitest.

## Documentation

| Document | Contents |
| -------- | -------- |
| `CLAUDE.md` | Project rules. Read before writing code. |
| `docs/product-brief.md` | The marketing TZ, summarised, with the places we deliberately diverge |
| `docs/pages.md` | Every page, every scan state, and the visual design |
| `docs/architecture.md` | Why it is built this way |
| `docs/backend-contract.md` | Endpoints and DTO shapes, checked against the backend code |
| `docs/backend-task.md` | The garment module specified for the backend team, in Uzbek |
| `docs/roadmap.md` | Scope per phase |

## Commands

```bash
npm start             # ng serve, /api proxied to the backend, Uzbek only
npm run serve:ssr     # build every locale and serve them on :4200 like production
npm run build
npm test
npm run lint
```

There is no mock backend: the dev server needs a running backend.

`ng serve` can only serve one locale, so on `npm start` the RU/EN switch leads to `/ru/...`, which the
dev server does not know. To try the language switch, run `npm run serve:ssr`: it builds uz, ru and en
and starts the SSR server with the settings in `ssr.env` (port 4200, `API_PROXY_TARGET` pointing at the
backend). `src/api-proxy.ts` forwards `/api` only when `API_PROXY_TARGET` is set; the Docker image sets
it to `http://tofan-api:8080`. There is no hot reload on this path: rebuild after a change.

Deployment (Docker image, Swarm stack, nginx, the required `NG_ALLOWED_HOSTS`): `docs/deployment.md`.

## Status

Phase 1 (scan, auth, passport) is in design. The garment endpoints do not exist in the backend yet —
see `docs/backend-contract.md`.
