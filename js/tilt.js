/* ============================================================================
   tilt.js — Les cartes en relief
   ----------------------------------------------------------------------------
   Sous le pointeur, une carte s'incline en 3D (perspective), avance un peu
   vers l'écran et un reflet suit la souris sur le verre. Au départ du
   pointeur, elle revient doucement à plat.

   Seulement avec une souris (pas au toucher) et sans « mouvement réduit ».
   Les cartes interactives complexes (illustrations, éditeur) ne s'inclinent
   pas, pour ne pas gêner la manipulation.
   ========================================================================== */

const Tilt = (() => {
  const SELECTOR = ".course, .lesson-card:not(:disabled), .career, .cert, .proj, .proj-band, .kpi, .entry, .watch, .result-stat, .continue, .gl-card, .card, .unit";
  const MAX = 7; // inclinaison maximale (degrés)
  let active = null;

  function enabled() {
    return window.matchMedia?.("(hover: hover) and (pointer: fine)").matches
      && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }

  function reset(el) {
    el.classList.remove("tilt");
    el.style.removeProperty("--rx");
    el.style.removeProperty("--ry");
  }

  function init() {
    if (!enabled()) return;
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest?.(SELECTOR);
      if (active && active !== el) { reset(active); active = null; }
      if (!el || el.closest(".viz, .ide, .modal-box, .chat")) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;    // 0 → 1
      const py = (e.clientY - r.top) / r.height;
      // Les très grandes cartes s'inclinent moins
      const k = Math.min(1, 420 / Math.max(r.width, r.height));
      el.style.setProperty("--rx", `${((0.5 - py) * MAX * 2 * k).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((px - 0.5) * MAX * 2 * k).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      el.classList.add("tilt");
      active = el;
    }, { passive: true });
    document.addEventListener("pointerleave", () => { if (active) { reset(active); active = null; } });
  }

  return { init };
})();
window.Tilt = Tilt;
