/* ============================================================================
   world3d.js — Le monde 3D de l'accueil : on navigue dans l'app en 3D
   ----------------------------------------------------------------------------
   Inspiré des pages produit « isométriques » (une machine en 3D qui montre
   chaque étape d'un processus). Ici, la machine, c'est ton parcours :

     1. Apprendre      les cours arrivent sur le tapis roulant
     2. S'exercer      un cube se pose sur la plateforme, la grille s'allume
     3. Construire     une cage de verre se referme, des blocs s'empilent
     4. Publier        le projet repart sur le tapis vers GitHub
     5. Certifier      une médaille dorée s'élève
     6. Veille         des ondes radar balaient la plateforme
     7. Tuteur IA      l'écran devient une conversation

   Sous la scène, une rangée d'étapes (icône dans un cercle) : un clic change
   la scène 3D ET propose d'ouvrir la section de l'app correspondante. Sans
   clic, les étapes défilent seules.

   Technique : Three.js r128, caméra orthographique (vue isométrique),
   ombres douces, reflets métalliques (environnement généré), textures
   dessinées dans un <canvas> (étiquettes des cubes, écran).
   Sans WebGL : la scène est masquée, les étapes restent utilisables.
   ========================================================================== */

const World = (() => {
  const STEPS = [
    { id: "learn", icon: "book-open", label: "Apprendre", title: "Une leçon par jour",
      text: "Six cours, des fondations (Python, COBOL) à l'IA. Chaque leçon : théorie, illustration interactive, exercices.",
      cta: "Ouvrir le cours", status: "› cours chargés · 53 leçons", cam: { x: -3.2, z: 0, zoom: 1 } },
    { id: "practice", icon: "terminal", label: "S'exercer", title: "Pratiquer pour de vrai",
      text: "Du vrai code qui tourne dans le navigateur, des QCM et des exercices à trous. Chaque bonne réponse rapporte de l'XP.",
      cta: "Faire la prochaine leçon", status: "✓ exercice réussi · +10 XP", cam: { x: 0, z: 0, zoom: 1.15 } },
    { id: "build", icon: "code", label: "Construire", title: "Un projet de portfolio",
      text: "Chaque cours débouche sur des projets guidés étape par étape, avec la documentation officielle à chaque étape.",
      cta: "Voir les projets", status: "› building… projet portfolio", cam: { x: 0, z: 0, zoom: 1.08 } },
    { id: "publish", icon: "git-commit", label: "Publier", title: "Sur ton GitHub",
      text: "Le projet sort de la machine : README clair, tests, résultats chiffrés. Ce que les recruteurs regardent.",
      cta: "Voir les projets", status: "✓ git push origin main", cam: { x: 3.2, z: 0, zoom: 1 } },
    { id: "certify", icon: "trophy", label: "Certifier", title: "Des certifications reconnues",
      text: "17 certifications de l'industrie : laquelle viser, comment la préparer, combien elle coûte.",
      cta: "Voir les certifications", status: "✓ prêt pour l'examen", cam: { x: 0, z: 0, zoom: 1.12 } },
    { id: "watch", icon: "eye", label: "Veille", title: "Rester à l'avant-garde",
      text: "Un journal pour suivre les tendances, les failles et les innovations, avec les bonnes sources.",
      cta: "Ouvrir le journal", status: "› veille · 3 nouvelles entrées", cam: { x: 0, z: 0, zoom: 1.08 } },
    { id: "tutor", icon: "sparkles", label: "Tuteur IA", title: "Un tuteur toujours là",
      text: "Bloqué ? Le tuteur IA explique, donne un indice ou relit ton code, sans donner la réponse toute faite.",
      cta: "Parler au tuteur", status: "› tuteur en ligne", cam: { x: 0, z: 0, zoom: 1.08 } },
  ];
  const AUTO_MS = 5200;

  let T = null;            // THREE
  let ctx = null;          // état de la scène montée
  let stepIndex = 0, autoTimer = null, pausedUntil = 0;

  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- Formes utiles ---------- */

  /** Rectangle arrondi (forme 2D), centré. */
  function roundedRect(w, d, r) {
    const s = new T.Shape(), x = -w / 2, y = -d / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  /** Une dalle arrondie posée à plat (épaisseur h), base à y = 0. */
  function slab(w, d, h, r, mat) {
    const g = new T.ExtrudeGeometry(roundedRect(w, d, r), {
      depth: h, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2, curveSegments: 10,
    });
    g.rotateX(-Math.PI / 2);
    const m = new T.Mesh(g, mat);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  /** Texture dessinée dans un canvas. */
  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    draw(g, w, h);
    const t = new T.CanvasTexture(c);
    t.encoding = T.sRGBEncoding;
    t.anisotropy = 4;
    return { tex: t, canvas: c, g };
  }

  /** Rectangle arrondi dans un canvas 2D. */
  function rr(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  /* ---------- Construction de la scène ---------- */

  function build(stage) {
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    stage.appendChild(renderer.domElement);

    const scene = new T.Scene();

    // Reflets : un petit « studio » (murs gris, panneaux lumineux) converti en environnement
    const pmrem = new T.PMREMGenerator(renderer);
    const studio = new T.Scene();
    studio.add(new T.Mesh(new T.BoxGeometry(30, 30, 30), new T.MeshBasicMaterial({ color: 0x24242c, side: T.BackSide })));
    const panel = (c, x, y, z, w, h) => { const p = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: c, side: T.DoubleSide })); p.position.set(x, y, z); p.lookAt(0, 0, 0); studio.add(p); };
    panel(0xffffff, -8, 10, 6, 10, 4);
    panel(0xffb27a, 10, 4, -4, 6, 8);
    panel(0x6f93ff, -10, 3, -8, 6, 6);
    scene.environment = pmrem.fromScene(studio, 0.04).texture;

    // Caméra isométrique
    const camera = new T.OrthographicCamera(-5, 5, 4, -4, 0.1, 200);
    const camDir = new T.Vector3(1, 0.92, 1).normalize();

    // Lumières
    scene.add(new T.HemisphereLight(0xcfd8ff, 0x0b0b10, 0.35));
    const key = new T.DirectionalLight(0xffffff, 1.3);
    key.position.set(-6, 14, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -12; key.shadow.camera.right = 12; key.shadow.camera.top = 12; key.shadow.camera.bottom = -12;
    key.shadow.radius = 6; key.shadow.bias = -0.0006;
    scene.add(key);
    const glow = new T.PointLight(0xff6a2a, 1.5, 9); glow.position.set(0, 1.2, 0); scene.add(glow);
    const rim = new T.PointLight(0x4f7bff, 2, 16); rim.position.set(-6, 3, -5); scene.add(rim);

    // Sol : n'affiche que les ombres
    const floor = new T.Mesh(new T.PlaneGeometry(80, 80), new T.ShadowMaterial({ opacity: 0.45 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

    // Matériaux
    const M = {
      dark: new T.MeshStandardMaterial({ color: 0x16161b, roughness: 0.5, metalness: 0.35, envMapIntensity: 0.35 }),
      darker: new T.MeshStandardMaterial({ color: 0x0d0d10, roughness: 0.6, metalness: 0.5, envMapIntensity: 0.4 }),
      copper: new T.MeshStandardMaterial({ color: 0xff5a1f, emissive: 0xff4a10, emissiveIntensity: 0.9, roughness: 0.35, metalness: 0.2, envMapIntensity: 0.3 }),
      metal: new T.MeshStandardMaterial({ color: 0x8d929c, roughness: 0.28, metalness: 1, envMapIntensity: 0.8 }),
      slat: new T.MeshStandardMaterial({ color: 0x1c1c22, roughness: 0.5, metalness: 0.5, envMapIntensity: 0.4 }),
      gold: new T.MeshStandardMaterial({ color: 0xffc457, roughness: 0.22, metalness: 1 }),
      glass: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.12, depthWrite: false }),
      ember: new T.MeshStandardMaterial({ color: 0x401505, emissive: 0xff5a14, emissiveIntensity: 1.3, roughness: 0.4, transparent: true, opacity: 0.92 }),
      screen: new T.MeshStandardMaterial({ color: 0x0a0a0d, roughness: 0.12, metalness: 0.8 }),
    };

    /* La plateforme : dalles sombres et filets de cuivre empilés */
    const pad = new T.Group();
    let y = 0;
    [[M.darker, 0.22], [M.copper, 0.04], [M.dark, 0.1], [M.copper, 0.04], [M.dark, 0.3]].forEach(([mat, h], i) => {
      const s = slab(4.4 - (i === 4 ? 0.06 : 0), 4.4 - (i === 4 ? 0.06 : 0), h, 0.5, mat);
      s.position.y = y; pad.add(s); y += h + 0.05;
    });
    const padTop = y;
    // Grille gravée sur le dessus
    const gridPts = [];
    for (let i = -3; i <= 3; i++) {
      const k = i * 0.55;
      gridPts.push(-1.65, 0, k, 1.65, 0, k, k, 0, -1.65, k, 0, 1.65);
    }
    const gridGeo = new T.BufferGeometry();
    gridGeo.setAttribute("position", new T.Float32BufferAttribute(gridPts, 3));
    const gridMat = new T.LineBasicMaterial({ color: 0x3a3a46, transparent: true, opacity: 0.9 });
    const grid = new T.LineSegments(gridGeo, gridMat);
    grid.position.y = padTop + 0.01;
    pad.add(grid);
    scene.add(pad);

    /* Le tapis roulant : de chaque côté de la plateforme */
    const beltY = 0.42;
    const belts = [];
    [-1, 1].forEach((side) => {
      const g = new T.Group();
      const len = 7;
      const cx = side * (2.2 + len / 2 + 0.15);
      const base = new T.Mesh(new T.BoxGeometry(len, 0.3, 1.9), M.darker); base.position.set(cx, 0.15, 0); base.castShadow = base.receiveShadow = true; g.add(base);
      [-1, 1].forEach((s) => {
        const rail = new T.Mesh(new T.BoxGeometry(len, 0.55, 0.14), M.metal); rail.position.set(cx, 0.32, s * 1.02); rail.castShadow = true; g.add(rail);
        const strip = new T.Mesh(new T.BoxGeometry(len, 0.04, 0.03), M.copper); strip.position.set(cx, 0.08, s * 1.1); g.add(strip);
      });
      // Les lattes qui défilent
      const N = 30;
      const slats = new T.InstancedMesh(new T.BoxGeometry(0.1, 0.05, 1.75), M.slat, N);
      slats.receiveShadow = true;
      g.add(slats);
      // Une arche métallique au bout
      const ax = side * (2.2 + 1.3);
      const arch = new T.Group();
      [-1, 1].forEach((s) => { const leg = new T.Mesh(new T.BoxGeometry(0.5, 1.9, 0.22), M.metal); leg.position.set(0, 0.95, s * 1.2); leg.castShadow = true; arch.add(leg); });
      const top = new T.Mesh(new T.BoxGeometry(0.5, 0.26, 2.62), M.metal); top.position.y = 1.95; top.castShadow = true; arch.add(top);
      const inner = new T.Mesh(new T.BoxGeometry(0.52, 0.05, 2.1), M.copper); inner.position.y = 1.8; arch.add(inner);
      arch.position.x = ax;
      g.add(arch);
      scene.add(g);
      belts.push({ side, slats, N, len, cx });
    });

    /* Les cubes « cours » : étiquette dessinée sur le dessus */
    const COURSES = [
      ["PY", "#3d6bff", "#ffffff"], ["COBOL", "#ffad3d", "#1a1206"], ["UX", "#ff5fa2", "#ffffff"],
      ["AI", "#8b6bff", "#ffffff"], ["NLP", "#2fc6b4", "#06201c"], ["SEC", "#5ee39a", "#06200f"],
    ];
    const cubeGeo = new T.BoxGeometry(0.95, 0.95, 0.95);
    const cubes = COURSES.map(([label, bg, fg], i) => {
      const top = canvasTex(256, 256, (g, w, h) => {
        g.fillStyle = bg; g.fillRect(0, 0, w, h);
        g.fillStyle = "rgba(255,255,255,.18)"; rr(g, 18, 18, w - 36, h - 36, 26); g.fill();
        g.fillStyle = fg; g.font = `700 ${label.length > 3 ? 64 : 96}px Inter, system-ui, sans-serif`;
        g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, w / 2, h / 2 + 4);
      }).tex;
      const side = new T.MeshStandardMaterial({ color: new T.Color(bg).lerp(new T.Color(0xffffff), 0.12), roughness: 0.35, metalness: 0.15 });
      const white = new T.MeshStandardMaterial({ color: 0xeef0f5, roughness: 0.4, metalness: 0.05 });
      const mats = [white, side, new T.MeshStandardMaterial({ map: top, roughness: 0.35, metalness: 0.1 }), white, side, white];
      const m = new T.Mesh(cubeGeo, mats);
      m.castShadow = true; m.receiveShadow = true;
      m.position.set(-9 + i * 1.3, beltY + 0.48, 0);
      scene.add(m);
      return m;
    });

    /* La cage de verre (« Construire ») et ses blocs incandescents */
    const cage = new T.Group();
    const cageBox = new T.Mesh(new T.BoxGeometry(3.8, 2.2, 3.8), M.glass);
    cageBox.position.y = 1.1;
    cage.add(cageBox);
    const cageEdges = new T.LineSegments(new T.EdgesGeometry(cageBox.geometry), new T.LineBasicMaterial({ color: 0xd8dde8 }));
    cageEdges.position.copy(cageBox.position);
    cage.add(cageEdges);
    const emberN = 16;
    const embers = new T.InstancedMesh(new T.BoxGeometry(0.62, 1, 0.62), M.ember, emberN);
    embers.castShadow = true;
    cage.add(embers);
    cage.position.y = padTop;
    cage.scale.setScalar(0.001);
    scene.add(cage);

    /* L'écran flottant (comme un téléphone posé dans l'air) */
    const screenGroup = new T.Group();
    const body = new T.Mesh(new T.BoxGeometry(3, 1.9, 0.12), M.screen); body.castShadow = true; screenGroup.add(body);
    const face = canvasTex(768, 480, () => {});
    const faceMesh = new T.Mesh(new T.PlaneGeometry(2.86, 1.78), new T.MeshBasicMaterial({ map: face.tex, toneMapped: false }));
    faceMesh.position.z = 0.065;
    screenGroup.add(faceMesh);
    screenGroup.rotation.set(-0.12, Math.PI / 4, 0);
    screenGroup.scale.setScalar(1.45);
    scene.add(screenGroup);

    /* La médaille (« Certifier ») */
    const medal = new T.Group();
    const disc = new T.Mesh(new T.CylinderGeometry(0.85, 0.85, 0.16, 56), M.gold);
    disc.rotation.x = Math.PI / 2; disc.castShadow = true; medal.add(disc);
    const rimRing = new T.Mesh(new T.TorusGeometry(0.85, 0.07, 16, 56), M.gold); medal.add(rimRing);
    const starTex = canvasTex(256, 256, (g, w) => {
      g.fillStyle = "#e9a93a"; g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, 7); g.fill();
      g.fillStyle = "#fff4d6"; g.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 42 : 96; g.lineTo(w / 2 + Math.cos(a) * r, w / 2 + Math.sin(a) * r); }
      g.fill();
    }).tex;
    [1, -1].forEach((s) => { const f = new T.Mesh(new T.CircleGeometry(0.7, 48), new T.MeshStandardMaterial({ map: starTex, roughness: 0.3, metalness: 0.6 })); f.position.z = s * 0.085; if (s < 0) f.rotation.y = Math.PI; medal.add(f); });
    // Ruban
    [-1, 1].forEach((s) => { const r = new T.Mesh(new T.BoxGeometry(0.28, 0.9, 0.03), M.copper); r.position.set(s * 0.22, -1.05, 0); r.rotation.z = s * 0.25; medal.add(r); });
    medal.scale.setScalar(0.001);
    scene.add(medal);

    /* Les ondes radar (« Veille ») */
    const rings = [0, 1, 2].map(() => {
      const r = new T.Mesh(new T.RingGeometry(0.92, 1, 72), new T.MeshBasicMaterial({ color: 0xff8a4a, transparent: true, opacity: 0, side: T.DoubleSide, toneMapped: false }));
      r.rotation.x = -Math.PI / 2; r.position.y = padTop + 0.03;
      scene.add(r);
      return r;
    });

    return { renderer, scene, camera, camDir, M, pad, padTop, grid, gridMat, glow, belts, beltY, cubes, cage, embers, emberN,
      screenGroup, face, medal, rings, camState: { x: -3.2, z: 0, zoom: 1 }, mouse: { x: 0, y: 0 }, smooth: { x: 0, y: 0 },
      cageS: 0.001, medalS: 0.001, ringA: 0, gridGlow: 0, stepT0: 0, lastScreen: -1 };
  }

  /* ---------- L'écran : ce qu'il affiche à chaque étape ---------- */

  function drawScreen(step, t, info) {
    const { g, canvas, tex } = ctx.face;
    const w = canvas.width, h = canvas.height;
    g.clearRect(0, 0, w, h);
    const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, "#14141a"); bg.addColorStop(1, "#0a0a0e");
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.textBaseline = "alphabetic";
    const font = (wt, px) => `${wt} ${px}px Inter, system-ui, sans-serif`;
    const mono = (px) => `500 ${px}px ui-monospace, "Geist Mono", monospace`;
    // Barre du haut
    g.fillStyle = "#ff7a3d"; [0, 1, 2].forEach((i) => { g.beginPath(); g.arc(w - 60 + i * 20 - 20, 40, 6, 0, 7); g.globalAlpha = 1 - i * 0.3; g.fill(); }); g.globalAlpha = 1;
    g.fillStyle = "rgba(255,255,255,.5)"; g.font = font(600, 22); g.fillText(STEPS[step].label.toUpperCase(), 40, 48);
    const ok = (x, y2) => { g.strokeStyle = "#5ee39a"; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y2); g.lineTo(x + 10, y2 + 10); g.lineTo(x + 28, y2 - 10); g.stroke(); };

    switch (STEPS[step].id) {
      case "learn": {
        g.fillStyle = "#fff"; g.font = font(700, 44); g.fillText(info.lessonTitle, 40, 130);
        g.fillStyle = "rgba(255,255,255,.55)"; g.font = font(500, 26); g.fillText(`${info.courseName} · leçon ${info.lessonNum}`, 40, 172);
        ["Théorie", "Illustration interactive", "Exercices"].forEach((s, i) => {
          const yy = 240 + i * 62; g.fillStyle = "rgba(255,255,255,.06)"; rr(g, 40, yy - 38, w - 80, 50, 14); g.fill();
          g.fillStyle = "#fff"; g.font = font(500, 26); g.fillText(s, 70, yy - 4);
        });
        break;
      }
      case "practice": {
        g.fillStyle = "rgba(255,255,255,.06)"; rr(g, 40, 90, w - 80, 120, 16); g.fill();
        g.font = mono(30); g.fillStyle = "#8fb0ff"; g.fillText("print", 70, 162); g.fillStyle = "#fff"; g.fillText('("Bonjour !")', 158, 162);
        g.fillStyle = "rgba(94,227,154,.14)"; rr(g, 40, 250, w - 80, 90, 16); g.fill();
        ok(72, 292); g.fillStyle = "#5ee39a"; g.font = font(700, 34); g.fillText("Correct !", 122, 308);
        g.fillStyle = "#ffc891"; g.font = font(700, 34); g.textAlign = "right"; g.fillText("+10 XP", w - 70, 308); g.textAlign = "left";
        g.fillStyle = "rgba(255,255,255,.45)"; g.font = font(500, 24); g.fillText("Exercice 2 / 3", 40, 410);
        break;
      }
      case "build": {
        g.fillStyle = "#fff"; g.font = font(700, 52); g.fillText("Building…", 40, 170);
        const p = ((t * 0.35) % 1);
        g.fillStyle = "rgba(255,255,255,.1)"; rr(g, 40, 220, w - 80, 34, 17); g.fill();
        const gr = g.createLinearGradient(40, 0, w - 40, 0); gr.addColorStop(0, "#ff5a1f"); gr.addColorStop(1, "#ffc891");
        g.fillStyle = gr; rr(g, 40, 220, Math.max(34, (w - 80) * p), 34, 17); g.fill();
        g.fillStyle = "rgba(255,255,255,.55)"; g.font = mono(24);
        ["› pip install -r requirements.txt", "› pytest  ✓ 12 tests", "› README.md généré"].forEach((s, i) => { g.globalAlpha = p * 3 > i ? 1 : 0.25; g.fillText(s, 40, 320 + i * 44); });
        g.globalAlpha = 1;
        break;
      }
      case "publish": {
        g.font = mono(30); g.fillStyle = "rgba(255,255,255,.6)"; g.fillText("$ git push origin main", 40, 140);
        g.fillStyle = "rgba(94,227,154,.14)"; rr(g, 40, 190, w - 80, 110, 18); g.fill();
        ok(74, 248); g.fillStyle = "#fff"; g.font = font(700, 38); g.fillText("Publié sur GitHub", 124, 262);
        g.fillStyle = "rgba(255,255,255,.5)"; g.font = font(500, 26); g.fillText("README · tests · démo en ligne", 40, 370);
        break;
      }
      case "certify": {
        g.fillStyle = "#ffc457"; g.font = font(700, 30); g.fillText("CERTIFICATION", 40, 130);
        g.fillStyle = "#fff"; g.font = font(700, 50); g.fillText("Prêt pour l'examen", 40, 200);
        [["Préparation", 0.86], ["Projets liés", 0.66]].forEach(([s, v], i) => {
          const yy = 270 + i * 80; g.fillStyle = "rgba(255,255,255,.55)"; g.font = font(500, 24); g.fillText(s, 40, yy);
          g.fillStyle = "rgba(255,255,255,.1)"; rr(g, 40, yy + 16, w - 80, 18, 9); g.fill();
          g.fillStyle = "#ffc457"; rr(g, 40, yy + 16, (w - 80) * v, 18, 9); g.fill();
        });
        break;
      }
      case "watch": {
        [["FAILLE", "#ff8a8a", "Injection de prompt indirecte"], ["INNOVATION", "#8fb0ff", "Nouveau protocole d'agents"], ["TENDANCE", "#ffc891", "Interfaces génératives"]].forEach(([k, c, s], i) => {
          const yy = 100 + i * 112; g.fillStyle = "rgba(255,255,255,.06)"; rr(g, 40, yy, w - 80, 92, 16); g.fill();
          g.fillStyle = c; g.font = font(700, 20); g.fillText(k, 66, yy + 36);
          g.fillStyle = "#fff"; g.font = font(600, 28); g.fillText(s, 66, yy + 72);
        });
        break;
      }
      case "tutor": {
        g.fillStyle = "#ffffff"; rr(g, w - 470, 90, 430, 76, 22); g.fill();
        g.fillStyle = "#0b1626"; g.font = font(600, 26); g.fillText("Pourquoi ma boucle tourne", w - 446, 124); g.fillText("à l'infini ?", w - 446, 154);
        g.fillStyle = "rgba(255,255,255,.08)"; rr(g, 40, 200, 560, 150, 22); g.fill();
        g.fillStyle = "#fff"; g.font = font(500, 26);
        ["Regarde la condition du while :", "est-ce que la variable change", "à chaque tour ? Indice : ligne 3."].forEach((s, i) => g.fillText(s, 66, 244 + i * 38));
        g.fillStyle = "#ffc891"; g.font = font(600, 22); g.fillText("Tuteur IA", 40, 400);
        break;
      }
    }
    tex.needsUpdate = true;
  }

  /* ---------- Animation ---------- */

  function resize() {
    const { renderer, camera } = ctx;
    const r = ctx.stage.getBoundingClientRect();
    if (!r.width) return;
    renderer.setSize(r.width, r.height, false);
    ctx.aspect = r.width / r.height;
  }

  function frame(now) {
    if (!ctx) return;
    if (!ctx.stage.isConnected) { destroy(); return; }
    ctx.raf = requestAnimationFrame(frame);
    if (!ctx.visible) return;
    const t = now / 1000;
    const S = STEPS[stepIndex];
    const id = S.id;
    const { camera, camDir, cubes, belts, beltY, padTop } = ctx;
    const k = ctx.still ? 1 : 0.06;

    // Caméra : se recentre sur la partie de la machine qui compte
    const c = ctx.camState;
    c.x = lerp(c.x, S.cam.x, k); c.z = lerp(c.z, S.cam.z, k); c.zoom = lerp(c.zoom, S.cam.zoom, k);
    ctx.smooth.x = lerp(ctx.smooth.x, ctx.mouse.x, 0.05); ctx.smooth.y = lerp(ctx.smooth.y, ctx.mouse.y, 0.05);
    const H = Math.max(8.6, 11.5 / ctx.aspect) / c.zoom;
    camera.top = H / 2; camera.bottom = -H / 2; camera.left = -H * ctx.aspect / 2; camera.right = H * ctx.aspect / 2;
    camera.updateProjectionMatrix();
    const target = new T.Vector3(c.x, 2, c.z);
    const dir = camDir.clone().applyAxisAngle(new T.Vector3(0, 1, 0), ctx.smooth.x * 0.08);
    dir.y += -ctx.smooth.y * 0.05;
    camera.position.copy(target).addScaledVector(dir.normalize(), 40);
    camera.lookAt(target);

    // Tapis : les lattes avancent toujours (de gauche à droite)
    const m = new T.Matrix4();
    belts.forEach((b) => {
      for (let i = 0; i < b.N; i++) {
        const u = ((i / b.N + t * 0.08) % 1);
        m.makeTranslation(b.cx - b.len / 2 + u * b.len, 0.33, 0);
        b.slats.setMatrixAt(i, m);
      }
      b.slats.instanceMatrix.needsUpdate = true;
    });

    // Les cubes
    const heroOnPad = ["practice", "certify", "watch", "tutor"].includes(id);
    cubes.forEach((cube, i) => {
      let px, py, pz = 0, s = 1;
      if (id === "learn") {
        // Les cours défilent sur le tapis vers la plateforme
        const u = ((i / cubes.length) + t * 0.07) % 1;
        px = -9.4 + u * 7.4; py = beltY + 0.48;
        s = Math.min(1, u * 8, (1 - u) * 8);
      } else if (i === 0 && heroOnPad) {
        px = 0; py = padTop + 0.5 + Math.sin(t * 2) * 0.04;
      } else if (i === 0 && id === "build") {
        px = 0; py = padTop + 0.5; s = 0.001;
      } else if (i === 0 && id === "publish") {
        const u = (t * 0.12) % 1;
        px = 2.4 + u * 7; py = beltY + 0.48; s = Math.min(1, u * 8, (1 - u) * 8);
      } else {
        // En attente sur le tapis de gauche
        px = -3.2 - i * 1.25; py = beltY + 0.48;
      }
      const loop = id === "learn" || (i === 0 && id === "publish");
      const kk = loop ? 1 : k * 1.4;
      cube.position.x = lerp(cube.position.x, px, kk); cube.position.y = lerp(cube.position.y, py, kk); cube.position.z = lerp(cube.position.z, pz, kk);
      cube.scale.setScalar(lerp(cube.scale.x, s, loop ? 1 : k * 1.5));
      cube.rotation.y = i === 0 && heroOnPad ? t * 0.6 : lerp(cube.rotation.y, 0, k);
    });

    // La grille s'allume pendant l'exercice
    ctx.gridGlow = lerp(ctx.gridGlow, id === "practice" ? 1 : 0, k);
    ctx.gridMat.color.setRGB(lerp(0.23, 1, ctx.gridGlow), lerp(0.23, 0.55, ctx.gridGlow), lerp(0.27, 0.24, ctx.gridGlow));
    ctx.glow.intensity = 1 + ctx.gridGlow * 2 + (id === "build" ? 2.5 : 0) + Math.sin(t * 2.4) * 0.3;

    // La cage et ses blocs
    ctx.cageS = lerp(ctx.cageS, id === "build" ? 1 : 0.001, k * 1.3);
    ctx.cage.scale.setScalar(Math.max(0.001, ctx.cageS));
    for (let i = 0; i < ctx.emberN; i++) {
      const gx = (i % 4) - 1.5, gz = Math.floor(i / 4) - 1.5;
      const hgt = 0.35 + (Math.sin(t * 1.6 + i * 1.7) * 0.5 + 0.5) * 1.3 * (0.5 + ((i * 7) % 5) / 8);
      m.compose(new T.Vector3(gx * 0.8, hgt / 2, gz * 0.8), new T.Quaternion(), new T.Vector3(1, hgt, 1));
      ctx.embers.setMatrixAt(i, m);
    }
    ctx.embers.instanceMatrix.needsUpdate = true;

    // L'écran flotte au-dessus, derrière la plateforme
    const sg = ctx.screenGroup;
    const sx = id === "learn" ? -4.2 : id === "publish" ? 3.6 : -1.4;
    const sy = id === "build" ? 4.3 : 3.8;
    sg.position.x = lerp(sg.position.x, sx, k); sg.position.y = lerp(sg.position.y, sy + Math.sin(t * 1.2) * 0.08, k); sg.position.z = lerp(sg.position.z, -2, k);
    if (ctx.lastScreen !== stepIndex || (id === "build" && Math.floor(t * 10) !== ctx.lastTick)) {
      drawScreen(stepIndex, t, ctx.info);
      ctx.lastScreen = stepIndex; ctx.lastTick = Math.floor(t * 10);
    }

    // La médaille
    ctx.medalS = lerp(ctx.medalS, id === "certify" ? 1 : 0.001, k * 1.3);
    ctx.medal.scale.setScalar(Math.max(0.001, ctx.medalS * 1.5));
    ctx.medal.position.set(0.9, padTop + 2.4 + Math.sin(t * 1.5) * 0.12, 1.2);
    ctx.medal.rotation.y = t * 1.1;

    // Les ondes radar
    ctx.ringA = lerp(ctx.ringA, id === "watch" ? 1 : 0, k);
    ctx.rings.forEach((r, i) => {
      const u = ((t * 0.45) + i / 3) % 1;
      r.scale.setScalar(0.3 + u * 2.3);
      r.material.opacity = (1 - u) * 0.9 * ctx.ringA;
    });

    ctx.renderer.render(ctx.scene, camera);
  }

  /* ---------- Les étapes (sous la scène) ---------- */

  function select(i, user) {
    stepIndex = (i + STEPS.length) % STEPS.length;
    if (user) pausedUntil = Date.now() + 20000;
    const root = ctx?.root || document.querySelector(".world");
    if (!root) return;
    root.querySelectorAll(".w3-step").forEach((b, k) => {
      b.classList.toggle("on", k === stepIndex);
      b.setAttribute("aria-selected", k === stepIndex);
    });
    const S = STEPS[stepIndex];
    root.querySelector(".w3-status").textContent = S.status;
    const info = root.querySelector(".w3-info");
    info.classList.remove("in"); void info.offsetWidth; info.classList.add("in");
    info.querySelector("h3").textContent = S.title;
    info.querySelector("p").textContent = S.text;
    info.querySelector(".w3-cta span").textContent = S.cta;
    info.querySelector(".w3-num").textContent = `${String(stepIndex + 1).padStart(2, "0")} / ${String(STEPS.length).padStart(2, "0")}`;
  }

  function destroy() {
    if (!ctx) return;
    cancelAnimationFrame(ctx.raf);
    clearInterval(autoTimer);
    ctx.io?.disconnect(); ctx.ro?.disconnect();
    ctx.renderer.dispose();
    ctx.renderer.forceContextLoss?.();
    ctx = null;
  }

  /**
   * Monte le monde 3D dans `root`.
   * @param {HTMLElement} root
   * @param {{info:{courseName:string, lessonTitle:string, lessonNum:number}, onOpen:(id:string)=>void, icon:(n:string,s:number)=>string}} opts
   */
  function mount(root, opts) {
    destroy();
    T = window.THREE;
    root.classList.add("world");
    root.innerHTML = `
      <div class="w3-stage" aria-hidden="true">
        <div class="w3-hud"><span class="w3-status"></span></div>
      </div>
      <div class="w3-steps" role="tablist" aria-label="Ton parcours">
        ${STEPS.map((s, i) => `
          <button class="w3-step" role="tab" data-step="${i}" aria-selected="false">
            <span class="w3-ring">${opts.icon(s.icon, 22)}</span>
            <span class="w3-label">${s.label}</span>
          </button>`).join("")}
      </div>
      <div class="w3-info">
        <span class="w3-num"></span>
        <h3></h3>
        <p></p>
        <button class="w3-cta"><span></span>${opts.icon("arrow-right", 18)}</button>
      </div>`;

    root.querySelector(".w3-steps").addEventListener("click", (e) => {
      const b = e.target.closest(".w3-step");
      if (b) select(Number(b.dataset.step), true);
    });
    root.querySelector(".w3-cta").addEventListener("click", () => opts.onOpen(STEPS[stepIndex].id));

    const stage = root.querySelector(".w3-stage");
    let ok = false;
    try {
      const test = document.createElement("canvas");
      ok = !!(T && (test.getContext("webgl2") || test.getContext("webgl")));
    } catch { ok = false; }

    if (ok) {
      try {
        ctx = build(stage);
        ctx.root = root; ctx.stage = stage; ctx.info = opts.info; ctx.visible = true; ctx.lastTick = -1;
        ctx.still = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        resize();
        ctx.ro = new ResizeObserver(resize); ctx.ro.observe(stage);
        ctx.io = new IntersectionObserver(([en]) => { if (ctx) ctx.visible = en.isIntersecting; }); ctx.io.observe(stage);
        stage.addEventListener("pointermove", (e) => {
          if (!ctx) return;
          const r = stage.getBoundingClientRect();
          ctx.mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
          ctx.mouse.y = ((e.clientY - r.top) / r.height) * 2 - 1;
        });
        stage.addEventListener("pointerleave", () => { if (ctx) ctx.mouse.x = 0; ctx.mouse.y = 0; });
        ctx.raf = requestAnimationFrame(frame);
      } catch (err) {
        console.warn("World 3D indisponible :", err);
        stage.hidden = true;
        ctx = null;
      }
    } else {
      stage.hidden = true;
    }

    select(stepIndex, false);
    // Défilement automatique des étapes (en pause après un clic)
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      autoTimer = setInterval(() => {
        if (!root.isConnected) { clearInterval(autoTimer); return; }
        if (Date.now() < pausedUntil || document.hidden) return;
        select(stepIndex + 1, false);
      }, AUTO_MS);
    }
  }

  return { mount, STEPS };
})();
window.World = World;
