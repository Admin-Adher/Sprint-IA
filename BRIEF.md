# BRIEF.md

## 0. Consigne brute

- Défi : construire **just-do-hiit**, un chrono d'intervalles que l'on compose,
  lance les mains libres et partage par lien.
- Fenêtre de build : 120 minutes.
- Équipe : Adrien / Codex (front, UI, intégration) + Mathis / Cursor (backend,
  IA).

## 1. Produit en une phrase

Pour toute personne qui veut bouger régulièrement sans passer du temps à
préparer ou surveiller son entraînement, **Just Do HIIT** transforme quelques
choix simples (durée, niveau, contraintes et objectif du jour) en une séance
structurée et guidée à la voix.

## 2. Promesse de démonstration

En moins de 30 secondes, une demande comme « 10 minutes, débutant, sans saut »
devient un plan lisible avec chaque phase, puis un grand chrono qui annonce quoi
faire et ce qui arrive ensuite.

## 3. Utilisateur et contexte

- Utilisateur principal : une personne qui veut s'entraîner seule, chez elle ou
  dehors, sans matériel et sans installer une application complexe.
- Situation : le téléphone est posé au sol ou sur un meuble pendant l'effort.
- Friction : elle perd du temps à choisir une séance, puis doit surveiller le
  chrono alors qu'elle devrait rester concentrée sur ses mouvements.
- Utile quand : elle dispose de 4, 10 ou 20 minutes, choisit son niveau et ses
  contraintes, puis suit une séance fiable sans regarder constamment l'écran.

## 4. Golden path

1. L'utilisateur arrive sur l'accueil et découvre une séance recommandée pour
   aujourd'hui.
2. Il demande à l'IA de composer sa séance à partir de son temps, de son niveau,
   de ses contraintes et de son objectif, ou choisit l'une des trois séances
   prêtes à lancer.
3. L'application affiche le plan complet : exercices, phases, tours et durée
   calculée.
4. Il appuie sur **Commencer ma séance** ; un décompte de départ le laisse
   poser le téléphone.
5. Le lecteur annonce les phases, affiche un compte à rebours géant et le
   prochain exercice ; il peut mettre en pause, reprendre, avancer,
   revenir ou arrêter.
6. L'écran final affiche la durée réelle et les phases accomplies, avec Relancer
   et Retour au catalogue.

## 5. Écrans - maximum 3

1. **Catalogue et composition IA** : trois séances prêtes, formulaire court
   pré-rempli et résultat de génération.
2. **Aperçu de séance** : structure complète, durée calculée et bouton Lancer.
3. **Lecteur et fin de séance** : chrono, contrôles, progression et état final.

## 6. Périmètre

### MUST - obligatoire pour la démo

- Trois séances poids du corps crédibles : Tabata 4 minutes, séance courte de
  10 minutes et séance longue avec échauffement/récupération.
- Une génération IA structurée à partir de durée, niveau et contrainte ; l'exemple
  pré-rempli est « 10 minutes, débutant, sans saut ».
- Aperçu complet avant lancement : ordre des exercices, effort, repos, tours et
  durée totale dérivée des phases, jamais saisie manuellement.
- Lecteur précis à la seconde : le temps est ancré sur l'horloge réelle et une
  Tabata annoncée à 4 minutes dure 4 minutes à une seconde près.
- Pause/reprise sans perdre le reste de la phase ; suivant/précédent remettent
  la phase atteinte à sa durée complète ; arrêt explicite.
- Décompte de départ visible de 5 secondes.
- Compte à rebours lisible à deux mètres, nom, consigne, prochaine phase, tour
  et temps restant ; effort et repos sont écrits et visuellement distincts.
- Annonces vocales non bloquantes au début de phase et annonce du prochain
  exercice pendant le repos. Si la voix est indisponible, la séance continue et
  l'interface l'indique avant le départ.
- Écran de fin avec durée réelle, phases accomplies, Relancer et Retour.
- Loading, erreur lisible, Reessayer et fallback de génération transparent.
- Exécution locale fiable avec `pnpm dev`.

### SHOULD - uniquement après un golden path vérifié à T+50

- **Partager cette séance** : copier un lien autonome qui encode le plan ; dans
  une fenêtre privée, le destinataire voit l'aperçu et peut lancer sa propre
  copie. Aucun compte, serveur de partage ou synchronisation.

### NOT TODAY

- Authentification, paiement, rôles, base de données, comptes et synchronisation
  multi-utilisateur.
