/* ============================================================================
   lessons/linguist.js — Cours « AI Linguist »
   ----------------------------------------------------------------------------
   Le métier qui relie la linguistique et les LLM : concevoir des guides
   d'annotation, mesurer l'accord entre annotateurs, évaluer la qualité de la
   langue produite par les modèles, gérer le multilinguisme et la localisation.

   Le contenu suit les offres d'emploi réelles du poste (évaluation de la
   qualité des IA, pipelines d'annotation, prompts d'annotation automatique,
   Python) et les pratiques de documentation des jeux de données.
   ========================================================================== */

window.COURSES = window.COURSES || {};

window.COURSES.linguist = {
  id: "linguist",
  group: "ia",
  name: "AI Linguist",
  badge: "type",
  color: { light: "#0c8599", dark: "#3bc9db" },
  language: "python",
  run: "python",
  tagline: "La linguistique au service des LLM : annotation, évaluation, multilinguisme.",
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: "al-role",
      title: "Le métier d'AI linguist",
      icon: "book-open",
      theory: `
        <h2>Ce que font vraiment les AI linguists</h2>
        <p>Dans les offres d'emploi (grandes plateformes, labos d'IA, entreprises de localisation), on retrouve :</p>
        <ul>
          <li>Résoudre des problèmes de <b>qualité et d'évaluation</b> des IA, avec des méthodes humaines, automatiques ou hybrides.</li>
          <li>Concevoir des <b>pipelines d'annotation</b> à grande échelle et les <b>guides</b> qui vont avec.</li>
          <li>Écrire des <b>prompts d'annotation ou d'évaluation automatique</b> (un LLM qui étiquette ou note).</li>
          <li>Analyser les données et travailler avec les ingénieurs IA et les équipes produit.</li>
        </ul>
        <p><b>Profil demandé :</b> linguistique ou linguistique computationnelle, <b>Python</b> pour scripter, rigueur,
        et souvent la maîtrise de plusieurs langues. Les langues peu dotées (créole haïtien, langues autochtones…) et les
        variétés régionales (français québécois) sont des niches où les experts sont rares.</p>`,
      example: `# Une annotation, c'est une donnée structurée et traçable
annotation = {
    "id": "ex-0042",
    "texte": "Chu ben content de ma commande, merci!",
    "langue": "fr-CA",
    "registre": "familier",
    "sentiment": "positif",
    "annotateur": "A1",
    "confiance": 0.9,
    "note": "« Chu » = « je suis » (oral québécois)",
}
for cle, valeur in annotation.items():
    print(f"{cle:>11} : {valeur}")`,
      sources: [
        { title: "Offre « AI Linguist » (LinkedIn, via Lerer Hippeau)", url: "https://jobs.lererhippeau.com/companies/linkedin-3-118fd507-eff7-455b-8b0e-0958d2d97380/jobs/37679936-ai-linguist-11-month-ftc" },
      ],
      exercises: [
        { type: "mcq", q: "Laquelle de ces tâches fait partie du métier d'AI linguist ?",
          choices: ["Réparer des serveurs", "Concevoir des guides et pipelines d'annotation", "Gérer la paie", "Dessiner des logos"], answer: 1,
          explain: "Annotation, évaluation et qualité des données sont au cœur du poste." },
        { type: "mcq", q: "Quel langage de programmation est le plus demandé pour ce poste ?", choices: ["COBOL", "Python", "Swift", "Assembleur"], answer: 1,
          explain: "Python sert à préparer les données, calculer les métriques et appeler les modèles." },
        { type: "mcq", q: "Pourquoi les langues peu dotées sont-elles une opportunité ?",
          choices: ["Elles sont plus faciles", "Les modèles y sont moins bons et les experts rares", "Elles n'ont pas de grammaire", "Elles ne s'écrivent pas"], answer: 1,
          explain: "Moins de données d'entraînement = plus de besoins d'évaluation et d'annotation experte." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "al-annotation",
      title: "Guides d'annotation et accord",
      icon: "list",
      theory: `
        <h2>Si deux humains ne sont pas d'accord, le modèle non plus</h2>
        <p>Un <b>guide d'annotation</b> contient : la définition de chaque étiquette, des <b>exemples positifs et négatifs</b>,
        les <b>cas limites</b> tranchés (ironie, négation, mélange de langues) et quoi faire en cas de doute.</p>
        <p>On le valide en faisant annoter le même échantillon par deux personnes, puis on mesure l'<b>accord inter-annotateurs</b>.
        Le <b>kappa de Cohen</b> corrige l'accord dû au hasard :</p>
        <p><code>κ = (accord observé − accord attendu par hasard) / (1 − accord attendu par hasard)</code></p>
        <ul>
          <li>κ = 1 : accord parfait · κ ≈ 0 : pas mieux que le hasard.</li>
          <li>Un κ faible signale d'abord un <b>guide ambigu</b>, pas de mauvais annotateurs.</li>
        </ul>`,
      example: `from collections import Counter

a1 = ["pos", "neg", "neu", "pos", "neg", "pos", "neu", "pos", "neg", "pos"]
a2 = ["pos", "neg", "pos", "pos", "neg", "neu", "neu", "pos", "neg", "pos"]

def kappa_cohen(x, y):
    n = len(x)
    observe = sum(i == j for i, j in zip(x, y)) / n
    cx, cy = Counter(x), Counter(y)
    attendu = sum(cx[k] / n * cy[k] / n for k in set(x) | set(y))
    return (observe - attendu) / (1 - attendu)

print("Accord brut :", sum(i == j for i, j in zip(a1, a2)) / len(a1))
print("Kappa de Cohen :", round(kappa_cohen(a1, a2), 3))
print("Désaccords :", [(i, p, q) for i, (p, q) in enumerate(zip(a1, a2)) if p != q])`,
      sources: [
        { title: "Kappa de Cohen (Wikipédia)", url: "https://fr.wikipedia.org/wiki/Kappa_de_Cohen" },
      ],
      exercises: [
        { type: "mcq", q: "Un kappa proche de 0 signifie…", choices: ["Accord parfait", "Accord pas meilleur que le hasard", "Désaccord total voulu", "Erreur de calcul"], answer: 1,
          explain: "Le kappa retire la part d'accord qu'on obtiendrait au hasard." },
        { type: "mcq", q: "Le kappa est faible. Première chose à revoir ?", choices: ["Licencier les annotateurs", "Le guide d'annotation", "Le modèle", "La couleur de l'interface"], answer: 1,
          explain: "Un guide ambigu produit des désaccords, même avec des experts." },
        { type: "order", q: "Remets la création d'un guide dans l'ordre :",
          lines: ["Définir les étiquettes", "Ajouter des exemples et cas limites", "Faire annoter un échantillon par deux personnes", "Mesurer l'accord", "Réviser le guide"],
          explain: "C'est un cycle : on itère jusqu'à un accord suffisant." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "al-eval",
      title: "Évaluer la langue des LLM",
      icon: "target",
      theory: `
        <h2>Grilles, préférences et juges</h2>
        <p>Pour évaluer un texte généré, on combine plusieurs dimensions dans une <b>grille</b> :</p>
        <ul>
          <li><b>Adéquation</b> : le sens est-il juste et complet ?</li>
          <li><b>Fluidité</b> : la langue est-elle naturelle ?</li>
          <li><b>Registre</b> : tutoiement/vouvoiement, niveau de langue adapté ?</li>
          <li><b>Pertinence culturelle</b> : expressions, unités, références locales.</li>
        </ul>
        <p>Deux formats courants : <b>Likert</b> (note de 1 à 5 par dimension) et <b>préférence par paires</b>
        (« A ou B est meilleur ? »), plus stable entre annotateurs. Un <b>LLM juge</b> peut noter en masse, à condition
        de mesurer son accord avec des humains sur un échantillon.</p>`,
      example: `import random
random.seed(7)

# Préférences humaines : pour chaque prompt, quel modèle a la meilleure réponse ?
votes = ["A", "B", "A", "A", "egal", "A", "B", "A", "A", "B", "A", "egal"]

victoires_a = votes.count("A")
victoires_b = votes.count("B")
egalites = votes.count("egal")
taux = (victoires_a + egalites / 2) / len(votes)
print(f"A : {victoires_a}  B : {victoires_b}  égalités : {egalites}")
print(f"Taux de victoire de A : {taux:.0%}")

# Accord LLM-juge vs humains sur un échantillon
humains = ["A", "B", "A", "A", "B"]
juge_llm = ["A", "B", "B", "A", "B"]
accord = sum(h == j for h, j in zip(humains, juge_llm)) / len(humains)
print(f"Accord juge-humains : {accord:.0%}")`,
      sources: [
        { title: "Claude Docs — Define success criteria and build evaluations", url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests" },
      ],
      exercises: [
        { type: "mcq", q: "Quelle dimension vérifie le tutoiement/vouvoiement ?", choices: ["Adéquation", "Registre", "Latence", "Recall"], answer: 1,
          explain: "Le registre concerne le niveau de langue et la forme d'adresse." },
        { type: "mcq", q: "Pourquoi utiliser la préférence par paires ?", choices: ["Elle est plus stable entre annotateurs", "Elle est obligatoire", "Elle évite de lire les textes", "Elle donne toujours 50 %"], answer: 0,
          explain: "Comparer deux réponses est plus facile et plus constant que donner une note absolue." },
        { type: "mcq", q: "Avant de faire confiance à un LLM juge, il faut…", choices: ["Lui donner plus de tokens", "Mesurer son accord avec des humains", "Le faire juger ses propres réponses", "Rien"], answer: 1,
          explain: "Un juge non calibré peut avoir ses propres biais." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "al-multi",
      title: "Multilinguisme et localisation",
      icon: "move",
      theory: `
        <h2>Une IA n'est pas aussi bonne dans toutes les langues</h2>
        <ul>
          <li><b>Tokenisation inégale</b> : selon la langue, le même message coûte plus ou moins de tokens, donc plus cher et plus lent.</li>
          <li><b>Variétés</b> : <code>fr-CA</code> ≠ <code>fr-FR</code> (« courriel », « magasiner », « fin de semaine », format des prix <code>12,50 $</code>).</li>
          <li><b>Langues peu dotées</b> : qualité plus faible, orthographes concurrentes, peu de jeux d'évaluation.</li>
          <li><b>Alternance codique</b> (<i>code-switching</i>) : mélange de langues dans une même phrase, très fréquent à Montréal.</li>
          <li><b>Localisation ≠ traduction</b> : dates, devises, unités, politesse, références culturelles.</li>
        </ul>
        <p>Ton rôle : construire des <b>tests par langue et par variété</b> pour mesurer ces écarts, au lieu de supposer que « ça marche en français ».</p>`,
      example: `phrases = {
    "en": "Your order will arrive this weekend.",
    "fr-FR": "Votre commande arrivera ce week-end.",
    "fr-CA": "Votre commande arrivera en fin de semaine.",
    "ht": "Kòmand ou a ap rive nan wikenn nan.",
}

# Approximation grossière des tokens (≈ 4 caractères par token en anglais)
for langue, phrase in phrases.items():
    print(f"{langue:6} {len(phrase):3} car. ≈ {len(phrase) / 4:4.1f} tokens  | {phrase}")

conventions = {
    "fr-CA": {"prix": "12,50 $", "date": "2026-10-26", "mot": "courriel"},
    "fr-FR": {"prix": "12,50 €", "date": "26/10/2026", "mot": "e-mail"},
}
for loc, c in conventions.items():
    print(loc, c)`,
      sources: [
        { title: "Office québécois de la langue française — Grand dictionnaire terminologique", url: "https://vitrinelinguistique.oqlf.gouv.qc.ca/" },
      ],
      exercises: [
        { type: "mcq", q: "En français du Québec, « weekend » se dit plutôt…", choices: ["week-end", "fin de semaine", "samedi-dimanche", "vacances"], answer: 1,
          explain: "« Fin de semaine » est l'usage recommandé et courant au Québec." },
        { type: "mcq", q: "Qu'est-ce que l'alternance codique ?", choices: ["Un bug d'encodage", "Le mélange de langues dans un même énoncé", "Un format de date", "Une technique de chiffrement"], answer: 1,
          explain: "Très fréquent chez les locuteurs multilingues : les modèles doivent le gérer." },
        { type: "fill", q: "Complète le code de langue du français canadien :", code: `langue = "fr-___"`, answers: ["CA"],
          explain: "Format BCP 47 : langue-RÉGION, ex. fr-CA, fr-FR, ht (créole haïtien)." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "al-data",
      title: "Annotation assistée et documentation",
      icon: "file",
      theory: `
        <h2>Le LLM pré-annote, l'humain vérifie</h2>
        <p>Pratique courante : un LLM propose des étiquettes, des humains <b>révisent un échantillon aléatoire</b>,
        on mesure l'accord LLM-humain et on corrige le prompt d'annotation. On réserve la révision complète aux cas
        où le LLM est peu sûr ou en désaccord avec une règle.</p>
        <p>Chaque jeu de données publié doit avoir sa <b>fiche descriptive</b> (<i>datasheet</i>) : pourquoi il existe,
        comment il a été collecté et annoté, qui l'a annoté, ses limites, les usages déconseillés, la licence.</p>
        <div class="tip">Ne mets jamais de renseignements personnels dans un jeu public : anonymise et vérifie (Loi 25).</div>`,
      example: `import random
random.seed(42)

# 1000 exemples pré-annotés par un LLM (simulés)
exemples = [{"id": i, "etiquette_llm": random.choice(["pos", "neg", "neu"]),
             "confiance": round(random.random(), 2)} for i in range(1000)]

# Révision humaine : tous les cas peu sûrs + un échantillon aléatoire du reste
peu_surs = [e for e in exemples if e["confiance"] < 0.3]
reste = [e for e in exemples if e["confiance"] >= 0.3]
echantillon = random.sample(reste, 50)

print("Cas peu sûrs à réviser :", len(peu_surs))
print("Échantillon de contrôle :", len(echantillon))
print("Total à réviser :", len(peu_surs) + len(echantillon), "sur", len(exemples))`,
      sources: [
        { title: "Gebru et al. — Datasheets for Datasets", url: "https://arxiv.org/abs/1803.09010" },
      ],
      exercises: [
        { type: "mcq", q: "Dans l'annotation assistée, quels exemples réviser en priorité ?", choices: ["Ceux où le LLM est peu sûr", "Les plus courts", "Aucun", "Ceux en anglais seulement"], answer: 0,
          explain: "Les cas incertains concentrent les erreurs ; un échantillon aléatoire contrôle le reste." },
        { type: "mcq", q: "Qu'est-ce qu'une datasheet de jeu de données ?", choices: ["Un tableur Excel", "Une fiche qui documente origine, annotation, limites et licence", "Un graphique", "Un mot de passe"], answer: 1,
          explain: "Elle permet aux autres de savoir si le jeu convient à leur usage." },
        { type: "fill", q: "Rends l'échantillonnage reproductible :", code: `random.___(42)`, answers: ["seed"],
          explain: "Fixer la graine permet de retrouver exactement le même échantillon." },
      ],
    },
  ],
};
