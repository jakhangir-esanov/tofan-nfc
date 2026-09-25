# Backend contract

Status: **implemented**. The garment endpoints below ship in the `Garment` module of the `tofan`
repository (2026-09-22; see `docs/garment-module.md` there). `Shop` and `Gamification` are still empty
module shells, so the passport carries neither a rating nor stamps. The auth and profile endpoints are
real and verified against `D:\Projects\tofan`.

This file is the single source for DTO shapes in `features/<x>/services/`. When the backend changes,
compare against the staging Swagger and update here first.

## Base

- Base URL token: `API_BASE_URL` (`core/http/api-base-url.ts`), from `environment.apiBaseUrl`.
  Development uses `/api`, proxied by `proxy.conf.json`.
- Routes have no `/api` prefix on the backend itself.
- Auth: `Authorization: Bearer <access_token>` from Keycloak (realm `tofan`), attached by
  `core/auth/auth-token.interceptor.ts` for `API_BASE_URL` requests only.
- JSON is camelCase. Enums travel as integers.

## Success envelope

Commands and single-item queries return `Result<T>` with status 200:

```json
{
  "isSuccess": true,
  "isFailure": false,
  "error": { "code": "", "message": "", "messages": { "en": "", "uz": "", "ru": "" }, "type": 0 },
  "data": {}
}
```

`core/http/ApiClient` unwraps `data`.

## Errors

RFC 7807 ProblemDetails built by `ApiResults.Problem`:

```json
{
  "title": "Garment.NotFound",
  "status": 404,
  "detail": "The specified garment was not found.",
  "messages": {
    "en": "The specified garment was not found.",
    "uz": "Ko'rsatilgan kiyim topilmadi.",
    "ru": "Указанная одежда не найдена."
  },
  "errors": [
    {
      "propertyName": "email",
      "code": "NotEmptyValidator",
      "message": "'Email' must not be empty.",
      "messages": { "en": "…", "uz": "…", "ru": "…" },
      "type": 2
    }
  ]
}
```

Since backend commit `203860a` (`tofan/docs/mobile-errors-v1.md`) every error response carries
`messages: { en, uz, ru }`, including 409 `Conflict.DuplicateKey` and 500, and so does every item of
`errors`. `title`, `detail` and `message` keep their English values. Keycloak login/refresh failures no
longer put Keycloak's raw text in `detail`.

| Status / envelope type           | Class                                                   |
| -------------------------------- | ------------------------------------------------------- |
| 400 with `errors` / `Validation` | `ValidationError` (`issues`: code + message + messages) |
| 400 without `errors` / `Problem` | `BusinessRuleError`                                     |
| 401                              | `SessionExpiredError` (`core/auth`)                     |
| 403                              | `AccessDeniedError`                                     |
| 404 / `NotFound`                 | `NotFoundError`                                         |
| 409 / `Conflict`                 | `ConflictError`                                         |
| 429                              | `RateLimitedError` (no endpoint returns it today)       |
| network failure, 5xx / `Failure` | `ServiceUnavailableError`                               |

