# CLAUDE.md — Peaktofan NFC (Angular)

Strict, repository-aware rules for Claude Code. If a request conflicts with this file, follow this file.
If a request is ambiguous, choose the option that keeps the structure below simple and consistent.
Detailed rules live in `.claude/rules/` (loaded per file type) and `docs/` (read on demand).

## 1. Project identity

Peaktofan sells T-shirts with an NFC chip instead of a plain subscription. Each shirt carries a unique
non-guessable link. Tapping a phone on the shirt opens this site, the buyer registers once, and from
then on every tap shows the shirt's **digital passport**: shirt data, activation date, validity, rating
and stamps.

This repository is **only that customer-facing web app**. It is not an admin panel and not the mobile
app. The admin panel is `tofan-ui`, the backend (.NET 10, modular monolith, CQRS) is `tofan`; both are
separate repositories.

Requirements source: `docs/product-brief.md` (the marketing TZ, summarised and corrected).
Pages and visual design: `docs/pages.md`. Backend contract: `docs/backend-contract.md`.
Architecture rationale: `docs/architecture.md`. Scope per phase: `docs/roadmap.md`.

Stack:

- Angular 22, TypeScript 6 (strict), standalone APIs only, SSR (`@angular/ssr`)
- **UI library: Optimus UI 2** (`@openng/optimus-ui`, `@openng/optimus-ui-themes`, `@openng/icons`),
  theme via `provideOptimus` design tokens. It is the MIT fork of PrimeNG 21 with the same API.
  This is a settled decision: never add `primeng`, `@primeuix/*` or `primeicons`
- Signals first; RxJS only where streams are genuinely needed
- Keycloak tokens obtained through the backend (`POST /auth/login`, `/auth/register`, `/auth/refresh`,
  `/auth/logout`), kept in `core/auth`. There is no SMS verification in this product
- Angular i18n (`$localize`): `uz` (source), `ru`, `en` — one build per locale
- Vitest (`ng test`), ESLint (`ng lint`), Sheriff (`sheriff verify`), Prettier

## 2. Commands

```bash
npm start             # ng serve, /api is proxied to the backend (proxy.conf.json)
npm run build         # ng build (must pass before finishing a task)
npm test              # ng test (Vitest)
npm run lint          # ng lint + lint:comments + lint:boundaries (must pass before finishing a task)
npm run i18n:extract  # ng extract-i18n into src/locale/messages.xlf
```

After every task: run `lint`, `test`, `build`. Fix what you broke. Never disable a rule to make it pass.
There is no mock backend: the dev server needs a running backend.

## 3. Architecture (non-negotiable)

Standard Angular feature-based structure, same as `tofan-ui`. **No Clean Architecture layers** (no
domain/application/infrastructure/presentation split, no repository abstractions, no use-case classes,
no DI composition folder). It is a small UI project; keep it flat and readable.

```text
src/app/
  core/                    # app-wide singletons, loaded once, never feature-specific
    auth/                  # AuthStore, AuthService, session storage, guards, auth interceptors
    http/                  # ApiClient (HttpClient), API_BASE_URL, Result envelope, error mapping
    layout/                # mobile shell: brand header, language switcher, safe-area container
    config/                # app paths, title strategy, UI providers
    feedback/              # toast, error message text
  features/                # one folder per screen group, lazy loaded
    scan/                  # /t/:token — resolve, activate, verify
    auth/                  # login, register
    passport/              # the passport booklet
    not-found/
  shared/                  # business-agnostic, reusable in any feature
    components/            # dumb reusable components (wrappers over Optimus UI)
    models/ | utils/ | directives/ | pipes/
  routes/
    app.routes.ts          # top-level routes, loadChildren per feature
  app.config.ts
  app.ts                   # root component (Angular 22 naming, no .component suffix)
```

Inside a feature: `pages/<name>-page/`, `components/<name>/`, `models/`, `services/`,
`<feature>.store.ts`, `<feature>.routes.ts`. Every feature, even a single-page one, keeps its routed
components in `pages/` and has its own `<feature>.routes.ts`; `routes/app.routes.ts` only uses
`loadChildren`.

### 3.1 Dependency direction

