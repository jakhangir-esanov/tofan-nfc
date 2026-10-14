# Pages and design

Answers the three questions the TZ left open: how many pages, which pages, and what they look like.
Decided 2026-09-21 with the product owner. Scope for v1 is **phase 1 only** (see `docs/roadmap.md`).

## 1. The idea in one line

One public URL per shirt. The server decides what that URL means for whoever is holding the phone.
Every screen in this app is a rendering of one server-owned state.

## 2. Scan states

`GET /garments/by-token/{token}` (bearer optional) returns exactly one of these.

| State       | Who is scanning                        | Screen                          | Personal data in payload |
| ----------- | -------------------------------------- | ------------------------------- | ------------------------ |
| `unclaimed` | anyone, shirt not activated yet        | Welcome → register              | none                     |
| `claimable` | signed in, shirt not activated yet     | Activation confirm              | none                     |
| `owned`     | the owner                              | Passport                        | owner's own              |
| `expired`   | the owner, validity ran out            | Locked passport + renew         | owner's own              |
| `foreign`   | anyone else, shirt already activated   | Authenticity                    | public registration only |
| `invalid`   | unknown, revoked or hidden token       | Invalid chip                    | none                     |

`foreign` is the security-critical one: the response contains the shirt's public product data and the
public registration (`@username`, registration date, validity). Everything else about the owner is not
hidden — absent.

## 3. Routes

MVP is **8 routes**. Two more arrive with later phases.

| Route                | Guard    | Purpose                                                         |
| -------------------- | -------- | --------------------------------------------------------------- |
| `/`                  | none     | Tap prompt, for someone who typed the domain instead of tapping  |
| `/t/:token`          | none     | Scan landing: resolves the state and renders or redirects        |
| `/t/:token/activate` | session  | Activation confirm, binds the shirt to the account               |
| `/t/:token/passport` | session  | The passport booklet                                             |
| `/t/:token/verify`   | none     | Authenticity screen for a non-owner scan                         |
| `/auth/register`     | guest    | Name, email, password                                            |
| `/auth/login`        | guest    | Email or username, password                                      |
| `/not-found`         | none     | Unknown route                                                    |
| `/my/garments`       | session  | Phase 4: the shirts on this account                              |
| `/t/:token/renew`    | session  | Phase 2: payment and extension                                   |

Why the token stays in the path on every screen: after login the user must return to *this* shirt, and
a second tap must reopen the same passport. `returnUrl` carries the whole path, including the token.

Feature ownership: `home` owns `/`, `scan` owns the three `/t/:token` routes, `auth` the two auth
routes, `passport` renders `/t/:token/passport` (registered above `/t/:token` so the more specific path
wins), `not-found` the rest.

## 4. Screen by screen

### 4.1 Scan landing — `/t/:token`

The only screen every scan passes through. A branded splash with the Peaktofan mark and a progress
indicator, then one of:

- `unclaimed` → welcome content inline: hero shot of the shirt, model and serial, one sentence
  ("Bu futbolka hali aktivatsiya qilinmagan"), primary button **Ro'yxatdan o'tish**, secondary
  **Kirish**.
- `claimable` → redirect to `/t/:token/activate`.
- `owned` → redirect to `/t/:token/passport`.
- `expired` → redirect to `/t/:token/passport` (it renders itself locked).
- `foreign` → redirect to `/t/:token/verify`.
- `invalid` → invalid-chip content inline, worded by the server's `reason`: `unknown` ("Havola
  ishlamayapti"), `revoked` ("Bu futbolka bekor qilingan"), `hidden` ("Pasport vaqtincha yopiq").

A failed request is not an invalid chip. It shows a retry with the Peaktofan mark still on screen.

### 4.2 Activation — `/t/:token/activate`

Shirt preview (photo, model, colour, size, material, serial) and one question: is this your shirt?
Primary action **Aktivatsiya qilish**, in the sticky bottom bar. On success, a short stamp-press
animation, then the passport. On `already claimed`, a calm message and a link to support — never the
other owner's name.

### 4.3 Passport — `/t/:token/passport`

The centrepiece, redesigned 2026-10-12 after the product owner's prototype. The passport opens closed:
a cover that the owner taps to open. Behind it are three sections, switched by a bar pinned to the
bottom of the screen: **Pasport**, **Futbolka**, **Profil**. The bar appears once the cover is open.

**Cover** (`features/passport/components/passport-book`). Dark textured field, the Peaktofan emblem, the words
"RAQAMLI PASPORT", the owner's name, the serial number, "Muddati tugagan" when the server marked the
passport expired, and the hint "Ochish uchun bosing". It swings open like a book cover; with reduced
motion it simply disappears. It closes again on every visit.

**Pasport — the ID card** (`features/passport/components/passport-card`). The shirt photo (the variant
image, or the drawn shirt when there is none or it fails to load) with the model, "Drop 1 · 349 / 500",
the serial along the edge and a holographic seal. Below it a two-column grid: owner, colour, size,
material, manufactured date, activation date, valid until, and — only when the passport carries
`standing` — the leaderboard rank (`#12`, or "Hali hisoblanmagan"), lifetime DP and the level name in
the page language. Then the serial number and a machine-readable strip built from the owner's name and
the serial (decorative). A field the admin left empty is left out rather than shown blank; an owner
without a profile has no owner row. With no `standing` there is no rating anywhere — a rating of `0`
would tell the owner something false.

**Futbolka** (`passport-shirt`). The shared shirt card plus the validity: the period, a progress bar
and "N kun qoldi". The days are `expiresAt` minus the device date and are display only; "Muddati
tugagan" is shown only when the server says `isExpired`.