Every class carries the backend `code` and `messages` (`undefined` when the response had none, for
example a network failure). `core/feedback/error-message.ts` picks the text in this order: a code in
`MESSAGES_BY_CODE` (product wording such as "futbolka", which the backend's generic "kiyim" cannot
match) → `messages` in the page locale (validation: every issue's `messages`, joined) → the class
message. The page locale comes from `LOCALE_ID`, so a store passes `toAppLocale(inject(LOCALE_ID))`.

Validation issues carry the FluentValidation validator code (`NotEmptyValidator`) and a camelCase
`propertyName`; this app does not map `propertyName` to a form field yet and shows the issues as one
line.

## Existing endpoints (verified)

| Endpoint            | Body                                             | Notes                                   |
| ------------------- | ------------------------------------------------ | --------------------------------------- |
| `POST /auth/register` | `username`, `email`, `phoneNumber?`, `password` | Returns tokens in the `Result` envelope |
| `POST /auth/login`    | `username`, `password`                          | Returns tokens                          |
| `POST /auth/refresh`  | `refreshToken`                                  |                                         |
| `POST /auth/logout`   | `refreshToken`, requires Bearer                 |                                         |
| `POST /profiles`      | `firstName`, `lastName`, `userName`, `dateOfBirth?`, `gender`, `profilePhotoUrl?`, `countryCode`, `timeZone` | Creates the Soldier profile |
| `GET /profiles`       | —                                               | Current user's profile                  |

Token response: `{ accessToken, refreshToken, idToken, tokenType, expiresIn, refreshExpiresIn }`.

There is **no SMS or OTP endpoint**, by design. Registration is email plus password.

Registration in this app is two calls, in order: `POST /auth/register`, then `POST /profiles` with
`countryCode: "UZ"`, the browser time zone and the gender the user picked. `gender` is required
(`Male = 1`, `Female = 2`; the backend rejects `0` since 2026-09-23 — before that this app sent `0`
and left profiles with an unknown gender). If the second call fails the user is signed in without a
profile; the app detects this with `GET /profiles` and resumes on the next screen rather than starting
over.

## Garment endpoints

Naming note: the TZ writes `GET /t/{token}`. That collides with the frontend route, so the API uses
`/garments/by-token/{token}`. The chip still carries `https://<domain>/t/<token>`.

### `GET /garments/by-token/{token}` — scan

Bearer optional. This is the only endpoint that decides what a scan means.

```jsonc
{
  "state": 3,
  "garment": {
    "serialNumber": "01K7X8M4Q9F2A6BC3DEFGHJKMN",
    "model": "Peaktofan Classic",
    "color": "#1A3C6E",
    "size": "L",
    "material": "95% paxta, 5% elastan",
    "manufacturedAt": "2026-08-14T00:00:00Z"
  },
  "reason": null
}
```

**There is no shirt photo.** The backend dropped `photoFileId` on 2026-09-23. The site draws the shirt
itself (`shared/components/garment-shirt`) and paints it with the shirt's colour.

`serialNumber` is made by the server: a ULID, 26 characters of Crockford base32 (for example
`01K7X8M4Q9F2A6BC3DEFGHJKMN`). Older shirts may still carry a `PT-…` serial; the site shows either as
it is and never checks its shape.

`color` is a `#RRGGBB` code chosen in the admin panel with a colour picker. Older shirts may carry a
word (`black`, `blue`, `Qora`, `Ko'k`, Russian names). `garmentShadeOf`
(`shared/models/garment-color.ts`) paints the shirt with the code, maps the old words to theme shades
(`--app-shirt-black`, `--app-shirt-blue`) and falls back to `--app-shirt-neutral`. The colour row shows
a swatch; an old word is also named in the page language.

`GarmentScanState`: `Invalid = 1`, `Unclaimed = 2`, `Claimable = 3`, `Owned = 4`, `Expired = 5`,
`Foreign = 6`. `Expired` is derived from the expiry date, not from a stored status: `GarmentStatus`
(admin only, never sent to this app) is `Inactive = 1`, `Active = 2`, `Hidden = 3`, `Revoked = 4`.

Rules the backend holds:

- There is no `passport` field on this response at all. The passport is its own endpoint, owner only.
- `Foreign`, `Unclaimed` and `Claimable` carry no owner name, no activation date, no expiry, no rating
  and no stamps — those fields are not declared on the scan response, so they cannot leak.
- `Invalid` carries no `garment` either — an unknown token must not confirm that a serial exists.
- An unknown token returns `200` with `state: Invalid`, never `404`: the difference between the two
  would reveal whether the token exists.

`Invalid` covers several situations that need different copy on the screen, so the response carries a
`reason` next to the state. `GarmentInvalidReason`: `Unknown = 1`, `Revoked = 2`, `Hidden = 3`. Every
one of them can actually occur, and each has its own copy on the scan screen
(`features/scan/components/invalid-link`). A missing or unknown `reason` on an `Invalid` response is a
contract error, not a silent fallback.

### `POST /garments/by-token/{token}/claim` — activation

Bearer required, idempotent. Binds the shirt to the caller and sets `activatedAt` and `expiresAt`
(`activatedAt + 2 months`). Returns the same shape as the scan, now `Owned`.

- 409 `Garment.AlreadyClaimed` if another account owns it. The response says nothing about that account.
- 409 `Garment.NotAvailable` if the shirt is revoked or hidden.
- 404 `Garment.NotFound` if the token is unknown. This endpoint requires a bearer, so it does not have
  the scan endpoint's enumeration problem.
- 200 if the caller already owns it, with the original `activatedAt` and `expiresAt` untouched.
- One shirt binds to one account; one account may hold many shirts.

### `GET /garments/by-token/{token}/passport` — passport

Bearer required, owner only:

```jsonc
{
  "garment": { /* as above */ },
  "owner": { "firstName": "Jahongir", "lastName": "Esanov" },
  "activatedAt": "2026-09-21T10:12:00Z",
  "expiresAt": "2026-11-21T10:12:00Z",
  "isExpired": false
}
```

**There is no `rating` and no `stamps` field.** Gamification is not built, so nothing could fill either;
both arrive with the first real stamp. Render the rating slot and page 2 of the booklet from their empty
states until then — a `rating` of `0` would read as "this person scored nothing", which is worse than
showing no number at all.

- **400** `Garment.NotOwner` when the caller is not the owner — not `403`, so the frontend is never
  tempted to turn a transport status into a state. It re-reads the scan endpoint instead.
- 404 `Garment.NotFound` for an unknown token; 409 `Garment.NotAvailable` when the shirt is revoked or
  hidden.
- When expired, the server returns the garment, owner and dates and sets `isExpired` to true.
- `isExpired` is the server's own verdict. The frontend renders the locked passport from that flag and
  never compares `expiresAt` to the device clock.

### `GET /me/garments` — shirts on this account

Bearer required. A plain array inside the `Result` envelope, newest activation first. Revoked and hidden
shirts are left out. Not called by this app yet: the shirt list is phase 4 (`docs/roadmap.md`).

```jsonc
[
  {
    "token": "n1gq9Xh2…",
    "serialNumber": "01K7X8M4Q9F2A6BC3DEFGHJKMN",
    "model": "Peaktofan Classic",
    "activatedAt": "2026-09-21T10:12:00Z",
    "expiresAt": "2026-11-21T10:12:00Z",
    "isExpired": false
  }
]
```

### Admin endpoints

All six exist and require the admin policy. They belong to `tofan-ui`, not to this app; they are listed
here only so the scan states below make sense.

| Endpoint                                     | Purpose                                     |
| -------------------------------------------- | ------------------------------------------- |
| `POST /admin/garments`                       | Create; the server makes the serial; returns `{ id, serialNumber, token, linkUrl }` |
| `GET /admin/garments`                        | Paged list                                  |
| `POST /admin/garments/{id}/status`           | Body `{ status }`: active, hidden, revoked  |
| `POST /admin/garments/{id}/extend`           | Body `{ months }` 1–24; returns the new expiry |
| `GET /admin/garments/export-links`           | `.xlsx` with every column, for the print shop |
| `DELETE /admin/garments/{id}`                | Delete a shirt nobody activated             |

One of them changes what a scan sees, so this app must handle it:

- **`status`** — a shirt set to hidden or revoked scans as `Invalid` with `reason` `Hidden` (3) or
  `Revoked` (2), for the owner too. Setting it back to active restores the previous state; the validity
  period is not extended by this, so a shirt that expired while hidden scans as `Expired`.

- **`delete`** — only for a shirt nobody activated. Its token then scans as `Invalid` with `reason`
  `Unknown` (1), like any unknown token. A claimed shirt cannot be deleted, so an owner never loses a
  passport this way.

A token is never replaced once issued: there is no regenerate-link endpoint, by design. The token is
written into the chip, so replacing it would kill the shirt. There is no "this link was replaced" case
to render.

### Still missing

| Endpoint                                      | Phase | Purpose                    |
| --------------------------------------------- | ----- | -------------------------- |
| `POST /payments/create`                       | 2     | Start a renewal payment    |
| `POST /payments/webhook`                      | 2     | Provider callback (server) |
| `POST /garments/{id}/stamps`                  | 3     | Award a stamp (app, admin) |

## Backend work this app still depends on

1. Stamp storage and the rule that a stamp is never revoked except by an admin (Gamification). That
   work adds the `stamps` field to the passport; it does not exist today.
2. Rating calculation — undefined, so the passport has no `rating` field yet either.
3. A transfer flow, if a resold shirt should ever change owner.