| Folder       | May import                                                     | Must NOT import                   |
| ------------ | -------------------------------------------------------------- | --------------------------------- |
| core         | other `core/` folders, shared                                  | features                          |
| shared       | other `shared/` folders, `core/http`, `core/feedback`          | features, other `core/` folders   |
| features/<x> | core, shared, its own files (relative imports)                 | other features                    |
| routes       | features (lazy `import()`), `core/auth` guards, `core/layout`  | shared                            |

- Enforced by Sheriff (`sheriff.config.ts`, `npm run lint:boundaries`) and ESLint `no-restricted-imports`.
- Features **never** import other features. Inside a feature use relative imports; across folders use
  `@core/*`, `@shared/*`, `@features/*`. Shared code moves to `shared/` (or `core/` if it is a singleton).
- Only `app.config.ts` reads `environments/`.
- Each feature must stay removable: deleting `features/<x>` must break only its route entry.

### 3.2 Where things go

| Need                    | Location                            | File name                  |
| ----------------------- | ----------------------------------- | -------------------------- |
| Model / entity          | `features/<x>/models/`              | `garment-scan.ts`          |
| Pure rule, draft, labels| `features/<x>/models/`              | `scan-state.ts`            |
| Backend DTO             | `features/<x>/services/`            | `garment-scan.dto.ts`      |
| DTO to model mapping    | `features/<x>/services/`            | `garment-scan.mapper.ts`   |
| HTTP calls              | `features/<x>/services/`            | `garments.service.ts`      |
| Screen state            | `features/<x>/`                     | `scan.store.ts`            |
| Routed screen           | `features/<x>/pages/<name>-page/`   | `scan-page.ts`             |
| Feature-only component  | `features/<x>/components/<name>/`   | `garment-preview.ts`       |
| Reusable component      | `shared/components/<name>/`         | `passport-book.ts`         |
| Route guard             | `core/auth/`                        | `auth.guard.ts`            |

Angular 22 file naming: no `.component` suffix (`garment-preview.ts`, class `GarmentPreview`).
Stores `.store.ts`, services `.service.ts`, DTOs `.dto.ts`, mappers `.mapper.ts`, routes `.routes.ts`.

## 4. SOLID in this codebase

- **S** — one component = one screen part; one store = one screen; one service = one backend resource.
  Split at ~200 lines.
- **O** — extend via inputs, content projection, strategy maps; do not add `if (state === ...)` chains
  in components. The scan state map lives once, in `features/scan/models/`.
- **I** — small services per resource (`GarmentsService`, `AuthService`).
- **D** — components talk to stores, stores talk to services, services talk to `ApiClient`.
  Components never inject a service that does HTTP.

## 5. Angular 22 rules

- Standalone only. No NgModules. No `standalone: true` (it is the default).
- OnPush is the default in v22: do **not** write `changeDetection`. Never use `Eager`.
- `inject()` only. No constructor injection.
- Services: `@Injectable({ providedIn: 'root' })`. Stores: `@Injectable()`, provided by the page.
- Signals: `input()`, `input.required()`, `output()`, `model()`, `computed()`, `linkedSignal()`.
  No `@Input`/`@Output` decorators. `effect()` only for side effects outside Angular.
- Templates: `@if`, `@for (...; track item.id)`, `@switch`, `@let`, `@defer`.
  No `*ngIf`, `*ngFor`, `ngClass`, `ngStyle` — use `[class.x]`, `[style.x]`.
- Forms: Signal Forms (`form()`, `[formField]`) for all forms in this project.
- Routing: lazy `loadChildren` per feature, functional guards, `withComponentInputBinding()`.
- SSR: no `window`, `document` or `localStorage` at module or constructor level. Guard browser-only
  code with `afterNextRender()` or `isPlatformBrowser`. Session storage access lives in `core/auth`.
- No `any`, in any form: annotations, `as any`, `any[]`, rest parameters, `$any()` in templates, or an
  `any` leaking from a library. Type it or use `unknown` and narrow. No non-null `!` to silence the
  compiler. No `subscribe()` in components unless unavoidable; if so, `takeUntilDestroyed()`.

## 6. UI library rules (Optimus UI)

