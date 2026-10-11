import type { QuestCategory, Difficulty } from "@/types/quest";

export const CATEGORY_META: Record<
    QuestCategory,
    { emoji: string; label: string; badge: string }
> = {
    outdoors: { emoji: "🌳", label: "Outdoors", badge: "bg-emerald-400/15 text-emerald-300" },
    learning: { emoji: "📚", label: "Learning", badge: "bg-sky-400/15 text-sky-300" },
    creativity: { emoji: "🎨", label: "Creativity", badge: "bg-pink-400/15 text-pink-300" },
    social: { emoji: "🤝", label: "Social", badge: "bg-amber-400/15 text-amber-300" },
    physical: { emoji: "🏃", label: "Physical", badge: "bg-orange-400/15 text-orange-300" },
    mindfulness: { emoji: "🧘", label: "Mindfulness", badge: "bg-violet-400/15 text-violet-300" },
    exploration: { emoji: "🗺️", label: "Exploration", badge: "bg-teal-400/15 text-teal-300" },
    productivity: { emoji: "🧑‍💻", label: "Productivity", badge: "bg-lime-400/15 text-lime-300" },
};

export const DIFFICULTY_LEVEL: Record<Difficulty, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
};