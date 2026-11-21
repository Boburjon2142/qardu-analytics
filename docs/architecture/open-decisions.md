# Universitet tasdig'ini talab qiladigan ochiq qarorlar

> Bu ro'yxatdagi hech bir narsa o'ylab topilmaydi. Har bir band uchun javobni universitet beradi. Holat: **OPEN** (hammasi).

## A. Rasmiy hujjatlar
| # | Qaror | Manba |
|---|---|---|
| A1 | TT v4.0 rasmiy imzolari (tasdiqlovchi, buyurtmachi, texnik mas'ul, axborot xavfsizligi mas'uli) | TT titul |
| A2 | Universitet rekvizitlari | TT passport |
| A3 | Ishlab chiquvchi tomon va shartnoma muddatlari | TT 1.4 |

## B. Tashkiliy tuzilma va shaxslar
| # | Qaror | Manba |
|---|---|---|
| B1 | Haqiqiy fakultet/kafedra/bo'lim/markaz reyestri va faol sanalar | TT 3, 9 |
| B2 | Tuzilma o'zgarishini tasdiqlovchi vakolatli rahbar (shaxs/lavozim) | TT 4.3 |
| B3 | Prorektor scope matritsasi; bir bo'limga bir nechta scope qoidasi | TT 9 |
| B4 | Natijani tasdiqlovchilar va approval matrix (unit/forma/natija turi bo'yicha) | TT 9 |
| B5 | Publisherlar tayinlanishi | TT 7 |
| B6 | Dekan iyerarxiyasi | TT 7 |

## C. Ma'lumotlar va formalar
| # | Qaror | Manba |
|---|---|---|
| C1 | M02, M04, M05 forma maydonlari, birliklar, majburiy maydonlar | TT 7, 9 |
| C2 | Dalil fayli majburiyligi (forma bo'yicha) va ruxsat etilgan MIME | TT 4.15 |
| C3 | Agregatsiya va deduplikatsiya qoidalari (har metrika) | TT 4.8, 9 |
| C4 | Maxfiylik klasslari ro'yxati | TT 4.2 |
| C5 | Shaxsiy ma'lumot siyosati (talaba/xodim identifikatorlari saqlanadimi) | TT 4.9, 4.12 |

## D. Nashr va maxfiylik
| # | Qaror | Manba |
|---|---|---|
| D1 | Small-group reidentifikatsiya chegarasi (minimal guruh hajmi) | TT 4.9 |
| D2 | Qaysi ko'rsatkichlar ommaga ochiladi (ruxsatli o'lchovlar ro'yxati) | TT 4.9 |
| D3 | Texnik administrator uchun favqulodda ("break-glass") kirish tartibi bormi | TT 4.1 (nazarda tutilmagan) |

## E. Eksplutatsiya
| # | Qaror | Manba |
|---|---|---|
| E1 | Hosting resurslari, domen, TLS | TT 7 |
| E2 | SMTP/email | TT 4.7, 7 |
| E3 | Backup davri, RPO/RTO, retention muddatlari | TT 4.12, 4.15 |
| E4 | Fayl limitlari (20 MB / 50 MB — hozir faqat tavsiya) | TT 4.15 |
| E5 | HEMIS va boshqa integratsiyalar: ruxsat, mapping, API kontrakt | TT 4.11 |
| E6 | Deploy mas'uliyati va CI provayderi | CLAUDE.md §9 |

## F. Dizayn
| # | Qaror | Manba |
|---|---|---|
| F1 | Figma baseline (frame ID/URL, versiya, tasdiq sanasi) | TT 4.13 |
| F2 | Hozirgi `design-baseline/draft` — asos sifatida tasdiqlanadimi | Phase 0a | DECIDED 2026-11-21: tasdiqlanmadi, DRAFT qoladi |
| F3 | Dark mode kerakmi (hozir tokenlar bor, dizayn tasdiqlanmagan) | — |

## G. Texnik (ichki, egasi qaror qiladi)
| # | Qaror | Holat |
|---|---|---|
| G1 | Versiya yo'nalishi: "eng yangi" (Python 3.13, Django 5.2+, PostgreSQL 17, Node 24). Aniq pin Phase 1 da, o'rnatishdan oldin tekshiriladi | DECIDED 2026-11-21 (yo'nalish); aniq versiyalar OPEN |
| G2 | shadcn/ui o'rnatish vaqti | OPEN |
| G3 | CI provayderi: GitHub Actions | DECIDED 2026-11-21 |
| G4 | `design-tokens` `apps/web` ichida qoladi (alohida paket keyin, kerak bo'lsa); monorepo = `apps/web` + `apps/api` | DECIDED va bajarildi 2026-11-21 |
| G5 | `assssetssssss/` dublikati o'chirildi (hash tekshirilgan); `design-baseline/draft` = DRAFT ma'lumotnoma | DONE 2026-11-21 |
| G6 | MFA Phase 2 da qayta ko'riladi; parol siyosati va login rate-limit qiymatlari | MFA: deferred; qiymatlar OPEN |
| G7 | `CLAUDE.md` dagi "GREENFIELD" bayonini haqiqiy holatga moslash | OPEN |
