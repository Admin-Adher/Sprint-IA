# Adrien - Prompts Codex front et UI

Ce fichier appartient uniquement à Adrien. Tous les prompts de ce document sont
à coller dans Codex sur `adrien/ui-demo`. Les intégrations sur `main` sont dans
`03_INTEGRATION_ET_DEMO_ADRIEN.md`.

## A1 - Construire le front V0 avec une fixture

**Moment : T+10. Branche : `adrien/ui-demo`.**

```text
==================================================
ADRIEN - A COLLER DANS CODEX
PROMPT A1 - FRONT V0 AVEC FIXTURE
BRANCHE : adrien/ui-demo
==================================================

Lis integralement BRIEF.md et AGENTS.md avant toute modification.

ROLE
Tu travailles pour Adrien. Tu es exclusivement responsable du front, de l'UX
et de la demonstration.

FICHIERS AUTORISES
- src/features/**
- src/components/demo/**
- src/app/page.tsx
- src/app/page.module.css
- styles d'ecran explicitement attribues au flux UI
- fixture UI placee dans le perimetre UI

FICHIERS INTERDITS
- src/app/api/**
- src/lib/ai/**
- src/types/**
- .env*
- package.json
- pnpm-lock.yaml
- configuration du projet

OBJECTIF
Construire le golden path complet cote interface avec une fixture strictement
conforme au contrat defini dans BRIEF.md.

EXECUTION
1. Inspecte rapidement les fichiers UI et le contrat partage sans les modifier.
2. Resume ton plan en 6 lignes maximum, puis implemente sans attendre.
3. Utilise une seule page si possible et jamais plus de 3 ecrans.
4. Ajoute l'exemple realiste pre-rempli defini dans le brief.
5. Place l'action principale au-dessus de la ligne de flottaison.
6. Couvre explicitement les etats initial, loading, success, empty, error et fallback.
7. Rends la transformation entre input brut et resultat structure evidente en
   moins de 5 secondes.
8. Implemente exactement une action finale conforme au brief.
9. Fais fonctionner tout le parcours avec une fixture locale conforme.
10. Prepare le branchement API dans une fonction ou un module UI unique.
11. Ajoute un bouton Reessayer et un moyen simple de remettre la demo a zero.
12. Le fallback doit etre presentable et clairement indique comme exemple de secours.
13. Verifie le parcours apres rechargement complet.
14. Verifie le rendu desktop sur l'ecran utilise pendant la presentation.
15. Execute le typecheck et le lint pertinents.
16. Cree un commit petit et coherent.

INTERDICTIONS
- Ne modifie aucun fichier backend ou type partage.
- N'ajoute aucune dependance.
- N'implemente rien qui ne soit pas dans MUST.
- Ne construis pas de design system.
- Ne refais pas l'architecture.
- Ne bloque pas le front en attendant Mathis.

HANDOFF FINAL
Indique exactement :
- hash du commit ;
- fichiers modifies ;
- golden path implemente ;
- etats UI couverts ;
- contrat attendu ;
- emplacement du branchement API ;
- commandes executees et resultats ;
- limites restantes.
```

Envoyer à Mathis uniquement le contrat attendu et l'exemple JSON. Ne lui envoyer
aucun fichier UI à modifier.

## A2 - Brancher l'API de Mathis dans le front

**Moment : après réception du handoff backend. Branche : `adrien/ui-demo` ou
pendant l'intégration si la propriété a été explicitement transférée.**

