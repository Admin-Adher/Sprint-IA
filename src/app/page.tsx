"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { catalogPlans, demoGeneratedPlan, flattenPlan, formatDuration } from "@/features/workout-demo/demo-plans";
import type { WorkoutPlan } from "@/features/workout-demo/types";

import styles from "./page.module.css";

type Screen = "landing" | "catalog" | "composer" | "sessions" | "preview" | "player" | "complete";
type GenerationState = "idle" | "loading" | "success" | "error" | "fallback";
type PlayerState = "ready" | "countdown" | "running" | "paused";

const START_COUNTDOWN_SECONDS = 5;

export default function Home() {
  const [screen, setScreen] = useState<Screen>("catalog");
  const [plan, setPlan] = useState<WorkoutPlan>(demoGeneratedPlan);
  const [generation, setGeneration] = useState<GenerationState>("idle");
  const [goal, setGoal] = useState("10 minutes, débutant, sans saut");
  const [formError, setFormError] = useState<string | null>(null);
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const [playerState, setPlayerState] = useState<PlayerState>("ready");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(START_COUNTDOWN_SECONDS);
  const [completed, setCompleted] = useState(0);
  const [actualDuration, setActualDuration] = useState(0);
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
    if (startedAtRef.current) setActualDuration(Math.round((Date.now() - startedAtRef.current - pausedTotalRef.current) / 1000));
    endsAtRef.current = null;
    setScreen("complete");
    speak("Séance terminée. Bravo.");
  }, [speak]);

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
      setPlan({
        ...demoGeneratedPlan,
        fallbackNotice: fallback
          ? "Exemple de secours - IA indisponible. Le parcours reste lançable."
          : "Mode démonstration local - API de génération à connecter.",
      });
      setGeneration(fallback ? "fallback" : "success");
      setScreen("preview");
    }, 680);
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
    setGoal("10 minutes, débutant, sans saut");
    setFormError(null);
    setScreen("catalog");
  };

  const stopSession = () => {
    endsAtRef.current = null;
    window.speechSynthesis?.cancel();
    setPlayerState("ready");
    setScreen("preview");
  };

  if (screen === "player" && phase) {
    const progress = Math.round((completed / phases.length) * 100);
    return <main className={`${styles.playerPage} ${isWork ? styles.work : styles.recovery}`}>
      <header className={styles.playerHeader}><button onClick={stopSession} type="button">← Arrêter</button><strong>{plan.name}</strong><span>{formatDuration(plan.estimatedDurationSeconds)}</span></header>
      <section className={styles.playerContent} aria-live="polite">
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
    </main>;
  }

  if (screen === "complete") return <main className={styles.completePage}><section className={styles.completeCard}><p className={styles.eyebrow}>SÉANCE TERMINÉE</p><h1>Tu l&apos;as menée jusqu&apos;au bout.</h1><div className={styles.completionStats}><div><strong>{formatDuration(actualDuration)}</strong><span>durée active</span></div><div><strong>{phases.length}</strong><span>phases accomplies</span></div></div><button className={styles.primaryButton} onClick={startSession} type="button">Relancer la séance</button><button className={styles.secondaryButton} onClick={reset} type="button">Retour au catalogue</button></section></main>;

  if (screen === "preview") return <main className={styles.appShell}>
    <header className={styles.topBar}><button className={styles.brandButton} onClick={reset} type="button"><span>JH</span> Just Do HIIT</button><button className={styles.resetButton} onClick={reset} type="button">Réinitialiser la démo</button></header>
    <section className={styles.previewLayout}><div className={styles.previewIntro}><button className={styles.backButton} onClick={() => setScreen("catalog")} type="button">← Catalogue</button><p className={styles.eyebrow}>PLAN DE DÉMONSTRATION</p><h1>{plan.name}</h1><p>{plan.level === "beginner" ? "Débutant" : "Intermédiaire"} · {formatDuration(plan.estimatedDurationSeconds)} · sans matériel</p>{plan.fallbackNotice && <p className={generation === "fallback" ? styles.fallbackNotice : styles.successNotice} role="status">{generation === "fallback" ? plan.fallbackNotice : "Séance structurée prête à lancer — mode démo local."}</p>}</div><aside className={styles.launchPanel}><span>PRÊT À COACHER</span><strong>{formatDuration(plan.estimatedDurationSeconds)}</strong><p>Départ dans 5 secondes. La voix annoncera chaque phase.</p><button className={styles.primaryButton} onClick={startSession} type="button">Lancer les mains libres</button><small>{voiceAvailable === false ? "Voix indisponible : le chrono continuera sans annonce." : "La voix accompagne le chrono, elle ne le pilote jamais."}</small></aside></section>
    <section className={styles.structureSection}><div className={styles.sectionHeading}><span>STRUCTURE COMPLÈTE</span><p>La durée est calculée depuis les phases.</p></div>{plan.blocks.map((block) => <article className={styles.blockCard} key={block.id}><header><strong>{block.label}</strong><span>{block.rounds} {block.rounds > 1 ? "tours" : "tour"}</span></header>{block.phases.map((item) => <div className={styles.phaseRow} key={item.id}><span className={styles[item.kind]}>{item.kind === "work" ? "Effort" : item.kind === "rest" ? "Repos" : item.kind === "warmup" ? "Échauffement" : "Retour"}</span><strong>{item.exercise}</strong><em>{formatDuration(item.durationSeconds)}</em></div>)}</article>)}</section>
  </main>;

  if (screen === "catalog") return <main className={styles.dashboard}>
    <aside className={styles.sideMenu}>
      <button className={styles.dashboardBrand} onClick={() => setScreen("catalog")} type="button"><span>JH</span> Just Do HIIT</button>
      <nav aria-label="Menu de l'application" className={styles.sideNav}>
        <button className={styles.activeNav} onClick={() => setScreen("catalog")} type="button"><span>01</span> Aujourd&apos;hui</button>
        <button onClick={() => setScreen("composer")} type="button"><span>02</span> Composer</button>
        <button onClick={() => setScreen("sessions")} type="button"><span>03</span> Séances</button>
      </nav>
      <div className={styles.sideNote}><span>MODE TERRAIN</span><p>Le chrono garde l&apos;heure réelle, même quand l&apos;écran n&apos;est plus devant toi.</p></div>
    </aside>
    <section className={styles.dashboardContent}>
      <header className={styles.dashboardHeader}><div><p>DIMANCHE · 24 AOÛT</p><h1>Prêt à coacher, Miguel ?</h1></div><button className={styles.profileButton} aria-label="Profil de Miguel" type="button">M</button></header>
      <section className={styles.todayCard} aria-labelledby="today-heading"><div className={styles.todayEyebrow}><span>RECOMMANDÉE POUR MAINTENANT</span><strong>10:00</strong></div><div className={styles.todayMain}><div><p className={styles.eyebrow}>SANS SAUT · DÉBUTANT</p><h2 id="today-heading">Sprint Parc</h2><p>Un circuit doux, pensé pour échauffer le groupe sans interrompre le rythme.</p></div><button className={styles.launchToday} onClick={() => { setPlan(catalogPlans[1]); setGeneration("idle"); setScreen("preview"); }} type="button">Lancer <span>→</span></button></div><div className={styles.todayPhases}><span>Marche active</span><i /><span>Squats</span><i /><span>Fentes</span><i /><span>Respiration</span></div></section>
      <section className={styles.terrainBrief} aria-label="Briefing terrain de la séance"><div className={styles.terrainIntro}><p>BRIEFING TERRAIN</p><strong>Tout est prêt.</strong></div><dl><div><dt>DÉPART</dt><dd>5 s</dd><small>pour poser le téléphone</small></div><div><dt>PARCOURS</dt><dd>18 phases</dd><small>mises en route incluses</small></div><div><dt>COACHING</dt><dd>À la voix</dd><small>consignes + prochain exercice</small></div></dl></section>
    </section>
    <nav className={styles.bottomMenu} aria-label="Navigation mobile"><button className={styles.activeNav} onClick={() => setScreen("catalog")} type="button"><span>●</span> Aujourd&apos;hui</button><button onClick={() => setScreen("composer")} type="button"><span>＋</span> Composer</button><button onClick={() => setScreen("sessions")} type="button"><span>□</span> Séances</button></nav>
  </main>;

  if (screen === "composer") return <main className={styles.workspacePage}>
    <header className={styles.workspaceHeader}><button className={styles.dashboardBrand} onClick={() => setScreen("catalog")} type="button"><span>JH</span> Just Do HIIT</button><button className={styles.backButton} onClick={() => setScreen("catalog")} type="button">← Aujourd&apos;hui</button></header>
    <section className={styles.workspaceContent}><p className={styles.eyebrow}>COMPOSER AVEC L&apos;IA</p><h1>Une contrainte suffit.</h1><p className={styles.workspaceLead}>Décris le contexte : la séance sera structurée et lisible avant le départ.</p><div className={styles.composerWorkspace}><label htmlFor="workout-goal">Objectif<textarea aria-describedby="goal-help" id="workout-goal" onChange={(event) => { setGoal(event.target.value); if (formError) setFormError(null); }} placeholder="Ex. 10 min, débutant, sans saut" rows={4} value={goal} /></label><p className={styles.fieldHint} id="goal-help">Durée, niveau et contrainte : une phrase suffit.</p><div className={styles.quickChips}><button onClick={() => setGoal("10 minutes, débutant, sans saut")} type="button">10 min</button><button onClick={() => setGoal("10 minutes, débutant")} type="button">Débutant</button><button onClick={() => setGoal("10 minutes, débutant, sans saut")} type="button">Sans saut</button></div>{!goal.trim() && !formError && <p className={styles.emptyNotice} role="status">Ajoute une contrainte pour construire une séance adaptée.</p>}{formError && <div className={styles.errorNotice} id="goal-error" role="alert"><strong>Impossible de composer.</strong><span>{formError}</span><button onClick={() => { setGoal("10 minutes, débutant, sans saut"); setFormError(null); }} type="button">Reprendre l&apos;exemple</button></div>}{generation === "loading" && <div className={styles.loadingNotice} aria-live="polite"><span aria-hidden="true" /><div><strong>Composition en cours</strong><p>Nous structurons les phases, les tours et les durées.</p></div></div>}<button className={styles.primaryButton} disabled={generation === "loading"} onClick={() => generatePlan()} type="button">{generation === "loading" ? "Composition…" : "Composer la séance"}</button><button className={styles.demoFailure} onClick={() => generatePlan(true)} type="button">Utiliser l&apos;exemple de secours</button></div></section>
  </main>;

  if (screen === "sessions") return <main className={styles.workspacePage}>
    <header className={styles.workspaceHeader}><button className={styles.dashboardBrand} onClick={() => setScreen("catalog")} type="button"><span>JH</span> Just Do HIIT</button><button className={styles.backButton} onClick={() => setScreen("catalog")} type="button">← Aujourd&apos;hui</button></header>
    <section className={styles.workspaceContent}><div className={styles.workspaceTitle}><div><p className={styles.eyebrow}>BIBLIOTHÈQUE</p><h1>Choisir une séance prête</h1></div><button onClick={() => generatePlan(true)} type="button">Tester le fallback</button></div><div className={styles.dashboardCards}>{catalogPlans.map((item, index) => <article className={styles.dashboardCard} key={item.id}><span>0{index + 1}</span><p>{item.level === "beginner" ? "DÉBUTANT" : "INTERMÉDIAIRE"}</p><h3>{item.name}</h3><div><strong>{formatDuration(item.estimatedDurationSeconds)}</strong><small>{flattenPlan(item).length} phases</small></div><button onClick={() => { setPlan(item); setGeneration("idle"); setScreen("preview"); }} type="button">Voir le plan <b>→</b></button></article>)}</div></section>
  </main>;

  if (screen === "landing") return <main className={styles.landingPage}>
    <header className={styles.landingNav}>
      <button className={styles.brandButton} onClick={() => setScreen("landing")} type="button"><span>JH</span> Just Do HIIT</button>
      <nav aria-label="Navigation principale"><a href="#pourquoi">Pourquoi Just Do HIIT</a><a href="#rituel">Le rituel</a></nav>
      <button className={styles.navCta} onClick={() => setScreen("catalog")} type="button">Voir les séances <span>→</span></button>
    </header>
    <section className={styles.landingHero}>
      <div className={styles.landingCopy}>
        <p className={styles.eyebrow}>LE COACH NE REGARDE PAS SON TÉLÉPHONE</p>
        <h1>Le HIIT qui <em>coach</em> à ta place.</h1>
        <p>Compose une séance structurée, pose le téléphone au sol et laisse une voix claire guider chaque effort. Toi, tu regardes ton groupe.</p>
        <div className={styles.heroActions}><button className={styles.landingPrimary} onClick={() => setScreen("catalog")} type="button">Composer une séance <span>→</span></button><button className={styles.landingTextButton} onClick={() => { setPlan(catalogPlans[0]); setScreen("preview"); }} type="button">Lancer une Tabata 4 min</button></div>
        <div className={styles.heroProof}><span>01</span><p>Une séance annoncée à 4 min dure 4 min.<br /><strong>Précision pensée pour le terrain.</strong></p></div>
      </div>
      <div className={styles.coachPanel} aria-label="Aperçu du lecteur de séance">
        <div className={styles.coachPanelTop}><span>EN DIRECT</span><strong>SPRINT PARC</strong><i>10:00</i></div>
        <div className={styles.coachTimer}>00:45</div>
        <div className={styles.coachExercise}><span>EFFORT · TOUR 2/4</span><strong>Squats contrôlés</strong><p>Hanches en arrière, genoux dans l&apos;axe.</p></div>
        <div className={styles.coachNext}><span>ENSUITE</span><strong>Fentes arrière</strong></div>
        <div className={styles.coachProgress}><span /></div>
      </div>
    </section>
    <section className={styles.reasonSection} id="pourquoi">
      <p className={styles.eyebrow}>UN OUTIL POUR LE VRAI TERRAIN</p>
      <div className={styles.reasonGrid}><h2>À bout de souffle, personne ne devrait devoir déchiffrer une interface.</h2><div><p>Just Do HIIT remplace le réflexe « je regarde mon écran » par des signaux simples : la bonne consigne, au bon moment, avec un chrono qui ne dérive pas.</p><button className={styles.inlineLink} onClick={() => setScreen("catalog")} type="button">Découvrir le catalogue <span>→</span></button></div></div>
    </section>
    <section className={styles.ritualSection} id="rituel">
      <div className={styles.sectionHeading}><span>LE RITUEL JUST DO HIIT</span><p>Trois gestes. Toute la séance.</p></div>
      <div className={styles.ritualGrid}><article><span>01</span><h3>Décris ton contexte</h3><p>Durée, niveau, contrainte : « 10 min, sans saut » suffit.</p></article><article><span>02</span><h3>Lis avant d&apos;agir</h3><p>Chaque tour, phase et durée restent visibles avant le départ.</p></article><article><span>03</span><h3>Coach sans écran</h3><p>Le téléphone guide le groupe pendant que toi, tu restes présent.</p></article></div>
    </section>
    <section className={styles.landingFinal}><div><p className={styles.eyebrow}>PRÊT POUR LE PARC</p><h2>La prochaine séance commence en un clic.</h2></div><button className={styles.landingPrimary} onClick={() => setScreen("catalog")} type="button">Choisir une séance <span>→</span></button></section>
  </main>;

  return <main className={styles.appShell}>
    <header className={styles.topBar}><div className={styles.brand}><span>JH</span> Just Do HIIT</div><p>Le chrono qui te laisse coacher.</p></header>
    <section className={styles.hero}><div><p className={styles.eyebrow}>COACH SANS ÉCRAN</p><h1>Compose. Pose le téléphone. <em>Coach.</em></h1><p className={styles.heroCopy}>Une séance structurée, un chrono juste et les annonces dont ton groupe a besoin avant même de regarder l&apos;écran.</p></div><div className={styles.composerCard}><div className={styles.composerHeading}><span>COMPOSER AVEC L&apos;IA</span><small>Démo structurée</small></div><label>Objectif<textarea defaultValue="Faire une séance cardio douce dans un parc" rows={2} /></label><div className={styles.fieldGrid}><label>Durée<select defaultValue="10"><option>4</option><option>10</option><option>20</option></select></label><label>Niveau<select defaultValue="Débutant"><option>Débutant</option><option>Intermédiaire</option></select></label></div><div className={styles.constraintRow}><span>Contrainte</span><strong>Sans saut</strong></div><button className={styles.primaryButton} disabled={generation === "loading"} onClick={() => generatePlan()} type="button">{generation === "loading" ? "Composition en cours…" : "Composer ma séance"}</button><button className={styles.demoFailure} onClick={() => generatePlan(true)} type="button">Tester le fallback de démo</button></div></section>
    <section className={styles.catalogSection}><div className={styles.sectionHeading}><span>SÉANCES PRÊTES À LANCER</span><p>Trois formats, zéro matériel.</p></div><div className={styles.catalogGrid}>{catalogPlans.map((item, index) => <article className={styles.catalogCard} key={item.id}><div className={styles.cardNumber}>0{index + 1}</div><p>{item.level === "beginner" ? "DÉBUTANT" : "INTERMÉDIAIRE"}</p><h2>{item.name}</h2><span>{formatDuration(item.estimatedDurationSeconds)} · {flattenPlan(item).length} phases</span><button onClick={() => { setPlan(item); setGeneration("idle"); setScreen("preview"); }} type="button">Voir la séance <b>→</b></button></article>)}</div></section>
  </main>;
}
