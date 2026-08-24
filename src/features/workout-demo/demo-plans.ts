import type { FlatPhase, WorkoutBlock, WorkoutPlan } from "./types";

const secondsForBlocks = (blocks: WorkoutBlock[]) =>
  blocks.reduce(
    (total, block) =>
      total + block.rounds * block.phases.reduce((sum, phase) => sum + phase.durationSeconds, 0),
    0,
  );

const plan = (
  id: string,
  name: string,
  level: WorkoutPlan["level"],
  blocks: WorkoutBlock[],
): WorkoutPlan => ({ id, name, level, blocks, source: "fixture", estimatedDurationSeconds: secondsForBlocks(blocks) });

export const catalogPlans: WorkoutPlan[] = [
  plan("tabata-4", "Tabata express", "intermediate", [{
    id: "tabata", label: "8 tours - puissance", rounds: 8, phases: [
      { id: "burpees", kind: "work", exercise: "Burpees", instruction: "Rythme régulier, poitrine haute à la remontée.", durationSeconds: 20 },
      { id: "recover", kind: "rest", exercise: "Repos", instruction: "Respire, le prochain tour arrive vite.", durationSeconds: 10 },
    ],
  }]),
  plan("gentle-10", "Élan quotidien", "beginner", [
    { id: "warmup", label: "Mise en route", rounds: 1, phases: [{ id: "march", kind: "warmup", exercise: "Marche active", instruction: "Bras souples, souffle calme, prépare les jambes.", durationSeconds: 60 }] },
    { id: "circuit", label: "Circuit sans saut", rounds: 4, phases: [
      { id: "squat", kind: "work", exercise: "Squats contrôlés", instruction: "Hanches en arrière, genoux dans l'axe.", durationSeconds: 45 },
      { id: "rest-squat", kind: "rest", exercise: "Repos", instruction: "Respire. Prochain : fentes arrière.", durationSeconds: 15 },
      { id: "lunge", kind: "work", exercise: "Fentes arrière", instruction: "Recule loin, buste stable, alterne les côtés.", durationSeconds: 45 },
      { id: "rest-lunge", kind: "rest", exercise: "Repos", instruction: "Relâche les épaules, le tour continue.", durationSeconds: 15 },
    ] },
    { id: "cooldown", label: "Retour au calme", rounds: 1, phases: [{ id: "breath", kind: "cooldown", exercise: "Respiration", instruction: "Marche doucement et retrouve un souffle long.", durationSeconds: 60 }] },
  ]),
  plan("endurance-20", "Endurance active", "intermediate", [
    { id: "warmup-long", label: "Échauffement", rounds: 1, phases: [{ id: "mobilize", kind: "warmup", exercise: "Mobilisation", instruction: "Déroule les épaules et active les chevilles.", durationSeconds: 120 }] },
    { id: "endurance", label: "Bloc cardio", rounds: 9, phases: [
      { id: "step", kind: "work", exercise: "Montées de genoux", instruction: "Cadence continue, garde ton buste grand.", durationSeconds: 45 },
      { id: "rest-step", kind: "rest", exercise: "Repos", instruction: "Le prochain exercice arrive : gainage debout.", durationSeconds: 15 },
      { id: "hinge", kind: "work", exercise: "Good mornings", instruction: "Charnière de hanches, dos long, fessiers actifs.", durationSeconds: 45 },
      { id: "rest-hinge", kind: "rest", exercise: "Repos", instruction: "Reprends ton souffle avant le prochain tour.", durationSeconds: 15 },
    ] },
  ]),
];

export const demoGeneratedPlan: WorkoutPlan = {
  ...catalogPlans[1],
  id: "ai-daily-flow",
  name: "Élan quotidien - 10 min sans saut",
  fallbackNotice: "Mode démonstration local - API de génération à connecter.",
};

export const flattenPlan = (workoutPlan: WorkoutPlan): FlatPhase[] =>
  workoutPlan.blocks.flatMap((block) =>
    Array.from({ length: block.rounds }, (_, roundIndex) =>
      block.phases.map((phase) => ({ ...phase, id: `${block.id}-${roundIndex + 1}-${phase.id}`, blockLabel: block.label, round: roundIndex + 1, rounds: block.rounds })),
    ).flat(),
  );

export const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
