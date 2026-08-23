# Adrien - Intégration, freeze, déploiement et démo

Ce fichier appartient uniquement à Adrien. Tous les prompts sont à coller dans
Codex. Sauf mention contraire, ils s'exécutent sur `main`. Mathis n'utilise
jamais ce document.

## I1 - Première intégration obligatoire

**Moment : T+40, pour obtenir le bout-en-bout avant T+50.**

Avant le prompt :

```bash
git switch main
git pull --ff-only
git fetch origin
```

```text
==================================================
ADRIEN - A COLLER DANS CODEX
PROMPT I1 - PREMIERE INTEGRATION
BRANCHE : main
==================================================

Lis integralement BRIEF.md et AGENTS.md.

COMMITS A INTEGRER
- Front Adrien : [HASH_ADRIEN]
- Backend Mathis : [HASH_MATHIS]

HANDOFF BACKEND
[COLLER LE HANDOFF COMPLET DE MATHIS]

ROLE
Tu es l'integrateur unique. Tu ne dois pas creer une seconde implementation.

OBJECTIF
Obtenir avant T+50 le golden path : input pre-rempli -> route -> resultat
structure -> affichage -> action finale.

EXECUTION
1. Inspecte les deux commits sans les modifier.
2. Compare chaque diff au perimetre et aux proprietes de fichiers.
3. Verifie que le front et le backend utilisent exactement le meme contrat.
4. Integre les commits avec le minimum de modifications.
5. Resous uniquement les conflits necessaires au golden path.
6. Branche le front sur l'endpoint au point d'integration deja prepare.
7. Conserve la fixture comme fallback transparent.
8. Teste apres rechargement complet :
   - input pre-rempli ;
   - soumission ;
   - loading ;
   - route API ;
   - resultat structure ;
   - action finale ;
   - erreur ;
   - Reessayer ;
   - fallback ;
   - reset.
9. Execute pnpm typecheck, pnpm lint et pnpm build.
10. Corrige uniquement les regressions bloquant ce parcours.
11. Cree un commit d'integration coherent.

INTERDICTIONS
- Aucune nouvelle fonctionnalite.
- Aucune dependance.
- Aucune refactorisation.
- Aucun changement de contrat sans blocage critique demontre.
- Aucun reformatage hors perimetre.

HANDOFF FINAL
Donne : statut GO ou NO-GO, hash d'integration, fichiers ajustes, commandes et
resultats, risques restants et prochaine action unique.
```

Si le statut est GO :

```bash
git push origin main
```

## I2 - Réduction de scope si T+50 est en danger

```text
==================================================
ADRIEN - A COLLER DANS CODEX
PROMPT I2 - REDUCTION DE SCOPE T+50
BRANCHE : main
==================================================

Nous sommes a T+50 et le golden path complet ne fonctionne pas.

Lis BRIEF.md et AGENTS.md, puis inspecte l'etat actuel.

OBJECTIF
Rendre fonctionnel en moins de 10 minutes le chemin minimum :
input pre-rempli -> soumission -> resultat structure -> action finale.

EXECUTION
1. Identifie le premier point exact qui casse le parcours.
2. Classe les elements en indispensable, supprimable maintenant ou reportable.
3. Supprime du plan tout le SHOULD.
4. Ne reduis le contrat que si c'est indispensable et immediatement alignable.
5. Prefere la fixture transparente si l'appel externe bloque.
6. Applique le plus petit correctif possible.
7. Teste le parcours apres rechargement complet.
8. Execute uniquement les controles rapides pertinents.

INTERDICTIONS
- Aucune refactorisation.
- Aucune dependance.
- Aucun polish.
- Aucune nouvelle fonctionnalite.

Termine par : cause racine, scope coupe, correctif, statut GO ou NO-GO et
prochaine action unique.
```

## I3 - Deuxième intégration

**Moment : T+80 à T+90.**

