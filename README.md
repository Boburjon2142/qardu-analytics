# QarDU Analytics

**Qarshi davlat universiteti faoliyat natijalarini yig‘ish, tasdiqlash, tarixiy saqlash va tahlil qilish uchun axborot-analitik platforma.**

> **Loyiha holati:** Phase 0a (arxitektura hujjatlari). Repozitoriyda faqat **Public Dashboard prototipi** (Next.js, **mock ma'lumotlar bilan**) mavjud. Backend, ma'lumotlar bazasi, autentifikatsiya, ADMIN va PRIVATE qismlari **hali yaratilmagan**. README'ning qolgan qismi rejalashtirilgan tizimni tavsiflaydi va u hozir ishlayotganini anglatmaydi.  
> **Arxitektura hujjatlari:** [`docs/architecture/`](./docs/architecture/phase-0.md) (barchasi *Proposed*, tasdiqlanmagan).  
> **Asos:** *QarDU Analytics — Texnik topshiriq (TT) v4.0*, 17.11.2026, **rasmiy tasdiqlash uchun loyiha**.  
> **Muhandislik qoidalari:** [`CLAUDE.md`](./CLAUDE.md).

## 1. Maqsad

QarDU Analytics universitet fakultetlari, kafedralari, bo‘limlari va markazlarining **amalda erishilgan natijalari**ni yagona, vakolatlar bilan himoyalangan axborot muhitida boshqaradi. Platforma natijalarni kiritish, tekshirish, tasdiqlash, o‘zgarmas tarixini saqlash va vakolat doirasida vizuallashtirishni ko‘zda tutadi. Ochiq sahifalarda faqat alohida nashr qilingan, maxfiylik tekshiruvidan o‘tgan sonli statistikalar aks etadi.

**Tizimga kirmaydi:** KPI, target, reja–fakt reytingi, xodimlarga avtomatik baho qo‘yish, vazifalar taqsimoti, ish vaqtini hisoblash yoki ichki chat.

## 2. Platforma qismlari

| Qism | Asosiy vazifa | Chegara |
| --- | --- | --- |
| **ADMIN** | Tashkiliy tuzilma o‘zgarishlariga so‘rov, foydalanuvchi/vakolatlar, CUSTOM formalar, texnik boshqaruv | Texnik administrator maxfiy natija va izohlarni avtomatik ko‘rmaydi |
| **PRIVATE** | Natija kiritish, dalillar, tasdiqlash, tarix, analitika, rahbarning maxfiy izohi va bildirishnomalar | Har bir so‘rovda rol + bo‘linma + obyekt + maxfiylik ruxsati tekshiriladi |
| **PUBLIC** | Ruxsat etilgan sonli ko‘rsatkichlar, grafiklar, jadvallar va filtrlar | Xom dalillar, matnli tavsiflar, shaxs identifikatorlari va ichki izohlar oshkor etilmaydi |

## 3. MVP modullari

- **M01 — Universitet tuzilmasi:** fakultet, kafedra, bo‘lim va markazlarning amal qilish sanalari bilan saqlanadigan iyerarxiyasi; tuzilmani o‘zgartirish faqat tasdiqlangan so‘rov orqali.
- **M02 — Talabalar statistikasi:** universitet tasdiqlaydigan CUSTOM formalar va metrikalar asosida natijalarni qayd qilish.
- **M04 — Professor-o‘qituvchilar va kadrlar:** kelishilgan formalar orqali tegishli natijalarni yuritish.
- **M05 — Ilmiy faoliyat:** ilmiy natijalarni qayd etish va davrlar bo‘yicha tahlil qilish.

M03 yoki qo‘shimcha modullarni rasmiy talab bo‘lmasdan yaratmang. M02/M04/M05 uchun aniq maydonlar, o‘lchov birliklari va aggregatsiya qoidalari hali universitet bilan kelishiladi.

## 4. Asosiy ish jarayonlari

### Natijani kiritish va tasdiqlash

1. Vakolatli bo‘linma rahbari o‘ziga biriktirilgan **published** CUSTOM forma orqali `draft` yaratadi.
2. Server majburiy maydonlar, format, dalil fayli, vaqt/davr va takrorlash ehtimolini tekshiradi.
3. Natija mas’ul tasdiqlovchiga yuboriladi; **muallif o‘z natijasini tasdiqlay olmaydi**.
4. `approved` versiya o‘zgarmas tarixiy yozuv sifatida saqlanadi. Tuzatish yangi `ResultRevision` va takroriy tasdiqlash orqali amalga oshadi.
5. Rektor yoki vakolatli prorektor izoh va qayta ko‘rish so‘rovini kiritishi mumkin; maxfiy izoh faqat muallifi va belgilangan oluvchiga ko‘rinadi. Izohga javob yozish/chat funksiyasi yo‘q.

**Natija holatlari:** `draft`, `submitted`, `validation_failed`, `pending_approval`, `approved`, `rejected`, `revision_requested`, `superseded`.

### CUSTOM formalar

Formalarni faqat texnik administrator yaratadi, sinovdan o‘tkazadi, nashr qiladi va bo‘linmalarga biriktiradi. Hayotiy sikl: `draft → testing → published → superseded → archived`. Nashr qilingan `FormVersion` tahrirlanmaydi; yangi maydonlar uchun yangi versiya yaratiladi. Forma konfiguratsiyasidan ixtiyoriy HTML/JavaScript bajarilmaydi.

### Analitika va ochiq nashr

- Filtrlar: oy, chorak, yarim yil, yil va ixtiyoriy sana oralig‘i.
- Reviziyalar hamda joriy natijaga havola qilgan davriy hisobotlar **ikki marta sanalmaydi**.
- `NULL` qiymati `0` deb qabul qilinmaydi; foiz, o‘rtacha va noyob subyektlar uchun metrikaga xos agregatsiya qoidasidan foydalaniladi.
- Bo‘linma rahbari ruxsatli statistikani nashrga taklif qiladi; **Publisher** alohida, versiyalangan **numeric-only snapshot**ni e’lon qiladi. Yangi tasdiqlangan ichki natija PUBLICni avtomatik yangilamaydi.

## 5. Foydalanuvchi rollari

| Rol | Asosiy vakolat |
| --- | --- |
| Kafedra mudiri | O‘z kafedrasiga tegishli natijalarni kiritish/ko‘rish |
| Bo‘lim yoki markaz rahbari | O‘z bo‘linmasi natijalarini kiritish/ko‘rish |
| Dekan | O‘z fakulteti va unga qarashli kafedralar natijalarini ko‘rish |
| Prorektor | Administrator biriktirgan bo‘linmalar bo‘yicha tahlil, izoh va reviziya so‘rovi |
| Rektor | Barcha bo‘linmalar natijalarini ko‘rish; boshqalarning maxfiy izohlariga avtomatik ruxsat yo‘q |
| Mas’ul tasdiqlovchi | Belgilangan natijalarni tasdiqlash yoki qaytarish |
| Publisher | Tekshirilgan statistik snapshotlarni ochiq nashr qilish |
| Texnik administrator | Tizim konfiguratsiyasi, formalar, vakolatlar va tuzilma so‘rovlari |
| Public visitor | Faqat nashr etilgan statistik snapshotlarni ko‘rish |

Ruxsat nazorati **RBAC + organizational scope + object-level permissions + confidentiality classification** asosida, backendning `list/detail/create/update/export/download` nuqtalarida tekshiriladi. Rollarning amal qilish muddati mavjud bo‘ladi.

## 6. Texnologik stek (TT v4.0 bo‘yicha reja)

| Qatlam | Tanlangan yo‘nalish |
| --- | --- |
| Frontend | Next.js + TypeScript |
| UI | Tailwind CSS + shadcn/ui + design tokens |
| Server state, jadval va grafik | TanStack Query, TanStack Table, Recharts |
| Backend / API | Django + Django REST Framework; `/api/v1/` |
| Ma’lumotlar bazasi | PostgreSQL; relational core + versiyalangan JSONB + metric projection |
| Asinxron vazifalar | Zaruratga qarab Redis/Celery (email, fayl tekshiruvi, eksport) |
| Infrastruktura | Docker, Nginx, staging, CI/CD, monitoring va rollback |

**Haqiqatda mavjud (verified):** Next.js ^15.1.7, React ^19, TypeScript, Tailwind ^3.4, TanStack Query/Table, Recharts, Vitest, Playwright (`package.json`). shadcn/ui hali o‘rnatilmagan. Django, PostgreSQL, Redis/Celery, Docker, Nginx va CI **mavjud emas**.

**Qabul qilingan qaror:** autentifikatsiya — Django session (HttpOnly/Secure/SameSite cookie + CSRF). Boshqa versiyalar, hosting va monorepo konfiguratsiyasi: [`docs/architecture/architecture-decisions.md`](./docs/architecture/architecture-decisions.md).

## 7. Repozitoriy tuzilmasi

### Hozirgi (haqiqiy)

```text
.
├── CLAUDE.md                 # Claude Code uchun doimiy qoidalar
├── README.md
├── docs/
│   ├── specification/        # TT v4.0 (.docx)
│   ├── architecture/         # Phase 0 hujjatlari (Proposed)
│   └── design/               # Joriy dizayn tizimi (DRAFT)
├── apps/web/src/             # Next.js ilova (app/, components/, features/, data/mocks/, styles/, test/)
├── apps/web/e2e/             # Playwright testlari
├── design-baseline/draft/    # DRAFT skrinshotlar (tasdiqlanmagan, faqat ma'lumotnoma)
├── public/assets/            # Logotiplar
├── .agent/                   # Dizayn workflow ko'rsatmalari
└── package.json, next.config.mjs, tailwind.config.ts, vitest.config.ts, playwright.config.ts
```

### Rejalashtirilgan (Proposed, hali yaratilmagan)

`apps/web` (mavjud frontend 2026-11-21 da shu yerga ko‘chirildi), `apps/api` (Django/DRF), `packages/design-tokens`, `infra/` (Docker/Nginx/CI). To‘liq: [`docs/architecture/phase-0.md`](./docs/architecture/phase-0.md).

## 8. Ishlab chiqish yo‘l xaritasi

| Bosqich | Yakuniy natija | Holat |
| --- | --- | --- |
| **Phase 0** | TT gap-analysis; arxitektura, ERD, permission matrix, ADR, MVP backlog | Phase 0a hujjatlari tayyor (tasdiq kutilmoqda) |
| **Phase 1** | Repo scaffold, sifat tekshiruvlari, lokal Docker/PostgreSQL, bazaviy CI | Rejada |
| **Phase 2** | Authentication/RBAC va M01; tuzilma tarixini tasdiqlash | Rejada |
| **Phase 3** | CUSTOM formalar, natija/reviziya, dalil, approval va audit | Rejada |
| **Phase 4** | M02/M04/M05, metrikaning to‘g‘ri agregatsiyasi va dashboardlar | Rejada |
| **Phase 5** | Maxfiy izohlar, bildirishnomalar, Publisher va PUBLIC snapshotlar | Rejada |
| **Phase 6** | E2E, xavfsizlik, accessibility, load test, restore/rollback va pilot | Rejada |

> Har bir bosqichni boshlashdan oldin uning scope’i va qabul mezonlari tasdiqlanadi. Hozir **Phase 0a** yakunlangan; scaffold, dependency o‘rnatish va frontendni ko‘chirish alohida tasdiqni kutadi.

## 9. Lokal ishga tushirish

Faqat mavjud **frontend prototipi** (mock ma'lumot) uchun. `apps/web/package.json` skriptlari (`cd apps/web` dan ishga tushiring): `npm run dev`, `build`, `start`, `lint`, `test` (Vitest), `test:e2e` (Playwright). Ko‘chirishdan keyin `tsc --noEmit`, `vitest run` (20/20) va `next build` o‘tdi; `lint` va Playwright e2e ishga tushirilmagan. Backend, DB va Docker mavjud emas.

> Vizual regressiya testi (`apps/web/e2e/visual-regression.spec.ts`) hozir piksel taqqoslamaydi; u dizayn regressiyasi isboti emas.

## 10. Xavfsizlik va ma’lumotlar yaxlitligi

- `.env`, tokenlar, parollar va haqiqiy universitet ma’lumotlarini Git’ga kiritmang; lokal sinovda sintetik ma’lumotlardan foydalaning.
- `approved` reviziyalar append-only; oddiy UPDATE/DELETE taqiqlanadi. Izchillik DB transaction/constraint va audit darajasida mustahkamlanadi.
- Dalil fayllari private storage’da saqlanadi; access control, MIME/size tekshiruvi, SHA-256 va xavfsizlik tekshiruvi statusi qo‘llanadi.
- PUBLIC va PRIVATE API/serializer/cache chegaralari mustaqil himoyalanadi; oddiy admin roli maxfiy materiallarga universal kirish huquqini bermaydi.
- HTTPS, xavfsiz cookie/CSRF, login rate-limit, audit, backup/restore va rollback uchun testlar talab qilinadi.
- HEMIS kabi tashqi integratsiyalar faqat alohida ruxsat, identifikator/mapping va API kontraktlaridan keyin amalga oshiriladi.

## 11. Dizayn va qabul mezonlari

**Design Freeze:** yangi loyiha uchun avval design tokens, ekranlar va Figma/screenshot baseline tasdiqlanadi. Shundan keyin tasdiqlangan ekranlar yozma **Change Request (CR)**siz vizual o‘zgartirilmaydi. CUSTOM forma administratoriga UI stilini o‘zgartirish vakolati berilmaydi.

**Joriy holat:** `design-baseline/draft/` dagi skrinshotlar (1440/768/390) **DRAFT** — tasdiqlanmagan, Design Freeze e'lon qilinmagan. Tafsilot: [`docs/design/design-system-current.md`](./docs/design/design-system-current.md).

**Qabul maqsadlari (hali o‘lchanmagan):**

- WCAG 2.2 AA; 320, 390, 768, 1440 va 1920 px ekranlar, 200% zoom va keyboard navigation.
- 100 parallel foydalanuvchi: 40 ta yozish, 40 ta PRIVATE dashboard, 20 ta PUBLIC; 30 daqiqalik test va 5 daqiqalik ramp-up.
- Oddiy API `p95 ≤ 300 ms`; analytics API `p95 ≤ 500 ms`; natijani saqlash `p95 ≤ 1000 ms` (katta upload bundan mustasno).
- PUBLIC: `p75 LCP ≤ 2.5 s`, `INP ≤ 200 ms`, `CLS ≤ 0.1`; yuklama testida `5xx < 1%`.
- TT v4.0 dagi **AC-01…AC-14** qabul ssenariylari bajarilishi.

Yuqoridagi qiymatlar **dastlabki loyiha SLO/qabul maqsadlari**, amaldagi o‘lchangan natijalar emas.

## 12. Hali tasdiqlanishi kerak bo‘lgan masalalar

- TT v4.0 ga rasmiy imzolar; haqiqiy universitet tuzilmasi va mas’ul shaxslar.
- Prorektor scope’lari, approval matrix, publisherlar, tuzilma o‘zgarishini tasdiqlovchi vakolatli rahbar.
- M02/M04/M05 formalarining aniq maydonlari, dalil majburiyligi, aggregatsiya va deduplikatsiya qoidalari.
- Ma’lumotlarni saqlash muddati, small-group privacy chegaralari, hosting, SMTP, RPO/RTO va integratsiya ruxsatlari.
- Dastlabki **20 MB dalil fayli / 50 MB import** limitlari tavsiya maqomida, qat’iy tasdiqlanmagan.
- Figma dizayn etaloni va keyingi vizual Change Request tartibi.

## 13. Ishlash tartibi va hujjatlar

- **`README.md`** — yangi dasturchi uchun loyiha tavsifi, haqiqiy joriy holat va ishga tushirish yo‘riqnomasi.
- **`CLAUDE.md`** — Claude Code uchun doimiy cheklovlar, xavfsizlik, ish ketma-ketligi va javob formati.
- **TT v4.0** — funksional talablar va qabul mezonlarining asosiy loyiha manbasi; hujjat hozir rasmiy tasdiqlash bosqichida.
- **`docs/architecture/`** — arxitektura qarorlari, ERD, ruxsat matritsasi, API kontrakti va ochiq qarorlar (hammasi *Proposed*).

**Keyingi amaliy qadam:** Phase 0 arxitekturasini tayyorlash va tasdiqlash. Hali biror modulni “tayyor” deb belgilash yoki sinovdan o‘tmagan buyruqlarni README’ga qo‘shish mumkin emas.

---

*Hujjatning boshlang‘ich versiyasi: 1.0 · 17-noyabr 2026 · QarDU Analytics greenfield planning.*
