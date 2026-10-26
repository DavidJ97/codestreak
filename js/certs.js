/* ============================================================================
   certs.js — Certifications reconnues, par métier
   ----------------------------------------------------------------------------
   Vérifiées en octobre 2026 sur les sites officiels ou des guides récents.
   Les prix changent souvent (et varient par pays) : la fiche affiche
   "à vérifier" quand le prix n'a pas été confirmé, et chaque certification
   renvoie vers sa page officielle. Toujours relire cette page avant de payer.

   Une certification ne remplace pas un portfolio : elle passe les filtres
   RH et rassure, les projets prouvent qu'on sait livrer.

   FORMAT
   {
     id, name, issuer, careers: [ids de window.CAREERS],
     level: "Fondation" | "Associé" | "Professionnel" | "Avancé",
     cost, costChecked: true si le prix a été confirmé,
     format, prereq,
     covers: { courses: [ids], projects: [ids] }  -> ce que l'app prépare
     gaps:   ce que l'app ne couvre pas et qu'il faut étudier ailleurs
     steps:  comment l'obtenir, dans l'ordre
     url:    page officielle
     note:   info importante (retrait, accès restreint…)
   }
   ========================================================================== */

window.CERTS = [
  /* ----------------------------- Socle Python ----------------------------- */
  {
    id: "pcep", name: "PCEP — Certified Entry-Level Python Programmer", issuer: "Python Institute (OpenEDG)",
    careers: ["ai-engineer", "ai-linguist", "ai-security", "mainframe"], level: "Fondation",
    cost: "59 $ US", costChecked: true,
    format: "En ligne · 30 questions · 40 min · 70 % pour réussir",
    prereq: "Aucun",
    covers: { courses: ["python"], projects: ["py-p1"] },
    gaps: "Questions pièges sur la syntaxe exacte : faire des examens blancs.",
    steps: ["Terminer le cours Python de l'app", "Suivre le cours gratuit Python Essentials 1 (Cisco NetAcad / OpenEDG)", "Faire 2 ou 3 examens blancs", "Acheter le bon d'examen sur le site du Python Institute et passer l'examen en ligne"],
    url: "https://pythoninstitute.org/pcep",
  },
  {
    id: "pcap", name: "PCAP — Certified Associate in Python Programming", issuer: "Python Institute (OpenEDG)",
    careers: ["ai-engineer", "ai-linguist", "ai-security"], level: "Associé",
    cost: "295 $ US", costChecked: true,
    format: "En ligne ou en centre · 40 questions · 65 min · 70 %",
    prereq: "Aucun (PCEP conseillé)",
    covers: { courses: ["python"], projects: ["py-p1", "py-p2"] },
    gaps: "Modules, paquets, exceptions avancées, programmation orientée objet en profondeur.",
    steps: ["Réussir le PCEP ou maîtriser le cours Python", "Suivre Python Essentials 2 (gratuit)", "Réaliser le projet API FastAPI de l'app", "Examens blancs puis examen"],
    url: "https://pythoninstitute.org/pcap",
  },

  /* ----------------------------- AI Engineering ----------------------------- */
  {
    id: "aws-aif", name: "AWS Certified AI Practitioner (AIF-C01)", issuer: "Amazon Web Services",
    careers: ["ai-engineer", "ai-designer", "ai-security"], level: "Fondation",
    cost: "100 $ US", costChecked: true,
    format: "Pearson VUE, en centre ou en ligne · questions à choix",
    prereq: "Aucun",
    covers: { courses: ["aieng"], projects: [] },
    gaps: "Services AWS (Bedrock, SageMaker) et vocabulaire d'apprentissage automatique classique.",
    steps: ["Terminer le cours AI Engineering", "Suivre le parcours gratuit sur AWS Skill Builder", "Examen blanc officiel", "Réserver l'examen via le compte AWS Certification"],
    url: "https://aws.amazon.com/certification/certified-ai-practitioner/",
  },
  {
    id: "aws-aip", name: "AWS Certified Generative AI Developer – Professional (AIP-C01)", issuer: "Amazon Web Services",
    careers: ["ai-engineer"], level: "Professionnel",
    cost: "≈ 300 $ US (tarif habituel des examens Professional, à vérifier)", costChecked: false,
    format: "Version bêta : 85 questions · 205 min",
    prereq: "Aucun formellement ; AWS conseille l'ML Engineer Associate et de l'expérience pratique",
    covers: { courses: ["aieng", "aisec"], projects: ["ae-p1", "ae-p2", "ae-p3"] },
    gaps: "Amazon Bedrock (agents, bases de connaissances, garde-fous), déploiement et surveillance sur AWS.",
    steps: ["Livrer l'assistant RAG et l'agent avec garde-fous de l'app", "Refaire ces projets avec Amazon Bedrock (palier gratuit)", "Suivre le guide d'examen officiel", "Réserver via AWS Certification"],
    url: "https://aws.amazon.com/certification/",
    note: "Nouvelle certification : la bêta s'est terminée le 31 mars 2026. Vérifier la version et le prix actuels.",
  },
  {
    id: "ms-ai103", name: "Microsoft Azure AI App and Agent Developer Associate (AI-103)", issuer: "Microsoft",
    careers: ["ai-engineer"], level: "Associé",
    cost: "Prix variable selon le pays (à vérifier)", costChecked: false,
    format: "Pearson VUE · scénarios pratiques",
    prereq: "Aucun",
    covers: { courses: ["aieng", "python"], projects: ["ae-p1", "ae-p2"] },
    gaps: "Microsoft Foundry et les services Azure AI.",
    steps: ["Suivre les parcours gratuits Microsoft Learn de l'AI-103", "Refaire l'assistant RAG avec Azure", "Utiliser l'évaluation pratique gratuite de Microsoft Learn", "Réserver l'examen"],
    url: "https://learn.microsoft.com/credentials/",
    note: "Remplace l'AI-102 (Azure AI Engineer Associate), retirée le 30 juin 2026.",
  },
  {
    id: "gc-genai", name: "Google Cloud Generative AI Leader", issuer: "Google Cloud",
    careers: ["ai-engineer", "ai-designer"], level: "Fondation",
    cost: "≈ 99 $ US (à vérifier)", costChecked: false,
    format: "En ligne ou en centre · questions à choix",
    prereq: "Aucun ; orientée stratégie et produit, peu technique",
    covers: { courses: ["aieng", "uxai"], projects: [] },
    gaps: "Offre Google Cloud (Vertex AI, Gemini) et cas d'usage d'affaires.",
    steps: ["Terminer AI Engineering et UX/UI de l'IA", "Suivre le parcours gratuit Google Cloud Skills Boost", "Réserver l'examen"],
    url: "https://cloud.google.com/learn/certification/generative-ai-leader",
  },
  {
    id: "claude-cert", name: "Claude Certified Developer / Architect – Foundations", issuer: "Anthropic",
    careers: ["ai-engineer"], level: "Associé",
    cost: "Non publié", costChecked: false,
    format: "Pearson VUE (en centre ou en ligne) · badge Credly",
    prereq: "Accès réservé aux organisations du Claude Partner Network",
    covers: { courses: ["aieng", "aisec"], projects: ["ae-p1", "ae-p2", "ae-p3"] },
    gaps: "Les cours de l'Anthropic Academy (gratuits) couvrent l'API, MCP et Claude Code en détail.",
    steps: ["Suivre gratuitement les cours de l'Anthropic Academy (certificats de réussite)", "Livrer les projets RAG, MCP et agent", "Vérifier si ton agence peut rejoindre le Claude Partner Network", "S'inscrire à l'examen via le portail partenaire"],
    url: "https://www.anthropic.com/learn",
    note: "Quatre certifications Claude existent depuis juillet 2026, mais elles ne sont pas ouvertes à tous pour l'instant.",
  },

  /* ----------------------------- UX/UI de l'IA ----------------------------- */
  {
    id: "google-ux", name: "Google UX Design Professional Certificate", issuer: "Google (Coursera)",
    careers: ["ai-designer"], level: "Fondation",
    cost: "Abonnement Coursera mensuel (à vérifier)", costChecked: false,
    format: "Cours en ligne et projets notés, à ton rythme",
    prereq: "Aucun",
    covers: { courses: ["uxai"], projects: ["ux-p1"] },
    gaps: "Processus UX complet (recherche, wireframes, tests) et Figma de base.",
    steps: ["S'inscrire sur Coursera (aide financière possible)", "Faire les 3 projets du certificat", "Remplacer un projet par l'étude de cas IA de l'app pour se démarquer"],
    url: "https://www.coursera.org/professional-certificates/google-ux-design",
  },
  {
    id: "nng-ux", name: "NN/g UX Certification", issuer: "Nielsen Norman Group",
    careers: ["ai-designer"], level: "Avancé",
    cost: "Élevé : 5 cours et examens (voir la page des tarifs)", costChecked: false,
    format: "5 cours + 5 examens en ligne, spécialités possibles (ex. recherche UX)",
    prereq: "Aucun ; reconnue par les équipes UX établies",
    covers: { courses: ["uxai"], projects: ["ux-p1", "ux-p2"] },
    gaps: "Profondeur en recherche utilisateur, design d'interaction et stratégie UX.",
    steps: ["Choisir 5 cours (dont ceux sur l'IA)", "Réussir l'examen après chaque cours", "Demander à l'employeur de financer : c'est fréquent"],
    url: "https://www.nngroup.com/ux-certification/",
  },
  {
    id: "iaap-was", name: "IAAP WAS — Web Accessibility Specialist", issuer: "International Association of Accessibility Professionals",
    careers: ["ai-designer"], level: "Associé",
    cost: "430 $ US membre · 530 $ US non-membre", costChecked: true,
    format: "Examen informatisé technique (WCAG, ARIA, tests avec technologies d'assistance)",
    prereq: "Connaissances en HTML, CSS et ARIA",
    covers: { courses: ["uxai"], projects: ["ux-p2"] },
    gaps: "WCAG 2.2 critère par critère, tests avec lecteurs d'écran, ARIA avancé.",
    steps: ["Faire le kit de composants accessible de l'app", "Étudier WCAG 2.2 et les pratiques ARIA (W3C)", "Tester avec NVDA et VoiceOver", "S'inscrire via l'IAAP"],
    url: "https://www.accessibilityassociation.org/certification",
    note: "Le CPACC (385 $ / 485 $ US) est la certification générale d'accessibilité de la même association.",
  },

  /* ----------------------------- AI Linguist ----------------------------- */
  {
    id: "hf-llm", name: "Hugging Face LLM Course (certificat de réussite)", issuer: "Hugging Face",
    careers: ["ai-linguist", "ai-engineer"], level: "Fondation",
    cost: "Gratuit", costChecked: true,
    format: "Cours en ligne avec quiz",
    prereq: "Python",
    covers: { courses: ["linguist", "python"], projects: ["al-p1"] },
    gaps: "Transformers, affinage (fine-tuning) de modèles, bibliothèque datasets.",
    steps: ["Terminer le cours AI Linguist de l'app", "Suivre le LLM Course gratuit", "Publier ton jeu de données annoté sur le Hub Hugging Face (preuve concrète)"],
    url: "https://huggingface.co/learn/llm-course",
    note: "Il n'existe pas de certification standard d'« AI linguist » : un jeu de données publié et un benchmark pèsent plus lourd.",
  },
  {
    id: "ottiaq", name: "Titre de traducteur agréé (OTTIAQ)", issuer: "Ordre des traducteurs, terminologues et interprètes agréés du Québec",
    careers: ["ai-linguist"], level: "Professionnel",
    cost: "Frais d'admission et cotisation annuelle (à vérifier)", costChecked: false,
    format: "Admission selon la formation et l'expérience",
    prereq: "Diplôme en traduction ou expérience reconnue, selon les voies d'admission",
    covers: { courses: ["linguist"], projects: ["al-p2"] },
    gaps: "Pratique professionnelle de la traduction et de la terminologie.",
    steps: ["Lire les voies d'admission sur le site de l'Ordre", "Constituer le dossier (diplômes, expérience)", "Mettre en avant l'évaluation de traduction automatique dans ton portfolio"],
    url: "https://ottiaq.org/",
    note: "Titre réservé au Québec, utile pour les postes de localisation et d'évaluation de traduction par IA.",
  },

  /* ----------------------------- Sécurité de l'IA ----------------------------- */
  {
    id: "secplus", name: "CompTIA Security+", issuer: "CompTIA",
    careers: ["ai-security"], level: "Fondation",
    cost: "≈ 400 $ US (à vérifier)", costChecked: false,
    format: "Pearson VUE · questions à choix et simulations",
    prereq: "Aucun (expérience en TI conseillée)",
    covers: { courses: ["aisec"], projects: [] },
    gaps: "Sécurité générale : réseaux, cryptographie, identités, gestion des incidents. Le socle avant la sécurité de l'IA.",
    steps: ["Étudier les objectifs officiels de l'examen", "Laboratoires pratiques (TryHackMe, Hack The Box)", "Examens blancs", "Réserver via CompTIA"],
    url: "https://www.comptia.org/en-us/certifications/security/",
  },
  {
    id: "secai", name: "CompTIA SecAI+ (CY0-001)", issuer: "CompTIA",
    careers: ["ai-security"], level: "Associé",
    cost: "À vérifier (vendu aussi en forfait avec formation)", costChecked: false,
    format: "Domaines : bases de l'IA (17 %), sécuriser l'IA (40 %), sécurité assistée par l'IA (24 %), gouvernance (19 %)",
    prereq: "Conseillé : 3–4 ans en TI dont 2 ans en cybersécurité, et Security+",
    covers: { courses: ["aisec", "aieng"], projects: ["as-p1", "as-p2"] },
    gaps: "Utilisation de l'IA côté défense (détection, SOC) et outillage de sécurité.",
    steps: ["Obtenir Security+ ou une expérience équivalente", "Terminer Sécurité de l'IA et les deux projets", "Étudier les objectifs officiels CY0-001", "Réserver l'examen"],
    url: "https://www.comptia.org/en-us/certifications/secai/",
    note: "Lancée le 17 février 2026.",
  },
  {
    id: "aigp", name: "IAPP AIGP — Artificial Intelligence Governance Professional", issuer: "IAPP",
    careers: ["ai-security", "ai-designer"], level: "Professionnel",
    cost: "649 $ US membre · 799 $ US non-membre", costChecked: true,
    format: "100 questions · 2 h 45 · Pearson VUE (en centre ou en ligne) · valide 2 ans",
    prereq: "Aucun ; 20 crédits de formation continue pour la renouveler",
    covers: { courses: ["aisec", "uxai"], projects: ["as-p1"] },
    gaps: "Lois et normes en détail : AI Act, NIST AI RMF, ISO/IEC 42001, protection des renseignements personnels.",
    steps: ["Terminer les leçons gouvernance de l'app", "Lire le Body of Knowledge officiel de l'AIGP", "Suivre la formation officielle ou étudier seul", "Réserver l'examen depuis le compte MyIAPP"],
    url: "https://iapp.org/certify/aigp/",
  },
  {
    id: "aaism", name: "ISACA AAISM — Advanced in AI Security Management", issuer: "ISACA",
    careers: ["ai-security"], level: "Avancé",
    cost: "459 $ US membre · 599 $ US non-membre (+ 50 $ de frais de dossier)", costChecked: true,
    format: "Questions de mises en situation",
    prereq: "Détenir une certification CISM ou CISSP active",
    covers: { courses: ["aisec"], projects: ["as-p1", "as-p2"] },
    gaps: "Gestion des risques et des programmes de sécurité à l'échelle d'une organisation.",
    steps: ["Objectif à moyen terme : obtenir d'abord CISM ou CISSP (plusieurs années d'expérience)", "Puis préparer l'AAISM avec le manuel officiel d'ISACA"],
    url: "https://www.isaca.org/credentialing/aaism",
  },

  /* ----------------------------- COBOL et mainframe ----------------------------- */
  {
    id: "zxplore", name: "Badges IBM Z Xplore (Fondamentaux, Avancé, Étendu)", issuer: "IBM",
    careers: ["mainframe"], level: "Fondation",
    cost: "Gratuit", costChecked: true,
    format: "Défis pratiques sur un vrai système IBM Z · badges Credly",
    prereq: "Aucun",
    covers: { courses: ["cobol"], projects: ["cb-p1"] },
    gaps: "JCL, z/OS, data sets, VSAM, Db2, REXX : le vrai environnement mainframe.",
    steps: ["Créer un compte sur IBM Z Xplore", "Faire le niveau Fondamentaux (JCL, data sets, USS)", "Faire le niveau Avancé (COBOL, VSAM, Db2)", "Ajouter les badges Credly à LinkedIn et au README"],
    url: "https://ibm.com/products/z/resources/zxplore",
    note: "Les badges donnent accès aux salons de l'emploi virtuels IBM Z.",
  },
  {
    id: "omp-cobol", name: "COBOL Programming Course (Open Mainframe Project)", issuer: "Open Mainframe Project (Linux Foundation)",
    careers: ["mainframe"], level: "Fondation",
    cost: "Gratuit", costChecked: true,
    format: "Cours et laboratoires open source sur GitHub",
    prereq: "Aucun",
    covers: { courses: ["cobol"], projects: ["cb-p1", "cb-p2"] },
    gaps: "Utiliser VS Code et Zowe avec un vrai mainframe.",
    steps: ["Cloner le dépôt du cours sur GitHub", "Faire les labs avec VS Code et Zowe", "Combiner avec IBM Z Xplore pour l'accès au système"],
    url: "https://github.com/openmainframeproject/cobol-programming-course",
  },
];

