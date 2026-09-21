# auth

## Purpose

The two screens that stand between a customer and their shirt: registration and login. Session
handling itself lives in `core/auth`; this feature only renders forms and reports failures.

## Routes

| Route             | Guard        | Screen         |
| ----------------- | ------------ | -------------- |
| `/auth/register`  | `guestGuard` | `RegisterPage` |
| `/auth/login`     | `guestGuard` | `LoginPage`    |

## Backend endpoints

| Endpoint           | Method | Used by                        |
| ------------------ | ------ | ------------------------------ |
| `/auth/register`   | POST   | `AuthStore.register`           |
| `/auth/login`      | POST   | `AuthStore.login`              |
| `/profiles`        | POST   | `AuthStore.register` (step two) |

Registration is two calls: the account, then the Soldier profile carrying first and last name. The
username is the lowercased email. There is no SMS step.

## State

`AuthFormStore` (provided by each page) holds `submitting` and `submitError` and delegates to the
root `AuthStore`. Forms are Signal Forms; the page navigates to `returnUrl` on success.

## Security notes

`returnUrl` passes through `safeReturnUrl`, which rejects absolute and protocol-relative URLs so the
NFC flow cannot be turned into an open redirect. `guestGuard` sends an already signed-in visitor to
their `returnUrl` instead of a dead end.

## Decisions

Password fields use `<input pInputText type="password">`: Optimus UI 2.0.2's `p-password` does not
bind to Signal Forms. Invalid styling is suppressed per field until the field is touched, so a fresh
form is not red.
