export type PhaseKind = "warmup" | "work" | "rest" | "cooldown";

export type WorkoutPhase = {
  id: string;
  kind: PhaseKind;
  exercise: string;
  instruction: string;
  durationSeconds: number;
};

export type WorkoutBlock = {
  id: string;
  label: string;
  rounds: number;
  phases: WorkoutPhase[];
};

export type WorkoutPlan = {
  id: string;
  name: string;
  level: "beginner" | "intermediate";
  estimatedDurationSeconds: number;
  blocks: WorkoutBlock[];
  source: "model" | "fixture";
  fallbackNotice?: string;
};

export type FlatPhase = WorkoutPhase & {
  blockLabel: string;
  round: number;
  rounds: number;
};
