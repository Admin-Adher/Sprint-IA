# Sprint IA

Starter de mini-hackathon pour un binome Codex + Cursor. Il privilegie un
golden path court : input, transformation IA structuree, resultat et action.

## Demarrage

```bash
pnpm install
pnpm dev
```

Ouvrir `http://localhost:3000`. Avant le sprint, copier `.env.example` vers
`.env.local` et renseigner uniquement les secrets necessaires localement.

## Verification avant integration ou push

```bash
pnpm verify
```

## Jour J

1. Coller le defi dans `BRIEF.md` et le faire valider en moins de 10 minutes.
2. Figer le contrat dans `src/types/sprint.ts` et transmettre la fixture au flux UI.
3. Travailler sur `adrien/core-ai` et `binome/ui-demo`; seul l'integrateur publie `main`.
4. Integrer avant T+50, geler a T+110 et repeter deux fois la demo de 90 secondes.

La route `POST /api/generate` est un fallback structure temporaire. Remplacer
son contenu par l'appel IA serveur du defi, en conservant timeout, validation et
fallback transparent.
