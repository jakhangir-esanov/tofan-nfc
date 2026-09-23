# scan

## Purpose

Owns everything behind the NFC URL: resolving what a tap means, the activation confirmation, and the
authenticity screen a stranger sees. Every screen here is a rendering of one server-owned scan state.

## Routes

| Route                | Guard       | Screen                                        |
| -------------------- | ----------- | --------------------------------------------- |
| `/t/:token`          | none        | `ScanPage` — resolves and renders or redirects |
| `/t/:token/activate` | `authGuard` | `ActivatePage` — claim confirmation            |
| `/t/:token/verify`   | none        | `VerifyPage` — authenticity for a non-owner    |

## Backend endpoints

| Endpoint                                   | Method | Used by                      |
| ------------------------------------------ | ------ | ---------------------------- |
| `/garments/by-token/{token}`                | GET    | `GarmentsService.scan`       |
| `/garments/by-token/{token}/claim`          | POST   | `GarmentsService.claim`      |

## Structure

```text
features/scan/
  models/garment-scan.ts        GarmentScan union, ScanState, InvalidReason, helpers
  components/invalid-link/      copy for the invalid state, one branch per reason
  services/garment-scan.dto.ts  integer enum + response shape
  services/garment-scan.mapper.ts
  services/garments.service.ts
  scan.store.ts
  pages/{scan,activate,verify}-page/
  scan.routes.ts
```

The `Garment` model, DTO and mapper live in `shared/models/` because `passport` reads them too.
There is no shirt photo. `GarmentPreview` draws the shirt with `shared/components/garment-shirt` (an
inline SVG without the emblem) and paints it with `Garment.shade`: the `#RRGGBB` code the admin panel
saved, a theme shade for an older colour word (`knownColor`, `black` or `blue`), or
`--app-shirt-neutral` for anything else (`garmentShadeOf` in `shared/models/garment-color.ts`). The
colour row shows a swatch; an older word is also named in the page language.

## State

`ScanStore` holds the scan the server returned, plus `loading`, `loadError`, `claiming` and
`claimError`, and exposes `invalidReason` for the invalid screen. It starts in `loading` so a failure
surfaces as an error rather than a blank screen.
It derives nothing about ownership, validity or expiry; it stores what the server said. A failed claim
reloads the scan from the server instead of patching local state.

Routing by state lives in the pages, not in the store: `claimable` goes to activate, `owned` and
`expired` to the passport, `foreign` to verify, `unclaimed` and `invalid` render inline.

## Security notes

A visitor without a session sees the unclaimed welcome, the authenticity screen or the invalid screen —
never owner data, because the server does not send any for those states. `ActivatePage` is behind
`authGuard`, but the guard only asks whether a session exists; the claim itself is authorised server
side. A network failure renders a retry, never "invalid shirt".

## Decisions

The state union is discriminated so adding a state is a compile error in every place that handles one.
Pages load in `afterNextRender`, so SSR ships the branded splash and no scan data is resolved on the
server for an anonymous request.
