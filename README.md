# 🌱 TouchQuest

**Your AI-powered excuse to touch grass.**

TouchQuest turns "I'm bored" or "I've been doom-scrolling all day" into a small, personalized real-world quest. Too hard? Too boring? No time? The AI **mutates** your quest instead of rolling a random new one.

> Screenshot or GIF goes here: `docs/demo.gif`

## ✨ Features

- 🤖 AI-generated quests from a plain-language intent, time, and energy level
- 🔀 Quest mutation: *too hard, too boring, no time, more challenge, something different*
- ✅ Five verification styles: checklist, timer, text reflection, self-report, photo (coming soon)
- 🏆 XP, levels, coins, and day streaks
- 🎧 Nature soundscapes (birds, rain, crickets, storm)
- 🧠 Personalization from your preferences and mutation habits
- 🔒 Privacy-minded: no GPS, no location tracking, guest-first (no sign-up needed)
- 🧩 Model-agnostic: runs on a local open-weight model through Ollama, with room for more providers
- 🛟 Works without any AI: if the model is unavailable, a library of fallback quests keeps the app usable

## 🧠 How it works

The AI suggests. The backend decides.

```text
Intent → AI generates JSON → Validator (schema + safety) → Quest saved
       → Start → Verify → Complete → XP / streak / level (one DB transaction)
```

- **AI Engine** (`src/engines/ai`): provider adapters and prompts
- **Quest Engine** (`src/engines/quest`): generation, mutation, validation, fallbacks
- **Reward Engine** (`src/engines/reward`): XP, coins, levels, streaks
- **Verification** (`src/verification`): one rule per verification type

Rewards are computed on the server. The AI's suggested XP is ignored, and the client can't award itself XP.

## 🚀 Quick start

**Requirements:** Node.js 20+ and, optionally, [Ollama](https://ollama.com).

```bash
git clone https://github.com/klaus007p/touchquest.git
cd touchquest
npm install
cp .env.example .env        # on Windows: copy .env.example .env
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000.

**To use the AI** (optional, recommended):

```bash
ollama pull llama3.2
```

Leave Ollama running. Without it, TouchQuest serves quests from the built-in fallback library, so you can still work on everything else.

## 🗂️ Project structure

```text
src/
  app/            Pages and API routes (/api/v1/...)
  components/     UI components
  engines/
    ai/           Provider adapters, prompts, feedback
    quest/        Generate, mutate, validate, fallbacks
    reward/       XP, levels, streaks, completion
  verification/   Verification rules
  lib/            Prisma client, API client, helpers
  types/          Zod schemas and shared types
prisma/           Database schema and migrations
public/sounds/    Audio files (see CREDITS.md)
```

## 🔌 API overview

All routes live under `/api/v1`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/me` | Current (guest) user |
| POST | `/quests/generate` | Generate a quest |
| GET | `/quests/:id` | Quest and latest attempt |
| POST | `/quests/:id/mutate` | Adapt a quest (`reason` in body) |
| POST | `/quests/:id/start` | Start an attempt |
| POST | `/quests/:id/complete` | Verify and reward |
| GET | `/progress/me` | Level, XP, streak, coins |
| GET | `/progress/history` | Completed quests |
| GET | `/progress/unfinished` | Quests you can resume |
| GET | `/rewards/me` | XP ledger summary |
| GET, PATCH | `/preferences` | Interests, difficulty, goals |

## 🛡️ Safety and privacy

- Quests never require talking to strangers, spending money, going out at night, or risky activity. This is enforced by the prompt **and** by a validator.
- No location tracking of any kind.
- Text you write (goals, reflections) is sent to the AI as plain data, not instructions.
- **Guest accounts live in a browser cookie.** Clearing cookies starts a fresh guest.

## 🤝 Contributing

Hacktoberfest contributors are very welcome! Read [CONTRIBUTING.md](./CONTRIBUTING.md) and look for issues labeled `good first issue`.

## ☁️ Deployment notes

- A hosted deployment can't reach a visitor's local Ollama. Use a hosted open-model provider (write an adapter, see CONTRIBUTING).
- SQLite is for local development. On serverless hosts such as Vercel the filesystem is temporary, so switch the Prisma datasource to PostgreSQL there.

## 📄 License

MIT. See [LICENSE](./LICENSE). Sound credits are in [public/sounds/CREDITS.md](./public/sounds/CREDITS.md).