```text
==================================================
ADRIEN - A COLLER DANS CODEX
PROMPT A2 - BRANCHEMENT FRONT VERS API
BRANCHE : adrien/ui-demo
==================================================

Lis integralement BRIEF.md et AGENTS.md.

HANDOFF BACKEND DE MATHIS
[COLLER LE HANDOFF COMPLET]

OBJECTIF
Brancher l'interface existante sur l'endpoint fourni par Mathis sans modifier le
contrat, la route serveur ni la logique IA.

EXECUTION
1. Inspecte le diff UI actuel et le handoff de Mathis.
2. Verifie que le type attendu par l'UI correspond exactement au type annonce.
3. Modifie uniquement le point d'integration UI prepare dans A1.
4. Conserve la fixture comme fallback transparent.
5. Ajoute un timeout cote interaction uniquement si le brief l'exige, sans
   dupliquer la logique serveur.
6. Mappe les etats HTTP vers des etats UI lisibles.
7. Verifie loading, success, erreur, Reessayer et fallback.
8. Verifie que l'action finale fonctionne avec une vraie reponse et la fixture.
9. Teste apres rechargement complet.
10. Execute typecheck et lint.
11. Cree un commit isole.

INTERDICTIONS
- Ne modifie pas src/app/api/**, src/lib/ai/** ou src/types/**.
- N'invente aucun champ absent du contrat.
- Ne masque pas un echec API comme une reponse reelle.
- N'ajoute aucune dependance ou fonctionnalite.

HANDOFF FINAL
Donne le hash, les fichiers modifies, les scenarios testes, les resultats et les
limites restantes.
```

## A3 - Polish utile et fonction waouh

**Moment : T+50 uniquement si le golden path intégré fonctionne déjà.**

```text
==================================================
ADRIEN - A COLLER DANS CODEX
PROMPT A3 - POLISH UI ET UNIQUE SHOULD
BRANCHE : adrien/ui-demo
==================================================

Lis integralement BRIEF.md et AGENTS.md.

PRECONDITION ABSOLUE
Le golden path fonctionne deja de bout en bout. Si ce n'est pas vrai, arrete et
recommande de revenir au prompt d'integration I2.

ROLE
Adrien / front, UX et demo uniquement.

OBJECTIF
Rendre la transformation IA evidente en moins de 5 secondes, puis implementer
au maximum l'unique SHOULD de BRIEF.md si le risque est faible.

PRIORITES
1. Lisibilite du resultat.
2. Hierarchie du bouton principal.
3. Exemple pre-rempli credible.
4. Loading qui explique ce qui se passe.
5. Erreur et fallback presentables.
6. Une seule fonction waouh deja definie dans SHOULD.

EXECUTION
1. Audite le parcours actuel sans changer l'architecture.
2. Corrige uniquement les frictions qui ralentissent la demo.
3. Garde une action principale unique.
4. Verifie que le resultat est lisible a distance sur l'ecran de presentation.
5. Verifie le reset et le rechargement complet.
6. Execute typecheck et lint.
7. Cree un commit isole.

INTERDICTIONS
- Aucun changement de contrat ou fichier backend.
- Aucune dependance.
- Aucun nouvel ecran hors brief.
- Aucun element decoratif sans utilite pour la demo.
- Aucun second SHOULD.

HANDOFF FINAL
Donne le hash, les fichiers, les ameliorations visibles, les controles executes
et le risque residuel.
```

## A4 - Bug critique strictement UI

**Moment : uniquement si le diagnostic confirme que le bloqueur est dans un
fichier possédé par Adrien.**

```text
==================================================
ADRIEN - A COLLER DANS CODEX
PROMPT A4 - BUG CRITIQUE UI
BRANCHE : branche courante d'Adrien
==================================================

Il reste moins de 10 minutes.

BUG BLOQUANT
[DECRIRE LE BUG]

REPRODUCTION EXACTE
[COLLER LES ETAPES]

Lis BRIEF.md et AGENTS.md.

OBJECTIF
Trouver la cause racine minimale dans le perimetre UI et appliquer le plus petit
correctif fiable.

INTERDICTIONS
- aucune fonctionnalite ;
- aucune refactorisation ;
- aucune dependance ;
- aucun changement de contrat ;
- aucun fichier backend ;
- aucun changement de design global.

APRES LE PATCH
1. Reproduis le scenario initial.
2. Teste le golden path une fois.
3. Execute uniquement typecheck et le controle rapide pertinent.
4. Indique le risque residuel.
5. Recommande le fallback si la correction reste incertaine.

Termine par : cause racine, fichiers, correctif, verification et statut GO ou FALLBACK.
```

## Handoff Adrien vers l'intégration

À la fin de chaque phase, conserver ce format :

```text
Commit : [HASH]
Fonction UI : [CE QUI EST PRET]
Fichiers : [LISTE COURTE]
Contrat consomme : [TYPE / VERSION]
Etats couverts : [LISTE]
Tests : [COMMANDES + RESULTATS]
Limites : [LISTE]
```
