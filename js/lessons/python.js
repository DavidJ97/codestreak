/* ============================================================================
   lessons/python.js — Cours de Python
   ----------------------------------------------------------------------------
   Le parcours suit l'ordre des chapitres du tutoriel Python de W3Schools
   (Intro → Syntaxe → Commentaires → Variables → Types → ... → Classes → Try).
   Les explications et les exercices sont rédigés pour cette app.

   FORMAT D'UNE LEÇON
   {
     id:        identifiant unique (sert à sauvegarder la progression)
     title:     titre affiché dans le parcours
     icon:      nom de l'icône SVG (voir js/icons.js)
     theory:    HTML de l'explication (affiché avant les exercices)
     example:   code d'exemple, modifiable et exécutable ("Essaie-le toi-même")
     exercises: liste d'exercices (voir ci-dessous)
   }

   TYPES D'EXERCICES
   - "mcq"   : choix multiple.          { q, code?, choices:[...], answer: index }
   - "fill"  : compléter le trou "___". { q, code, answers:[réponses acceptées] }
   - "order" : remettre les lignes dans l'ordre. { q, lines:[ordre correct] }
   Chaque exercice a un champ "explain" affiché après la réponse.

   Les leçons sont dans des gabarits `...` (template literals) : éviter
   d'écrire le caractère "accent grave" ou "${" dans le code des exemples.
   ========================================================================== */

window.COURSES = window.COURSES || {};

