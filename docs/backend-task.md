# Garment moduli — backend vazifasi

> Yozilgan: 2026-09-21. `D:\Projects\tofan` `main` (`STRUCTURE.md`, `CLAUDE.md`) va Workout moduli
> bilan solishtirilgan. Referens modul — **Workout**: shakl, nomlash, qatlamlar va registratsiya
> aynan shundan ko'chiriladi.
>
> Bu hujjat `tofan-nfc` (NFC veb-sayt) tomonidan so'ralayotgan ishni tavsiflaydi. Frontend kontrakti:
> [backend-contract.md](backend-contract.md), ekranlar: [pages.md](pages.md).

## 0. Doira va cheklovlar

**Kiradi:** yangi `Garment` moduli — futbolka, uning noyob havolasi, skan holati, aktivatsiya va
pasport o'qish.

**Kirmaydi (ataylab):**

- `Shop` va `Gamification` modullari **bo'sh qoladi**. Ularga fayl qo'shilmaydi.
- Reyting hisoblanmaydi. Pasport javobida `rating` doimo **0** qaytadi.
- Shtamplar hali berilmaydi. Pasport javobida `stamps` doimo **bo'sh massiv** qaytadi.
- To'lov, muddat uzaytirish uchun to'lov integratsiyasi — keyingi bosqich.
- SMS/OTP — platformada provayder yo'q, ro'yxatdan o'tish mavjud `POST /auth/register` orqali.

`rating` va `stamps` maydonlari javobga **hozirdan** qo'shiladi, shunda Gamification yozilganda
kontrakt shakli o'zgarmaydi — faqat qiymat to'ladi.

## 1. Uslub kelishuvlari

Bular repo'da allaqachon amal qiladi, yangi modul ham shunday bo'lsin:

| Qoida | Qayerdan ko'rinadi |
|---|---|
| `namespace X;` birinchi qator, `using`'lar undan keyin | har bir `.cs` fayl |
| **Izoh yozilmaydi** — `//`, `/* */`, `///` ham | CLAUDE.md 6.9.1 |
| Yozuv — EF Core + repository + `IUnitOfWork`; o'qish — **faqat Dapper** | CLAUDE.md 6.1, 6.2 |
| Command va handler **bitta faylda**, validator alohida faylda | `CreateExerciseCommand.cs` |
| Xatolar modul Domain'ida `<Entity>Errors` katalogida | `ExerciseErrors.cs` |
| Vaqt faqat `IDateTimeProvider` orqali, `DateTime.UtcNow` emas | CLAUDE.md 11 |
| Enum'lar `Tofan.Common.Domain.Enums` da, qiymatlar **1 dan** boshlanadi | `ExerciseDifficulty.cs` |
| Endpoint `IEndpoint` ni implement qiladi, ichida biznes mantiq yo'q | `CreateExercise.cs` |
| Repository — faqat yozuv va `GetAsync(id)`; ro'yxat/qidiruv Dapper'da | CLAUDE.md 6.3 |
| `sealed` klass, `Create(...)` fabrikasi, aniq nomli mutatsiya metodlari | `Exercise.cs` |

## 2. Modul skeleti

Workout moduli bilan bir xil to'rtta project, ustiga cross-module uchun beshinchisi:

```text
src/Modules/Garment/
  Tofan.Modules.Garment.Domain/
  Tofan.Modules.Garment.Application/
  Tofan.Modules.Garment.Infrastructure/
  Tofan.Modules.Garment.Presentation/
  Tofan.Modules.Garment.Soldier/          -- Soldier moduliga murojaat (8-bo'lim)
  test/Tofan.Modules.Garment.UnitTests/
```

`tofan.slnx` ga qo'shiladi. `src/API/Tofan.Api/Program.cs` da ikki joy:

```csharp
Tofan.Modules.Garment.Application.AssemblyReference.Assembly,
```

`moduleApplicationAssemblies` massiviga, va registratsiya:

```csharp
builder.Services.AddGarmentModule(builder.Configuration);
```

