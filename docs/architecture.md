# Architecture

## What this app is

A customer-facing web app with one entry point: a phone tapping an NFC chip sewn into a Peaktofan
shirt. It opens `https://<domain>/t/<token>`, the server says what that token means for this visitor,
and the app renders the matching screen. Everything else — the admin panel (`tofan-ui`), the mobile app,
the backend (`tofan`) — lives elsewhere.

## Decisions

### Feature-based structure, no Clean Architecture

Same as `tofan-ui`: `core/`, `features/<x>/`, `shared/`, `routes/`. No domain/application/
infrastructure layers, no repositories, no use-case classes. This app has eight screens and one
interesting rule; layering it would add files without adding safety. Components talk to stores, stores
talk to services, services talk to `ApiClient`.

### The server owns the scan state

The single most important decision. `GET /garments/by-token/{token}` returns one of six states, and the
frontend renders it. The alternative — fetching the garment and deciding in Angular whether the visitor
is the owner, whether the shirt is expired, whether it is claimable — puts an authorization decision in
code that anyone can read and modify. It also duplicates a rule that must exist on the server anyway.

Consequences:

- The scan state is a discriminated union; adding a state is a compile error everywhere it is handled.
- The frontend never turns a 403 into "foreign", never compares `expiresAt` to the clock to unlock, and
  never carries a state from one token to another.
- A stranger's response does not contain the owner's data at all. There is nothing to hide in the UI.

### The token stays in the path

Every screen behind a scan keeps the token in its URL (`/t/:token/passport`). Logging in must return the
user to the same shirt, and a second tap must reopen the same passport. `returnUrl` carries the full
path. The cost is that the token is visible in history and in the address bar — acceptable, because the
token is public by nature and proves nothing on its own.

### Registration is email plus password

The TZ specifies phone plus SMS code. Tofan has no SMS provider, and adding one is a platform decision
outside this project. So registration uses the existing `POST /auth/register` (username, email,
password) followed by `POST /profiles` for the name. Phone remains an optional, unverified field.

This is the one place where this app knowingly diverges from the TZ. If SMS is added to the platform
later, it belongs in `core/auth` and changes one screen.

### SSR stays on

The first paint happens on a phone, on mobile data, seconds after a tap, often in a gym. Server-side
rendering earns its complexity here. The price is discipline: no `window`, `document` or
`localStorage` outside `afterNextRender()` / `isPlatformBrowser`, and session storage confined to
`core/auth`.

### Angular i18n rather than a runtime dictionary

Chosen by the product owner. Three locales (`uz`, `ru`, `en`) mean three builds and three server
bundles in the deployment pipeline, served under `/`, `/ru/`, `/en/`. In exchange, translations are
compile-time checked and there is no dictionary shipped to the client.

### The garment shape lives in `shared/`

`Garment` is read by both `scan` and `passport`, and features may not import each other. Its model, DTO
and mapper therefore live in `shared/models/` (`garment.ts`, `garment.dto.ts`, `garment.mapper.ts`)
rather than in one feature's `services/`. Everything that belongs to a single feature — the scan state
union, the passport and its stamps — stays inside that feature.

### No new dependency for the passport booklet

The page-turn effect is CSS 3D transforms plus `@angular/cdk` swipe, in one shared component. A
carousel or animation library would ship more than this app needs and would be harder to make
accessible and reduced-motion safe.

## Boundaries

```
NFC chip  →  /t/<token>  →  Angular (this repo)  →  .NET API (tofan)  →  Keycloak
                                                         ↓
                                                    PostgreSQL
```

Angular never calls Keycloak directly and never holds a Keycloak secret. Authorization happens in the
API. The admin panel that creates shirts and writes chips is `tofan-ui`, not this repository.

## Known gaps

- The garment module does not exist in the backend yet (`docs/backend-contract.md`).
- Chip cloning cannot be solved by a static token. Dynamic-signature chips are a hardware decision; the
  UI must not claim more verification than the backend performs.
- Payments, stamp awarding and multi-shirt accounts are later phases (`docs/roadmap.md`).
