export type SprintInput = {
  request: string;
};

export type SprintAction = {
  id: string;
  label: string;
  priority: "low" | "medium" | "high";
};

export type SprintResult = {
  title: string;
  summary: string;
  actions: SprintAction[];
  source: "fixture" | "model";
};
