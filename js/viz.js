/* ============================================================================
   viz.js — Illustrations interactives des leçons (« apprendre en faisant »)
   ----------------------------------------------------------------------------
   Inspiré de la pédagogie de Brilliant : un modèle visuel qu'on manipule,
   une étape à la fois, et des questions où l'on PRÉDIT avant de voir le
   résultat. Une mauvaise réponse ne bloque pas : on explique pourquoi.

   Cinq types de scènes (les données de chaque leçon sont dans visuals.js) :
     trace   : du code exécuté pas à pas, avec la mémoire (variables) et la console
     flow    : un schéma de blocs reliés (pipeline, cycle, pile)
     cells   : des cases indexées (caractères, colonnes, tokens)
     slider  : des curseurs qui modifient le modèle en direct
     compare : deux versions d'une interface, A et B, à comparer

   Une étape peut contenir une question { q, choices, answer, why }.
   Tant qu'elle n'est pas résolue, la scène affiche l'état AVANT l'étape :
   on doit prédire, puis on voit.
   ========================================================================== */

const Viz = (() => {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /** Type Python d'une valeur affichée (pour la petite étiquette sous la case). */
  function typeOf(v) {
    if (Array.isArray(v)) return "list";
    if (v && typeof v === "object") return v.$t || "dict";
    const s = String(v);
    if (s === "True" || s === "False") return "bool";
    if (s === "None") return "NoneType";
    if (/^-?\d+$/.test(s)) return "int";
    if (/^-?\d+\.\d+$/.test(s)) return "float";
    if (/^["']/.test(s)) return "str";
    if (s.startsWith("(")) return "tuple";
    if (s.startsWith("{")) return "set";
    return "";
  }

  /* ---------------------------------------------------------------------- */
  /* Scènes                                                                  */
  /* ---------------------------------------------------------------------- */

  /** Une valeur dans la mémoire : texte, liste en cases indexées, ou dictionnaire. */
  function valueHtml(v, base) {
    if (Array.isArray(v)) {
      return `<span class="vz-list">${v.map((x, i) => `<span class="vz-slot"><b>${esc(x)}</b><i>${i + base}</i></span>`).join("") || "<em>vide</em>"}</span>`;
    }
    if (v && typeof v === "object" && !("$v" in v)) {
      return `<span class="vz-dict">${Object.entries(v).map(([k, x]) => `<span><i>${esc(k)}</i><b>${esc(x)}</b></span>`).join("")}</span>`;
    }
    return `<span class="vz-val">${esc(v && typeof v === "object" ? v.$v : v)}</span>`;
  }

  function sceneTrace(spec, st, prev) {
    const code = spec.code.map((line, i) => `
      <li class="${i === st.line ? "on" : ""}${st.skip && i === st.line ? " skip" : ""}">
        <span class="ln">${i + 1}</span><code>${esc(line) || "&nbsp;"}</code>
      </li>`).join("");
    const names = Object.keys(st.vars);
    const mem = names.length
      ? names.map((n) => {
        const v = st.vars[n];
        const changed = !st.pending && JSON.stringify(prev.vars[n]) !== JSON.stringify(v);
        const t = spec.types === false ? "" : typeOf(v);
        return `<div class="vz-box${changed ? " chg" : ""}"><span class="vz-name">${esc(n)}</span>${valueHtml(v, spec.base || 0)}${t ? `<span class="vz-type">${esc(t)}</span>` : ""}</div>`;
      }).join("")
      : `<p class="vz-empty">La mémoire est vide.</p>`;
    return `
      <div class="vz-trace">
        <ol class="vz-code">${code}</ol>
        <div class="vz-mem"><span class="vz-cap">${esc(spec.memLabel || "Mémoire")}</span><div class="vz-boxes">${mem}</div></div>
      </div>
      <div class="vz-console"><span class="vz-cap">Console</span><pre>${esc(st.out.join("\n")) || " "}</pre></div>`;
  }

  function sceneFlow(spec, st) {
    const layout = spec.layout || "row";
    const n = spec.nodes.length;
    const nodes = spec.nodes.map((node, i) => {
      let pos = "";
      if (layout === "cycle") {
        const a = (i / n) * 2 * Math.PI - Math.PI / 2;
        pos = `style="left:${50 + 38 * Math.cos(a)}%;top:${50 + 38 * Math.sin(a)}%"`;
      }
      const on = (st.on || []).includes(node.id);
      const bad = (st.bad || []).includes(node.id);
      return `${layout === "cycle" ? "" : '<span class="vz-pair">'}<div class="vz-node${on ? " on" : ""}${bad ? " bad" : ""}" ${pos}>
          <span class="vz-node-ico">${icon(node.icon || "box", 20)}</span>
          <span class="vz-node-label">${esc(node.label)}</span>
          ${node.sub ? `<span class="vz-node-sub">${esc(node.sub)}</span>` : ""}
        </div>${layout !== "cycle" && i < n - 1 ? `<span class="vz-arrow">${icon(layout === "stack" ? "arrow-down" : "arrow-right", 18)}</span>` : ""}${layout === "cycle" ? "" : "</span>"}`;
    }).join("");
    return `<div class="vz-flow vz-flow--${layout}">${layout === "cycle" ? `<svg class="vz-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="38"/></svg>` : ""}${nodes}</div>`;
  }

  function sceneCells(spec, st) {
    const tokens = st.tokens || [...spec.text];
    const base = spec.base || 0;
    const [a, b] = st.hi || [-1, -2];
    const zone = (i) => (spec.zones || []).find((z) => i + base >= z.from && i + base <= z.to);
    const cells = tokens.map((t, i) => {
      const z = zone(i);
      return `<span class="vz-cell${i >= a && i <= b ? " on" : ""}${z ? ` z-${z.tone}` : ""}${t === " " ? " sp" : ""}">
        ${spec.index !== false ? `<i>${i + base}</i>` : ""}<b>${t === " " ? "·" : esc(t)}</b>${spec.neg ? `<i class="neg">${i - tokens.length}</i>` : ""}
      </span>`;
    }).join("");
    const legend = (spec.zones || []).map((z) => `<span class="vz-zone z-${z.tone}">${esc(z.label)}</span>`).join("");
    return `<div class="vz-cells-wrap"><div class="vz-cells">${cells}</div></div>${legend ? `<div class="vz-legend">${legend}</div>` : ""}
      ${st.label ? `<p class="vz-result">${st.label}</p>` : ""}`;
  }

  function sceneSlider(spec, values) {
    const controls = spec.params.map((p) => {
      const v = values[p.id];
      if (p.labels) {
        return `<div class="vz-ctrl"><span class="vz-cap">${esc(p.label)}</span>
          <div class="vz-seg" role="radiogroup" aria-label="${esc(p.label)}">${p.labels.map((l, i) => `<button type="button" role="radio" aria-checked="${i === v}" class="${i === v ? "on" : ""}" data-param="${p.id}" data-value="${i}">${esc(l)}</button>`).join("")}</div></div>`;
      }
      return `<div class="vz-ctrl"><label class="vz-cap" for="vz-${p.id}">${esc(p.label)} <b>${v}${p.unit || ""}</b></label>
        <input id="vz-${p.id}" type="range" min="${p.min}" max="${p.max}" step="${p.step || 1}" value="${v}" data-param="${p.id}"></div>`;
    }).join("");
    return `<div class="vz-sliders">${controls}</div><div class="vz-out">${spec.compute(values)}</div>`;
  }

  function sceneCompare(spec, st) {
    const side = st.show || "a";
    return `
      <div class="vz-tabs" role="tablist">
        <button type="button" role="tab" aria-selected="${side === "a"}" class="${side === "a" ? "on" : ""}" data-side="a">${esc(spec.a.label)}</button>
        <button type="button" role="tab" aria-selected="${side === "b"}" class="${side === "b" ? "on" : ""}" data-side="b">${esc(spec.b.label)}</button>
      </div>
      <div class="vz-mock">${spec[side].html}</div>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Moteur : étapes, questions, navigation                                  */
  /* ---------------------------------------------------------------------- */

  /**
   * Monte une illustration dans `el`.
   * @param {HTMLElement} el
   * @param {object} spec   données de la scène (visuals.js)
   * @param {object} opts   { onDone }
   */
  function mount(el, spec, opts = {}) {
    const steps = spec.steps && spec.steps.length ? spec.steps : [{}];
    let i = 0;
    let side = null;          // onglet choisi à la main (compare)
    const answered = {};      // index d'étape -> true
    const tries = {};         // index d'étape -> nombre d'erreurs
    let feedback = "";
    let done = false;
    const values = {};
    (spec.params || []).forEach((p) => { values[p.id] = p.value; });

    // États cumulés (trace) : chaque étape part de l'état précédent
    const states = [];
    let acc = { vars: { ...(spec.vars || {}) }, out: [] };
    steps.forEach((s) => {
      const vars = { ...acc.vars };
      Object.entries(s.vars || {}).forEach(([k, v]) => { if (v === null) delete vars[k]; else vars[k] = v; });
      acc = { ...s, vars, out: s.out !== undefined ? [...acc.out, ...[].concat(s.out)] : [...acc.out] };
      states.push(acc);
    });

    function shown() {
      const s = states[i];
      const before = i > 0 ? states[i - 1] : { vars: { ...(spec.vars || {}) }, out: [] };
      if (s.ask && !answered[i]) {
        // On montre l'état d'avant : il faut prédire
        return { ...before, line: s.line, on: before.on, hi: s.hi, tokens: before.tokens || s.tokensBefore, show: s.show, pending: true };
      }
      return s;
    }

    function stage() {
      const st = shown();
      const prev = i > 0 ? states[i - 1] : { vars: spec.vars || {} };
      switch (spec.type) {
        case "trace": return sceneTrace(spec, st, prev);
        case "flow": return sceneFlow(spec, st);
        case "cells": return sceneCells(spec, st);
        case "slider": return sceneSlider(spec, values);
        case "compare": return sceneCompare(spec, { show: side || st.show });
        default: return "";
      }
    }

    function render() {
      const s = steps[i];
      const ask = s.ask || (spec.type === "slider" ? spec.ask : null);
      const solved = answered[i];
      const last = i === steps.length - 1;
      const blocked = ask && !solved;
      const note = (s.ask && !solved) ? (s.before || "") : (s.note || spec.note || "");
      el.innerHTML = `
        <header class="vz-head">
          <span class="vz-badge">${icon("hand", 15)}À toi de jouer</span>
          <span class="vz-title">${esc(spec.title || "")}</span>
          ${steps.length > 1 ? `<span class="vz-dots" aria-label="Étape ${i + 1} sur ${steps.length}">${steps.map((_, k) => `<i class="${k < i ? "past" : k === i ? "now" : ""}"></i>`).join("")}</span>` : ""}
        </header>
        <div class="vz-stage vz-stage--${spec.type}">${stage()}</div>
        ${note ? `<p class="vz-note" aria-live="polite">${note}</p>` : ""}
        ${ask ? `
          <div class="vz-ask${solved ? " solved" : ""}">
            <p class="vz-q">${icon(solved ? "check-circle" : "help", 18)}<span>${esc(ask.q)}</span></p>
            <div class="vz-choices">${ask.choices.map((c, k) => `<button type="button" class="vz-choice${solved && k === ask.answer ? " right" : ""}" data-choice="${k}" ${solved ? "disabled" : ""}>${esc(c)}</button>`).join("")}</div>
            ${feedback ? `<p class="vz-feedback">${feedback}</p>` : ""}
          </div>` : ""}
        <footer class="vz-foot">
          ${steps.length > 1 ? `<button type="button" class="btn btn-sm btn-line" data-nav="prev" ${i === 0 ? "disabled" : ""}>${icon("arrow-left", 14)}Retour</button>` : "<span></span>"}
          ${done && last ? `<span class="vz-done">${icon("check", 14)}Exploré</span>` : ""}
          <button type="button" class="btn btn-sm" data-nav="next" ${blocked ? "disabled" : ""}>${last ? (done ? "Recommencer" : "Terminer") : "Continuer"} ${icon(last && done ? "rotate" : "arrow-right", 14)}</button>
        </footer>`;
    }

    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || !el.contains(b)) return;
      const s = steps[i];
      const ask = s.ask || (spec.type === "slider" ? spec.ask : null);
      if (b.dataset.choice !== undefined && ask) {
        const k = Number(b.dataset.choice);
        if (k === ask.answer) {
          answered[i] = true;
          feedback = `<b>Exact.</b> ${ask.why || ""}`;
        } else {
          tries[i] = (tries[i] || 0) + 1;
          if (tries[i] >= 2) {
            answered[i] = true;
            feedback = `<b>La bonne réponse : ${esc(ask.choices[ask.answer])}.</b> ${ask.why || ""}`;
          } else {
            feedback = `<b>Pas tout à fait.</b> ${ask.hint || "Regarde bien le schéma et réessaie."}`;
            render();
            el.querySelector(`.vz-choice[data-choice="${k}"]`)?.classList.add("wrong");
            return;
          }
        }
        render();
        return;
      }
      if (b.dataset.side) { side = b.dataset.side; render(); return; }
      if (b.dataset.param) { values[b.dataset.param] = Number(b.dataset.value); render(); return; }
      if (b.dataset.nav === "prev" && i > 0) { i--; side = null; feedback = ""; render(); }
      if (b.dataset.nav === "next") {
        if (i < steps.length - 1) { i++; side = null; feedback = ""; render(); }
        else if (!done) { done = true; render(); opts.onDone && opts.onDone(); }
        else { i = 0; done = false; side = null; feedback = ""; Object.keys(answered).forEach((k) => delete answered[k]); Object.keys(tries).forEach((k) => delete tries[k]); render(); }
      }
    });

    // Curseurs : la scène se met à jour en direct
    el.addEventListener("input", (e) => {
      const p = e.target.dataset.param;
      if (!p) return;
      values[p] = Number(e.target.value);
      el.querySelector(".vz-out").innerHTML = spec.compute(values);
      const label = el.querySelector(`label[for="vz-${p}"] b`);
      const def = spec.params.find((x) => x.id === p);
      if (label) label.textContent = values[p] + (def.unit || "");
    });

    render();
  }

  return { mount, esc };
})();
window.Viz = Viz;
