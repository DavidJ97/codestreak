/* ============================================================================
   lessons/cobol.js — Cours de COBOL
   ----------------------------------------------------------------------------
   W3Schools n'a pas de tutoriel COBOL : on reprend donc sa méthode (chapitres
   courts, un exemple par notion, exercices rapides) appliquée au COBOL.

   Même format de leçon que python.js (voir l'en-tête de ce fichier).

   À propos du format des exemples : on utilise le format "fixe" classique
   des mainframes. Les 7 premières colonnes sont laissées vides, donc :
     - colonne 8  (zone A) : DIVISIONS, SECTIONS, paragraphes, niveaux 01/77
     - colonne 12 (zone B) : instructions et niveaux subordonnés
   Tous les exemples compilent avec GnuCOBOL :  cobc -x programme.cbl
   ========================================================================== */

window.COURSES = window.COURSES || {};

window.COURSES.cobol = {
  id: "cobol",
  name: "COBOL",
  badge: "🏦",
  language: "cobol",
  runnable: false, // pas d'exécution dans le navigateur : on propose l'IA pour "simuler"
  tagline: "Le langage des banques et des mainframes : rare, recherché, toujours en production.",
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: "cb-intro",
      title: "Introduction",
      icon: "👋",
      theory: `
        <h2>Qu'est-ce que le COBOL ?</h2>
        <p><b>COBOL</b> = <i>COmmon Business-Oriented Language</i>. Créé en 1959 par un comité (CODASYL)
        fortement inspiré des travaux de Grace Hopper, il a été conçu pour la gestion : paie, comptabilité,
        transactions bancaires.</p>
        <ul>
          <li>Il tourne encore sur les <b>mainframes</b> (IBM z/OS) des banques, assurances et gouvernements.</li>
          <li>Sa syntaxe ressemble à de l'anglais : <code>ADD TAXE TO TOTAL.</code></li>
          <li>Il excelle dans les calculs décimaux exacts (pas d'erreurs d'arrondi sur l'argent).</li>
          <li>Peu de développeurs le maîtrisent : c'est une compétence <b>rare et bien payée</b>.</li>
        </ul>
        <p>Voici le traditionnel « Bonjour le monde ». <code>DISPLAY</code> affiche, <code>STOP RUN</code> termine le programme.</p>
        <div class="tip">💡 Pour exécuter du COBOL chez toi : installe <b>GnuCOBOL</b> puis
        <code>cobc -x bonjour.cbl && ./bonjour</code>. Ici, tu peux demander à l'IA de simuler l'exécution.</div>`,
      example: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. BONJOUR.
       PROCEDURE DIVISION.
           DISPLAY "Bonjour, le monde !".
           STOP RUN.`,
      exercises: [
        { type: "mcq", q: "Que signifie COBOL ?",
          choices: ["Computer Oriented Basic Language", "COmmon Business-Oriented Language", "Compiled Object-Based Language", "Central Online Banking Language"], answer: 1,
          explain: "Un langage commun orienté gestion (business)." },
        { type: "mcq", q: "Où le COBOL est-il le plus utilisé aujourd'hui ?",
          choices: ["Jeux vidéo", "Banques, assurances, administrations", "Applications mobiles", "Sites web front-end"], answer: 1,
          explain: "Une grande partie des transactions financières passe encore par du COBOL." },
        { type: "fill", q: "Complète pour afficher du texte :", code: `           ___ "Bonjour".`, answers: ["DISPLAY"],
          explain: "DISPLAY est l'équivalent du print() de Python." },
        { type: "mcq", q: "Quelle instruction termine le programme ?", choices: ["END.", "EXIT PROGRAM-ID.", "STOP RUN.", "QUIT."], answer: 2,
          explain: "STOP RUN rend la main au système." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "cb-structure",
      title: "Les 4 divisions",
      icon: "🏛️",
      theory: `
        <h2>Un programme en 4 parties</h2>
        <p>Tout programme COBOL est découpé en <b>divisions</b>, toujours dans cet ordre :</p>
        <table>
          <tr><th>Division</th><th>Rôle</th></tr>
          <tr><td><code>IDENTIFICATION</code></td><td>Nom du programme (<code>PROGRAM-ID</code>), auteur…</td></tr>
          <tr><td><code>ENVIRONMENT</code></td><td>Lien avec le système : fichiers, machine</td></tr>
          <tr><td><code>DATA</code></td><td>Déclaration de <b>toutes</b> les variables</td></tr>
          <tr><td><code>PROCEDURE</code></td><td>Les instructions (la logique)</td></tr>
        </table>
        <p>Hiérarchie : <b>division</b> → <b>section</b> → <b>paragraphe</b> → <b>phrase</b> (sentence) → <b>instruction</b>.
        Une phrase se termine par un <b>point</b>.</p>`,
      example: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. STRUCTURE.
       AUTHOR. JUPITERRE.

       ENVIRONMENT DIVISION.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-MESSAGE   PIC X(30) VALUE "Les 4 divisions sont la !".

       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY WS-MESSAGE.
           STOP RUN.`,
      exercises: [
        { type: "order", q: "Remets les divisions dans le bon ordre :",
          lines: ["IDENTIFICATION DIVISION.", "ENVIRONMENT DIVISION.", "DATA DIVISION.", "PROCEDURE DIVISION."],
          explain: "Moyen mnémotechnique : I-E-D-P (« Il Est Déjà Parti »)." },
        { type: "mcq", q: "Dans quelle division déclare-t-on les variables ?", choices: ["IDENTIFICATION", "ENVIRONMENT", "DATA", "PROCEDURE"], answer: 2,
          explain: "Toutes les données sont déclarées dans la DATA DIVISION." },
        { type: "mcq", q: "Dans quelle division écrit-on la logique ?", choices: ["IDENTIFICATION", "ENVIRONMENT", "DATA", "PROCEDURE"], answer: 3,
          explain: "La PROCEDURE DIVISION contient les instructions." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "cb-format",
      title: "Format des colonnes",
      icon: "📏",
      theory: `
        <h2>Héritage des cartes perforées</h2>
        <p>Le COBOL "classique" utilise un <b>format fixe</b> de 80 colonnes, hérité des cartes perforées :</p>
        <table>
          <tr><th>Colonnes</th><th>Zone</th><th>Contenu</th></tr>
          <tr><td>1–6</td><td>Séquence</td><td>Numéros de ligne (optionnels)</td></tr>
          <tr><td>7</td><td>Indicateur</td><td><code>*</code> = commentaire, <code>-</code> = continuation</td></tr>
          <tr><td>8–11</td><td>Zone A</td><td>Divisions, sections, paragraphes, niveaux 01 et 77</td></tr>
          <tr><td>12–72</td><td>Zone B</td><td>Instructions, niveaux 02 à 49</td></tr>
          <tr><td>73–80</td><td>Identification</td><td>Ignorée par le compilateur</td></tr>
        </table>
        <p>Depuis COBOL 2002, le <b>format libre</b> existe (<code>&gt;&gt;SOURCE FORMAT FREE</code>), mais sur mainframe
        tu verras surtout le format fixe.</p>`,
      example: `      * Ceci est un commentaire (asterisque en colonne 7)
       IDENTIFICATION DIVISION.
       PROGRAM-ID. COLONNES.
       PROCEDURE DIVISION.
      * Zone A (col. 8) : nom de paragraphe
       DEBUT.
      * Zone B (col. 12) : instructions
           DISPLAY "Zone A en colonne 8, zone B en colonne 12".
           STOP RUN.`,
      exercises: [
        { type: "mcq", q: "Quel caractère en colonne 7 indique un commentaire ?", choices: ["#", "*", "/", "-"], answer: 1,
          explain: "* en colonne 7 transforme la ligne en commentaire (- sert à la continuation)." },
        { type: "mcq", q: "À quelle colonne commence la zone A ?", choices: ["1", "7", "8", "12"], answer: 2,
          explain: "Zone A : colonnes 8 à 11." },
        { type: "mcq", q: "Où écrit-on les instructions comme DISPLAY ?", choices: ["Zone de séquence", "Colonne 7", "Zone A", "Zone B (12–72)"], answer: 3,
          explain: "Les instructions vont en zone B." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "cb-data",
      title: "Variables et niveaux",
      icon: "📦",
      theory: `
        <h2>WORKING-STORAGE et numéros de niveau</h2>
        <p>Les variables "de travail" se déclarent dans la <code>WORKING-STORAGE SECTION</code> de la DATA DIVISION.
        Chaque déclaration commence par un <b>numéro de niveau</b> qui définit la hiérarchie :</p>
        <ul>
          <li><code>01</code> : niveau le plus haut (un enregistrement ou une variable indépendante)</li>
          <li><code>02</code> à <code>49</code> : sous-éléments (on utilise souvent 05, 10, 15…)</li>
          <li><code>77</code> : variable isolée, sans sous-éléments</li>
          <li><code>88</code> : <b>nom de condition</b> (un booléen lié à une valeur)</li>
        </ul>
        <p>Un élément qui contient d'autres éléments est un <b>groupe</b> ; les autres sont <b>élémentaires</b>
        et portent une clause <code>PIC</code>.</p>`,
      example: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. NIVEAUX.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 CLIENT.
          05 CLIENT-NOM      PIC X(10) VALUE "ANA".
          05 CLIENT-AGE      PIC 99    VALUE 30.
          05 CLIENT-STATUT   PIC X     VALUE "A".
             88 CLIENT-ACTIF           VALUE "A".
             88 CLIENT-INACTIF         VALUE "I".
       77 COMPTEUR           PIC 9(3)  VALUE 0.
       PROCEDURE DIVISION.
           DISPLAY "Client : " CLIENT-NOM " age " CLIENT-AGE.
           IF CLIENT-ACTIF
               DISPLAY "Le client est actif"
           END-IF.
           STOP RUN.`,
      exercises: [
        { type: "mcq", q: "Quel niveau désigne le sommet d'un enregistrement ?", choices: ["00", "01", "77", "88"], answer: 1,
          explain: "01 est le niveau le plus haut." },
        { type: "mcq", q: "À quoi sert le niveau 88 ?", choices: ["Variable isolée", "Nom de condition", "Commentaire", "Tableau"], answer: 1,
          explain: "Un 88 crée une condition, ex. IF CLIENT-ACTIF." },
        { type: "fill", q: "Nom de la section des variables de travail :", code: `       ___ SECTION.`, answers: ["WORKING-STORAGE"],
          explain: "WORKING-STORAGE SECTION, dans la DATA DIVISION." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "cb-pic",
      title: "La clause PIC",
      icon: "🖼️",
      theory: `
        <h2>Décrire la forme d'une donnée</h2>
        <p><code>PIC</code> (PICTURE) décrit précisément le type et la taille d'une variable :</p>
        <table>
          <tr><th>Symbole</th><th>Signification</th><th>Exemple</th></tr>
          <tr><td><code>9</code></td><td>Chiffre</td><td><code>PIC 9(5)</code> → 0 à 99999</td></tr>
          <tr><td><code>X</code></td><td>N'importe quel caractère</td><td><code>PIC X(20)</code> → 20 caractères</td></tr>
          <tr><td><code>A</code></td><td>Lettre ou espace</td><td><code>PIC A(10)</code></td></tr>
          <tr><td><code>V</code></td><td>Virgule <b>implicite</b> (non stockée)</td><td><code>PIC 9(3)V99</code> → 123.45</td></tr>
          <tr><td><code>S</code></td><td>Signe (positif/négatif)</td><td><code>PIC S9(4)</code></td></tr>
          <tr><td><code>Z</code></td><td>Chiffre, zéro remplacé par espace (édition)</td><td><code>PIC ZZZ9</code></td></tr>
        </table>
        <p><code>9(5)</code> est un raccourci pour <code>99999</code>. La clause <code>VALUE</code> donne une valeur initiale.</p>`,
      example: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. PICTURE.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-QTE        PIC 9(3)     VALUE 7.
       01 WS-PRIX       PIC 9(4)V99  VALUE 19.99.
       01 WS-SOLDE      PIC S9(5)    VALUE -250.
       01 WS-PRIX-ED    PIC Z,ZZ9.99.
       01 WS-NOM        PIC X(15)    VALUE "COBOLEUR".
       PROCEDURE DIVISION.
           MOVE WS-PRIX TO WS-PRIX-ED.
           DISPLAY "Quantite : " WS-QTE.
           DISPLAY "Prix edite : " WS-PRIX-ED.
           DISPLAY "Solde : " WS-SOLDE.
           DISPLAY "Nom : [" WS-NOM "]".
           STOP RUN.`,
      exercises: [
        { type: "mcq", q: "Quelle valeur maximale peut contenir PIC 9(3) ?", choices: ["9", "99", "999", "9999"], answer: 2,
          explain: "Trois chiffres : jusqu'à 999." },
        { type: "mcq", q: "PIC X(10) contient…", choices: ["10 chiffres", "10 caractères quelconques", "un nombre jusqu'à 10", "10 lignes"], answer: 1,
          explain: "X = alphanumérique, (10) = longueur." },
        { type: "fill", q: "Ajoute une virgule implicite (2 décimales) :", code: `       01 PRIX PIC 9(4)___99.`, answers: ["V"],
          explain: "V marque la position de la virgule sans la stocker." },
        { type: "mcq", q: "Que signifie S dans PIC S9(4) ?", choices: ["String", "Signé (peut être négatif)", "Supprimer les zéros", "Section"], answer: 1,
          explain: "Sans S, le nombre est toujours positif." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "cb-display",
      title: "DISPLAY et ACCEPT",
      icon: "⌨️",
      theory: `
        <h2>Entrées / sorties console</h2>
        <p><code>DISPLAY</code> affiche une ou plusieurs valeurs collées les unes aux autres :
        <code>DISPLAY "Total : " WS-TOTAL</code>.</p>
        <p><code>ACCEPT</code> lit une saisie de l'utilisateur dans une variable : <code>ACCEPT WS-NOM</code>.</p>
        <p><code>ACCEPT</code> sait aussi lire des infos système :
        <code>ACCEPT WS-DATE FROM DATE YYYYMMDD</code>, <code>ACCEPT WS-HEURE FROM TIME</code>.</p>
        <p><code>WITH NO ADVANCING</code> évite le retour à la ligne après un DISPLAY.</p>`,
      example: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. ENTREES.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-NOM     PIC X(20).
       01 WS-DATE    PIC 9(8).
       PROCEDURE DIVISION.
           DISPLAY "Quel est ton nom ? " WITH NO ADVANCING.
           ACCEPT WS-NOM.
           ACCEPT WS-DATE FROM DATE YYYYMMDD.
           DISPLAY "Bienvenue " WS-NOM.
           DISPLAY "Nous sommes le " WS-DATE.
           STOP RUN.`,
      exercises: [
        { type: "fill", q: "Lis la saisie de l'utilisateur :", code: `           ___ WS-NOM.`, answers: ["ACCEPT"],
          explain: "ACCEPT est l'équivalent de input() en Python." },
        { type: "mcq", q: "Que fait WITH NO ADVANCING ?", choices: ["Efface l'écran", "Empêche le retour à la ligne", "Arrête le programme", "Affiche en majuscules"], answer: 1,
          explain: "Le curseur reste sur la même ligne, pratique pour une question." },
        { type: "mcq", q: "Comment récupérer la date du jour ?", choices: ["MOVE DATE TO WS-DATE", "ACCEPT WS-DATE FROM DATE", "DISPLAY DATE", "GET DATE"], answer: 1,
          explain: "ACCEPT ... FROM DATE lit l'horloge du système." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "cb-move",
      title: "MOVE",
      icon: "➡️",
      theory: `
        <h2>Copier des valeurs</h2>
        <p>En COBOL, on n'écrit pas <code>x = 5</code> : on écrit <code>MOVE 5 TO X</code>.
        On peut copier vers plusieurs variables : <code>MOVE 0 TO A B C</code>.</p>
        <p><b>Règles importantes :</b></p>
        <ul>
          <li><b>Alphanumérique</b> (PIC X) : aligné à <b>gauche</b>, complété par des espaces, tronqué à droite.</li>
          <li><b>Numérique</b> (PIC 9) : aligné à <b>droite</b> (sur la virgule), complété par des zéros, tronqué à gauche.</li>
        </ul>
        <p><code>INITIALIZE</code> remet un groupe à zéro / espaces d'un coup.</p>`,
      example: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. DEPLACER.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-COURT    PIC X(3).
       01 WS-NUM      PIC 9(3).
       01 WS-PETIT    PIC 9(2).
       PROCEDURE DIVISION.
           MOVE "ABCDE" TO WS-COURT.
           DISPLAY "[" WS-COURT "]".
           MOVE 5 TO WS-NUM.
           DISPLAY WS-NUM.
           MOVE 1234 TO WS-PETIT.
           DISPLAY WS-PETIT.
           STOP RUN.`,
      exercises: [
        { type: "fill", q: "Mets 100 dans WS-TOTAL :", code: `           ___ 100 TO WS-TOTAL.`, answers: ["MOVE"],
          explain: "MOVE source TO destination." },
        { type: "mcq", q: "MOVE \"ABCDE\" TO une variable PIC X(3) donne…", choices: ["\"ABC\"", "\"CDE\"", "\"ABCDE\"", "Erreur"], answer: 0,
          explain: "Alphanumérique : aligné à gauche, tronqué à droite." },
        { type: "mcq", q: "MOVE 5 TO une variable PIC 9(3) donne…", choices: ["500", "5", "005", "  5"], answer: 2,
          explain: "Numérique : aligné à droite, complété par des zéros." },
        { type: "mcq", q: "MOVE 1234 TO une variable PIC 9(2) donne…", choices: ["12", "34", "1234", "Erreur"], answer: 1,
          explain: "Numérique : tronqué à gauche (attention, aucune erreur n'est signalée !)." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "cb-arith",
      title: "Calculs",
      icon: "🧮",
      theory: `
        <h2>ADD, SUBTRACT, MULTIPLY, DIVIDE, COMPUTE</h2>
        <ul>
          <li><code>ADD 5 TO A</code> → A = A + 5</li>
          <li><code>SUBTRACT 2 FROM A</code> → A = A − 2</li>
          <li><code>MULTIPLY A BY B</code> → B = A × B</li>
          <li><code>DIVIDE 10 BY 4 GIVING R</code> → R = 10 / 4</li>
          <li><code>ADD A TO B GIVING C</code> → C = A + B (A et B inchangés)</li>
        </ul>
        <p><code>COMPUTE</code> permet d'écrire une formule classique : <code>COMPUTE TOTAL = PRIX * QTE * 1.15</code>.</p>
        <p><code>ROUNDED</code> arrondit au lieu de tronquer ; <code>ON SIZE ERROR</code> attrape les dépassements.</p>`,
      example: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. CALCULS.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-A        PIC 9(3)    VALUE 10.
       01 WS-B        PIC 9(3)    VALUE 4.
       01 WS-R        PIC 9(3)V99.
       01 WS-ARRONDI  PIC 9(3).
       01 WS-TOTAL    PIC 9(5)V99.
       PROCEDURE DIVISION.
           ADD 5 TO WS-A.
           DISPLAY "A apres ADD : " WS-A.
           DIVIDE WS-A BY WS-B GIVING WS-R.
           DISPLAY "15 / 4 = " WS-R.
           DIVIDE WS-A BY WS-B GIVING WS-ARRONDI ROUNDED.
           DISPLAY "Arrondi : " WS-ARRONDI.
           COMPUTE WS-TOTAL = WS-A * WS-B * 1.15.
           DISPLAY "Total avec taxes : " WS-TOTAL.
           STOP RUN.`,
      exercises: [
        { type: "fill", q: "Écris la formule avec une seule instruction :", code: `           ___ WS-TOTAL = WS-PRIX * WS-QTE.`, answers: ["COMPUTE"],
          explain: "COMPUTE accepte les opérateurs + - * / et **." },
        { type: "mcq", q: "A vaut 10. Que vaut A après ADD 5 TO A ?", choices: ["5", "10", "15", "105"], answer: 2,
          explain: "ADD 5 TO A ajoute 5 à A." },
        { type: "mcq", q: "DIVIDE 10 BY 4 GIVING R ROUNDED, avec R en PIC 9 :", choices: ["2", "2.5", "3", "Erreur"], answer: 2,
          explain: "2,5 arrondi donne 3 (sans ROUNDED, on aurait 2)." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "cb-if",
      title: "IF et EVALUATE",
      icon: "🔀",
      theory: `
        <h2>Conditions</h2>
        <p><code>IF condition ... ELSE ... END-IF</code>. Les comparaisons peuvent s'écrire en symboles
        (<code>&gt; &lt; =</code>) ou en anglais (<code>GREATER THAN</code>, <code>LESS THAN</code>, <code>EQUAL TO</code>).
        On combine avec <code>AND</code>, <code>OR</code>, <code>NOT</code>.</p>
        <p><code>EVALUATE</code> est l'équivalent du <i>switch/case</i> (ou du <i>match</i> de Python) :</p>
        <p><code>EVALUATE TRUE WHEN cond1 ... WHEN cond2 ... WHEN OTHER ... END-EVALUATE</code></p>
        <div class="tip">💡 Toujours fermer avec <code>END-IF</code> / <code>END-EVALUATE</code> : c'est plus sûr que de compter sur le point final.</div>`,
      example: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. CONDITIONS.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-NOTE   PIC 9(3) VALUE 75.
       PROCEDURE DIVISION.
           IF WS-NOTE >= 60
               DISPLAY "Reussi"
           ELSE
               DISPLAY "Echoue"
           END-IF.

           EVALUATE TRUE
               WHEN WS-NOTE >= 90
                   DISPLAY "Mention : A"
               WHEN WS-NOTE >= 70
                   DISPLAY "Mention : B"
               WHEN OTHER
                   DISPLAY "Mention : C"
           END-EVALUATE.
           STOP RUN.`,
      exercises: [
        { type: "fill", q: "Ferme correctement le bloc IF :", code: `           IF WS-AGE >= 18\n               DISPLAY "Majeur"\n           END-___.`, answers: ["IF"],
          explain: "END-IF termine explicitement le IF." },
        { type: "mcq", q: "EVALUATE est l'équivalent de…", choices: ["une boucle for", "un switch / case", "une fonction", "un tableau"], answer: 1,
          explain: "EVALUATE choisit une branche parmi plusieurs cas." },
        { type: "mcq", q: "Quel mot-clé correspond au cas « par défaut » dans EVALUATE ?", choices: ["ELSE", "DEFAULT", "WHEN OTHER", "OTHERWISE"], answer: 2,
          explain: "WHEN OTHER s'exécute si aucun autre WHEN ne correspond." },
        { type: "order", q: "Remets ce IF dans l'ordre :",
          lines: ["IF WS-SOLDE < 0", "    DISPLAY \"A decouvert\"", "ELSE", "    DISPLAY \"Solde positif\"", "END-IF."],
          explain: "IF, bloc vrai, ELSE, bloc faux, END-IF." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "cb-perform",
      title: "Boucles PERFORM",
      icon: "🔁",
      theory: `
        <h2>PERFORM : appeler et répéter</h2>
        <ul>
          <li><code>PERFORM NOM-PARAGRAPHE</code> : exécute le paragraphe puis revient (comme appeler une fonction).</li>
          <li><code>PERFORM 3 TIMES ... END-PERFORM</code> : répète 3 fois.</li>
          <li><code>PERFORM UNTIL condition ... END-PERFORM</code> : comme un <i>while</i> (mais la condition est une condition d'<b>arrêt</b>).</li>
          <li><code>PERFORM VARYING I FROM 1 BY 1 UNTIL I &gt; 5</code> : comme un <i>for</i>.</li>
        </ul>
        <p>Attention : <code>UNTIL</code> teste la condition <b>avant</b> chaque tour (par défaut).</p>`,
      example: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. BOUCLES.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-I   PIC 9(2).
       PROCEDURE DIVISION.
       PRINCIPAL.
           PERFORM AFFICHER-TITRE.
           PERFORM 2 TIMES
               DISPLAY "Bonjour !"
           END-PERFORM.
           PERFORM VARYING WS-I FROM 1 BY 1 UNTIL WS-I > 3
               DISPLAY "Tour numero " WS-I
           END-PERFORM.
           STOP RUN.

       AFFICHER-TITRE.
           DISPLAY "=== Demo PERFORM ===".`,
      exercises: [
        { type: "mcq", q: "Combien de fois s'exécute le corps ?", code: `PERFORM VARYING I FROM 1 BY 1 UNTIL I > 3`,
          choices: ["2", "3", "4", "Infini"], answer: 1, explain: "I vaut 1, 2, 3 ; à 4 la condition I > 3 est vraie et la boucle s'arrête." },
        { type: "fill", q: "Répète 5 fois :", code: `           PERFORM 5 ___\n               DISPLAY "Hop"\n           END-PERFORM.`, answers: ["TIMES"],
          explain: "PERFORM n TIMES." },
        { type: "mcq", q: "Que fait PERFORM CALCUL-TAXE ?", choices: ["Supprime le paragraphe", "Exécute le paragraphe puis revient", "Saute au paragraphe sans revenir", "Déclare une variable"], answer: 1,
          explain: "Contrairement à GO TO, PERFORM revient après le paragraphe." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "cb-tables",
      title: "Tableaux (OCCURS)",
      icon: "🗂️",
      theory: `
        <h2>Les tableaux en COBOL</h2>
        <p>Un tableau se déclare avec <code>OCCURS n TIMES</code> sur un niveau 02 à 49 (jamais sur un 01).</p>
        <p>On accède à un élément avec un <b>indice entre parenthèses</b> : <code>WS-MOIS(3)</code>.
        ⚠️ Les indices commencent à <b>1</b> (et non 0 comme en Python).</p>
        <p><code>INDEXED BY</code> crée un index optimisé, utilisé avec <code>SET</code> et <code>SEARCH</code> pour chercher dans le tableau.</p>`,
      example: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. TABLEAUX.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-NOTES.
          05 WS-NOTE   PIC 9(3) OCCURS 3 TIMES.
       01 WS-I         PIC 9.
       01 WS-SOMME     PIC 9(4) VALUE 0.
       PROCEDURE DIVISION.
           MOVE 80 TO WS-NOTE(1).
           MOVE 65 TO WS-NOTE(2).
           MOVE 92 TO WS-NOTE(3).
           PERFORM VARYING WS-I FROM 1 BY 1 UNTIL WS-I > 3
               ADD WS-NOTE(WS-I) TO WS-SOMME
           END-PERFORM.
           DISPLAY "Somme des notes : " WS-SOMME.
           STOP RUN.`,
      exercises: [
        { type: "mcq", q: "Quel est l'indice du premier élément d'un tableau COBOL ?", choices: ["0", "1", "-1", "Au choix"], answer: 1,
          explain: "En COBOL, on commence à 1." },
        { type: "fill", q: "Déclare un tableau de 12 mois :", code: `          05 MOIS PIC X(9) ___ 12 TIMES.`, answers: ["OCCURS"],
          explain: "OCCURS n TIMES répète l'élément n fois." },
        { type: "mcq", q: "Comment lire le 2e élément de WS-NOTE ?", choices: ["WS-NOTE[2]", "WS-NOTE(2)", "WS-NOTE.2", "WS-NOTE{2}"], answer: 1,
          explain: "Les indices s'écrivent entre parenthèses." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "cb-strings",
      title: "Chaînes de caractères",
      icon: "🔤",
      theory: `
        <h2>STRING, UNSTRING, INSPECT</h2>
        <ul>
          <li><code>STRING a DELIMITED BY SPACE b DELIMITED BY SIZE INTO c</code> : concatène.
          <code>DELIMITED BY SIZE</code> prend tout ; <code>BY SPACE</code> s'arrête au premier espace.</li>
          <li><code>UNSTRING c DELIMITED BY "," INTO a b</code> : découpe (comme <code>split()</code>).</li>
          <li><code>INSPECT x TALLYING n FOR ALL "A"</code> : compte ; <code>INSPECT x REPLACING ALL "A" BY "B"</code> : remplace.</li>
          <li><b>Référence partielle</b> : <code>WS-X(2:3)</code> = 3 caractères à partir du 2e.</li>
          <li>Fonctions intrinsèques : <code>FUNCTION UPPER-CASE(x)</code>, <code>FUNCTION TRIM(x)</code>, <code>FUNCTION LENGTH(x)</code>.</li>
        </ul>`,
      example: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. CHAINES.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-PRENOM   PIC X(10) VALUE "GRACE".
       01 WS-NOM      PIC X(10) VALUE "HOPPER".
       01 WS-COMPLET  PIC X(25) VALUE SPACES.
       01 WS-MOT      PIC X(5)  VALUE "COBOL".
       01 WS-NB-O     PIC 9(2)  VALUE 0.
       PROCEDURE DIVISION.
           STRING WS-PRENOM DELIMITED BY SPACE
                  " "       DELIMITED BY SIZE
                  WS-NOM    DELIMITED BY SPACE
                  INTO WS-COMPLET
           END-STRING.
           DISPLAY "Nom complet : " WS-COMPLET.
           DISPLAY "Extrait : " WS-MOT(2:3).
           INSPECT WS-MOT TALLYING WS-NB-O FOR ALL "O".
           DISPLAY "Nombre de O : " WS-NB-O.
           DISPLAY FUNCTION LOWER-CASE(WS-MOT).
           STOP RUN.`,
      exercises: [
        { type: "fill", q: "Concatène prénom et nom :", code: `           ___ WS-PRENOM DELIMITED BY SPACE\n                  WS-NOM DELIMITED BY SIZE\n                  INTO WS-COMPLET.`, answers: ["STRING"],
          explain: "STRING ... INTO assemble plusieurs morceaux." },
        { type: "mcq", q: "Que vaut WS-X(2:3) si WS-X contient \"COBOL\" ?", choices: ["\"COB\"", "\"OBO\"", "\"BOL\"", "\"OB\""], answer: 1,
          explain: "3 caractères à partir de la position 2 : O, B, O." },
        { type: "mcq", q: "Quelle instruction compte les occurrences d'un caractère ?", choices: ["COUNT", "INSPECT ... TALLYING", "UNSTRING", "SEARCH"], answer: 1,
          explain: "INSPECT TALLYING compte ; INSPECT REPLACING remplace." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "cb-files",
      title: "Fichiers séquentiels",
      icon: "🗄️",
      theory: `
        <h2>Lire et écrire des fichiers</h2>
        <p>Le traitement de fichiers est le cœur du COBOL "batch". Il faut 3 étapes :</p>
        <ol>
          <li><b>ENVIRONMENT DIVISION</b> → <code>FILE-CONTROL</code> : <code>SELECT</code> associe un nom logique à un fichier réel.</li>
          <li><b>DATA DIVISION</b> → <code>FILE SECTION</code> : <code>FD</code> décrit la structure d'un enregistrement.</li>
          <li><b>PROCEDURE DIVISION</b> : <code>OPEN</code>, <code>READ ... AT END</code>, <code>WRITE</code>, <code>CLOSE</code>.</li>
        </ol>
        <p>Modes d'ouverture : <code>INPUT</code> (lecture), <code>OUTPUT</code> (écriture, écrase), <code>EXTEND</code> (ajout), <code>I-O</code>.</p>`,
      example: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. LIRECLIENTS.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CLIENTS ASSIGN TO "clients.txt"
               ORGANIZATION IS LINE SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD F-CLIENTS.
       01 ENR-CLIENT.
          05 CLI-ID     PIC 9(4).
          05 CLI-NOM    PIC X(20).
       WORKING-STORAGE SECTION.
       01 WS-FIN        PIC X VALUE "N".
          88 FIN-FICHIER      VALUE "O".
       PROCEDURE DIVISION.
           OPEN INPUT F-CLIENTS.
           PERFORM UNTIL FIN-FICHIER
               READ F-CLIENTS
                   AT END SET FIN-FICHIER TO TRUE
                   NOT AT END DISPLAY CLI-ID " - " CLI-NOM
               END-READ
           END-PERFORM.
           CLOSE F-CLIENTS.
           STOP RUN.`,
      exercises: [
        { type: "order", q: "Remets les opérations sur le fichier dans l'ordre :",
          lines: ["OPEN INPUT F-CLIENTS.", "READ F-CLIENTS AT END SET FIN-FICHIER TO TRUE.", "CLOSE F-CLIENTS."],
          explain: "On ouvre, on lit, on ferme." },
        { type: "mcq", q: "Où se trouve la description FD d'un fichier ?", choices: ["WORKING-STORAGE SECTION", "FILE SECTION de la DATA DIVISION", "IDENTIFICATION DIVISION", "PROCEDURE DIVISION"], answer: 1,
          explain: "FD est dans la FILE SECTION." },
        { type: "fill", q: "Détecte la fin du fichier :", code: `           READ F-CLIENTS AT ___ SET FIN-FICHIER TO TRUE.`, answers: ["END"],
          explain: "AT END s'exécute quand il n'y a plus d'enregistrement." },
        { type: "mcq", q: "Quel mode d'ouverture ajoute à la fin d'un fichier existant ?", choices: ["INPUT", "OUTPUT", "EXTEND", "APPEND"], answer: 2,
          explain: "EXTEND ajoute ; OUTPUT écrase le contenu." },
      ],
    },
  ],
};