- Optimus UI components are used in components, pages, `shared/components/` and `core/layout/`.
  Never in models, services or stores.
- **Mobile first, always.** The design target is a phone held right after tapping a shirt: single column,
  full-bleed, `max-width: 480px` centred on desktop, safe-area insets, sticky bottom action bar.
  There is no sidebar, no topbar shell and no data table anywhere in this project.
- Repeated patterns (state screen, garment preview, passport page frame) live once in
  `shared/components/`. Features use them, not raw copies.
- Styling: design tokens / theme preset only. No `::ng-deep`, no `!important`, no inline hex colors.
- Animations respect `prefers-reduced-motion`; the passport page flip degrades to a cross-fade.
- Import individual components (`import { ButtonModule } from '@openng/optimus-ui/button'`), never barrels.
- PrimeNG v21 documentation applies to Optimus UI; only the import paths differ.

## 7. Backend integration

- Backend owns business rules. This app validates for UX, never as the only guard.
- No OpenAPI client generation. DTOs are hand-written from `docs/backend-contract.md` and the staging
  Swagger, called through `core/http/ApiClient` in `features/<x>/services/`.
- `HttpClient` only in `core/http/` and `core/auth/`.
- All URLs come from the `API_BASE_URL` token. No hard-coded hosts.
- DTOs mirror backend responses exactly; models are what the UI needs. Map in `*.mapper.ts`, never in
  templates.
- Backend enums are integers: a DTO `enum` plus `enumMap` from `shared/utils/enum-map.ts` maps them by
  name. Never map by index.
- Responses use the Tofan `Result` envelope; failures are RFC 7807 ProblemDetails. `ApiClient` maps them
  to error classes in `shared/models/errors`. Code switches on the class or the backend `code`, never on
  message text.
- Dates travel as ISO strings and are mapped to `Date` in mappers. Time-dependent rules (expiry) take
  `now` as a parameter so they stay testable — but the **authoritative** expiry check is the server's.

## 8. Auth and the NFC flow

**Identity boundary: Angular to .NET API to Keycloak.** This app never calls Keycloak directly and never
holds Keycloak secrets.

- Registration is email + password (`POST /auth/register`), followed by `POST /profiles` for first and
  last name. **There is no SMS verification in this product** — the TZ asks for it, the platform does not
  have it. Do not add a phone-code step.
- Tokens and claims are read only in `core/auth`. Features use `AuthStore`.
- The bearer token is attached by `auth-token.interceptor.ts` only for `API_BASE_URL` requests;
  `session.interceptor.ts` refreshes once on 401.
- An unauthenticated user on a protected NFC route is sent to `/auth/login` or `/auth/register` with
  `returnUrl` set to the **full NFC route including the token**, and lands back on the same shirt.
- Guards never decide ownership or validity. They only decide "is there a session".

## 9. NFC security (see `.claude/rules/nfc-security.md`)

- The token in the URL is public: anyone who sees the shirt, a photo of it, or the browser history can
  replay it. It proves nothing about identity.
- The **server** decides the scan state (`unclaimed`, `claimable`, `owned`, `foreign`, `expired`,
  `invalid`). The frontend renders what it is told and never infers a state from a 403 or from local data.
- A non-owner scan shows authenticity only. Owner name, activation date, stamps and rating are never in
  that response — not hidden by CSS, not present in the payload.
- Never put a token in a log, an analytics event, an error report or a query string sent to a third party.
- Expiry, ownership and claim limits are enforced server-side. Hiding a button is UX, not security.

## 10. State

- A signal store per screen in `features/<x>/<x>.store.ts` (`signal()` + `computed()` + methods).
- Components read `store.state()`, call `store.load()`. Components never mutate store internals.
- Stores are provided by the page, not in root, unless truly global (`AuthStore`).
- No global state library unless the user explicitly asks.

## 11. Clean code

- No comments anywhere in the project: TS, JS, HTML, CSS, JSON/JSONC configs. That includes JSDoc,
  `// @ts-ignore`, `/* eslint-disable */`, HTML comments. If code needs a comment, rename or extract
  instead. Enforced by `npm run lint`. Markdown docs are exempt.
