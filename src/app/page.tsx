"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { AppShell } from "@/features/workout-demo/AppShell";
import { catalogPlans, demoGeneratedPlan, flattenPlan, formatDuration } from "@/features/workout-demo/demo-plans";
import {
  formatCompletedAt,
  getServerSessionHistory,
  prependSession,
  readSessionHistory,
  subscribeSessionHistory,
} from "@/features/workout-demo/session-history";
import type { WorkoutPlan } from "@/features/workout-demo/types";

import styles from "./page.module.css";

type Screen = "landing" | "catalog" | "composer" | "sessions" | "preview" | "player" | "complete";
type GenerationState = "idle" | "loading" | "success" | "error" | "fallback";
type PlayerState = "ready" | "countdown" | "running" | "paused";
type ComposerLevel = "beginner" | "intermediate";

const START_COUNTDOWN_SECONDS = 5;
const COMPOSER_CONSTRAINTS = ["sans saut", "silencieux", "petit espace"] as const;
const COMPOSER_GOALS = [
  "Me remettre en mouvement en douceur",
  "Me défouler et retrouver de l’énergie",
  "Renforcer tout le corps sans impact",
] as const;

const levelLabel = (level: WorkoutPlan["level"]) => (level === "beginner" ? "Débutant" : "Intermédiaire");

