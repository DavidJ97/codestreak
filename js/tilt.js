/* ============================================================================
   tilt.js — Chaque carte est un objet en 3D
   ----------------------------------------------------------------------------
   Toutes les cartes de l'app sont des plaques de verre épaisses, posées dans
   l'espace :
     - Au repos, chaque carte est inclinée selon sa place dans l'écran (en
       bas, on voit sa tranche ; en haut, elle se redresse). En défilant, les
       cartes pivotent doucement : comme regarder des plaques sur une table.
       Ça marche partout, y compris au toucher.
     - Sous la souris, la carte s'incline vers le pointeur, avance vers
       l'écran, sa tranche bascule du bon côté, un reflet suit le pointeur et
       son contenu se décale (parallaxe : l'icône bouge plus que le texte).

   Les variables CSS posées ici sont lues par depth.css :
     --sx  inclinaison due à la position dans l'écran (deg)
     --rx, --ry  inclinaison due au pointeur (deg)
     --ex, --ey  décalage de la tranche (px par couche)
     --px, --py  parallaxe du contenu (-1 → 1)
     --gx, --gy  position du reflet (%)

   Mouvement réduit : les cartes restent à plat, sans animation.
   ========================================================================== */

const Tilt = (() => {
  const SELECTOR = ".course, .lesson-card, .career, .cert, .proj, .proj-band, .kpi, .entry, .watch, .result-stat, .continue, .gl-card, .card, .unit, .mini-stat";
  const MAX = 9;   // inclinaison maximale sous le pointeur (degrés)
  const POSE = 7;  // inclinaison maximale due à la position dans l'écran
  let active = null, queued = false;

  const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const finePointer = () => window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
  const skip = (el) => el.closest(".viz, .ide, .modal-box, .chat");

  /** Les très grandes cartes bougent moins (sinon elles « tanguent »). */
  const weight = (r) => Math.min(1, 420 / Math.max(r.width, r.height));

  /** Pose de repos : selon la hauteur de la carte dans l'écran. */
  function pose() {
    queued = false;
    const vh = window.innerHeight;
    document.querySelectorAll(SELECTOR).forEach((el) => {
      if (skip(el)) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;     // hors écran : on ne touche pas
      const n = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - vh / 2) / (vh / 2)));
      el.style.setProperty("--sx", `${(n * POSE * weight(r)).toFixed(2)}deg`);
      el.classList.add("is-3d");
    });
  }
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(pose); } };

  function reset(el) {
    el.classList.remove("tilt");
    ["--rx", "--ry", "--ex", "--px", "--py"].forEach((p) => el.style.removeProperty(p));
  }

  function onMove(e) {
    const el = e.target.closest?.(SELECTOR);
    if (active && active !== el) { reset(active); active = null; }
    if (!el || skip(el)) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 → 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    const k = weight(r);
    el.style.setProperty("--rx", `${(-py * MAX * 2 * k).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * MAX * 2 * k).toFixed(2)}deg`);
    el.style.setProperty("--ex", `${(-px * 2).toFixed(2)}px`);   // la tranche bascule à l'opposé
    el.style.setProperty("--px", (px * 2).toFixed(3));
    el.style.setProperty("--py", (py * 2).toFixed(3));
    el.style.setProperty("--gx", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${((py + 0.5) * 100).toFixed(1)}%`);
    el.classList.add("tilt");
    active = el;
  }

  function init() {
    if (reduced()) return;
    document.documentElement.classList.add("cards-3d");
    // Pose au repos : au défilement (de n'importe quel conteneur), au redimensionnement
    // et quand une page est rendue (de nouvelles cartes apparaissent).
    document.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    schedule();
    // Inclinaison au pointeur : seulement avec une souris
    if (finePointer()) {
      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", () => { if (active) { reset(active); active = null; } });
    }
  }

  return { init };
})();
window.Tilt = Tilt;
