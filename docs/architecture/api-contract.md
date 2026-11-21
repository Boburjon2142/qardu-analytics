# API kontrakti (dastlabki)

> **Maqom:** endpoint guruhlari — **Specified** (TT 4.11). Yo'l tafsilotlari, maydonlar va kodlar — **Proposed**. OpenAPI 3 sxema keyingi fazada generatsiya qilinadi.

## 1. Umumiy qoidalar
- Prefiks `/api/v1/`; DRF; OpenAPI 3.
- Auth: Django session cookie + CSRF (Approved). `GET /api/v1/auth/csrf`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`. Login rate-limit.
- Har javobda `X-Request-ID`; yagona xato formati:
  ```json
  { "error": { "code": "permission_denied", "message": "…", "request_id": "…", "details": {} } }
  ```
  Xato matnlarida maxfiy kontent bo'lmaydi.
- Pagination (cursor yoki page — Unresolved), server-side filtering, `Idempotency-Key` (natija submit, publish).
- Ruxsat inkori: boshqa unit uchun `404`, rol yetishmasa `403`, auth yo'q `401`.
- ADMIN / PRIVATE / PUBLIC uchun alohida serializer va queryset; PUBLIC endpointlar PRIVATE modellarni import qilmaydi.

## 2. Endpoint guruhlari
| Guruh | Zona | Operatsiyalar |
|---|---|---|
| `/admin/forms`, `/admin/form-versions`, `/admin/form-assignments` | ADMIN | CRUD (draft), `test`, `publish`, `archive`, biriktirish |
| `/admin/organization-change-requests` | ADMIN | taklif; `approve`/`reject` (vakolatli rahbar), `effective_from` |
| `/admin/users`, `/admin/role-assignments`, `/admin/supervision-scopes` | ADMIN | foydalanuvchi, muddatli rollar, scope (**Proposed** yo'llar) |
| `/my/forms`, `/my/results`, `/my/reports` | PRIVATE | rahbar formalari; draft yaratish/tahrirlash, `submit`, yangi revision |
| `/reviews` | PRIVATE | tasdiqlovchi navbati; `approve`/`reject` |
| `/supervision/results`, `/supervision/analytics` | PRIVATE | scope'dagi natijalar, davr filtrlari, drill-down |
| `/supervision/comments`, `/supervision/revision-requests` | PRIVATE | maxfiy izoh, reviziya so'rovi; **javob endpointi yo'q** |
| `/files/{id}` | PRIVATE | authenticated streaming / qisqa muddatli URL |
| `/publications` | PRIVATE | taklif, snapshot yaratish, `publish`, `rollback` |
| `/public/statistics` | PUBLIC | faqat published snapshot; keshlanadi |
| `/notifications` | PRIVATE | in-app xabarlar, o'qilgan deb belgilash |
| `/health`, `/version` | tizim | Phase 1 |

## 3. Natija kiritish
`POST /my/results` (draft) → `PATCH /my/results/{id}/revisions/{n}` (faqat draft) → `POST …/submit` (server validatsiyasi: rol, unit, form_version, majburiy maydonlar, format, takrorlash, davr, dalil). Tuzatish: `POST /my/results/{id}/revisions` (yangi rev_no). `approved` revision uchun PATCH/DELETE mavjud emas (405).

## 4. PUBLIC javob sxemasi (cheklov)
Faqat: `snapshot_version`, `published_at`, `period`, `metric_code`, `value` (son), `unit_of_measure`, guruh bo'yicha agregat. **Hech qachon**: tavsif, fayl, shaxs ID/ismi, izoh, tasdiq izohi, unit ichki ID'lari (Proposed: ochiq nomlar/kodlar ishlatiladi).

## 5. Idempotentlik va parallellik
`submit`, `approve`, `publish`, `rollback` — `Idempotency-Key`; approve/submit `SELECT … FOR UPDATE` yoki versiya tekshiruvi bilan; ikki tasdiqlovchi bir vaqtda — faqat bittasi muvaffaqiyatli (concurrency test).

## 6. Natija status o'tishlari (Proposed matritsa; statuslar Specified)
| Dan | Ga | Kim | Shart |
|---|---|---|---|
| draft | submitted | muallif | auth, scope |
| submitted | validation_failed | tizim | validatsiya xatosi (sabab ko'rsatiladi) |
| submitted | pending_approval | tizim | validatsiya o'tdi |
| validation_failed | draft | muallif | tuzatish uchun |
| pending_approval | approved | tasdiqlovchi | ≠ muallif, biriktirilgan |
| pending_approval | rejected | tasdiqlovchi | izoh majburiy |
| rejected | draft (yangi revision) | muallif | — |
| approved | revision_requested | rektor/prorektor | scope ichida; **kontent o'zgarmaydi** |
| revision_requested | draft (yangi revision) | muallif | — |
| approved | superseded | tizim | yangi revision approved bo'lganda |

## 7. Unresolved
Pagination turi, versiyalash siyosati (`/v2`), eksport formatlari, rate-limit qiymatlari, idempotency kalit TTL.
