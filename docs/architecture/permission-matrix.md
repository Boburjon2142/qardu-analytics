# Ruxsatlar matritsasi

> **Maqom:** rollar va asosiy vakolatlar — **Specified** (TT 4.2). Aniq approval/scope matritsalari va rol nomlari bilan haqiqiy shaxslar — **Unresolved**. Quyidagi jadval *talab qilinadigan xatti-harakat* ni belgilaydi, kim qaysi shaxs ekanini emas.

## 1. Ruxsat modeli (Approved arxitektura, Proposed tafsilot)
`ruxsat = RBAC(role, valid_from..valid_to) ∧ org scope ∧ object permission ∧ confidentiality class`. Tekshiruv backendda har `list/detail/create/update/export/download` va fayl olishda. Ruxsat berilmasa: boshqa unit obyekti uchun `404` (mavjudligini oshkor qilmaslik) yoki `403` (AC-01: "403/404").

## 2. Rol × resurs (Specified; ✔ = ruxsat, ○ = faqat scope ichida, ✖ = yo'q)
| Resurs / amal | Kafedra mudiri | Bo'lim/markaz rahbari | Dekan | Prorektor | Rektor | Tasdiqlovchi | Publisher | Tex. admin | Public |
|---|---|---|---|---|---|---|---|---|---|
| Natija kiritish (draft/submit) | ○ o'z kafedrasi | ○ o'z bo'limi | ○ o'z fakulteti nomidan | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Natijani ko'rish | ○ o'z | ○ o'z | ○ fakultet + kafedralar | ○ biriktirilgan unitlar | ✔ barchasi | ○ biriktirilgan | faqat taklif etilgan statistika | ✖ avtomatik | ✖ |
| Natijani tasdiqlash/qaytarish | ✖ | ✖ | ✖ | ✖ | ✖ | ○ biriktirilgan, o'zinikini emas | ✖ | ✖ | ✖ |
| Maxfiy izoh / revision request yaratish | ✖ | ✖ | ✖ | ○ scope ichida | ✔ | ✖ | ✖ | ✖ | ✖ |
| Maxfiy izohni o'qish | ○ recipient bo'lsa | ○ recipient bo'lsa | ○ recipient bo'lsa | ○ muallif bo'lsa | ○ muallif bo'lsa (boshqalarniki emas) | ✖ | ✖ | ✖ | ✖ |
| Izohga javob yozish | ✖ (funksiya yo'q) | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Ochiq nashrga taklif qilish | ○ o'z approved natijasi | ○ | ○ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Snapshot yaratish/e'lon/rollback | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ | ✖ | ✖ |
| CUSTOM forma yaratish/e'lon/biriktirish | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ | ✖ |
| Foydalanuvchi/rol/scope boshqaruvi | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ | ✖ |
| Tuzilma o'zgarishi taklifi | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ taklif | ✖ |
| Tuzilma o'zgarishini tasdiqlash | rasmiy vakolatli rahbar (**shaxs Unresolved**) | | | | | | | ✖ (o'zi tasdiqlamaydi — **Proposed**) | |
| PUBLIC snapshotlarni ko'rish | | | | | | | | | ✔ |

Eslatma: "Tex. admin — o'zi tasdiqlamaydi" TT matnidan to'g'ridan-to'g'ri chiqmaydi (TT: rahbar tasdiqlaydi); bu **Proposed** aniqlashtirish.

## 3. Ruxsat inkor qilinishi shart bo'lgan holatlar (negative testlar, AC-01/04/05/06/08)
1. Boshqa unit natijasiga list/detail/export/fayl so'rovi.
2. Submitter o'z revision'ini tasdiqlashi.
3. `approved` revision'ga UPDATE/DELETE (API va to'g'ridan-to'g'ri DB).
4. Rektor boshqa muallifning maxfiy izohini o'qishi.
5. Tex. admin natija kontenti/izohini ochishi.
6. Muddati o'tgan (`valid_to`) roldan foydalanish.
7. PUBLIC API orqali tavsif, dalil, izoh, shaxs identifikatorini olish.
8. Eskirgan (`superseded`) forma versiyasi orqali yangi natija yuborish.

## 4. Unresolved
- Rol-unit aniq xaritasi, prorektor scope'lari, approval matrix, publisherlar, tex. admin "break-glass" tartibi, maxfiylik klasslari ro'yxati (masalan: public-eligible / internal / confidential — nomlar **Proposed**, qiymatlar kelishiladi).
