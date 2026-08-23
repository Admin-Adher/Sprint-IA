# Mathis - Prompts Cursor backend et IA

Ce fichier appartient uniquement à Mathis. Tous les prompts sont à coller dans
Cursor sur `mathis/core-ai`. Mathis ne travaille jamais sur `main` et ne modifie
aucun fichier UI.

## M1 - Construire le contrat, la route et le backend V0

**Moment : T+10. Branche : `mathis/core-ai`.**

```text
==================================================
MATHIS - A COLLER DANS CURSOR
PROMPT M1 - BACKEND V0 COMPLET
BRANCHE : mathis/core-ai
==================================================

Lis integralement BRIEF.md et AGENTS.md avant toute modification.

ROLE
Tu travailles pour Mathis. Tu es exclusivement responsable du backend, du
contrat partage, de la route API, de la logique IA et du fallback serveur.

FICHIERS AUTORISES
- src/app/api/**
- src/lib/ai/**
- src/types/**
- .env.example
- tests backend explicitement lies a ces fichiers

FICHIERS INTERDITS
- src/features/**
- src/components/demo/**
- src/app/page.tsx
- styles UI
- package.json et pnpm-lock.yaml sans accord explicite d'Adrien

OBJECTIF
Livrer une route serveur testable qui transforme l'input du brief en sortie
structuree strictement conforme au contrat partage.

EXECUTION
1. Inspecte le depot, BRIEF.md, AGENTS.md et le contrat propose.
2. Resume ton plan en 6 lignes maximum, puis implemente sans attendre.
3. Fige ou remplace src/types/sprint.ts en premier.
4. Ne change plus le contrat apres ce point sauf blocage critique annonce a Adrien.
5. Cree une fixture serveur realiste strictement conforme au contrat.
6. Implemente l'endpoint et la methode HTTP definis dans le brief.
7. Garde l'appel modele et tous les secrets cote serveur.
8. Valide explicitement l'input avant tout appel externe.
9. Exige une sortie structuree du modele.
10. Valide la sortie avant de la retourner au front.
11. Ajoute un timeout borne.
12. Retourne des erreurs HTTP courtes, stables et exploitables par le front.
13. Si l'appel externe echoue, autorise la fixture de secours avec un marqueur
    explicite indiquant qu'il s'agit du fallback.
14. Ne transforme jamais silencieusement un echec externe en succes reel.
15. Ajoute uniquement les logs courts necessaires au diagnostic.
16. Teste au minimum : requete valide, input invalide, sortie invalide, timeout
    ou echec modele et fallback.
17. Execute typecheck, tests utiles et build pertinent.
18. Cree un commit petit et coherent.

SECURITE
- Aucun secret dans Git, les reponses API ou les logs.
- Aucun appel modele depuis le navigateur.
- Aucun outil ou integration hors MUST.
- Aucune dependance sans necessite directe et accord d'Adrien.

HANDOFF FINAL OBLIGATOIRE
Indique exactement :
- hash du commit ;
- fichiers modifies ;
- endpoint et methode HTTP ;
- type d'input ;
- type de sortie ;
- exemple JSON complet d'input et output ;
- variables d'environnement requises, sans valeur ;
- timeout ;
- erreurs possibles ;
- comportement du fallback ;
- commandes executees et resultats ;
- limites restantes.

Termine par un bloc de handoff directement copiable pour Adrien.
```

Après M1, envoyer immédiatement le hash et le handoff à Adrien. Ne pas attendre
que le front soit terminé.

## M2 - Fiabiliser le backend après la première intégration

**Moment : T+50, uniquement si Adrien confirme que le golden path fonctionne.**

