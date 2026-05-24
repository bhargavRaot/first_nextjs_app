# first_nextjs_app

Minimal Next.js app with backend API routes and MySQL data storage.

Setup

1. Install dependencies:

```bash
npm install
```

2. Configure DB in `.env.local` (already provided):

```
DB_HOST=localhost
DB_USER=root
DB_PASS=Abjayon
DB_NAME=nextjs_app
DB_PORT=3306
```

3. Seed the database (this will create the database and tables if missing):

```bash
npm run seed
```

4. Run dev server:

```bash
npm run dev
```

App pages:

- `/` — Dashboard
- `/chats` — Simple chat list from DB
- `/table` — Tabular items list
- `/account` — Account info

API endpoints:

- `/api/chats` — GET chats
- `/api/items` — GET items
- `/api/account` — GET account

Notes

- This repo keeps UI and API in the same Next.js app. The DB helper is in `lib/db.js`.
- The seed script is `scripts/seed.js`.
