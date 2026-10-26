/* ============================================================================
   runner.js — Exécuter du Python directement dans le navigateur
   ----------------------------------------------------------------------------
   On utilise Pyodide : l'interpréteur Python officiel (CPython) compilé en
   WebAssembly. Aucun serveur n'est nécessaire, tout tourne localement.

   Pyodide pèse quelques Mo : on ne le télécharge qu'au PREMIER clic sur
   "Exécuter" (chargement paresseux / "lazy loading"), puis on le réutilise.

   Pour le COBOL, il n'existe pas d'équivalent léger dans le navigateur :
   l'app propose plutôt de demander à l'IA de simuler l'exécution.
   ========================================================================== */

const Runner = (() => {
  // On passe par le paquet npm de Pyodide sur jsDelivr (mêmes fichiers que le CDN officiel)
  const PYODIDE_URL = "https://cdn.jsdelivr.net/npm/pyodide@0.26.4/";
  let pyodidePromise = null; // promesse partagée : un seul chargement même si on clique plusieurs fois

  /** Charge un script externe et renvoie une promesse. */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Impossible de charger " + src));
      document.head.appendChild(s);
    });
  }

  /** Renvoie l'instance Pyodide (la charge si nécessaire). */
  function getPyodide() {
    if (!pyodidePromise) {
      pyodidePromise = loadScript(PYODIDE_URL + "pyodide.js")
        .then(() => window.loadPyodide({ indexURL: PYODIDE_URL }))
        .catch((err) => {
          pyodidePromise = null; // permet de réessayer plus tard
          throw err;
        });
    }
    return pyodidePromise;
  }

  /**
   * Exécute du code Python et capture ce qui est affiché.
   * @param {string} code
   * @returns {Promise<{output:string, error:string|null}>}
   */
  async function runPython(code) {
    const py = await getPyodide();
    let output = "";

    // On redirige print() (stdout) et les erreurs (stderr) vers notre variable
    py.setStdout({ batched: (line) => { output += line + "\n"; } });
    py.setStderr({ batched: (line) => { output += line + "\n"; } });

    // input() n'est pas interactif ici : on le remplace par une version qui
    // explique le problème plutôt que de bloquer la page.
    py.globals.set("__codestreak_input_msg", "input() n'est pas disponible dans le navigateur : remplace-le par une valeur fixe.");

    try {
      // Un dictionnaire de variables neuf à chaque exécution = pas de "fuite"
      // de variables d'un exemple à l'autre.
      const scope = py.globals.get("dict")();
      await py.runPythonAsync(
        "import builtins\n" +
        "def _no_input(*a):\n" +
        "    raise RuntimeError(__codestreak_input_msg)\n" +
        "builtins.input = _no_input\n"
      );
      await py.runPythonAsync(code, { globals: scope });
      scope.destroy();
      return { output: output || "(aucune sortie)", error: null };
    } catch (err) {
      // On ne garde que la fin du message (la ligne utile du traceback)
      const msg = String(err.message || err);
      const lines = msg.trim().split("\n");
      const idx = lines.findIndex((l) => l.includes('File "<exec>"'));
      const useful = (idx >= 0 ? lines.slice(idx) : lines.slice(-3)).join("\n");
      return { output, error: useful || msg };
    }
  }

  return { runPython, preload: () => getPyodide().catch(() => {}) };
})();
