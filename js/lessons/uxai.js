/* ============================================================================
   lessons/uxai.js — Cours « UX/UI de l'IA »
   ----------------------------------------------------------------------------
   Comment concevoir des interfaces où l'IA propose, se trompe, agit pour
   l'utilisateur... sans le perdre ni le tromper. Basé sur les références
   les plus utilisées par l'industrie :
     - Microsoft HAX Toolkit : 18 lignes directrices d'interaction humain-IA
     - Google PAIR « People + AI Guidebook »
     - OWASP Top 10 Agentic 2026 (risque ASI09 : confiance humain-agent)
     - AI Act européen (art. 50, transparence) et Loi 25 du Québec (art. 12.1)

   Les exemples sont du HTML/CSS : le bouton « Aperçu » les affiche en direct.
   Même format de leçon que python.js ; champ "sources" = liens officiels.
   ========================================================================== */

window.COURSES = window.COURSES || {};

window.COURSES.uxai = {
  id: "uxai",
  group: "ia",
  name: "UX/UI de l'IA",
  badge: "pen",
  color: { light: "#d6336c", dark: "#f06595" },
  language: "markup",
  run: "preview",              // les exemples HTML s'affichent en aperçu
  tagline: "Concevoir des produits IA dignes de confiance : suggestions, agents, streaming, transparence.",
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: "ux-principes",
      title: "Les 18 lignes directrices HAX",
      icon: "book-open",
      theory: `
        <h2>Une IA se trompe : l'interface doit le prévoir</h2>
        <p>Un logiciel classique fait toujours la même chose. Une IA est <b>probabiliste</b> : elle peut se tromper,
        varier d'une fois à l'autre, ou faire mieux que prévu. Microsoft Research a synthétisé 20 ans de recherche
        en <b>18 lignes directrices</b>, regroupées selon le moment de l'interaction :</p>
        <table>
          <tr><th>Moment</th><th>Lignes directrices (exemples)</th></tr>
          <tr><td>Au départ</td><td>1. Dire ce que le système peut faire · 2. Dire à quel point il le fait bien</td></tr>
          <tr><td>Pendant l'interaction</td><td>3. Agir au bon moment · 4. Montrer l'info pertinente · 5. Respecter les normes sociales · 6. Atténuer les biais</td></tr>
          <tr><td>Quand l'IA se trompe</td><td>7. Invocation facile · 8. Rejet facile · 9. Correction facile · 10. Restreindre en cas de doute · 11. Expliquer pourquoi</td></tr>
          <tr><td>Avec le temps</td><td>12. Se souvenir · 13. Apprendre de l'usage · 14. S'adapter prudemment · 15. Feedback précis · 16. Montrer les conséquences · 17. Contrôles globaux · 18. Prévenir des changements</td></tr>
        </table>
        <p>Le Guidebook de Google PAIR complète avec six chapitres : besoins et succès, <b>modèles mentaux</b>,
        feedback et contrôle, explicabilité et confiance, données, <b>erreurs et échec gracieux</b>.</p>
        <div class="tip">Réflexe pro : pour chaque fonctionnalité IA, demande-toi « que voit l'utilisateur quand l'IA a tort ? ».
        Si la réponse est « rien », le design n'est pas fini.</div>`,
      example: `<style>
  .s { font: 15px system-ui; max-width: 420px; border: 1px solid #ddd; border-radius: 14px; padding: 14px; }
  .tag { font-size: 12px; color: #a61e4d; font-weight: 600; }
  .row { display: flex; gap: 8px; margin-top: 12px; }
  button { padding: 8px 12px; border-radius: 10px; border: 1px solid #ccc; background: #fff; }
  .ok { background: #111; color: #fff; border-color: #111; }
</style>
<div class="s">
  <div class="tag">Suggestion de l'IA · peut contenir des erreurs</div>
  <p>Objet proposé : « Suivi de notre rencontre du 24 octobre »</p>
  <div class="row">
    <button class="ok">Utiliser</button>   <!-- G7 : invocation facile -->
    <button>Modifier</button>              <!-- G9 : correction facile -->
    <button>Ignorer</button>               <!-- G8 : rejet facile -->
  </div>
</div>`,
      sources: [
        { title: "Microsoft HAX Toolkit — Guidelines for Human-AI Interaction", url: "https://www.microsoft.com/en-us/haxtoolkit/" },
        { title: "Google PAIR — People + AI Guidebook", url: "https://pair.withgoogle.com/guidebook/" },
      ],
      exercises: [
        { type: "mcq", q: "Un bouton « Ignorer » sur une suggestion IA applique quelle ligne directrice ?",
          choices: ["Dire ce que le système peut faire", "Rejet facile (efficient dismissal)", "Se souvenir des interactions", "Prévenir des changements"], answer: 1,
          explain: "G8 : l'utilisateur doit pouvoir écarter une suggestion sans effort." },
        { type: "order", q: "Remets les 4 moments de l'interaction dans l'ordre :",
          lines: ["Au départ", "Pendant l'interaction", "Quand l'IA se trompe", "Avec le temps"],
          explain: "C'est l'organisation des 18 lignes directrices HAX." },
        { type: "mcq", q: "Pourquoi une interface IA doit-elle prévoir l'erreur plus qu'un logiciel classique ?",
          choices: ["Parce que l'IA est plus lente", "Parce que ses résultats sont probabilistes", "Parce que l'IA n'a pas d'API", "Ce n'est pas nécessaire"], answer: 1,
          explain: "Un même modèle peut produire des réponses différentes, parfois fausses : l'erreur fait partie du produit." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "ux-confiance",
      title: "Confiance calibrée et sources",
      icon: "shield",
      theory: `
        <h2>Ni trop, ni trop peu de confiance</h2>
        <p>Le but n'est pas que l'utilisateur fasse <i>confiance</i> à l'IA, mais qu'il lui fasse
        <b>autant confiance qu'elle le mérite</b> : c'est la <b>confiance calibrée</b>. Trop de confiance → il recopie des erreurs.
        Trop peu → il n'utilise pas la fonctionnalité.</p>
        <p><b>Outils de design pour calibrer :</b></p>
        <ul>
          <li><b>Citations cliquables</b> : chaque affirmation renvoie à sa source (indispensable en RAG).</li>
          <li><b>Niveau de certitude</b> exprimé en mots (« probable », « à vérifier ») plutôt qu'en faux pourcentages.</li>
          <li><b>Explication</b> courte : « Proposé parce que tu as ouvert ce dossier hier » (G11).</li>
          <li><b>Modèle mental clair</b> : dire ce que l'IA sait et ne sait pas (date des données, accès ou non au web).</li>
        </ul>
        <div class="tip">Les « hallucinations » s'appellent <b>confabulations</b> dans le profil IA générative du NIST (AI 600-1).
        Le design est la dernière ligne de défense : rends la vérification facile.</div>`,
      example: `<style>
  .a { font: 15px/1.5 system-ui; max-width: 460px; background: #f6f6f8; border-radius: 14px; padding: 14px; }
  sup a { font-size: 11px; background: #ffe3ec; color: #a61e4d; padding: 1px 5px; border-radius: 6px; text-decoration: none; }
  .src { margin-top: 10px; font-size: 13px; color: #555; }
  .warn { font-size: 12px; color: #8a5a00; margin-top: 8px; }
</style>
<div class="a">
  La Loi 25 oblige à informer une personne quand une décision la concernant
  est fondée exclusivement sur un traitement automatisé<sup><a href="#s1">1</a></sup>.
  <div class="src" id="s1">1. Loi sur la protection des renseignements personnels dans le secteur privé, art. 12.1</div>
  <div class="warn">Réponse générée par IA · vérifie la source avant de t'en servir</div>
</div>`,
      sources: [
        { title: "Google PAIR — Explainability + Trust", url: "https://pair.withgoogle.com/chapter/explainability-trust/" },
        { title: "NIST AI 600-1 — Generative AI Profile", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
      ],
      exercises: [
        { type: "mcq", q: "Qu'est-ce que la « confiance calibrée » ?",
          choices: ["Faire toujours confiance à l'IA", "Ne jamais faire confiance à l'IA", "Une confiance proportionnelle à la fiabilité réelle", "Un score affiché à 100 %"], answer: 2,
          explain: "L'utilisateur doit savoir quand se fier à l'IA et quand vérifier." },
        { type: "mcq", q: "Quel élément aide le plus à vérifier une réponse issue d'un RAG ?",
          choices: ["Une animation de chargement", "Des citations cliquables vers les sources", "Une police plus grande", "Un avatar souriant"], answer: 1,
          explain: "La citation permet de contrôler chaque affirmation à sa source." },
        { type: "mcq", q: "Comment le NIST nomme-t-il les « hallucinations » ?", choices: ["Glitches", "Confabulations", "Drifts", "Biases"], answer: 1,
          explain: "« Confabulation » est l'un des 12 risques du profil IA générative NIST AI 600-1." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "ux-streaming",
      title: "Streaming, attente et arrêt",
      icon: "terminal",
      theory: `
        <h2>Générer en direct sans perdre personne</h2>
        <p>Une réponse d'IA peut prendre plusieurs secondes. Les patterns devenus standards :</p>
        <ul>
          <li><b>Streaming</b> : afficher le texte au fur et à mesure (la première ligne arrive vite).</li>
          <li><b>Statut des étapes</b> pour un agent : « Recherche… », « Lecture de 3 documents… », « Rédaction… ».</li>
          <li><b>Bouton Arrêter</b> toujours visible pendant la génération, puis <b>Régénérer</b> et <b>Modifier la question</b>.</li>
          <li><b>Accessibilité</b> : une zone <code>aria-live="polite"</code> annonce le nouveau contenu aux lecteurs d'écran
          sans interrompre ; on évite d'annoncer chaque mot (on annonce par phrase ou à la fin).</li>
          <li><b>Mouvement réduit</b> : respecter <code>prefers-reduced-motion</code> pour les effets de "frappe".</li>
        </ul>`,
      example: `<style>
  .c { font: 15px/1.5 system-ui; max-width: 460px; border: 1px solid #ddd; border-radius: 14px; padding: 14px; }
  .st { font-size: 12px; color: #666; display: flex; align-items: center; gap: 6px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #d6336c; }
  .stop { margin-top: 10px; padding: 6px 12px; border-radius: 999px; border: 1px solid #ccc; background: #fff; }
</style>
<div class="c">
  <div class="st"><span class="dot"></span> Lecture de 3 documents…</div>
  <!-- Annonce le contenu aux lecteurs d'écran sans couper la parole -->
  <p aria-live="polite">Voici les trois points clés du rapport : premièrement…</p>
  <button class="stop">Arrêter la génération</button>
</div>`,
      sources: [
        { title: "MDN — aria-live", url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live" },
        { title: "Microsoft HAX — G7 à G9 (invocation, rejet, correction)", url: "https://www.microsoft.com/en-us/haxtoolkit/" },
      ],
      exercises: [
        { type: "fill", q: "Annonce le texte généré sans interrompre le lecteur d'écran :", code: `<p aria-live="___">…</p>`, answers: ["polite"],
          explain: "polite attend une pause ; assertive interrompt (à réserver aux alertes)." },
        { type: "mcq", q: "Quel contrôle doit rester visible pendant une génération longue ?",
          choices: ["Supprimer le compte", "Arrêter", "Changer de thème", "Aucun"], answer: 1,
          explain: "L'utilisateur doit pouvoir interrompre une génération qui part dans la mauvaise direction." },
        { type: "mcq", q: "Pourquoi afficher les étapes d'un agent (« Recherche… », « Rédaction… ») ?",
          choices: ["Pour faire joli", "Pour rendre le processus transparent et l'attente compréhensible", "Pour ralentir l'agent", "C'est obligatoire en HTML"], answer: 1,
          explain: "La transparence du plan est un principe clé des agents (Anthropic, Building effective agents)." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "ux-agents",
      title: "UX des agents : contrôle et approbation",
      icon: "branch",
      theory: `
        <h2>Quand l'IA agit à ta place</h2>
        <p>D'ici 2030, de plus en plus d'interfaces délèguent des <b>actions</b> à des agents : envoyer un courriel, payer,
        modifier du code. Le design devient une question de <b>contrôle</b> :</p>
        <ul>
          <li><b>Montrer le plan</b> avant d'agir, et l'avancement pendant.</li>
          <li><b>Approbation humaine</b> pour toute action conséquente (irréversible, coûteuse, externe).</li>
          <li><b>Montrer l'action exacte</b>, pas un résumé flatteur : destinataire, montant, fichiers touchés.
          L'OWASP en fait un risque de sécurité : <b>ASI09 – exploitation de la confiance humain-agent</b>
          (l'utilisateur approuve quelque chose qu'il n'a pas vraiment vu).</li>
          <li><b>Réversibilité</b> : annuler, historique d'activité, points de restauration.</li>
          <li><b>Permissions visibles</b> : à quoi l'agent a accès, et comment le révoquer (G17 : contrôles globaux).</li>
        </ul>`,
      example: `<style>
  .ap { font: 14px/1.5 system-ui; max-width: 440px; border: 2px solid #111; border-radius: 16px; padding: 16px; }
  h4 { margin: 0 0 8px; font-size: 15px; }
  dl { display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; margin: 0; }
  dt { color: #666; } dd { margin: 0; font-weight: 600; }
  .r { display: flex; gap: 8px; margin-top: 14px; }
  button { padding: 8px 14px; border-radius: 10px; border: 1px solid #ccc; background: #fff; }
  .go { background: #111; color: #fff; }
</style>
<div class="ap" role="dialog" aria-label="Approbation requise">
  <h4>L'agent veut envoyer un virement</h4>
  <dl>
    <dt>Vers</dt><dd>Imprimerie MTL inc. · compte se terminant par 4821</dd>
    <dt>Montant</dt><dd>1 250,00 $</dd>
    <dt>Source</dt><dd>Facture PDF reçue par courriel le 24 oct.</dd>
  </dl>
  <div class="r"><button class="go">Approuver</button><button>Refuser</button><button>Voir la facture</button></div>
</div>`,
      sources: [
        { title: "OWASP Top 10 for Agentic Applications 2026", url: "https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/" },
        { title: "Anthropic — Building effective agents", url: "https://www.anthropic.com/research/building-effective-agents" },
      ],
      exercises: [
        { type: "mcq", q: "Quand faut-il demander une approbation humaine à un agent ?",
          choices: ["Jamais, ça ralentit", "Pour toute action conséquente ou irréversible", "Seulement la nuit", "Pour chaque mot généré"], answer: 1,
          explain: "Human-in-the-loop sur les actions à fort impact : paiement, envoi externe, suppression." },
        { type: "mcq", q: "Le risque ASI09 de l'OWASP concerne…",
          choices: ["Les fuites de mémoire", "L'exploitation de la confiance humain-agent", "Les injections SQL", "Le chiffrement"], answer: 1,
          explain: "Un résumé trompeur peut pousser l'utilisateur à approuver une action dangereuse." },
        { type: "order", q: "Remets le flux d'une action d'agent dans l'ordre :",
          lines: ["Afficher le plan", "Montrer l'action exacte", "Demander l'approbation", "Exécuter", "Permettre d'annuler"],
          explain: "Plan → détail → approbation → exécution → réversibilité." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "ux-ethique",
      title: "Transparence, biais et cadre légal",
      icon: "info",
      theory: `
        <h2>Ce que la loi exige déjà de ton interface</h2>
        <p><b>AI Act européen, article 50</b> (transparence) : à partir du <b>2 août 2026</b>, les gens doivent savoir qu'ils
        interagissent avec une IA, et les contenus générés doivent pouvoir être identifiés comme tels. Le règlement
        « omnibus » 2026/1744 a reporté les obligations des systèmes à haut risque (au <b>2 décembre 2027</b>),
        mais pas celles de l'article 50.</p>
        <p><b>Loi 25 au Québec, article 12.1</b> : une entreprise qui prend une décision sur une personne
        <b>exclusivement</b> par traitement automatisé doit l'en informer, et la personne peut demander les
        renseignements utilisés, les principaux facteurs de la décision, et soumettre ses observations à un humain.</p>
        <p><b>Biais</b> (HAX G6) : teste ton produit avec des noms, accents, dialectes et situations variés,
        et donne un moyen de signaler une réponse problématique.</p>
        <div class="tip">Ce cours n'est pas un avis juridique : il te donne les réflexes de design. Pour un vrai produit, fais valider par un juriste.</div>`,
      example: `<style>
  .d { font: 14px/1.5 system-ui; max-width: 440px; border-left: 4px solid #d6336c; background: #fff0f5; padding: 12px 14px; border-radius: 0 12px 12px 0; }
  a { color: #a61e4d; }
</style>
<div class="d" role="note">
  <b>Décision automatisée.</b> Cette pré-approbation a été produite par un système automatisé.
  Tu peux <a href="#">voir les facteurs principaux</a>, <a href="#">corriger tes renseignements</a>
  ou <a href="#">demander une révision par une personne</a>.
</div>`,
      sources: [
        { title: "Commission européenne — Cadre réglementaire sur l'IA (AI Act)", url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai" },
        { title: "Commission d'accès à l'information du Québec", url: "https://www.cai.gouv.qc.ca/" },
      ],
      exercises: [
        { type: "mcq", q: "Depuis quand l'article 50 de l'AI Act (transparence) s'applique-t-il ?",
          choices: ["1er août 2024", "2 août 2026", "2 décembre 2027", "2030"], answer: 1,
          explain: "L'omnibus de 2026 n'a pas reporté l'article 50 (seul le marquage a un délai de grâce pour l'existant)." },
        { type: "mcq", q: "La Loi 25 (art. 12.1) vise les décisions prises…",
          choices: ["avec l'aide d'un tableau Excel", "exclusivement par traitement automatisé", "par un comité", "sur papier"], answer: 1,
          explain: "Si un humain décide avec l'aide d'un outil, l'obligation d'information de 12.1 ne s'applique pas." },
        { type: "mcq", q: "Quelle pratique aide à atténuer les biais (HAX G6) ?",
          choices: ["Tester seulement en anglais", "Tester avec des profils, noms et dialectes variés", "Cacher le bouton de signalement", "Ne rien mesurer"], answer: 1,
          explain: "Les biais se découvrent en testant la diversité réelle des utilisateurs." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "ux-genui",
      title: "Interfaces génératives et multimodales",
      icon: "wand",
      theory: `
        <h2>2027–2030 : l'interface se compose à la demande</h2>
        <p>Les assistants ne répondent plus seulement en texte : ils <b>choisissent et remplissent des composants</b>
        (carte, tableau, formulaire, graphique) adaptés à la demande. C'est ce qu'on appelle l'<b>interface générative</b>.</p>
        <ul>
          <li><b>Contraindre l'IA au design system.</b> Le modèle choisit dans un catalogue de composants approuvés et
          utilise les <b>design tokens</b> (couleurs, espacements, typo) ; il n'invente pas de styles. C'est ce qui garantit
          la cohérence de marque et l'accessibilité.</li>
          <li><b>Tokens portables.</b> Le format JSON du W3C Design Tokens Community Group permet de partager les mêmes tokens
          entre Figma, le code et les outils d'IA.</li>
          <li><b>Interfaces dans les assistants.</b> La spécification MCP du 28 juillet 2026 ajoute l'extension
          <b>MCP Apps</b> : un serveur peut fournir une interface qui s'affiche directement dans un client d'IA.</li>
          <li><b>Multimodal.</b> Voix : afficher la transcription et permettre d'interrompre l'IA en parlant.
          Vision : montrer ce que l'IA a « vu » (zone détectée, image analysée). Toujours une alternative en texte.</li>
          <li><b>Accessibilité.</b> WCAG 2.2 niveau AA reste la référence. WCAG 3.0 est encore un brouillon de travail
          (version de mars 2026) ; la recommandation finale n'est pas attendue avant 2028.</li>
        </ul>
        <div class="tip">Dans l'exemple, la carte est « générée » mais ne fait qu'assembler des composants et des tokens
        existants : change la valeur de <code>--accent</code> et tout suit.</div>`,
      example: `<style>
  :root { --accent: #c2338a; --radius: 14px; --space: 12px; --font: system-ui; }
  .card { font: 15px/1.5 var(--font); max-width: 440px; border: 1px solid #ddd; border-radius: var(--radius); padding: calc(var(--space) * 1.5); }
  .card h3 { margin: 0 0 var(--space); font-size: 17px; }
  .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
  .src { margin-top: var(--space); font-size: 12px; color: #666; }
  .src a { color: var(--accent); }
  .actions { display: flex; gap: 8px; margin-top: var(--space); }
  .actions button { border-radius: 999px; padding: 6px 12px; border: 1px solid var(--accent); background: #fff; color: var(--accent); }
  .actions .main { background: var(--accent); color: #fff; }
</style>
<!-- Composant "Comparaison" choisi par l'IA dans le catalogue -->
<section class="card" aria-label="Comparaison de forfaits">
  <h3>Deux forfaits correspondent à ta demande</h3>
  <div class="row"><span>Essentiel</span><b>12 $ / mois</b></div>
  <div class="row"><span>Pro</span><b>29 $ / mois</b></div>
  <p class="src">Source : <a href="#">grille tarifaire, mise à jour le 1er octobre</a></p>
  <div class="actions">
    <button class="main">Choisir Essentiel</button>
    <button>Voir les détails</button>
  </div>
</section>`,
      sources: [
        { title: "Model Context Protocol — spécification 2026-07-28 (blogue officiel)", url: "https://blog.modelcontextprotocol.io/tags/protocol/" },
        { title: "W3C Design Tokens Community Group", url: "https://www.designtokens.org/" },
        { title: "W3C — WCAG 2.2", url: "https://www.w3.org/TR/WCAG22/" },
        { title: "W3C — WCAG 3.0 (brouillon de travail)", url: "https://www.w3.org/TR/wcag-3.0/" },
      ],
      exercises: [
        { type: "mcq", q: "Pourquoi limiter une interface générative au design system ?",
          choices: ["Pour réduire la facture d'API", "Pour garantir cohérence et accessibilité", "Parce que l'IA ne sait pas écrire du CSS", "Pour cacher les sources"], answer: 1,
          explain: "Le modèle assemble des composants déjà testés (contraste, focus, lecteurs d'écran) au lieu d'inventer des styles." },
        { type: "fill", q: "Quelle version de WCAG est la référence en 2026 ?", code: `WCAG 2.___ niveau AA`, answers: ["2"],
          explain: "WCAG 2.2 AA ; WCAG 3.0 est encore un brouillon." },
        { type: "mcq", q: "Dans une interface vocale, que faut-il toujours offrir ?",
          choices: ["Une musique d'attente", "Une transcription ou une alternative en texte", "Une voix plus rapide", "Rien de plus"], answer: 1,
          explain: "La transcription aide à vérifier ce que l'IA a compris et rend l'échange accessible." },
        { type: "mcq", q: "Que permet l'extension MCP Apps ?",
          choices: ["Entraîner un modèle", "Afficher une interface fournie par un serveur dans un client d'IA", "Chiffrer les prompts", "Remplacer HTML"], answer: 1,
          explain: "Ajoutée avec la spécification 2026-07-28, avec l'extension Tasks pour les travaux longs." },
      ],
    },
  ],
};
