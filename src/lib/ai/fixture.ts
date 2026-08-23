import type { SprintResult } from "@/types/sprint";

export const demoFixture: SprintResult = {
  title: "Resultat de demonstration",
  summary:
    "Cette fixture structuree garde le parcours demonstrable tant que le contrat final et l'appel IA ne sont pas prets.",
  actions: [
    { id: "review", label: "Relire le resultat", priority: "high" },
    { id: "apply", label: "Executer l'action finale", priority: "medium" },
  ],
  source: "fixture",
};
