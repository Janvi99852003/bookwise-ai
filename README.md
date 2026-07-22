# BookWise AI

AI-powered booking & scheduling SaaS for coaches, consultants, and freelancers.
Clients book and pay per session via Razorpay; providers subscribe to Free/Pro
plans via Razorpay Subscriptions; Gemini AI powers an FAQ chatbot and dashboard
insights.

## Day 1 — What's built

- Express + MongoDB (Mongoose) backend skeleton
- Provider model with password hashing (bcrypt) and auto-generated public
  booking slug (e.g. `janvi-fitness`)
- JWT-based signup / login / `me` routes

## Local setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev
```

MongoDB Atlas free tier works fine — create a cluster, add a DB user, allow
your IP (or 0.0.0.0/0 for now), and copy the connection string into
`MONGO_URI`.

## API — Day 1

| Method | Route | Body | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | `{ name, email, password, businessName? }` | none |
| POST | `/api/auth/login` | `{ email, password }` | none |
| GET | `/api/auth/me` | — | Bearer token |

## Roadmap

See day-by-day plan in chat / project notes. Day 2 adds Service +
Availability models and APIs.