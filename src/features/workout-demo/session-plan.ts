import type { PhaseKind, WorkoutBlock, WorkoutPlan } from "./types";

export const levelLabel = (level: WorkoutPlan["level"]) =>
  level === "beginner" ? "Débutant" : "Intermédiaire";

export const phaseKindLabel = (kind: PhaseKind) => {
  switch (kind) {
    case "warmup":
      return "Échauffement";
    case "work":
      return "Effort";
    case "rest":
      return "Récupération";
    case "cooldown":
      return "Retour au calme";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
};

export const summarizePlan = (plan: WorkoutPlan) => {
  const totals: Record<PhaseKind, number> = {
    warmup: 0,
    work: 0,
    rest: 0,
    cooldown: 0,
  };

  for (const block of plan.blocks) {
    for (const phase of block.phases) {
      totals[phase.kind] += phase.durationSeconds * block.rounds;
    }
  }

  return totals;
};

export const blockDurationSeconds = (block: WorkoutBlock) =>
  block.rounds * block.phases.reduce((sum, phase) => sum + phase.durationSeconds, 0);

export const workExercises = (plan: WorkoutPlan) => {
  const names: string[] = [];
  for (const block of plan.blocks) {
    for (const phase of block.phases) {
      if (phase.kind === "work" && !names.includes(phase.exercise)) {
        names.push(phase.exercise);
      }
    }
  }
  return names;
};
