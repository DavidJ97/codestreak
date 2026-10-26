# 🔥 CodeStreak — Apprendre Python, COBOL et les métiers de l'IA

Une app web pour apprendre les fondations (**Python**, **COBOL**) et les compétences IA recherchées de 2027 à 2030 (**UX/UI de l'IA**, **AI Engineering**, **AI Linguist**, **Sécurité de l'IA**), avec des **projets portfolio** à publier sur GitHub :

- 📚 **Leçons courtes inspirées de W3Schools** : une notion, un exemple, puis des exercices.
- ✍️ **« Essaie-le toi-même »** : le code Python s'exécute directement dans le navigateur (Pyodide). Pour le COBOL, l'IA simule l'exécution.
- 🔥 **Streak façon Duolingo** : une leçon par jour pour garder ta flamme, XP, objectif quotidien, gels de streak ❄️.
- 🤖 **Tuteur IA** : un chat avec Claude qui connaît la leçon en cours, explique le code et t'aide quand tu te trompes.

Aucun serveur, aucune installation : c'est du HTML/CSS/JavaScript pur.

---

## 🚀 Lancer l'app

**En ligne** : via GitHub Pages (Settings → Pages → Branch `main` / root).

**En local** :

```bash
git clone https://github.com/DavidJ97/codestreak.git
cd codestreak
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```

(Ouvrir directement `index.html` marche aussi, mais un petit serveur local évite certains blocages du navigateur.)

### Activer le tuteur IA

