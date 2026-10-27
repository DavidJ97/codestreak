/* ============================================================================
   scene3d.js — La scène 3D derrière le verre
   ----------------------------------------------------------------------------
   Une vraie scène WebGL (Three.js) remplace le décor plat :
     - au centre, une flamme de cristal (géométrie tournée puis vrillée),
       éclairée cobalt à gauche et orange à droite, comme le reste de l'app ;
     - autour, des petits blocs « de code » en orbite et une poussière de
       particules qui donnent la profondeur ;
     - la caméra suit doucement la souris (parallaxe), le défilement, et se
       déplace quand on change de page (chaque page a son point de vue) ;
     - pendant une leçon, la flamme recule pour laisser lire.

   Le verre des cartes (backdrop-filter) floute cette scène : c'est ce qui
   donne la profondeur. Si WebGL ou Three.js ne sont pas disponibles, le
   décor CSS de glass-theme.css reste affiché : rien ne casse.
   Mouvement réduit : une image fixe, sans animation.
   ========================================================================== */

const Scene3D = (() => {
  /** Point de vue par page : position de la flamme et rotation de la caméra. */
  const VIEWS = {
    home: { x: 2.2, y: 0.1, z: 0, ry: -0.25, scale: 1 },
    projects: { x: -2.4, y: 0.3, z: -0.5, ry: 0.35, scale: 0.95 },
    certs: { x: 2.6, y: -0.4, z: -1, ry: -0.55, scale: 0.9 },
    journal: { x: -2.2, y: -0.2, z: -0.8, ry: 0.6, scale: 0.9 },
    course: { x: 2.8, y: 0.4, z: -1.2, ry: -0.4, scale: 0.85 },
    focus: { x: 3.4, y: 0, z: -4, ry: -0.8, scale: 0.75 },
  };

  let THREE = null, renderer, scene, camera, flame, core, blocks, dust, lights = {};
  let target = { ...VIEWS.home }, current = { ...VIEWS.home };
  let mouse = { x: 0, y: 0 }, smooth = { x: 0, y: 0 };
  let running = false, still = false;

  const lerp = (a, b, t) => a + (b - a) * t;

  /** Une flamme : profil de goutte tourné autour de l'axe vertical, puis vrillé. */
  function flameGeometry() {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;                                   // 0 = base, 1 = pointe
      const r = Math.sin(Math.PI * Math.pow(t, 0.62)) * (1 - t * 0.55) * 1.15;
      pts.push(new THREE.Vector2(Math.max(0.001, r), t * 3.4 - 1.5));
    }
    const geo = new THREE.LatheGeometry(pts, 10); // peu de côtés : des facettes de cristal
    // Vrille : plus on monte, plus on tourne (comme une flamme qui danse)
    const p = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const k = (v.y + 1.5) / 3.4;
      const a = k * 2.4;
      const x = v.x * Math.cos(a) - v.z * Math.sin(a);
      const z = v.x * Math.sin(a) + v.z * Math.cos(a);
      p.setXYZ(i, x + Math.sin(k * 3) * 0.12 * k, v.y, z);
    }
    geo.computeVertexNormals();
    return geo;
  }

  function build(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b1626, 7, 16);
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.set(0, 0, 8);

    // Lumières : cobalt à gauche, orange à droite, un peu d'ambre par-dessous
    scene.add(new THREE.AmbientLight(0x1a2244, 0.6));
    lights.blue = new THREE.PointLight(0x2f63ff, 10, 22); lights.blue.position.set(-5, 2, 3); scene.add(lights.blue);
    lights.orange = new THREE.PointLight(0xff4d17, 10, 22); lights.orange.position.set(5, -1, 3); scene.add(lights.orange);
    lights.amber = new THREE.PointLight(0xffb21a, 2.5, 10); lights.amber.position.set(0, -3, 2); scene.add(lights.amber);

    // La flamme de cristal
    flame = new THREE.Group();
    const geo = flameGeometry();
    const shell = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
      color: 0xffffff, roughness: 0.18, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.1,
      flatShading: true, emissive: 0x3a1405, emissiveIntensity: 0.7, transparent: true, opacity: 0.93,
    }));
    flame.add(shell);
    // Les arêtes des facettes, en fil ambré
    flame.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 18), new THREE.LineBasicMaterial({ color: 0xffc891, transparent: true, opacity: 0.35 })));
    // Un cœur lumineux à l'intérieur
    core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffb27a, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
    core.position.y = -0.55;
    flame.add(core);
    scene.add(flame);

    // Des blocs « de code » en orbite (instanciés : un seul appel de dessin)
    const N = 42;
    blocks = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.13, 0.13, 0.13),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.25 }),
      N,
    );
    // Trois teintes : cobalt (Python), ambre (COBOL), blanc
    const tints = [new THREE.Color(0x6f93ff), new THREE.Color(0xffad3d), new THREE.Color(0xf2f4ff)];
    for (let i = 0; i < N; i++) blocks.setColorAt(i, tints[i % 3]);
    blocks.userData.seeds = Array.from({ length: N }, (_, i) => ({
      r: 2.1 + (i % 7) * 0.22, a: (i / N) * Math.PI * 2, y: Math.sin(i * 1.7) * 1.4, s: 0.6 + (i % 5) * 0.18, spin: (i % 3) + 1,
    }));
    flame.add(blocks);

    // Poussière de particules pour la profondeur
    const P = 500;
    const pos = new Float32Array(P * 3);
    for (let i = 0; i < P; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = -Math.random() * 12 + 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    dust = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffd9b0, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false }));
    scene.add(dust);

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
    document.addEventListener("visibilitychange", () => { if (!document.hidden && !still) loop(); });
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Sur mobile (écran haut), la flamme passe au centre, un peu plus loin
    camera.position.z = w / h < 0.8 ? 10.5 : 8;
    camera.updateProjectionMatrix();
    if (still) render(0);
  }

  function render(t) {
    // Rapprocher doucement l'état courant de la cible (changement de page)
    for (const k of Object.keys(current)) current[k] = lerp(current[k], target[k], still ? 1 : 0.045);
    smooth.x = lerp(smooth.x, mouse.x, 0.05);
    smooth.y = lerp(smooth.y, mouse.y, 0.05);
    const narrow = window.innerWidth / window.innerHeight < 0.8;
    const scroll = Math.min(1, window.scrollY / 1200);

    flame.position.set(narrow ? 0 : current.x, current.y + scroll * 0.8, current.z);
    flame.scale.setScalar(current.scale);
    flame.rotation.y = current.ry + t * 0.18 + scroll * 1.2;
    flame.rotation.z = Math.sin(t * 0.6) * 0.05;
    core.scale.setScalar(1 + Math.sin(t * 2.2) * 0.08);
    lights.amber.intensity = 2.2 + Math.sin(t * 2.2) * 0.6;

    // Orbites des blocs
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
    blocks.userData.seeds.forEach((d, i) => {
      const a = d.a + t * 0.25 * d.s;
      p.set(Math.cos(a) * d.r, d.y + Math.sin(t * 0.8 + i) * 0.15, Math.sin(a) * d.r);
      e.set(t * d.spin * 0.6, t * d.spin * 0.4, 0);
      q.setFromEuler(e);
      m.compose(p, q, s);
      blocks.setMatrixAt(i, m);
    });
    blocks.instanceMatrix.needsUpdate = true;
    dust.rotation.y = t * 0.01;

    // Parallaxe : la caméra suit la souris
    camera.position.x = smooth.x * 0.8;
    camera.position.y = -smooth.y * 0.5;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }

  function loop() {
    if (running) return;
    running = true;
    const frame = (now) => {
      if (document.hidden) { running = false; return; }
      render(now / 1000);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /** Choisit le point de vue de la page affichée. */
  function view(name) {
    if (!renderer) return;
    target = { ...(VIEWS[name] || VIEWS.course) };
    if (still) render(0);
  }

  function init() {
    THREE = window.THREE;
    if (!THREE) return false;
    const canvas = document.createElement("canvas");
    canvas.className = "scene3d";
    canvas.setAttribute("aria-hidden", "true");
    try {
      const test = document.createElement("canvas");
      if (!(test.getContext("webgl2") || test.getContext("webgl"))) return false;
      document.body.prepend(canvas);
      build(canvas);
    } catch (err) {
      canvas.remove();
      return false;
    }
    document.body.classList.add("has-3d");
    still = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (still) render(0); else loop();
    return true;
  }

  return { init, view };
})();
window.Scene3D = Scene3D;
