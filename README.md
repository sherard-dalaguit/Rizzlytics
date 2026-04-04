# Rizzlytics

An AI-powered feedback tool for dating app photos and conversations. Upload a photo, a profile set, or a conversation thread and get a clear diagnosis with exact next steps — no generic advice.

**Live demo:** [rizzlytics.com](https://rizzlytics.com)

---

## Features

### Tools
| Tool | What it does |
|------|-------------|
| **Photos** | Analyzes a single photo — lighting, framing, expression, outfit, and overall vibe |
| **Profiles** | Analyzes a set of photos together — variety, consistency, story, and what to replace |
| **Conversations** | Post-mortem on a finished thread — what killed momentum and takeaways for next time |
| **Reply Coach** | Live reply options for an active conversation — 4–6 suggestions with intent and tone |

### App
- **Dashboard** — activity snapshot, smart "next steps" cards, and jump links to the latest items
- **AI Review** — unified results page with attraction signals (positive / negative / uncertain), overall diagnosis, and prioritized action items
- Per-user data isolation — all uploads and analyses are scoped to the authenticated user
- Delete any upload or analysis at any time

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| Auth | NextAuth v5 (OAuth) |
| Database | MongoDB via Mongoose |
| File storage | Vercel Blob |
| AI | OpenAI API (vision + chat) |
| Deployment | Vercel |

---

## Running locally

**Prerequisites:** Node.js 20+, a MongoDB instance, a Vercel Blob store, an OpenAI API key, and an OAuth provider configured in NextAuth.

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/<your-username>/rizzlytics.git
cd rizzlytics
npm install
```

2. Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

```env
MONGODB_URI=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
OPENAI_API_KEY=
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
app/
  (auth)/          # Login page
  (root)/          # Authenticated app shell
    dashboard/     # Activity overview and next steps
    ai-review/     # Tool hub + per-analysis results
    photos/        # Photo library
    profiles/      # Profile sets
    conversations/ # Conversation threads
    reply-coach/   # Reply Coach history
  api/             # Route handlers (assets, conversations, profiles, AI analysis)
components/        # Shared UI components and analysis forms
database/          # Mongoose models
lib/               # DB connection, utilities
```