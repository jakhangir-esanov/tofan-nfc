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
| `foreign`   | anyone else, shirt already activated   | Authenticity                    | **none**                 |
| `invalid`   | unknown, revoked or hidden token       | Invalid chip                    | none                     |

`foreign` is the security-critical one: the response contains the shirt's public product data and
nothing about its owner. Not hidden — absent.

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

The centrepiece. A real passport booklet, swipe or tap to turn. Today it has two pages, cover and
data page; the stamps page returns with Gamification (see below).

**Cover.** Dark textured field, embossed Peaktofan emblem, the words "RAQAMLI PASPORT", the serial
number in the bottom corner, the owner's name below the emblem. Tapping it opens the booklet.

**Page 1 — data page.** Laid out like the photo page of a real passport: the shirt photo on the left in
a portrait frame, a two-column field list on the right — drop and the number in it ("Drop 1 · 349 /
500"), model (the variant's style name), colour, size, material, manufactured date, serial number,
owner, activation date, valid until. A machine-readable strip along the
bottom edge as a visual motif (decorative, no real data in it). A field the admin left empty (colour,
size, material) is left out rather than shown blank; an owner without a profile has no owner row.

**Page 2 — rating (since 2026-10-11).** Shown only when the passport carries `standing`: the owner's
global leaderboard rank (`#12`, or "Hali hisoblanmagan" before the leaderboard job has counted them),
lifetime DP, and the level name in the page language. With no `standing` the booklet has two pages and
no rating anywhere — a rating of `0` would tell the owner something false.

**Stamps (phase 3, not rendered today).** A grid of stamps positioned at slight random angles like
real visa stamps, each with its icon, title and date. The backend sends no stamps yet, because nothing
awards them, so the page does not exist.

**Locked variant (`expired`).** The booklet renders with the cover and the data page visible but
greyed, a band across it, and a single action: **Muddatni uzaytirish**. Once stamps exist they are
absent from an expired payload, not merely covered.

### 4.4 Authenticity — `/t/:token/verify`

What a stranger sees. The Peaktofan mark, a verified badge, the product data (model, material,
manufactured date) and one line: this is a genuine Peaktofan shirt and it is already activated.
A link to the shop. Nothing about the owner. No login prompt — this person is not the customer.

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

- **Mobile first, always.** Single column, full-bleed, safe-area insets, `max-width: 480px` centred on
  desktop. No sidebar, no topbar shell, no data table anywhere in this app.
- **Dark and premium.** The passport metaphor wants depth: dark background, warm metallic accent for
  the emblem and the rating. Every booklet page, the data page too, sits on the same dark surface as
the rest of the site (the cream paper page was dropped on 2026-09-23). Colours come from the Optimus UI theme preset
  in `core/config/ui.providers.ts` — the Peaktofan brand tokens. No hex values in components.
- **The shirt is the hero.** It shows the variant image from the backend (`imageUrl`, one image per
  colour and style of a drop). Shirts without one ("Drop 0", made before drops existed) are drawn
  inline in the shirt's own colour. Both sit in the same fixed-aspect frame, so the layout never jumps.
- **Motion with restraint.** Page turn is a CSS 3D transform on the booklet container; cover open is a
  scale-and-lift; stamp award is a press-and-settle. All of it degrades to a cross-fade under
  `prefers-reduced-motion`, and none of it blocks interaction.
- **One primary action per screen**, in a sticky bottom bar within thumb reach.
- **Three states on every screen**: branded loading, inline error with retry, empty.
- **No new dependency** for the booklet: a `shared/components/passport-book` built from CSS transforms
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
| `passport-book`  | Booklet container: page turn, swipe, reduced-motion fallback         |
| `garment-preview`| Shirt photo plus product fields, used by activation and authenticity |
| `password-input` | FormValueControl wrapper over Optimus p-password for Signal Forms    |

Feature-only: `passport-cover`, `passport-data-page`, `passport-stamps-page`, `stamp-card`
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