- Names reveal intent: `ScanStore`, `PassportBook`, `toGarmentScan`.
  Forbidden names: `Helper`, `Util`, `Manager`, `CommonService`, `DataService`, `data`, `item2`.
- Functions <= 25 lines, components <= 200 lines, templates <= 150 lines. Extract before exceeding.
- No magic strings/numbers: constants, enums or union types.
- No dead code, no commented-out code, no `console.log` left behind.
- `readonly` everywhere possible; `protected` for template-only members; `private` for the rest.
- Early returns over nested ifs. No clever one-liners.

## 12. i18n

- Source locale `uz`; translations `ru` and `en` in `src/locale/messages.<locale>.xlf`.
- Every user-visible string in a template carries `i18n` / `i18n-<attr>` with a meaningful `@@id`.
- Strings built in TypeScript use `$localize`. Error message text lives in `core/feedback/error-message.ts`.
- A new string is not done until it exists in all three `.xlf` files (`npm run i18n:extract`).
- Locale is chosen by URL prefix (`/`, `/ru/`, `/en/`); the switcher is in `core/layout`.
  The NFC token route must keep working under every prefix.

## 13. Testing

- Every store, mapper, guard and pure model rule gets a unit test (Vitest).
- Components: test inputs to rendered output and outputs emitted.
- Store tests mock the feature service, never `HttpClient`.
- **Mandatory security tests**: an unauthenticated scan of a claimed shirt renders the authenticity
  screen and no passport data; a `foreign` state never renders owner information; an expired passport
  renders locked. See `.claude/rules/testing.md`.
- Test file sits next to the file: `garment-scan.mapper.spec.ts`. Names: `should <result> when <condition>`.

## 14. How to work on a request

Before writing code, decide:

1. Which feature owns this screen? (`scan`, `auth`, `passport`)
2. Read or write? Which backend endpoint and DTO (`docs/backend-contract.md`)?
3. Which folder owns each part (table in 3.2)?
4. Does `shared/` or `core/` already have it? Reuse before creating.
5. What does an attacker holding only the token see?
6. Which tests prove it?

Then:

- For a new feature — skill `new-feature`.
- For a screen driven by a scan state — skill `scan-screen`.
- After a large change — subagent `architecture-reviewer`, then `nfc-security-reviewer`.
- If a product rule is unclear, ask. If only the structure is unclear, follow this file and `tofan-ui`.

## 15. Forbidden

- Clean Architecture layer folders (`domain/`, `application/`, `infrastructure/`, `presentation/`,
  `data-access/`), repository abstractions, use-case classes, DI composition folders
- A second authentication system, an SMS/OTP step, or any auth state outside `core/auth`
- Deciding ownership, validity or expiry on the frontend
- Putting the NFC token anywhere outside the URL and the API call (no logs, no analytics, no storage)
- OpenAPI code generators and generated clients
- Mock backends or fake services; the app talks to the real backend
- `HttpClient` outside `core/http/` and `core/auth/`
- Business logic inside components or templates
- Importing one feature from another feature
- Adding `primeng`, `@primeuix/*`, `primeicons`, or any second UI library
- NgModules, constructor injection, `@Input`/`@Output`, `*ngIf`/`*ngFor`
- `any` of any kind, `as unknown as`, `@ts-ignore`, `eslint-disable`
- `::ng-deep`, `!important`, inline colors
- Hard-coded API URLs, error messages matched by text, user-facing strings without `i18n`
- New dependencies without asking the user first
- Comments of any kind in any project file
- "Quick" shortcuts that break any rule above. Speed is allowed; structural shortcuts are not.

## 16. Definition of done

- [ ] Right feature, right folder, right file name
- [ ] Dependency table (3.1) respected, no cross-feature imports
- [ ] Signals, OnPush default, `inject()`, new control flow, SSR-safe
- [ ] Optimus UI only in components/pages/shared/layout; mobile-first verified at 375px
- [ ] DTO to mapper to model, errors by class or `code`
- [ ] Every string translated in uz/ru/en
- [ ] Security: the non-owner path was checked and tested
- [ ] Tests added; `lint`, `test`, `build` pass
- [ ] `docs/` updated if behaviour or structure changed
