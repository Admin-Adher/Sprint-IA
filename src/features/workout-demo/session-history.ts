import type { CompletedSession } from "./types";

const STORAGE_KEY = "just-do-hiit:sessions";
const MAX_SESSIONS = 8;
const EMPTY_HISTORY: CompletedSession[] = [];

let snapshot: CompletedSession[] = EMPTY_HISTORY;
let snapshotKey: string | null = null;
const listeners = new Set<() => void>();

const isCompletedSession = (value: unknown): value is CompletedSession => {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as CompletedSession;
  return (
    typeof entry.id === "string" &&
    typeof entry.completedAt === "number" &&
    typeof entry.actualDurationSeconds === "number" &&
    typeof entry.phasesCompleted === "number" &&
    typeof entry.plan === "object" &&
    entry.plan !== null
  );
};

const notify = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeSessionHistory = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const readSessionHistory = (): CompletedSession[] => {
  if (typeof window === "undefined") return EMPTY_HISTORY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? "";
    if (raw === snapshotKey) return snapshot;
    snapshotKey = raw;
    if (!raw) {
      snapshot = EMPTY_HISTORY;
      return snapshot;
    }
    const parsed: unknown = JSON.parse(raw);
    snapshot = Array.isArray(parsed) ? parsed.filter(isCompletedSession) : EMPTY_HISTORY;
    return snapshot;
  } catch {
    snapshot = EMPTY_HISTORY;
    snapshotKey = null;
    return snapshot;
  }
};

export const getServerSessionHistory = () => EMPTY_HISTORY;

export const prependSession = (entry: CompletedSession): CompletedSession[] => {
  const next = [entry, ...readSessionHistory().filter((item) => item.id !== entry.id)].slice(0, MAX_SESSIONS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  snapshot = next;
  snapshotKey = JSON.stringify(next);
  notify();
  return next;
};

export const formatCompletedAt = (timestamp: number) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
