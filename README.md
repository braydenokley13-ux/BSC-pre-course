# BOW Sports Capital: Pre-Course

Multiplayer front-office simulation built with Next.js + Prisma.

This project is now configured for **PostgreSQL** so it can be deployed in production safely.

## 1) Local Setup (Step by Step)

1. Open Terminal.
2. Go to the project:
```bash
cd /Users/braydenwhite/Documents/BSC-pre-course
```
3. Install packages:
```bash
npm install
```
4. Copy env template:
```bash
cp .env.example .env.local
```
5. Put real values into `.env.local`:
- `DATABASE_URL` -> your Postgres URL
- `TEACHER_PASSWORD` -> bcrypt hash (or plain text for temporary local testing)
- `RECOVERY_CODE_PEPPER` -> long random secret string
6. If you need a password hash:
```bash
npm run teacher:hash -- "your-password-here"
```
7. Push Prisma schema to your DB:
```bash
npm run db:push
```
8. Seed adaptive questions:
```bash
npm run db:seed:adaptive
```
9. Start app:
```bash
npm run dev
```
10. Open:
- `http://localhost:3000/join`
- `http://localhost:3000/teacher`

## 2) Production Preflight (Required)

Run this before deploy:
```bash
npm run check:prod
```

This checks:
- required env vars exist
- DB URL is PostgreSQL (not sqlite file path)
- password/pepper are not weak

## 3) Exact Deploy Steps (Vercel + Neon)

1. Create a Neon Postgres database.
2. Copy Neon connection string.
3. In GitHub, make sure your latest commit is pushed:
```bash
git add .
git commit -m "ready for deploy"
git push origin main
```
4. In Vercel:
- Click **New Project**
- Import `braydenokley13-ux/BSC-pre-course`
- Framework: Next.js (auto-detected)
5. In Vercel Project Settings -> Environment Variables, add:
- `DATABASE_URL` = Neon connection string
- `TEACHER_PASSWORD` = bcrypt hash
- `RECOVERY_CODE_PEPPER` = long random secret
- Optional feature flags from `.env.example`
6. In Vercel Project Settings -> Build & Development Settings:
- Build Command:
```bash
prisma generate && prisma db push && next build
```
7. Click **Deploy**.
8. After deploy finishes, open:
- `https://<your-project>.vercel.app/api/health`
9. Confirm response has `"ok": true`.
10. Open app and test:
- teacher login
- create session
- student join
- one adaptive check

## 4) Useful Commands

- Build:
```bash
npm run build
```
- Content + adaptive checks:
```bash
npm run check:content
```
- Adaptive checks only:
```bash
npm run check:adaptive
```

## 5) Project Structure

- `app/` routes and API handlers
- `lib/` game logic, auth, analytics
- `prisma/` schema
- `scripts/` validation, seed, preflight helpers
- `data/` adaptive bank sources
