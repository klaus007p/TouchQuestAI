"use client";

import { IntentForm } from "@/components/intent-form";
import { QuestCard } from "@/components/quest-card";
import { ActiveQuest } from "@/components/active-quest";
import { useQuestFlow } from "@/hooks/use-quest-flow";

export default function Home() {
  const flow = useQuestFlow();

  if (flow.phase === "idle" || !flow.quest) {
    return (
      <IntentForm onSubmit={flow.generate} busy={flow.busy} error={flow.error} />
    );
  }

  if (flow.phase === "ready") {
    return (
      <QuestCard
        quest={flow.quest}
        source={flow.source}
        busy={flow.busy}
        error={flow.error}
        onMutate={flow.mutate}
        onStart={flow.start}
        onReset={flow.reset}
      />
    );
  }

  if (flow.phase === "active" && flow.attempt) {
    return (
      <ActiveQuest
        quest={flow.quest}
        attempt={flow.attempt}
        busy={flow.busy}
        error={flow.error}
        onComplete={flow.complete}
        onBack={flow.reset}
      />
    );
  }

  // Temporary view. Step 35 replaces this with the celebration screen.
  return (
    <div className="space-y-4 text-center">
      <div className="text-5xl">🎉</div>
      <p className="text-xl font-bold text-emerald-300">
        +{flow.result?.xpAwarded} XP
        {flow.result?.leveledUp && " · Level up!"}
      </p>
      <p className="text-white/70">{flow.result?.feedback.message}</p>
      <button
        onClick={flow.reset}
        className="rounded-lg border border-white/20 px-4 py-2 text-sm"
      >
        New quest
      </button>
    </div>
  );
}