```text
==================================================
ADRIEN - A COLLER DANS CODEX
PROMPT I3 - DEUXIEME INTEGRATION
BRANCHE : main
==================================================

Lis BRIEF.md et AGENTS.md.

COMMITS A INTEGRER
- Amelioration UI Adrien : [HASH OU AUCUN]
- Fiabilisation backend Mathis : [HASH OU AUCUN]

HANDOFFS
[COLLER LES HANDOFFS DISPONIBLES]

OBJECTIF
Integrer les ameliorations autorisees sans degrader le golden path deja valide.

EXECUTION
1. Inspecte les diffs et la propriete de chaque fichier.
2. Refuse tout element hors MUST ou unique SHOULD.
3. Verifie que le contrat n'a pas change.
4. Integre avec le minimum de modifications.
5. Teste le chemin nominal, l'erreur, Reessayer, fallback et reset.
6. Execute pnpm verify.
7. Corrige uniquement les regressions bloqueuses.
8. Cree un commit d'integration.

INTERDICTIONS
- Aucune nouvelle fonctionnalite.
- Aucune dependance.
- Aucune refactorisation.
- Aucun changement de design global.

Termine par le hash, les controles, les risques et GO ou NO-GO pour le freeze.
```

Puis :

```bash
git push origin main
```

## I4 - Freeze complet à T+95

```text
==================================================
ADRIEN - A COLLER DANS CODEX
PROMPT I4 - FREEZE ET QA
BRANCHE : main
==================================================

Nous sommes a T+95. Lis BRIEF.md et AGENTS.md.
Aucune nouvelle fonctionnalite n'est autorisee.

OBJECTIF
Auditer uniquement le golden path et corriger les bloqueurs de demonstration.

VERIFICATIONS OBLIGATOIRES
- rechargement complet ;
- input de demo pre-rempli ;
- bouton principal ;
- loading ;
- appel IA ou fallback ;
- resultat structure ;
- action finale ;
- erreur lisible ;
- Reessayer ;
- reset ;
- build de production ;
- execution locale ou URL deployee ;
- absence de secret suivi par Git.

METHODE
1. Classe chaque probleme en BLOQUANT, IMPORTANT ou IGNORABLE.
2. Corrige tous les BLOQUANTS.
3. Corrige un IMPORTANT uniquement si le changement est local et peu risque.
4. Ignore les defauts esthetiques qui n'empechent pas la demo.
5. Ne modifie pas le contrat.
6. N'ajoute aucune dependance.
7. Ne refactore pas.
8. Execute pnpm verify.
9. Teste une fois le chemin nominal et une fois le fallback.

Termine par une checklist GO ou NO-GO avec une preuve courte pour chaque point.
```

## I5 - Vérification du déploiement

**Utiliser uniquement si le compte Vercel est déjà connecté et que les variables
nécessaires sont disponibles.**

```text
==================================================
ADRIEN - A COLLER DANS CODEX
PROMPT I5 - VERIFICATION ET DEPLOIEMENT
BRANCHE : main
==================================================

Lis BRIEF.md et AGENTS.md.

ROLE
Tu es l'integrateur. Main contient la version candidate.

OBJECTIF
Verifier que la version est deployable, puis deployer uniquement si tous les
controles sont verts et si Vercel est deja authentifie.

EXECUTION
1. Verifie que le worktree est propre.
2. Verifie qu'aucun secret n'est suivi par Git.
3. Verifie que .env.example ne contient aucune valeur secrete.
4. Execute pnpm verify.
5. Teste localement apres rechargement complet.
6. Teste la route avec un input valide et invalide.
7. Teste le fallback et son marquage explicite.
8. Liste les noms des variables necessaires, sans afficher leur valeur.
9. Si Vercel n'est pas authentifie, arrete avant toute tentative et conserve
   l'execution locale fiable.
10. Si toutes les conditions sont remplies, deploie la version exacte de main.
11. Verifie ensuite l'URL publique et le golden path complet.

INTERDICTIONS
- Aucun changement produit.
- Aucun secret dans les sorties ou Git.
- Aucune tentative repetitive si l'authentification manque.

Termine par : hash Git, controles, URL verifiee ou raison de l'absence de
deploiement et statut GO ou NO-GO.
```

