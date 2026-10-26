# 🔥 CodeStreak — Apprendre Python et COBOL

Une petite app web pour apprendre **Python** et **COBOL** :

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

| Python (16 leçons, ordre W3Schools) | COBOL (13 leçons) |
|---|---|
| Introduction · Syntaxe et indentation · Commentaires · Variables · Types de données · Nombres et conversion · Chaînes · Booléens et opérateurs · Listes · Tuples et sets · Dictionnaires · if / elif / else · Boucles · Fonctions et lambda · Classes et objets · Gestion des erreurs | Introduction · Les 4 divisions · Format des colonnes · Variables et niveaux · Clause PIC · DISPLAY / ACCEPT · MOVE · Calculs · IF / EVALUATE · Boucles PERFORM · Tableaux (OCCURS) · Chaînes · Fichiers séquentiels |

Tous les exemples Python s'exécutent sans erreur, et tous les exemples COBOL compilent avec **GnuCOBOL** (`cobc -x programme.cbl`).

---

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
    ├── lessons/
    │   ├── python.js     Les leçons Python (théorie + exemple + exercices)
    │   └── cobol.js      Les leçons COBOL
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
