# BOW Sports Capital: Pre-Course

Multiplayer front-office simulation built with Next.js + Prisma (SQLite by default).

## What This App Is
- Students join teams with a join code.
- Teams vote through 8 situations.
- Teams unlock concept cards and complete quick checks.
- Teachers create sessions, monitor progress, and export CSV results.

## Run Locally (Step by Step)
1. Clone the repo:
```bash
git clone https://github.com/braydenokley13-ux/BSC-pre-course.git
cd BSC-pre-course
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` and set `DATABASE_URL`:
```bash
DATABASE_URL="file:./prisma/dev.db"
```

4. Push Prisma schema to local DB:
```bash
npm run db:push
```

5. Start the app:
```bash
npm run dev
```

6. Open:
- `http://localhost:3000/join` for students
- `http://localhost:3000/teacher` for instructors

If port 3000 is busy, Next.js will use another port (for example `3001`).

## Build / Quality Checks
- Production build:
```bash
npm run build
```

- Content checks:
```bash
npm run check:content
```

## Project Structure
- `app/` Next.js app routes and API handlers
- `lib/` missions, concepts, auth/session helpers
- `prisma/` schema and local DB files
- `styles/` global styles
- `data/` legacy static content files

## Legacy Static Files
`index.html`, `game.js`, and `styles.css` remain in the repo for earlier static-game history, but the active product flow is the Next.js app under `app/`.