```text
==================================================
MATHIS - A COLLER DANS CURSOR
PROMPT M2 - FIABILISATION BACKEND
BRANCHE : mathis/core-ai
==================================================

Lis integralement BRIEF.md et AGENTS.md.

PRECONDITION ABSOLUE
Adrien a confirme que le golden path fonctionne de bout en bout. Si ce n'est
pas vrai, arrete et demande uniquement le symptome backend exact.

ROLE
Mathis / backend et IA uniquement.

OBJECTIF
Ameliorer la qualite et la predictibilite du resultat sans modifier le contrat.

PRIORITES
1. Prompt modele precis et court.
2. Sortie strictement structuree.
3. Validation input et output.
4. Timeout borne.
5. Messages d'erreur stables.
6. Fixture conforme et transparente.
7. Logs courts utiles.

EXECUTION
1. Inspecte les scenarios backend actuels.
2. N'applique que des changements locaux et peu risques.
3. Teste input valide, input invalide, sortie invalide, timeout et fallback.
4. Verifie qu'aucun secret n'est expose.
5. Execute typecheck, tests utiles et build pertinent.
6. Cree un commit isole.

INTERDICTIONS
- Aucun fichier UI.
- Aucun changement de contrat.
- Aucune nouvelle integration.
- Aucune base de donnees sauf exigence MUST deja inscrite.
- Aucune architecture multi-agent.
- Aucune dependance sans accord explicite.

HANDOFF FINAL
Donne le hash, les fichiers, les tests, les comportements verifies et les risques
restants dans le format de handoff attendu par Adrien.
```

## M3 - Diagnostiquer un problème signalé par Adrien

**Moment : après une intégration, si Adrien remonte un symptôme backend précis.**

```text
==================================================
MATHIS - A COLLER DANS CURSOR
PROMPT M3 - DIAGNOSTIC BACKEND CIBLE
BRANCHE : mathis/core-ai
==================================================

Lis BRIEF.md et AGENTS.md.

SYMPTOME OBSERVE PAR ADRIEN
[COLLER LE SYMPTOME ET LES ETAPES DE REPRODUCTION]

REPONSE HTTP OU LOG UTILE
[COLLER UNIQUEMENT LES DONNEES SANS SECRET]

OBJECTIF
Identifier la cause racine backend et appliquer le plus petit correctif dans les
fichiers possedes par Mathis.

EXECUTION
1. Reproduis le probleme au niveau de la route ou de la logique IA.
2. Determine si la cause concerne l'input, la validation, le modele, le timeout,
   la sortie ou le fallback.
3. Applique le correctif minimal.
4. Ne change pas le contrat sauf impossibilite technique demontree et annoncee.
5. Ajoute ou adapte uniquement le test qui reproduit le probleme.
6. Execute les controles backend pertinents.
7. Cree un commit isole.

INTERDICTIONS
- Aucun fichier UI.
- Aucune refactorisation.
- Aucune dependance.
- Aucun secret dans le diagnostic.

HANDOFF FINAL
Donne cause racine, hash, fichiers, test de reproduction, resultat et risque residuel.
```

## M4 - Bug critique backend à moins de 10 minutes

```text
==================================================
MATHIS - A COLLER DANS CURSOR
PROMPT M4 - BUG CRITIQUE BACKEND
BRANCHE : mathis/core-ai
==================================================

Il reste moins de 10 minutes.

BUG BLOQUANT
[DECRIRE LE BUG]

REPRODUCTION EXACTE
[COLLER LES ETAPES]

Lis BRIEF.md et AGENTS.md.

OBJECTIF
Trouver la cause racine minimale dans le backend et appliquer le plus petit
correctif fiable.

INTERDICTIONS
- aucune fonctionnalite ;
- aucune refactorisation ;
- aucune dependance ;
- aucun fichier UI ;
- aucun changement de contrat ;
- aucune nouvelle integration.

APRES LE PATCH
1. Reproduis le scenario initial.
2. Teste input valide, erreur concernee et fallback.
3. Execute uniquement les controles rapides pertinents.
4. Indique le risque residuel.
5. Recommande le fallback si la correction reste incertaine.

Termine par : cause racine, hash, fichiers, verification et statut GO ou FALLBACK.
```

## Format unique de handoff vers Adrien

Mathis copie toujours ce format, sans commentaire supplémentaire :

```text
Commit : [HASH]
Fonction : [CE QUI EST PRET]
Endpoint : [METHODE + CHEMIN]
Fichiers : [LISTE COURTE]
Contrat : [TYPE / VERSION]
Input JSON : [EXEMPLE]
Output JSON : [EXEMPLE]
Variables : [NOMS SANS VALEURS]
Timeout : [DUREE ET COMPORTEMENT]
Fallback : [DECLENCHEUR ET MARQUEUR]
Erreurs : [STATUTS + CORPS]
Dependances : [AUCUNE OU LISTE]
Tests : [COMMANDES + RESULTATS]
Limites : [LISTE]
```
