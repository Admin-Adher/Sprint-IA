import { formatDuration } from "./demo-plans";
import {
  blockDurationSeconds,
  levelLabel,
  phaseKindLabel,
  summarizePlan,
  workExercises,
} from "./session-plan";
import type { PhaseKind, WorkoutPlan } from "./types";

import styles from "./SessionPlanPage.module.css";

type SessionPlanPageProps = {
  plan: WorkoutPlan;
  generation: "idle" | "loading" | "fallback";
  voiceAvailable?: boolean;
  usingFallback?: boolean;
  onBack: () => void;
  onLaunch: () => void;
};

const SUMMARY_ORDER: PhaseKind[] = ["warmup", "work", "rest", "cooldown"];

const kindClass = (kind: PhaseKind) => {
  switch (kind) {
    case "warmup":
      return styles.warmup;
    case "work":
      return styles.work;
    case "rest":
      return styles.rest;
    case "cooldown":
      return styles.cooldown;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
};

export function SessionPlanPage({
  plan,
  generation,
  voiceAvailable = true,
  usingFallback = false,
  onBack,
  onLaunch,
}: SessionPlanPageProps) {
  const totals = summarizePlan(plan);
  const summary = SUMMARY_ORDER.filter((kind) => totals[kind] > 0);
  const exercises = workExercises(plan);

  return (
    <main className={styles.page}>
      <header className={styles.topBar}>
        <button className={styles.brand} onClick={onBack} type="button">
          <span>JH</span> Just Do HIIT
        </button>
        <button className={styles.backLink} onClick={onBack} type="button">
          ← Séances
        </button>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>PLAN DE SÉANCE</p>
        <h1>{plan.name}</h1>
        <p className={styles.meta}>
          {levelLabel(plan.level)} · {formatDuration(plan.estimatedDurationSeconds)} · sans matériel
        </p>
        {plan.fallbackNotice ? (
          <p className={`${styles.notice} ${generation === "fallback" ? styles.fallbackNotice : styles.fixtureNotice}`}>
            {plan.fallbackNotice}
          </p>
        ) : null}
      </section>

      {exercises.length > 0 ? (
        <div className={styles.program} aria-label="Exercices au programme">
          {exercises.map((name) => (
            <span className={styles.programChip} key={name}>
              {name}
            </span>
          ))}
        </div>
      ) : null}

      <section aria-label="Répartition du temps" className={styles.stats}>
        {summary.map((kind) => (
          <article className={styles.stat} key={kind}>
            <strong>{formatDuration(totals[kind])}</strong>
            <span>{phaseKindLabel(kind)}</span>
          </article>
        ))}
      </section>

      <div className={styles.layout}>
        <section aria-labelledby="structure-heading">
          <div className={styles.structureHeading}>
            <span id="structure-heading">STRUCTURE COMPLÈTE</span>
            <p>Durée calculée depuis les phases, jamais saisie à la main.</p>
          </div>
          {plan.blocks.map((block) => (
            <article className={styles.block} key={block.id}>
              <header className={styles.blockHeader}>
                <strong>{block.label}</strong>
                <span>
                  {block.rounds} {block.rounds > 1 ? "tours" : "tour"} · {formatDuration(blockDurationSeconds(block))}
                </span>
              </header>
              {block.phases.map((phase) => (
                <div className={styles.phase} key={phase.id}>
                  <span className={`${styles.kind} ${kindClass(phase.kind)}`}>{phaseKindLabel(phase.kind)}</span>
                  <div className={styles.phaseBody}>
                    <strong>{phase.exercise}</strong>
                    <p>{phase.instruction}</p>
                  </div>
                  <em className={styles.phaseTime}>{formatDuration(phase.durationSeconds)}</em>
                </div>
              ))}
              {block.rounds > 1 ? (
                <p className={styles.roundsNote}>
                  Ce bloc se répète {block.rounds} fois. Effort et récupération s&apos;enchaînent à chaque tour.
                </p>
              ) : null}
            </article>
          ))}
        </section>

        <aside className={styles.launch}>
          <span>PRÊT À COACHER</span>
          <strong>{formatDuration(plan.estimatedDurationSeconds)}</strong>
          <p>Lis le plan, pose le téléphone, puis appuie sur Lancer.</p>
          <button className={styles.launchButton} onClick={onLaunch} type="button">
            Lancer
          </button>
          <small>
            {!voiceAvailable
              ? "Voix indisponible : le chrono continuera sans annonce."
              : usingFallback
                ? "Voix de secours du navigateur. Départ dans 10 secondes."
                : "Départ dans 10 secondes. La voix annonce chaque phase, elle ne pilote jamais le chrono."}
          </small>
        </aside>
      </div>
    </main>
  );
}
