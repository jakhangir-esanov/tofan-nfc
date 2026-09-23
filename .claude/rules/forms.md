---
paths:
  - "src/app/**/*form*.ts"
  - "src/app/**/*dialog*.ts"
  - "src/app/**/*.schema.ts"
---

# Form rules (Signal Forms)

- Forms use `form()` from `@angular/forms/signals` and `[formField]` bindings. No Reactive Forms.
- Form model is a `signal<FormValue>()`; `FormValue` type lives next to the form component.
- Validation schema goes to `*.schema.ts` next to the form component when longer than ~10 lines.
- Validators: `required`, `minLength`, `maxLength`, `email`, `pattern`, `validateHttp`.
- Conditional rules use the `{ when: ... }` option.
- Show errors with `field().getError('required')`, only when `touched()`.
- Backend `ValidationError.issues` are shown after submit as a list (they carry FluentValidation
  validator codes, not field names, so they cannot be attached to a field).
- The form component emits `submitted` with the value; the page or store performs the write.
- Optimus UI controls (`p-inputtext`, `p-password`, `p-select`) are ControlValueAccessors and bind with
  `[formField]` directly.

## Forms in this project

There are exactly two, both in `features/auth`:

- **Register**: first name, last name, gender (male or female, required by `POST /profiles`), email,
  password (+ optional phone). It maps to
  `POST /auth/register` and `POST /profiles`. Keep it to one screen — this form sits between a
  customer and the shirt they already paid for; every extra field costs activations.
- **Login**: email or username, password.

No SMS code field, no OTP screen, no phone verification step. The platform has no SMS provider.

Password rules mirror the backend: 8–128 characters. Show a single, translated message; never a
message matched from backend text.

## Submitting

- A form element uses `<form [formRoot]="myForm">` (`FormRoot` from `@angular/forms/signals`) and the
  `form()` call gets `{ submission: { action } }`. Never `(ngSubmit)`: without `FormsModule` nothing
  emits it, the browser submits the form natively and reloads the page with the fields emptied (the
  register bug of 2026-09-23). `FormRoot` sets `novalidate`, prevents the native submit, marks every
  field touched and runs `action` only when the form is valid.
