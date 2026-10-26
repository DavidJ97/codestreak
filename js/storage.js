/* ============================================================================
   storage.js — Petite couche de sauvegarde locale
   ----------------------------------------------------------------------------
   On garde toute la progression (streak, XP, leçons terminées, clé API...)
   dans le localStorage du navigateur. Pas de serveur, pas de compte.

   Pourquoi un "wrapper" plutôt que localStorage directement ?
   -> Dans certains contextes (navigation privée, stockage bloqué), accéder à
      localStorage lance une exception. Ici, on l'attrape et l'app continue
      de fonctionner (la progression ne sera simplement pas mémorisée).
   ========================================================================== */

const Storage = {
  /** Préfixe ajouté à toutes les clés pour ne pas entrer en collision avec d'autres sites. */
  PREFIX: "codestreak:",

  /**
   * Lit une valeur JSON.
   * @param {string} key      Nom de la clé (sans préfixe)
   * @param {*}      fallback Valeur renvoyée si rien n'est enregistré ou en cas d'erreur
   */
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },

  /** Enregistre une valeur (convertie en JSON). */
  set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    } catch (e) {
      /* Stockage indisponible : on ignore silencieusement. */
    }
  },

  /** Supprime une clé (utilisé pour "Réinitialiser ma progression"). */
  remove(key) {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (e) { /* idem */ }
  },
};
