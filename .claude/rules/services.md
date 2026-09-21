---
paths:
  - "src/app/features/**/services/**/*.ts"
  - "src/app/features/**/models/**/*.ts"
  - "src/app/core/http/**/*.ts"
---

# Models and services rules

## Models (`features/<x>/models/`)

- Plain TypeScript: no `@angular/*`, `@openng/*` or RxJS imports.
- Models are interfaces, or classes with `readonly` properties when they carry derived getters.
- Status/type values are union types or `as const` arrays, mirroring backend enum names in camelCase.
- The scan state is a **discriminated union** on `state`, so that adding a state is a compile error
  everywhere it is handled:

```ts
export type GarmentScan =
  | { readonly state: 'unclaimed'; readonly garment: GarmentPreview }
  | { readonly state: 'claimable'; readonly garment: GarmentPreview }
  | { readonly state: 'owned'; readonly garment: GarmentPreview }
  | { readonly state: 'expired'; readonly garment: GarmentPreview; readonly expiredAt: Date }
  | { readonly state: 'foreign'; readonly garment: GarmentPreview }
  | { readonly state: 'invalid' };
```

- Pure rules live here and are unit tested. A rule that depends on the clock takes `now: Date` as a
  parameter. Such a rule is for display only; the server owns the real decision.

## Services (`features/<x>/services/`)

- `<feature>.service.ts`: `@Injectable({ providedIn: 'root' })`, injects `ApiClient`, returns models.
  One service per backend resource. No state.
- `*.dto.ts`: exact backend shape, hand-written from `docs/backend-contract.md`; integer enums as TS
  `enum`. Never used outside `services/`.
- `*.mapper.ts`: pure functions `toGarmentScan(dto)`, enum maps via `enumMap`. Unit tested. A mapper
  never invents a field the backend did not send: if `foreign` carries no owner, the model has no owner.
- Paths are constants in the service file; the token goes through `encodeURIComponent`.
- Query objects are passed to `ApiClient.get(path, query)`; `undefined` values are dropped.
  **The NFC token never goes into a query string** — it is a path segment.
- Do not catch errors to hide them; `ApiClient` already maps failures to error classes.
  Catch only to translate a meaningful case.
- Never log a request or response that contains a token.
