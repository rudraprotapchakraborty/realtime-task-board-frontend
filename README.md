# Realtime Task Board · Web app

A kanban board that stays in sync everywhere. Drag tasks between **To-Do**, **In Progress** and **Done**, set priorities and due dates, and watch every open tab or device update the moment something changes.

Backend repository: [realtime-task-board-backend](https://github.com/rudraprotapchakraborty/realtime-task-board-backend)

## Features

- Drag and drop with mouse, touch and keyboard (`@dnd-kit`), including reordering inside a column
- Realtime sync over WebSockets, with automatic fallback to polling on serverless hosting
- Priorities, due dates, overdue highlighting, search and priority filter, "clear finished"
- Email and password sign-in with a six digit email code, Google sign-in, forgot-password reset
- Account settings: name, photo, email (confirmed by code), password, sign-in methods, delete account
- Admin area: member list with search, block, role change and delete, plus board statistics
- Light and dark mode, responsive down to phones, accessible dialogs and focus handling
- Shared test accounts (Admin and User) on the sign-in page, locked so they cannot be changed

## Stack

React 19, Vite 8, Tailwind CSS 4, React Router 7, Axios, socket.io-client, `@dnd-kit`, lucide-react.

## Run it locally

You need the [backend](https://github.com/rudraprotapchakraborty/realtime-task-board-backend) running on port 5000.

```bash
npm install
cp .env.example .env.local   # then fill in GOOGLE_CLIENT_ID
npm run dev                  # http://localhost:3000
```

In development the dev server proxies `/api` and `/socket.io` to `http://127.0.0.1:5000`.

## Environment

| Variable | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Public Google OAuth client id. The button is hidden when it is empty. |
| `VITE_API_URL` | Production only: API origin including `/api`, for example `https://your-api.vercel.app/api`. |
| `VITE_SOCKET_URL` | Optional: WebSocket server origin. Leave empty on Vercel; the board polls instead. |

## Deploying

The project deploys as a static site (Vercel config included, with a rewrite to `index.html` for client side routing). Set `VITE_API_URL` and `GOOGLE_CLIENT_ID` in the host's environment, and add the site's origin to the Google client's authorized JavaScript origins.
