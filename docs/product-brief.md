# Product brief

Source: `Futbolka_NFC_Texnik_Topshiriq.pdf`, 2026-09-20, Jahongir, Peaktofan.
This file is the working summary. Where it differs from the PDF, this file wins and the difference is
listed in section 5.

## 1. The idea

Instead of selling a subscription, Peaktofan sells a T-shirt with an NFC chip. Tapping a phone on the
shirt opens a unique link. The buyer registers once; from then on every tap opens the shirt's digital
passport: product data, who owns it, when it was activated, how long it is valid, the owner's rating
and the stamps they have earned.

Terms:

- **Chip** — passive NFC tag in the shirt, holding `https://<domain>/t/<token>`.
- **Passport** — the page for one shirt.
- **Activation** — the moment an account claims a shirt.
- **Stamp** — a mark on the passport for a personal record, an achievement, a rank or a special event.
- **Validity** — two months from activation; renewed by payment.

Users: the shirt owner, and the Peaktofan team through the admin panel (`tofan-ui`).

## 2. Flow

First tap sends the visitor to registration. Later taps recognise the session and open the passport.
A tap by anyone else shows only that the shirt is genuine.

## 3. Rules from the TZ that we keep

- One shirt binds to exactly one account. A second person sees "this shirt is already activated".
- One account may hold many shirts, each with its own passport.
- An existing session skips login; an expired session returns to the same shirt after login.
- `activatedAt` = registration time; `expiresAt` = `activatedAt` + 2 months.
- After expiry the passport, stamps and rating are hidden but never deleted; payment restores them.
- Expiry is checked on the server on every request. The phone's clock is not trusted.
- A stamp, once awarded, is never revoked except by an admin.
- The token is long and random (at least 128 bits), never a sequential id. Regenerating a link revokes
  the old token.
- Languages: Uzbek, Russian, English.
- Mobile-first design; the passport looks like a real passport booklet with page turns.

## 4. Passport fields

| Field           | Source             |
| --------------- | ------------------ |
| Shirt photos    | admin upload       |
| Model, colour, size | admin          |
| Manufactured date, batch | admin     |
| Material        | admin              |
| Serial number   | system             |
| Owner name      | registration       |
| Activation date | system             |
| Valid until     | system             |
| Rating          | system             |
| Stamps          | system             |

## 5. Where we diverge from the TZ

| TZ says | We do | Why |
| ------- | ----- | --- |
| Phone plus SMS code registration | Email plus password (`POST /auth/register` + `POST /profiles`) | Tofan has no SMS provider. Adding one is a platform decision outside this project. Phone stays optional and unverified. |
| Next.js, Node/Python backend, own PostgreSQL | Angular 22 + Optimus UI, existing .NET backend, existing Keycloak | This is part of the Tofan ecosystem, not a standalone product. The accounts must be Tofan accounts, because the mobile app awards the stamps. |
| `GET /t/{token}` API endpoint | `GET /garments/by-token/{token}` | `/t/:token` is the frontend route the chip points to. |
| Own `users` table with `password_hash` | Keycloak through the backend | Identity already exists; a second user store would split the customer in two. |
| Expired passport "not visible in the app" | Locked passport with a renew action | A blank screen after a tap looks like a broken chip and generates support calls. Open question 4 in `docs/pages.md`. |

## 6. Open questions (from the TZ, still open)

1. Renewal price and period.
2. How rating is computed; per account or per shirt.
3. Which chip model, and whether it supports a dynamic signature.
4. Does a resold shirt transfer to the new owner?
5. Fully hidden or locked passport after expiry (we assume locked).
6. What data the mobile app uses to award stamps.
