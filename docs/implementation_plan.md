# Islamic Prayer — Technical Implementation Plan & Roadmap

This document serves as the design specification and technical documentation for the **Islamic Prayer** web application.

---

## Monorepo Architecture Overview

```
IslamicPrayer/
├── frontend/             # React 19 + TypeScript + Vite Client Application
│   ├── public/           # Static icons, manifest.json, sw.js (Web Push & Caching)
│   ├── src/
│   │   ├── components/   # Common & Domain-specific Reusable UI components
│   │   ├── core/
│   │   │   └── prayerEngine/ # Pure TypeScript Astronomical Prayer Calculation Engine
│   │   ├── data/         # Verified 114 Surahs catalog, 30 Juz index, and authentic Azkar datasets
│   │   ├── hooks/        # Reactive hooks (usePrayerTimes)
│   │   ├── pages/        # 14 Dedicated Page Module Shells
│   │   ├── routes/       # React Router v7 Declarations
│   │   ├── stores/       # Zustand State (Theme, Settings, Tracker, Notifications, Quran, Azkar, Qibla, Calendar, Ramadan)
│   │   ├── styles/       # Pure Vanilla CSS Design System Tokens (Dark/Light)
│   │   ├── types/        # TypeScript Shared Type Definitions
│   │   ├── utils/        # Geolocation, Timezone, Qibla, Hijri Calendar, and Date utilities
│   │   ├── App.tsx       # Root App Component
│   │   └── main.tsx      # DOM Entry Point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/              # Node.js + Express + TypeScript + MongoDB Server
│   ├── src/
│   │   ├── config/       # Database Connection, Zod-validated Environment (VAPID)
│   │   ├── controllers/  # API Controllers (Auth, User, Tracker, Qaza, History, Notification, Quran, Azkar, Qibla, Calendar, Ramadan)
│   │   ├── data/         # Verified 114 Surahs catalog, 30 Juz index, and authentic Azkar datasets
│   │   ├── middleware/   # JWT Auth, Rate Limiter, Validation, Error Handling
│   │   ├── models/       # Mongoose Schemas (User, UserPreferences, RefreshToken, PrayerRecord, QazaSummary, QazaLog, PushSubscription, NotificationJob, NotificationLog, Bookmark, ReadingProgress, AzkarFavorite, FastingRecord, RamadanProgress)
│   │   ├── routes/       # Express REST API v1 Routes (/auth, /user, /tracker, /qaza, /history, /notifications, /quran, /azkar, /qibla, /calendar, /ramadan)
│   │   ├── services/     # Business logic, WebPush, Scheduler, Quran, Azkar, Qibla, Calendar, and Ramadan services
│   │   ├── types/        # TypeScript Interfaces & ApiResponse<T>
│   │   ├── utils/        # JWT, bcryptjs, API envelopes, Timezone (DST-aware), Qibla, Hijri Calendar
│   │   ├── validators/   # Zod Request Validation Schemas
│   │   ├── app.ts        # Express Application Factory
│   │   └── server.ts     # Express Server Bootstrap, Scheduler Loop & Graceful Shutdown
│   ├── tests/            # Automated Integration Tests (MongoMemoryServer + Vitest)
│   │   ├── health.test.ts
│   │   ├── auth.test.ts
│   │   ├── security.test.ts
│   │   ├── prayerEngine.test.ts
│   │   ├── tracker.test.ts
│   │   ├── notifications.test.ts
│   │   ├── quran.test.ts
│   │   └── phase7.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── .env.example
│
├── docs/                 # Architectural & Project Documentation
│   └── implementation_plan.md
│
└── README.md             # Project Root Guide & Quickstart
```

---

## Phased Roadmap Progress

- **Phase 0**: Product Requirements, Architecture & Technical Planning *(Completed)*
- **Phase 1**: Frontend Foundation & Design System *(Completed & QA Passed)*
- **Phase 2**: Backend Foundation + Database + Authentication *(Completed & QA Passed)*
- **Phase 3**: Prayer Time Engine + Location + 4 Madhhab *(Completed & Verified)*
- **Phase 4**: Namaz Tracker + Qaza + History & Analytics *(Completed & Verified)*
- **Phase 5**: Notifications + Web Push + Scheduling *(Completed & Verified)*
- **Phase 6**: Quran + Surah Al-Mulk Audio + Azkar & Duas *(Completed & Verified)*
- **Phase 7**: Qibla + Islamic Calendar + Ramadan Companion *(Completed & Verified)*
- **Phase 8**: Dashboard Integration & UX Polish *(Pending)*
- **Phase 9**: Complete Testing, Accuracy Verification & Security Audit *(Pending)*
- **Phase 10**: Production Deployment & Monitoring *(Pending)*

