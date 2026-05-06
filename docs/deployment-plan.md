# Spectrum Circle — Deployment Plan

## Stack Overview

| Layer | Platform | Free Tier | Scales to |
|---|---|---|---|
| Web | Vercel | Unlimited hobby deploys | Enterprise, auto-scale |
| iOS + Android | EAS Build (Expo) | 30 builds/month | Pay-per-build |
| Backend/DB | Supabase | 500MB DB, 2GB storage | Pro $25/mo |
| Repo | GitHub (public) | Free | GitHub Actions CI/CD |

---

## Pre-requisites (do once before any deployment)

- [ ] Apply Supabase migrations via SQL editor at https://supabase.com/dashboard/project/evqaxvetcfkahxaxlftn/sql/new
  1. Run `supabase/migrations/001_initial_schema.sql`
  2. Run `supabase/migrations/002_rls_policies.sql`
- [ ] Enable Google OAuth: Supabase Dashboard → Authentication → Providers → Google
  - Add Google Client ID + Secret from Google Cloud Console
  - Authorized redirect URI for Google Cloud Console: `https://evqaxvetcfkahxaxlftn.supabase.co/auth/v1/callback`

---

## Phase 1 — GitHub Repo

1. Create empty repo at https://github.com/new (public, no README)
2. Run from repo root:

```bash
git remote add origin https://github.com/YOUR_USERNAME/spectrumcircle.git
git push -u origin main
```

---

## Phase 2 — Web on Vercel

**Deploy steps:**
1. Go to https://vercel.com/new → Import GitHub repo
2. Set **Root Directory** → `apps/web`
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `NEXT_PUBLIC_APP_URL` = your Vercel production URL (e.g. `https://spectrumcircle.vercel.app`)
4. Click Deploy — live in ~2 minutes

**Post-deploy:**
- Supabase Dashboard → Authentication → URL Configuration → add your Vercel production URL to **Redirect URLs**
- Update `NEXT_PUBLIC_APP_URL` in Vercel env vars to match the actual deployed URL

> Note: `NODE_EXTRA_CA_CERTS=./system-certs.pem` has been removed from `build` and `start` scripts — it was a local Zscaler corporate proxy workaround only needed during local development (`dev` script retains it).

---

## Phase 3 — Mobile (iOS + Android) via EAS Build

### Current mobile app status

**Implemented:**
- Auth: login, register, forgot-password
- Tabs: Connect (member directory), Jobs, Business, Forums
- Supabase client using SecureStore (secure token storage)
- NativeWind 4 (Tailwind for React Native)

**Still needed before App Store submission:**
- `assets/` folder: icon.png (1024×1024), splash.png, adaptive-icon.png, favicon.png
- `.env` file: copy from `.env.example` and fill in Supabase values
- `eas.json`: EAS Build configuration
- Onboarding screen (role selection after first signup)
- Profile screen
- Messages tab

### Setup steps

```bash
# 1. Create .env in apps/mobile/
cp apps/mobile/.env.example apps/mobile/.env
# Edit with real values:
# EXPO_PUBLIC_SUPABASE_URL=https://evqaxvetcfkahxaxlftn.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 2. Install EAS CLI
npm install -g eas-cli

# 3. Login to Expo account (create one free at expo.dev)
eas login

# 4. Link project + generate eas.json
cd apps/mobile
eas build:configure

# 5. Build for internal testing first
eas build --profile preview --platform all

# 6. When ready for stores
eas build --profile production --platform all
eas submit --platform ios      # requires Apple Developer account ($99/yr)
eas submit --platform android  # requires Google Play account ($25 one-time)
```

### eas.json structure

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

> Store secrets (Supabase keys) in the EAS dashboard at https://expo.dev, not in eas.json directly.

### Run on device now (no build needed)

```bash
cd apps/mobile
# Ensure .env exists with real values
pnpm dev
# Scan QR code with Expo Go app on iPhone or Android
```

---

## Phase 4 — Missing Mobile Screens

These exist on web but not yet on mobile. Build before App Store submission:

| Screen | Priority | Notes |
|---|---|---|
| Onboarding | High | Role selection after first signup — mirrors `apps/web/src/app/onboarding/page.tsx` |
| Profile | High | View/edit own profile |
| Messages | Medium | Direct messaging tab |
| Notifications | Low | Push notifications via Expo Notifications |
