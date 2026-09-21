---
name: new-feature
description: Scaffolds a new feature folder in the Peaktofan NFC app (my shirts, renewal, profile or any new screen group) with pages, components, models, services, store and lazy routes. Use whenever the user says "yangi modul", "new feature", "new page group", or starts work on a screen group that has no folder under src/app/features yet.
---

# New feature

## Inputs to confirm

- Feature name (kebab-case, as the screen group: `garments`, `renewal`)
- Main model name (singular PascalCase: `Garment`)
- Backend endpoints (check `docs/backend-contract.md`)

If the user already gave them, do not ask again. If the backend endpoint does not exist yet, stop and
say so — this app has no mock backend and no fake services.

Before creating a feature, ask whether it is really a new screen group. `/t/:token`, its activation and
its authenticity screen all belong to `scan`. The passport belongs to `passport`. Login and register
belong to `auth`.

## Steps

1. Check `src/app/features/<feature>` does not exist. If it exists, extend it instead.
2. Read `src/app/features/scan` and copy its shape.
3. Create the structure:

```text
src/app/features/<feature>/
  models/
    <model>.ts
  services/
    <model>.dto.ts
    <model>.mapper.ts
    <model>.mapper.spec.ts
    <feature>.service.ts
  pages/
  components/
  <feature>.routes.ts
```

4. `<feature>.routes.ts` template:

```ts
export const GARMENT_ROUTES: Routes = [
  { path: '', component: MyGarmentsPage },
];
```

Titles are translated through the title strategy in `core/config`, not hard-coded in the route.

5. Register in `src/app/routes/app.routes.ts`:
   `loadChildren: () => import('@features/<feature>/<feature>.routes').then((m) => m.<FEATURE>_ROUTES)`.
6. Add the path to `core/config/app-paths.ts`. Never build a route string by hand elsewhere.
7. Add every new string to `src/locale/messages.xlf` and both translations (`npm run i18n:extract`).
8. Create `docs/modules/<feature>.md` from `docs/modules/_template.md`.
9. Run `npm run lint && npm test && npm run build`.
10. Delegate to `architecture-reviewer`, and to `nfc-security-reviewer` if the feature touches a token,
    a passport or a session. Fix blocking items.

## Do not

- Create domain/application/infrastructure layers, repository abstractions, use cases or fake services.
- Import anything from another feature; move shared code to `shared/` or `core/`.
- Create pages or stores before the user asks for a screen.
- Add a route that takes the NFC token outside the `scan` and `passport` features.
