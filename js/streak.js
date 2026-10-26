/* ============================================================================
   streak.js — Progression, XP et streak (série de jours), façon Duolingo
   ----------------------------------------------------------------------------
   RÈGLES DU STREAK
   - Terminer au moins une leçon dans la journée "allume la flamme" du jour.
   - Si tu pratiques le lendemain, le streak augmente de 1.
   - Si tu rates un jour, le streak retombe à 0... sauf si tu as un GEL ❄️ :
     un gel protège automatiquement un jour manqué.
   - Tu gagnes 1 gel tous les 7 jours de streak (maximum 2 en réserve).

   XP
   - Leçon terminée pour la 1re fois : +10 XP (+5 si aucune erreur).
   - Leçon refaite pour réviser : +5 XP.
   - Objectif quotidien réglable (10 / 20 / 30 / 50 XP).

   Les dates sont gérées en HEURE LOCALE (format "AAAA-MM-JJ") pour que le
   jour change à minuit chez l'utilisateur, et non à minuit UTC.
   ========================================================================== */

const Streak = (() => {
  /** État par défaut, utilisé à la première visite. */
  const DEFAULT_STATE = {
    streak: 0,          // nombre de jours consécutifs
    longest: 0,         // record personnel
    lastActive: null,   // dernier jour où une leçon a été terminée ("AAAA-MM-JJ")
    freezes: 0,         // gels de streak disponibles
    frozenDays: [],     // jours "sauvés" par un gel (affichés en bleu)
    totalXp: 0,
    xpByDay: {},        // { "2026-10-26": 25, ... }
    dailyGoal: 20,
    completed: {},      // { "py-intro": { perfect: true, times: 2 }, ... }
  };

  const MAX_FREEZES = 2;

  // On fusionne avec DEFAULT_STATE pour que les anciennes sauvegardes
  // reçoivent les nouveaux champs si on en ajoute plus tard.
  let state = { ...DEFAULT_STATE, ...Storage.get("progress", {}) };

  /* ---------------- Outils de date ---------------- */

  /** Date locale -> "AAAA-MM-JJ" */
  function toKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function todayKey() {
    return toKey(new Date());
  }

  /** "AAAA-MM-JJ" -> Date à midi (midi évite les soucis de changement d'heure) */
  function fromKey(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d, 12);
  }

  /** Nombre de jours entre deux clés (b - a). */
  function daysBetween(a, b) {
    return Math.round((fromKey(b) - fromKey(a)) / 86400000);
  }

  function addDays(key, n) {
    const d = fromKey(key);
    d.setDate(d.getDate() + n);
    return toKey(d);
  }

  function save() {
    Storage.set("progress", state);
  }

  /* ---------------- Logique principale ---------------- */

  /**
   * À appeler au lancement de l'app : vérifie si des jours ont été manqués
   * depuis la dernière activité, applique les gels ou casse le streak.
   */
  function refresh() {
    if (!state.lastActive || state.streak === 0) return;

    const gap = daysBetween(state.lastActive, todayKey());
    if (gap <= 1) return; // pratiqué aujourd'hui ou hier : tout va bien

    const missed = gap - 1; // jours complets sans pratique
    if (state.freezes >= missed) {
      // Les gels couvrent les jours manqués : on les marque comme "gelés"
      for (let i = 1; i <= missed; i++) state.frozenDays.push(addDays(state.lastActive, i));
      state.freezes -= missed;
      // On fait comme si la dernière activité était hier : le streak peut continuer aujourd'hui
      state.lastActive = addDays(todayKey(), -1);
    } else {
      state.streak = 0; // streak perdu 💔
    }
    save();
  }

  /**
   * Enregistre une leçon terminée.
   * @param {string}  lessonId
   * @param {boolean} perfect   true si aucune erreur
   * @returns {{xp:number, streakExtended:boolean, goalReached:boolean, freezeEarned:boolean}}
   */
  function completeLesson(lessonId, perfect) {
    const firstTime = !state.completed[lessonId];

    // Progression de la leçon
    const prev = state.completed[lessonId] || { perfect: false, times: 0 };
    state.completed[lessonId] = { perfect: prev.perfect || perfect, times: prev.times + 1 };

    return recordActivity(firstTime ? 10 + (perfect ? 5 : 0) : 5);
  }

  /**
   * Enregistre un projet portfolio terminé : +50 XP, compte comme activité du jour.
   * @param {string} projectId
   */
  function completeProject(projectId) {
    state.projectsDone = state.projectsDone || {};
    if (state.projectsDone[projectId]) return null; // déjà récompensé
    state.projectsDone[projectId] = todayKey();
    return recordActivity(50);
  }

  /**
   * Récompense unique (ex. certification obtenue) : n'est donnée qu'une fois par clé.
   * @param {string} key  identifiant unique de la récompense
   * @param {number} xp
   */
  function award(key, xp) {
    state.awards = state.awards || {};
    if (state.awards[key]) return null;
    state.awards[key] = todayKey();
    return recordActivity(xp);
  }

  /**
   * Entrée du journal de veille : +5 XP, au plus 3 fois par jour
   * (on récompense l'habitude, pas le volume). Compte pour le streak.
   */
  function logJournal() {
    state.journalXp = state.journalXp || {};
    const today = todayKey();
    const n = state.journalXp[today] || 0;
    if (n >= 3) return null;
    state.journalXp[today] = n + 1;
    return recordActivity(5);
  }

  /**
   * Ajoute des XP au jour courant et met à jour le streak (une fois par jour).
   * @param {number} xp
   */
  function recordActivity(xp) {
    const today = todayKey();
    const xpBefore = state.xpByDay[today] || 0;
    state.xpByDay[today] = xpBefore + xp;
    state.totalXp += xp;

    // Streak : on ne l'augmente qu'une fois par jour
    let streakExtended = false;
    let freezeEarned = false;
    if (state.lastActive !== today) {
      const continues = state.lastActive && daysBetween(state.lastActive, today) === 1 && state.streak > 0;
      state.streak = continues ? state.streak + 1 : 1;
      state.lastActive = today;
      state.longest = Math.max(state.longest, state.streak);
      streakExtended = true;

      // Récompense : un gel tous les 7 jours
      if (state.streak % 7 === 0 && state.freezes < MAX_FREEZES) {
        state.freezes++;
        freezeEarned = true;
      }
    }

    // 4. Objectif quotidien atteint pile maintenant ?
    const goalReached = xpBefore < state.dailyGoal && state.xpByDay[today] >= state.dailyGoal;

    save();
    return { xp, streakExtended, goalReached, freezeEarned };
  }

  /**
   * Les 7 derniers jours (pour la petite frise de la semaine).
   * @returns {Array<{key:string, label:string, done:boolean, frozen:boolean, today:boolean}>}
   */
  function lastSevenDays() {
    const labels = ["D", "L", "M", "M", "J", "V", "S"]; // dimanche = 0
    const today = todayKey();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const key = addDays(today, -i);
      days.push({
        key,
        label: labels[fromKey(key).getDay()],
        done: (state.xpByDay[key] || 0) > 0,
        frozen: state.frozenDays.includes(key),
        today: key === today,
      });
    }
    return days;
  }

  /* ---------------- API publique ---------------- */
  return {
    refresh,
    completeLesson,
    completeProject,
    award,
    logJournal,
    lastSevenDays,
    get state() { return state; },
    todayXp: () => state.xpByDay[todayKey()] || 0,
    practicedToday: () => state.lastActive === todayKey(),
    isCompleted: (id) => Boolean(state.completed[id]),
    setDailyGoal(goal) { state.dailyGoal = goal; save(); },
    reset() { state = { ...DEFAULT_STATE, xpByDay: {}, completed: {}, frozenDays: [] }; save(); },
    // Exposé pour les tests
    _internals: { daysBetween, addDays, todayKey },
  };
})();