1. Crée une clé API sur [console.anthropic.com](https://console.anthropic.com).
2. Dans l'app, clique sur ⚙️ **Réglages** et colle ta clé.
3. Ouvre 💬 et pose tes questions.

> La clé est enregistrée **uniquement dans ton navigateur** (localStorage) et n'est envoyée qu'à `api.anthropic.com`. Ne la mets jamais dans le code du repo.

---

## 🗺️ Contenu des cours

### Avant-garde IA (6 leçons chacun, sources officielles citées dans chaque leçon)

| Cours | Contenu | Références |
|---|---|---|
| UX/UI de l'IA | 18 lignes directrices HAX, confiance calibrée, streaming accessible, UX des agents, transparence et cadre légal, interfaces génératives et multimodales | Microsoft HAX Toolkit, Google PAIR Guidebook, AI Act art. 50, Loi 25 art. 12.1, MCP 2026-07-28, WCAG 2.2 / 3.0 |
| AI Engineering | API Messages, prompt engineering, RAG, tool use / agents / MCP, évaluations, context engineering et production | Docs Claude, *Building effective agents*, *Effective context engineering*, Model Context Protocol |
| AI Linguist | Le métier, tokens et langues (BPE, Unicode), guides d'annotation et kappa de Cohen, évaluation de la langue, multilinguisme, annotation assistée | Offres d'emploi réelles, *Datasheets for Datasets*, Hugging Face LLM Course |
| Sécurité de l'IA | OWASP LLM Top 10 2025, injection de prompt, OWASP Agentic 2026, sorties/données/coûts, red teaming et gouvernance, chaîne d'approvisionnement et MCP | OWASP GenAI, MITRE ATLAS, NIST AI RMF / AI 600-1, AI Act (règl. 2026/1744) |

### Projets portfolio (14)

Chaque cours mène à 2 ou 3 projets pensés pour un dépôt GitHub : étapes cochables, livrables attendus, questions d'entrevue, documentation officielle et README de départ copiable. Exemples : CLI testée avec CI, API FastAPI + Docker, batch COBOL avec CI GnuCOBOL, modernisation COBOL → Python, assistant RAG avec evals, serveur MCP, agent avec garde-fous, benchmark français québécois / créole, red team d'une app LLM, passerelle de sécurité pour agents.

### Métiers visés (5)

L'écran **Projets** relie chaque poste à ses cours et à ses projets, avec ce que regardent les recruteurs et l'avancement : AI Engineer, Designer UX/UI de l'IA, AI Linguist, Sécurité de l'IA, Développeur COBOL et modernisation.

### Fondations

| Python (16 leçons, ordre W3Schools) | COBOL (13 leçons) |
|---|---|
| Introduction · Syntaxe et indentation · Commentaires · Variables · Types de données · Nombres et conversion · Chaînes · Booléens et opérateurs · Listes · Tuples et sets · Dictionnaires · if / elif / else · Boucles · Fonctions et lambda · Classes et objets · Gestion des erreurs | Introduction · Les 4 divisions · Format des colonnes · Variables et niveaux · Clause PIC · DISPLAY / ACCEPT · MOVE · Calculs · IF / EVALUATE · Boucles PERFORM · Tableaux (OCCURS) · Chaînes · Fichiers séquentiels |

Tous les exemples Python s'exécutent sans erreur, et tous les exemples COBOL compilent avec **GnuCOBOL** (`cobc -x programme.cbl`).

---

## 🎛️ Cadran rotatif (navigation)

La navigation principale est un cadran, repris du projet Wing Chun Revolution : un dôme au bas de l'écran s'ouvre en étoile et déploie les pages (Accueil, Projets, Certifs, Veille) sur une roue infinie. On la tourne au doigt, avec les flèches ou le clavier (← →, Échap) ; la page en haut de la roue est la page affichée, et elle entre en arc du côté d'où vient son icône. Clics sonores générés par Web Audio, indice animé à la première ouverture, mouvement réduit respecté. Code : `js/dial.js` et `css/dial.css`.

## 🔥 Règles du streak

| Action | Effet |
|---|---|
| Terminer une leçon dans la journée | La flamme du jour s'allume, le streak +1 |
| Rater un jour | Le streak retombe à 0… |
| …sauf si tu as un gel ❄️ | Le gel protège automatiquement le jour manqué |
| 7 jours d'affilée | +1 gel (2 max en réserve) |
| Première réussite d'une leçon | +10 XP (+5 si sans erreur) |
| Refaire une leçon | +5 XP |

Comme dans Duolingo, un exercice raté est **reposé à la fin** de la leçon jusqu'à ce qu'il soit réussi.

---

## 🧱 Structure du code

```
codestreak/
├── index.html            Page unique : barre du haut, zone d'écran, panneau de chat, modale
├── css/style.css         Tout le style (boutons 3D façon Duolingo, thème sombre auto, mobile)
└── js/
    ├── storage.js        Sauvegarde locale (localStorage) protégée contre les erreurs
    ├── icons.js          Jeu d'icônes SVG
    ├── lessons/
    │   ├── python.js     Leçons Python (théorie + exemple + exercices)
    │   ├── cobol.js      Leçons COBOL
    │   ├── uxai.js       UX/UI de l'IA (exemples HTML avec aperçu)
    │   ├── aieng.js      AI Engineering
    │   ├── linguist.js   AI Linguist
    │   └── aisec.js      Sécurité de l'IA
    ├── projects.js       Projets portfolio de chaque cours
    ├── streak.js         Streak, XP, objectif quotidien, gels
    ├── runner.js         Exécution de Python dans le navigateur (Pyodide, chargé à la demande)
    ├── chat.js           Tuteur IA : appel à l'API Anthropic + rendu des réponses
    └── app.js            Écrans, navigation, logique des exercices
```

Chaque fichier commence par un en-tête qui explique son rôle, et le code est commenté en français.

### Ajouter une leçon

Ajoute un objet dans `js/lessons/python.js` ou `js/lessons/cobol.js` :

```js
{
  id: "py-modules",            // identifiant unique
  title: "Modules",
  icon: "📦",
  theory: `<h2>...</h2><p>...</p>`,
  example: `import math\nprint(math.pi)`,
  exercises: [
    { type: "mcq",   q: "Question ?", choices: ["a", "b"], answer: 1, explain: "..." },
    { type: "fill",  q: "Complète :", code: `___ math`, answers: ["import"], explain: "..." },
    { type: "order", q: "Remets dans l'ordre :", lines: ["ligne 1", "ligne 2"], explain: "..." },
  ],
}
```

La leçon apparaît automatiquement dans le parcours.

---

## 🛠️ Technologies

- HTML / CSS / JavaScript vanilla (aucun framework, aucune compilation)
- [Pyodide](https://pyodide.org) — Python dans le navigateur (WebAssembly)
- [Prism](https://prismjs.com) — coloration syntaxique Python et COBOL
- [API Claude d'Anthropic](https://docs.claude.com) — tuteur IA

Contenu pédagogique rédigé pour ce projet, en suivant la progression des tutoriels W3Schools.
