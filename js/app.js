/* ============================================================================
   app.js — Le cœur de l'interface
   ----------------------------------------------------------------------------
   Ce fichier gère les ÉCRANS et la NAVIGATION :

     Accueil  ──►  Parcours d'un cours  ──►  Leçon (théorie ► exercices)  ──►  Résultat

   Principe : chaque écran est une fonction render...() qui remplit
   <main id="view"> avec du HTML. Les clics sont gérés par UN SEUL écouteur
   (délégation d'événements) qui lit l'attribut data-action des boutons.

   Dépend de : Storage, COURSES, Streak, Runner, Chat (chargés avant).
   ========================================================================== */

const App = (() => {
  const view = document.getElementById("view");

  /**
   * Session de leçon en cours (null en dehors d'une leçon).
   * {
   *   course, lesson, lessonIndex,
   *   phase: "theory" | "exercise" | "result",
   *   queue:    indices des exercices restants (un exercice raté est remis à la fin, comme Duolingo)
   *   correct:  nombre d'exercices réussis
   *   mistakes: nombre d'erreurs
   *   checked:  true quand la réponse a été vérifiée (on attend "Continuer")
   *   answer:   réponse en cours (index choisi, texte saisi, ou lignes ordonnées)
   *   bank:     lignes mélangées pour l'exercice "order"
   * }
   */
  let session = null;

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

  /** Pourcentage de leçons terminées dans un cours. */
  function courseProgress(course) {
    const done = course.lessons.filter((l) => Streak.isCompleted(l.id)).length;
    return { done, total: course.lessons.length, pct: Math.round((done / course.lessons.length) * 100) };
  }

  /* ======================================================================
     BARRE DU HAUT : streak, XP, gels
     ====================================================================== */
  function renderStats() {
    const s = Streak.state;
    const off = Streak.practicedToday() ? "" : " off"; // flamme grise tant qu'on n'a pas pratiqué aujourd'hui
    document.getElementById("stats").innerHTML = `
      <span class="stat flame${off}" title="Streak : jours consécutifs">🔥 ${s.streak}</span>
      <span class="stat xp" title="XP total">⚡ ${s.totalXp}</span>
      <span class="stat ice" title="Gels de streak disponibles">❄️ ${s.freezes}</span>`;
  }

  /* ======================================================================
     ÉCRAN 1 : ACCUEIL
     ====================================================================== */
  function renderHome() {
    session = null;
    Chat.setContext(null, null);
    const s = Streak.state;
    const todayXp = Streak.todayXp();
    const goalPct = Math.min(100, Math.round((todayXp / s.dailyGoal) * 100));

    // Petite frise des 7 derniers jours
    const week = Streak.lastSevenDays().map((d) => `
      <div class="day${d.done ? " done" : ""}${d.frozen ? " frozen" : ""}${d.today ? " today" : ""}">
        <span class="dot">${d.done ? "🔥" : d.frozen ? "❄️" : ""}</span>${d.label}
      </div>`).join("");

    const courses = Object.values(window.COURSES).map((c) => {
      const p = courseProgress(c);
      return `
        <button class="course-card ${c.id}" data-action="open-course" data-course="${c.id}">
          <span class="badge">${c.badge}</span>
          <h3>${c.name}</h3>
          <span>${c.tagline}</span>
          <div class="progress"><span style="width:${p.pct}%"></span></div>
          <small>${p.done} / ${p.total} leçons</small>
        </button>`;
    }).join("");

    const message = Streak.practicedToday()
      ? "Bravo, ta flamme est allumée pour aujourd'hui !"
      : s.streak > 0
        ? "Fais une leçon aujourd'hui pour garder ton streak !"
        : "Termine une leçon pour lancer ton streak.";

    view.innerHTML = `
      <div class="hero">
        <section>
          <h1>Apprends à coder, un jour à la fois.</h1>
          <p>Des leçons courtes inspirées de W3Schools, des exercices façon Duolingo et un tuteur IA
          pour répondre à tes questions. Choisis ton cours :</p>
          <div class="course-grid">${courses}</div>
        </section>

        <aside class="card">
          <div style="display:flex;align-items:center;gap:12px">
            <span class="big-flame">${Streak.practicedToday() ? "🔥" : "🕯️"}</span>
            <div>
              <div class="streak-number">${s.streak} jour${s.streak > 1 ? "s" : ""}</div>
              <small>Record : ${s.longest} · Gels : ${s.freezes} ❄️</small>
            </div>
          </div>
          <p style="margin-top:10px">${message}</p>
          <div class="week">${week}</div>
          <hr style="border:0;border-top:2px solid var(--border);margin:18px 0">
          <strong>Objectif du jour</strong>
          <div class="progress" style="margin:8px 0"><span style="width:${goalPct}%"></span></div>
          <small>${todayXp} / ${s.dailyGoal} XP</small>
        </aside>
      </div>`;
  }

  /* ======================================================================
     ÉCRAN 2 : PARCOURS D'UN COURS (chemin de leçons)
     ====================================================================== */
  function renderCourse(courseId) {
    session = null;
    const course = window.COURSES[courseId];
    Chat.setContext(course.name, null);
    const p = courseProgress(course);

    // La "leçon courante" = la première non terminée
    const currentIndex = course.lessons.findIndex((l) => !Streak.isCompleted(l.id));

    const nodes = course.lessons.map((lesson, i) => {
      const done = Streak.isCompleted(lesson.id);
      // Une leçon est débloquée si c'est la 1re, ou si la précédente est terminée
      const unlocked = i === 0 || Streak.isCompleted(course.lessons[i - 1].id);
      const cls = done ? "done" : unlocked ? "" : "locked";
      const current = i === currentIndex ? " current" : "";
      // Décalage horizontal en vague pour l'effet "chemin" de Duolingo
      const offset = Math.round(Math.sin(i * 0.9) * 70);
      return `
        <div class="node ${cls}${current}" style="transform:translateX(${offset}px)">
          <button class="node-btn" ${unlocked ? "" : "disabled"}
            data-action="start-lesson" data-course="${course.id}" data-index="${i}"
            title="${escapeHtml(lesson.title)}">${unlocked ? (done ? "⭐" : lesson.icon) : "🔒"}</button>
          <span class="node-label">${i + 1}. ${escapeHtml(lesson.title)}</span>
        </div>`;
    }).join("");

    view.innerHTML = `
      <div class="unit-header ${course.id}">
        <div>
          <h2 style="margin:0">${course.badge} ${course.name}</h2>
          <p>${p.done} / ${p.total} leçons terminées</p>
        </div>
        <button class="btn btn-ghost" data-action="home">← Retour</button>
      </div>
      <div class="path">${nodes}</div>`;
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
      correct: 0, mistakes: 0, checked: false, answer: null, bank: [],
    };
    Chat.setContext(course.name, lesson.title);
    if (course.runnable) Runner.preload(); // on commence à charger Python en arrière-plan
    renderTheory();
  }

  function renderTheory() {
    const { course, lesson } = session;

    // Boutons d'action selon le langage
    const actions = course.runnable
      ? `<button class="btn" data-action="run">▶ Exécuter</button>`
      : `<button class="btn" data-action="simulate">▶ Simuler avec l'IA</button>`;

    view.innerHTML = `
      ${lessonTopBar(0)}
      <article class="theory">
        ${lesson.theory}

        <div class="tryit">
          <div class="tryit-head">
            <span>Essaie-le toi-même ✍️</span>
            <div class="actions">
              ${actions}
              <button class="btn btn-ghost" data-action="explain">🤖 Expliquer</button>
              <button class="btn btn-ghost" data-action="reset-code">↺</button>
            </div>
          </div>
          <!-- Le code est éditable : on garde la coloration en lecture,
               et on bascule sur une zone de texte dès qu'on clique dessus -->
          <pre class="language-${course.language}" id="code-view" title="Clique pour modifier"><code>${highlight(lesson.example, course.language)}</code></pre>
          <textarea id="code-edit" spellcheck="false" hidden>${escapeHtml(lesson.example)}</textarea>
          <pre class="output" id="output" hidden></pre>
        </div>
      </article>

      <div class="check-bar">
        <div class="check-inner">
          <span>${lesson.exercises.length} exercices t'attendent</span>
          <button class="btn" data-action="begin-exercises">Commencer les exercices</button>
        </div>
      </div>`;

    // Clic sur le code coloré -> mode édition
    document.getElementById("code-view").addEventListener("click", switchToEditor);
  }

  function switchToEditor() {
    const pre = document.getElementById("code-view");
    const ta = document.getElementById("code-edit");
    if (!pre || pre.hidden) return;
    pre.hidden = true;
    ta.hidden = false;
    ta.style.height = Math.max(180, ta.scrollHeight) + "px";
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

  async function runCode() {
    const out = document.getElementById("output");
    out.hidden = false;
    out.classList.remove("error");
    out.textContent = "⏳ Chargement de Python (la 1re fois prend quelques secondes)…";
    try {
      const { output, error } = await Runner.runPython(currentCode());
      out.textContent = error ? `${output}${error}` : output;
      out.classList.toggle("error", Boolean(error));
    } catch (e) {
      out.classList.add("error");
      out.textContent = "Impossible de charger Python : vérifie ta connexion internet.";
    }
  }

  /** Barre du haut d'une leçon : bouton quitter + barre de progression. */
  function lessonTopBar(pct) {
    return `
      <div class="lesson-top">
        <button class="close-x" data-action="quit-lesson" title="Quitter la leçon">✕</button>
        <div class="progress"><span style="width:${pct}%"></span></div>
      </div>`;
  }

  /* ======================================================================
     ÉCRAN 3b : LEÇON — exercices
     ====================================================================== */
  function renderExercise() {
    const { lesson, course } = session;
    const ex = lesson.exercises[session.queue[0]];
    const pct = Math.round((session.correct / lesson.exercises.length) * 100);
    session.checked = false;

    let body = "";
    const codeBlock = ex.code && ex.type !== "fill"
      ? `<pre class="ex-code">${highlight(ex.code, course.language)}</pre>` : "";

    if (ex.type === "mcq") {
      // ---- Choix multiple ----
      session.answer = null;
      body = `${codeBlock}<div class="choices">${ex.choices.map((c, i) => `
          <button class="choice" data-action="choose" data-index="${i}">
            <b style="color:var(--muted)">${i + 1}</b>&nbsp; ${escapeHtml(c)}
          </button>`).join("")}</div>`;
    } else if (ex.type === "fill") {
      // ---- Texte à trou : le "___" devient un champ de saisie ----
      session.answer = "";
      const [before, after] = ex.code.split("___");
      body = `<pre class="ex-code">${escapeHtml(before)}<input id="fill" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Réponse">${escapeHtml(after ?? "")}</pre>`;
    } else if (ex.type === "order") {
      // ---- Remettre les lignes dans l'ordre ----
      session.answer = [];
      // On mélange jusqu'à obtenir un ordre différent de la solution
      let bank = shuffle(ex.lines);
      for (let t = 0; t < 5 && bank.join() === ex.lines.join(); t++) bank = shuffle(ex.lines);
      session.bank = bank.map((text, id) => ({ id, text, used: false }));
      body = `<div class="answer-zone" id="answer-zone"></div><div class="bank" id="bank"></div>`;
    }

    view.innerHTML = `
      ${lessonTopBar(pct)}
      <section class="exercise">
        <h2>${escapeHtml(ex.q)}</h2>
        ${body}
      </section>
      <div class="check-bar" id="check-bar">
        <div class="check-inner">
          <div class="feedback" id="feedback"></div>
          <div>
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
    const zone = document.getElementById("answer-zone");
    const bank = document.getElementById("bank");
    zone.innerHTML = session.answer.map((id) =>
      `<button class="chip" data-action="unpick" data-id="${id}">${escapeHtml(session.bank[id].text)}</button>`).join("");
    bank.innerHTML = session.bank.map((b) =>
      `<button class="chip${b.used ? " used" : ""}" data-action="pick" data-id="${b.id}">${escapeHtml(b.text)}</button>`).join("");
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

  /** Vérifie la réponse et affiche le bandeau vert/rouge. */
  function checkAnswer() {
    const { lesson, course } = session;
    const ex = lesson.exercises[session.queue[0]];
    let ok = false;
    let solution = "";

    if (ex.type === "mcq") {
      ok = session.answer === ex.answer;
      solution = ex.choices[ex.answer];
    } else if (ex.type === "fill") {
      ok = ex.answers.some((a) => normalize(a, course.language) === normalize(session.answer, course.language));
      solution = ex.answers[0];
      document.getElementById("fill").disabled = true;
    } else if (ex.type === "order") {
      ok = session.answer.map((id) => session.bank[id].text).join("\n") === ex.lines.join("\n");
      solution = ex.lines.join("  ⏎  ");
    }

    session.checked = true;
    session.lastOk = ok;
    session.lastSolution = solution;

    const done = session.queue.shift(); // on retire l'exercice de la file...
    if (ok) {
      session.correct++;
    } else {
      session.mistakes++;
      session.queue.push(done); // ...et on le remet à la fin s'il est raté (comme Duolingo)
    }

    const bar = document.getElementById("check-bar");
    bar.classList.add(ok ? "ok" : "ko");
    document.getElementById("feedback").innerHTML = ok
      ? `<strong>✅ Excellent !</strong><p>${escapeHtml(ex.explain || "")}</p>`
      : `<strong>❌ Bonne réponse :</strong><p><code>${escapeHtml(solution)}</code><br>${escapeHtml(ex.explain || "")}</p>`;

    const btn = document.getElementById("check-btn");
    btn.textContent = "Continuer";
    btn.disabled = false;
    btn.dataset.action = "next";
    btn.className = ok ? "btn" : "btn btn-red";
    // En cas d'erreur, on propose d'en parler au tuteur
    if (!ok) btn.insertAdjacentHTML("beforebegin",
      `<button class="btn btn-ghost btn-ask" data-action="ask-why">🤖 Pourquoi ?</button>`);

    // Mise à jour de la barre de progression
    const pct = Math.round((session.correct / lesson.exercises.length) * 100);
    view.querySelector(".lesson-top .progress span").style.width = pct + "%";
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

    const extras = [
      r.streakExtended ? `<p>🔥 Ton streak passe à <b>${s.streak} jour${s.streak > 1 ? "s" : ""}</b> !</p>` : "",
      r.goalReached ? `<p>🎯 Objectif quotidien atteint !</p>` : "",
      r.freezeEarned ? `<p>❄️ Tu as gagné un gel de streak (7 jours d'affilée) !</p>` : "",
    ].join("");

    view.innerHTML = `
      <section class="result">
        <div class="big">${r.streakExtended ? "🔥" : perfect ? "🏆" : "🎉"}</div>
        <h1>Leçon terminée !</h1>
        <p>${escapeHtml(session.lesson.title)} — ${session.course.name}</p>
        <div class="result-stats">
          <div class="result-box">XP gagnés<b style="color:var(--yellow)">+${r.xp}</b></div>
          <div class="result-box">Précision<b style="color:var(--green)">${accuracy}%</b></div>
          <div class="result-box">Streak<b style="color:var(--orange)">${s.streak}</b></div>
        </div>
        ${extras}
      </section>
      <div class="check-bar">
        <div class="check-inner">
          <button class="btn btn-ghost" data-action="open-course" data-course="${session.course.id}">Retour au parcours</button>
          ${next ? `<button class="btn" data-action="start-lesson" data-course="${session.course.id}" data-index="${session.lessonIndex + 1}">Leçon suivante →</button>` : ""}
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
      ["claude-haiku-5-5", "Claude Haiku 5.5 — rapide et économique"],
      ["claude-sonnet-5-5", "Claude Sonnet 5.5 — équilibré"],
      ["claude-opus-5-5", "Claude Opus 5.5 — le plus puissant"],
    ];
    const modal = document.getElementById("modal");
    modal.innerHTML = `
      <div class="modal-box" role="dialog" aria-label="Réglages">
        <h2>⚙️ Réglages</h2>
        <div class="field">
          <label for="set-key">Clé API Anthropic (pour le tuteur IA)</label>
          <input id="set-key" type="password" placeholder="sk-ant-..." value="${escapeHtml(ai.apiKey || "")}" autocomplete="off">
          <small>Crée-la sur console.anthropic.com. Elle reste uniquement dans ton navigateur.</small>
        </div>
        <div class="field">
          <label for="set-model">Modèle</label>
          <select id="set-model">${models.map(([v, l]) =>
            `<option value="${v}" ${v === (ai.model || Chat.DEFAULT_MODEL) ? "selected" : ""}>${l}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label for="set-goal">Objectif quotidien</label>
          <select id="set-goal">${[[10, "Détente"], [20, "Normal"], [30, "Sérieux"], [50, "Intense"]].map(([v, l]) =>
            `<option value="${v}" ${v === goal ? "selected" : ""}>${l} — ${v} XP / jour</option>`).join("")}</select>
        </div>
        <div class="row">
          <button class="btn btn-red" data-action="reset-progress">Réinitialiser</button>
          <button class="btn btn-ghost" data-action="close-modal">Annuler</button>
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
    Streak.setDailyGoal(Number(document.getElementById("set-goal").value));
    closeModal();
    if (!session) renderHome();
  }

  /* ======================================================================
     GESTION DES CLICS (délégation : un seul écouteur pour toute la page)
     ====================================================================== */
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) {
      // Clic sur le fond sombre de la modale = fermer
      if (e.target.id === "modal") closeModal();
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
        view.querySelectorAll(".choice").forEach((c) => c.classList.toggle("selected", c === el));
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
        const ex = session.lesson.exercises[session.queue[session.queue.length - 1]];
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
      case "reset-progress":
        if (el.dataset.confirm === "1") {
          Streak.reset();
          closeModal();
          renderStats();
          renderHome();
        } else {
          // Double clic de confirmation plutôt qu'une boîte confirm() bloquante
          el.dataset.confirm = "1";
          el.textContent = "Confirmer ?";
        }
        break;
    }
  });

  /* Clavier : Entrée = Vérifier / Continuer ; touches 1-4 = choisir une réponse */
  document.addEventListener("keydown", (e) => {
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
  function init() {
    Streak.refresh();  // applique les gels / casse le streak si des jours ont été manqués
    Chat.init();
    renderStats();
    renderHome();
  }

  return { init, openSettings };
})();

App.init();
