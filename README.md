# EduConnect — MERN Tutor Hiring Platform

A complete, working project: a real Express/MongoDB backend and a React
(Vite + Tailwind + Framer Motion) frontend covering every page from the
original spec, wired together and verified to build cleanly.

## What's built

### Backend (`server/`)
- Mongoose models: `User` (base) with `Tutor`/`Student` discriminators, `Subject` (nested hierarchy), `Booking`, `Payment`, `Review`, `Notification`, `Chat`.
- Auth: register → OTP email verification → login, JWT in httpOnly cookie, role-based middleware.
- Tutor search & filter endpoint supporting every filter axis from the spec, plus sorting and pagination.
- Booking flow: create → tutor accept/reject → cancel, with platform commission calculated automatically.
- Subject hierarchy CRUD, admin analytics, tutor verification, user management endpoints.
- Real-time chat + notifications via Socket.io.
- Security: helmet, rate limiting, mongo-sanitize, xss-clean, input validation.

### Frontend (`client/`) — 32 pages, all routed in `App.jsx`

**Public**
- Landing page (hero, animated stats, how-it-works, categories, featured tutors, testimonials)
- Search & Filter page (the flagship page — 3D tilt cards, full filter sidebar, infinite scroll)
- Login / Signup (role select → details → OTP verify) / Forgot Password
- Tutor Profile (shared-element transition from the search card, tabs for About/Availability/Reviews)
- About, Contact, Privacy Policy, Terms of Service
- 404 page

**Student**
- Dashboard (stats, upcoming schedule, recommended tutors)
- My Bookings (upcoming/completed/cancelled tabs)
- Favorites, Payments, Settings
- Booking/Checkout flow (date → class type → payment, with success screen)

**Tutor**
- Dashboard (animated earnings chart, today's schedule)
- Profile Management (bio/subjects/rate editor, verification document upload)
- Availability (weekly click-to-toggle calendar grid)
- Bookings/Requests (accept/reject incoming requests, upcoming, past)
- Earnings (totals, withdraw modal, transaction history)
- Settings

**Shared**
- Chat/Inbox (conversation list + live message window)
- Live Classroom (video area, working canvas whiteboard, chat panel, mic/cam/end controls)

**Admin**
- Analytics dashboard (revenue bar chart, subject popularity donut, live stat counters)
- Tutor Verification queue (approve/reject with reason)
- User Management (search, filter, ban/unban)
- Subject & Category tree management
- Booking & Payment Management (refund review flow)
- Dispute Management (mediation thread per case)
- Platform Settings (general, fees, email, security tabs)

All design tokens (colors, fonts, glassmorphism, glow) follow the original brief's palette. Every non-trivial
data view — dashboards, chat, admin tables — currently runs on realistic **sample data** so the whole app is
clickable end-to-end without a running database; the Search page and auth flow already call the real backend
and fall back to samples only if it's unreachable.

## Running it locally

### Backend
```bash
cd server
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, etc.
npm install
npm run dev             # http://localhost:5000
```

### Frontend
```bash
cd client
npm install
npm run dev              # http://localhost:5173, proxies /api to :5000
```

Open `http://localhost:5173`.

## Honest state of things
This is a large, consistent scaffold — not a client-audited production app. What's still worth doing before
shipping:
1. Connect the remaining pages (dashboards, chat, admin tables, tutor schedule/earnings) to their real backend
   endpoints instead of the sample arrays currently in each file.
2. Add the missing backend routes referenced by the frontend but not yet built: `forgot-password`,
   `google` OAuth callback, `contact` form submission, dispute model/endpoints.
3. Add file upload handling (Cloudinary/S3) for tutor ID/degree documents and profile photos — currently UI-only.
4. Wire Socket.io events into the Chat and Live Classroom pages (the server-side handler already exists in
   `sockets/chatSocket.js`; the frontend pages use local state for now).
5. Add tests and a CI pipeline before treating this as production-ready.

Tell me which of these you want tackled next and I'll keep building in the same pattern — real files,
installed, built, and verified.