---

## Phase 7 Architecture: Qibla, Islamic Calendar & Ramadan Companion

### 1. Qibla Finder Engine (`/qibla`)
- **Great-Circle Trigonometry**:
  - Kaaba Coordinates: $\phi_K = 21.42250^\circ \text{ N}, \lambda_K = 39.82620^\circ \text{ E}$.
  - Forward Azimuth Formula:
    $$\theta = \text{atan2}\left(\sin(\lambda_K - \lambda_U)\cos(\phi_K), \; \cos(\phi_U)\sin(\phi_K) - \sin(\phi_U)\cos(\phi_K)\cos(\lambda_K - \lambda_U)\right)$$
    $$\text{Bearing} = (\theta \times 180 / \pi + 360) \pmod{360}$$
  - Distance: Haversine formula yielding distance in kilometers and miles.
- **Sensor Architecture**:
  - `DeviceOrientationEvent` listener with iOS 13+ permission gesture handling (`DeviceOrientationEvent.requestPermission()`).
  - WebKit compass heading (`e.webkitCompassHeading`) with Android alpha fallback.
  - Real-time visual alignment badge (`🕋 Aligned with Kaaba!`) activated within $\pm 3^\circ$ tolerance.
  - Sensor listeners cleaned up automatically on component unmount.
- **Calibration & Accessibility**:
  - Integrated figure-eight calibration instructions.
  - Textual bearing and cardinal direction for screen reader accessibility.

### 2. Islamic Hijri Calendar Engine (`/calendar`)
- **Umm al-Qura Baseline**:
  - Julian Day Number (JDN) tabular algorithm mapping Gregorian dates to 12 lunar months.
  - Moon-sighting adjustment parameter: $-2, -1, 0, +1, +2$ days with instant calendar recalculation.
- **Monthly Grid & Navigation**:
  - Synchronized monthly calendar grid with Gregorian and Hijri day numbers, sacred month indicators, and current date highlight.
  - Month and year navigation controls.
- **Major Islamic Events Catalog**:
  - 1 Muharram (Islamic New Year), 10 Muharram (Ashura), 12 Rabi I (Mawlid), 27 Rajab (Isra & Mi'raj), 15 Sha'ban (Mid-Sha'ban), 1 Ramadan (First day of fasting), 27 Ramadan (Laylat al-Qadr), 1 Shawwal (Eid al-Fitr), 9 Dhul Hijjah (Day of Arafah), 10 Dhul Hijjah (Eid al-Adha).
- **Date Converter**:
  - Interactive bidirectional Gregorian $\leftrightarrow$ Hijri date converter.

### 3. Ramadan Companion Engine (`/ramadan`)
- **Dynamic Ramadan Detection**: Automatically detects active Ramadan based on current Hijri month (Month 9).
- **Sehri & Iftar Timetable**:
  - Sehri cutoff precisely labeled as *Sehri Ends / Fajr*.
  - Iftar precisely labeled as *Iftar Time / Maghrib*.
  - Consumes existing Phase 3 astronomical prayer engine without duplication.
- **Live Per-Second Countdown**: Real-time timer updating every second to Sehri or Iftar.
- **Fasting Tracker**:
  - Daily fasting status: `FASTED`, `MISSED`, `EXCUSED`, `QAZA`.
  - Stored in MongoDB `FastingRecord` collection with compound unique index `{ userId: 1, localDate: 1 }`.
  - Local-first caching in `localStorage` for guest users.
- **30-Day Quran Khatam Planner**:
  - 30-Juz checklist tracking daily completion progress, stored in `RamadanProgress` collection.
- **Authentic Ramadan Duas**:
  - Authentic Iftar supplication (*Sunan Abi Dawud #2357*).
  - Authentic Laylat al-Qadr supplication (*Jami` at-Tirmidhi #3513*).

### 4. Database Models & Privacy
- **`FastingRecord`**: `{ userId, localDate, hijriYear, ramadanDay, status, notes }` with `{ userId: 1, localDate: 1 }` unique index.
- **`RamadanProgress`**: `{ userId, hijriYear, completedJuz, targetKhatamDate, notes }` with `{ userId: 1, hijriYear: 1 }` unique index.
- **Privacy & Security**: Location coordinates are processed for prayer/Qibla calculations without storing intrusive location history. All personal fasting and Khatam data are strictly protected by user ID isolation.
