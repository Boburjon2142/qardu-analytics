# QarDU Analytics — Master Platform (Phase 1)
> **Qarshi davlat universiteti statistik-analitik platformasi (Public Main Dashboard)**

---

## 1. Loyiha haqida

**QarDU Analytics** — Qarshi davlat universitetining ta'lim, ilmiy salohiyat, professor-o'qituvchilar kontingenti va moddiy-texnik bazasi bo'yicha yagona, ochiq statistik-analitik monitoring platformasidir.

Ushbu 1-bosqichda platformaning **Public Main Dashboard** qismi to'liq professional darajada amalga oshirildi. Arxitektura kelajakda qo'shiladigan **Private Platform** (fakultet dekanlari, kafedra mudirlari va bo'lim boshliqlari kabinetlari) hamda **Django REST Framework** backend tizimini minimal refactoring bilan integratsiya qilishga to'liq moslashtirilgan (Repository / Adapter pattern).

---

## 2. Ishlatilgan texnologiyalar

- **Frontend Framework**: Next.js 15 (App Router, Server Components + Client Boundary Optimization)
- **Til**: TypeScript (Strict Mode)
- **UI & Styling**: Tailwind CSS, CSS Variables / Design Tokens, Lucide React
- **Vizualizatsiya & Diagrammalar**: Recharts
- **Server State & Data Fetching**: TanStack Query (React Query v5)
- **Table Data Architecture**: TanStack Table v8 (Keyingi bosqich jadvallari uchun tayyor)
- **Unit & Integration Testing**: Vitest, React Testing Library, JSDOM
- **E2E & Visual Regression**: Playwright Test (Chromium)

---

## 3. Dizayn tizimi (Design Tokens & Aesthetics)

Ushbu loyiha **Design Freeze** tamoyiliga qat'iy rioya qiladi (`Design Baseline v1.0`).

### Ranglar palitrasi
- **Primary Blue**: `#2563EB` (Talabalar kontingenti va asosiy aksentlar)
- **Deep Indigo**: `#4F46E5` (O'qituvchilar va bino infratuzilmasi)
- **Accent Cyan**: `#06B6D4` (Haqiqiy bandlik va doktorantura)
- **Success Green**: `#10B981` (Fakultetlar va yotoqxona bilan ta'minlanganlik)
- **Canvas / Background**: `#F7F9FC`
- **Surface / Card**: `#FFFFFF`
- **Text (Foreground)**: `#0F172A`
- **Muted Text**: `#64748B`
- **Border**: `#E2E8F0`

### Tipografiya
- Shrift: **Inter** (Latin / Cyrillic)
- Sonlar formati: `Intl.NumberFormat('uz-UZ')` (Mingliklar probel bilan ajratilgan, masalan: `24 500`)

---

## 4. Dashboard tarkibi va diagrammalar (11 ta diagramma)

### 4.1. Asosiy KPI Kartalar (3 ta)
1. **Talabalar**: Jami faol talabalar soni (`24 500`), GraduationCap icon, Blue aksent.
2. **Fakultetlar**: Faol fakultetlar soni (`12`), Building2 icon, Green aksent.
3. **O'qituvchilar**: Asosiy shtatdagi o'qituvchilar soni (`1 250`), Users icon, Indigo aksent.

### 4.2. Talabalar kontingenti — 3 ta Doughnut Chart
- **Chart 1 — Fakultetlar kesimida**: 12 ta fakultet bo'yicha alohida segmentlar, markazida jami talaba (`24 500`).
- **Chart 2 — Ta'lim darajasi kesimida**: Bakalavriat (`22 200`), Magistratura (`2 050`), Doktorantura (`250`). Jami = `24 500`.
- **Chart 3 — Yotoqxona bilan ta'minlanganlik**: Ta'minlangan (`4 120`), Ta'minlanmagan (`1 080`). Markazida ta'minlanganlik foizi (`79.2%`), nolga bo'lishdan himoyalangan xavfsiz formula.

### 4.3. Talabalar — Ustunli diagrammalar (2 ta)
- **Chart 4 — Ta'lim turi kesimida**: Kunduzgi (`15 200`), Sirtqi (`6 800`), Kechki (`1 650`), Masofaviy (`850`). Jami = `24 500`.
- **Chart 5 — Kurslar kesimida**: 1-kurs (`7 150`), 2-kurs (`6 300`), 3-kurs (`5 650`), 4-kurs (`4 900`), 5-kurs (`500`). Jami = `24 500`.

### 4.4. Infratuzilma va moddiy-texnik baza
- **Chart 6 — Universitet binolari va sig'imi**: O'quv binosi, laboratoriya, ARM va sport majmuasi bo'yicha loyiha sig'imi hamda haqiqiy bandlik.
- **Chart 7 — Yotoqxona sig'imi**: Stacked Bar Chart (5 ta TTJ bo'yicha band va bo'sh o'rinlar, jami band o'rinlar = `4 120`, talabalar turar joyi statistikasi bilan to'liq uyg'un).

### 4.5. O'qituvchilar va ilmiy salohiyat — 3 ta Doughnut Chart
- **Chart 8 — Ilmiy unvonlar**: Professor (`75`), Dotsent (`345`), Katta ilmiy xodim (`95`), Ilmiy unvonsiz (`735`). Jami = `1 250`.
- **Chart 9 — Ilmiy darajalar**: DSc (`85`), PhD (`465`), Ilmiy darajasiz (`700`). Jami = `1 250`.
- **Chart 10 — Ilmiy nashrlar**: Q1 maqolalar (`124`), Scopus (`286`), Boshqa jurnallar (`390`), Konferensiya materiallari (`215`), Boshqa nashrlar (`60`). Jami noyob nashrlar = `1 075` (qayta hisoblashlarsiz).

### 4.6. Fakultetlar bo'yicha tahlil
- **Chart 11 — O'qituvchilar soni fakultetlar kesimida**: Gorizontal ustunli diagramma, 12 ta fakultetning to'liq nomlari, kamayish / o'sish bo'yicha saralash tugmasi, DSc va PhD ma'lumotlari bilan boyitilgan tooltip.

### 4.7. Hududiy joylashuv (GIS)
- **FacultyMapPlaceholder**: Qarshi shahridagi binolar dislokatsiyasining 2-bosqichdagi interaktiv GIS integratsiyasi uchun tayyor placeholder bloki.

---

## 5. Collapsible Sidebar & Header

- **Sidebar**: Dastlab collapsed (`72px`, icon-only), hover tooltiplar, kengaytirilganda `240px`, silliq 200ms animatsiya, `localStorage`da holat saqlanishi, mobil qurilmalarda backdrop va `ESC` orqali yopiladigan drawer.
- **Navigatsiya elementlari (5 ta)**:
  1. Bosh sahifa (Faol)
  2. Talabalar (Kelajak bosqich)
  3. Fakultetlar (Kelajak bosqich)
  4. O'qituvchilar (Kelajak bosqich)
  5. Ilmiy faoliyat (Kelajak bosqich)
- **Header**: QarDU rasmiy vektori logotipi, platforma nomi, breadcrumb, hisobot davrini tanlash (`2024–2025`, `2023–2024`, `2022–2023`), oxirgi yangilanish vaqti, animatsiyali ma'lumotlarni yangilash tugmasi, til tanlash (UZ).

---

## 6. Loyiha arxitekturasi

```text
src/
├── app/
│   ├── (public)/
│   │   └── page.tsx           # Public Main Dashboard sahifasi
│   ├── layout.tsx             # Root layout (Inter font, metadata, QueryProvider)
│   └── globals.css            # Global CSS, scrollbar va base uslublar
│
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx     # Collapsible / Drawer sidebar
│   │   ├── AppHeader.tsx      # Header va filtrlash boshqaruvi
│   │   └── DashboardLayout.tsx# Umumiy responsive layout
│   ├── dashboard/
│   │   ├── StatCard.tsx       # KPI ko'rsatkichlar kartasi
│   │   ├── ChartCard.tsx      # Diagramma konteyneri (loading, empty, error holatlari)
│   │   ├── DashboardSection.tsx # Seksiyalar sarlavhasi va strukturasi
│   │   └── FacultyMapPlaceholder.tsx # 2-bosqich GIS xarita joyi
│   ├── charts/
│   │   ├── CustomTooltip.tsx  # Yagona formatlangan interaktiv tooltip
│   │   ├── DoughnutChart.tsx  # Markazida son ko'rsatuvchi halqasimon diagramma
│   │   ├── VerticalBarChart.tsx # Vertikal ustunli diagramma
│   │   ├── HorizontalBarChart.tsx # Gorizontal ustunli saralanuvchi diagramma
│   │   ├── BuildingCapacityChart.tsx # Bino sig'imi va bandligi diagrammasi
│   │   └── StackedBarChart.tsx# TTJ sig'imi bo'yicha to'plangan ustunli diagramma
│   └── providers/
│       └── QueryProvider.tsx  # TanStack React Query ta'minlovchisi
│
├── features/
│   └── dashboard/
│       ├── hooks/
│       │   └── useDashboardData.ts # TanStack Query hooki
│       ├── services/
│       │   └── dashboardRepository.ts # Repository Pattern (Django API almashishga tayyor)
│       ├── adapters/
│       │   └── dashboardAdapter.ts    # Adapter Pattern (Backend javobini transformatsiya qilish)
│       └── types/
│           └── index.ts               # Domain modellari va qat'iy TypeScript tiplari
│
├── data/
│   └── mocks/
│       ├── faculties.mock.ts
│       ├── students.mock.ts
│       ├── teachers.mock.ts
│       ├── infrastructure.mock.ts
│       ├── research.mock.ts
│       └── dashboard.mock.ts
│
├── lib/
│   ├── utils.ts               # cn (clsx + twMerge), xavfsiz foiz hisoblash
│   └── formatters.ts          # uz-UZ sonlar va foizlar formati
│
└── styles/
    └── tokens.css             # CSS Variables & Design Freeze ranglari
```

---

## 7. Ishga tushirish va test buyruqlari

### Dasturni ishlab chiqish rejimida ishga tushirish:
```bash
npm run dev
```
Brauzerda ochish: `http://localhost:3000`

### Production build tayyorlash va tekshirish:
```bash
npm run build
npm start
```

### Barcha Vitest unit va integratsion testlarni bajarish:
```bash
npm run test
```
*Natija: 4 ta test suite, 20 ta test to'liq muvaffaqiyatli o'tadi.*

### Playwright E2E va Visual Baseline testlarni bajarish:
```bash
npm run test:e2e
```
*Natija: Desktop 1440px, Tablet 768px, Mobile 390px va davr filtri testlari to'liq o'tadi.*

---

## 8. Design Baseline (Screenshotlar)

Loyiha uchun quyidagi o'lchamlarda skrinshotlar olingan va `design-baseline/draft/` papkasida saqlangan:
1. `design-baseline/draft/desktop-1440.png` (Desktop 1440px)
2. `design-baseline/draft/tablet-768.png` (Tablet 768px)
3. `design-baseline/draft/mobile-390.png` (Mobile 390px)

Foydalanuvchi tasdiqlaganidan so'ng ushbu skrinshotlar `design-baseline/approved/v1.0/` katalogiga o'tkaziladi.