## I6 - Bug critique d'intégration

```text
==================================================
ADRIEN - A COLLER DANS CODEX
PROMPT I6 - BUG CRITIQUE D'INTEGRATION
BRANCHE : main
==================================================

Il reste moins de 10 minutes.

BUG BLOQUANT
[DECRIRE LE BUG]

REPRODUCTION EXACTE
[COLLER LES ETAPES]

Lis BRIEF.md et AGENTS.md.

OBJECTIF
Trouver la cause racine minimale et appliquer le plus petit correctif fiable.

INTERDICTIONS
- aucune fonctionnalite ;
- aucune refactorisation ;
- aucune dependance ;
- aucun changement de contrat ;
- aucune modification hors des fichiers directement concernes ;
- aucun changement de design global.

APRES LE PATCH
1. Reproduis exactement le scenario initial.
2. Teste le golden path une fois.
3. Execute uniquement les controles rapides pertinents.
4. Indique le risque residuel.
5. Active ou recommande le fallback si le correctif reste incertain.

Termine par : cause racine, fichiers, correctif, verification, risque et GO ou FALLBACK.
```

## I7 - Générer le script final de 90 secondes

**Moment : T+110, aucun code après ce prompt sauf bloqueur critique.**

```text
==================================================
ADRIEN - A COLLER DANS CODEX
PROMPT I7 - SCRIPT FINAL DE DEMONSTRATION
BRANCHE : main, lecture uniquement
==================================================

Lis integralement BRIEF.md et base-toi uniquement sur les fonctionnalites
reellement presentes et verifiees.

ROLES SUR SCENE
- Mathis est le narrateur : il explique le probleme et la valeur.
- Adrien est l'operateur : il manipule l'interface.
- La narration ne decrit jamais la stack technique.

OBJECTIF
Ecrire un script oral de 90 secondes maximum.

STRUCTURE OBLIGATOIRE
- 0 a 15 secondes : probleme concret et utilisateur.
- 15 a 30 secondes : promesse du produit.
- 30 a 75 secondes : golden path visible.
- 75 a 85 secondes : difference avec un chatbot generique.
- 85 a 90 secondes : conclusion.

SORTIE ATTENDUE
1. Texte exact de Mathis, phrase par phrase.
2. Actions exactes d'Adrien entre crochets.
3. Chronometrage de chaque segment.
4. Etat exact de l'application avant de commencer.
5. Action exacte de reset entre deux demos.
6. Phrase de secours si l'API est lente.
7. Phrase transparente si le fallback est utilise.
8. Checklist de 30 secondes avant de passer sur scene.

Ton naturel, direct et sans jargon. N'invente aucune fonctionnalite absente.
```

## I8 - GO final

```text
==================================================
ADRIEN - A COLLER DANS CODEX
PROMPT I8 - CONTROLE GO FINAL
BRANCHE : main, lecture et verification uniquement
==================================================

Nous sommes a T+110. Aucun changement de code n'est autorise sauf bloqueur
critique de demonstration.

Lis BRIEF.md et verifie l'etat reel du projet.

Confirme avec preuves courtes :
1. hash exact de main ;
2. worktree propre ;
3. pnpm verify passe ;
4. golden path apres reload ;
5. input pre-rempli ;
6. resultat structure ;
7. action finale ;
8. loading et erreur ;
9. Reessayer et reset ;
10. fallback transparent ;
11. local ou URL publique verifie ;
12. aucune cle dans Git.

Ne corrige rien pendant cet audit. Termine par GO ou NO-GO et, en cas de
NO-GO, indique uniquement le bloqueur exact et le fallback disponible.
```

## Deux répétitions obligatoires

1. Démo normale chronométrée.
2. Reset complet.
3. Démo avec API indisponible et fallback.
4. Si les deux passent, ne plus toucher au code.
5. En cas de bloqueur réel, utiliser uniquement I6.
