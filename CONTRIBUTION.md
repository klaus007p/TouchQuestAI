# Contributing to TouchQuest 🌱

Thanks for helping people touch grass! This guide gets you from zero to your first pull request.

## Setup

Follow the Quick start in the [README](./README.md). You don't need Ollama for most contributions, because fallback quests work without it.

Before opening a PR, run:

```bash
npm run lint
npx tsc --noEmit
```

## Finding something to work on

Look for the `good first issue` and `help wanted` labels. Comment on an issue to claim it so work isn't duplicated. If you have a new idea, open an issue first.

## Ground rules

- **The AI suggests, the backend decides.** Anything the AI returns must go through the validator. Never trust model output.
- **Safety rules are not optional.** No quests that require strangers, spending money, night outings, or risky activity.
- **No location tracking.** This is a core principle of the project.
- **Rewards are server-side only.** Never accept XP values from the client.
- Keep PRs small and focused. One feature or fix per PR.
- Be kind. Everyone here is learning.

## Common contributions

### Add fallback quests
Edit `src/engines/quest/fallbacks.ts` and add objects matching `GeneratedQuest`. They must pass `GeneratedQuestSchema`, follow the safety rules, and use a valid `category` and `verificationType`.

### Add a quest category
1. Add it to `QUEST_CATEGORIES` in `src/types/quest.ts`.
2. TypeScript will now error where it's missing. Add its look to `CATEGORY_META` and its sound to `AMBIENT_FOR_CATEGORY` in `src/lib/quest-meta.ts`.

### Add a verification type
1. Add it to `VERIFICATION_TYPES`.
2. Handle it in the `switch` in `src/verification/index.ts` (TypeScript will remind you).
3. Add its UI in `src/components/active-quest.tsx`.

### Add an AI provider
1. Create `src/engines/ai/providers/yourprovider.ts` implementing `AIProvider` from `src/engines/ai/types.ts`. It only needs a `complete()` method that returns text.
2. Add a `case` in `src/engines/ai/index.ts`.
3. Document its environment variables in `.env.example`.

### Add or change sounds
Put files in `public/sounds/` and record the source and license in `public/sounds/CREDITS.md`. Only use files you have the right to share (CC0 or compatible).

## Database changes

Edit `prisma/schema.prisma`, then run:

```bash
npx prisma migrate dev --name describe_your_change
```

Commit the generated migration folder.

## Pull request checklist

- [ ] `npm run lint` and `npx tsc --noEmit` pass
- [ ] I tested the change in the browser
- [ ] I didn't commit `.env`, `dev.db`, or large files
- [ ] I updated docs if behavior changed

## Hacktoberfest

PRs must be meaningful. Spam or low-effort PRs may be marked invalid.