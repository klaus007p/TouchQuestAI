"use client";

import { IntentForm } from "@/components/intent-form";
import { QuestCard } from "@/components/quest-card";
import { ActiveQuest } from "@/components/active-quest";
import { useQuestFlow } from "@/hooks/use-quest-flow";
import { CompletionScreen } from "@/components/completion-screen";

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

  if (flow.phase === "done" && flow.result) {
    return (
      <CompletionScreen
        quest={flow.quest}
        result={flow.result}
        onNewQuest={flow.reset}
      />
    );
  }

  return null;
}