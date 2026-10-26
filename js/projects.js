/* ============================================================================
   projects.js — Projets portfolio (un dépôt GitHub par projet)
   ----------------------------------------------------------------------------
   Les recruteurs veulent des systèmes livrés, pas des certificats : du code
   public, testé, documenté, avec des résultats mesurés. Chaque projet ici
   est pensé pour devenir un dépôt GitHub montrable en entrevue.

   FORMAT D'UN PROJET
   {
     id, title, level, duration,
     after:        id de la leçon après laquelle le projet est conseillé
     pitch:        ce que tu construis, en une ou deux phrases
     hiring:       pourquoi ça aide à se faire embaucher
     stack:        technologies utilisées
     steps:        étapes cochables (la progression est sauvegardée)
     deliverables: ce que doit contenir le dépôt à la fin
     stretch:      bonus pour aller plus loin
     interview:    questions qu'on te posera sur ce projet
     sources:      documentation officielle utile
   }
   Ce fichier se charge APRÈS les fichiers de cours : il ajoute un tableau
   "projects" à chaque cours existant.
   ========================================================================== */

(function addProjects() {
  const C = window.COURSES;

  /* ============================== PYTHON ============================== */
  C.python.projects = [
    {
      id: "py-p1", title: "CLI de suivi de dépenses, testée", level: "Débutant", duration: "1 fin de semaine", after: "py-dicts",
      pitch: "Un outil en ligne de commande pour ajouter, lister et totaliser des dépenses, sauvegardées en JSON.",
      hiring: "Prouve les bases que tout employeur vérifie : code propre, tests automatisés, intégration continue et README clair.",
      stack: ["Python 3.12", "argparse", "json", "pytest", "GitHub Actions"],
      steps: [
        "Créer le dépôt avec README, .gitignore Python et licence MIT",
        "Commandes add, list et total avec argparse",
        "Sauvegarder et relire les données en JSON",
        "Écrire au moins 8 tests pytest (dont fichiers vides ou corrompus)",
        "Ajouter un workflow GitHub Actions qui lance pytest à chaque push",
        "Publier une release v1.0 avec un GIF de démo dans le README",
      ],
      deliverables: ["README avec installation, exemples et badge CI vert", "Dossier tests/ avec pytest", "Release v1.0"],
      stretch: ["Catégories et export CSV", "Packaging avec pyproject.toml (pip install .)"],
      interview: ["Comment as-tu géré un fichier JSON corrompu ?", "Pourquoi ces cas de test plutôt que d'autres ?"],
      sources: [
        { title: "Documentation Python — argparse", url: "https://docs.python.org/3/library/argparse.html" },
        { title: "pytest", url: "https://docs.pytest.org/" },
        { title: "GitHub Actions — Building and testing Python", url: "https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-python" },
      ],
    },
    {
      id: "py-p2", title: "API REST avec FastAPI et Docker", level: "Intermédiaire", duration: "2 fins de semaine", after: "py-classes",
      pitch: "Une API de gestion de tâches (CRUD) avec validation, base SQLite, documentation automatique et conteneur Docker.",
      hiring: "Le back-end Python est le socle de presque tous les produits IA. FastAPI + Pydantic + Docker est une combinaison très demandée.",
      stack: ["FastAPI", "Pydantic", "SQLite", "pytest", "Docker"],
      steps: [
        "Modéliser les données avec Pydantic",
        "Routes GET, POST, PUT, DELETE avec codes HTTP corrects",
        "Persistance SQLite",
        "Tests avec le TestClient de FastAPI",
        "Dockerfile et commande docker run documentée",
        "Déployer sur un hébergeur gratuit et mettre l'URL dans le README",
      ],
      deliverables: ["Lien vers la doc /docs (OpenAPI) en ligne", "Tests et CI", "Dockerfile"],
      stretch: ["Authentification par jeton", "Pagination et filtres"],
      interview: ["Comment valides-tu les entrées ?", "Que se passe-t-il si deux requêtes modifient la même tâche ?"],
      sources: [
        { title: "FastAPI — Tutorial", url: "https://fastapi.tiangolo.com/tutorial/" },
        { title: "Docker — Python guide", url: "https://docs.docker.com/guides/python/" },
      ],
    },
    {
      id: "py-p3", title: "Analyse de données ouvertes de Montréal", level: "Débutant", duration: "1 fin de semaine", after: "py-loops",
      pitch: "Choisir un jeu de données de la Ville de Montréal, le nettoyer et répondre à 3 questions avec des graphiques.",
      hiring: "Montre que tu sais transformer des données réelles et désordonnées en conclusions claires, avec un sujet local qui fait jaser en entrevue.",
      stack: ["pandas", "matplotlib", "Jupyter"],
      steps: [
        "Choisir un jeu sur donnees.montreal.ca et formuler 3 questions",
        "Charger et nettoyer (valeurs manquantes, dates, doublons)",
        "Un graphique par question, titré et sourcé",
        "Rédiger les conclusions et les limites des données",
        "Publier le notebook et un résumé dans le README",
      ],
      deliverables: ["Notebook exécutable de bout en bout", "README avec 3 graphiques et conclusions"],
      stretch: ["Tableau de bord interactif (Streamlit)", "Mise à jour automatique hebdomadaire via GitHub Actions"],
      interview: ["Quelle décision de nettoyage a le plus changé tes résultats ?"],
      sources: [
        { title: "Données ouvertes de la Ville de Montréal", url: "https://donnees.montreal.ca/" },
        { title: "pandas — Getting started", url: "https://pandas.pydata.org/docs/getting_started/index.html" },
      ],
    },
  ];

  /* ============================== COBOL =============================== */
  C.cobol.projects = [
    {
      id: "cb-p1", title: "Traitement batch bancaire + CI", level: "Intermédiaire", duration: "2 fins de semaine", after: "cb-files",
      pitch: "Un programme COBOL qui lit un fichier de transactions, calcule les soldes, rejette les enregistrements invalides et produit un rapport formaté.",
      hiring: "Le COBOL tourne encore dans les banques et assurances, et les experts partent à la retraite. Le combiner à Git et à l'intégration continue est rare et recherché.",
      stack: ["GnuCOBOL", "Fichiers séquentiels", "GitHub Actions"],
      steps: [
        "Définir les formats d'enregistrement (FD) des transactions et des comptes",
        "Lire les transactions avec READ … AT END",
        "Valider chaque enregistrement et écrire les rejets dans un fichier d'erreurs",
        "Calculer les soldes avec COMPUTE ROUNDED",
        "Produire un rapport avec des PIC d'édition (Z,ZZ9.99)",
        "Test « golden file » : comparer la sortie à un rapport attendu",
        "GitHub Actions : installer GnuCOBOL, compiler et lancer le test à chaque push",
      ],
      deliverables: ["Programme .cbl commenté", "Données d'exemple et rapport attendu", "Badge CI vert dans le README"],
      stretch: ["Version avec fichier indexé (ORGANIZATION INDEXED)", "Copybooks partagés (COPY)"],
      interview: ["Pourquoi le COBOL est-il fiable pour les calculs d'argent ?", "Comment testes-tu un programme batch ?"],
      sources: [
        { title: "GnuCOBOL", url: "https://gnucobol.sourceforge.io/" },
        { title: "IBM — Enterprise COBOL for z/OS documentation", url: "https://www.ibm.com/docs/en/cobol-zos" },
      ],
    },
    {
      id: "cb-p2", title: "Modernisation COBOL vers Python, assistée par IA", level: "Avancé", duration: "2 à 3 fins de semaine", after: "cb-files",
      pitch: "Documenter le programme batch du projet précédent, le réécrire en Python et prouver que les deux donnent exactement le même résultat.",
      hiring: "La modernisation des systèmes hérités est le grand chantier des banques et gouvernements. Savoir lire le COBOL, utiliser l'IA et prouver l'équivalence par des tests est un profil très rare.",
      stack: ["COBOL", "Python", "pytest", "Decimal", "IA (Claude)"],
      steps: [
        "Cartographier le programme COBOL : entrées, sorties, règles de gestion",
        "Écrire des tests de caractérisation à partir des sorties COBOL réelles",
        "Réécrire en Python avec decimal.Decimal (jamais de float pour l'argent)",
        "Comparer les sorties ligne par ligne sur 1 000 transactions générées",
        "Documenter où l'IA a aidé et ce que tu as dû corriger",
        "Rédiger une note de décision (ADR) : risques, plan de bascule",
      ],
      deliverables: ["Deux implémentations et un rapport d'équivalence", "ADR dans docs/", "Journal d'utilisation de l'IA"],
      stretch: ["Exposer la logique Python en API (FastAPI)", "Comparer les performances"],
      interview: ["Comment prouves-tu que la nouvelle version ne change aucun résultat ?", "Quelles erreurs l'IA a-t-elle faites ?"],
      sources: [
        { title: "Python — decimal", url: "https://docs.python.org/3/library/decimal.html" },
        { title: "Michael Feathers — Characterization tests (Wikipedia)", url: "https://en.wikipedia.org/wiki/Characterization_test" },
      ],
    },
  ];

  /* ============================ UX/UI DE L'IA ========================= */
  C.uxai.projects = [
    {
      id: "ux-p1", title: "Étude de cas : refonte d'un assistant IA", level: "Intermédiaire", duration: "2 fins de semaine", after: "ux-agents",
      pitch: "Auditer la fonctionnalité IA d'un produit réel selon les 18 lignes directrices HAX, la repenser, la prototyper et la tester avec 5 personnes.",
      hiring: "Les équipes cherchent des designers qui comprennent les comportements de l'IA. Une étude de cas avec audit, tests et résultats vaut plus que dix maquettes.",
      stack: ["Figma", "HAX Toolkit", "Tests utilisateurs"],
      steps: [
        "Choisir un produit avec une fonction IA et noter chaque ligne directrice HAX (0 à 2)",
        "Identifier les 3 problèmes les plus graves, avec captures",
        "Proposer une refonte : confiance calibrée, contrôle, gestion des erreurs",
        "Prototype cliquable dans Figma",
        "Tester avec 5 personnes et mesurer (réussite, temps, confiance)",
        "Publier l'étude de cas (portfolio) et la grille d'audit sur GitHub",
      ],
      deliverables: ["Grille d'audit HAX", "Prototype Figma", "Étude de cas avec résultats chiffrés"],
      stretch: ["Version accessible vérifiée au lecteur d'écran", "Prototype codé en HTML"],
      interview: ["Quelle ligne directrice était la plus violée, et pourquoi ?", "Qu'ont révélé les tests que tu n'avais pas prévu ?"],
      sources: [
        { title: "Microsoft HAX Toolkit", url: "https://www.microsoft.com/en-us/haxtoolkit/" },
        { title: "Google PAIR — People + AI Guidebook", url: "https://pair.withgoogle.com/guidebook/" },
      ],
    },
    {
      id: "ux-p2", title: "Kit de composants UI pour l'IA", level: "Avancé", duration: "3 fins de semaine", after: "ux-ethique",
      pitch: "Une bibliothèque de composants pour produits IA : bulle en streaming, puce de citation, indicateur de certitude, carte d'approbation d'agent, bouton Arrêter, mention « généré par IA ».",
      hiring: "Le profil « design engineer », qui conçoit et code, est l'un des plus recherchés. Un kit accessible, thémable et documenté le prouve.",
      stack: ["HTML/CSS ou React", "Design tokens", "Storybook", "WAI-ARIA"],
      steps: [
        "Définir les tokens (couleurs, typo, espacements) en clair et sombre",
        "Coder 6 composants avec leurs états (chargement, erreur, vide)",
        "Accessibilité : aria-live, focus visible, mouvement réduit",
        "Documenter chaque composant (quand l'utiliser, à éviter)",
        "Publier une démo en ligne (GitHub Pages ou Storybook)",
      ],
      deliverables: ["Démo en ligne", "Documentation des composants", "Rapport d'accessibilité"],
      stretch: ["Package npm", "Fichier Figma synchronisé avec les tokens"],
      interview: ["Comment annonces-tu un texte en streaming aux lecteurs d'écran ?"],
      sources: [
        { title: "MDN — ARIA live regions", url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions" },
        { title: "Storybook", url: "https://storybook.js.org/docs" },
      ],
    },
  ];

  /* ============================ AI ENGINEERING ======================== */
  C.aieng.projects = [
    {
      id: "ae-p1", title: "Assistant RAG avec citations et evals", level: "Intermédiaire", duration: "2 à 3 fins de semaine", after: "ae-evals",
      pitch: "Un assistant qui répond à des questions sur un corpus réel (ex. règlements municipaux, documentation technique) en citant ses sources.",
      hiring: "« Built RAG pipelines » est l'une des lignes les plus recherchées. La différence se fait sur les chiffres : exactitude, recall, coût et latence par requête.",
      stack: ["Python", "API Claude", "Embeddings", "Chroma ou pgvector", "FastAPI ou Streamlit"],
      steps: [
        "Choisir un corpus public et le découper en passages",
        "Calculer les embeddings et indexer dans une base vectorielle",
        "Recherche top-k + génération avec citations obligatoires",
        "Créer un jeu d'évaluation de 50 questions avec réponses attendues",
        "Mesurer recall@5, exactitude, coût et latence par requête",
        "Améliorer (découpage, contextual retrieval, reranking) et comparer les chiffres",
        "Interface simple et démo vidéo dans le README",
      ],
      deliverables: ["Tableau de résultats avant/après dans le README", "Jeu d'évaluation versionné", "Démo"],
      stretch: ["Évaluation lancée en CI à chaque changement de prompt", "Recherche hybride (mots-clés + vecteurs)"],
      interview: ["Comment as-tu évalué les réponses ?", "Combien coûte une requête ?", "Qu'est-ce qui a cassé, et comment l'as-tu réglé ?"],
      sources: [
        { title: "Anthropic — Contextual Retrieval", url: "https://www.anthropic.com/news/contextual-retrieval" },
        { title: "Claude Docs — Define success criteria and build evaluations", url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests" },
      ],
    },
    {
      id: "ae-p2", title: "Serveur MCP sur des données réelles", level: "Intermédiaire", duration: "1 à 2 fins de semaine", after: "ae-tools",
      pitch: "Un serveur Model Context Protocol qui expose des outils pour interroger une source réelle (ex. données ouvertes de Montréal ou tes dépôts GitHub).",
      hiring: "MCP est la nouvelle prise standard entre les IA et les outils. Peu de candidats en ont déjà publié un.",
      stack: ["Python", "SDK MCP", "pytest"],
      steps: [
        "Lire la spécification et le guide de démarrage du serveur MCP",
        "Définir 3 outils avec des descriptions et paramètres sans ambiguïté",
        "Gérer les erreurs et limiter la taille des réponses",
        "Tester les outils (unitaires + depuis un client MCP)",
        "Documenter l'installation dans Claude Desktop ou Claude Code",
      ],
      deliverables: ["Serveur installable", "README avec exemples de conversations", "Tests"],
      stretch: ["Exposer aussi des ressources et des prompts", "Authentification et limites d'usage"],
      interview: ["Comment as-tu conçu les descriptions d'outils pour que le modèle les utilise bien ?"],
      sources: [
        { title: "Model Context Protocol — documentation", url: "https://modelcontextprotocol.io/" },
      ],
    },
    {
      id: "ae-p3", title: "Agent avec garde-fous et traces", level: "Avancé", duration: "3 fins de semaine", after: "ae-evals",
      pitch: "Un agent qui accomplit une tâche en plusieurs étapes (ex. trier des issues GitHub), avec approbation humaine pour les écritures, journal de traces et budget.",
      hiring: "Les agents sont la compétence IA qui progresse le plus vite. Montrer qu'on sait les rendre sûrs et observables distingue un ingénieur d'un bricoleur.",
      stack: ["Python", "API Claude (tool use)", "SQLite", "pytest"],
      steps: [
        "Commencer par un workflow simple, puis passer à l'agent seulement si c'est mesurablement mieux",
        "Outils en lecture d'abord, écriture seulement avec approbation",
        "Limites : nombre de tours, tokens et coût par tâche",
        "Journaliser chaque étape (entrée, outil, résultat, durée)",
        "Suite d'évaluation de 30 tâches avec taux de réussite",
        "README : schéma d'architecture, résultats, limites connues",
      ],
      deliverables: ["Agent fonctionnel", "Traces consultables", "Rapport d'évaluation"],
      stretch: ["Pattern évaluateur-optimiseur", "Tests de sécurité (voir cours Sécurité de l'IA)"],
      interview: ["Pourquoi un agent plutôt qu'un workflow ici ?", "Comment empêches-tu une boucle infinie coûteuse ?"],
      sources: [
        { title: "Anthropic — Building effective agents", url: "https://www.anthropic.com/research/building-effective-agents" },
        { title: "Claude Docs — Tool use", url: "https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview" },
      ],
    },
  ];

  /* ============================== AI LINGUIST ========================= */
  C.linguist.projects = [
    {
      id: "al-p1", title: "Benchmark français québécois ou créole haïtien", level: "Intermédiaire", duration: "2 à 3 fins de semaine", after: "al-multi",
      pitch: "Un jeu d'évaluation de 150 à 200 items qui teste des LLM sur une variété peu couverte : expressions, registre, compréhension, traduction.",
      hiring: "C'est exactement le travail d'un AI linguist : guide, annotation, accord, résultats. Et un jeu publié sur une langue peu dotée se fait remarquer.",
      stack: ["Python", "pandas", "API de 2 LLM", "Hugging Face Datasets"],
      steps: [
        "Définir les catégories testées et rédiger le guide d'annotation",
        "Créer les items et les réponses de référence",
        "Faire annoter un échantillon par une 2e personne et calculer le kappa",
        "Évaluer 2 modèles et comparer par catégorie",
        "Rédiger la datasheet (origine, limites, licence)",
        "Publier le jeu sur GitHub et Hugging Face",
      ],
      deliverables: ["Jeu de données + datasheet", "Guide d'annotation", "Rapport de résultats"],
      stretch: ["Juge LLM calibré contre les humains", "Version alternance codique français-anglais"],
      interview: ["Quel était ton kappa, et qu'as-tu changé dans le guide ?"],
      sources: [
        { title: "Hugging Face — Dataset cards", url: "https://huggingface.co/docs/hub/datasets-cards" },
        { title: "Datasheets for Datasets", url: "https://arxiv.org/abs/1803.09010" },
      ],
    },
    {
      id: "al-p2", title: "Pipeline d'annotation assistée par LLM", level: "Intermédiaire", duration: "2 fins de semaine", after: "al-data",
      pitch: "Un LLM pré-annote des textes en français (intention ou sentiment), des humains révisent dans une petite interface, et le pipeline mesure l'accord et le coût.",
      hiring: "Les entreprises veulent réduire le coût d'annotation sans perdre la qualité. Montrer le compromis chiffré est un argument fort.",
      stack: ["Python", "API Claude", "Streamlit", "SQLite"],
      steps: [
        "Écrire le prompt d'annotation avec définitions et exemples",
        "Pré-annoter 500 textes et enregistrer la confiance",
        "Interface de révision humaine",
        "Mesurer l'accord LLM-humain par étiquette",
        "Calculer le coût et le temps gagnés",
      ],
      deliverables: ["Pipeline reproductible", "Tableau accord / coût", "README"],
      stretch: ["Apprentissage actif : réviser d'abord les cas incertains"],
      interview: ["Sur quelles étiquettes le LLM se trompe-t-il le plus, et pourquoi ?"],
      sources: [
        { title: "Claude Docs — Prompt engineering overview", url: "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview" },
      ],
    },
  ];

  /* ============================ SÉCURITÉ DE L'IA ====================== */
  C.aisec.projects = [
    {
      id: "as-p1", title: "Red team d'une application LLM (la tienne)", level: "Intermédiaire", duration: "2 fins de semaine", after: "as-gouv",
      pitch: "Construire un petit chatbot RAG volontairement vulnérable, l'attaquer méthodiquement, le corriger et publier un rapport avant/après.",
      hiring: "La sécurité de l'IA manque cruellement de praticiens. Un rapport qui relie chaque faille à un identifiant OWASP et chiffre l'amélioration est directement réutilisable en entreprise.",
      stack: ["Python", "API Claude", "pytest", "OWASP LLM Top 10"],
      steps: [
        "Construire le chatbot RAG cible (local, données fictives)",
        "Écrire une suite d'attaques : injection directe et indirecte, fuite du prompt, sorties dangereuses",
        "Mesurer le taux de réussite de chaque attaque",
        "Appliquer les défenses (séparation, moindre privilège, validation des sorties)",
        "Re-mesurer et publier le tableau avant/après avec les ID OWASP",
      ],
      deliverables: ["Suite d'attaques automatisée", "Rapport de red teaming", "Code corrigé"],
      stretch: ["Lancer la suite d'attaques en CI", "Correspondance avec les tactiques MITRE ATLAS"],
      interview: ["Quelle attaque a résisté à tes défenses, et pourquoi ?"],
      sources: [
        { title: "OWASP — Top 10 for LLM Applications", url: "https://genai.owasp.org/llm-top-10/" },
        { title: "MITRE ATLAS", url: "https://atlas.mitre.org/" },
      ],
    },
    {
      id: "as-p2", title: "Passerelle de sécurité pour agents", level: "Avancé", duration: "3 fins de semaine", after: "as-agents",
      pitch: "Un intermédiaire entre un agent et ses outils : liste blanche, validation des arguments, masquage des données personnelles, approbation des actions risquées, budget et journal d'audit.",
      hiring: "Les entreprises déploient des agents et cherchent qui saura les encadrer. Ce projet montre une compréhension concrète de l'OWASP Agentic 2026.",
      stack: ["Python", "FastAPI", "pytest", "OWASP Agentic Top 10"],
      steps: [
        "Définir la politique : outils autorisés, niveaux de risque, chemins permis",
        "Valider les arguments de chaque appel d'outil",
        "Masquer les renseignements personnels dans les entrées et journaux",
        "File d'approbation humaine pour les actions à risque élevé",
        "Limites de tours, tokens et coût par session",
        "Journal d'audit et tableau de correspondance avec ASI01–ASI10",
      ],
      deliverables: ["Passerelle testée", "Politique documentée", "Matrice OWASP Agentic"],
      stretch: ["Passerelle devant un serveur MCP", "Identifiants à courte durée générés par tâche"],
      interview: ["Comment empêches-tu un agent détourné d'exfiltrer des données ?"],
      sources: [
        { title: "OWASP Top 10 for Agentic Applications 2026", url: "https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/" },
        { title: "NIST — AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
      ],
    },
  ];
})();
