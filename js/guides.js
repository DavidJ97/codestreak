/* ============================================================================
   guides.js — Parcours de documentation par projet
   ----------------------------------------------------------------------------
   Objectif : que chaque projet te fasse atteindre un vrai niveau
   intermédiaire. Pour chaque ÉTAPE d'un projet :
     learn : ce qu'il faut comprendre (pas juste copier)
     docs  : la documentation officielle à lire, dans l'ordre
   Et pour chaque projet :
     intermediate : ce que tu dois savoir faire SANS tutoriel pour te
                    considérer de niveau intermédiaire sur ce sujet.

   Règle : on lit la doc officielle d'abord (c'est elle qu'on consulte au
   travail), les tutoriels vidéo ensuite seulement si on bloque.

   Le tableau "steps" doit avoir le même nombre d'éléments que les étapes
   du projet dans projects.js.
   ========================================================================== */

window.GUIDES = {
  /* ------------------------------ PYTHON ------------------------------ */
  "py-p1": {
    intermediate: [
      "Structurer un petit projet Python en modules, avec un point d'entrée clair",
      "Écrire des tests pytest avec fixtures (tmp_path) et paramétrage, et viser les cas limites",
      "Lire un message d'erreur et une trace de pile, et corriger seul",
      "Configurer une CI GitHub Actions et comprendre chaque ligne du YAML",
    ],
    steps: [
      { learn: "Ce que fait chaque fichier d'un dépôt propre et pourquoi choisir une licence.",
        docs: [["GitHub — Démarrage rapide des dépôts", "https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories"], ["Choisir une licence", "https://choosealicense.com/"], ["Pro Git (livre gratuit, en français)", "https://git-scm.com/book/fr/v2"]] },
      { learn: "Arguments positionnels, options, sous-commandes et messages d'aide générés automatiquement.",
        docs: [["Python — Tutoriel argparse", "https://docs.python.org/3/howto/argparse.html"], ["Python — Référence argparse", "https://docs.python.org/3/library/argparse.html"]] },
      { learn: "Lire et écrire du JSON, gérer un fichier absent ou corrompu, manipuler des chemins.",
        docs: [["Python — json", "https://docs.python.org/3/library/json.html"], ["Python — pathlib", "https://docs.python.org/3/library/pathlib.html"], ["Python — Erreurs et exceptions", "https://docs.python.org/3/tutorial/errors.html"]] },
      { learn: "Organiser les tests, isoler les fichiers avec tmp_path, couvrir plusieurs cas avec parametrize.",
        docs: [["pytest — Premiers pas", "https://docs.pytest.org/en/stable/getting-started.html"], ["pytest — Fichiers temporaires (tmp_path)", "https://docs.pytest.org/en/stable/how-to/tmp_path.html"], ["pytest — Paramétrer les tests", "https://docs.pytest.org/en/stable/how-to/parametrize.html"]] },
      { learn: "Déclencheurs, jobs, étapes, matrice de versions Python.",
        docs: [["GitHub Actions — Tester du Python", "https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-python"], ["GitHub Actions — Documentation", "https://docs.github.com/en/actions"]] },
      { learn: "Versionnage sémantique et publication d'une release.",
        docs: [["GitHub — Gérer les releases", "https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository"], ["Semantic Versioning", "https://semver.org/lang/fr/"]] },
    ],
  },
  "py-p2": {
    intermediate: [
      "Concevoir une API REST : ressources, verbes, codes HTTP, erreurs cohérentes",
      "Valider les données avec Pydantic et expliquer ce qui se passe en cas d'erreur",
      "Écrire des tests d'API isolés de la vraie base de données",
      "Construire et lancer une image Docker, et déployer sans aide",
    ],
    steps: [
      { learn: "Modèles, types, validation et messages d'erreur de Pydantic.",
        docs: [["Pydantic — Modèles", "https://docs.pydantic.dev/latest/concepts/models/"], ["FastAPI — Corps de requête", "https://fastapi.tiangolo.com/tutorial/body/"]] },
      { learn: "Quel code HTTP pour quel cas (200, 201, 204, 404, 422).",
        docs: [["FastAPI — Tutoriel", "https://fastapi.tiangolo.com/tutorial/"], ["FastAPI — Codes de statut", "https://fastapi.tiangolo.com/tutorial/response-status-code/"], ["MDN — Codes de statut HTTP", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status"]] },
      { learn: "Connexions, requêtes paramétrées (jamais de f-string en SQL), sessions.",
        docs: [["FastAPI — Bases de données SQL", "https://fastapi.tiangolo.com/tutorial/sql-databases/"], ["Python — sqlite3", "https://docs.python.org/3/library/sqlite3.html"]] },
      { learn: "TestClient, base de test séparée, remplacement de dépendances.",
        docs: [["FastAPI — Tests", "https://fastapi.tiangolo.com/tutorial/testing/"]] },
      { learn: "Image, couches, cache, variables d'environnement.",
        docs: [["FastAPI — Déployer avec Docker", "https://fastapi.tiangolo.com/deployment/docker/"], ["Docker — Guide Python", "https://docs.docker.com/guides/python/"]] },
      { learn: "Variables d'environnement en production, logs, URL publique.",
        docs: [["Render — Déployer FastAPI", "https://render.com/docs/deploy-fastapi"], ["FastAPI — Concepts de déploiement", "https://fastapi.tiangolo.com/deployment/concepts/"]] },
    ],
  },
  "py-p3": {
    intermediate: [
      "Charger, nettoyer et regrouper des données réelles avec pandas sans tutoriel",
      "Choisir le bon type de graphique et le rendre lisible",
      "Expliquer les limites et les biais d'un jeu de données",
      "Rendre une analyse reproductible (notebook exécutable, dépendances listées)",
    ],
    steps: [
      { learn: "Lire la fiche du jeu de données : origine, fréquence, licence, dictionnaire des champs.",
        docs: [["Données ouvertes de Montréal", "https://donnees.montreal.ca/"]] },
      { learn: "Valeurs manquantes, dates, doublons, types.",
        docs: [["pandas — 10 minutes", "https://pandas.pydata.org/docs/user_guide/10min.html"], ["pandas — Données manquantes", "https://pandas.pydata.org/docs/user_guide/missing_data.html"], ["pandas — Séries temporelles", "https://pandas.pydata.org/docs/user_guide/timeseries.html"]] },
      { learn: "Figure, axes, titres, étiquettes, source.",
        docs: [["Matplotlib — Démarrage rapide", "https://matplotlib.org/stable/users/explain/quick_start.html"], ["pandas — Regroupements (groupby)", "https://pandas.pydata.org/docs/user_guide/groupby.html"]] },
      { learn: "Distinguer corrélation et causalité, nommer les limites.",
        docs: [["pandas — Statistiques descriptives", "https://pandas.pydata.org/docs/user_guide/basics.html#descriptive-statistics"]] },
      { learn: "Notebook propre, requirements.txt, résumé dans le README.",
        docs: [["Jupyter — Documentation", "https://docs.jupyter.org/"], ["GitHub — Rédiger en Markdown", "https://docs.github.com/en/get-started/writing-on-github"]] },
    ],
  },

  /* ------------------------------ COBOL ------------------------------ */
  "cb-p1": {
    intermediate: [
      "Écrire un programme batch COBOL complet (fichiers, validation, calculs, rapport) sans modèle",
      "Lire et expliquer un programme COBOL existant de 500 lignes",
      "Maîtriser les PIC numériques, signés et d'édition, et les règles de MOVE",
      "Compiler et tester automatiquement, et comprendre l'équivalent JCL sur mainframe",
    ],
    steps: [
      { learn: "FD, niveaux, PIC, longueur exacte des enregistrements.",
        docs: [["IBM Enterprise COBOL for z/OS — Documentation", "https://www.ibm.com/docs/en/cobol-zos"], ["Open Mainframe Project — COBOL Programming Course", "https://github.com/openmainframeproject/cobol-programming-course"]] },
      { learn: "OPEN, READ AT END, statut de fichier (FILE STATUS), CLOSE.",
        docs: [["GnuCOBOL — Documentation et guides", "https://gnucobol.sourceforge.io/"], ["IBM Enterprise COBOL for z/OS — Documentation", "https://www.ibm.com/docs/en/cobol-zos"]] },
      { learn: "Valider avec des niveaux 88 et EVALUATE, écrire les rejets avec leur motif.",
        docs: [["Open Mainframe Project — COBOL Programming Course", "https://github.com/openmainframeproject/cobol-programming-course"]] },
      { learn: "COMPUTE, ROUNDED, ON SIZE ERROR, précision décimale.",
        docs: [["IBM Enterprise COBOL for z/OS — Documentation", "https://www.ibm.com/docs/en/cobol-zos"]] },
      { learn: "PIC d'édition (Z, virgule, point, signe), en-têtes et totaux.",
        docs: [["GnuCOBOL — Documentation et guides", "https://gnucobol.sourceforge.io/"]] },
      { learn: "Comparer une sortie à un fichier attendu, et ce que diff indique.",
        docs: [["GNU diffutils — Manuel", "https://www.gnu.org/software/diffutils/manual/"]] },
      { learn: "Installer un paquet dans un workflow, compiler, échouer si le test échoue.",
        docs: [["GitHub Actions — Documentation", "https://docs.github.com/en/actions"], ["IBM Z Xplore (JCL et vrai mainframe)", "https://ibm.com/products/z/resources/zxplore"]] },
    ],
  },
  "cb-p2": {
    intermediate: [
      "Extraire les règles de gestion d'un programme COBOL et les documenter",
      "Écrire des tests de caractérisation avant toute réécriture",
      "Utiliser Decimal correctement (arrondis, précision) pour l'argent",
      "Justifier une stratégie de migration progressive et ses risques",
    ],
    steps: [
      { learn: "Entrées, sorties, règles, cas particuliers : une carte avant de toucher au code.",
        docs: [["Open Mainframe Project — COBOL Programming Course", "https://github.com/openmainframeproject/cobol-programming-course"]] },
      { learn: "Figer le comportement actuel, même s'il semble faux, avant de modifier.",
        docs: [["pytest — Premiers pas", "https://docs.pytest.org/en/stable/getting-started.html"], ["pytest — Paramétrer les tests", "https://docs.pytest.org/en/stable/how-to/parametrize.html"]] },
      { learn: "Contexte décimal, modes d'arrondi, pourquoi float est interdit pour l'argent.",
        docs: [["Python — decimal", "https://docs.python.org/3/library/decimal.html"]] },
      { learn: "Générer beaucoup de cas automatiquement et comparer les sorties.",
        docs: [["Hypothesis — tests basés sur les propriétés", "https://hypothesis.readthedocs.io/"]] },
      { learn: "Utiliser l'IA comme assistant et vérifier chaque proposition.",
        docs: [["Claude Docs — Prompt engineering", "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview"]] },
      { learn: "Migration progressive (strangler fig) et décisions d'architecture documentées.",
        docs: [["Martin Fowler — Strangler Fig", "https://martinfowler.com/bliki/StranglerFigApplication.html"], ["Architecture Decision Records", "https://adr.github.io/"]] },
    ],
  },

  /* ------------------------------ UX/UI de l'IA ------------------------------ */
  "ux-p1": {
    intermediate: [
      "Mener une évaluation heuristique structurée et prioriser les problèmes",
      "Planifier et animer un test d'utilisabilité, puis mesurer réussite et temps",
      "Appliquer les lignes directrices HAX et PAIR à un cas concret",
      "Présenter une étude de cas : problème, processus, décisions, résultats",
    ],
    steps: [
      { learn: "Les 18 lignes directrices et comment noter un produit avec.",
        docs: [["Microsoft — Guidelines for Human-AI Interaction", "https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/"], ["Microsoft HAX Toolkit", "https://www.microsoft.com/en-us/haxtoolkit/"]] },
      { learn: "Gravité, fréquence, impact : comment prioriser.",
        docs: [["NN/g — Évaluation heuristique", "https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/"]] },
      { learn: "Confiance calibrée, explications, gestion des erreurs.",
        docs: [["Google PAIR — People + AI Guidebook", "https://pair.withgoogle.com/guidebook/"], ["Google PAIR — Explainability + Trust", "https://pair.withgoogle.com/chapter/explainability-trust/"]] },
      { learn: "Composants, variantes, prototypage interactif.",
        docs: [["Figma — Centre d'aide", "https://help.figma.com/"]] },
      { learn: "Tâches, consignes neutres, nombre de participants, mesures.",
        docs: [["NN/g — Usability Testing 101", "https://www.nngroup.com/articles/usability-testing-101/"], ["NN/g — Pourquoi 5 utilisateurs", "https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/"], ["NN/g — Taux de réussite", "https://www.nngroup.com/articles/success-rate-the-simplest-usability-metric/"]] },
      { learn: "Raconter le processus et les décisions, pas seulement les écrans.",
        docs: [["GitHub — Rédiger en Markdown", "https://docs.github.com/en/get-started/writing-on-github"]] },
    ],
  },
  "ux-p2": {
    intermediate: [
      "Construire un système de tokens qui gère le thème clair et sombre",
      "Coder des composants accessibles (clavier, lecteur d'écran, contraste) et les tester",
      "Connaître les critères WCAG 2.2 AA qui touchent tes composants",
      "Documenter un composant pour qu'une autre personne l'utilise correctement",
    ],
    steps: [
      { learn: "Tokens primitifs et sémantiques, thèmes, format partagé.",
        docs: [["W3C Design Tokens Community Group", "https://www.designtokens.org/"], ["MDN — prefers-color-scheme", "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme"]] },
      { learn: "Patterns ARIA éprouvés et états des composants.",
        docs: [["W3C — ARIA Authoring Practices Guide", "https://www.w3.org/WAI/ARIA/apg/"]] },
      { learn: "Annonces aux lecteurs d'écran, focus, animations réduites, contraste.",
        docs: [["MDN — aria-live", "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live"], ["MDN — prefers-reduced-motion", "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion"], ["W3C — WCAG 2.2 référence rapide", "https://www.w3.org/WAI/WCAG22/quickref/"], ["axe-core (tests automatiques)", "https://github.com/dequelabs/axe-core"]] },
      { learn: "Quand utiliser le composant, quand l'éviter, exemples.",
        docs: [["Storybook — Documentation", "https://storybook.js.org/docs"]] },
      { learn: "Publier un site statique gratuitement.",
        docs: [["GitHub Pages — Documentation", "https://docs.github.com/en/pages"]] },
    ],
  },

  /* ------------------------------ AI Engineering ------------------------------ */
  "ae-p1": {
    intermediate: [
      "Expliquer et régler chaque étage d'un RAG (découpage, embeddings, recherche, génération)",
      "Construire un jeu d'évaluation et suivre des métriques avant et après chaque changement",
      "Maîtriser coût, latence et citations dans les réponses",
      "Diagnostiquer pourquoi une réponse est fausse (récupération ou génération)",
    ],
    steps: [
      { learn: "Taille des passages, chevauchement, métadonnées.",
        docs: [["Anthropic — Contextual Retrieval", "https://www.anthropic.com/news/contextual-retrieval"]] },
      { learn: "Ce qu'est un embedding, choisir un modèle, indexer.",
        docs: [["Claude Docs — Embeddings", "https://docs.claude.com/en/docs/build-with-claude/embeddings"], ["Chroma — Documentation", "https://docs.trychroma.com/"], ["pgvector", "https://github.com/pgvector/pgvector"]] },
      { learn: "Injecter les passages, exiger des citations, refuser quand c'est introuvable.",
        docs: [["Claude Docs — Citations", "https://platform.claude.com/docs/en/build-with-claude/citations"], ["Claude Docs — Messages API", "https://docs.claude.com/en/api/messages"]] },
      { learn: "Critères de réussite mesurables et jeu de questions représentatif.",
        docs: [["Claude Docs — Définir les critères de réussite", "https://platform.claude.com/docs/en/test-and-evaluate/define-success"], ["Claude Docs — Créer des tests", "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests"]] },
      { learn: "Mesurer récupération, exactitude, coût et latence.",
        docs: [["Claude Docs — Prompt caching", "https://docs.claude.com/en/docs/build-with-claude/prompt-caching"]] },
      { learn: "Contextual retrieval, recherche hybride, reranking : une variable à la fois.",
        docs: [["Anthropic — Contextual Retrieval", "https://www.anthropic.com/news/contextual-retrieval"]] },
      { learn: "Une interface minimale et une démo claire.",
        docs: [["Streamlit — Documentation", "https://docs.streamlit.io/"], ["Claude Docs — Streaming", "https://docs.claude.com/en/docs/build-with-claude/streaming"]] },
    ],
  },
  "ae-p2": {
    intermediate: [
      "Expliquer l'architecture MCP (hôte, client, serveur) et ses primitives",
      "Concevoir des outils qu'un modèle utilise correctement du premier coup",
      "Tester un serveur MCP et déboguer ses échanges",
      "Identifier les risques de sécurité d'un serveur MCP et les réduire",
    ],
    steps: [
      { learn: "Hôtes, clients, serveurs ; outils, ressources, prompts ; transports.",
        docs: [["Model Context Protocol — Documentation", "https://modelcontextprotocol.io/"], ["MCP — Spécification", "https://modelcontextprotocol.io/specification"]] },
      { learn: "Noms, descriptions et schémas de paramètres sans ambiguïté.",
        docs: [["SDK Python officiel de MCP", "https://github.com/modelcontextprotocol/python-sdk"], ["Claude Docs — Tool use", "https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview"]] },
      { learn: "Erreurs utiles au modèle, pagination, troncature.",
        docs: [["Anthropic — Effective context engineering", "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"]] },
      { learn: "Tests unitaires et inspection des échanges réels.",
        docs: [["MCP Inspector", "https://github.com/modelcontextprotocol/inspector"], ["pytest — Premiers pas", "https://docs.pytest.org/en/stable/getting-started.html"]] },
      { learn: "Installation pour l'utilisateur et sécurité de la configuration.",
        docs: [["Model Context Protocol — Documentation", "https://modelcontextprotocol.io/"], ["OWASP — Top 10 Agentic 2026", "https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/"]] },
    ],
  },
  "ae-p3": {
    intermediate: [
      "Choisir entre workflow et agent avec des chiffres, pas par effet de mode",
      "Implémenter la boucle d'appel d'outils et l'approbation humaine",
      "Tracer, limiter et évaluer un agent sur une suite de tâches",
      "Expliquer les modes d'échec d'un agent et comment les détecter",
    ],
    steps: [
      { learn: "Workflows (chaînage, routage, parallélisation) avant les agents.",
        docs: [["Anthropic — Building effective agents", "https://www.anthropic.com/research/building-effective-agents"]] },
      { learn: "Boucle tool use, outils en lecture d'abord, approbation.",
        docs: [["Claude Docs — Tool use", "https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview"], ["OWASP — Top 10 Agentic 2026", "https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/"]] },
      { learn: "Plafonds de tours, de tokens et de coût ; consommation non bornée.",
        docs: [["OWASP — Top 10 LLM 2025", "https://genai.owasp.org/llm-top-10/"]] },
      { learn: "Journaux structurés et traces.",
        docs: [["Python — Logging HOWTO", "https://docs.python.org/3/howto/logging.html"], ["OpenTelemetry — Python", "https://opentelemetry.io/docs/languages/python/"]] },
      { learn: "Suite de tâches, taux de réussite, régressions.",
        docs: [["Claude Docs — Créer des tests", "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests"]] },
      { learn: "Schéma d'architecture lisible directement sur GitHub.",
        docs: [["GitHub — Diagrammes Mermaid", "https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams"]] },
    ],
  },

  /* ------------------------------ AI Linguist ------------------------------ */
  "al-p1": {
    intermediate: [
      "Rédiger un guide d'annotation qu'une autre personne applique de façon cohérente",
      "Calculer et interpréter un accord inter-annotateurs",
      "Concevoir un benchmark qui mesure vraiment ce qu'il prétend mesurer",
      "Documenter et publier un jeu de données de façon responsable",
    ],
    steps: [
      { learn: "Définitions, exemples, contre-exemples et cas limites.",
        docs: [["Label Studio — Documentation", "https://labelstud.io/guide/"]] },
      { learn: "Items variés, réponses de référence et registres de langue.",
        docs: [["Hugging Face — Datasets", "https://huggingface.co/docs/datasets"]] },
      { learn: "Kappa de Cohen : calcul et interprétation.",
        docs: [["scikit-learn — cohen_kappa_score", "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.cohen_kappa_score.html"]] },
      { learn: "Comparer par catégorie et typer les erreurs.",
        docs: [["MQM — Multidimensional Quality Metrics", "https://themqm.org/"], ["pandas — Regroupements (groupby)", "https://pandas.pydata.org/docs/user_guide/groupby.html"]] },
      { learn: "Origine, composition, usages prévus, limites, licence.",
        docs: [["Datasheets for Datasets", "https://arxiv.org/abs/1803.09010"], ["Hugging Face — Dataset cards", "https://huggingface.co/docs/hub/datasets-cards"]] },
      { learn: "Publier et versionner le jeu.",
        docs: [["Hugging Face — Partager un jeu de données", "https://huggingface.co/docs/datasets/upload_dataset"]] },
    ],
  },
  "al-p2": {
    intermediate: [
      "Écrire un prompt d'annotation stable avec définitions et exemples",
      "Concevoir une boucle humain + IA et décider quand l'humain intervient",
      "Mesurer l'accord LLM-humain par étiquette et corriger le prompt",
      "Chiffrer le coût et le gain de temps d'un pipeline",
    ],
    steps: [
      { learn: "Consignes claires, exemples, format de sortie structuré.",
        docs: [["Claude Docs — Prompt engineering", "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview"]] },
      { learn: "Traiter beaucoup de textes à moindre coût.",
        docs: [["Claude Docs — Batch processing", "https://docs.claude.com/en/docs/build-with-claude/batch-processing"], ["Python — sqlite3", "https://docs.python.org/3/library/sqlite3.html"]] },
      { learn: "Une interface de révision rapide.",
        docs: [["Streamlit — Documentation", "https://docs.streamlit.io/"]] },
      { learn: "Accord par étiquette et matrice de confusion.",
        docs: [["scikit-learn — cohen_kappa_score", "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.cohen_kappa_score.html"], ["scikit-learn — confusion_matrix", "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.confusion_matrix.html"]] },
      { learn: "Tokens consommés, prix, temps humain économisé.",
        docs: [["Claude Docs — Prompt caching", "https://docs.claude.com/en/docs/build-with-claude/prompt-caching"]] },
    ],
  },

  /* ------------------------------ Sécurité de l'IA ------------------------------ */
  "as-p1": {
    intermediate: [
      "Modéliser les menaces d'une application LLM et les relier à l'OWASP Top 10",
      "Écrire et automatiser des attaques reproductibles",
      "Mesurer l'effet réel d'une défense, avant et après",
      "Rédiger un rapport de sécurité utile à une équipe de développement",
    ],
    steps: [
      { learn: "Une cible réaliste mais isolée, avec des données fictives.",
        docs: [["Claude Docs — Messages API", "https://docs.claude.com/en/api/messages"]] },
      { learn: "Injection directe et indirecte, fuite du prompt système, sorties dangereuses.",
        docs: [["OWASP — Top 10 LLM 2025", "https://genai.owasp.org/llm-top-10/"], ["Greshake et al. — Injection indirecte (2023)", "https://arxiv.org/abs/2302.12173"], ["MITRE ATLAS", "https://atlas.mitre.org/"]] },
      { learn: "Taux de réussite des attaques, répétabilité.",
        docs: [["NVIDIA garak", "https://github.com/NVIDIA/garak"], ["Microsoft PyRIT", "https://github.com/Azure/PyRIT"]] },
      { learn: "Défense en profondeur : séparation, moindre privilège, validation.",
        docs: [["OWASP — Cheat sheet injection de prompt", "https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html"]] },
      { learn: "Tableau avant/après et gestion des risques.",
        docs: [["NIST AI 600-1 — Profil IA générative", "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf"]] },
    ],
  },
  "as-p2": {
    intermediate: [
      "Traduire les risques OWASP Agentic en règles techniques vérifiables",
      "Valider des entrées non fiables et protéger les renseignements personnels",
      "Concevoir une approbation humaine qui ne devient pas un réflexe automatique",
      "Produire un journal d'audit exploitable",
    ],
    steps: [
      { learn: "Moindre privilège et niveaux de risque par outil.",
        docs: [["OWASP — Top 10 Agentic 2026", "https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/"]] },
      { learn: "Schémas stricts, listes autorisées, chemins permis.",
        docs: [["Pydantic — Modèles", "https://docs.pydantic.dev/latest/concepts/models/"], ["FastAPI — Tutoriel", "https://fastapi.tiangolo.com/tutorial/"]] },
      { learn: "Détecter et masquer les renseignements personnels.",
        docs: [["Microsoft Presidio", "https://microsoft.github.io/presidio/"], ["Commission d'accès à l'information du Québec", "https://www.cai.gouv.qc.ca/"]] },
      { learn: "Approbations claires et non répétitives (ASI09).",
        docs: [["OWASP — Top 10 Agentic 2026", "https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/"]] },
      { learn: "Plafonds de tours, de tokens et de coût.",
        docs: [["OWASP — Top 10 LLM 2025", "https://genai.owasp.org/llm-top-10/"]] },
      { learn: "Journal structuré et correspondance avec les risques.",
        docs: [["Python — Logging HOWTO", "https://docs.python.org/3/howto/logging.html"], ["MITRE ATLAS", "https://atlas.mitre.org/"]] },
    ],
  },
};
