# Départ commun - Adrien et Mathis

Ce fichier est le seul guide à lire ensemble. À T+10, chacun ferme ce fichier
et ouvre uniquement son propre parcours.

## Répartition définitive

| Personne | Outil | Mission | Branche |
| --- | --- | --- | --- |
| Adrien | Codex | Front, UI, UX, démo, intégration et publication | `adrien/ui-demo` |
| Mathis | Cursor | Backend, API, IA, validation, types et fallback serveur | `mathis/core-ai` |

Adrien est le seul à intégrer et pousser `main`. Mathis ne modifie aucun fichier
UI. Adrien ne modifie aucun fichier backend ou type partagé avant l'intégration.

## Avant le chronomètre

À exécuter sur les deux ordinateurs :

```bash
git clone https://github.com/Admin-Adher/Sprint-IA.git
cd Sprint-IA
pnpm install
pnpm verify
```

Vérifier ensemble :

- les deux accès GitHub fonctionnent ;
- Node et pnpm fonctionnent ;
- le starter s'ouvre avec `pnpm dev` ;
- aucune vraie clé API n'est enregistrée dans Git ;
- chargeurs et partage de connexion sont disponibles.

## T+00 - Prompt C1 : transformer l'objectif en brief

**Exécutant : Adrien. Outil : Codex. Branche : `main`.**

Copier le bloc complet et remplacer uniquement la consigne de la compétition.

```text
==================================================
COMMUN - A COLLER PAR ADRIEN DANS CODEX
PROMPT C1 - DECISION PRODUIT ET CONTRATS
BRANCHE : main
==================================================

Tu es le product lead et l'integrateur d'un mini-hackathon IA.

CONTEXTE
- Nous disposons exactement de 120 minutes.
- Adrien utilise Codex et possede le front, l'UI, l'UX, la demo et l'integration.
- Mathis utilise Cursor et possede le backend, l'API, la logique IA, la validation,
  les types partages et le fallback serveur.
- Le depot utilise Next.js App Router 16, TypeScript et pnpm.
- La demonstration finale doit durer moins de 90 secondes.

CONSIGNE EXACTE DE LA COMPETITION
[COLLER ICI LA CONSIGNE EXACTE SANS LA REFORMULER]

OBJECTIF
Choisis une seule interpretation du defi et transforme-la en un produit simple,
utile, credible et entierement demonstrable.

Le parcours obligatoire est :
input -> transformation IA -> resultat structure -> une action finale.

CONTRAINTES
- Maximum 3 ecrans, idealement une seule page.
- Une seule fonctionnalite principale.
- Une seule fonction waouh, uniquement apres le golden path.
- Aucun paiement, authentification, roles ou base complexe sauf exigence explicite.
- Une seule integration externe maximum.
- Un exemple realiste doit etre pre-rempli.
- Le resultat IA doit etre structure et validable, jamais defini comme du texte libre.
- Une fixture locale transparente doit terminer la demo si l'API echoue.
- Adrien et Mathis ne doivent jamais modifier les memes fichiers en parallele.

EXECUTION
1. Lis integralement BRIEF.md et AGENTS.md.
2. Evalue silencieusement au maximum 3 interpretations selon la clarte de la
   demo, la faisabilite, la valeur de l'IA, l'effet visuel et la robustesse.
3. Choisis uniquement la meilleure. Ne presente pas les autres.
4. Remplace BRIEF.md par un brief complet et court contenant :
   - consigne brute ;
   - produit en une phrase ;
   - utilisateur et probleme ;
   - promesse visible en moins de 30 secondes ;
   - golden path ;
   - maximum 3 ecrans ;
   - MUST, un seul SHOULD et NOT TODAY ;
   - contrat TypeScript d'input et d'output ;
   - comportement attendu du modele ;
   - input de demonstration exact ;
   - resultat visible attendu ;
   - action finale unique ;
   - fallback transparent ;
   - criteres d'acceptation ;
   - pitch en 3 phrases.
5. Verifie qu'AGENTS.md attribue exactement :
   - Adrien : src/features/**, src/components/demo/**, src/app/page.tsx,
     styles UI, donnees de demo, integration Git, build final et deploiement ;
   - Mathis : src/app/api/**, src/lib/ai/**, src/types/**, variables,
     validation, timeout, logique IA et tests API.
6. Definis Mathis comme proprietaire du contrat partage et Adrien comme
   integrateur unique de main.
7. Ne code aucune fonctionnalite.
8. N'ajoute aucune dependance.
9. Affiche le diff final.
10. Termine par cinq decisions a verifier humainement : cible, input,
    transformation IA, resultat visible et action finale.

Ne laisse aucun placeholder, sauf le nom d'une variable secrete dont la valeur
doit rester locale.
```

## Validation humaine obligatoire - 60 secondes

Adrien et Mathis répondent uniquement à ces questions :

1. Comprend-on la cible sans explication ?
2. L'input de démo est-il court et réaliste ?
3. Le résultat est-il visuellement différent de l'input ?
4. Le contrat permet-il de travailler séparément ?
5. L'action finale prouve-t-elle que ce n'est pas un simple chatbot ?

Si une réponse est non, corriger le brief immédiatement. Ne débattre d'aucune
fonction secondaire.

## Figer le départ

Adrien exécute :

```bash
git add BRIEF.md AGENTS.md
git commit -m "docs: freeze sprint brief and ownership"
git push origin main
```

Puis Adrien :

```bash
git switch main
git pull --ff-only
git switch -c adrien/ui-demo
git push -u origin adrien/ui-demo
```

Mathis :

```bash
git switch main
git pull --ff-only
git switch -c mathis/core-ai
git push -u origin mathis/core-ai
```

Si la branche existe déjà, utiliser `git switch <branche>` puis
`git merge --ff-only main` au lieu de la recréer.

## Handoff attendu de Mathis

Mathis envoie toujours ce bloc à Adrien :

```text
Commit : [HASH]
Fonction : [CE QUI EST PRET]
Endpoint : [METHODE + CHEMIN]
Fichiers : [LISTE COURTE]
Contrat : [TYPE / VERSION]
Exemple JSON : [INPUT ET OUTPUT]
Variables : [NOMS UNIQUEMENT]
Dependances : [AUCUNE OU LISTE]
Tests : [COMMANDES + RESULTATS]
Limites : [LISTE]
```

À T+10 : Adrien ouvre `01_ADRIEN_CODEX_FRONT.md`. Mathis ouvre
`02_MATHIS_CURSOR_BACKEND.md`. Ils ne suivent plus le même document.
