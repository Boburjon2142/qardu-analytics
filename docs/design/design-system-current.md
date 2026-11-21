# Joriy dizayn tizimi (hujjatlashtirish; tasdiqlanmagan)

> **Maqom: DRAFT.** Quyida mavjud kodda *topilgan* qiymatlar yozilgan. Hech biri tasdiqlanmagan va **Design Freeze e'lon qilinmagan**. Bu hujjat vizual baselineni tasdiqlamaydi va o'zgartirmaydi.

## 1. Manbalar
`src/styles/tokens.css`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`.

## 2. Tokenlar (verified)
**Brend:** primary blue `#2563EB`, deep indigo `#4F46E5`, accent cyan `#06B6D4`, success green `#10B981`.
**Neytral:** canvas `#F7F9FC`, surface `#FFFFFF`, text `#0F172A`, muted `#64748B`, border `#E2E8F0`.
**Diagramma:** `--chart-color-1..14` (`#2563EB, #4F46E5, #06B6D4, #10B981, #F59E0B, #EC4899, #8B5CF6, #14B8A6, #F97316, #6366F1, #3B82F6, #0EA5E9, #84CC16, #E11D48`).
**Tizim (HSL, shadcn uslubi):** `--background, --foreground, --card, --popover, --primary, --secondary, --muted, --accent, --destructive, --border, --input, --ring`; `--radius: 0.75rem`.
**O'lchamlar:** sidebar 72px / 250px, header 70px.
**Shrift:** Inter (latin + cyrillic), `--font-inter`.
**Soyalar:** `subtle`, `card`, `cardHover` (`tailwind.config.ts`).
**Dark mode:** `.dark` tokenlari mavjud; dizayni tasdiqlanmagan.
**Container:** padding 1.5rem, `2xl` = 1600px.

## 3. Ma'lum nomuvofiqliklar (verified)
1. Ranglar uch joyda: `tokens.css`, `tailwind.config.ts` (hex), va komponentlarda hardcode hex (`page.tsx`, `src/components/charts/*.tsx`, `FacultyMapPlaceholder.tsx`). Yagona manba yo'q.
2. `tailwind.config.ts` da `indigo`, `cyan`, `slate` standart paletalari qayta aniqlangan — shadcn/Tailwind yangilanishida to'qnashishi mumkin.
3. Brend ranglar ikki formatda (hex va HSL), qo'lda sinxronlanadi.
4. `success` rang `tokens.css` da `--color-success-green`, tailwind'da `success`; nomlar mos emas.
5. shadcn/ui o'rnatilmagan, lekin shadcn uslubidagi o'zgaruvchilar bor.
6. Sidebar havolalari (`#`) — interaktiv holatlar to'liq emas.
7. WCAG 2.2 AA kontrast va fokus holatlari tekshirilmagan.
8. Public dashboard mock ma'lumot ekanligi UIda belgilanmagan (tekshirish kerak).

## 4. Vizual baselinelar — DRAFT
| Fayl | Viewport | Maqom |
|---|---|---|
| `design-baseline/draft/desktop-1440.png` | 1440 | **DRAFT** (faqat ma'lumotnoma) |
| `design-baseline/draft/tablet-768.png` | 768 | **DRAFT** |
| `design-baseline/draft/mobile-390.png` | 390 | **DRAFT** |
| 320 va 1920 | — | **Mavjud emas** |

- `design-baseline/approved/v1.0` mavjud emas. Figma frame ID/URL, versiya, tasdiq sanasi yo'q.
- `e2e/visual-regression.spec.ts` piksel taqqoslamaydi (faqat hajm > 0 tekshiradi); u regressiya isboti hisoblanmaydi.
- Draft PNGlar tasdiqlanmagan va o'zgartirilmagan.

## 5. Tasdiqlash yo'li (Proposed)
1. Egasi Figma yoki draft'ni asos qilishni qaror qiladi (open-decisions F1/F2).
2. Tokenlar yagona manbaga birlashtiriladi (CR bilan, vizual o'zgarishsiz).
3. 5 viewport uchun baseline yaratilib, tasdiq sanasi yoziladi.
4. Faqat shundan keyin Design Freeze (TT 4.13) e'lon qilinadi; haqiqiy `toHaveScreenshot` testi yoqiladi.