window.COURSES.python = {
  id: "python",
  name: "Python",
  badge: "code",
  language: "python",          // nom du langage pour Prism (coloration)
  run: "python",               // le code s'exécute dans le navigateur (Pyodide)
  group: "fondations",
  color: { light: "#2f63ff", dark: "#6f93ff" },
  tagline: "Le langage le plus populaire au monde : simple, lisible, partout (IA, web, data).",
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: "py-intro",
      title: "Introduction",
      icon: "book-open",
      theory: `
        <h2>Qu'est-ce que Python ?</h2>
        <p>Python est un langage de programmation créé par Guido van Rossum et publié en 1991.
        Il est utilisé pour le développement web (côté serveur), l'intelligence artificielle,
        l'analyse de données, l'automatisation de tâches, et bien plus.</p>
        <ul>
          <li>Sa syntaxe est proche de l'anglais : facile à lire.</li>
          <li>C'est un langage <b>interprété</b> : le code s'exécute ligne par ligne, sans compilation préalable.</li>
          <li>Il fonctionne sur Windows, Mac, Linux, Raspberry Pi…</li>
        </ul>
        <p>La première instruction à connaître est <code>print()</code>, qui affiche du texte à l'écran.</p>
        <div class="tip">Clique sur <b>Exécuter</b> ci-dessous, puis modifie le texte et relance !</div>`,
      example: `print("Bonjour, le monde !")
print("J'apprends Python avec CodeStreak")`,
      exercises: [
        { type: "mcq", q: "Quelle fonction affiche du texte à l'écran ?",
          choices: ["echo()", "print()", "display()", "write()"], answer: 1,
          explain: "print() envoie son contenu vers la sortie (la console)." },
        { type: "fill", q: "Complète pour afficher Salut :", code: `___("Salut")`, answers: ["print"],
          explain: "On appelle la fonction print avec le texte entre parenthèses." },
        { type: "mcq", q: "Python est un langage…",
          choices: ["compilé uniquement en binaire", "interprété", "réservé aux sites web", "de mise en page"], answer: 1,
          explain: "L'interpréteur Python lit et exécute le code directement." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-syntax",
      title: "Syntaxe et indentation",
      icon: "indent",
      theory: `
        <h2>L'indentation, c'est la loi</h2>
        <p>Dans beaucoup de langages, les blocs de code sont délimités par des accolades <code>{ }</code>.
        En Python, ce sont les <b>espaces en début de ligne</b> (l'indentation) qui indiquent qu'une ligne
        fait partie d'un bloc.</p>
        <p>Une ligne qui se termine par <code>:</code> (comme <code>if</code>, <code>for</code>, <code>def</code>)
        annonce un bloc : les lignes suivantes doivent être décalées.</p>
        <div class="tip">La convention (PEP 8) est d'utiliser <b>4 espaces</b> par niveau.
        Oublier l'indentation provoque une <code>IndentationError</code>.</div>`,
      example: `if 5 > 2:
    print("Cinq est plus grand que deux !")
    print("Cette ligne fait aussi partie du bloc if")
print("Celle-ci est en dehors du bloc")`,
      exercises: [
        { type: "mcq", q: "Que se passe-t-il si on n'indente pas la ligne après un if ?",
          choices: ["Rien de spécial", "Une IndentationError", "Le code s'exécute deux fois", "Python ajoute les espaces"], answer: 1,
          explain: "Python exige un bloc indenté après les deux-points." },
        { type: "mcq", q: "Combien d'espaces recommande la convention PEP 8 ?",
          choices: ["2", "4", "8", "1"], answer: 1,
          explain: "4 espaces par niveau d'indentation." },
        { type: "order", q: "Remets ce programme dans l'ordre :",
          lines: ["x = 10", "if x > 3:", "    print(\"x est grand\")"],
          explain: "On définit x, puis on teste, puis on affiche dans le bloc indenté." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-comments",
      title: "Commentaires",
      icon: "comment",
      theory: `
        <h2>Expliquer son code</h2>
        <p>Un commentaire commence par <code>#</code>. Tout ce qui suit sur la ligne est
        <b>ignoré</b> par Python : c'est une note pour les humains.</p>
        <p>Pour écrire plusieurs lignes, on met un <code>#</code> au début de chacune, ou on utilise
        une chaîne entre triples guillemets <code>"""..."""</code> qui n'est assignée à rien (souvent utilisée
        comme <i>docstring</i> pour documenter une fonction).</p>`,
      example: `# Ceci est un commentaire
print("Bonjour")  # un commentaire en fin de ligne

"""
Ceci est une chaîne sur plusieurs lignes
qui sert ici de commentaire.
"""
print("Fin")`,
      exercises: [
        { type: "mcq", q: "Quel symbole commence un commentaire en Python ?",
          choices: ["//", "#", "--", "/*"], answer: 1, explain: "// est utilisé en JavaScript, -- en SQL ; Python utilise #." },
        { type: "fill", q: "Transforme cette ligne en commentaire :", code: `___ Ceci est une note`, answers: ["#"],
          explain: "Le # désactive le reste de la ligne." },
        { type: "mcq", q: "Le texte après # sur une ligne de code est…",
          choices: ["exécuté", "ignoré", "affiché", "une erreur"], answer: 1, explain: "Python l'ignore complètement." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-variables",
      title: "Variables",
      icon: "box",
      theory: `
        <h2>Ranger des valeurs</h2>
        <p>Une variable est une "boîte" avec un nom qui contient une valeur. En Python, pas besoin de
        déclarer le type : la variable est créée au moment où on lui assigne une valeur avec <code>=</code>.</p>
        <p><b>Règles de nommage :</b></p>
        <ul>
          <li>Commence par une lettre ou <code>_</code> (jamais par un chiffre).</li>
          <li>Seulement lettres, chiffres et <code>_</code> (pas de tiret, pas d'espace).</li>
          <li>Sensible à la casse : <code>age</code> et <code>Age</code> sont deux variables différentes.</li>
        </ul>
        <p>On peut assigner plusieurs variables d'un coup : <code>x, y, z = 1, 2, 3</code>.</p>`,
      example: `nom = "Ana"
age = 30
print(nom, "a", age, "ans")

# Assignation multiple
x, y, z = "pomme", "banane", "cerise"
print(y)

# Une variable peut changer de type
age = "trente"
print(age)`,
      exercises: [
        { type: "mcq", q: "Lequel est un nom de variable valide ?",
          choices: ["2nom", "mon-nom", "mon_nom", "mon nom"], answer: 2,
          explain: "Le tiret et l'espace sont interdits, et un nom ne peut pas commencer par un chiffre." },
        { type: "fill", q: "Assigne 30 à la variable age :", code: `age ___ 30`, answers: ["="],
          explain: "Le signe = sert à l'assignation (== sert à comparer)." },
        { type: "mcq", q: "Qu'affiche ce code ?", code: `x, y, z = "a", "b", "c"\nprint(y)`,
          choices: ["a", "b", "c", "abc"], answer: 1, explain: "y reçoit la 2e valeur." },
        { type: "order", q: "Remets dans l'ordre pour afficher « Salut Ana » :",
          lines: ["nom = \"Ana\"", "message = \"Salut \" + nom", "print(message)"],
          explain: "Une variable doit exister avant d'être utilisée." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-datatypes",
      title: "Types de données",
      icon: "shapes",
      theory: `
        <h2>Chaque valeur a un type</h2>
        <table>
          <tr><th>Catégorie</th><th>Types</th><th>Exemple</th></tr>
          <tr><td>Texte</td><td><code>str</code></td><td><code>"Bonjour"</code></td></tr>
          <tr><td>Nombres</td><td><code>int</code>, <code>float</code>, <code>complex</code></td><td><code>5</code>, <code>3.14</code>, <code>1j</code></td></tr>
          <tr><td>Séquences</td><td><code>list</code>, <code>tuple</code>, <code>range</code></td><td><code>[1, 2]</code>, <code>(1, 2)</code></td></tr>
          <tr><td>Correspondance</td><td><code>dict</code></td><td><code>{"a": 1}</code></td></tr>
          <tr><td>Ensembles</td><td><code>set</code></td><td><code>{1, 2}</code></td></tr>
          <tr><td>Booléen</td><td><code>bool</code></td><td><code>True</code></td></tr>
          <tr><td>Rien</td><td><code>NoneType</code></td><td><code>None</code></td></tr>
        </table>
        <p>La fonction <code>type()</code> renvoie le type d'une valeur.</p>`,
      example: `print(type("Bonjour"))
print(type(42))
print(type(3.14))
print(type([1, 2, 3]))
print(type({"nom": "Ana"}))
print(type(True))
print(type(None))`,
      exercises: [
        { type: "mcq", q: "Quel est le type de 3.14 ?", choices: ["int", "float", "str", "decimal"], answer: 1,
          explain: "Un nombre à virgule est un float." },
        { type: "mcq", q: "Quel est le type de \"5\" (avec guillemets) ?", choices: ["int", "float", "str", "bool"], answer: 2,
          explain: "Les guillemets en font une chaîne de caractères (str)." },
        { type: "fill", q: "Complète pour afficher le type de 42 :", code: `print(___(42))`, answers: ["type"],
          explain: "type() renvoie la classe de la valeur : <class 'int'>." },
        { type: "mcq", q: "Quel type représente [1, 2, 3] ?", choices: ["tuple", "set", "list", "dict"], answer: 2,
          explain: "Les crochets créent une liste." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-numbers",
      title: "Nombres et conversion",
      icon: "hash",
      theory: `
        <h2>int, float et casting</h2>
        <p><code>int</code> = entier (<code>7</code>, <code>-3</code>), <code>float</code> = nombre décimal (<code>2.5</code>).</p>
        <p><b>Opérateurs arithmétiques :</b> <code>+ - * /</code>, plus :</p>
        <ul>
          <li><code>//</code> division entière : <code>7 // 2</code> → <code>3</code></li>
          <li><code>%</code> modulo (reste) : <code>7 % 2</code> → <code>1</code></li>
          <li><code>**</code> puissance : <code>2 ** 3</code> → <code>8</code></li>
        </ul>
        <p>Le <b>casting</b> convertit une valeur : <code>int("42")</code>, <code>float(3)</code>, <code>str(10)</code>.
        Attention, <code>int(3.9)</code> donne <code>3</code> : la partie décimale est coupée, pas arrondie.</p>`,
      example: `a = 7
b = 2
print(a / b)    # 3.5
print(a // b)   # 3
print(a % b)    # 1
print(a ** b)   # 49

texte = "42"
nombre = int(texte)
print(nombre + 8)

print(int(3.9))
print(round(3.9))`,
      exercises: [
        { type: "mcq", q: "Que donne int(3.9) ?", choices: ["3", "4", "3.9", "Erreur"], answer: 0,
          explain: "int() tronque : il coupe la partie décimale." },
        { type: "fill", q: "Convertis la chaîne en entier :", code: `n = ___("42")`, answers: ["int"],
          explain: "int() transforme \"42\" en 42." },
        { type: "mcq", q: "Que vaut 7 // 2 ?", choices: ["3.5", "3", "4", "1"], answer: 1,
          explain: "// est la division entière." },
        { type: "mcq", q: "Que vaut 10 % 3 ?", choices: ["3", "1", "0", "3.33"], answer: 1,
          explain: "10 = 3×3 + 1, le reste est 1." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-strings",
      title: "Chaînes de caractères",
      icon: "type",
      theory: `
        <h2>Manipuler du texte</h2>
        <p>Une chaîne (<code>str</code>) s'écrit entre <code>"..."</code> ou <code>'...'</code>.
        Chaque caractère a une position (index) qui commence à <b>0</b>.</p>
        <ul>
          <li><code>s[0]</code> : premier caractère · <code>s[-1]</code> : dernier</li>
          <li><code>s[1:4]</code> : du caractère 1 inclus au 4 <b>exclu</b> (slicing)</li>
          <li><code>len(s)</code> : longueur</li>
          <li><code>s.upper()</code>, <code>s.lower()</code>, <code>s.strip()</code>, <code>s.replace(a, b)</code>, <code>s.split(",")</code></li>
          <li><code>"th" in s</code> : vérifie si un morceau est présent</li>
        </ul>
        <p>Les <b>f-strings</b> insèrent des variables : <code>f"Salut {nom}"</code>.</p>`,
      example: `s = "Python"
print(s[0])
print(s[-1])
print(s[1:4])
print(len(s))
print(s.upper())

nom = "Léa"
age = 25
print(f"{nom} a {age} ans")

phrase = "pomme,banane,cerise"
print(phrase.split(","))`,
      exercises: [
        { type: "mcq", q: "Que vaut \"Python\"[0] ?", choices: ["\"P\"", "\"y\"", "\"n\"", "Erreur"], answer: 0,
          explain: "Les index commencent à 0." },
        { type: "mcq", q: "Que vaut \"Python\"[1:4] ?", choices: ["\"Pyth\"", "\"yth\"", "\"ytho\"", "\"tho\""], answer: 1,
          explain: "Indices 1, 2 et 3 (le 4 est exclu) : y, t, h." },
        { type: "fill", q: "Mets le texte en majuscules :", code: `texte.___()`, answers: ["upper"],
          explain: "upper() renvoie une copie en majuscules." },
        { type: "mcq", q: "Qu'affiche ce code ?", code: `nom = "Léa"\nprint(f"Salut {nom}")`,
          choices: ["Salut {nom}", "Salut Léa", "f\"Salut Léa\"", "Erreur"], answer: 1,
          explain: "Le f devant la chaîne remplace {nom} par la valeur de la variable." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-booleans",
      title: "Booléens et opérateurs",
      icon: "toggle",
      theory: `
        <h2>Vrai ou faux</h2>
        <p>Un booléen vaut <code>True</code> ou <code>False</code>. On les obtient surtout en comparant :</p>
        <p><code>==</code> égal · <code>!=</code> différent · <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code></p>
        <p><b>Opérateurs logiques :</b> <code>and</code> (les deux vrais), <code>or</code> (au moins un vrai), <code>not</code> (inverse).</p>
        <p><code>bool()</code> d'une valeur "vide" (<code>0</code>, <code>""</code>, <code>[]</code>, <code>None</code>) donne <code>False</code>.
        Presque tout le reste donne <code>True</code>.</p>`,
      example: `print(10 > 9)
print(10 == 9)
x = 5
print(x > 0 and x < 10)
print(x < 0 or x == 5)
print(not True)

print(bool(0), bool(""), bool("abc"), bool([1]))`,
      exercises: [
        { type: "mcq", q: "Que donne 10 > 9 ?", choices: ["True", "False", "10", "Erreur"], answer: 0, explain: "10 est bien plus grand que 9." },
        { type: "mcq", q: "Que donne bool(0) ?", choices: ["True", "False", "0", "None"], answer: 1, explain: "0 est considéré comme « vide », donc False." },
        { type: "fill", q: "x doit être positif ET inférieur à 10 :", code: `if x > 0 ___ x < 10:`, answers: ["and"],
          explain: "and exige que les deux conditions soient vraies." },
        { type: "mcq", q: "Quel opérateur teste l'égalité ?", choices: ["=", "==", "===", "eq"], answer: 1,
          explain: "= assigne, == compare." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-lists",
      title: "Listes",
      icon: "list",
      theory: `
        <h2>Des collections ordonnées et modifiables</h2>
        <p>Une liste s'écrit entre crochets : <code>fruits = ["pomme", "banane"]</code>.
        Elle est <b>ordonnée</b>, <b>modifiable</b> et accepte les doublons.</p>
        <ul>
          <li><code>fruits[0]</code>, <code>fruits[-1]</code> : accès par index</li>
          <li><code>append(x)</code> : ajoute à la fin · <code>insert(i, x)</code> : insère à la position i</li>
          <li><code>remove(x)</code> : retire la valeur x · <code>pop()</code> : retire le dernier élément</li>
          <li><code>sort()</code> : trie · <code>len(liste)</code> : nombre d'éléments</li>
        </ul>
        <p>Bonus : la <b>compréhension de liste</b> crée une liste en une ligne :
        <code>[n * 2 for n in nombres]</code>.</p>`,
      example: `fruits = ["pomme", "banane", "cerise"]
print(fruits[-1])

fruits.append("kiwi")
fruits.insert(1, "mangue")
fruits.remove("banane")
print(fruits)
print(len(fruits))

nombres = [3, 1, 2]
nombres.sort()
print(nombres)
print([n * 2 for n in nombres])`,
      exercises: [
        { type: "mcq", q: "Que vaut fruits[-1] ?", code: `fruits = ["pomme", "banane", "cerise"]`,
          choices: ["\"pomme\"", "\"banane\"", "\"cerise\"", "Erreur"], answer: 2, explain: "-1 désigne le dernier élément." },
        { type: "fill", q: "Ajoute \"kiwi\" à la fin de la liste :", code: `fruits.___("kiwi")`, answers: ["append"],
          explain: "append() ajoute à la fin." },
        { type: "order", q: "Remets dans l'ordre pour afficher [1, 2, 3] :",
          lines: ["nombres = [3, 1, 2]", "nombres.sort()", "print(nombres)"], explain: "On crée, on trie, on affiche." },
        { type: "mcq", q: "Que vaut len([1, 2, 3, 4]) ?", choices: ["3", "4", "5", "10"], answer: 1, explain: "Il y a 4 éléments." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-tuples-sets",
      title: "Tuples et sets",
      icon: "layers",
      theory: `
        <h2>Deux autres collections</h2>
        <p><b>Tuple</b> <code>(1, 2, 3)</code> : ordonné mais <b>non modifiable</b> (immuable).
        Parfait pour des valeurs qui ne doivent pas changer (coordonnées, jours de la semaine...).
        Attention : un tuple d'un seul élément s'écrit <code>("a",)</code> avec une virgule.</p>
        <p><b>Set</b> <code>{1, 2, 3}</code> : <b>non ordonné</b> et <b>sans doublons</b>.
        Utile pour supprimer les doublons ou tester l'appartenance rapidement.
        Méthodes : <code>add()</code>, <code>remove()</code>, <code>union()</code>, <code>intersection()</code>.</p>`,
      example: `point = (10, 20)
print(point[0])
# point[0] = 5   -> provoquerait une TypeError

nombres = {1, 1, 2, 3, 3}
print(nombres)        # les doublons disparaissent
nombres.add(4)
print(len(nombres))

a = {1, 2, 3}
b = {2, 3, 4}
print(a.intersection(b))`,
      exercises: [
        { type: "mcq", q: "Peut-on modifier un élément d'un tuple ?", choices: ["Oui", "Non", "Seulement le premier", "Avec append()"], answer: 1,
          explain: "Un tuple est immuable." },
        { type: "mcq", q: "Que vaut len({1, 1, 2, 3}) ?", choices: ["4", "3", "2", "Erreur"], answer: 1,
          explain: "Le set retire le doublon : {1, 2, 3}." },
        { type: "mcq", q: "Quels symboles créent un tuple ?", choices: ["[ ]", "( )", "{ }", "< >"], answer: 1,
          explain: "Parenthèses = tuple, crochets = liste, accolades = set ou dict." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-dicts",
      title: "Dictionnaires",
      icon: "braces",
      theory: `
        <h2>Des paires clé → valeur</h2>
        <p>Un dictionnaire associe des <b>clés</b> à des <b>valeurs</b> : <code>{"nom": "Ana", "age": 30}</code>.</p>
        <ul>
          <li><code>d["nom"]</code> : lire une valeur (erreur si la clé n'existe pas)</li>
          <li><code>d.get("ville")</code> : lire sans erreur (renvoie <code>None</code> si absente)</li>
          <li><code>d["ville"] = "Montréal"</code> : ajouter ou modifier</li>
          <li><code>d.keys()</code>, <code>d.values()</code>, <code>d.items()</code></li>
        </ul>`,
      example: `personne = {"nom": "Ana", "age": 30}
print(personne["age"])
print(personne.get("ville"))

personne["ville"] = "Montréal"
personne["age"] = 31

for cle, valeur in personne.items():
    print(cle, "→", valeur)`,
      exercises: [
        { type: "mcq", q: "Que donne personne[\"age\"] ?", code: `personne = {"nom": "Ana", "age": 30}`,
          choices: ["\"Ana\"", "30", "\"age\"", "Erreur"], answer: 1, explain: "On lit la valeur associée à la clé \"age\"." },
        { type: "fill", q: "Parcours les paires clé/valeur :", code: `for cle, valeur in personne.___():`, answers: ["items"],
          explain: "items() renvoie des paires (clé, valeur)." },
        { type: "mcq", q: "Que renvoie d.get(\"x\") si la clé n'existe pas ?", choices: ["0", "Une KeyError", "None", "\"\""], answer: 2,
          explain: "get() renvoie None (ou la valeur par défaut donnée en 2e argument)." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-if",
      title: "Conditions if / elif / else",
      icon: "branch",
      theory: `
        <h2>Prendre des décisions</h2>
        <p><code>if</code> exécute un bloc si la condition est vraie. <code>elif</code> ("else if") teste une
        autre condition si la précédente est fausse. <code>else</code> attrape tous les autres cas.</p>
        <p>Python teste les conditions <b>dans l'ordre</b> et s'arrête à la première qui est vraie.</p>
        <p>Version courte (opérateur ternaire) : <code>print("A") if a > b else print("B")</code>.</p>`,
      example: `note = 75

if note >= 90:
    print("A")
elif note >= 70:
    print("B")
else:
    print("C")

age = 17
statut = "majeur" if age >= 18 else "mineur"
print(statut)`,
      exercises: [
        { type: "order", q: "Remets la structure dans l'ordre :",
          lines: ["note = 75", "if note >= 90:", "    print(\"A\")", "elif note >= 70:", "    print(\"B\")", "else:", "    print(\"C\")"],
          explain: "if, puis elif, puis else — chacun suivi de son bloc indenté." },
        { type: "mcq", q: "Avec note = 75, qu'affiche le programme ci-dessus ?", choices: ["A", "B", "C", "B puis C"], answer: 1,
          explain: "75 n'est pas ≥ 90, mais est ≥ 70 : on affiche B et on s'arrête." },
        { type: "fill", q: "Complète pour tester un 2e cas :", code: `if x > 10:\n    print("grand")\n___ x > 5:\n    print("moyen")`, answers: ["elif"],
          explain: "elif teste une autre condition." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-loops",
      title: "Boucles while et for",
      icon: "repeat",
      theory: `
        <h2>Répéter des actions</h2>
        <p><b>while</b> répète tant qu'une condition est vraie (attention à ne pas créer de boucle infinie !).</p>
        <p><b>for</b> parcourt une séquence (liste, chaîne, <code>range</code>...).</p>
        <ul>
          <li><code>range(5)</code> → 0, 1, 2, 3, 4</li>
          <li><code>range(2, 6)</code> → 2, 3, 4, 5 (la fin est exclue)</li>
          <li><code>break</code> : sort de la boucle · <code>continue</code> : passe au tour suivant</li>
        </ul>`,
      example: `i = 1
while i <= 3:
    print("while", i)
    i += 1

for lettre in "abc":
    print(lettre)

for n in range(10):
    if n == 2:
        continue
    if n == 5:
        break
    print("for", n)`,
      exercises: [
        { type: "mcq", q: "Qu'affiche ce code ?", code: `for i in range(3):\n    print(i)`,
          choices: ["1 2 3", "0 1 2", "0 1 2 3", "3"], answer: 1, explain: "range(3) commence à 0 et s'arrête avant 3." },
        { type: "fill", q: "Boucle 5 fois :", code: `for i in ___(5):`, answers: ["range"], explain: "range(5) produit 0 à 4." },
        { type: "mcq", q: "Quel mot-clé arrête complètement une boucle ?", choices: ["stop", "exit", "break", "continue"], answer: 2,
          explain: "break sort de la boucle ; continue saute seulement au tour suivant." },
        { type: "mcq", q: "Quelle est la dernière valeur de range(2, 6) ?", choices: ["6", "5", "2", "4"], answer: 1,
          explain: "La borne de fin est exclue." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-functions",
      title: "Fonctions et lambda",
      icon: "function",
      theory: `
        <h2>Réutiliser du code</h2>
        <p>Une fonction se définit avec <code>def</code>, prend des <b>paramètres</b> et peut
        <b>renvoyer</b> un résultat avec <code>return</code>.</p>
        <ul>
          <li>Valeur par défaut : <code>def saluer(nom="toi")</code></li>
          <li>Arguments nommés : <code>saluer(nom="Ana")</code></li>
          <li>Sans <code>return</code>, la fonction renvoie <code>None</code>.</li>
        </ul>
        <p>Une <b>lambda</b> est une petite fonction anonyme d'une seule expression :
        <code>double = lambda x: x * 2</code>.</p>`,
      example: `def saluer(nom="toi"):
    return f"Salut {nom} !"

print(saluer("Ana"))
print(saluer())

def carre(n):
    return n * n

print(carre(4))

somme = lambda a, b: a + b
print(somme(2, 3))`,
      exercises: [
        { type: "fill", q: "Définis une fonction :", code: `___ saluer(nom):\n    print("Salut", nom)`, answers: ["def"],
          explain: "def introduit la définition d'une fonction." },
        { type: "order", q: "Remets dans l'ordre pour afficher 16 :",
          lines: ["def carre(n):", "    return n * n", "print(carre(4))"], explain: "On définit la fonction avant de l'appeler." },
        { type: "mcq", q: "Que vaut f(2, 3) ?", code: `f = lambda a, b: a + b`, choices: ["5", "6", "23", "Erreur"], answer: 0,
          explain: "La lambda additionne ses deux arguments." },
        { type: "mcq", q: "Que renvoie une fonction sans return ?", choices: ["0", "False", "None", "\"\""], answer: 2,
          explain: "Par défaut, une fonction renvoie None." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-classes",
      title: "Classes et objets",
      icon: "blocks",
      theory: `
        <h2>Programmation orientée objet</h2>
        <p>Une <b>classe</b> est un plan (un moule) ; un <b>objet</b> est une instance construite à partir de ce plan.</p>
        <ul>
          <li><code>__init__</code> est le constructeur : il s'exécute à la création de l'objet.</li>
          <li><code>self</code> désigne l'objet lui-même ; c'est toujours le premier paramètre des méthodes.</li>
          <li>Les <b>attributs</b> (<code>self.nom</code>) stockent les données, les <b>méthodes</b> définissent les comportements.</li>
        </ul>
        <p>L'<b>héritage</b> permet de créer une classe enfant : <code>class Chiot(Chien):</code>.</p>`,
      example: `class Chien:
    def __init__(self, nom, age):
        self.nom = nom
        self.age = age

    def aboyer(self):
        print(f"{self.nom} fait : Wouf !")

rex = Chien("Rex", 3)
rex.aboyer()
print(rex.age)

class Chiot(Chien):
    def aboyer(self):
        print(f"{self.nom} fait : Wif !")

Chiot("Pipo", 0).aboyer()`,
      exercises: [
        { type: "mcq", q: "À quoi sert __init__ ?", choices: ["À supprimer l'objet", "À initialiser l'objet à sa création", "À importer un module", "À afficher l'objet"], answer: 1,
          explain: "C'est le constructeur, appelé automatiquement." },
        { type: "fill", q: "Complète le premier paramètre :", code: `class Chien:\n    def __init__(___, nom):\n        self.nom = nom`, answers: ["self"],
          explain: "self représente l'instance en cours." },
        { type: "mcq", q: "Comment créer un objet de la classe Chien ?", choices: ["new Chien(\"Rex\")", "Chien(\"Rex\")", "Chien.create(\"Rex\")", "class Chien(\"Rex\")"], answer: 1,
          explain: "En Python, on appelle la classe comme une fonction (pas de mot-clé new)." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "py-try",
      title: "Gérer les erreurs",
      icon: "shield",
      theory: `
        <h2>try / except / finally</h2>
        <p>Quand une erreur (une <b>exception</b>) survient, le programme s'arrête... sauf si on l'attrape.</p>
        <ul>
          <li><code>try</code> : le code "risqué"</li>
          <li><code>except TypeErreur</code> : ce qu'on fait si cette erreur arrive</li>
          <li><code>else</code> : s'exécute s'il n'y a eu <b>aucune</b> erreur</li>
          <li><code>finally</code> : s'exécute <b>toujours</b>, erreur ou pas (fermer un fichier, etc.)</li>
        </ul>
        <p>On peut déclencher sa propre erreur avec <code>raise ValueError("message")</code>.</p>`,
      example: `try:
    resultat = 10 / 0
except ZeroDivisionError:
    print("Impossible de diviser par zéro !")
finally:
    print("Bloc finally : toujours exécuté")

try:
    n = int("abc")
except ValueError as e:
    print("Erreur :", e)`,
      exercises: [
        { type: "fill", q: "Complète pour attraper l'erreur :", code: `___:\n    x = 1 / 0\nexcept ZeroDivisionError:\n    print("oups")`, answers: ["try"],
          explain: "Le code risqué va dans le bloc try." },
        { type: "mcq", q: "Quand s'exécute le bloc finally ?", choices: ["Seulement s'il y a une erreur", "Seulement s'il n'y a pas d'erreur", "Toujours", "Jamais"], answer: 2,
          explain: "finally s'exécute dans tous les cas." },
        { type: "mcq", q: "Quelle erreur provoque int(\"abc\") ?", choices: ["TypeError", "ValueError", "NameError", "SyntaxError"], answer: 1,
          explain: "Le type est bon (str) mais la valeur ne peut pas être convertie : ValueError." },
      ],
    },
  ],
};