/* ============================================================================
   SOURCES DE VEILLE
   ----------------------------------------------------------------------------
   Où suivre les tendances, les failles et les innovations, par domaine.
   Le journal de veille de l'app sert à noter ce que tu en retiens.
   ========================================================================== */
window.WATCH = [
  {
    id: "failles", title: "Failles et incidents", icon: "shield-alert",
    items: [
      { name: "CISA — Known Exploited Vulnerabilities", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", why: "Failles réellement exploitées, à corriger en priorité." },
      { name: "NVD (NIST) — base des CVE", url: "https://nvd.nist.gov/", why: "Détail et gravité (CVSS) de chaque vulnérabilité." },
      { name: "Centre canadien pour la cybersécurité — alertes", url: "https://www.cyber.gc.ca/fr/alertes-avis", why: "Avis en français, contexte canadien." },
      { name: "OWASP GenAI Security Project", url: "https://genai.owasp.org/", why: "Top 10 LLM, Top 10 Agentic et guides de défense." },
      { name: "MITRE ATLAS", url: "https://atlas.mitre.org/", why: "Techniques d'attaque contre l'IA et études de cas." },
      { name: "AI Incident Database", url: "https://incidentdatabase.ai/", why: "Incidents réels causés par des systèmes d'IA." },
    ],
  },
  {
    id: "ia", title: "Innovations IA et ingénierie", icon: "cpu",
    items: [
      { name: "Anthropic — Engineering", url: "https://www.anthropic.com/engineering", why: "Pratiques d'agents, de contexte et d'évaluation." },
      { name: "Claude Docs — notes de version", url: "https://docs.claude.com/en/release-notes/overview", why: "Nouvelles fonctions de l'API dès leur sortie." },
      { name: "Blogue du Model Context Protocol", url: "https://blog.modelcontextprotocol.io/", why: "Évolutions de la spécification MCP." },
      { name: "Hugging Face — blogue", url: "https://huggingface.co/blog", why: "Modèles ouverts, jeux de données, techniques." },
    ],
  },
  {
    id: "ux", title: "UX, accessibilité et design de l'IA", icon: "pen",
    items: [
      { name: "Nielsen Norman Group — articles", url: "https://www.nngroup.com/articles/", why: "Recherche UX, dont l'UX de l'IA." },
      { name: "W3C WAI — actualités", url: "https://www.w3.org/WAI/news/", why: "WCAG 3.0 et normes d'accessibilité." },
      { name: "Microsoft HAX Toolkit", url: "https://www.microsoft.com/en-us/haxtoolkit/", why: "Patterns et exemples d'interaction humain-IA." },
      { name: "Google PAIR", url: "https://pair.withgoogle.com/", why: "Guide People + AI et recherche." },
    ],
  },
  {
    id: "langue", title: "Langue et TAL", icon: "globe",
    items: [
      { name: "ACL Anthology", url: "https://aclanthology.org/", why: "Articles de recherche en traitement automatique des langues." },
      { name: "Hugging Face — jeux de données", url: "https://huggingface.co/datasets", why: "Corpus et benchmarks multilingues." },
    ],
  },
  {
    id: "gouv", title: "Lois et gouvernance", icon: "scale",
    items: [
      { name: "Commission européenne — AI Act", url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai", why: "Calendrier et lignes directrices officielles." },
      { name: "NIST — AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", why: "Cadre de gestion des risques et profils." },
      { name: "Commission d'accès à l'information du Québec", url: "https://www.cai.gouv.qc.ca/", why: "Loi 25 et décisions automatisées." },
      { name: "IAPP — actualités", url: "https://iapp.org/news/", why: "Lois sur l'IA et la vie privée dans le monde." },
    ],
  },
  {
    id: "mainframe", title: "Mainframe et COBOL", icon: "server",
    items: [
      { name: "Planet Mainframe", url: "https://planetmainframe.com/", why: "Actualités et tendances du mainframe." },
      { name: "Open Mainframe Project", url: "https://www.openmainframeproject.org/", why: "Projets open source (Zowe, COBOL)." },
    ],
  },
];
