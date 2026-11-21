# Arxitektura qarorlari (ADR jurnali)

Maqomlar: **Specified** (TT v4.0) · **Approved** (egasi tasdiqlagan) · **Proposed** · **Unresolved**.

| ID | Qaror | Maqom | Asos / izoh |
|---|---|---|---|
| ADR-001 | Mavjud Next.js Public Dashboard saqlanadi | Approved | Phase 0a qarori #1 |
| ADR-002 | Frontend `apps/web` ga ko'chiriladi — hozir emas, alohida tasdiq bilan | Approved (reja) | Qaror #2 |
| ADR-003 | Mavjud `design-baseline/draft` faqat ma'lumotnoma; Design Freeze e'lon qilinmagan | Approved | Qaror #3 |
| ADR-004 | Ildiz yo'riqnoma fayli `CLAUDE.md` | Approved | Qaror #4 |
| ADR-005 | Django session auth, HttpOnly/Secure/SameSite cookie, CSRF | Approved (arxitektura taklifi sifatida) | Qaror #6; TT 4.12 |
| ADR-006 | Backend: Django + DRF, `/api/v1/` | Specified | TT 4.11, 4.16 |
| ADR-007 | DB: PostgreSQL, relational core + versioned JSONB | Specified | TT 4.10 |
| ADR-008 | Frontend: Next.js + TS, Tailwind, TanStack Query/Table, Recharts | Specified | TT 4.16 |
| ADR-009 | shadcn/ui ishlatiladi, lekin o'rnatish alohida tasdiq bilan | Proposed | TT 4.16 shadcn/ui ni nomlaydi; hozir o'rnatilmagan |
| ADR-010 | Bitta origin (Nginx orqali) — Next.js va Django bir domen ostida | Proposed | SameSite cookie va CSRF soddaligi |
| ADR-011 | Ruxsat qarorlari yagona `policy` modulida | Proposed | Tarqoq tekshiruvlardan qochish |
| ADR-012 | `approved` reviziya append-only: DB trigger + REVOKE + ilova qatlami | Specified (talab) / Proposed (mexanizm) | TT 4.6, 4.10, AC-05 |
| ADR-013 | Kontent va status alohida saqlanadi (status-hodisa jadvali) | Proposed | Kontent qatori UPDATE qilinmasligi uchun |
| ADR-014 | Org tuzilma effective-dated versiyalar bilan, mansublik natijaga snapshot | Specified (talab) / Proposed (model) | TT 3, 4.3, AN-07 |
| ADR-015 | CUSTOM forma schema: JSON Schema, allowlist maydon turlari | Specified (turlar) / Proposed (JSON Schema) | FM-03, FM-07 |
| ADR-016 | `aggregation_rule` har metrikada; oddiy SUM default emas | Specified | AN-05 |
| ADR-017 | PUBLIC faqat `PublicationSnapshot` dan o'qiydi; alohida DB role | Specified (izolyatsiya) / Proposed (DB role) | TT 4.9 |
| ADR-018 | Redis/Celery faqat email, fayl skan, eksport uchun, kerak bo'lganda | Specified ("ehtiyojga qarab") | TT 4.16 |
| ADR-019 | OpenAPI 3 sxemadan TS tiplari generatsiyasi | Proposed | Generator tanlovi Unresolved |
| ADR-020 | Mock repository faqat dev/test'da; production'da Django repository | Proposed | Mavjud adapter pattern |
| ADR-021 | Haqiqiy vizual regressiya (`toHaveScreenshot`) approved baselinedan keyin | Proposed | Hozirgi test taqqoslamaydi |
| ADR-022 | Texnik admin maxfiy kontentga avtomatik kirmaydi | Specified | TT 4.1, 4.2 |

## Qarorlar 2026-11-21 (egasi, Phase 0)
- Monorepo: `apps/web` + `apps/api` (ADR-002 tasdiqlandi; ko'chirish hali bajarilmagan, alohida tasdiq bilan). Design tokens `apps/web` ichida.
- CI: GitHub Actions (Approved).
- MFA: Phase 2 da qayta ko'rib chiqiladi (Deferred).
- `design-baseline/draft` DRAFT qoladi; Design Freeze e'lon qilinmagan.

## Versiyalar (yo'nalish tanlandi, aniq pin Unresolved)
Egasi "eng yangi" yo'nalishini tanladi (Python 3.13, Django 5.2+, PostgreSQL 17, Node 24). Aniq versiyalar Phase 1 da o'rnatishdan oldin rasmiy manbadan tekshirilib, tasdiqqa taqdim etiladi (Django/Postgres/Python mosligi hali tekshirilmagan).
Oldingi holat: Python, Django, PostgreSQL, Node, Next.js minor versiyalari tanlanmagan. Hozirgi `package.json` (Next ^15.1.7, React ^19, Tailwind ^3.4) — verified fakt, lekin kelgusi versiya siyosati hal qilinmagan.

## Ishlatilmaydigan qarorlar
- JWT: tanlanmadi (same-site brauzer ilovasi, ADR-005).
- HEMIS integratsiyasi: ruxsat, mapping va API kontrakti tasdiqlanmaguncha scope'dan tashqari.