export default function Home() {
  const [screen, setScreen] = useState<Screen>("catalog");
  const [plan, setPlan] = useState<WorkoutPlan>(demoGeneratedPlan);
  const [generation, setGeneration] = useState<GenerationState>("idle");
  const [durationMinutes, setDurationMinutes] = useState<4 | 10 | 20>(10);
  const [composerLevel, setComposerLevel] = useState<ComposerLevel>("beginner");
  const [constraints, setConstraints] = useState<string[]>(["sans saut"]);
  const [goal, setGoal] = useState("Me remettre en mouvement en douceur");
  const [formError, setFormError] = useState<string | null>(null);
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const [playerState, setPlayerState] = useState<PlayerState>("ready");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(START_COUNTDOWN_SECONDS);
  const [completed, setCompleted] = useState(0);
  const [actualDuration, setActualDuration] = useState(0);
  const history = useSyncExternalStore(subscribeSessionHistory, readSessionHistory, getServerSessionHistory);
  const endsAtRef = useRef<number | null>(null);
  const pauseRemainingRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const pausedTotalRef = useRef(0);

  const phases = useMemo(() => flattenPlan(plan), [plan]);
  const phase = phases[phaseIndex] ?? phases[0];
  const nextPhase = phases[phaseIndex + 1];
  const isWork = phase?.kind === "work";

  const speak = useCallback((message: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "fr-FR";
    utterance.rate = 1.08;
    window.speechSynthesis.speak(utterance);
  }, []);

  const startPhase = useCallback((nextIndex: number, override?: number) => {
    const next = phases[nextIndex];
    if (!next) return;
    const duration = override ?? next.durationSeconds;
    setPhaseIndex(nextIndex);
    setRemaining(Math.ceil(duration));
    endsAtRef.current = Date.now() + duration * 1000;
    setPlayerState("running");
    const upcoming = phases[nextIndex + 1];
    speak(`${next.exercise}, ${next.durationSeconds} secondes.${next.kind === "rest" && upcoming ? ` Prochain : ${upcoming.exercise}.` : ""}`);
  }, [phases, speak]);

  const finishSession = useCallback(() => {
    const duration = startedAtRef.current
      ? Math.round((Date.now() - startedAtRef.current - pausedTotalRef.current) / 1000)
      : 0;
    setActualDuration(duration);
    endsAtRef.current = null;
    prependSession({
      id: `${plan.id}-${Date.now()}`,
      completedAt: Date.now(),
      actualDurationSeconds: duration,
      phasesCompleted: phases.length,
      plan,
    });
    setScreen("complete");
    speak("Séance terminée. Bravo.");
  }, [phases.length, plan, speak]);

  useEffect(() => {
    if ((playerState !== "countdown" && playerState !== "running") || !endsAtRef.current) return;
    const tick = () => {
      const end = endsAtRef.current;
      if (!end) return;
      const seconds = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setRemaining(seconds);
      if (Date.now() < end) return;
      if (playerState === "countdown") {
        startedAtRef.current = Date.now();
        pausedTotalRef.current = 0;
        startPhase(0);
        return;
      }
      const nextIndex = phaseIndex + 1;
      setCompleted(nextIndex);
      if (nextIndex >= phases.length) finishSession();
      else startPhase(nextIndex);
    };
    tick();
    const interval = window.setInterval(tick, 200);
    return () => window.clearInterval(interval);
  }, [finishSession, phaseIndex, phases.length, playerState, startPhase]);

  const generatePlan = (fallback = false) => {
    if (!fallback && !goal.trim()) {
      setGeneration("error");
      setFormError("Décris au moins la durée, le niveau ou une contrainte pour composer la séance.");
      return;
    }
    setFormError(null);
    setGeneration("loading");
    window.setTimeout(() => {
      const selectedFixture = durationMinutes === 4
        ? catalogPlans[0]
        : durationMinutes === 20
          ? catalogPlans[2]
          : demoGeneratedPlan;
      setPlan({
        ...(fallback ? demoGeneratedPlan : selectedFixture),
        id: fallback ? demoGeneratedPlan.id : `demo-${durationMinutes}-${composerLevel}`,
        name: fallback ? demoGeneratedPlan.name : `Séance personnalisée · ${durationMinutes} min`,
        level: fallback ? demoGeneratedPlan.level : composerLevel,
        fallbackNotice: fallback
          ? "Exemple de secours - IA indisponible. Le parcours reste lançable."
          : "Plan préparé depuis tes choix — aperçu complet avant lancement.",
      });
      setGeneration(fallback ? "fallback" : "success");
      setScreen("preview");
    }, 680);
  };

  const toggleConstraint = (constraint: string) => {
    setConstraints((current) => {
      if (current.includes(constraint)) return current.filter((item) => item !== constraint);
      if (current.length < 2) return [...current, constraint];
      return [...current.slice(1), constraint];
    });
  };

  const openPlan = (nextPlan: WorkoutPlan) => {
    setPlan(nextPlan);
    setGeneration("idle");
    setScreen("preview");
  };

  const startSession = () => {
    setVoiceAvailable("speechSynthesis" in window && typeof window.SpeechSynthesisUtterance !== "undefined");
    setPhaseIndex(0);
    setCompleted(0);
    setActualDuration(0);
    pausedTotalRef.current = 0;
    pausedAtRef.current = null;
    endsAtRef.current = Date.now() + START_COUNTDOWN_SECONDS * 1000;
    setRemaining(START_COUNTDOWN_SECONDS);
    setPlayerState("countdown");
    setScreen("player");
    speak("Préparez-vous. La séance commence dans 5 secondes.");
  };

  const pause = () => {
    if (playerState !== "running" || !endsAtRef.current) return;
    pauseRemainingRef.current = Math.max(0, (endsAtRef.current - Date.now()) / 1000);
    setRemaining(Math.ceil(pauseRemainingRef.current));
    endsAtRef.current = null;
    pausedAtRef.current = Date.now();
    setPlayerState("paused");
    window.speechSynthesis?.cancel();
  };

  const resume = () => {
    if (playerState !== "paused") return;
    if (pausedAtRef.current) pausedTotalRef.current += Date.now() - pausedAtRef.current;
    pausedAtRef.current = null;
    startPhase(phaseIndex, pauseRemainingRef.current);
  };

  const move = (direction: -1 | 1) => {
    const nextIndex = Math.min(Math.max(phaseIndex + direction, 0), phases.length - 1);
    if (nextIndex !== phaseIndex) startPhase(nextIndex);
  };

  const reset = () => {
    endsAtRef.current = null;
    window.speechSynthesis?.cancel();
    setPlayerState("ready");
    setPlan(demoGeneratedPlan);
    setGeneration("idle");
    setDurationMinutes(10);
    setComposerLevel("beginner");
    setConstraints(["sans saut"]);
    setGoal("Me remettre en mouvement en douceur");
    setFormError(null);
    setScreen("catalog");
  };

  const goToHub = () => {
    endsAtRef.current = null;
    window.speechSynthesis?.cancel();
    setPlayerState("ready");
    setScreen("sessions");
  };

  const stopSession = () => {
    endsAtRef.current = null;
    window.speechSynthesis?.cancel();
    setPlayerState("ready");
    setScreen("preview");
  };

  if (screen === "player") {
    if (!phase) return null;
    const progress = Math.round((completed / phases.length) * 100);
    return (
      <main className={`${styles.playerPage} ${isWork ? styles.work : styles.recovery}`}>
        <header className={styles.playerHeader}>
          <button onClick={stopSession} type="button">← Arrêter</button>
          <strong>{plan.name}</strong>
          <span>{formatDuration(plan.estimatedDurationSeconds)}</span>
        </header>
        <section aria-live="polite" className={styles.playerContent}>
          <span className={styles.phasePill}>{playerState === "countdown" ? "DÉPART DANS" : isWork ? "EFFORT" : "RÉCUPÉRATION"}</span>
          <p>{phase.blockLabel} · Tour {phase.round}/{phase.rounds}</p>
          <div className={styles.timer}>{formatDuration(remaining)}</div>
          <h1>{playerState === "countdown" ? "Pose ton téléphone" : phase.exercise}</h1>
          <p className={styles.instruction}>{playerState === "countdown" ? "Le premier exercice sera annoncé à voix haute." : phase.instruction}</p>
          <div className={styles.nextCard}><span>ENSUITE</span><strong>{nextPhase?.exercise ?? "Fin de séance"}</strong></div>
          <div className={styles.progressTrack}><span style={{ width: `${progress}%` }} /></div>
          <div className={styles.playerControls}>
            <button className={styles.circleButton} disabled={phaseIndex === 0 || playerState === "countdown"} onClick={() => move(-1)} type="button">‹</button>
            <button className={styles.pauseButton} disabled={playerState === "countdown"} onClick={playerState === "paused" ? resume : pause} type="button">{playerState === "paused" ? "Reprendre" : "Pause"}</button>
            <button className={styles.circleButton} disabled={phaseIndex === phases.length - 1 || playerState === "countdown"} onClick={() => move(1)} type="button">›</button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "complete") {
    return (
      <main className={styles.completePage}>
        <section className={styles.completeCard}>
          <p className={styles.eyebrow}>SÉANCE TERMINÉE</p>
          <h1>Tu l&apos;as menée jusqu&apos;au bout.</h1>
          <div className={styles.completionStats}>
            <div><strong>{formatDuration(actualDuration)}</strong><span>durée active</span></div>
            <div><strong>{phases.length}</strong><span>phases accomplies</span></div>
          </div>
          <button className={styles.primaryButton} onClick={startSession} type="button">Relancer la séance</button>
          <button className={styles.secondaryButton} onClick={goToHub} type="button">Retour aux séances</button>
        </section>
      </main>
    );
  }

  if (screen === "preview") return <main className={styles.appShell}>
    <header className={styles.topBar}><button className={styles.brandButton} onClick={reset} type="button"><span>JH</span> Just Do HIIT</button><button className={styles.resetButton} onClick={reset} type="button">Réinitialiser la démo</button></header>
    <section className={styles.previewLayout}><div className={styles.previewIntro}><button className={styles.backButton} onClick={() => setScreen(generation === "idle" ? "catalog" : "composer")} type="button">{generation === "idle" ? "← Aujourd’hui" : "← Modifier mes choix"}</button><p className={styles.eyebrow}>{generation === "idle" ? "SÉANCE DU JOUR · VÉRIFIER LE PLAN" : "CRÉATION SUR MESURE · VÉRIFIER LE PLAN"}</p><h1>{plan.name}</h1><p>{plan.level === "beginner" ? "Débutant" : "Intermédiaire"} · {formatDuration(plan.estimatedDurationSeconds)} · sans matériel</p>{plan.fallbackNotice && <p className={generation === "fallback" ? styles.fallbackNotice : styles.successNotice} role="status">{generation === "fallback" ? plan.fallbackNotice : "Plan vérifié : tu peux maintenant commencer ta séance."}</p>}</div><aside className={styles.launchPanel}><span>ÉTAPE SUIVANTE</span><strong>{formatDuration(plan.estimatedDurationSeconds)}</strong><p>Départ dans 5 secondes, le temps de poser ton téléphone.</p><button className={styles.primaryButton} onClick={startSession} type="button">Commencer ma séance</button><small>{voiceAvailable === false ? "Voix indisponible : le chrono continuera sans annonce." : "La voix te guide sans jamais ralentir le chrono."}</small></aside></section>
    <section className={styles.structureSection}><div className={styles.sectionHeading}><span>STRUCTURE COMPLÈTE</span><p>La durée est calculée depuis les phases.</p></div>{plan.blocks.map((block) => <article className={styles.blockCard} key={block.id}><header><strong>{block.label}</strong><span>{block.rounds} {block.rounds > 1 ? "tours" : "tour"}</span></header>{block.phases.map((item) => <div className={styles.phaseRow} key={item.id}><span className={styles[item.kind]}>{item.kind === "work" ? "Effort" : item.kind === "rest" ? "Repos" : item.kind === "warmup" ? "Échauffement" : "Retour"}</span><strong>{item.exercise}</strong><em>{formatDuration(item.durationSeconds)}</em></div>)}</article>)}</section>
  </main>;

  if (screen === "catalog") return <main className={styles.dashboard}>
    <aside className={styles.sideMenu}>
      <button className={styles.dashboardBrand} onClick={() => setScreen("catalog")} type="button"><span>JH</span> Just Do HIIT</button>
      <nav aria-label="Menu de l'application" className={styles.sideNav}>
        <button className={styles.activeNav} onClick={() => setScreen("catalog")} type="button"><span>01</span> Aujourd&apos;hui</button>
        <button onClick={() => setScreen("composer")} type="button"><span>02</span> Créer</button>
        <button onClick={() => setScreen("sessions")} type="button"><span>03</span> Séances</button>
      </nav>
      <div className={styles.sideNote}><span>MODE MAINS LIBRES</span><p>Le chrono et la voix te guident, même quand tu ne regardes plus l&apos;écran.</p></div>
    </aside>
    <section className={styles.dashboardContent}>
      <header className={styles.dashboardHeader}><div><p>DIMANCHE · 24 AOÛT</p><h1>Prêt à bouger aujourd&apos;hui ?</h1></div><button className={styles.profileButton} aria-label="Ton profil" type="button">J</button></header>
      <section className={styles.todayCard} aria-labelledby="today-heading"><div className={styles.todayEyebrow}><span>TA SÉANCE DU JOUR · DÉJÀ PRÊTE</span><strong>10:00</strong></div><div className={styles.todayMain}><div><p className={styles.eyebrow}>SANS SAUT · DÉBUTANT</p><h2 id="today-heading">Élan quotidien</h2><p>Tu ne veux pas réfléchir ? Adopte cette séance telle quelle, puis vérifie-la avant de commencer.</p></div><button className={styles.launchToday} onClick={() => { setPlan(catalogPlans[1]); setGeneration("idle"); setScreen("preview"); }} type="button">Choisir cette séance <span>→</span></button></div><div className={styles.todayPhases}><span>Marche active</span><i /><span>Squats</span><i /><span>Fentes</span><i /><span>Respiration</span></div></section>
      <section className={styles.terrainBrief} aria-label="Repères avant la séance"><div className={styles.terrainIntro}><p>AVANT DE COMMENCER</p><strong>Tout est prêt.</strong></div><dl><div><dt>DÉPART</dt><dd>5 s</dd><small>pour poser ton téléphone</small></div><div><dt>RYTHME</dt><dd>18 phases</dd><small>effort et repos alternés</small></div><div><dt>GUIDAGE</dt><dd>À la voix</dd><small>reste concentré sur tes mouvements</small></div></dl></section>
    </section>
    <nav className={styles.bottomMenu} aria-label="Navigation mobile"><button className={styles.activeNav} onClick={() => setScreen("catalog")} type="button"><span>●</span> Aujourd&apos;hui</button><button onClick={() => setScreen("composer")} type="button"><span>＋</span> Créer</button><button onClick={() => setScreen("sessions")} type="button"><span>□</span> Séances</button></nav>
  </main>;

  if (screen === "composer") {
    const selectedLevelLabel = composerLevel === "beginner" ? "Débutant" : "Intermédiaire";

    return (
      <AppShell active="composer" onNavigate={setScreen}>
        <section className={styles.composerPage}>
          <header className={styles.composerHeading}>
            <div>
              <p className={styles.eyebrow}>ÉTAPE 1 SUR 2 · PERSONNALISER</p>
              <h1>Ta séance, selon ton moment.</h1>
              <p>Choisis ton temps, ton niveau et ce dont tu as besoin aujourd’hui. L’application prépare ensuite un plan complet à vérifier avant de démarrer.</p>
            </div>
            <div className={styles.funnelHint} aria-label="Tunnel de création">
              <span aria-current="step">01 <b>Créer</b></span>
              <i aria-hidden="true" />
              <span>02 <b>Vérifier le plan</b></span>
            </div>
          </header>

          <div className={styles.composerGrid}>
            <div className={styles.choiceStack}>
              <fieldset className={styles.choiceGroup}>
                <legend><span>01</span> Combien de temps ?</legend>
                <div className={styles.durationChoices}>
                  {([
                    { minutes: 4, label: "Express", detail: "Tabata net" },
                    { minutes: 10, label: "Équilibre", detail: "Facile à caser" },
                    { minutes: 20, label: "Complet", detail: "Échauffement inclus" },
                  ] as const).map((item) => (
                    <button aria-pressed={durationMinutes === item.minutes} className={durationMinutes === item.minutes ? styles.selectedChoice : undefined} key={item.minutes} onClick={() => setDurationMinutes(item.minutes)} type="button">
                      <strong>{item.minutes}<small>min</small></strong>
                      <span>{item.label}</span>
                      <em>{item.detail}</em>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className={styles.choiceGroup}>
                <legend><span>02</span> Pour quel niveau ?</legend>
                <div className={styles.levelChoices}>
                  <button aria-pressed={composerLevel === "beginner"} className={composerLevel === "beginner" ? styles.selectedChoice : undefined} onClick={() => setComposerLevel("beginner")} type="button"><strong>Débutant</strong><span>Accessible et très guidé</span></button>
                  <button aria-pressed={composerLevel === "intermediate"} className={composerLevel === "intermediate" ? styles.selectedChoice : undefined} onClick={() => setComposerLevel("intermediate")} type="button"><strong>Intermédiaire</strong><span>Plus de cadence et d’intensité</span></button>
                </div>
              </fieldset>

              <fieldset className={styles.choiceGroup}>
                <legend><span>03</span> Quelles contraintes ? <small>2 maximum</small></legend>
                <div className={styles.constraintChoices}>
                  {COMPOSER_CONSTRAINTS.map((constraint) => (
                    <button aria-pressed={constraints.includes(constraint)} className={constraints.includes(constraint) ? styles.selectedConstraint : undefined} key={constraint} onClick={() => toggleConstraint(constraint)} type="button">{constraint}</button>
                  ))}
                </div>
              </fieldset>

              <fieldset className={styles.choiceGroup}>
                <legend><span>04</span> Quel objectif aujourd’hui ?</legend>
                <div className={styles.goalChoices}>
                  {COMPOSER_GOALS.map((item) => (
                    <button aria-pressed={goal === item} className={goal === item ? styles.selectedGoal : undefined} key={item} onClick={() => { setGoal(item); setFormError(null); }} type="button">{item}</button>
                  ))}
                </div>
                <label className={styles.customGoal} htmlFor="workout-goal">Ou précise ton contexte
                  <textarea aria-describedby="goal-help" id="workout-goal" onChange={(event) => { setGoal(event.target.value); if (formError) setFormError(null); }} placeholder="Ex. après le travail, reprise douce, appartement…" rows={2} value={goal} />
                </label>
                <p className={styles.fieldHint} id="goal-help">Ton contexte précise l’intention et l’intensité de ta séance.</p>
              </fieldset>

              {formError && <div className={styles.errorNotice} role="alert"><strong>Impossible de préparer le plan.</strong><span>{formError}</span><button onClick={() => { setGoal(COMPOSER_GOALS[0]); setFormError(null); }} type="button">Reprendre l’exemple</button></div>}
            </div>

            <aside className={styles.composerSummary} aria-live="polite">
              <p>TA CONFIGURATION</p>
              <strong>{durationMinutes}<small> min</small></strong>
              <div className={styles.summaryTags}><span>{selectedLevelLabel}</span>{constraints.map((constraint) => <span key={constraint}>{constraint}</span>)}</div>
              <h2>{goal || "Précise ton objectif"}</h2>
              <p className={styles.summaryHint}>Prochaine étape : vérifier les exercices, les tours et chaque durée avant de lancer.</p>
              {generation === "loading" && <div className={styles.loadingNotice}><span aria-hidden="true" /><div><strong>Création du plan</strong><p>Structure et durées en préparation.</p></div></div>}
              <button className={styles.primaryButton} disabled={generation === "loading"} onClick={() => generatePlan()} type="button">{generation === "loading" ? "Création de ta séance…" : "Créer ma séance sur mesure"}</button>
              <button className={styles.demoFailure} onClick={() => generatePlan(true)} type="button">Utiliser le plan de secours</button>
            </aside>
          </div>
        </section>
      </AppShell>
    );
  }
  if ((screen as Screen) === "preview") {
    return (
      <main className={styles.appShell}>
        <header className={styles.topBar}>
          <button className={styles.brandButton} onClick={reset} type="button"><span>JH</span> Just Do HIIT</button>
          <button className={styles.resetButton} onClick={reset} type="button">Réinitialiser la démo</button>
        </header>
        <section className={styles.previewLayout}>
          <div className={styles.previewIntro}>
            <button className={styles.backButton} onClick={goToHub} type="button">← Séances</button>
            <p className={styles.eyebrow}>TON PLAN PERSONNALISÉ</p>
            <h1>{plan.name}</h1>
            <p>{levelLabel(plan.level)} · {formatDuration(plan.estimatedDurationSeconds)} · sans matériel</p>
            {plan.fallbackNotice && (
              <p className={generation === "fallback" ? styles.fallbackNotice : styles.fixtureNotice}>{plan.fallbackNotice}</p>
            )}
          </div>
          <aside className={styles.launchPanel}>
            <span>PRÊT À BOUGER</span>
            <strong>{formatDuration(plan.estimatedDurationSeconds)}</strong>
            <p>Départ dans 5 secondes, le temps de poser ton téléphone.</p>
            <button className={styles.primaryButton} onClick={startSession} type="button">Commencer ma séance</button>
            <small>La voix te guide sans jamais ralentir le chrono.</small>
          </aside>
        </section>
        <section className={styles.structureSection}>
          <div className={styles.sectionHeading}>
            <span>STRUCTURE COMPLÈTE</span>
            <p>La durée est calculée depuis les phases.</p>
          </div>
          {plan.blocks.map((block) => (
            <article className={styles.blockCard} key={block.id}>
              <header>
                <strong>{block.label}</strong>
                <span>{block.rounds} {block.rounds > 1 ? "tours" : "tour"}</span>
              </header>
              {block.phases.map((item) => (
                <div className={styles.phaseRow} key={item.id}>
                  <span className={styles[item.kind]}>{item.kind === "work" ? "Effort" : item.kind === "rest" ? "Repos" : item.kind === "warmup" ? "Échauffement" : "Retour"}</span>
                  <strong>{item.exercise}</strong>
                  <em>{formatDuration(item.durationSeconds)}</em>
                </div>
              ))}
            </article>
          ))}
        </section>
      </main>
    );
  }

  if ((screen as Screen) === "catalog") {
    return (
      <AppShell active="catalog" onNavigate={setScreen}>
        <header className={styles.dashboardHeader}>
          <div>
            <p>DIMANCHE · 24 AOÛT</p>
            <h1>Prêt à bouger aujourd&apos;hui ?</h1>
          </div>
          <button aria-label="Ton profil" className={styles.profileButton} type="button">J</button>
        </header>
        <section aria-labelledby="today-heading" className={styles.todayCard}>
          <div className={styles.todayEyebrow}>
            <span>RECOMMANDÉE POUR MAINTENANT</span>
            <strong>10:00</strong>
          </div>
          <div className={styles.todayMain}>
            <div>
              <p className={styles.eyebrow}>SANS SAUT · DÉBUTANT</p>
              <h2 id="today-heading">Élan quotidien</h2>
              <p>Une séance douce pour activer tout ton corps sans te mettre dans le rouge.</p>
            </div>
            <button className={styles.launchToday} onClick={() => setScreen("sessions")} type="button">
              Lancer <span>→</span>
            </button>
          </div>
          <div className={styles.todayPhases}>
            <span>Marche active</span><i /><span>Squats</span><i /><span>Fentes</span><i /><span>Respiration</span>
          </div>
        </section>
      </AppShell>
    );
  }

  if ((screen as Screen) === "composer") {
    return (
      <AppShell active="composer" onNavigate={setScreen}>
        <p className={styles.eyebrow}>COMPOSER AVEC L&apos;IA</p>
        <h1>Une contrainte suffit.</h1>
        <p className={styles.workspaceLead}>Décris le contexte : la séance sera structurée et lisible avant le départ.</p>
        <div className={styles.composerWorkspace}>
          <label>
            Objectif
            <textarea defaultValue="10 minutes, débutant, sans saut" rows={4} />
          </label>
          <div className={styles.quickChips}>
            <button type="button">10 min</button>
            <button type="button">Débutant</button>
            <button type="button">Sans saut</button>
          </div>
          <button className={styles.primaryButton} disabled={generation === "loading"} onClick={() => generatePlan()} type="button">
            {generation === "loading" ? "Composition…" : "Composer la séance"}
          </button>
          <button className={styles.demoFailure} onClick={() => generatePlan(true)} type="button">Tester le fallback de démo</button>
        </div>
      </AppShell>
    );
  }

  if (screen === "sessions") {
    return (
      <AppShell active="sessions" onNavigate={setScreen}>
        <div className={styles.hubHeader}>
          <div>
            <p className={styles.eyebrow}>SÉLECTION DE SÉANCE</p>
            <h1>Créer ou lancer une séance</h1>
          </div>
          <button className={styles.newSessionButton} onClick={() => setScreen("composer")} type="button">Nouvelle séance</button>
        </div>
        {history.length === 0 && (
          <p className={styles.hubEmpty}>Pas encore de séance réalisée. Lance une séance prête, ou compose-en une nouvelle.</p>
        )}
        {history.length > 0 && (
          <section className={styles.hubSection}>
            <p className={styles.eyebrow}>DERNIÈRES SÉANCES</p>
            <div className={styles.historyList}>
              {history.map((session) => (
                <article className={styles.historyCard} key={session.id}>
                  <div>
                    <p>{formatCompletedAt(session.completedAt)}</p>
                    <h3>{session.plan.name}</h3>
                    <span>{levelLabel(session.plan.level)} · {formatDuration(session.actualDurationSeconds)} réalisées · {session.phasesCompleted} phases</span>
                  </div>
                  <button onClick={() => openPlan(session.plan)} type="button">Relancer →</button>
                </article>
              ))}
            </div>
          </section>
        )}
        <section className={styles.hubSection}>
          <p className={styles.eyebrow}>SÉANCES PRÊTES</p>
          <div className={styles.dashboardCards}>
            {catalogPlans.map((item, index) => (
              <article className={styles.dashboardCard} key={item.id}>
                <span>0{index + 1}</span>
                <p>{item.level === "beginner" ? "DÉBUTANT" : "INTERMÉDIAIRE"}</p>
                <h3>{item.name}</h3>
                <div>
                  <strong>{formatDuration(item.estimatedDurationSeconds)}</strong>
                  <small>{flattenPlan(item).length} phases</small>
                </div>
                <button onClick={() => openPlan(item)} type="button">Voir le plan <b>→</b></button>
              </article>
            ))}
          </div>
        </section>
      </AppShell>
    );
  }

  if (screen === "landing") {
    return (
      <main className={styles.landingPage}>
        <header className={styles.landingNav}>
          <button className={styles.brandButton} onClick={() => setScreen("landing")} type="button"><span>JH</span> Just Do HIIT</button>
          <nav aria-label="Navigation principale"><a href="#pourquoi">Pourquoi Just Do HIIT</a><a href="#rituel">Le rituel</a></nav>
          <button className={styles.navCta} onClick={() => setScreen("catalog")} type="button">Voir les séances <span>→</span></button>
        </header>
        <section className={styles.landingHero}>
          <div className={styles.landingCopy}>
            <p className={styles.eyebrow}>TA SÉANCE S’ADAPTE À TA JOURNÉE</p>
            <h1>Le HIIT qui te <em>guide</em> vraiment.</h1>
            <p>Choisis le temps dont tu disposes, pose le téléphone et laisse une voix claire guider chaque effort. Tu n’as plus qu’à bouger.</p>
            <div className={styles.heroActions}>
              <button className={styles.landingPrimary} onClick={() => setScreen("sessions")} type="button">Composer une séance <span>→</span></button>
              <button className={styles.landingTextButton} onClick={() => openPlan(catalogPlans[0])} type="button">Lancer une Tabata 4 min</button>
            </div>
            <div className={styles.heroProof}>
              <span>01</span>
              <p>Une séance annoncée à 4 min dure 4 min.<br /><strong>Précision pensée pour ton quotidien.</strong></p>
            </div>
          </div>
          <div aria-label="Aperçu du lecteur de séance" className={styles.coachPanel}>
            <div className={styles.coachPanelTop}><span>EN DIRECT</span><strong>ÉLAN QUOTIDIEN</strong><i>10:00</i></div>
            <div className={styles.coachTimer}>00:45</div>
            <div className={styles.coachExercise}><span>EFFORT · TOUR 2/4</span><strong>Squats contrôlés</strong><p>Hanches en arrière, genoux dans l&apos;axe.</p></div>
            <div className={styles.coachNext}><span>ENSUITE</span><strong>Fentes arrière</strong></div>
            <div className={styles.coachProgress}><span /></div>
          </div>
        </section>
        <section className={styles.reasonSection} id="pourquoi">
          <p className={styles.eyebrow}>UN OUTIL POUR LES VRAIES JOURNÉES</p>
          <div className={styles.reasonGrid}>
            <h2>À bout de souffle, personne ne devrait devoir déchiffrer une interface.</h2>
            <div>
              <p>Just Do HIIT remplace le réflexe « je regarde mon écran » par des signaux simples : la bonne consigne, au bon moment, avec un chrono qui ne dérive pas.</p>
              <button className={styles.inlineLink} onClick={() => setScreen("sessions")} type="button">Découvrir le catalogue <span>→</span></button>
            </div>
          </div>
        </section>
        <section className={styles.ritualSection} id="rituel">
          <div className={styles.sectionHeading}><span>LE RITUEL JUST DO HIIT</span><p>Trois gestes. Toute la séance.</p></div>
          <div className={styles.ritualGrid}>
            <article><span>01</span><h3>Décris ton contexte</h3><p>Durée, niveau, contrainte : « 10 min, sans saut » suffit.</p></article>
            <article><span>02</span><h3>Lis avant d&apos;agir</h3><p>Chaque tour, phase et durée restent visibles avant le départ.</p></article>
            <article><span>03</span><h3>Bouge sans écran</h3><p>Le téléphone te guide pendant que tu restes concentré sur ton mouvement.</p></article>
          </div>
        </section>
        <section className={styles.landingFinal}>
          <div>
            <p className={styles.eyebrow}>PRÊT POUR AUJOURD’HUI</p>
            <h2>La prochaine séance commence en un clic.</h2>
          </div>
          <button className={styles.landingPrimary} onClick={() => setScreen("sessions")} type="button">Choisir une séance <span>→</span></button>
        </section>
      </main>
    );
  }

  const _exhaustive: never = screen;
  return _exhaustive;
}
