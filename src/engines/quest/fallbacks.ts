import type { GeneratedQuest, GenerateQuestRequest } from "@/types/quest";


export const FALLBACK_QUESTS: GeneratedQuest[] = [
    {
        title: "The 10-Minute Look Around",
        description: "Step outside and notice things you usually walk past without seeing.",
        category: "exploration",
        difficulty: "easy",
        durationMin: 10,
        steps: [
            "Put your phone in your pocket",
            "Walk outside for 5 minutes",
            "Find three things you've never noticed before",
            "Write down what they were",
        ],
        verificationType: "text",
        rewardXp: 45,
    },
    {
        title: "Sky Watch",
        description: "Take a short break and watch the sky without any screen.",
        category: "mindfulness",
        difficulty: "easy",
        durationMin: 5,
        steps: [
            "Go to a window, balcony, or doorway",
            "Look at the sky for 3 minutes",
            "Notice the colors, clouds, or birds",
        ],
        verificationType: "timer",
        rewardXp: 35,
    },
    {
        title: "Walk and Wonder",
        description: "A short walk with no destination and no phone.",
        category: "physical",
        difficulty: "medium",
        durationMin: 20,
        steps: [
            "Leave your phone behind or on silent",
            "Walk in any direction for 10 minutes",
            "Turn around and walk back a different way",
            "Write one thing you saw that made you smile",
        ],
        verificationType: "text",
        rewardXp: 70,
    },
    {
        title: "Sketch What's Near",
        description: "Draw the first interesting object you see. Quality does not matter.",
        category: "creativity",
        difficulty: "easy",
        durationMin: 15,
        steps: [
            "Grab paper and a pen",
            "Pick one object nearby",
            "Draw it for 10 minutes",
            "Check off the box when you are done",
        ],
        verificationType: "checklist",
        rewardXp: 50,
    },
    {
        title: "Tidy One Corner",
        description: "Reset a small space to make your day feel lighter.",
        category: "productivity",
        difficulty: "easy",
        durationMin: 10,
        steps: [
            "Choose one small area, like a desk or shelf",
            "Remove everything that does not belong",
            "Put the rest in order",
        ],
        verificationType: "self_report",
        rewardXp: 40,
    },

    // Will add more quests later or Contributors can contribute here and add new and interesting quests.
]



export function pickFallback(req: GenerateQuestRequest): GeneratedQuest {
    const fitsTime = FALLBACK_QUESTS.filter(
        (q) => !req.timeAvailableMin || q.durationMin <= req.timeAvailableMin
    );

    const pool = fitsTime.length > 0 ? fitsTime : FALLBACK_QUESTS;
    return pool[Math.floor(Math.random() * pool.length)];
}