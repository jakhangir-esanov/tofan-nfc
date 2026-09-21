# Backend contract

Status: **proposed**. The garment endpoints below do not exist yet — `Shop` and `Gamification` in the
`tofan` repository are empty module shells (`AssemblyReference.cs` only). The auth and profile
endpoints are real and verified against `D:\Projects\tofan` (2026-09-21).

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
  "error": { "code": "", "message": "", "type": 0 },
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
  "detail": "The garment was not found.",
  "errors": [{ "code": "NotEmptyValidator", "message": "'Email' must not be empty.", "type": 2 }]
}
```

| Status / envelope type           | Class                                        |
| -------------------------------- | -------------------------------------------- |
| 400 with `errors` / `Validation` | `ValidationError` (`issues`: code + message) |
| 400 without `errors` / `Problem` | `BusinessRuleError`                          |
| 401                              | `SessionExpiredError` (`core/auth`)          |
| 403                              | `AccessDeniedError`                          |
| 404 / `NotFound`                 | `NotFoundError`                              |
| 409 / `Conflict`                 | `ConflictError`                              |
| 429                              | `RateLimitedError`                           |
| network failure, 5xx / `Failure` | `ServiceUnavailableError`                    |

Validation issues carry the FluentValidation validator code (`NotEmptyValidator`), not the property
name, so they cannot be attached to a form field. Show them as a list.

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
`countryCode: "UZ"` and the browser time zone. If the second call fails the user is signed in without a
profile; the app detects this with `GET /profiles` and resumes on the next screen rather than starting
over.

## Proposed garment endpoints

Naming note: the TZ writes `GET /t/{token}`. That collides with the frontend route, so the API uses
`/garments/by-token/{token}`. The chip still carries `https://<domain>/t/<token>`.

### `GET /garments/by-token/{token}` — scan

Bearer optional. This is the only endpoint that decides what a scan means.

```jsonc
{
  "state": 3,
  "garment": {
    "serialNumber": "PT-2026-000123",
    "model": "Peaktofan Classic",
    "color": "Qora",
    "size": "L",
    "material": "95% paxta, 5% elastan",
    "manufacturedAt": "2026-08-14T00:00:00Z",
    "photoUrls": ["https://.../front.jpg", "https://.../back.jpg"]
  },
  "passport": null
}
```

`GarmentScanState`: `Invalid = 1`, `Unclaimed = 2`, `Claimable = 3`, `Owned = 4`, `Expired = 5`,
`Foreign = 6`.

Rules the backend must hold:

- `passport` is non-null **only** for `Owned` and `Expired`, and only for the owner's bearer token.
- `Foreign`, `Unclaimed`, `Claimable` and `Invalid` carry no owner name, no activation date, no expiry,
  no rating and no stamps.
- `Invalid` carries no `garment` either — an unknown token must not confirm that a serial exists.
- Rate limited per token and per IP; 429 on abuse.

`Invalid` covers several situations that need different copy on the screen. The backend must therefore
send a `reason` next to the state — `Garment.Unknown`, `Garment.Revoked`, `Garment.Transferred`,
`Garment.Hidden` — so the frontend can say what happened instead of one generic "this link is dead".
Phase 1 renders a single invalid screen; the per-reason copy lands with the reason field.

### `POST /garments/by-token/{token}/claim` — activation

Bearer required, idempotent. Binds the shirt to the caller and sets `activatedAt` and `expiresAt`
(`activatedAt + 2 months`). Returns the same shape as the scan, now `Owned`.

- 409 `Garment.AlreadyClaimed` if another account owns it. The response says nothing about that account.
- 200 if the caller already owns it.
- One shirt binds to one account; one account may hold many shirts.

### `GET /garments/by-token/{token}/passport` — passport

Bearer required, owner only. Returns the passport with its stamps:

```jsonc
{
  "garment": { /* as above */ },
  "owner": { "firstName": "Jahongir", "lastName": "Esanov" },
  "activatedAt": "2026-09-21T10:12:00Z",
  "expiresAt": "2026-11-21T10:12:00Z",
  "isExpired": false,
  "rating": 1280,
  "stamps": [
    {
      "id": "…",
      "code": "pr-bench-100",
      "title": "Bench press 100 kg",
      "iconUrl": "https://…/pr.svg",
      "kind": 1,
      "awardedAt": "2026-09-19T08:00:00Z"
    }
  ]
}
```

`StampKind`: `PersonalRecord = 1`, `Achievement = 2`, `Rank = 3`, `Special = 4`.

- 403 when the caller is not the owner. The frontend does not translate that into a state; it re-reads
  the scan endpoint.
- When expired, the server returns the garment, owner and dates, sets `isExpired` to true and **omits
  stamps and rating** (`stamps: []`, `rating: null`).
- `isExpired` is the server's own verdict. The frontend renders the locked passport from that flag and
  never compares `expiresAt` to the device clock.

### Later phases

| Endpoint                                     | Phase | Purpose                    |
| -------------------------------------------- | ----- | -------------------------- |
| `GET /me/garments`                            | 4     | Shirts on this account     |
| `POST /payments/create`                       | 2     | Start a renewal payment    |
| `POST /payments/webhook`                      | 2     | Provider callback (server) |
| `POST /garments/{id}/stamps`                  | 3     | Award a stamp (app, admin) |
| `POST /admin/garments`, `…/regenerate-link`, `…/export-links` | 4 | Admin panel, lives in `tofan-ui` |

## Backend work this app depends on

1. A garment module in `tofan` (entity, token generation with at least 128 bits of entropy, claim,
   passport, revocation).
2. Rate limiting on the scan and claim endpoints.
3. Stamp storage and the rule that a stamp is never revoked except by an admin.
4. A `reason` on the `Invalid` scan state (unknown, revoked, transferred, hidden).

Until (1) exists, no screen in this repository can be finished against a real backend.
