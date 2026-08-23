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

Ouvrir les guides dans cet ordre :

1. Les deux : [`00_DEPART_COMMUN.md`](00_DEPART_COMMUN.md).
2. Adrien : [`01_ADRIEN_CODEX_FRONT.md`](01_ADRIEN_CODEX_FRONT.md).
3. Mathis : [`02_MATHIS_CURSOR_BACKEND.md`](02_MATHIS_CURSOR_BACKEND.md).
4. Adrien, pour les fusions et la fin :
   [`03_INTEGRATION_ET_DEMO_ADRIEN.md`](03_INTEGRATION_ET_DEMO_ADRIEN.md).

Branches du sprint : `adrien/ui-demo` et `mathis/core-ai`. Seul Adrien integre
et publie `main`.

La route `POST /api/generate` est un fallback structure temporaire. Remplacer
son contenu par l'appel IA serveur du defi, en conservant timeout, validation et
fallback transparent.
