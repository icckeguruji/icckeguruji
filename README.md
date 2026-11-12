# IDEAL COACHING CENTRE
### Production Digital Coaching Platform for Bihar Board (BSEB) & Jharkhand Board (JAC)

[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web-blue)](#)
[![Boards](https://img.shields.io/badge/Boards-BSEB%20%7C%20JAC-amber)](#)
[![Language](https://img.shields.io/badge/Languages-Hindi%20(Default)%20%7C%20English-emerald)](#)
[![Cost](https://img.shields.io/badge/Operating%20Cost-%E2%82%B90%2Fmonth%20(Free%20Plan)-green)](#)

---

## 1. System Vision & Purpose
**IDEAL COACHING CENTRE** is a dedicated, single-institution digital coaching and learning management platform designed specifically for students in India preparing for **Bihar School Examination Board (BSEB)** and **Jharkhand Academic Council (JAC)** matriculation and intermediate examinations.

Operating under a **Strict Zero-Paid-Service Policy**, the platform delivers an enterprise-grade EdTech experience at an infrastructure cost of **₹0/month** by leveraging genuine, legally compliant free tiers of Supabase, Cloudflare Pages, YouTube unlisted/live embedding, and local Gradle compilation.

---

## 2. Platform Architecture & Deliverables

```
ideal-coaching-centre/
├── apps/
│   ├── student-app/         # Android Native App (React Native, Expo Router, SQLite)
│   ├── admin-web/           # Admin Web Portal (Next.js 14, Tailwind, shadcn/ui)
│   ├── teacher-web/         # Faculty Portal (Next.js 14, Assignment & Doubts)
│   └── public-website/      # Public Coaching Website & Direct APK Download
├── packages/
│   ├── shared-types/        # Unified TypeScript data models & contracts
│   ├── shared-validation/   # Zod validation schemas
│   ├── shared-utils/        # Bilingual dictionary, INR formatting, date helpers
│   └── design-tokens/       # Color palette, Devanagari typography, spacing
├── supabase/
│   ├── migrations/          # PostgreSQL schema, RLS policies, RPC triggers
│   ├── functions/           # Edge functions (auth-lookup, exam evaluation, signed URLs)
│   └── seed/                # Rich seed data for BSEB & JAC Classes 9-12
└── docs/                    # Complete architectural & operational guides
```

---

## 3. Key Core Capabilities

### A. Authentication & Zero-SMS Mandate
- **Single Identifier Input**: Students can log in using either **Mobile Number**, **Username**, or **Email Address**.
- **Email-Only OTP Delivery**: Regardless of the input identifier, OTP is sent **ONLY** to the student's registered email address. No SMS gateways or paid mobile OTP providers are used.
- **Account Enumeration Protection**: Identifier resolution uses a secure backend procedure that returns generic responses for unknown accounts and masked emails (`r****r@example.com`) for valid accounts.

### B. Automatic PDF Assignment & Security
- When an administrator uploads a PDF mapped to a Board, Class, Subject, and Chapter, the PostgreSQL Row Level Security (RLS) engine automatically grants access to all students enrolled in matching courses.
- Files reside in private Supabase Storage buckets and are delivered via 15-minute time-limited signed URLs.

### C. Manual UPI Payment Rail & Audit Trail
- Students view the institution's UPI VPA (`idealcoaching@upi`) and QR code, make payments via external UPI apps (Google Pay, PhonePe, Paytm), and submit their 12-digit UTR reference.
- Administrators audit bank records and verify payments with a single click, which activates course enrollment and logs the action into an immutable audit table.

### D. Zero-Cost Live & Recorded Video Streaming
- Live lectures are broadcast via YouTube Live, providing unlimited bandwidth with zero server hosting costs.
- Recorded lectures are organized into chapter-wise playlists storing only YouTube video IDs.

### E. Server-Side Online Examinations
- Timed MCQ tests with bilingual question toggles (Hindi/English), live timer countdown, question palettes, and negative marking.
- Answers are evaluated exclusively on the server to prevent client-side mark tampering.

---

## 4. Quick Start Guide

### Prerequisites
- Node.js v18+ or v22+
- npm v10+

### Monorepo Installation
```bash
# Clone the repository
git clone https://github.com/ideal-coaching-centre/platform.git
cd platform

# Install dependencies across all workspaces
npm install
```

### Running Applications in Development Mode

```bash
# Start Admin Web Portal (Port 3001)
npm run dev:admin

# Start Teacher Web Portal (Port 3002)
npm run dev:teacher

# Start Public Coaching Website (Port 3000)
npm run dev:public

# Start Android Student App (Expo Dev Server)
npm run dev:student
```

---

## 5. Local Android APK Compilation (Zero Paid EAS)

```bash
cd apps/student-app

# Generate native Android directory
npx expo prebuild --platform android

# Compile standalone universal release APK
cd android
./gradlew assembleRelease

# The APK will be generated at:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 6. Detailed Documentation Index

- [docs/architecture.md](docs/architecture.md) — High-level system architecture, topology, and ER diagrams.
- [docs/database-schema.md](docs/database-schema.md) — Complete database schema, normalization, and constraints.
- [docs/security.md](docs/security.md) — Security policies, RLS matrix, and threat mitigations.
- [docs/authentication.md](docs/authentication.md) — Identifier resolution and Email OTP login specification.
- [docs/testing.md](docs/testing.md) — QA verification matrix and automated testing procedures.
- [docs/deployment.md](docs/deployment.md) — Supabase, Cloudflare Pages, and local Android build instructions.
- [docs/progress.md](docs/progress.md) — Phase-by-phase development progress tracking.
