# 🎓 Coaching Management & Learning Web Platform

A modern, production-ready full-stack Coaching Web App built for course selling, YouTube Unlisted Live classes, handwritten PDF notes, 24/7 Google Gemini AI Doubt Solving, Telegram Bot community integration, and **Direct UPI QR Payment with 1-Click Admin Approvals (0% Gateway Commission)**.

Designed to be hosted **100% Free** on **Vercel** + **Supabase** + **Cloudflare**.

---

## 🚀 Key Features

### 1. 📱 Direct UPI QR Payment & Membership Access Control
- **0% Gateway Commission:** Students scan an interactive UPI QR code (PhonePe, GPay, Paytm, BHIM) that pays directly into the coaching institute's bank account.
- **UTR Submission:** Student enters their 12-digit UPI reference number.
- **Paywall Protection:** Courses, YouTube Live streams, and PDF notes are completely locked until membership is verified.
- **1-Click Admin Approval:** Admin verifies the UTR in the Admin Panel and clicks "Approve", which instantly unlocks access for the student.

### 2. 🔴 YouTube Live Streaming with Anti-Piracy Watermark
- **Zero Cost & Unlimited Bandwidth:** Embeds YouTube Unlisted Live streams without paying heavy streaming server fees.
- **Dynamic Moving Watermark:** A floating watermark displaying the student's **Name, Mobile Number, and Timestamp** moves across the screen every few seconds to prevent screen recording and sharing.
- **Auto-Recording VOD:** Recorded lectures remain accessible for revision.

### 3. 📄 Chapter-wise PDF Notes & Formula Sheets
- In-app PDF reader with student phone watermarking.
- Chapter-wise downloads.
- Storage ready for **Cloudflare R2** (10GB free, 0 egress fees) or **Supabase Storage**.

### 4. 🤖 24/7 AI Doubt Solver (Google Gemini 1.5 Flash)
- Integrated AI Tutor trained to answer student doubts in conversational Hinglish.
- Step-by-step derivations, key formulas, and exam tips.
- Ready for free Google AI Studio API key (1,500 requests/day free).

### 5. ✈️ Telegram & WhatsApp Bot Integration
- **Private Telegram Community:** Auto-links paid members to the private Telegram group.
- **Class Reminders:** Automated alert messages sent before live sessions.
- **WhatsApp Helpdesk:** 1-Click WhatsApp support chat.

---

## 🛠️ Project Structure

```
coaching-platform/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Student Home & Course Catalog
│   │   ├── admin/page.tsx         # Admin Dashboard (1-Click UPI Approvals, Course/Live manager)
│   │   ├── course/[id]/page.tsx   # Protected Classroom & Live Player with Paywall
│   │   ├── api/
│   │   │   ├── ai/doubt/route.ts  # Gemini AI Doubt Solver endpoint
│   │   │   └── telegram/notify/   # Telegram Bot notifications
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Navbar.tsx             # Navigation with Student/Admin role switcher
│   │   ├── UpiPaymentModal.tsx    # Dynamic UPI QR generator & UTR form
│   │   ├── VideoPlayerWithWatermark.tsx # Anti-leak YouTube Player
│   │   ├── PdfViewerModal.tsx     # PDF viewer with watermark
│   │   ├── AiDoubtSolver.tsx      # Gemini Chatbot UI
│   │   └── TelegramWhatsAppCard.tsx # Community cards
│   ├── lib/
│   │   └── storage.ts             # Data layer with pre-seeded demo data
│   └── types/
│       └── index.ts               # TypeScript data models
├── supabase-schema.sql            # Ready-to-use Supabase PostgreSQL schema
├── .env.example                   # Environment variable template
└── README.md
```

---

## 💻 How to Run Locally

1. Open a terminal in the project directory:
   ```bash
   cd /home/cybermate/Desktop/coaching-platform
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open **`http://localhost:3000`** in your browser.

---

## 🌐 100% Free Hosting Deployment Guide

### Step 1: Deploy Web App on Vercel (Free)
1. Push this codebase to your [GitHub](https://github.com) account:
   ```bash
   git add .
   git commit -m "feat: coaching platform"
   git push origin main
   ```
2. Sign up on [Vercel](https://vercel.com) (Free Hobby Plan).
3. Click **"Add New Project"** and select your GitHub repository.
4. Click **"Deploy"**. Your coaching website will be live with a free `.vercel.app` domain and free HTTPS/SSL!

### Step 2: Database Setup on Supabase (Free 500MB PostgreSQL)
1. Go to [Supabase](https://supabase.com) and create a free project.
2. In Supabase Dashboard, go to **SQL Editor**.
3. Copy all contents of [`supabase-schema.sql`](file:///home/cybermate/Desktop/coaching-platform/supabase-schema.sql) and click **Run**.
4. In Project Settings -> API, copy your `URL` and `anon key` to your `.env.local` or Vercel Environment Variables.

### Step 3: Enable Free Google Gemini AI
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **"Get API key"** (100% Free tier).
3. Add `GEMINI_API_KEY=your_key` in your Vercel Environment Variables.

### Step 4: Setup Telegram Bot (100% Free)
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot`, enter your coaching name and username (e.g. `LakshyaEduBot`).
3. Copy the Bot Token into your Admin Settings or `TELEGRAM_BOT_TOKEN`.