`GarmentModule.AddGarmentModule` — `WorkoutModule.cs` nusxasi: `AddDbContext` +
`UseSnakeCaseNamingConvention()` + `MigrationsHistoryTable(HistoryRepository.DefaultTableName,
Schemas.Garment)`, repository'lar, `ICurrentUser`, `IUnitOfWork`, `AddEndpoints(...)`.

Schema: `garment`.

## 3. Domain

### 3.1 `Garment` (agregat ildizi)

`Domain/Garments/Garment.cs`, `sealed class`, `LocalizableEntity` dan meros olmaydi (futbolka nomi
tarjima qilinmaydi, model nomi bitta).

| Maydon | Tur | Izoh |
|---|---|---|
| `Id` | `Guid` | |
| `Token` | `string` | noyob, 7-bo'limga qarang, unique index |
| `SerialNumber` | `string` | noyob, admin kiritadi |
| `Model` | `string` | |
| `Color` | `string` | |
| `Size` | `string` | |
| `Material` | `string` | |
| `ManufacturedAt` | `DateTime` | |
| `Status` | `GarmentStatus` | |
| `OwnerId` | `Guid?` | Keycloak `sub`, aktivatsiyagacha `null` |
| `ActivatedAt` | `DateTime?` | |
| `ExpiresAt` | `DateTime?` | |

Metodlar:

```csharp
public static Garment Create(string token, string serialNumber, string model, string color,
    string size, string material, DateTime manufacturedAt);

public Result Claim(Guid ownerId, DateTime utcNow, int validityMonths);
public void Extend(DateTime utcNow, int months);
public void RegenerateToken(string token);
public void Hide();
public void Revoke();
public bool IsExpired(DateTime utcNow);
```

`Claim` invariantlari entity ichida: `Status` `Inactive` bo'lmasa `GarmentErrors.AlreadyClaimed`,
`Revoked`/`Hidden` bo'lsa `GarmentErrors.NotAvailable`. Aktivatsiyada `ActivatedAt = utcNow`,
`ExpiresAt = utcNow.AddMonths(validityMonths)`, `Status = Active`.

`validityMonths` sehrli raqam emas: `GarmentValidity.Months = 2` konstantasi Domain'da.

### 3.2 `GarmentPhoto`

`Domain/GarmentPhotos/GarmentPhoto.cs`: `Id`, `GarmentId`, `FileId` (`Guid`, Storage modulidagi
`stored_files` ga tegishli), `SortOrder` (`int`). Rasm URL sifatida saqlanmaydi — repo'da fayl
har doim `Guid` bilan bog'lanadi (`Exercise.VideoFileId`), mijoz esa `files/{id}/content` dan oladi.

`FileCategory` enum'iga yangi a'zo qo'shiladi: `GarmentPhoto = 7`.

### 3.3 Repository interfeyslari

```csharp
public interface IGarmentRepository
{
    Task<Garment?> GetAsync(Guid id, CancellationToken cancellationToken = default!);
    Task<Garment?> GetByTokenAsync(string token, CancellationToken cancellationToken = default!);
    Task<bool> ExistsBySerialNumberAsync(string serialNumber, CancellationToken cancellationToken = default!);
    void Insert(Garment garment);
}
```

Ro'yxat, qidiruv, hisobot metodlari **qo'shilmaydi** — ular Dapper query'lari.

### 3.4 `GarmentErrors`

`Error.NotFound` / `Error.Conflict` / `Error.Problem` fabrikalari bilan:

| Kod | Tur | Qachon |
|---|---|---|
| `Garment.NotFound` | NotFound | id bo'yicha topilmadi (admin oqimi) |
| `Garment.AlreadyClaimed` | Conflict | boshqa akkaunt aktivatsiya qilgan |
| `Garment.NotAvailable` | Conflict | `Revoked` yoki `Hidden` |
| `Garment.NotOwner` | Problem | pasportni egasi bo'lmagan odam so'radi |
| `Garment.Expired` | Problem | kerak bo'lsa; hozir pasport `IsExpired` bayrog'i bilan qaytadi |
| `Garment.SerialNumberInUse` | Conflict | admin dublikat seriya kiritdi |

## 4. Enums (`Tofan.Common.Domain.Enums`)

