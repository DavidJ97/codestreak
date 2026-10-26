/* ============================================================================
   chat.js — Le tuteur IA (conversation avec Claude)
   ----------------------------------------------------------------------------
   COMMENT ÇA MARCHE
   - L'app est 100 % statique (pas de serveur). Le navigateur appelle donc
     directement l'API d'Anthropic avec TA clé API, saisie dans ⚙️ Réglages.
   - La clé reste dans le localStorage de ton navigateur : elle n'est envoyée
     qu'à api.anthropic.com. Ne publie jamais ta clé dans le code du repo !
   - L'en-tête "anthropic-dangerous-direct-browser-access" est obligatoire
     pour autoriser un appel depuis un navigateur (Anthropic prévient ainsi que
     la clé est visible côté client : OK pour un usage perso).

   Le tuteur connaît le contexte : cours et leçon en cours, exercice raté...
   ========================================================================== */

const Chat = (() => {
  const API_URL = "https://api.anthropic.com/v1/messages";
  const DEFAULT_MODEL = "claude-haiku-5-5"; // rapide et économique, idéal pour un tuteur

  /** Historique de la conversation au format de l'API : [{role, content}] */
  let history = [];
  /** Contexte courant (mis à jour par app.js quand on change d'écran) */
  let context = { course: null, lesson: null };
  let busy = false;

  /* ---------------- Réglages ---------------- */
  const getSettings = () => Storage.get("ai", { apiKey: "", model: DEFAULT_MODEL });
  const saveSettings = (s) => Storage.set("ai", s);
  const hasKey = () => Boolean(getSettings().apiKey);

  /* ---------------- Prompt système ---------------- */
  /**
   * Le "prompt système" donne au modèle son rôle et ses consignes.
   * On y glisse la leçon en cours pour des réponses adaptées.
   */
  function buildSystemPrompt() {
    let prompt =
      "Tu es le tuteur de CodeStreak, une app pour apprendre Python et COBOL. " +
      "Réponds en français, de façon courte, claire et encourageante, comme un bon prof particulier. " +
      "Donne des petits exemples de code dans des blocs ``` quand c'est utile. " +
      "Si l'élève demande la réponse d'un exercice, guide-le d'abord avec un indice avant de tout révéler. " +
      "Pour le COBOL, utilise le format fixe (zone A en colonne 8, zone B en colonne 12) compatible GnuCOBOL. " +
      "Si on te demande de simuler l'exécution d'un programme COBOL, montre exactement la sortie console attendue.";
    if (context.course) prompt += `\n\nCours actuel : ${context.course}.`;
    if (context.lesson) prompt += ` Leçon actuelle : « ${context.lesson} ».`;
    return prompt;
  }

  /* ---------------- Appel à l'API ---------------- */
  async function callClaude() {
    const { apiKey, model } = getSettings();
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        max_tokens: 1024,
        system: buildSystemPrompt(),
        // On n'envoie que les 20 derniers messages pour limiter le coût
        messages: history.slice(-20),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = data.error?.message || res.statusText;
      if (res.status === 401) throw new Error("Clé API invalide. Vérifie-la dans ⚙️ Réglages.");
      throw new Error(`Erreur ${res.status} : ${detail}`);
    }
    // La réponse est une liste de blocs ; on concatène les blocs texte
    return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  }

  /* ---------------- Affichage ---------------- */
  const logEl = () => document.getElementById("chat-log");

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /**
   * Mini-convertisseur Markdown -> HTML (blocs de code, `code`, **gras**, paragraphes).
   * On échappe le HTML d'abord pour éviter toute injection de code dans la page.
   */
  function renderMarkdown(text) {
    const blocks = [];
    let html = escapeHtml(text).replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      blocks.push(`<pre><code>${code.replace(/\n$/, "")}</code></pre>`);
      return `\u0000${blocks.length - 1}\u0000`; // marqueur temporaire
    });
    html = html
      .replace(/`([^`\n]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
    return html.replace(/<p>\u0000(\d+)\u0000<\/p>|\u0000(\d+)\u0000/g, (_, a, b) => blocks[a ?? b]);
  }

  function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.innerHTML = role === "assistant" ? renderMarkdown(text) : escapeHtml(text).replace(/\n/g, "<br>");
    logEl().appendChild(div);
    logEl().scrollTop = logEl().scrollHeight;
    return div;
  }

  function showWelcome() {
    if (logEl().children.length) return;
    addMessage("assistant",
      "Salut ! 👋 Je suis ton tuteur. Pose-moi une question sur **Python** ou **COBOL**, " +
      "demande-moi d'expliquer un exemple, ou de corriger ton code.");
    if (!hasKey()) {
      addMessage("system", "Pour discuter, ajoute ta clé API Anthropic dans ⚙️ Réglages (console.anthropic.com).");
    }
  }

  /* ---------------- Envoi d'un message ---------------- */
  /**
   * Envoie un message à l'IA et affiche la réponse.
   * @param {string} text
   */
  async function send(text) {
    text = text.trim();
    if (!text || busy) return;
    open();

    if (!hasKey()) {
      addMessage("system", "Ajoute d'abord ta clé API dans ⚙️ Réglages.");
      App.openSettings();
      return;
    }

    addMessage("user", text);
    history.push({ role: "user", content: text });

    busy = true;
    const typing = addMessage("assistant", "");
    typing.classList.add("typing");

    try {
      const reply = await callClaude();
      typing.classList.remove("typing");
      typing.innerHTML = renderMarkdown(reply);
      history.push({ role: "assistant", content: reply });
    } catch (err) {
      typing.remove();
      history.pop(); // on retire la question restée sans réponse pour garder un historique valide
      addMessage("system", "⚠️ " + err.message);
    } finally {
      busy = false;
      logEl().scrollTop = logEl().scrollHeight;
    }
  }

  /* ---------------- Ouverture / fermeture du panneau ---------------- */
  function open() {
    document.getElementById("chat").hidden = false;
    showWelcome();
    document.getElementById("chat-input").focus();
  }
  function toggle() {
    const el = document.getElementById("chat");
    if (el.hidden) open(); else el.hidden = true;
  }

  /** Mis à jour par app.js : le tuteur sait sur quelle leçon tu es. */
  function setContext(course, lesson) {
    context = { course, lesson };
    const label = document.getElementById("chat-context");
    if (label) label.textContent = lesson ? `${course} · ${lesson}` : "Pose-moi tes questions sur Python ou COBOL";
  }

  /* ---------------- Initialisation du formulaire ---------------- */
  function init() {
    const form = document.getElementById("chat-form");
    const input = document.getElementById("chat-input");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const t = input.value;
      input.value = "";
      send(t);
    });
    // Entrée = envoyer, Maj+Entrée = nouvelle ligne
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });
  }

  return { init, send, toggle, open, setContext, getSettings, saveSettings, DEFAULT_MODEL };
})();
