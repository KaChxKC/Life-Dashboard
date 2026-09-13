# Life Dashboard

**Live demo → https://life-dashboard-kc.vercel.app**

> Heads up: the frontend loads instantly, but the backend runs on Render's free tier, which spins down after periods of inactivity. The first action after opening (signing in or loading data) can take up to a minute while the server wakes up — if it seems to hang, give it a moment. It's not broken, just waking up.

A personal dashboard I built to keep my day organized in one place - tasks, a pomodoro timer, and an expense tracker. Made with the MERN stack (MongoDB, Express, React, Node) and Tailwind CSS, with Google login.

## What it does

- Dashboard with an overview of the day: pending tasks, daily habits, focus time, and today's spending
- Tasks that can be a daily habit, an assignment, a roadmap item, or a goal, each with a priority and optional due date. Daily habits keep a streak count.
- Pomodoro timer with focus, short break and long break modes. Finished focus sessions get saved so the dashboard can show total focus time.
- Expense tracker with amount, category, date and a note, plus a monthly breakdown by category.

## Tech

- Frontend: React + Vite, Tailwind CSS, React Router, Recharts
- Backend: Node, Express, Mongoose
- Database: MongoDB Atlas
- Auth: Google Sign-In (JWT for sessions)

## Folder layout

```
Life/
  server/    Express API and Mongoose models
  client/    React app (Vite + Tailwind)
```

## Running it locally

1. Install everything from the project root:

   ```
   npm run install:all
   ```

2. Create a `.env` file inside `server/` (there's a `.env.example` to copy):

   ```
   PORT=5000
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=any-long-random-string
   GOOGLE_CLIENT_ID=your-google-oauth-client-id
   ```

3. Create a `.env` file inside `client/`:

   ```
   VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
   ```

   Use the same Google client ID in both files.

4. Start both the API and the app:

   ```
   npm run dev
   ```

   The API runs on http://localhost:5000 and the app on http://localhost:5173.

   Locally you don't need `VITE_API_URL` — Vite's dev server proxies `/api` to the backend automatically.

## Deployment

The app is deployed as two separate services:

- **Frontend** → Vercel (root directory `client`). Set `VITE_GOOGLE_CLIENT_ID` and `VITE_API_URL` (the backend's URL) as build-time env vars.
- **Backend** → Render (a Node web service running `server/`). Set `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, and `CLIENT_URL` (the Vercel origin, so CORS allows it).

The frontend reads `VITE_API_URL` to know where the API lives, and the backend allows requests from the origins listed in `CLIENT_URL`. The deployed frontend's URL is also added to the Google OAuth client's authorized JavaScript origins.

## Notes

- You'll need a free MongoDB Atlas cluster and a Google OAuth client ID (Web application, with `http://localhost:5173` as an allowed origin).
- Amounts use INR formatting. To change the currency, edit the formatter in `client/src/lib/constants.js`.
