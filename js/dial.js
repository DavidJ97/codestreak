/* ============================================================================
   dial.js — Le cadran rotatif (navigation principale)
   ----------------------------------------------------------------------------
   Repris du cadran de Wing Chun Revolution (RadialNav.jsx), réécrit en
   JavaScript sans framework pour CodeStreak.

   Tout part d'un point : le milieu du bord bas de l'écran. Un dôme y est posé ;
   ouvert, il devient une étoile et les pages se rangent sur une roue autour de
   ce point. La page en HAUT de la roue est la page affichée.
     - tourner la roue (flèches, glissement du doigt, ← →) change de page ;
     - toucher une icône y va directement (la roue tourne jusqu'à elle) ;
     - Échap ou un toucher sur le voile referme.
   La roue est toujours pleine : la liste est répétée pour faire huit crans,
   et elle tourne sans fin dans les deux sens.

   Les clics métalliques sont fabriqués par le navigateur (Web Audio) :
   aucun fichier son à charger.
   ========================================================================== */

const Dial = (() => {
  /** Les pages accessibles par la roue (les cours sont sur l'accueil). */
  const ITEMS = [
    { page: "home", label: "Accueil", icon: "home" },
    { page: "projects", label: "Projets", icon: "briefcase" },
    { page: "certs", label: "Certifs", icon: "trophy" },
    { page: "journal", label: "Veille", icon: "eye" },
  ];
  const HINTS_KEY = "codestreak:dial-hints";

  const count = ITEMS.length;
  const slots = count * Math.max(1, Math.round(9 / count)); // 8 crans
  const step = 360 / slots;

  let root = null;
  let open = false;
  let turn = 0;
  let pending = null;
  let swipeFrom = null;
  let swiped = false;
  let onNavigate = () => {};
  const spin = { angle: 0, direction: 1, boostAt: -1 };

  const active = () => ((turn % slots) + slots) % slots;

  /* ---------------- Sons (Web Audio) ---------------- */
  let ctx = null;
  function audio() {
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      if (!ctx) ctx = new Ctor();
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }
  /** Un souffle de bruit filtré très court : le "tic" d'un cran. */
  function tick(c, time, volume) {
    const size = Math.floor(c.sampleRate * 0.05);
    const buffer = c.createBuffer(1, size, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    const noise = c.createBufferSource();
    noise.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 5500;
    filter.Q.value = 25;
    const gain = c.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    noise.connect(filter); filter.connect(gain); gain.connect(c.destination);
    noise.start(time);
  }
  const playClick = () => { const c = audio(); if (c) tick(c, c.currentTime, 1.2); };
  const playRatchet = () => { const c = audio(); if (c) for (let i = 0; i < 6; i++) tick(c, c.currentTime + i * 0.035, 0.9); };

  /* ---------------- Rendu ---------------- */
  function build() {
    root = document.createElement("div");
    root.className = "dl";
    root.innerHTML = `
      <div class="dl-scrim" aria-hidden="true"></div>
      <nav class="dl-menu" aria-label="Navigation principale">
        <div class="dl-hints" aria-hidden="true">
          <span class="dl-arc"></span>
          ${[1, 2, 3, 4].map((n) => `<span class="dl-hint dl-hint--${n}">${icon("arrow-left", 16)}</span>`).join("")}
        </div>
        <button type="button" class="dl-step dl-step--prev" tabindex="-1" aria-label="Page précédente">${icon("arrow-left", 14)}</button>
        <button type="button" class="dl-step dl-step--next" tabindex="-1" aria-label="Page suivante">${icon("arrow-right", 14)}</button>
        <div class="dl-toggle">
          <button type="button" class="dl-star" aria-expanded="false" aria-label="Ouvrir le menu">
            <span class="dl-shape">
              <svg class="dl-rim" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="${DOME}"/></svg>
              <svg class="dl-logo" viewBox="0 0 200 200" aria-hidden="true">
                <defs>
                  <linearGradient id="dl-flame" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#ffb21a"/><stop offset="1" stop-color="#ff4d17"/>
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="95" fill="#ffffff"/>
                <!-- Les crans du cadran : c'est cette couronne qui tourne -->
                <g class="dl-logo__ring">
                  ${Array.from({ length: 12 }, (_, i) => `<rect x="96" y="12" width="8" height="26" rx="4" fill="url(#dl-flame)" transform="rotate(${i * 30} 100 100)"/>`).join("")}
                </g>
                <path transform="translate(64 60) scale(3)" fill="url(#dl-flame)" d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
            </span>
          </button>
          <span class="dl-label">Menu</span>
        </div>
        <div class="dl-wheel">
          ${Array.from({ length: slots }, (_, slot) => {
            const item = ITEMS[slot % count];
            return `
            <div class="dl-item" data-slot="${slot}" style="--dl-base:${-slot * step}deg;--dl-delay:${0.05 + slot * 0.05}s">
              <button type="button" class="dl-item__link" tabindex="-1" data-slot="${slot}">
                <span class="dl-item__icon">${icon(item.icon, 16)}</span>
                <span class="dl-label">${item.label}</span>
              </button>
            </div>`;
          }).join("")}
        </div>
      </nav>`;
    document.body.appendChild(root);
    wire();
    update();
  }

  /** Applique l'état (ouvert, rotation, page active) au DOM. */
  function update() {
    root.classList.toggle("is-open", open);
    root.style.setProperty("--dl-wheel", `${turn * step}deg`);
    const star = root.querySelector(".dl-star");
    star.setAttribute("aria-expanded", open);
    star.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    root.querySelectorAll(".dl-item").forEach((el) => {
      const here = Number(el.dataset.slot) === active();
      el.classList.toggle("is-active", here);
      const link = el.querySelector(".dl-item__link");
      link.tabIndex = open ? 0 : -1;
      if (here) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
    });
    root.querySelectorAll(".dl-step").forEach((b) => { b.tabIndex = open ? 0 : -1; });
  }

  /* ---------------- Comportement ---------------- */
  function toggle() {
    playRatchet();
    spin.direction *= -1;
    spin.boostAt = performance.now();
    open = !open;
    if (open && !hintsSeen()) showHints();
    if (!open) root.classList.remove("has-hints");
    update();
  }

  function hintsSeen() { try { return localStorage.getItem(HINTS_KEY) === "1"; } catch (e) { return false; } }
  function showHints() {
    try { localStorage.setItem(HINTS_KEY, "1"); } catch (e) { /* stockage refusé */ }
    root.classList.add("has-hints");
    setTimeout(() => root.classList.remove("has-hints"), 7800);
  }

  /**
   * Tourner la roue de `delta` crans, puis aller à la page arrivée en haut.
   * La page entre du côté d'où vient son icône.
   */
  function go(delta) {
    if (!delta) return;
    playClick();
    turn += delta;
    update();
    const item = ITEMS[active() % count];
    clearTimeout(pending);
    pending = setTimeout(() => onNavigate(item.page, delta > 0 ? -1 : 1), 200);
  }

  function select(slot) {
    if (swiped) return;
    let delta = slot - active();
    if (delta > slots / 2) delta -= slots;
    if (delta < -slots / 2) delta += slots;
    if (delta) go(delta); else playClick();
  }

  /**
   * La roue suit la page : si on change de page autrement (lien, bouton),
   * elle se recale par le plus court chemin. Pages hors roue : on ne bouge pas.
   */
  function sync(page) {
    if (!root) return;
    const target = ITEMS.findIndex((it) => it.page === page);
    root.hidden = document.body.classList.contains("focus");
    if (target < 0) return;
    const now = active();
    if (now % count === target) return;
    let best = null;
    for (let slot = target; slot < slots; slot += count) {
      let delta = slot - now;
      if (delta > slots / 2) delta -= slots;
      if (delta < -slots / 2) delta += slots;
      if (best === null || Math.abs(delta) < Math.abs(best)) best = delta;
    }
    turn += best;
    update();
  }

  function wire() {
    root.querySelector(".dl-star").addEventListener("click", toggle);
    root.querySelector(".dl-scrim").addEventListener("click", () => { if (!swiped) toggle(); });
    root.querySelector(".dl-step--prev").addEventListener("click", () => go(-1));
    root.querySelector(".dl-step--next").addEventListener("click", () => go(1));
    root.querySelectorAll(".dl-item__link").forEach((b) => b.addEventListener("click", () => select(Number(b.dataset.slot))));

    // Glisser le doigt (ou la souris) de plus de 40 px fait tourner la roue d'un cran
    const down = (e) => { swipeFrom = e.clientX; };
    const up = (e) => {
      if (swipeFrom === null) return;
      const moved = e.clientX - swipeFrom;
      swipeFrom = null;
      if (open && Math.abs(moved) > 40) {
        swiped = true; // le clic qui suit le glissement ne doit ni fermer ni choisir
        setTimeout(() => { swiped = false; }, 0);
        go(moved < 0 ? -1 : 1);
      }
    };
    [root.querySelector(".dl-scrim"), root.querySelector(".dl-menu")].forEach((el) => {
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", () => { swipeFrom = null; });
    });

    window.addEventListener("keydown", (e) => {
      if (!open) return;
      if (e.key === "Escape") { e.stopPropagation(); toggle(); }
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    });

    // La couronne du cadran tourne lentement, et s'emballe un instant à l'ouverture
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const ring = root.querySelector(".dl-logo__ring");
      let last = performance.now();
      const frame = (time) => {
        requestAnimationFrame(frame);
        const progress = spin.boostAt < 0 ? 1 : (time - spin.boostAt) / 500;
        const speed = 0.06 + (progress < 1 ? Math.sin(progress * Math.PI) * 5 : 0);
        spin.angle = (spin.angle + speed * spin.direction * Math.min(50, time - last)) % 360;
        last = time;
        ring.setAttribute("transform", `rotate(${spin.angle.toFixed(2)} 100 100)`);
      };
      requestAnimationFrame(frame);
    }
  }

  // Le dôme fermé et l'étoile ouverte : deux polygones de quarante points,
  // pour que l'un se transforme en l'autre (voir dial.css).
  const DOME = "50,50 57.8,50.6 65.4,52.4 72.7,55.4 79.4,59.5 85.3,64.6 90.4,70.6 94.5,77.3 97.5,84.5 99.3,92.2 100,100 95,100 90,100 85,100 80,100 75,100 70,100 65,100 60,100 55,100 50,100 45,100 40,100 35,100 30,100 25,100 20,100 15,100 10,100 5,100 0,100 0.6,92.2 2.4,84.5 5.4,77.3 9.5,70.6 14.6,64.6 20.6,59.5 27.3,55.4 34.5,52.4 42.2,50.6";

  return {
    /** @param {(page:string, direction:number) => void} navigate */
    init(navigate) { onNavigate = navigate; build(); },
    sync,
    close() { if (open) toggle(); },
  };
})();

// Exposé sur window : app.js vérifie sa présence avec window.Dial
window.Dial = Dial;