- Éditeur complet de blocs, réordonnancement, historique et statistiques.
- Notifications, PWA, écran toujours allumé, musique et fonctionnement hors ligne.
- Plusieurs fournisseurs IA, appels directs depuis le navigateur ou refonte après
  T+60.

## 7. Contrat de données

Propriétaire du contrat : Mathis / backend. Adrien valide le contrat avant le
gel à T+10 et reste l'intégrateur de `main`.

### Input

```ts
type GenerateWorkoutInput = {
  durationMinutes: 4 | 10 | 20;
  level: "beginner" | "intermediate";
  constraints: string[];
  goal: string;
  locale: "fr-FR";
};
```

Exemple de démo :

```json
{
  "durationMinutes": 10,
  "level": "beginner",
  "constraints": ["sans saut"],
  "goal": "Me remettre en mouvement en douceur après le travail",
  "locale": "fr-FR"
}
```

### Output

```ts
type WorkoutPhase = {
  id: string;
  kind: "warmup" | "work" | "rest" | "cooldown";
  exercise: string;
  instruction: string;
  durationSeconds: number;
};

type WorkoutBlock = {
  id: string;
  label: string;
  rounds: number;
  phases: WorkoutPhase[];
};

type WorkoutPlan = {
  id: string;
  name: string;
  level: "beginner" | "intermediate";
  estimatedDurationSeconds: number;
  blocks: WorkoutBlock[];
  source: "model" | "fixture";
  fallbackNotice?: string;
};
```

Le serveur vérifie que chaque exercice est nommé, chaque durée est positive,
chaque bloc a au moins un tour et `estimatedDurationSeconds` correspond à la
somme réelle des phases et tours.

## 8. Comportement IA et lecture de séance

- Tâche du modèle : produire une séance poids du corps française, sûre, sans
  équipement, compatible avec les contraintes demandées et la durée choisie.
- Format exigé : JSON conforme à `WorkoutPlan`, sans Markdown ni texte autour.
- Règles : pas de durée nulle, pas d'exercice à impact si « sans saut », une
  consigne courte par phase, durée totale cohérente.
- Timeout/erreur : réponse d'erreur lisible et bouton Reessayer.
- Fallback : le serveur renvoie le plan fixture « Élan quotidien - 10 min sans
  saut », avec `source: "fixture"` et un message explicite indiquant que l'IA
  est indisponible.
- Horloge : hors pause, le lecteur suit `Date.now()`. Au retour d'un onglet en
  arrière-plan, il se recale sur l'heure réelle et annonce la phase courante ;
  il ne prolonge jamais la séance à cause de l'absence.

## 9. Moment waouh

Après quelques choix simples, l'utilisateur pose son téléphone. Le lecteur annonce
« Squats contrôlés, 30 secondes », affiche un chiffre énorme, puis pendant le
repos annonce « Prochain : fentes arrière » avant qu'il ait besoin de regarder.

## 10. Critères d'acceptation

- [ ] Les trois séances du catalogue sont complètes et leurs durées affichées
  correspondent à leurs phases.
- [ ] L'exemple pré-rempli produit un `WorkoutPlan` conforme ou le fallback
  explicitement marqué.
- [ ] Une Tabata de 4 minutes est alignée à une seconde près avec un vrai chrono.
- [ ] Pause, reprise, suivant, précédent et arrêt suivent les règles du défi.
- [ ] Le parcours principal fonctionne après rechargement complet.
- [ ] Voice indisponible ne bloque jamais le chrono.
- [ ] Aucun secret n'est dans le client ou Git.
- [ ] Le parcours se démontre en moins de 90 secondes et le fallback termine la
  même histoire proprement.

## 11. Risques et fallback

- Risque principal : l'API modèle est lente, indisponible ou renvoie une séance
  invalide.
- Signal : timeout, erreur HTTP ou erreur de validation.
- Fallback : fixture serveur identique au contrat, visiblement marquée
  « Exemple de secours - IA indisponible ».
- Phrase de démo : « Le service de génération est indisponible ; l'application
  utilise son plan de secours pour terminer exactement le même parcours. »

## 12. Pitch en 3 phrases

- Problème : une personne qui doit chercher une séance puis surveiller son
  téléphone perd du temps et sort de son effort.
- Solution : Just Do HIIT transforme son temps disponible et son état du jour
  en séance structurée, puis la guide à la voix avec un chrono fiable.
- Différence : ce n'est pas un chatbot ni un minuteur statique : la séance est
  composée, visible avant le départ et réellement pilotée les mains libres.