Modul ichida enum yaratilmaydi — repo'da hammasi Common'da.

```csharp
public enum GarmentStatus { Inactive = 1, Active = 2, Expired = 3, Hidden = 4, Revoked = 5 }

public enum GarmentScanState { Invalid = 1, Unclaimed = 2, Claimable = 3, Owned = 4, Expired = 5, Foreign = 6 }

public enum GarmentInvalidReason { Unknown = 1, Revoked = 2, Hidden = 3, Transferred = 4 }
```

`GarmentStatus` — bazadagi holat. `GarmentScanState` — **skan qilayotgan odamga nisbatan** hisoblangan
holat, u bazada saqlanmaydi. Ikkisini aralashtirmaslik kerak.

## 5. Endpointlar

Frontend faqat birinchi to'rttasini kutmoqda. Admin qismi `tofan-ui` uchun.

| # | Endpoint | Auth | Bosqich |
|---|---|---|---|
| 1 | `GET garments/by-token/{token}` | `AllowAnonymous` | 1 |
| 2 | `POST garments/by-token/{token}/claim` | `RequireAuthorization()` | 1 |
| 3 | `GET garments/by-token/{token}/passport` | `RequireAuthorization()` | 1 |
| 4 | `GET me/garments` | `RequireAuthorization()` | 1 |
| 5 | `POST admin/garments` | `Policies.Admin` | 1 (usiz futbolka yaratib bo'lmaydi) |
| 6 | `GET admin/garments` | `Policies.Admin` | 1 |
| 7 | `POST admin/garments/{id}/regenerate-link` | `Policies.Admin` | 2 |
| 8 | `POST admin/garments/{id}/status` | `Policies.Admin` | 2 |
| 9 | `POST admin/garments/{id}/extend` | `Policies.Admin` | 2 |
| 10 | `GET admin/garments/export-links` | `Policies.Admin` | 2 |

Hammasi `.WithTags("Garment / Garments")` yoki `.WithTags("Garment / Admin")`.

---

### 5.1 `GET garments/by-token/{token}` — skan

Butun mahsulotning markazi. **Bu endpoint skan nimani anglatishini o'zi hal qiladi.** Frontend hech
qachon o'zi hisoblamaydi.

`AllowAnonymous`, lekin bearer bo'lsa o'qiladi. Buning uchun Common'da tayyor narsa bor:
`ClaimsPrincipalExtensions.GetUserIdOrNull()`. Workout'dagi `CurrentUser` bo'lmaganda exception
tashlaydi, shuning uchun bu modulga **`IOptionalCurrentUser`** kerak:

```csharp
public interface IOptionalCurrentUser
{
    Guid? UserId { get; }
}
```

`Infrastructure/Authentication/OptionalCurrentUser.cs` — `httpContextAccessor.HttpContext?.User.GetUserIdOrNull()`.

Holatni aniqlash mantig'i — **Domain'dagi sof funksiya**, handler ichida `if` uyumi emas:

`Domain/Garments/GarmentScanResolver.cs`

```csharp
public static GarmentScanState Resolve(Garment garment, Guid? viewerId, DateTime utcNow);
```

Qoidalar:

| Shart | Natija |
|---|---|
| `Status` `Revoked` yoki `Hidden` | `Invalid` |
| `OwnerId is null` va `viewerId is null` | `Unclaimed` |
| `OwnerId is null` va `viewerId` bor | `Claimable` |
| `OwnerId == viewerId` va muddati tugamagan | `Owned` |
| `OwnerId == viewerId` va muddati tugagan | `Expired` |
| `OwnerId != viewerId` | `Foreign` |

Javob (`Result<GarmentScanResponse>`):

```jsonc
{
  "state": 3,
  "reason": null,
  "garment": {
    "serialNumber": "PT-2026-000123",
    "model": "Peaktofan Classic",
    "color": "Qora",
    "size": "L",
    "material": "95% paxta, 5% elastan",
    "manufacturedAt": "2026-08-14T00:00:00Z",
    "photoFileIds": ["..."]
  }
}
```

**Qat'iy talablar:**

- `Invalid` holatida `garment` **`null`** bo'ladi va `reason` to'ldiriladi. Noma'lum token seriya
  raqami mavjudligini ham tasdiqlamasligi kerak.
- `Foreign`, `Unclaimed`, `Claimable` javoblarida egasining ismi, aktivatsiya sanasi, muddati,
  reytingi va shtamplari **umuman bo'lmaydi** — maydon bo'sh emas, maydonning o'zi yo'q.
- Token topilmasa ham `404` emas, `200` + `state: Invalid` qaytadi. Sabab: `404` va `200` ning farqi
  token mavjudligini oshkor qiladi.

Dapper query: `GetGarmentScanQuery` — bitta `SELECT` futbolka va rasm id'lari uchun, keyin
`GarmentScanResolver` chaqiriladi.

### 5.2 `POST garments/by-token/{token}/claim` — aktivatsiya

Bearer majburiy. Tana yo'q — token yo'lda.

Oqim: `GetByTokenAsync` → topilmasa `GarmentErrors.NotFound` → `garment.Claim(currentUser.UserId,
dateTimeProvider.UtcNow, GarmentValidity.Months)` → `SaveChangesAsync` → javob 5.1 bilan bir xil
shaklda, endi `Owned`.

- **Idempotent**: chaqiruvchi allaqachon egasi bo'lsa `200`, xato emas.
- Boshqa odam egasi bo'lsa `Garment.AlreadyClaimed` (409) va javobda o'sha odam haqida hech narsa
  bo'lmaydi.
- Bitta futbolka — bitta akkaunt. Bitta akkaunt — cheksiz futbolka.

### 5.3 `GET garments/by-token/{token}/passport` — pasport

Bearer majburiy, **faqat egasi**. Egasi bo'lmasa `Garment.NotOwner` (400, `Problem`) — `403` emas,
chunki frontend `403` ni holatga aylantirmasligi kerak; u skan endpointini qayta o'qiydi.

```jsonc
{
  "garment": { /* 5.1 dagi kabi */ },
  "owner": { "firstName": "Jahongir", "lastName": "Esanov" },
  "activatedAt": "2026-09-21T10:12:00Z",
  "expiresAt": "2026-11-21T10:12:00Z",
  "isExpired": false,
  "rating": 0,
  "stamps": []
}
```

- `isExpired` — **serverning hukmi** (`dateTimeProvider.UtcNow` bilan solishtirilgan). Frontend
  telefon soatiga ishonmaydi, shuning uchun bu bayroq shart.
- `isExpired: true` bo'lsa `rating` va `stamps` baribir bo'sh qaytadi — muddati tugagan pasport
  shtamp ko'rsatmaydi.
- `rating` hozir doimo `0`, `stamps` doimo `[]` (0-bo'lim). Gamification yozilganda shu ikki maydon
  to'ladi, kontrakt o'zgarmaydi.
- `owner` ismi Soldier modulidan olinadi (8-bo'lim), Garment moduli profil jadvaliga JOIN qilmaydi.

### 5.4 `GET me/garments` — mening futbolkalarim

Bearer majburiy. Joriy foydalanuvchining futbolkalari, har biri uchun token, seriya, model, birinchi
rasm id'si, `activatedAt`, `expiresAt`, `isExpired`. Dapper, `ORDER BY activated_at DESC`.

### 5.5 `POST admin/garments` — futbolka yaratish

`Policies.Admin`. Tana: `serialNumber`, `model`, `color`, `size`, `material`, `manufacturedAt`,
`photoFileIds`. Javob: `Result<CreateGarmentResponse>` — `id`, `token`, `linkUrl`.

`linkUrl` — `{GarmentOptions.PublicBaseUrl}/t/{token}`. `PublicBaseUrl` `appsettings.json` dan
o'qiladi, kodga yozilmaydi.

Seriya raqami takrorlansa `Garment.SerialNumberInUse`.

Validator: seriya va model bo'sh emas, `manufacturedAt` kelajakda emas.

### 5.6 `GET admin/garments` — ro'yxat

`Policies.Admin`, `PagingRequest<T>` (`First`, `Rows`, `SortField` snake_case, `SortOrder`), javob
`{ "data": [], "totalCount": 0 }`. Filtrlar: `status`, `serialNumber`, `ownerId`.

### 5.7–5.10 — 2-bosqich

- `regenerate-link`: yangi token, eskisi darhol ishlamay qoladi (`Invalid` + `reason: Revoked`).
- `status`: `Hidden`/`Revoked`/`Active` ga o'tkazish.
- `extend`: `ExpiresAt` ni qo'lda uzaytirish (aksiya, muammo bo'lganda).
- `export-links`: CSV — seriya, token, to'liq havola.

## 6. Har bir endpoint uchun yaratiladigan fayllar

Workout modulining papka shakli bilan bir xil:

```text
Application/Garments/GetGarmentScan/
    GetGarmentScanQuery.cs          query + handler (Dapper)
    GarmentScanResponse.cs
    GarmentSummaryResponse.cs
Application/Garments/ClaimGarment/
    ClaimGarmentCommand.cs          command + handler (EF)
Application/Garments/GetPassport/
    GetPassportQuery.cs
    PassportResponse.cs
Application/Garments/GetMyGarments/
    GetMyGarmentsQuery.cs
    MyGarmentResponse.cs
Application/Garments/CreateGarment/
    CreateGarmentCommand.cs
    CreateGarmentCommandValidator.cs
Application/Garments/GetGarments/
    GetGarmentsQuery.cs
    GarmentFilter.cs
    GarmentRowResponse.cs

Presentation/Garments/GetGarmentScan.cs
Presentation/Garments/ClaimGarment.cs
Presentation/Garments/GetPassport.cs
Presentation/Garments/GetMyGarments.cs
Presentation/Garments/Admin/CreateGarment.cs
Presentation/Garments/Admin/GetGarments.cs
Presentation/Garments/Requests/CreateGarmentRequest.cs
Presentation/Garments/Requests/GetGarmentsRequest.cs

Infrastructure/Database/Schemas.cs
Infrastructure/Database/GarmentDbContext.cs
Infrastructure/Garments/GarmentConfiguration.cs
Infrastructure/Garments/GarmentRepository.cs
Infrastructure/GarmentPhotos/GarmentPhotoConfiguration.cs
Infrastructure/Authentication/CurrentUser.cs
Infrastructure/Authentication/OptionalCurrentUser.cs
Infrastructure/Garments/GarmentTokenGenerator.cs
Infrastructure/GarmentModule.cs
```

## 7. Token va xavfsizlik

### 7.1 Token generatsiyasi

`Application/Abstractions/Garments/IGarmentTokenGenerator.cs`, implementatsiya Infrastructure'da:

- `RandomNumberGenerator.GetBytes(20)` → **160 bit**, base64url (`-`, `_`, `=` siz) → 27 belgi.
- Ketma-ket raqam, `Guid`, seriya raqamidan hosila — **ta'qiqlanadi**. TZ talabi: kamida 128 bit.
- `token` ustuniga unique index. Kollizisiyada (amalda bo'lmaydi) qayta generatsiya.

### 7.2 Rate limiting — hozir repo'da yo'q

`src/API` da `AddRateLimiter` umuman ishlatilmagan. Skan va claim endpointlari token bo'yicha
enumeratsiyaga ochiq, shuning uchun:

- `Tofan.Api` da `AddRateLimiter` sozlanadi, Common orqali (har modul o'ziniki qilmaydi).
- `GET garments/by-token/{token}` — IP bo'yicha, masalan daqiqasiga 30.
- `POST .../claim` — foydalanuvchi va token bo'yicha, masalan daqiqasiga 5.
- Limitdan oshsa `429`. Frontend buni alohida xabar bilan ko'rsatadi.

Bu alohida ish bo'lagi — Garment modulining ichida emas, API host'da.

### 7.3 Nimaga ishonmaslik kerak

- Token — **ochiq ma'lumot**. Futbolkani ko'rgan har kim o'qiy oladi. U shaxsni tasdiqlamaydi.
- Egalik, muddat va claim chegarasi **har so'rovda serverda** tekshiriladi.
- Javobga faqat skan qilayotgan odam ko'rishga haqli maydonlar qo'shiladi (5.1).

## 8. Soldier moduliga murojaat

Pasportdagi ism-familiya Soldier modulida. To'g'ridan-to'g'ri JOIN qilinmaydi — Workout'dagi naqsh
takrorlanadi:

- `Application/Abstractions/Soldier/ISoldierService.cs` — `Task<Result<GarmentHolder>> GetHolderAsync(...)`
- `Tofan.Modules.Garment.Soldier/SoldierService.cs` — `ISender` orqali `GetProfileQuery()` chaqiradi
  va `FirstName`/`LastName` ni oladi.

Profil hali yaratilmagan bo'lsa (ro'yxatdan o'tish yarim qolgan holat) `owner` ismi bo'sh satr
qaytadi, pasport baribir ochiladi — bu oqim frontendda mavjud.

## 9. Migratsiyalar

- `Infrastructure/Database/Migrations/`, `garment` schema, snake_case.
- `garments` jadvali: `token` unique, `serial_number` unique, `owner_id` index, `status` index.
- `garment_photos`: `garment_id` FK, `OnDelete(DeleteBehavior.Cascade)`, `(garment_id, sort_order)` index.
- Migratsiya nomi repo uslubida: `AddGarmentEntitiesMigration`.

## 10. Testlar

**Unit (`test/Tofan.Modules.Garment.UnitTests/`):**

- `GarmentTests` — `Claim` bo'sh futbolkani egasiga bog'laydi; ikkinchi `Claim` `AlreadyClaimed`
  qaytaradi; `Revoked` futbolka claim qilinmaydi; `ExpiresAt = ActivatedAt + 2 oy`.
- `GarmentScanResolverTests` — oltita holatning har biri, `viewerId` `null` va `null` emas variantlari.
- `ClaimGarmentCommandHandlerTests` — repository va unit of work mock'lari bilan.
- `CreateGarmentCommandValidatorTests`.
- `GarmentTokenGeneratorTests` — uzunlik, alifbo, takrorlanmaslik.

**Arxitektura testlari:** yangi modul mavjud `Tofan.ArchitectureTests` qoidalariga tushadi —
Domain Infrastructure'ga bog'lanmasligi, Application'da `DbContext` bo'lmasligi va hokazo.

## 11. Frontend kontraktiga ta'sir

Bu vazifa `tofan-nfc/docs/backend-contract.md` ga nisbatan ikkita o'zgarish kiritadi, kelishilgandan
keyin o'sha hujjat ham yangilanadi:

1. **`photoUrls` → `photoFileIds`.** Repo'da fayl har doim `Guid` bilan bog'lanadi
   (`Exercise.VideoFileId`), URL saqlanmaydi. Frontend rasm manzilini
   `{apiBaseUrl}/files/{id}/content` dan o'zi yasaydi — bu endpoint `AllowAnonymous`, ya'ni
   begona skanda ham rasm ko'rinadi.
2. **`Invalid` holatiga `reason` qo'shildi** (`GarmentInvalidReason`). Frontend hozir bitta
   "havola ishlamayapti" ekranini ko'rsatadi; `reason` kelgach bekor qilingan, yashirilgan va
   boshqaga o'tgan futbolka uchun alohida matn qo'shiladi.

## 12. Ochiq savollar (mahsulot egasiga)

Bular backend ishini to'smaydi, lekin javob kelguncha quyidagicha qabul qilingan:

| Savol | Hozirgi qaror |
|---|---|
| Muddat necha oy? | 2 oy (`GarmentValidity.Months = 2`) |
| Futbolka sotilsa pasport yangi egaga o'tadimi? | Yo'q. O'tkazish uchun alohida `transfer` oqimi kerak bo'ladi |
| Muddati tugagan pasport yashirinadimi yoki qulflanadimi? | Qulflanadi: ma'lumot qaytadi, `isExpired: true`, shtamp va reyting yo'q |
| Reyting qanday hisoblanadi? | Aniqlanmagan — shuning uchun `0` |
