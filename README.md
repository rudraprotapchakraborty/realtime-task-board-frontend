<div align="center">

# 🗂️ Realtime Task Board

**Kanban board with drag and drop, live sync across devices and secure sign-in.**

[**Live demo**](https://realtime-task-board-frontend.vercel.app/) · [Backend API](https://github.com/rudraprotapchakraborty/realtime-task-board-backend) · [Portfolio](https://rudraprotapchakraborty.com/projects)

![React](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61dafb) ![Vite](https://img.shields.io/badge/Vite-646cff?style=for-the-badge&logo=vite&logoColor=ffffff) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0f172a?style=for-the-badge&logo=tailwindcss&logoColor=38bdf8) ![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=ffffff) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=ffffff)

<a href="https://realtime-task-board-frontend.vercel.app/"><img src="https://i.ibb.co/Hfqj4xDr/realtime-task-board.webp" alt="Realtime Task Board: home page" width="880"></a>

</div>

> The web app of **Task Board**.
>
> - To-Do, In Progress and Done columns with drag and drop by mouse, touch or keyboard
> - Priority, due date and notes on every task
> - Changes appear on every open tab instantly, with a polling fallback on serverless hosting
> - Private board per member and an admin area

A kanban board that stays in sync everywhere. Tasks live in To-Do, In Progress and Done columns that can be rearranged with a mouse, a finger or the keyboard, and every task carries a priority, an optional due date and a notes field. Changes made on one device show up on every other open tab straight away over WebSockets, with an automatic polling fallback on serverless hosting. Each member has a private board, and sign-in works with email and password (confirmed with a one-time email code) or Google, with password reset, an account settings page for name, photo, email and password, and an admin area for managing members. Shared test accounts for each role make the app easy to try, and the whole interface supports light and dark themes.

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
| `VITE_API_URL` | Optional override of the API origin including `/api`. Production defaults to `https://realtime-task-board-backend.vercel.app/api`. |
| `VITE_SOCKET_URL` | Optional: WebSocket server origin. Leave empty on Vercel; the board polls instead. |

## Deploying

The project deploys as a static site (Vercel config included, with a rewrite to `index.html` for client side routing). Set `GOOGLE_CLIENT_ID` in the host's environment (and `VITE_API_URL` if the API lives somewhere else), and add the site's origin to the Google client's authorized JavaScript origins.

---

<div align="center">

Made by **[Rudra Protap Chakraborty](https://rudraprotapchakraborty.com)** · [Portfolio](https://rudraprotapchakraborty.com) · [GitHub](https://github.com/rudraprotapchakraborty)

</div>
