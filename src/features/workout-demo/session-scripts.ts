import { flattenPlan } from "./demo-plans";
import type { FlatPhase, WorkoutPlan } from "./types";

export const START_COUNTDOWN_SECONDS = 10;

export const formatSpokenDuration = (seconds: number) => {
  if (seconds > 0 && seconds % 60 === 0) {
    const minutes = seconds / 60;
    return minutes === 1 ? "une minute" : `${minutes} minutes`;
  }
  return `${seconds} secondes`;
};

export const countdownScript = (plan: WorkoutPlan) => {
  const warmupPhases = plan.blocks.flatMap((block) =>
    block.phases.filter((phase) => phase.kind === "warmup"),
  );

  if (warmupPhases.length === 0) {
    const firstBlock = plan.blocks[0];
    const work = firstBlock?.phases.find((phase) => phase.kind === "work");
    const rest = firstBlock?.phases.find((phase) => phase.kind === "rest");
    const parts = ["Prépare-toi."];
    if (work) parts.push(`${work.exercise}, ${formatSpokenDuration(work.durationSeconds)}.`);
    if (rest) parts.push(`Récup ${formatSpokenDuration(rest.durationSeconds)}.`);
    if (firstBlock && firstBlock.rounds > 1) parts.push(`${firstBlock.rounds} tours.`);
    return parts.join(" ");
  }

  const list = warmupPhases
    .map((phase) => `${phase.exercise}, ${formatSpokenDuration(phase.durationSeconds)}.`)
    .join(" ");
  return `Échauffement. ${list}`;
};

export const phaseScript = (phase: FlatPhase, next: FlatPhase | undefined) => {
  switch (phase.kind) {
    case "warmup":
      return `${phase.exercise}. ${formatSpokenDuration(phase.durationSeconds)}.`;
    case "work": {
      const recup = next?.kind === "rest" ? ` Récup ${formatSpokenDuration(next.durationSeconds)}.` : "";
      return `${phase.exercise}. ${formatSpokenDuration(phase.durationSeconds)}.${recup}`;
    }
    case "rest":
      return next ? `Récupération. Prochain : ${next.exercise}.` : "Récupération.";
    case "cooldown":
      return `${phase.exercise}. ${formatSpokenDuration(phase.durationSeconds)}.`;
    default: {
      const _exhaustive: never = phase.kind;
      return _exhaustive;
    }
  }
};

export const completeScript = () => "Séance terminée. Bravo.";

export const upcomingScripts = (plan: WorkoutPlan, fromIndex: number, count = 2) => {
  const phases = flattenPlan(plan);
  const scripts: string[] = [];
  for (let index = fromIndex; index < Math.min(fromIndex + count, phases.length); index += 1) {
    scripts.push(phaseScript(phases[index], phases[index + 1]));
  }
  return scripts;
};
