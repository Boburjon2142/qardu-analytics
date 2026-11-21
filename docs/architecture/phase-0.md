# Phase 0 — Arxitektura umumiy ko'rinishi

> **Maqom:** PROPOSED (taklif). Hujjatdagi hech narsa hali implementatsiya qilinmagan, faqat §1 "Mavjud holat" bundan mustasno.
> **Manba:** TT v4.0 (17.11.2026, imzolanmagan loyiha), `CLAUDE.md`, Phase 0 audit hisoboti.
> Belgilar: **Specified** (TT), **Approved** (egasi tasdiqlagan), **Proposed**, **Unresolved**.

## 1. Mavjud holat (verified)
- `main` branch; Next.js 15 / React 19 / Tailwind 3 Public Dashboard (faqat mock ma'lumot): `src/app/(public)/page.tsx`, `src/features/dashboard/*`, `src/data/mocks/*`.
- Backend, DB, auth, RBAC, Docker, CI **yo'q**.
- Mavjud frontend `apps/web` ga ko'chirilishi **2026-11-21 da ko'chirildi** (Approved qaror #2); `design-baseline/` va `.agent/` ildizda qoldi.

## 2. Taklif etilgan monorepo tuzilmasi (Proposed)
```text
qardu-analytics/
├── apps/
│   ├── web/              # Next.js (frontend, 2026-11-21 da ko'chirildi)
│   └── api/              # Django + DRF
│       ├── config/       # settings/{base,local,staging,production}.py
│       └── apps/         # accounts, organization, forms, results, approvals, comments,
│                         # analytics, publications, notifications, audit, files, policy
├── packages/
│   └── design-tokens/    # tokens.css — yagona manba (Unresolved: kerakmi yoki apps/web ichida qolsinmi)
├── infra/                # docker/, nginx/, ci/
├── docs/                 # specification/, architecture/, design/, testing/, adr/
├── CLAUDE.md
└── README.md
```
Migratsiya tartibi (alohida tasdiq bilan): 1) `git mv` orqali `src`, `e2e`, `public`, konfiguratsiyalar → `apps/web/`; 2) importlar/`tsconfig` yo'llari tekshiriladi; 3) mavjud testlar va build ishlashi tasdiqlanadi; 4) `design-baseline/` va `assssetssssss/` taqdiri hal qilinadi.

