/* ============================================================================
   app.js — Le cœur de l'interface
   ----------------------------------------------------------------------------
   Ce fichier gère les ÉCRANS et la NAVIGATION :

     Accueil  ──►  Parcours d'un cours  ──►  Leçon (théorie ► exercices)  ──►  Résultat

   Principe : chaque écran est une fonction render...() qui remplit
   <main id="view"> avec du HTML. Les clics sont gérés par UN SEUL écouteur
   (délégation d'événements) qui lit l'attribut data-action des boutons.

   Pendant une leçon, on ajoute la classe "focus" sur <body> : la navigation
   et le rail disparaissent pour que l'élève se concentre (comme Duolingo).

   Dépend de : icon(), Storage, COURSES, Streak, Runner, Chat (chargés avant).
   ========================================================================== */

const App = (() => {
  const view = document.getElementById("view");

  /**
   * Session de leçon en cours (null en dehors d'une leçon).
   * {
   *   course, lesson, lessonIndex,
   *   phase: "theory" | "exercise" | "result",
   *   queue:    indices des exercices restants (un exercice raté est remis à la fin, comme Duolingo)
   *   solved:   indices des exercices réussis (pour la barre segmentée)
   *   mistakes: nombre d'erreurs
   *   checked:  true quand la réponse a été vérifiée (on attend "Continuer")
   *   answer:   réponse en cours (index choisi, texte saisi, ou lignes ordonnées)
   *   bank:     lignes mélangées pour l'exercice "order"
   * }
   */
  let session = null;

  /** Petits textes qui décrivent chaque type d'exercice. */
  const KIND = {
    mcq: { label: "Choix multiple", icon: "list" },
    fill: { label: "Complète le code", icon: "edit" },
    order: { label: "Remets dans l'ordre", icon: "layers" },
  };

  /** Un extrait de code "signature" par cours, affiché sur les cartes de l'accueil. */
  const SNIPPET = {
    python: '<b>print</b>("Bonjour, le monde !")',
    cobol: '<b>DISPLAY</b> "Bonjour, le monde !".',
    uxai: '&lt;p <b>aria-live</b>="polite"&gt;Génération…&lt;/p&gt;',
    aieng: '<b>tool_use</b> → tool_result → réponse',
    linguist: '<b>kappa</b> = 0.82  # accord inter-annotateurs',
    aisec: '<b>LLM01</b>: Prompt Injection',
  };

  /** Les deux familles de cours affichées à l'accueil. */
  const GROUPS = [
    { id: "fondations", title: "Fondations", sub: "Les langages qui font tourner l'industrie" },
    { id: "ia", title: "Avant-garde IA", sub: "Les compétences recherchées de 2027 à 2030" },
  ];

  /**
   * Couleur propre à chaque cours : on passe les deux variantes (clair/sombre)
   * en variables CSS ; la classe .cs choisit la bonne selon le thème.
   */
  const cs = (course) => `style="--cl:${course.color.light};--cd:${course.color.dark}"`;

  /* ---------- Progression des projets (étapes cochées) ---------- */
  const Projects = {
    all: () => Storage.get("projects", {}),
    get(id) { return this.all()[id] || { steps: [], deliverables: [] }; },
    set(id, data) { const a = this.all(); a[id] = data; Storage.set("projects", a); },
    /** Pourcentage d'avancement (étapes + livrables). */
    pct(project) {
      const p = this.get(project.id);
      const total = project.steps.length + project.deliverables.length;
      const done = p.steps.filter(Boolean).length + p.deliverables.filter(Boolean).length;
      return Math.round((done / total) * 100);
    },
  };

  /** Liste à plat de tous les projets avec leur cours. */
  const allProjects = () => Object.values(window.COURSES)
    .flatMap((c) => (c.projects || []).map((p) => ({ ...p, course: c })));

  /* ======================================================================
     OUTILS
     ====================================================================== */

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /** Mélange un tableau (algorithme de Fisher-Yates) et renvoie une copie. */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Colorise un extrait de code avec Prism (si Prism est chargé). */
  function highlight(code, language) {
    // Si le CDN de Prism est inaccessible, window.Prism n'a pas de "languages" : on affiche le code brut
    const grammar = window.Prism && Prism.languages && Prism.languages[language];
    return grammar ? Prism.highlight(code, grammar, language) : escapeHtml(code);
  }

  /** Progression d'un cours. */
  function courseProgress(course) {
    const done = course.lessons.filter((l) => Streak.isCompleted(l.id)).length;
    return { done, total: course.lessons.length, pct: Math.round((done / course.lessons.length) * 100) };
  }

  /** Index de la prochaine leçon à faire dans un cours (-1 si tout est fini). */
  const nextIndex = (course) => course.lessons.findIndex((l) => !Streak.isCompleted(l.id));

  /**
   * Anneau de progression en SVG.
   * @param {number} pct     0 à 100
   * @param {number} size    diamètre en px
   * @param {string} color   couleur CSS du trait
   * @param {string} label   HTML affiché au centre
   */
  function ring(pct, size, color, label = "", stroke = 8) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
    return `
      <div class="ring" style="width:${size}px;height:${size}px">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
          <circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/>
          <circle class="value" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}"
            stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
        </svg>
        <div class="ring-label">${label}</div>
      </div>`;
  }

  /** Mode focus (leçon) on/off + onglet actif dans la navigation. */
  function setChrome({ focus = false, nav = null, crumb = "" } = {}) {
    document.body.classList.toggle("focus", focus);
    document.body.classList.toggle("is-home", nav === "home"); // l'accueil a son propre tableau de bord
    document.querySelectorAll("[data-nav]").forEach((el) => el.classList.toggle("active", el.dataset.nav === nav));
    document.getElementById("crumb").innerHTML = crumb;
    window.scrollTo({ top: 0 });
    if (window.Dial) Dial.sync(nav); // le cadran se recale sur la page affichée
    // La scène 3D change de point de vue selon la page (js/scene3d.js)
    if (window.Scene3D) Scene3D.view(focus ? "focus" : ["home", "projects", "certs", "journal"].includes(nav) ? nav : "course");
  }

  /**
   * Aller à une page depuis le cadran rotatif : la page entre en arc,
   * du côté d'où vient son icône (direction -1 = gauche, 1 = droite).
   */
  function goPage(page, direction = 0) {
    const pages = { home: renderHome, projects: renderProjects, certs: renderCerts, journal: renderJournal };
    (pages[page] || renderHome)();
    view.classList.remove("arc-in", "from-left", "from-right");
    if (!direction) return;
    void view.offsetWidth; // relance l'animation
    view.classList.add("arc-in", direction > 0 ? "from-right" : "from-left");
    view.addEventListener("animationend", () => view.classList.remove("arc-in", "from-left", "from-right"), { once: true });
  }

  /* ======================================================================
     BARRE DU HAUT + RAIL : streak, XP, gels, objectif du jour
     ====================================================================== */
  function renderStats() {
    const s = Streak.state;
    const off = Streak.practicedToday() ? "" : " off"; // flamme grise tant qu'on n'a pas pratiqué aujourd'hui
    document.getElementById("stats").innerHTML = `
      <span class="pill flame${off}" title="Streak : jours consécutifs">${icon("flame", 17)}<span class="num" data-roll="pill-streak">${s.streak}</span></span>
      <span class="pill xp" title="XP total">${icon("bolt", 17)}<span class="num" data-roll="pill-xp">${s.totalXp}</span></span>
      <span class="pill ice" title="Gels de streak">${icon("snowflake", 17)}<span class="num" data-roll="pill-ice">${s.freezes}</span></span>`;

    document.getElementById("rail").innerHTML = streakCard() + goalCard();
    document.getElementById("sidebar-streak").innerHTML = `
      <div class="pill flame${off}" style="width:100%;justify-content:center">${icon("flame", 17)}${s.streak} jour${s.streak > 1 ? "s" : ""}</div>`;
  }

  /** Carte "streak" : gros chiffre, frise de 7 jours, mini-stats. */
  function streakCard() {
    const s = Streak.state;
    const lit = Streak.practicedToday();
    const week = Streak.lastSevenDays().map((d) => `
      <div class="day${d.done ? " done" : ""}${d.frozen ? " frozen" : ""}${d.today ? " today" : ""}" title="${d.key}">
        <span class="dot">${d.done ? icon("check", 14) : d.frozen ? icon("snowflake", 14) : ""}</span>${d.label}
      </div>`).join("");
    const msg = lit
      ? "Flamme allumée pour aujourd'hui."
      : s.streak > 0 ? "Fais une leçon pour garder ta série." : "Termine une leçon pour lancer ta série.";
    return `
      <section class="card streak-card" aria-label="Streak">
        <div class="streak-top">
          <span class="flame-badge${lit ? " lit" : ""}">${icon("flame", 26)}</span>
          <div>
            <div class="num streak-num">${s.streak}<small>jour${s.streak > 1 ? "s" : ""} d'affilée</small></div>
            <p style="color:var(--muted);font-size:.85rem;margin-top:4px">${msg}</p>
          </div>
        </div>
        <div class="week">${week}</div>
        <div class="mini-stats">
          <div class="mini-stat"><span class="num">${s.longest}</span><span>Record</span></div>
          <div class="mini-stat"><span class="num">${s.totalXp}</span><span>XP total</span></div>
          <div class="mini-stat"><span class="num">${s.freezes}</span><span>Gels</span></div>
        </div>
      </section>`;
  }

  /** Carte "objectif du jour" avec un anneau. */
  function goalCard() {
    const goal = Streak.state.dailyGoal;
    const xp = Streak.todayXp();
    const pct = Math.round((xp / goal) * 100);
    const label = `<span class="num" style="font-size:1.05rem">${Math.min(pct, 100)}%</span>`;
    return `
      <section class="card goal-row" aria-label="Objectif du jour">
        ${ring(pct, 72, pct >= 100 ? "var(--good)" : "var(--py)", label, 7)}
        <div>
          <span class="eyebrow">Objectif du jour</span>
          <div class="num" style="font-size:1.4rem;margin:2px 0">${xp} <span style="color:var(--muted);font-weight:600;font-size:1rem">/ ${goal} XP</span></div>
          <p>${pct >= 100 ? "Atteint. Tout le reste est du bonus." : `Encore ${goal - xp} XP, environ une leçon.`}</p>
        </div>
      </section>`;
  }

  /* ======================================================================
     ÉCRAN 1 : ACCUEIL
     ====================================================================== */
  function renderHome() {
    session = null;
    Chat.setContext(null, null);
    setChrome({ nav: "home", crumb: "<b>Accueil</b>" });

    // Bouton "Reprendre" : la prochaine leçon du cours le moins avancé... ou de Python par défaut
    const courses = Object.values(window.COURSES);
    const started = courses.find((c) => courseProgress(c).done > 0 && nextIndex(c) >= 0);
    const target = started || courses.find((c) => nextIndex(c) >= 0);
    let cont = "";
    if (target) {
      const i = nextIndex(target);
      const l = target.lessons[i];
      cont = `
        <button class="continue" data-action="start-lesson" data-course="${target.id}" data-index="${i}">
          <span class="tile">${icon(l.icon, 24)}</span>
          <span><small>${started ? "Reprendre" : "Commencer"} · ${target.name} · leçon ${i + 1}</small><strong>${escapeHtml(l.title)}</strong></span>
          <span class="go">${icon("arrow-right", 20)}</span>
        </button>`;
    }

    const card = (c) => {
      const p = courseProgress(c);
      const n = (c.projects || []).length;
      return `
        <button class="course cs" ${cs(c)} data-action="open-course" data-course="${c.id}">
          <span class="course-ico">${icon(c.badge, 24)}</span>
          <div style="display:flex;flex-direction:column;gap:6px">
            <h3>${c.name}</h3>
            <p>${c.tagline}</p>
          </div>
          <div class="course-foot">
            <div class="bar cc"><span style="width:${p.pct}%"></span></div>
            <span>${p.done}/${p.total} · ${n} projet${n > 1 ? "s" : ""}</span>
          </div>
          <div class="snippet">${SNIPPET[c.id] || ""}</div>
        </button>`;
    };
    const sections = GROUPS.map((g) => {
      const list = courses.filter((c) => c.group === g.id);
      return `
        <section>
          <div class="section-head"><div><h2>${g.title}</h2><p class="section-sub">${g.sub}</p></div>
            <span class="eyebrow">${list.reduce((a, c) => a + c.lessons.length, 0)} leçons</span></div>
          <div class="courses">${list.map(card).join("")}</div>
        </section>`;
    }).join("");

    // Bandeau "Projets" : le but final, ce qui va sur GitHub
    const projs = allProjects();
    const inProgress = projs.filter((p) => Projects.pct(p) > 0 && Projects.pct(p) < 100);
    const projBand = `
      <button class="proj-band" data-action="projects">
        <span class="tile">${icon("code", 22)}</span>
        <span><strong>${projs.length} projets portfolio</strong>
        <small>${inProgress.length ? `${inProgress.length} en cours · ` : ""}Chaque cours mène à des projets à publier sur ton GitHub.</small></span>
        ${icon("arrow-right", 20)}
      </button>`;

    const hour = new Date().getHours();
    const hello = hour < 12 ? "Bon matin" : hour < 18 ? "Bon après-midi" : "Bonsoir";

    view.innerHTML = `
      <div class="home">
        <header class="hello">
          <span class="eyebrow">${hello}</span>
          <h1>Une leçon par jour. Un projet GitHub à la fin.</h1>
          <p>Des fondations (Python, COBOL) à l'avant-garde de l'IA (UX, AI engineering, linguistique, sécurité), avec des sources officielles et des projets qui se montrent en entrevue.</p>
        </header>
        ${cont}
        <section class="glass-band" id="glass" aria-label="Ta progression"></section>
        ${projBand}
        ${sections}
      </div>`;
    // Tableau de bord en verre (js/glass.js) : série, objectif du jour, XP, semaine
    const glass = document.getElementById("glass");
    if (glass && window.Glass) {
      const st = Streak.state;
      const today = Streak._internals.todayKey();
      const day = (n) => Streak._internals.addDays(today, -n);
      Glass.mount(glass, {
        streak: st.streak, longest: st.longest, freezes: st.freezes, practiced: Streak.practicedToday(),
        todayXp: Streak.todayXp(), goal: st.dailyGoal, totalXp: st.totalXp,
        days14: Array.from({ length: 14 }, (_, k) => st.xpByDay[day(13 - k)] || 0),
        week: Array.from({ length: 7 }, (_, k) => ({ xp: st.xpByDay[day(6 - k)] || 0 })),
      });
    }
  }

  /* ======================================================================
     ÉCRAN 2 : PARCOURS D'UN COURS
     ====================================================================== */
  function renderCourse(courseId) {
    session = null;
    const course = window.COURSES[courseId];
    Chat.setContext(course.name, null);
    setChrome({ nav: course.id, crumb: `Cours · <b>${course.name}</b>` });
    const p = courseProgress(course);
    const current = nextIndex(course);

    const rows = course.lessons.map((lesson, i) => {
      const done = Streak.isCompleted(lesson.id);
      // Une leçon est débloquée si c'est la 1re, ou si la précédente est terminée
      const unlocked = i === 0 || Streak.isCompleted(course.lessons[i - 1].id);
      const state = done ? "done" : i === current ? "current" : unlocked ? "" : "locked";
      const chip = done
        ? `<span class="chip done">${icon("check", 13)}Terminée</span>`
        : i === current ? `<span class="chip now">À faire</span>`
        : unlocked ? "" : `<span class="chip">${icon("lock", 12)}Verrouillée</span>`;
      return `
        <li class="lesson-row ${state}">
          <span class="node">${done ? icon("check", 22) : unlocked ? icon(lesson.icon, 22) : icon("lock", 20)}</span>
          <button class="lesson-card" ${unlocked ? "" : "disabled"}
            data-action="start-lesson" data-course="${course.id}" data-index="${i}">
            <span class="n">${String(i + 1).padStart(2, "0")}</span>
            <span class="info"><strong>${escapeHtml(lesson.title)}</strong><span>${lesson.exercises.length} exercices</span></span>
            ${chip}
            ${unlocked ? icon("arrow-right", 18) : ""}
          </button>
        </li>`;
    }).join("");

    const projects = (course.projects || []).map(projectCard).join("");

    view.innerHTML = `
      <section class="unit cs" ${cs(course)}>
        <span class="unit-glyph">${icon(course.badge, 180)}</span>
        <span class="eyebrow">${course.group === "ia" ? "Avant-garde IA" : "Fondations"}</span>
        <h1>${course.name}</h1>
        <p>${course.tagline}</p>
        <div class="unit-meta">
          <div class="bar"><span style="width:${p.pct}%"></span></div>
          <span>${p.done} / ${p.total} leçons</span>
        </div>
      </section>
      <div class="section-head"><h2>Leçons</h2><span class="eyebrow">${p.total} leçons</span></div>
      <ol class="lessons">${rows}</ol>
      ${projects ? `
        <div class="section-head" style="margin-top:28px"><div><h2>Projets portfolio</h2>
          <p class="section-sub">À publier sur ton GitHub une fois les leçons conseillées terminées.</p></div></div>
        <div class="proj-grid">${projects}</div>` : ""}`;
  }

  /* ======================================================================
     ÉCRAN : PROJETS PORTFOLIO
     ====================================================================== */

  /** Carte résumée d'un projet (liste). */
  function projectCard(p) {
    const course = p.course || Object.values(window.COURSES).find((c) => (c.projects || []).includes(p));
    const pct = Projects.pct(p);
    const ready = !p.after || Streak.isCompleted(p.after);
    const afterLesson = course.lessons.find((l) => l.id === p.after);
    return `
      <button class="proj cs" ${cs(course)} data-action="open-project" data-project="${p.id}">
        <div class="proj-top">
          <span class="chip cc-chip">${icon(course.badge, 13)}${course.name}</span>
          <span class="chip">${p.level}</span>
          ${pct === 100 ? `<span class="chip done">${icon("check", 13)}Publié</span>` : ""}
        </div>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.pitch)}</p>
        <div class="proj-foot">
          <span>${icon("repeat", 14)}${p.duration}</span>
          <span class="${ready ? "" : "muted"}">${ready ? "Prêt à commencer" : `Après « ${escapeHtml(afterLesson ? afterLesson.title : "")} »`}</span>
        </div>
        <div class="bar cc"><span style="width:${pct}%"></span></div>
      </button>`;
  }

  /**
   * Carte "métier visé" : relie un poste à ses cours et à ses projets,
   * avec l'avancement moyen des projets recommandés.
   */
  function careerCard(job) {
    const projects = job.projects.map(findProject).filter(Boolean);
    const pct = projects.length ? Math.round(projects.reduce((a, p) => a + Projects.pct(p), 0) / projects.length) : 0;
    const courses = job.courses.map((id) => window.COURSES[id]).filter(Boolean);
    return `
      <article class="career">
        <div class="career-head">
          <span class="career-ico">${icon(job.icon, 22)}</span>
          <div style="min-width:0">
            <h3>${job.title}</h3>
            <p>${job.pitch}</p>
          </div>
        </div>
        <div class="career-block">
          <span class="eyebrow">Ce que regardent les recruteurs</span>
          <ul>${job.recruiters.map((r) => `<li>${icon("check", 14)}${r}</li>`).join("")}</ul>
        </div>
        <div class="career-block">
          <span class="eyebrow">Cours</span>
          <div class="chips">${courses.map((c) => `<button class="chip link cs cc-chip" ${cs(c)} data-action="open-course" data-course="${c.id}">${icon(c.badge, 13)}${c.name}</button>`).join("")}</div>
        </div>
        <div class="career-block">
          <span class="eyebrow">Projets à publier</span>
          <div class="chips">${projects.map((p) => `<button class="chip link${Projects.pct(p) === 100 ? " done" : ""}" data-action="open-project" data-project="${p.id}">${icon(Projects.pct(p) === 100 ? "check" : "folder", 13)}${escapeHtml(p.title)}</button>`).join("")}</div>
        </div>
        <div class="course-foot"><div class="bar"><span style="width:${pct}%"></span></div><span>${pct}%</span></div>
      </article>`;
  }

  function renderProjects() {
    session = null;
    Chat.setContext(null, null);
    setChrome({ nav: "projects", crumb: "<b>Projets</b>" });
    const groups = Object.values(window.COURSES).filter((c) => (c.projects || []).length);
    view.innerHTML = `
      <header class="hello">
        <span class="eyebrow">Portfolio</span>
        <h1>Des projets qui se montrent en entrevue.</h1>
        <p>Chaque projet devient un dépôt GitHub : code testé, README clair, résultats chiffrés.
        Les recruteurs regardent ce que tu as livré, comment tu l'as évalué et ce qui a cassé en route.</p>
      </header>
      <section style="margin-top:28px">
        <div class="section-head"><h2>Métiers visés</h2><span class="eyebrow">${(window.CAREERS || []).length} parcours</span></div>
        <div class="careers">${(window.CAREERS || []).map(careerCard).join("")}</div>
      </section>
      ${groups.map((c) => `
        <section style="margin-top:28px">
          <div class="section-head"><h2>${c.name}</h2><span class="eyebrow">${c.projects.length} projets</span></div>
          <div class="proj-grid">${c.projects.map((p) => projectCard({ ...p, course: c })).join("")}</div>
        </section>`).join("")}`;
  }

  function findProject(id) {
    return allProjects().find((p) => p.id === id);
  }

  function renderProject(id) {
    const p = findProject(id);
    const course = p.course;
    session = null;
    Chat.setContext(course.name, `Projet : ${p.title}`);
    setChrome({ nav: "projects", crumb: `Projets · <b>${escapeHtml(p.title)}</b>` });
    const state = Projects.get(p.id);
    const pct = Projects.pct(p);

    const checklist = (items, key) => items.map((text, i) => `
      <li><label class="check">
        <input type="checkbox" data-project="${p.id}" data-key="${key}" data-i="${i}" ${state[key] && state[key][i] ? "checked" : ""}>
        <span class="box">${icon("check", 14)}</span><span>${escapeHtml(text)}</span>
      </label></li>`).join("");

    // Parcours de documentation (js/guides.js) : doc officielle par étape + objectifs de niveau
    const guide = (window.GUIDES || {})[p.id];
    const levelDone = guide ? (state.level || []).filter(Boolean).length : 0;
    const stepItems = () => p.steps.map((text, i) => {
      const g = guide && guide.steps[i];
      return `
      <li class="step-item"><label class="check">
        <input type="checkbox" data-project="${p.id}" data-key="steps" data-i="${i}" ${state.steps && state.steps[i] ? "checked" : ""}>
        <span class="box">${icon("check", 14)}</span><span>${escapeHtml(text)}</span>
      </label>
      ${g ? `<details class="step-doc">
        <summary>${icon("book-open", 14)}Documentation de l'étape</summary>
        <p>${escapeHtml(g.learn)}</p>
        <ul>${g.docs.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${escapeHtml(t)} ${icon("external", 12)}</a></li>`).join("")}</ul>
      </details>` : ""}</li>`;
    }).join("");

    const repo = p.title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

    view.innerHTML = `
      <button class="back" data-action="projects">${icon("arrow-left", 18)}Tous les projets</button>
      <section class="unit cs" ${cs(course)}>
        <span class="unit-glyph">${icon(course.badge, 180)}</span>
        <span class="eyebrow">${course.name} · ${p.level} · ${p.duration}</span>
        <h1>${escapeHtml(p.title)}</h1>
        <p>${escapeHtml(p.pitch)}</p>
        <div class="unit-meta"><div class="bar"><span style="width:${pct}%"></span></div><span>${pct}%</span></div>
      </section>

      <div class="proj-layout">
        <div class="proj-main">
          <section class="card proj-why">
            <span class="eyebrow">Pourquoi ça aide à te faire embaucher</span>
            <p>${escapeHtml(p.hiring)}</p>
            <div class="stack">${p.stack.map((s) => `<span class="chip">${escapeHtml(s)}</span>`).join("")}</div>
          </section>

          ${guide ? `
          <section class="card level-card">
            <div class="section-head" style="margin-bottom:6px"><h2>Objectif : niveau intermédiaire</h2><span class="eyebrow">${levelDone}/${guide.intermediate.length}</span></div>
            <p class="muted-p">À la fin, tu dois pouvoir faire tout ceci <b>sans tutoriel</b>, avec seulement la documentation officielle. Coche honnêtement.</p>
            <ul class="checklist">${checklist(guide.intermediate, "level")}</ul>
          </section>` : ""}

          <section>
            <div class="section-head"><h2>Étapes et documentation</h2><span class="eyebrow">dépôt suggéré : ${repo}</span></div>
            ${guide ? `<p class="muted-p" style="margin-bottom:12px">Méthode : lis la doc officielle de l'étape, code sans copier, puis reviens à la doc quand tu bloques. C'est exactement ce qu'on fait au travail.</p>` : ""}
            <ul class="checklist">${stepItems()}</ul>
          </section>

          <section>
            <div class="section-head"><h2>Livrables dans le dépôt</h2></div>
            <ul class="checklist">${checklist(p.deliverables, "deliverables")}</ul>
          </section>
        </div>

        <aside class="proj-side">
          <section class="card">
            <span class="eyebrow">Questions d'entrevue</span>
            <ul class="plain">${p.interview.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>
          </section>
          <section class="card">
            <span class="eyebrow">Pour aller plus loin</span>
            <ul class="plain">${p.stretch.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>
          </section>
          <section class="card">
            <span class="eyebrow">Documentation officielle</span>
            <ul class="sources">${sourceLinks(p.sources)}</ul>
          </section>
          <div class="side-actions">
            <button class="btn btn-line" data-action="copy-readme" data-project="${p.id}">${icon("file", 16)}Copier le README</button>
            <button class="btn" data-action="ask-project" data-project="${p.id}">${icon("sparkles", 16)}Planifier avec le tuteur</button>
          </div>
        </aside>
      </div>`;

    // Cocher une étape : on sauvegarde et on met à jour la progression
    view.querySelectorAll(".checklist input").forEach((box) => box.addEventListener("change", () => {
      const st = Projects.get(p.id);
      const key = box.dataset.key;
      st[key] = st[key] || [];
      st[key][Number(box.dataset.i)] = box.checked;
      Projects.set(p.id, st);
      // Compteur "niveau intermédiaire" mis à jour en direct
      if (key === "level" && guide) {
        view.querySelector(".level-card .eyebrow").textContent = `${st.level.filter(Boolean).length}/${guide.intermediate.length}`;
      }
      const now = Projects.pct(p);
      view.querySelector(".unit-meta .bar span").style.width = now + "%";
      view.querySelector(".unit-meta > span").textContent = now + "%";
      if (now === 100) {
        const r = Streak.completeProject(p.id);
        if (r) { renderStats(); toast(`Projet terminé : +${r.xp} XP. Publie-le et épingle-le sur ton profil GitHub.`); }
      }
    }));
  }

  /** README de départ généré à partir de la fiche du projet. */
  function readmeFor(p) {
    return [
      `# ${p.title}`,
      "",
      p.pitch,
      "",
      "## Pourquoi ce projet",
      p.hiring,
      "",
      "## Stack",
      ...p.stack.map((s) => `- ${s}`),
      "",
      "## Feuille de route",
      ...p.steps.map((s) => `- [ ] ${s}`),
      "",
      "## Résultats",
      "_À compléter : chiffres, captures, démo._",
      "",
      "## Installation",
      "```bash",
      "# commandes d'installation et de lancement",
      "```",
      "",
      "## Ce que j'ai appris / ce qui a cassé",
      "_À compléter._",
      "",
      "## Références",
      ...p.sources.map((s) => `- [${s.title}](${s.url})`),
    ].join("\n");
  }

  /** Petit message temporaire en bas de l'écran. */
  function toast(text) {
    const t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4200);
  }

  /** Liste de liens vers les sources officielles. */
  function sourceLinks(sources = []) {
    return sources.map((s) => `
      <li><a href="${s.url}" target="_blank" rel="noopener">${icon("book-open", 15)}<span>${escapeHtml(s.title)}</span></a></li>`).join("");
  }

  /* ======================================================================
     ÉCRAN 3a : LEÇON — partie théorie (+ "Essaie-le toi-même")
     ====================================================================== */
  function startLesson(courseId, index) {
    const course = window.COURSES[courseId];
    const lesson = course.lessons[index];
    session = {
      course, lesson, lessonIndex: index,
      phase: "theory",
      queue: lesson.exercises.map((_, i) => i),
      solved: new Set(),
      mistakes: 0, checked: false, answer: null, bank: [],
    };
    Chat.setContext(course.name, lesson.title);
    if (course.run === "python") Runner.preload(); // on commence à charger Python en arrière-plan
    renderTheory();
  }

  /** Barre du haut d'une leçon : quitter + progression segmentée (1 segment par exercice). */
  function lessonTopBar() {
    const total = session.lesson.exercises.length;
    const segs = session.lesson.exercises.map((_, i) => `<span class="${session.solved.has(i) ? "on" : ""}"></span>`).join("");
    return `
      <div class="lesson-top">
        <button class="icon-btn" data-action="quit-lesson" aria-label="Quitter la leçon">${icon("x", 22)}</button>
        <div class="segments" aria-label="${session.solved.size} sur ${total} exercices réussis">${segs}</div>
        <span class="tag">${session.solved.size}/${total}</span>
        <button class="icon-btn" data-action="toggle-chat" aria-label="Ouvrir le tuteur IA" title="Tuteur IA">${icon("sparkles", 20)}</button>
      </div>`;
  }

  function renderTheory() {
    const { course, lesson } = session;
    setChrome({ focus: true });
    // Nom de fichier affiché dans la barre de l'éditeur
    const file = {
      python: "main.py",
      simulate: `${lesson.id.replace("cb-", "").toUpperCase()}.cbl`,
      preview: "composant.html",
    }[course.run];

    // Bouton d'action selon le mode du cours : exécuter (Python), simuler (COBOL), aperçu (HTML)
    const runBtn = {
      python: `<button class="btn btn-sm run" data-action="run">${icon("play", 14)}Exécuter</button>`,
      simulate: `<button class="btn btn-sm run" data-action="simulate">${icon("play", 14)}Simuler avec l'IA</button>`,
      preview: `<button class="btn btn-sm run" data-action="preview">${icon("play", 14)}Aperçu</button>`,
    }[course.run];

    // Sources officielles de la leçon
    const sources = lesson.sources && lesson.sources.length ? `
      <section class="sources-box">
        <span class="eyebrow">Sources officielles</span>
        <ul class="sources">${sourceLinks(lesson.sources)}</ul>
      </section>` : "";

    view.innerHTML = `
      ${lessonTopBar()}
      <article class="theory">
        <span class="eyebrow">${course.name} · Leçon ${session.lessonIndex + 1}</span>
        ${lesson.theory}

        <div class="ide cs" ${cs(course)}>
          <div class="ide-bar">
            <span class="ide-file"><span class="lamp"></span>${file} <em>· modifiable</em></span>
            <button class="btn btn-sm tool" data-action="reset-code" title="Réinitialiser le code">${icon("rotate", 14)}</button>
            <button class="btn btn-sm tool" data-action="explain">${icon("sparkles", 14)}Expliquer</button>
            ${runBtn}
          </div>
          <!-- Coloré en lecture ; un clic bascule vers la zone de texte éditable -->
          <pre class="language-${course.language}" id="code-view" title="Clique pour modifier"><code>${highlight(lesson.example, course.language)}</code></pre>
          <textarea id="code-edit" spellcheck="false" aria-label="Code modifiable" hidden>${escapeHtml(lesson.example)}</textarea>
          <div class="console" id="console" hidden>
            <div class="console-head">Console</div>
            <pre id="output"></pre>
          </div>
          <div class="preview" id="preview" hidden>
            <div class="console-head">Aperçu</div>
            <div class="preview-host" id="preview-host"></div>
          </div>
        </div>
        ${sources}
      </article>

      <div class="dock">
        <div class="dock-inner">
          <span class="hint">${lesson.exercises.length} exercices pour valider la leçon</span>
          <div class="actions">
            <button class="btn" data-action="begin-exercises">Commencer ${icon("arrow-right", 18)}</button>
          </div>
        </div>
      </div>`;

    // Mise en forme du contenu de la leçon : tableaux défilants, icône dans les astuces
    view.querySelectorAll(".theory table").forEach((t) => {
      const wrap = document.createElement("div");
      wrap.className = "table-wrap";
      t.replaceWith(wrap);
      wrap.appendChild(t);
    });
    view.querySelectorAll(".tip").forEach((tip) => {
      tip.innerHTML = `${icon("info", 18)}<div>${tip.innerHTML}</div>`;
    });

    // Illustration interactive de la leçon (js/visuals.js + js/viz.js),
    // placée juste après le premier titre, comme une « scène » à manipuler.
    const scene = (window.VISUALS || {})[lesson.id];
    if (scene && window.Viz) {
      const box = document.createElement("section");
      box.className = "viz cs";
      box.setAttribute("style", `--cl:${course.color ? course.color.light : ""};--cd:${course.color ? course.color.dark : ""}`);
      const h2 = view.querySelector(".theory h2");
      if (h2) h2.after(box); else view.querySelector(".theory").prepend(box);
      Viz.mount(box, scene);
    }

    document.getElementById("code-view").addEventListener("click", switchToEditor);
  }

  function switchToEditor() {
    const pre = document.getElementById("code-view");
    const ta = document.getElementById("code-edit");
    if (!pre || pre.hidden) return;
    const h = pre.offsetHeight;
    pre.hidden = true;
    ta.hidden = false;
    ta.style.height = Math.max(200, h) + "px";
    ta.focus();
    // La touche Tab insère 4 espaces au lieu de quitter la zone (pratique pour Python)
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const { selectionStart: s, selectionEnd: en, value } = ta;
        ta.value = value.slice(0, s) + "    " + value.slice(en);
        ta.selectionStart = ta.selectionEnd = s + 4;
      }
    });
  }

  /** Code actuellement dans l'éditeur (modifié ou non). */
  const currentCode = () => document.getElementById("code-edit")?.value ?? session.lesson.example;

  /**
   * Affiche le HTML de l'éditeur dans un "shadow DOM" : ses styles restent
   * isolés et n'abîment pas l'interface de l'app (les scripts ne s'exécutent pas).
   */
  function previewCode() {
    const box = document.getElementById("preview");
    const host = document.getElementById("preview-host");
    box.hidden = false;
    const root = host.shadowRoot || host.attachShadow({ mode: "open" });
    root.innerHTML = currentCode();
  }

  async function runCode() {
    const box = document.getElementById("console");
    const out = document.getElementById("output");
    box.hidden = false;
    box.classList.remove("error");
    out.textContent = "Chargement de Python… (quelques secondes la première fois)";
    try {
      const { output, error } = await Runner.runPython(currentCode());
      out.textContent = error ? `${output}${error}` : output;
      box.classList.toggle("error", Boolean(error));
    } catch (e) {
      box.classList.add("error");
      out.textContent = "Impossible de charger Python. Vérifie ta connexion internet puis réessaie.";
    }
  }

  /* ======================================================================
     ÉCRAN 3b : LEÇON — exercices
     ====================================================================== */
  function renderExercise() {
    const { lesson, course } = session;
    const exIndex = session.queue[0];
    const ex = lesson.exercises[exIndex];
    session.checked = false;

    let body = "";
    const codeBlock = ex.code && ex.type !== "fill"
      ? `<pre class="ex-code">${highlight(ex.code, course.language)}</pre>` : "";

    if (ex.type === "mcq") {
      // ---- Choix multiple (touches 1 à 4 au clavier) ----
      session.answer = null;
      body = `${codeBlock}<div class="choices" role="radiogroup">${ex.choices.map((c, i) => `
          <button class="choice" role="radio" aria-checked="false" data-action="choose" data-index="${i}">
            <kbd>${i + 1}</kbd><span>${escapeHtml(c)}</span>
          </button>`).join("")}</div>`;
    } else if (ex.type === "fill") {
      // ---- Texte à trou : le "___" devient un champ de saisie ----
      session.answer = "";
      const [before, after] = ex.code.split("___");
      body = `<pre class="ex-code">${escapeHtml(before)}<input id="fill" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Ta réponse">${escapeHtml(after ?? "")}</pre>`;
    } else if (ex.type === "order") {
      // ---- Remettre les lignes dans l'ordre ----
      session.answer = [];
      let bank = shuffle(ex.lines);
      for (let t = 0; t < 5 && bank.join() === ex.lines.join(); t++) bank = shuffle(ex.lines);
      session.bank = bank.map((text, id) => ({ id, text, used: false }));
      body = `<div class="slots" id="slots" aria-label="Ta réponse"></div><div class="bank" id="bank"></div>`;
    }

    const retry = session.mistakes > 0 && lesson.exercises.length - session.solved.size === session.queue.length && session.queue.length < lesson.exercises.length;
    view.innerHTML = `
      ${lessonTopBar()}
      <section class="exercise">
        <span class="kind">${icon(KIND[ex.type].icon, 16)}${KIND[ex.type].label}${retry ? " · nouvel essai" : ""}</span>
        <h2>${escapeHtml(ex.q)}</h2>
        ${body}
      </section>
      <div class="dock" id="dock">
        <div class="dock-inner">
          <span class="hint" id="feedback">${ex.type === "mcq" ? "Astuce : touches 1 à " + ex.choices.length + " et Entrée" : ""}</span>
          <div class="actions" id="dock-actions">
            <button class="btn" id="check-btn" data-action="check" disabled>Vérifier</button>
          </div>
        </div>
      </div>`;

    if (ex.type === "order") renderOrderZones();
    if (ex.type === "fill") {
      const input = document.getElementById("fill");
      input.style.width = Math.max(6, Math.max(...ex.answers.map((a) => a.length)) + 3) + "ch";
      input.focus();
      input.addEventListener("input", () => {
        session.answer = input.value;
        setCheckEnabled(input.value.trim() !== "");
      });
    }
  }

  /** Redessine la zone réponse + la banque de lignes (exercice "order"). */
  function renderOrderZones() {
    document.getElementById("slots").innerHTML = session.answer.map((id) =>
      `<button class="line-chip" data-action="unpick" data-id="${id}">${escapeHtml(session.bank[id].text)}</button>`).join("");
    document.getElementById("bank").innerHTML = session.bank.map((b) =>
      `<button class="line-chip${b.used ? " used" : ""}" data-action="pick" data-id="${b.id}">${escapeHtml(b.text)}</button>`).join("");
    setCheckEnabled(session.answer.length === session.bank.length);
  }

  function setCheckEnabled(on) {
    const btn = document.getElementById("check-btn");
    if (btn && !session.checked) btn.disabled = !on;
  }

  /**
   * Normalise une réponse saisie pour la comparer :
   * espaces superflus retirés ; en COBOL la casse ne compte pas ;
   * en Python, ' et " sont équivalents.
   */
  function normalize(text, language) {
    let t = text.trim().replace(/\s+/g, " ");
    if (language === "cobol") t = t.toUpperCase();
    if (language === "python") t = t.replace(/'/g, '"');
    return t;
  }

  /** Vérifie la réponse et affiche la correction dans le dock du bas. */
  function checkAnswer() {
    const { lesson, course } = session;
    const exIndex = session.queue[0];
    const ex = lesson.exercises[exIndex];
    let ok = false;
    let solution = "";

    if (ex.type === "mcq") {
      ok = session.answer === ex.answer;
      solution = ex.choices[ex.answer];
      // On colore le bon choix (et le mauvais si besoin)
      view.querySelectorAll(".choice").forEach((c) => {
        const i = Number(c.dataset.index);
        if (i === ex.answer) c.classList.add("right");
        else if (i === session.answer) c.classList.add("wrong");
      });
    } else if (ex.type === "fill") {
      ok = ex.answers.some((a) => normalize(a, course.language) === normalize(session.answer, course.language));
      solution = ex.answers[0];
      document.getElementById("fill").disabled = true;
    } else if (ex.type === "order") {
      ok = session.answer.map((id) => session.bank[id].text).join("\n") === ex.lines.join("\n");
      solution = ex.lines.join("  ⏎  ");
    }

    session.checked = true;
    session.lastSolution = solution;

    session.queue.shift(); // on retire l'exercice de la file...
    if (ok) session.solved.add(exIndex);
    else {
      session.mistakes++;
      session.queue.push(exIndex); // ...et on le remet à la fin s'il est raté (comme Duolingo)
      session.lastWrong = exIndex;
    }

    const dock = document.getElementById("dock");
    dock.classList.add(ok ? "ok" : "ko");
    const fb = document.getElementById("feedback");
    fb.className = "verdict";
    fb.innerHTML = ok
      ? `<span class="badge">${icon("check", 22)}</span>
         <div><strong>Bien joué</strong><p>${escapeHtml(ex.explain || "")}</p></div>`
      : `<span class="badge">${icon("x", 22)}</span>
         <div><strong>Réponse attendue : <code>${escapeHtml(solution)}</code></strong><p>${escapeHtml(ex.explain || "")}</p></div>`;

    document.getElementById("dock-actions").innerHTML = `
      ${ok ? "" : `<button class="btn btn-line" data-action="ask-why">${icon("sparkles", 16)}Pourquoi ?</button>`}
      <button class="btn ${ok ? "btn-good" : "btn-bad"}" id="check-btn" data-action="next">Continuer ${icon("arrow-right", 18)}</button>`;

    // Mise à jour de la barre segmentée
    view.querySelector(".lesson-top").outerHTML = lessonTopBar();
  }

  function nextExercise() {
    if (session.queue.length === 0) finishLesson();
    else renderExercise();
  }

  /* ======================================================================
     ÉCRAN 4 : RÉSULTAT
     ====================================================================== */
  function finishLesson() {
    const perfect = session.mistakes === 0;
    const r = Streak.completeLesson(session.lesson.id, perfect);
    session.phase = "result";
    renderStats();

    const s = Streak.state;
    const total = session.lesson.exercises.length;
    const accuracy = Math.round((total / (total + session.mistakes)) * 100);
    const next = session.course.lessons[session.lessonIndex + 1];

    const rewards = [
      r.streakExtended ? `<span class="reward">${icon("flame", 16)}Série : ${s.streak} jour${s.streak > 1 ? "s" : ""}</span>` : "",
      r.goalReached ? `<span class="reward goal">${icon("target", 16)}Objectif du jour atteint</span>` : "",
      r.freezeEarned ? `<span class="reward ice">${icon("snowflake", 16)}Nouveau gel de streak</span>` : "",
      perfect ? `<span class="reward goal">${icon("star", 16)}Sans faute</span>` : "",
    ].join("");

    const center = `<span class="hero-flame">${icon(r.streakExtended ? "flame" : "trophy", 56)}</span>`;

    view.innerHTML = `
      <section class="result">
        <div class="result-ring">${ring(accuracy, 168, perfect ? "var(--good)" : "var(--flame-b)", center, 10)}</div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
          <span class="eyebrow">${session.course.name} · Leçon ${session.lessonIndex + 1}</span>
          <h1>${escapeHtml(session.lesson.title)} : validée</h1>
          <p>${perfect ? "Aucune erreur. Propre." : `${session.mistakes} erreur${session.mistakes > 1 ? "s" : ""} corrigée${session.mistakes > 1 ? "s" : ""} en route. C'est comme ça qu'on apprend.`}</p>
        </div>
        <div class="result-stats">
          <div class="result-stat xp">${icon("bolt", 18)}<span class="num">+${r.xp}</span><span>XP</span></div>
          <div class="result-stat acc">${icon("target", 18)}<span class="num">${accuracy}%</span><span>Précision</span></div>
          <div class="result-stat flame">${icon("flame", 18)}<span class="num">${s.streak}</span><span>Série</span></div>
        </div>
        <div class="rewards">${rewards}</div>
      </section>
      <div class="dock">
        <div class="dock-inner">
          <div class="actions">
            <button class="btn btn-line" data-action="open-course" data-course="${session.course.id}">Parcours</button>
            ${next
              ? `<button class="btn" data-action="start-lesson" data-course="${session.course.id}" data-index="${session.lessonIndex + 1}">Leçon suivante ${icon("arrow-right", 18)}</button>`
              : `<button class="btn" data-action="home">Accueil</button>`}
          </div>
        </div>
      </div>`;
  }

  /* ======================================================================
     RÉGLAGES (fenêtre modale)
     ====================================================================== */
  function openSettings() {
    const ai = Chat.getSettings();
    const goal = Streak.state.dailyGoal;
    const models = [
      ["claude-haiku-5-5", "Claude Haiku 5.5 · rapide et économique"],
      ["claude-sonnet-5-5", "Claude Sonnet 5.5 · équilibré"],
      ["claude-opus-5-5", "Claude Opus 5.5 · le plus puissant"],
    ];
    const goals = [[10, "Détente"], [20, "Normal"], [30, "Sérieux"], [50, "Intense"]];
    const modal = document.getElementById("modal");
    modal.innerHTML = `
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="set-title">
        <div class="modal-head">
          <h2 id="set-title">Réglages</h2>
          <button class="icon-btn" data-action="close-modal" aria-label="Fermer">${icon("x")}</button>
        </div>
        <div class="field">
          <label for="set-key">Clé API Anthropic</label>
          <div class="input-wrap">${icon("key", 18)}<input id="set-key" type="password" placeholder="sk-ant-…" value="${escapeHtml(ai.apiKey || "")}" autocomplete="off"></div>
          <small>Nécessaire pour le tuteur IA. Crée-la sur console.anthropic.com ; elle reste dans ce navigateur.</small>
        </div>
        <div class="field">
          <label for="set-model">Modèle du tuteur</label>
          <select id="set-model">${models.map(([v, l]) =>
            `<option value="${v}" ${v === (ai.model || Chat.DEFAULT_MODEL) ? "selected" : ""}>${l}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label>Objectif quotidien</label>
          <div class="goals" role="radiogroup">${goals.map(([v, l]) =>
            `<button class="goal-opt${v === goal ? " on" : ""}" role="radio" aria-checked="${v === goal}" data-action="pick-goal" data-goal="${v}"><b>${v}</b>XP · ${l}</button>`).join("")}</div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-sm btn-line danger" data-action="reset-progress">${icon("trash", 14)}Réinitialiser</button>
          <span class="spacer"></span>
          <button class="btn btn-soft" data-action="close-modal">Annuler</button>
          <button class="btn" data-action="save-settings">Enregistrer</button>
        </div>
      </div>`;
    modal.hidden = false;
  }

  function closeModal() {
    document.getElementById("modal").hidden = true;
  }

  function saveSettingsFromModal() {
    Chat.saveSettings({
      apiKey: document.getElementById("set-key").value.trim(),
      model: document.getElementById("set-model").value,
    });
    const picked = document.querySelector(".goal-opt.on");
    if (picked) Streak.setDailyGoal(Number(picked.dataset.goal));
    closeModal();
    renderStats();
    if (!session) renderHome();
  }

  /* ======================================================================
     GESTION DES CLICS (délégation : un seul écouteur pour toute la page)
     ====================================================================== */
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) {
      if (e.target.id === "modal") closeModal(); // clic sur le fond = fermer
      return;
    }
    const { action } = el.dataset;

    switch (action) {
      case "home": renderHome(); break;
      case "open-course": renderCourse(el.dataset.course); break;
      case "start-lesson": startLesson(el.dataset.course, Number(el.dataset.index)); break;
      case "quit-lesson": renderCourse(session.course.id); break;

      // --- Théorie ---
      case "run": runCode(); break;
      case "preview": previewCode(); break;

      // --- Projets ---
      case "projects": renderProjects(); break;

      // --- Certifications ---
      case "certs": renderCerts(); break;
      case "cert-filter": certFilter = el.dataset.filter; renderCerts(); break;

      // --- Journal de veille ---
      case "journal": renderJournal(); break;
      case "journal-type":
        journalType = el.dataset.type;
        document.querySelectorAll('[data-action="journal-type"]').forEach((b) => {
          b.classList.toggle("on", b === el);
          b.setAttribute("aria-checked", b === el);
        });
        break;
      case "journal-filter": journalFilter = el.dataset.filter; renderJournal(); break;
      case "journal-delete":
        if (el.dataset.confirm === "1") {
          Journal.save(Journal.all().filter((x) => x.id !== el.dataset.id));
          renderJournal();
        } else {
          // Confirmation en deux clics
          el.dataset.confirm = "1";
          el.classList.add("danger");
          el.title = "Cliquer encore pour supprimer";
        }
        break;
      case "journal-digest": {
        const since = Streak._internals.addDays(Streak._internals.todayKey(), -6);
        const week = Journal.all().filter((x) => x.date >= since);
        Chat.send("Voici mon journal de veille des 7 derniers jours. Fais-moi un bilan court : les 3 points clés, " +
          "ce que je devrais approfondir, et une action concrète pour mon portfolio ou mes certifications.\n\n" +
          week.map((x) => `- [${JOURNAL_TYPES[x.type]?.label}] ${x.title}${x.note ? ` : ${x.note}` : ""}`).join("\n"));
        break;
      }
      case "open-project": renderProject(el.dataset.project); break;
      case "copy-readme": {
        const text = readmeFor(findProject(el.dataset.project));
        // Le presse-papiers peut être refusé : on affiche alors le texte à copier à la main
        navigator.clipboard?.writeText(text)
          .then(() => toast("README copié : colle-le dans ton nouveau dépôt GitHub."))
          .catch(() => {
            Chat.open();
            Chat.note("Copie ce README dans ton dépôt :\n\n" + text);
          });
        break;
      }
      case "ask-project": {
        const p = findProject(el.dataset.project);
        Chat.send(`Je commence le projet portfolio « ${p.title} » (${p.course.name}). Objectif : ${p.pitch}\n` +
          `Étapes prévues :\n${p.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n` +
          `Aide-moi à planifier la première étape concrètement (structure du dépôt, premiers fichiers, commandes).`);
        break;
      }
      case "reset-code": renderTheory(); break;
      case "explain":
        Chat.send(`Explique-moi ce code ligne par ligne :\n\n\`\`\`${session.course.language}\n${currentCode()}\n\`\`\``);
        break;
      case "simulate":
        Chat.send(`Simule l'exécution de ce programme COBOL et montre la sortie console exacte, puis explique brièvement :\n\n\`\`\`cobol\n${currentCode()}\n\`\`\``);
        break;
      case "begin-exercises": session.phase = "exercise"; renderExercise(); break;

      // --- Exercices ---
      case "choose":
        if (session.checked) break;
        session.answer = Number(el.dataset.index);
        view.querySelectorAll(".choice").forEach((c) => {
          c.classList.toggle("selected", c === el);
          c.setAttribute("aria-checked", c === el);
        });
        setCheckEnabled(true);
        break;
      case "pick": {
        if (session.checked) break;
        const item = session.bank[Number(el.dataset.id)];
        if (item.used) break;
        item.used = true;
        session.answer.push(item.id);
        renderOrderZones();
        break;
      }
      case "unpick": {
        if (session.checked) break;
        const id = Number(el.dataset.id);
        session.answer = session.answer.filter((x) => x !== id);
        session.bank[id].used = false;
        renderOrderZones();
        break;
      }
      case "check": checkAnswer(); break;
      case "next": nextExercise(); break;
      case "ask-why": {
        const ex = session.lesson.exercises[session.lastWrong];
        Chat.send(`Je me suis trompé à cet exercice (${session.course.name}) : « ${ex.q} »` +
          (ex.code ? `\n\n\`\`\`\n${ex.code}\n\`\`\`` : "") +
          `\n\nLa bonne réponse était : ${session.lastSolution}. Peux-tu m'expliquer pourquoi ?`);
        break;
      }

      // --- Chat & réglages ---
      case "toggle-chat": Chat.toggle(); break;
      case "settings": openSettings(); break;
      case "close-modal": closeModal(); break;
      case "save-settings": saveSettingsFromModal(); break;
      case "pick-goal":
        document.querySelectorAll(".goal-opt").forEach((g) => {
          g.classList.toggle("on", g === el);
          g.setAttribute("aria-checked", g === el);
        });
        break;
      case "reset-progress":
        if (el.dataset.confirm === "1") {
          Streak.reset();
          Storage.remove("projects");
          closeModal();
          renderStats();
          renderHome();
        } else {
          // Confirmation en deux clics plutôt qu'une boîte confirm() bloquante
          el.dataset.confirm = "1";
          el.innerHTML = `${icon("trash", 14)}Confirmer ?`;
        }
        break;
    }
  });

  /* Clavier : Entrée = Vérifier / Continuer ; touches 1-9 = choisir une réponse ; Échap = fermer */
  /* Changement de statut / date d'une certification */
  document.addEventListener("change", (e) => {
    if (e.target.dataset.certStatus || e.target.dataset.certDate) onCertChange(e.target);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.getElementById("chat").hidden = true;
      return;
    }
    if (!session || session.phase !== "exercise") return;
    if (e.target.id === "chat-input" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "Enter") {
      const btn = document.getElementById("check-btn");
      if (btn && !btn.disabled) { e.preventDefault(); btn.click(); }
    } else if (/^[1-9]$/.test(e.key) && e.target.tagName !== "INPUT") {
      view.querySelector(`.choice[data-index="${Number(e.key) - 1}"]`)?.click();
    }
  });

  /* ======================================================================
     DÉMARRAGE
     ====================================================================== */
  /** Construit la liste des cours dans la barre latérale à partir de COURSES. */
  /* ======================================================================
     CERTIFICATIONS
     Données : js/certs.js (window.CERTS). Le statut de chaque certification
     (envisagée, en préparation, examen planifié, obtenue) et la date
     d'examen sont sauvegardés localement.
     ====================================================================== */
  const CertState = {
    all: () => Storage.get("certs", {}),
    get(id) { return this.all()[id] || { status: "none", date: "" }; },
    set(id, data) { const a = this.all(); a[id] = { ...this.get(id), ...data }; Storage.set("certs", a); },
  };
  const CERT_STATUS = [
    ["none", "Pas commencée"], ["planned", "Envisagée"], ["prep", "En préparation"], ["exam", "Examen réservé"], ["done", "Obtenue"],
  ];
  let certFilter = "all";

  function certCard(c) {
    const st = CertState.get(c.id);
    const courses = (c.covers.courses || []).map((id) => window.COURSES[id]).filter(Boolean);
    const projects = (c.covers.projects || []).map(findProject).filter(Boolean);
    return `
      <article class="cert${st.status === "done" ? " is-done" : ""}" id="cert-${c.id}">
        <header class="cert-head">
          <span class="chip">${c.level}</span>
          ${st.status === "done" ? `<span class="chip done">${icon("check", 13)}Obtenue</span>` : ""}
        </header>
        <div>
          <h3>${escapeHtml(c.name)}</h3>
          <p class="cert-issuer">${escapeHtml(c.issuer)}</p>
        </div>
        <dl class="cert-facts">
          <div><dt>Coût</dt><dd>${escapeHtml(c.cost)}${c.costChecked ? "" : ` <span class="chip warn">à vérifier</span>`}</dd></div>
          <div><dt>Format</dt><dd>${escapeHtml(c.format)}</dd></div>
          <div><dt>Prérequis</dt><dd>${escapeHtml(c.prereq)}</dd></div>
        </dl>
        ${c.note ? `<p class="cert-note">${icon("info", 16)}<span>${escapeHtml(c.note)}</span></p>` : ""}
        <div class="career-block">
          <span class="eyebrow">L'app te prépare avec</span>
          <div class="chips">
            ${courses.map((co) => `<button class="chip link cs cc-chip" ${cs(co)} data-action="open-course" data-course="${co.id}">${icon(co.badge, 13)}${co.name}</button>`).join("")}
            ${projects.map((p) => `<button class="chip link" data-action="open-project" data-project="${p.id}">${icon("folder", 13)}${escapeHtml(p.title)}</button>`).join("")}
          </div>
        </div>
        <div class="career-block">
          <span class="eyebrow">À étudier en plus</span>
          <p class="cert-gap">${escapeHtml(c.gaps)}</p>
        </div>
        <details class="cert-steps">
          <summary>Comment l'obtenir</summary>
          <ol>${c.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
        </details>
        <footer class="cert-foot">
          <label class="sr-only" for="st-${c.id}">Statut</label>
          <select id="st-${c.id}" data-cert-status="${c.id}">
            ${CERT_STATUS.map(([v, l]) => `<option value="${v}" ${v === st.status ? "selected" : ""}>${l}</option>`).join("")}
          </select>
          <label class="sr-only" for="dt-${c.id}">Date de l'examen</label>
          <input id="dt-${c.id}" type="date" data-cert-date="${c.id}" value="${st.date || ""}" ${st.status === "exam" || st.status === "done" ? "" : "hidden"}>
          <a class="btn btn-sm btn-line" href="${c.url}" target="_blank" rel="noopener">${icon("external", 14)}Page officielle</a>
        </footer>
      </article>`;
  }

  function renderCerts() {
    session = null;
    Chat.setContext(null, "Certifications");
    setChrome({ nav: "certs", crumb: "<b>Certifications</b>" });
    const certs = window.CERTS || [];
    const states = certs.map((c) => ({ c, st: CertState.get(c.id) }));
    const done = states.filter((x) => x.st.status === "done").length;
    const prep = states.filter((x) => ["prep", "exam"].includes(x.st.status)).length;
    const next = states.filter((x) => x.st.status === "exam" && x.st.date).sort((a, b) => a.st.date.localeCompare(b.st.date))[0];
    const shown = certFilter === "all" ? certs : certs.filter((c) => c.careers.includes(certFilter));

    view.innerHTML = `
      <header class="hello">
        <span class="eyebrow">Certifications</span>
        <h1>Les certifications reconnues, et le chemin pour les obtenir.</h1>
        <p>Une certification passe les filtres RH ; ton portfolio prouve que tu sais livrer. Pour chacune : ce que l'app couvre,
        ce qu'il faut étudier ailleurs, les étapes et la page officielle. Prix vérifiés en octobre 2026 : relis toujours la page officielle avant de payer.</p>
      </header>
      <div class="kpis">
        <div class="kpi"><span class="num">${done}</span><span>Obtenues</span></div>
        <div class="kpi"><span class="num">${prep}</span><span>En préparation</span></div>
        <div class="kpi"><span class="num">${next ? new Date(next.st.date + "T12:00").toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) : "—"}</span><span>${next ? escapeHtml(next.c.name.split(" — ")[0].split(" (")[0]) : "Prochain examen"}</span></div>
      </div>
      <div class="filters" role="tablist" aria-label="Filtrer par métier">
        <button class="filter${certFilter === "all" ? " on" : ""}" data-action="cert-filter" data-filter="all">Tous</button>
        ${(window.CAREERS || []).map((j) => `<button class="filter${certFilter === j.id ? " on" : ""}" data-action="cert-filter" data-filter="${j.id}">${icon(j.icon, 14)}${j.title}</button>`).join("")}
      </div>
      <div class="cert-grid">${shown.map(certCard).join("")}</div>`;
  }

  /** Changement de statut ou de date d'une certification. */
  function onCertChange(el) {
    if (el.dataset.certStatus) {
      const id = el.dataset.certStatus;
      CertState.set(id, { status: el.value });
      if (el.value === "done") {
        const r = Streak.award(`cert:${id}`, 100); // +100 XP la première fois
        if (r) renderStats();
      }
      renderCerts();
      document.getElementById(`cert-${id}`)?.scrollIntoView({ block: "center" });
    } else if (el.dataset.certDate) {
      CertState.set(el.dataset.certDate, { date: el.value });
    }
  }

  /* ======================================================================
     JOURNAL DE VEILLE
     Pour noter les tendances, failles, innovations, certifications et
     apprentissages, avec "ce que ça change pour moi". Chaque entrée
     rapporte 5 XP (3 fois par jour au maximum) et compte pour le streak.
     ====================================================================== */
  const JOURNAL_TYPES = {
    tendance: { label: "Tendance", icon: "rocket" },
    faille: { label: "Faille", icon: "bug" },
    innovation: { label: "Innovation", icon: "sparkles" },
    certif: { label: "Certification", icon: "trophy" },
    appris: { label: "Appris", icon: "book-open" },
  };
  const Journal = {
    all: () => Storage.get("journal", []),
    save: (list) => Storage.set("journal", list),
  };
  let journalFilter = "all";
  let journalType = "tendance";

  function journalEntry(e) {
    const t = JOURNAL_TYPES[e.type] || JOURNAL_TYPES.appris;
    const job = (window.CAREERS || []).find((j) => j.id === e.domain);
    const date = new Date(e.date + "T12:00").toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });
    const safeUrl = /^https?:\/\//i.test(e.url || "") ? e.url : "";
    return `
      <li class="entry type-${e.type}">
        <span class="entry-ico">${icon(t.icon, 18)}</span>
        <div class="entry-body">
          <div class="entry-meta"><span>${t.label}</span><span>${date}</span>${job ? `<span>${escapeHtml(job.title)}</span>` : ""}</div>
          <h3>${safeUrl ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener">${escapeHtml(e.title)} ${icon("external", 13)}</a>` : escapeHtml(e.title)}</h3>
          ${e.note ? `<p>${escapeHtml(e.note)}</p>` : ""}
        </div>
        <button class="icon-btn" data-action="journal-delete" data-id="${e.id}" aria-label="Supprimer l'entrée" title="Supprimer">${icon("trash", 16)}</button>
      </li>`;
  }

  function renderJournal() {
    session = null;
    Chat.setContext(null, "Journal de veille");
    setChrome({ nav: "journal", crumb: "<b>Journal de veille</b>" });
    const list = Journal.all();
    const weekAgo = Streak._internals.addDays(Streak._internals.todayKey(), -6);
    const thisWeek = list.filter((e) => e.date >= weekAgo).length;
    const goal = 3;
    const shown = (journalFilter === "all" ? list : list.filter((e) => e.type === journalFilter))
      .slice().sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));

    view.innerHTML = `
      <header class="hello">
        <span class="eyebrow">Journal de veille</span>
        <h1>Ce qui bouge, et ce que ça change pour toi.</h1>
        <p>Note une tendance, une faille, une innovation ou une certification, avec ce que tu en retiens. Trois entrées par semaine
        suffisent pour rester à jour, et chaque entrée compte pour ton streak.</p>
      </header>

      <section class="journal-top">
        <div class="card goal-row">
          ${ring(Math.round((thisWeek / goal) * 100), 72, thisWeek >= goal ? "var(--good)" : "var(--py)", `<span class="num" style="font-size:1.1rem">${thisWeek}/${goal}</span>`, 7)}
          <div>
            <span class="eyebrow">Cette semaine</span>
            <p>${thisWeek >= goal ? "Objectif de veille atteint." : `Encore ${goal - thisWeek} entrée${goal - thisWeek > 1 ? "s" : ""} pour ta veille hebdomadaire.`}</p>
            <button class="btn btn-sm btn-line" data-action="journal-digest" style="margin-top:8px" ${thisWeek ? "" : "disabled"}>${icon("sparkles", 14)}Bilan de la semaine avec le tuteur</button>
          </div>
        </div>

        <form class="card journal-form" id="journal-form">
          <div class="type-pick" role="radiogroup" aria-label="Type d'entrée">
            ${Object.entries(JOURNAL_TYPES).map(([k, t]) => `<button type="button" class="filter${k === journalType ? " on" : ""}" role="radio" aria-checked="${k === journalType}" data-action="journal-type" data-type="${k}">${icon(t.icon, 14)}${t.label}</button>`).join("")}
          </div>
          <div class="field"><label for="j-title">Titre</label><input id="j-title" required maxlength="160" placeholder="Ex. : OWASP publie une mise à jour du Top 10 Agentic"></div>
          <div class="journal-row">
            <div class="field"><label for="j-url">Lien (facultatif)</label><input id="j-url" type="url" placeholder="https://…"></div>
            <div class="field"><label for="j-domain">Métier concerné</label>
              <select id="j-domain"><option value="">Général</option>${(window.CAREERS || []).map((j) => `<option value="${j.id}">${j.title}</option>`).join("")}</select>
            </div>
          </div>
          <div class="field"><label for="j-note">Ce que ça change pour moi</label><textarea id="j-note" rows="3" placeholder="Ex. : vérifier les descriptions d'outils de mon serveur MCP ; ajouter un test au projet de red team."></textarea></div>
          <button class="btn" type="submit">${icon("check", 16)}Ajouter au journal</button>
        </form>
      </section>

      <section style="margin-top:28px">
        <div class="section-head"><h2>Entrées</h2><span class="eyebrow">${list.length} au total</span></div>
        <div class="filters">
          <button class="filter${journalFilter === "all" ? " on" : ""}" data-action="journal-filter" data-filter="all">Toutes</button>
          ${Object.entries(JOURNAL_TYPES).map(([k, t]) => `<button class="filter${journalFilter === k ? " on" : ""}" data-action="journal-filter" data-filter="${k}">${icon(t.icon, 14)}${t.label}</button>`).join("")}
        </div>
        ${shown.length ? `<ul class="entries">${shown.map(journalEntry).join("")}</ul>`
          : `<div class="empty">${icon("eye", 28)}<p>Aucune entrée pour l'instant. Commence par une source ci-dessous : lis une nouveauté, puis note ce que tu en retiens.</p></div>`}
      </section>

      <section style="margin-top:28px">
        <div class="section-head"><h2>Où faire ta veille</h2><span class="eyebrow">Sources officielles</span></div>
        <div class="watch-grid">
          ${(window.WATCH || []).map((g) => `
            <article class="watch">
              <h3>${icon(g.icon, 18)}${g.title}</h3>
              <ul>${g.items.map((it) => `<li><a href="${it.url}" target="_blank" rel="noopener">${escapeHtml(it.name)} ${icon("external", 12)}</a><span>${escapeHtml(it.why)}</span></li>`).join("")}</ul>
            </article>`).join("")}
        </div>
      </section>`;

    document.getElementById("journal-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("j-title").value.trim();
      if (!title) return;
      const entry = {
        id: Date.now().toString(36),
        date: Streak._internals.todayKey(),
        type: journalType,
        title,
        url: document.getElementById("j-url").value.trim(),
        domain: document.getElementById("j-domain").value,
        note: document.getElementById("j-note").value.trim(),
      };
      Journal.save([...Journal.all(), entry]);
      Streak.logJournal(); // +5 XP (3 fois par jour max)
      renderStats();
      renderJournal();
    });
  }

  function renderNav() {
    document.getElementById("nav-courses").innerHTML = Object.values(window.COURSES).map((c) => `
      <button class="nav-item cs" ${cs(c)} data-action="open-course" data-course="${c.id}" data-nav="${c.id}">
        ${icon(c.badge)}<span>${c.name}</span>
      </button>`).join("");
  }

  function init() {
    renderNav();
    hydrateIcons();    // remplace les <i data-icon> du HTML statique par des SVG
    Streak.refresh();  // applique les gels / casse le streak si des jours ont été manqués
    Chat.init();
    renderStats();
    if (window.Scene3D) Scene3D.init(); // la scène WebGL derrière le verre
    if (window.Tilt) Tilt.init();       // les cartes en relief sous le pointeur
    if (window.Dial) Dial.init(goPage); // le cadran rotatif, navigation principale
    // Les nombres rayés qui roulent, partout (js/glass.js)
    if (window.Glass) ["view", "stats", "rail", "sidebar-streak"].forEach((id) => Glass.watch(document.getElementById(id)));
    renderHome();
  }

  return { init, openSettings, goPage };
})();

App.init();
