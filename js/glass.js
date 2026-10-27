/* ============================================================================
   glass.js — Le tableau de bord « verre dépoli » de l'accueil
   ----------------------------------------------------------------------------
   Inspiré d'un design de widgets de santé en verre (fréquence cardiaque,
   respiration, lumière, bruit), transposé à ta progression :

     ┌──────────────┬──────────────┐
     │  SÉRIE       │ AUJOURD'HUI  │   Série : tracé façon ECG des 14 derniers jours
     │  (2 rangées) ├──────────────┤   Aujourd'hui : anneau d'objectif qui « respire »
     │              │  XP TOTAL    │   XP total : règle graduée jusqu'au prochain niveau
     ├──────────────┴──────────────┤
     │  CETTE SEMAINE (onde)       │   Semaine : forme d'onde par jour + tête de lecture
     └─────────────────────────────┘

   Règles reprises du design d'origine :
     - une seule horloge requestAnimationFrame pour tout ce qui bouge ;
     - gros chiffres à chasse fixe, rayés, qui roulent comme un compteur
       kilométrique quand la valeur change (depuis la dernière visite) ;
     - aucune bibliothèque d'animation ; mouvement réduit respecté.
   ========================================================================== */

const Glass = (() => {
  /* ---------------- Constantes de mouvement ---------------- */
  const ROLL = 0.6;          // durée d'un roulement de chiffre (s)
  const ROLL_STAGGER = 0.07; // décalage entre colonnes (s)
  const BREATH = 4.2;        // un cycle de respiration de l'anneau (s)
  const SWEEP = 5;           // passage de la tête de lecture (s)
  const SCAN = 3.2;          // balayage du tracé de série (s)
  const INTRO = 0.7;         // apparition des cartes (s)

  const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Courbes d'accélération ---------------- */
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const quartOut = (x) => 1 - (1 - clamp01(x)) ** 4;
  const quartInOut = (x) => { const t = clamp01(x); return t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2; };

  /* ---------------- Horloge partagée ---------------- */
  const subs = new Set();
  let raf = 0;
  function tick(now) {
    const t = now / 1000;
    subs.forEach((fn) => fn(t));
    raf = subs.size ? requestAnimationFrame(tick) : 0;
  }
  function subscribe(fn) {
    subs.add(fn);
    if (!raf) raf = requestAnimationFrame(tick);
    return () => subs.delete(fn);
  }

  /** Dimensionne un canvas à sa boîte, à la densité de pixels de l'écran. */
  function fit(canvas) {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: r.width, h: r.height };
  }

  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* ---------------- Chiffres qui roulent (odomètre) ---------------- */
  /**
   * Crée un nombre roulant.
   * @returns {{el: HTMLElement, set: (value:number, from?:number) => void}}
   */
  function ticker({ digits, unit, label, cls }) {
    const el = document.createElement("p");
    el.className = `gl-num ${cls}`;
    el.innerHTML = `<span class="sr-only"></span>${Array.from({ length: digits }, () =>
      `<span class="gl-digit" aria-hidden="true"><span class="gl-sizer">0</span><span class="gl-glyph a">0</span><span class="gl-glyph b">0</span></span>`).join("")}<span class="gl-unit" aria-hidden="true">${unit}</span>`;
    const cols = [...el.querySelectorAll(".gl-digit")];

    function set(value, from = value) {
      const to = String(Math.max(0, Math.round(value))).padStart(digits, "0").slice(-digits);
      const fr = String(Math.max(0, Math.round(from))).padStart(digits, "0").slice(-digits);
      el.querySelector(".sr-only").textContent = `${label} : ${Math.round(value)} ${unit}`;
      cols.forEach((col, i) => {
        const [a, b] = col.querySelectorAll(".gl-glyph");
        if (fr[i] === to[i] || reduced()) {
          a.textContent = to[i]; b.textContent = to[i];
          a.style.transform = "translateY(0)"; b.style.transform = "translateY(100%)";
          return;
        }
        // Le chiffre actuel monte et sort, le nouveau arrive par le bas
        a.textContent = fr[i]; b.textContent = to[i];
        let start = null;
        const delay = i * ROLL_STAGGER;
        const off = subscribe((t) => {
          if (start === null) start = t + delay;
          const p = quartOut((t - start) / ROLL);
          a.style.transform = `translateY(${-p * 100}%)`;
          b.style.transform = `translateY(${(1 - p) * 100}%)`;
          if (p >= 1) { a.textContent = to[i]; a.style.transform = "translateY(0)"; b.style.transform = "translateY(100%)"; off(); }
        });
      });
    }
    return { el, set };
  }

  /* ---------------- Gabarit d'une carte ---------------- */
  function card(cls, label, right = "", footL = "", footR = "") {
    const s = document.createElement("section");
    s.className = `gl-card ${cls}`;
    s.dataset.card = "";
    s.setAttribute("aria-label", label);
    s.innerHTML = `
      <header class="gl-head"><h2 class="gl-label">${label}</h2>${right}</header>
      <footer class="gl-foot"><p class="gl-small">${footL}</p>${footR ? `<p class="gl-small">${footR}</p>` : ""}</footer>`;
    return s;
  }

  /* ---------------- Montage ---------------- */
  /**
   * @param {HTMLElement} root  conteneur (.glass-band)
   * @param {object} d  données : streak, longest, freezes, practiced, todayXp, goal,
   *                    totalXp, days14 [xp], week [{label, xp}]
   */
  function mount(root, d) {
    // Valeurs affichées à la dernière visite : on roule depuis elles
    let last = {};
    try { last = JSON.parse(sessionStorage.getItem("codestreak:glass") || "{}"); } catch (e) { /* stockage indisponible */ }
    const fromOr = (k, v) => (typeof last[k] === "number" ? last[k] : 0);

    root.innerHTML = `
      <div class="gl-backdrop" aria-hidden="true"><i class="b1"></i><i class="b2"></i><i class="b3"></i><svg class="gl-mark" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></div>
      <h2 class="sr-only">Ta progression</h2>
      <div class="gl-cluster"></div>`;
    const cluster = root.querySelector(".gl-cluster");
    const cleanups = [];

    /* ---- 1. Série (comme « Heart Rate ») ---- */
    const live = `<span class="gl-live${d.practiced ? " on" : ""}"><i></i><span>${d.practiced ? "Allumée" : "À allumer"}</span></span>`;
    const cStreak = card("gl-streak", "Série", live, `Record ${d.longest}`, `${d.freezes} gel${d.freezes > 1 ? "s" : ""}`);
    const tStreak = ticker({ digits: 2, unit: d.streak > 1 ? "jours" : "jour", label: "Série", cls: "gl-num--streak" });
    cStreak.append(tStreak.el);
    const ecg = document.createElement("canvas");
    ecg.className = "gl-ecg"; ecg.setAttribute("aria-hidden", "true");
    cStreak.append(ecg);

    /* ---- 2. Aujourd'hui (comme « Respiration ») ---- */
    const pct = Math.min(1, d.todayXp / d.goal);
    const cToday = card("gl-today", "Aujourd'hui", "", pct >= 1 ? "Objectif atteint" : `Objectif ${d.goal} XP`);
    const tToday = ticker({ digits: 2, unit: "XP", label: "XP aujourd'hui", cls: "gl-num--today" });
    cToday.append(tToday.el);
    const ring = document.createElement("div");
    ring.className = "gl-ring"; ring.setAttribute("aria-hidden", "true");
    ring.innerHTML = `<svg viewBox="0 0 56 56"><circle class="track" cx="28" cy="28" r="27"/><path class="arc" d="M 28 1 A 27 27 0 1 1 28 55 A 27 27 0 1 1 28 1" pathLength="100" stroke-dasharray="0 100"/></svg><span class="gl-ring-txt">${Math.round(pct * 100)}%</span>`;
    cToday.append(ring);

    /* ---- 3. XP total (comme « Light ») ---- */
    const LEVEL = 500;
    const level = Math.floor(d.totalXp / LEVEL) + 1;
    const at = (d.totalXp % LEVEL) / LEVEL;
    const cXp = card("gl-xp", "XP total", "", `Niveau ${level}`, `${level * LEVEL}`);
    const tXp = ticker({ digits: 4, unit: "XP", label: "XP total", cls: "gl-num--xp" });
    cXp.append(tXp.el);
    const scale = document.createElement("div");
    scale.className = "gl-scale"; scale.setAttribute("aria-hidden", "true");
    scale.innerHTML = Array.from({ length: 9 }, (_, i) => `<i class="${i % 4 === 0 ? "major" : ""}" style="left:${(i / 8) * 100}%"></i>`).join("") + `<b class="gl-marker"></b>`;
    cXp.append(scale);

    /* ---- 4. Cette semaine (comme « Ambient Noise ») ---- */
    const weekXp = d.week.reduce((a, x) => a + x.xp, 0);
    const active = d.week.filter((x) => x.xp > 0).length;
    const cWeek = card("gl-week", "Cette semaine", "", `${active} jour${active > 1 ? "s" : ""} actif${active > 1 ? "s" : ""} sur 7`);
    const tWeek = ticker({ digits: 3, unit: "XP", label: "XP cette semaine", cls: "gl-num--week" });
    cWeek.append(tWeek.el);
    const wave = document.createElement("canvas");
    wave.className = "gl-wave"; wave.setAttribute("aria-hidden", "true");
    cWeek.append(wave);

    [cStreak, cToday, cXp, cWeek].forEach((c) => cluster.append(c));

    /* ---- Valeurs : roulement depuis la dernière visite ---- */
    const values = { streak: d.streak, today: d.todayXp, xp: d.totalXp, week: weekXp };
    tStreak.set(values.streak, fromOr("streak"));
    tToday.set(values.today, fromOr("today"));
    tXp.set(values.xp, fromOr("xp"));
    tWeek.set(values.week, fromOr("week"));
    try { sessionStorage.setItem("codestreak:glass", JSON.stringify(values)); } catch (e) { /* stockage indisponible */ }

    /* ---- Une seule boucle pour tout ce qui bouge ---- */
    const accent = css("--gl-accent") || "#FFC891";
    const t0 = performance.now() / 1000;
    const still = reduced();
    const cards = [cStreak, cToday, cXp, cWeek];
    const arc = ring.querySelector(".arc");
    const marker = scale.querySelector(".gl-marker");
    const max14 = Math.max(10, ...d.days14);
    const maxW = Math.max(10, ...d.week.map((x) => x.xp));

    const off = subscribe((t) => {
      if (!root.isConnected) { off(); return; }
      const e = Math.max(0, t - t0); // l'horodatage rAF peut précéder le montage

      // Apparition des cartes, en cascade
      cards.forEach((c, i) => {
        const p = still ? 1 : quartOut((e - i * 0.08) / INTRO);
        c.style.setProperty("--in", p.toFixed(3));
      });

      // Anneau : se remplit, puis « respire » tant que l'objectif n'est pas atteint
      const fill = still ? pct : pct * quartOut((e - 0.2) / 1.2);
      arc.setAttribute("stroke-dasharray", `${(fill * 100).toFixed(2)} 100`);
      const breath = still || pct >= 1 ? 0 : quartInOut((Math.sin((e / BREATH) * 2 * Math.PI) + 1) / 2);
      ring.style.transform = `scale(${(0.96 + breath * 0.08).toFixed(3)})`;

      // Curseur de niveau
      const m = still ? at : at * quartOut((e - 0.3) / 1.4);
      marker.style.left = `${(m * 100).toFixed(2)}%`;

      // Tracé façon ECG des 14 derniers jours, avec balayage lumineux
      {
        const { ctx, w, h } = fit(ecg);
        ctx.clearRect(0, 0, w, h);
        const pad = 10, base = h * 0.66, span = w - pad * 2;
        const pts = [];
        d.days14.forEach((xp, i) => {
          const x0 = pad + (i / 14) * span, step = span / 14;
          const amp = (xp / max14) * (h * 0.55);
          pts.push([x0, base], [x0 + step * 0.35, base]);
          if (xp > 0) pts.push([x0 + step * 0.45, base + amp * 0.18], [x0 + step * 0.55, base - amp], [x0 + step * 0.65, base + amp * 0.3]);
          pts.push([x0 + step, base]);
        });
        const scan = still ? 1 : clamp01((e % SCAN) / SCAN);
        const grad = ctx.createLinearGradient(pad, 0, w - pad, 0);
        grad.addColorStop(0, "rgba(255,255,255,0.25)");
        grad.addColorStop(clamp01(scan - 0.15), "rgba(255,255,255,0.55)");
        grad.addColorStop(scan, "rgba(255,255,255,1)");
        grad.addColorStop(clamp01(scan + 0.001), "rgba(255,255,255,0.45)");
        grad.addColorStop(1, "rgba(255,255,255,0.45)");
        ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.strokeStyle = grad;
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
        // Point de tête : aujourd'hui, qui pulse
        const pulse = still ? 0.6 : (Math.sin(e * 3.2) + 1) / 2;
        const hx = w - pad, hy = base;
        ctx.fillStyle = accent; ctx.globalAlpha = 0.25 + pulse * 0.3;
        ctx.beginPath(); ctx.arc(hx, hy, 6 + pulse * 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2); ctx.fill();
      }

      // Forme d'onde de la semaine, avec tête de lecture
      {
        const { ctx, w, h } = fit(wave);
        ctx.clearRect(0, 0, w, h);
        const n = 42, mid = h / 2, gap = w / n;
        const head = still ? w : ((e % SWEEP) / SWEEP) * w;
        for (let i = 0; i < n; i++) {
          const day = d.week[Math.min(6, Math.floor((i / n) * 7))];
          const jitter = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + 0.6));
          const amp = Math.max(2, (day.xp / maxW) * (h / 2 - 4) * jitter);
          const x = i * gap + gap / 2;
          ctx.fillStyle = x <= head ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)";
          ctx.beginPath(); ctx.roundRect(x - 1.5, mid - amp, 3, amp * 2, 1.5); ctx.fill();
        }
        ctx.fillStyle = accent; ctx.fillRect(head - 1, 2, 2, h - 4);
      }
    });
    cleanups.push(off);
    return () => cleanups.forEach((f) => f());
  }

  return { mount };
})();
window.Glass = Glass;
