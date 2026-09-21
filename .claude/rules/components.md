---
paths:
  - "src/app/**/components/**/*.ts"
  - "src/app/**/pages/**/*.ts"
  - "src/app/core/layout/**/*.ts"
  - "src/app/**/*.html"
---

# Component rules

## Reusable and feature components (`shared/components/`, `features/<x>/components/`)

- Inputs via `input()` / `input.required()`, events via `output()`, two-way via `model()`.
- No `inject()` of stores, HTTP services or Router.
- Pure rendering: derive with `computed()`, never mutate inputs.
- Name by what it shows: `GarmentPreview`, `PassportBook`, `StampCard`, `StateScreen`.
- The mobile shell (brand header, language switcher, safe-area container) belongs to
  `core/layout/`, not to `shared/components/`.

## Pages (`features/<x>/pages/<name>-page/`)

- Provide and inject the store, pass signals down, handle outputs by calling store methods.
- No business rules, no mapping, no HTTP.
- Read route params with component input binding: `readonly token = input.required<string>()`.
- The token is a route input only. Never copy it into a field that ends up in a log or storage.

## Template rules

- `@for (stamp of stamps(); track stamp.id)` — always track by a stable id, never `$index`.
- Every async screen has loading, empty and error states. Use `shared/components/state-screen`
  with `[loading]`, `[error]` and `(retry)`; never let a failure look like an empty passport.
- A screen driven by the scan state uses `@switch (store.state())` over the union, with a branch
  for every member. No `if (state === 'owned' || ...)` chains spread across the template.
- Prefer `computed()` over method calls in templates. `@let` for repeated signal reads.
- Every user-visible string carries `i18n` with an `@@id`; icon-only buttons carry a translated
  `aria-label` via `i18n-aria-label`.
- Mobile first: build at 375px width, verify at 320px and on desktop (the shell caps at 480px).
  Tap targets at least 44px. Nothing depends on hover.
- Accessible: form fields have labels, the passport booklet exposes its pages to screen readers
  as a list, and page-turn controls are real buttons.

## Example

```ts
@Component({
  selector: 'app-scan-page',
  imports: [StateScreen, GarmentPreview],
  providers: [ScanStore],
  templateUrl: './scan-page.html',
})
export class ScanPage {
  protected readonly store = inject(ScanStore);
  readonly token = input.required<string>();
}
```
