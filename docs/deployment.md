# IDEAL COACHING CENTRE — PRODUCTION DEPLOYMENT & OPERATIONS GUIDE

## 1. Zero-Cost Infrastructure Topology ($0 / Month)

```
Frontend Clients:
  - Android Student App: Built locally via Gradle (APK & AAB), distributed directly or via Play Store
  - Admin Web, Teacher Web, Public Website: Deployed on Cloudflare Pages (Free Tier)

Backend & Database:
  - Supabase Free Tier (PostgreSQL with RLS, Auth Email OTP, Storage & Edge Functions)
  - YouTube (Free Unlisted Video Hosting & Live Streams)
  - Manual UPI Rail (₹0 gateway transaction surcharge)
```

---

## 2. Supabase Backend Setup

### Step 1: Create Supabase Free Project
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Select region: **South Asia (Mumbai) [ap-south-1]** for minimal latency in Bihar and Jharkhand.
3. Save project URL, `anon` public key, and `service_role` secret.

### Step 2: Apply SQL Migrations
In the Supabase SQL Editor, run the migration files in strict sequential order:
1. `supabase/migrations/01_initial_schema.sql` (Creates all normalized tables, indices, and extensions)
2. `supabase/migrations/02_security_and_rls.sql` (Enables Row Level Security on all tables and creates policies)
3. `supabase/migrations/03_functions_and_triggers.sql` (Deploys identifier lookup, payment approval, and exam grading RPCs)
4. `supabase/seed/01_seed_data.sql` (Populates BSEB and JAC academic structure, subjects, sample courses, and platform settings)

### Step 3: Create Storage Buckets
In the Supabase Storage Dashboard, create the following buckets:
- `study-materials`: **Private Bucket** (Restricted to authenticated signed URLs)
- `payment-receipts`: **Private Bucket** (Restricted to student uploader & admin)
- `course-thumbnails`: **Public Bucket**

### Step 4: Configure Email OTP in Supabase Auth
1. Go to **Authentication -> Email Templates**.
2. Select **Confirm Signup / Magic Link / OTP**.
3. Customize the bilingual email template:
   ```html
   <h2>आइडियल कोचिंग सेंटर (IDEAL COACHING CENTRE)</h2>
   <p>आपका 6 अंकों का लॉगिन ओटीपी (Login OTP) है:</p>
   <h1 style="color: #2563EB; letter-spacing: 4px;">{{ .Token }}</h1>
   <p>यह ओटीपी अगले 10 मिनट के लिए मान्य है। किसी के साथ साझा न करें।</p>
   ```
4. Verify that SMS providers are disabled.

---

## 3. Web Deployment (Cloudflare Pages Free Tier)

Cloudflare Pages provides unlimited free bandwidth and 500 free builds per month, permitting commercial coaching institutions under standard free terms.

### Build Configuration for Admin Web
- **Root Directory**: `apps/admin-web`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Environment Variables**:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

### Build Configuration for Public Website
- **Root Directory**: `apps/public-website`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

---

## 4. Local Android APK & AAB Compilation (No Paid EAS)

In strict adherence to the Zero-Paid-Service policy, Android release binaries are compiled locally on the developer machine using Android SDK and Gradle, without requiring paid cloud build credits.

### Prerequisites on Build Machine
- OpenJDK 17
- Android SDK (Platform 34, Build Tools 34.0.0)
- Android NDK (26.x)

### Generate Release Keystore
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore ideal-coaching.keystore \
  -alias idealcoaching -keyalg RSA -keysize 2048 -validity 10000
```

### Build Universal Release APK
```bash
cd apps/student-app
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```
The compiled, standalone APK will be generated at:
`apps/student-app/android/app/build/outputs/apk/release/app-release.apk`

### Build Production Android App Bundle (AAB for Play Store)
```bash
cd apps/student-app/android
./gradlew bundleRelease
```
The AAB file will be generated at:
`apps/student-app/android/app/build/outputs/bundle/release/app-release.aab`

---

## 5. Backup & Recovery Procedure

### Automated Logical Database Dump
Using standard PostgreSQL `pg_dump`:
```bash
pg_dump "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  --schema=public \
  -F c -b -v -f "icc_backup_$(date +%Y%m%d).dump"
```

### Restore Database
```bash
pg_restore -d "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -v "icc_backup_20261112.dump"
```