**Profil** (`passport-profile`). The owner's name, the account name, the language switcher and
"Chiqish".

There is deliberately no section that shares the shirt's link (no QR code, no copy, no share sheet):
the token stays in the URL and the API call (`.claude/rules/nfc-security.md`).

**Stamps (phase 3, not rendered today).** A grid of stamps positioned at slight random angles like
real visa stamps, each with its icon, title and date. The backend sends no stamps yet, because nothing
awards them, so the page does not exist.

**Locked variant (`expired`).** The cover says "Muddati tugagan" and the ID card is greyed. The renew
action (**Muddatni uzaytirish**) is not built yet. Once stamps exist they are
absent from an expired payload, not merely covered.

### 4.4 Authenticity — `/t/:token/verify`

What a stranger sees. The shirt card (`shared/components/garment-preview`, the same card the scan and
activation screens use): product image, product name, size, colour, drop and the number in it, the
unique ID (serial number), the "verified TOFAN original" mark and the status, and — since 2026-10-11 —
the owner's `@username`, the registration date and the validity. Nothing else about the owner: no real
name, phone, email, rating or stamps. No login prompt — this person is not the customer.

### 4.5 Register — `/auth/register`

One screen: ism, familiya, email, parol (phone optional). Behind it: `POST /auth/register`, then
`POST /profiles`. On success the user continues straight to activation — never to a home page.
This form stands between a customer and a shirt they already paid for; no field is added without a
reason that survives that sentence.

No SMS code, no OTP. The TZ asks for phone verification; the platform has no SMS provider, so
registration is email-based. Phone stays an optional, unverified field.

### 4.6 Login — `/auth/login`

Email or username, password, link to register. `returnUrl` is preserved through both screens.

### 4.7 Invalid / not found

One shared state screen with a clear message per case: unknown token, revoked chip, shirt hidden,
too many attempts (429). Each ends with a way out: shop link or support contact.

## 5. Visual design

- **Mobile first, always.** Single column, full-bleed, safe-area insets, `max-width: 440px` centred on
  desktop. No sidebar, no topbar shell, no data table anywhere in this app.
- **Dark and premium, with a light twin.** The passport metaphor wants depth: near-black background,
  warm gold accent, thin uppercase headings. Dark is the default; the header has a switch to a cream
  light theme (`core/layout/theme.store.ts`), remembered per device in `localStorage` (key `peaktofan.theme`, a
  preference only, never the token). Colours live as `--app-*` tokens in `src/styles/styles.css` (light
  on `:root`, dark on `:root.app-dark`) and in the Optimus UI preset (`core/config/peaktofan.preset.ts`).
  No hex values in components.
- **Type.** Raleway for text and IBM Plex Mono for serials, both served from `public/fonts` (latin and
  cyrillic subsets). No font is loaded from a third party.
- **The shirt is the hero.** It shows the variant image from the backend (`imageUrl`, one image per
  colour and style of a drop). Shirts without one ("Drop 0", made before drops existed) are drawn
  inline in the shirt's own colour. Both sit in the same fixed-aspect frame, so the layout never jumps.
- **Motion with restraint.** The cover opens with a CSS 3D transform on the booklet container; stamp award is a press-and-settle. All of it degrades to a cross-fade under
  `prefers-reduced-motion`, and none of it blocks interaction.
- **One primary action per screen**, in a sticky bottom bar within thumb reach.
- **Three states on every screen**: branded loading, inline error with retry, empty.
- **No new dependency** for the booklet: a `features/passport/components/passport-book` built from CSS transforms
  and `@angular/cdk` swipe.

## 5.1 Control notes

- Password fields use `shared/components/password-input` implementing `FormValueControl`, which wraps
  Optimus `p-password` with toggle mask and Signal Forms `[formField]` binding.
- An empty required field is invalid from the first render, so Optimus marks it red before the user has
  typed anything. Each field carries `auth__field--pristine` until it is touched, and the form
  stylesheet neutralises the invalid border while that class is present.

## 6. Components

Shared (`shared/components/`):

| Component        | Purpose                                                             |
| ---------------- | ------------------------------------------------------------------- |
| `state-screen`   | Branded loading / error+retry / empty frame used by every page       |
| `garment-preview`| Shirt photo plus product fields, used by activation and authenticity |
| `password-input` | FormValueControl wrapper over Optimus p-password for Signal Forms    |

Feature-only: `passport-book` (booklet container: page turn, swipe, reduced-motion fallback),
`passport-cover`, `passport-data-page`, `passport-stamps-page`, `stamp-card`
(in `features/passport/components/`), `register-form`, `login-form` (in `features/auth/components/`).

## 7. Languages

Angular i18n (`$localize`), source locale `uz`, translations `ru` and `en`, one build per locale served
under `/`, `/ru/`, `/en/`. Consequence, accepted: three build outputs and three server bundles in the
deployment pipeline. The token route must work under every prefix, and the switcher must keep the user
on the same shirt.

## 8. Open questions for the product owner

These do not block phase 1, but each one changes a screen later:

1. Renewal price and period — decides the copy and layout of the locked passport.
2. Rating: answered on 2026-10-11 — the account's global leaderboard rank by lifetime DP, on its own
   booklet page, in the passport only (never on the public scan).
3. Does a resold shirt transfer to a new owner? If yes, activation needs a release flow and the
   passport needs an ownership history page.
4. Should an expired passport be fully hidden or shown locked? This doc assumes **locked**, because a
   hidden passport looks like a broken chip.
5. What does the mobile app hand over when a stamp is awarded? Phase 3.