## 3. Django + Next.js integratsiyasi (Proposed)
- Brauzer → **Nginx** → `/` Next.js, `/api/v1/` Django (bitta origin; cross-site cookie muammolari yo'q).
- Next.js server komponentlari faqat **PUBLIC** endpointlarni chaqiradi (`/api/v1/public/*`, keshlanadi). PRIVATE/ADMIN sahifalar foydalanuvchi sessiyasi bilan client/server tomondan `/api/v1/*` ni chaqiradi; sessiya cookie'si Django'da qoladi, Next.js uni saqlamaydi/dekodlamaydi.
- Mavjud `IDashboardRepository` interfeysi saqlanadi; `MockDashboardRepository` → `DjangoPublicDashboardRepository` (UI o'zgarmaydi). Mock ma'lumot faqat dev/test'da.
- TypeScript tiplari OpenAPI 3 sxemadan generatsiya qilinadi (Proposed; generator tanlovi Unresolved).
- Zonalar: `(public)`, `(private)`, `(admin)` route group'lar; har biri alohida layout, alohida TanStack Query cache namespace (PUBLIC va PRIVATE kesh aralashmaydi; logout'da private kesh tozalanadi — TT 4.12).

## 4. Autentifikatsiya va ruxsatlar (qisqacha; to'liq: `permission-matrix.md`)
- **Approved:** Django session auth, HttpOnly + Secure + SameSite cookie, CSRF himoyasi. Login rate-limit, parol siyosati, MFA — Unresolved (MFA: TT'da talab yo'q, tavsiya).
- Ruxsat = RBAC (`RoleAssignment`, `valid_from/valid_to`) + org scope (`SupervisionScope`, org daraxti) + object permission + maxfiylik klassi. Barcha qarorlar yagona `policy` modulida; view/serializer ichida tarqoq `if role ==` yo'q.

## 5. Tashkiliy iyerarxiya (Specified + Proposed model)
- Tuzilma kodga yozilmaydi: `OrganizationUnit` + `OrganizationUnitVersion` (nom, tur, parent, `valid_from`, `valid_to`).
- O'zgarish faqat `OrganizationChangeRequest` (create/rename/reparent/close) → vakolatli rahbar tasdiqi → `effective_from` kelganda kuchga kiradi. Rad etilgani joriy tuzilmani o'zgartirmaydi (AC-02).
- Natija `unit_id` + o'sha paytdagi mansublik (`unit_version_id`) bilan saqlanadi (AN-07).
- Mavjud `faculties.mock.ts` real reyestr emas; hardcode qilingan ro'yxat sifatida **olib tashlanadi**, real ro'yxatni universitet beradi (Unresolved).

## 6. CUSTOM forma hayotiy sikli (Specified FM-01..08)
`draft → testing → published → superseded → archived`. `FormDefinition` (doimiy) → `FormVersion` (published bo'lgach schema immutable; DB darajasida `UPDATE` taqiqlanadi) → `FormAssignment` (unit_id, amal muddati). Maydon turlari allowlist: text, long text, integer, decimal, date, select, multi-select, boolean, file, repeatable group. Validatsiya serverda JSON Schema asosida; HTML/JS bajarilmaydi. Faqat texnik administrator boshqaradi. Forma UI dizayn tokenlarini o'zgartira olmaydi.

## 7. Immutable natija reviziyalari (Specified AC-05)
`ActivityResult` (doimiy ID) → `ResultRevision` (rev_no, form_version_id, payload JSONB, event_date, period, checksum, status). `approved` reviziya: DB trigger + `REVOKE UPDATE, DELETE` + ilova qatlami. Tuzatish = yangi revision, `superseded` belgisi alohida status-hodisa jadvalida (kontentni o'zgartirmasdan). Kontent bilan status **alohida saqlanadi** (status o'zgarishi kontent qatorini UPDATE qilmasligi uchun) — Proposed.

## 8. Tasdiqlash jarayoni
Status o'tishlari `api-contract.md` §6 da. Qoidalar: submitter ≠ approver (serverda tekshiriladi), har o'tish `AuditEvent` yozadi, `ApprovalDecision` izoh bilan. Approval matrix (kim nimani tasdiqlaydi) — Unresolved.

## 9. Tarixiy analitika (Specified AN-01..07)
- `MetricDefinition` har metrika uchun `aggregation_rule` (sum | latest | avg_weighted | distinct_count | none) — **ro'yxat Proposed**, aniq qiymatlar universitet bilan kelishiladi.
- `ResultMetricValue`: approved reviziyadan relational proyeksiya; `NULL` saqlanadi, `0` ga aylantirilmaydi.
- Dedup: `ReportItemLink` orqali davriy hisobot joriy natijani qayta sanamaydi; hisoblash faqat har natijaning *joriy approved* reviziyasi bo'yicha (yoki tanlangan sana bo'yicha as-of reviziya).
- Davr filtrlari: oy/chorak/yarim yil/yil/ixtiyoriy. Ma'lumot yo'q → "Ma'lumot mavjud emas".

## 10. PUBLIC snapshot izolyatsiyasi (Specified 4.9)
Oqim: `PublicCandidate` (unit rahbari taklifi) → maxfiylik/small-group tekshiruvi → publisher `PublicationSnapshot` (versiyalangan, numeric-only) yaratadi → e'lon / rollback. PUBLIC API **faqat** `PublicationSnapshot` dan o'qiydi. Taklif: alohida DB role (`qardu_public_ro`) faqat snapshot jadvallariga SELECT huquqi bilan; alohida serializerlar; PRIVATE modellar PUBLIC serializerda import qilinmaydi (lint qoidasi). Yangi approved natija PUBLIC'ni avtomatik yangilamaydi. Small-group chegarasi (masalan, k<N) — Unresolved.

## 11. Audit va xavfsizlik arxitekturasi
- `AuditEvent` append-only (actor, vaqt, obyekt turi/ID, harakat, request_id; maxfiy matn **yozilmaydi**).
- Fayllar: private object storage, SHA-256, MIME/size tekshiruvi, scan status, qisqa muddatli URL yoki authenticated streaming; web-root'da emas.
- HTTPS/HSTS, security headerlar (hozir `next.config.mjs` da yo'q), CSRF, rate limit, least-privilege servis identifikatorlari, secretlar env/secret manager'da, dependency audit.
- Texnik administrator maxfiy natija/izohni avtomatik ko'rmaydi (alohida "break-glass" jarayoni — Unresolved).

## 12. Test va deploy (Proposed)
- pytest-django: permission negative matritsasi (AC-01), concurrency, immutability trigger; Vitest; Playwright (`toHaveScreenshot`, 320/390/768/1440/1920); axe; k6/Locust (100 foydalanuvchi profili).
- Docker Compose: web, api, postgres, redis (kerak bo'lganda), celery (kerak bo'lganda), nginx; local/staging/production alohida konfiguratsiya; CI provayderi Unresolved.
