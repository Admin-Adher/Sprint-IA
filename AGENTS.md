# AGENTS.md

## Mission

Construire uniquement le produit defini dans `BRIEF.md`. Priorite absolue :
un golden path demonstrable, stable et comprehensible en moins de 90 secondes.

## Sources de verite

1. `BRIEF.md` definit quoi construire et pour qui.
2. Ce fichier definit comment collaborer et la propriete des fichiers.
3. `src/types/sprint.ts` definit le contrat partage jusqu'a son remplacement
   explicite et son gel avant T+10.
4. Le build et les tests executes priment sur les suppositions.

## Stack verrouillee

- Framework : Next.js App Router 16 avec TypeScript.
- Package manager : pnpm 11.19.0.
- UI : CSS modules et CSS existant, sans nouvelle bibliotheque par defaut.
- Execution locale : `pnpm dev`.
- Verification : `pnpm verify`.
- Deploiement initial : local fiable; Vercel seulement si le compte est deja
  connecte et verifie avant le sprint.

Ne pas changer de stack ou de package manager pendant le sprint. Adrien est le
seul proprietaire de `package.json`, `pnpm-lock.yaml` et des dependances.

## Repartition et propriete des fichiers

### Adrien / Codex - lead technique et integrateur

Possede : configuration, variables d'environnement, `src/lib/ai/**`,
`src/app/api/**`, `src/types/**`, integration Git, build et deploiement.

### Binome / Cursor - UI et demonstration

Possede : `src/features/**`, `src/components/demo/**`, styles ecran, formulaire,
affichage de resultat, etats loading/success/empty/error, donnees de demo et
script de demonstration.

Avant de modifier un fichier de l'autre flux, demander explicitement le
transfert de propriete. Aucun travail direct sur `main`, sauf par Adrien lors
de l'integration.

## Contrat de collaboration

- Branches de travail : `adrien/core-ai` et `binome/ui-demo`.
- Commits petits, coherents et integrables toutes les 10 a 20 minutes.
- Ne pas reformater hors perimetre ni modifier lockfile/types partages sans
  transfert de propriete.
- Premiere integration avant T+50; aucune nouvelle fonctionnalite a T+95;
  gel complet a T+110 sauf bloqueur de demo.
- Handoff : commit, fonction prete, fichiers, contrat, dependances et limites.

## Regles IA et securite

- Les appels modele restent cote serveur. Aucun secret dans le navigateur ou
  Git; utiliser `.env.local` a partir de `.env.example`.
- Utiliser une sortie structuree validee avant affichage.
- Prevoir timeout, erreur lisible, Reessayer et fixture de secours transparente.
- Ne pas ajouter agent, outil ou integration sans besoin direct du MUST.

## Definition of Done

Une tache est terminee si elle respecte le brief, reste dans les fichiers
possedes, passe la verification pertinente, fonctionne apres reload et dispose
d'un commit avec handoff. Le projet est pret si le golden path, input de demo,
loading, erreur, fallback, build et deux repetitions de 90 secondes sont
verifies.
