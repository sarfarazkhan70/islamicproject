# Islamic Prayer (الصلاة الإسلامية)

A modern, clean, accurate, and privacy-first Islamic daily companion web application.

---

## Repository Structure

This project is organized as a clean full-stack monorepo:

```
IslamicPrayer/
├── frontend/             # React 19 + TypeScript + Vite Client Application
│   ├── public/           # Static icons, manifest.json, sw.js
│   ├── src/
│   │   ├── components/   # Common & Domain-specific Reusable UI components
│   │   ├── data/         # Isolated development mock data (Placeholders)
│   │   ├── pages/        # 14 Dedicated Page Module Shells
│   │   ├── routes/       # React Router v7 Declarations
│   │   ├── stores/       # Zustand State Stores (Theme, Settings, Tracker UI)
│   │   ├── styles/       # Pure Vanilla CSS Design System Tokens (Dark/Light)
│   │   ├── types/        # TypeScript Shared Type Definitions
│   │   ├── App.tsx       # Root App Component
│   │   └── main.tsx      # DOM Entry Point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/              # Node.js + Express + TypeScript + MongoDB Server
│   ├── src/
│   │   ├── config/       # Server & Database Configuration
│   │   ├── controllers/  # API Request Handlers (Phase 2)
│   │   ├── middleware/   # Security, Auth & Error Handling (Phase 2)
│   │   ├── models/       # Mongoose Schemas (Phase 2)
│   │   ├── routes/       # Express REST Endpoints (Phase 2)
│   │   ├── services/     # Business & Prayer Calculation Services (Phase 2 & 3)
│   │   ├── types/        # TypeScript Type Definitions
│   │   ├── utils/        # Logger & Standard Response Helpers
│   │   ├── validators/   # Zod Validation Schemas
│   │   └── server.ts     # Express Server Entry Point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/                 # Architectural Documentation & Roadmap Specifications
│   └── implementation_plan.md
│
└── README.md             # Project Root Overview & Guide
```

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, React Router v7, Zustand, Pure Vanilla CSS Custom Properties Design System (Night Emerald & Desert Dawn themes), Lucide React.
- **Backend**: Node.js, Express, TypeScript, MongoDB / Mongoose, Zod, Helmet, CORS.
- **Documentation**: Markdown architecture specs in `docs/`.

---

## Current Development Phase: Phase 1

- **Current Status**: **Phase 1 (Frontend Foundation & Design System)**.
- **Scope**: Complete 14-page UI shells, responsive desktop sidebar & mobile navigation, design token system, and accessible component library.
- **Note**: Real backend business logic, MongoDB queries, astronomical calculations, and Web Push notifications belong to subsequent roadmap phases and are **not yet implemented**.

---

## Running the Project Locally

### 1. Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server (port 3000)
npm run dev

# Build for production
npm run build
```

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the backend development server (port 5000)
npm run dev

# Build for production
npm run build
```

---

## Planned Application Pages

1. **Dashboard** (`/`) — Summary countdown, today's prayer tracker strip, companion quick-dock.
2. **Prayer Times** (`/prayer-times`) — Full 12-prayer timetable (Fajr..Tahajjud), Sunni Madhhab selector (Hanafi, Shafi'i, Maliki, Hanbali).
3. **Namaz Tracker** (`/tracker`) — Daily obligatory & voluntary prayer logger with Ada/Missed/Undo toggles.
4. **Qaza Namaz** (`/qaza`) — Lifetime missed prayer manager, counters, and daily pace target calculator.
5. **Prayer History** (`/history`) — 30-day consistency heatmap and streak statistics.
6. **Notifications** (`/notifications`) — Adhan alert offsets, daily 11 PM Al-Mulk reminder, Friday Jumu'ah reminder.
7. **Surah Al-Mulk** (`/surah-al-mulk`) — Distraction-free night audio player UI, reciters, sleep timer.
8. **Quran** (`/quran`) — 114 Surahs directory, search, Tanzil Uthmani reading placeholder.
9. **Azkar & Duas** (`/azkar`) — Categorized authentic supplications with Sahih references & digital Tasbeeh.
10. **Qibla Finder** (`/qibla`) — Great-circle 242° compass ring & sensor calibration guide.
11. **Islamic Calendar** (`/calendar`) — Monthly Hijri-Gregorian grid with moon-sighting adjustment.
12. **Ramadan** (`/ramadan`) — Sehri & Iftar countdown cards, fasting tracker, 30-day Khatam planner.
13. **Jumu'ah** (`/jumuah`) — Friday timetable, Surah Al-Kahf checklist, Sunnah acts checklist.
14. **Settings** (`/settings`) — Location, Sunni Madhhab, calculation convention, 12h/24h format, theme switcher.
