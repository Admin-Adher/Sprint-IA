# AGENTS.md

## Mission

Construire uniquement le produit defini dans `BRIEF.md`. Priorite absolue :
un golden path demonstrable, stable et comprehensible en moins de 90 secondes.

## Sources de verite

1. `BRIEF.md` definit quoi construire et pour qui.
2. Ce fichier definit comment collaborer et la propriete des fichiers.
3. `src/types/sprint.ts` definit le contrat partage, possede par Mathis, jusqu'a
   son gel avant T+10.
4. Le build et les tests executes priment sur les suppositions.

## Stack verrouillee

- Framework : Next.js App Router 16 avec TypeScript.
- Package manager : pnpm 11.19.0.
- UI : CSS modules et CSS existant, sans nouvelle bibliotheque par defaut.
- Execution locale : `pnpm dev`.
- Verification : `pnpm verify`.
- Deploiement initial : local fiable; Vercel seulement si le compte est deja
  connecte et verifie avant le sprint.

Ne pas changer de stack ou de package manager pendant le sprint. Mathis propose
les dependances backend necessaires; Adrien reste le seul integrateur autorise
a accepter une dependance et a publier `main`.

## Repartition et propriete des fichiers

### Adrien / Codex - front, UI, demo et integrateur

Possede : `src/features/**`, `src/components/demo/**`, `src/app/page.tsx`,
styles des ecrans, formulaire, affichage des resultats, etats UI, donnees de
demo, script de presentation, integration Git, build final et deploiement.

### Mathis / Cursor - backend et core IA

Possede : variables d'environnement, `src/lib/ai/**`, `src/app/api/**`,
`src/types/**`, validation, timeout, logique IA, fixture serveur et tests API.

Avant de modifier un fichier de l'autre flux, demander explicitement le
transfert de propriete. Aucun travail direct sur `main`, sauf par Adrien lors
de l'integration.

## Contrat de collaboration

- Branches de travail : `adrien/ui-demo` et `mathis/core-ai`.
- Commits petits, coherents et integrables toutes les 10 a 20 minutes.
- Ne pas reformater hors perimetre ni modifier lockfile/types partages sans
  transfert de propriete.
- Premiere integration avant T+50; aucune nouvelle fonctionnalite a T+95;
  gel complet a T+110 sauf bloqueur de demo.
- Mathis ne pousse jamais directement sur `main`; Adrien est l'integrateur.
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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
