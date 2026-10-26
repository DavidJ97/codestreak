/* ============================================================================
   lessons/aieng.js — Cours « AI Engineering »
   ----------------------------------------------------------------------------
   Construire des produits avec des LLM : appels d'API, prompts, RAG, outils
   et agents (MCP), évaluations. Ce sont les compétences que les recruteurs
   filtrent le plus en 2026 (LLM, agents, RAG, vector DB, MCP).

   Références : documentation Claude (Anthropic), « Building effective
   agents » (Anthropic), spécification Model Context Protocol.

   Les exemples sont en Python pur (bibliothèque standard) : ils tournent dans
   le navigateur et simulent le comportement d'un LLM sans clé API.
   ========================================================================== */

window.COURSES = window.COURSES || {};

window.COURSES.aieng = {
  id: "aieng",
  group: "ia",
  name: "AI Engineering",
  badge: "cpu",
  color: { light: "#7048e8", dark: "#9775fa" },
  language: "python",
  run: "python",
  tagline: "Construire avec les LLM : API, prompts, RAG, agents, MCP et évaluations.",
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: "ae-llm",
      title: "Appeler un LLM",
      icon: "chat",
      theory: `
        <h2>Une requête, des messages, des tokens</h2>
        <p>Une API de LLM comme l'API Messages de Claude reçoit :</p>
        <ul>
          <li><code>model</code> : le modèle utilisé.</li>
          <li><code>system</code> : les consignes générales (rôle, ton, règles).</li>
          <li><code>messages</code> : la conversation, une liste alternant <code>"user"</code> et <code>"assistant"</code>.</li>
          <li><code>max_tokens</code> : la longueur maximale de la réponse.</li>
        </ul>
        <p>Un <b>token</b> est un morceau de texte (souvent une partie de mot). On paie à l'usage, en tokens d'<b>entrée</b> et de <b>sortie</b>,
        et la <b>fenêtre de contexte</b> limite la quantité totale de texte que le modèle peut voir.</p>
        <p>Le modèle n'a <b>pas de mémoire</b> entre deux appels : c'est ton application qui renvoie l'historique à chaque fois.</p>`,
      example: `import json

requete = {
    "model": "claude-sonnet-5-5",
    "max_tokens": 300,
    "system": "Tu es un tuteur Python patient. Réponds en français.",
    "messages": [
        {"role": "user", "content": "C'est quoi une liste ?"},
        {"role": "assistant", "content": "Une collection ordonnée et modifiable."},
        {"role": "user", "content": "Et un tuple ?"},
    ],
}
print(json.dumps(requete, indent=2, ensure_ascii=False))

# Estimation de coût (prix fictifs par million de tokens)
def cout(tokens_entree, tokens_sortie, prix_in=3.0, prix_out=15.0):
    return tokens_entree / 1e6 * prix_in + tokens_sortie / 1e6 * prix_out

print(f"Coût estimé : {cout(1200, 300):.5f} $")`,
      sources: [
        { title: "Claude Docs — Messages API", url: "https://docs.claude.com/en/api/messages" },
        { title: "Claude Docs — Context windows", url: "https://docs.claude.com/en/docs/build-with-claude/context-windows" },
      ],
      exercises: [
        { type: "fill", q: "Complète le rôle du message envoyé par la personne :", code: `{"role": "___", "content": "Bonjour"}`, answers: ["user"],
          explain: "Les rôles alternent entre user et assistant ; les consignes globales vont dans system." },
        { type: "mcq", q: "Comment un LLM « se souvient-il » de la conversation ?",
          choices: ["Il garde tout en mémoire sur le serveur", "L'application renvoie l'historique à chaque appel", "Grâce aux cookies", "Il ne s'en souvient jamais"], answer: 1,
          explain: "L'API est sans état : l'historique fait partie de chaque requête." },
        { type: "mcq", q: "Que limite max_tokens ?", choices: ["La taille de la question", "La longueur de la réponse", "Le nombre d'utilisateurs", "Le prix par mois"], answer: 1,
          explain: "max_tokens plafonne les tokens générés en sortie." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "ae-prompt",
      title: "Prompt engineering pro",
      icon: "edit",
      theory: `
        <h2>Un prompt, c'est une spécification</h2>
        <p>Les techniques recommandées par la documentation de Claude, par ordre d'impact :</p>
        <ul>
          <li><b>Être clair et direct</b> : contexte, objectif, public, format attendu. Comme si tu briefais un collègue brillant qui ne connaît rien au projet.</li>
          <li><b>Donner des exemples</b> (few-shot) : 2 à 5 exemples variés valent mieux qu'un long discours.</li>
          <li><b>Structurer avec des balises XML</b> : <code>&lt;document&gt;</code>, <code>&lt;consignes&gt;</code>, <code>&lt;exemple&gt;</code> séparent clairement les parties.</li>
          <li><b>Laisser réfléchir</b> avant de répondre pour les tâches complexes.</li>
          <li><b>Imposer un format de sortie</b> (JSON, liste) quand la réponse est lue par du code.</li>
        </ul>
        <p>En production, un prompt est du <b>code</b> : il est versionné dans Git, testé par des evals, et modifié un changement à la fois.</p>`,
      example: `def construire_prompt(texte, langue_cible="fr-CA"):
    """Gabarit de prompt structuré avec balises XML et exemples."""
    return f"""Tu traduis des messages de support client.

<consignes>
- Langue cible : {langue_cible}
- Garde le vouvoiement et les noms de produits tels quels.
- Réponds uniquement avec la traduction.
</consignes>

<exemples>
<exemple><source>Your order has shipped.</source><traduction>Votre commande a été expédiée.</traduction></exemple>
<exemple><source>Reset your password here.</source><traduction>Réinitialisez votre mot de passe ici.</traduction></exemple>
</exemples>

<source>{texte}</source>"""

print(construire_prompt("Your refund was approved."))`,
      sources: [
        { title: "Claude Docs — Prompt engineering overview", url: "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview" },
      ],
      exercises: [
        { type: "mcq", q: "Pourquoi utiliser des balises XML dans un prompt ?",
          choices: ["C'est obligatoire", "Pour séparer clairement consignes, documents et exemples", "Pour accélérer le réseau", "Pour chiffrer le prompt"], answer: 1,
          explain: "Les balises évitent que le modèle confonde les consignes et le contenu à traiter." },
        { type: "mcq", q: "Combien d'exemples variés donner, en général, pour du few-shot ?", choices: ["0", "2 à 5", "100", "Un seul identique répété"], answer: 1,
          explain: "Quelques exemples diversifiés montrent le format et couvrent les cas limites." },
        { type: "mcq", q: "En production, comment traiter un prompt ?",
          choices: ["Le modifier directement en ligne sans trace", "Comme du code : versionné et testé par des evals", "Le cacher dans une image", "Le réécrire à chaque requête"], answer: 1,
          explain: "Un prompt non testé est un bug qui attend son heure." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "ae-rag",
      title: "RAG : brancher des connaissances",
      icon: "layers",
      theory: `
        <h2>Retrieval-Augmented Generation</h2>
        <p>Le modèle ne connaît pas tes documents internes. Le <b>RAG</b> les lui fournit au moment de la question :</p>
        <ol>
          <li><b>Découper</b> les documents en passages (<i>chunks</i>).</li>
          <li><b>Vectoriser</b> chaque passage avec un modèle d'<b>embeddings</b> (une liste de nombres qui représente le sens).</li>
          <li><b>Stocker</b> les vecteurs dans une base vectorielle (pgvector, Chroma…).</li>
          <li>À chaque question : vectoriser la question, <b>chercher les k passages les plus proches</b> (similarité cosinus).</li>
          <li><b>Insérer</b> ces passages dans le prompt et demander une réponse <b>avec citations</b>.</li>
        </ol>
        <p>On évalue séparément la <b>recherche</b> (le bon passage est-il dans le top k ? → <i>recall@k</i>) et la <b>réponse</b>
        (est-elle exacte et fidèle aux sources ?).</p>`,
      example: `import math
from collections import Counter

docs = {
    "d1": "La streak augmente quand on termine une leçon chaque jour.",
    "d2": "Un gel protège la streak si on manque une journée.",
    "d3": "Le COBOL utilise la clause PIC pour décrire les données.",
}

def vecteur(texte):
    # Vrai RAG : un modèle d'embeddings. Ici : un simple sac de mots.
    return Counter(texte.lower().replace(".", "").split())

def cosinus(a, b):
    commun = set(a) & set(b)
    num = sum(a[m] * b[m] for m in commun)
    den = math.sqrt(sum(v * v for v in a.values())) * math.sqrt(sum(v * v for v in b.values()))
    return num / den if den else 0.0

question = "que se passe-t-il si je manque une journée ?"
q = vecteur(question)
classement = sorted(docs, key=lambda d: cosinus(q, vecteur(docs[d])), reverse=True)
for d in classement:
    print(d, round(cosinus(q, vecteur(docs[d])), 3), docs[d])`,
      sources: [
        { title: "Claude Docs — Embeddings", url: "https://docs.claude.com/en/docs/build-with-claude/embeddings" },
        { title: "Anthropic — Contextual Retrieval", url: "https://www.anthropic.com/news/contextual-retrieval" },
      ],
      exercises: [
        { type: "order", q: "Remets le pipeline RAG dans l'ordre :",
          lines: ["Découper les documents", "Calculer les embeddings", "Stocker dans une base vectorielle", "Chercher les passages proches de la question", "Générer la réponse avec citations"],
          explain: "Indexation (3 premières étapes) puis requête (2 dernières)." },
        { type: "mcq", q: "Que mesure le recall@k ?",
          choices: ["Le coût par requête", "Si le bon passage est parmi les k premiers résultats", "La vitesse du modèle", "Le nombre de tokens"], answer: 1,
          explain: "Si la recherche rate le bon passage, même le meilleur modèle répondra mal." },
        { type: "mcq", q: "Quelle mesure compare deux vecteurs d'embeddings ?", choices: ["La moyenne", "La similarité cosinus", "Le modulo", "La longueur du texte"], answer: 1,
          explain: "Le cosinus mesure l'angle entre deux vecteurs : proche de 1 = sens proche." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "ae-tools",
      title: "Outils, agents et MCP",
      icon: "blocks",
      theory: `
        <h2>Donner des mains au modèle</h2>
        <p>Avec le <b>tool use</b>, tu décris des outils (nom, description, schéma JSON des paramètres). Le modèle répond
        en demandant un appel (<code>tool_use</code>), <b>ton code l'exécute</b>, puis renvoie le résultat (<code>tool_result</code>).</p>
        <p>Anthropic distingue les <b>workflows</b> (chemins définis par ton code) des <b>agents</b> (le modèle décide lui-même
        des étapes). Cinq patterns de workflow : <b>chaînage</b>, <b>routage</b>, <b>parallélisation</b>,
        <b>orchestrateur-travailleurs</b>, <b>évaluateur-optimiseur</b>. Règle d'or : commencer simple, ajouter de la complexité
        seulement si elle améliore les résultats mesurés.</p>
        <p>Le <b>Model Context Protocol (MCP)</b> est un protocole ouvert qui standardise la connexion entre une application IA
        et des sources externes : un <b>serveur MCP</b> expose des <b>outils</b>, des <b>ressources</b> et des <b>prompts</b>,
        qu'un client (Claude, un IDE…) peut utiliser.</p>
        <div class="tip">Soigne les descriptions d'outils comme une interface : Anthropic parle d'<b>ACI</b> (agent-computer interface).
        Un paramètre ambigu fait plus d'erreurs qu'un modèle faible.</div>`,
      example: `# Simulation d'une boucle d'agent : le "modèle" choisit un outil, le code l'exécute.
OUTILS = {
    "meteo": lambda ville: f"{ville} : 4 °C, nuageux",
    "convertir": lambda c: f"{c} °C = {c * 9 / 5 + 32:.1f} °F",
}

def faux_modele(historique):
    """Remplace un vrai LLM : décide de la prochaine action."""
    if not any(m["type"] == "tool_result" for m in historique):
        return {"type": "tool_use", "name": "meteo", "input": "Montréal"}
    if sum(m["type"] == "tool_result" for m in historique) == 1:
        return {"type": "tool_use", "name": "convertir", "input": 4}
    return {"type": "text", "text": "Il fait 4 °C (39,2 °F) à Montréal."}

historique = [{"type": "user", "text": "Quel temps à Montréal, en Fahrenheit ?"}]
for tour in range(5):                      # limite de tours : garde-fou
    action = faux_modele(historique)
    if action["type"] == "text":
        print("Réponse :", action["text"]); break
    resultat = OUTILS[action["name"]](action["input"])
    print(f"Outil {action['name']}({action['input']}) -> {resultat}")
    historique.append({"type": "tool_result", "content": resultat})`,
      sources: [
        { title: "Anthropic — Building effective agents", url: "https://www.anthropic.com/research/building-effective-agents" },
        { title: "Claude Docs — Tool use", url: "https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview" },
        { title: "Model Context Protocol", url: "https://modelcontextprotocol.io/" },
      ],
      exercises: [
        { type: "order", q: "Remets la boucle d'appel d'outil dans l'ordre :",
          lines: ["L'application envoie la question et la liste des outils", "Le modèle répond par un tool_use", "Le code exécute l'outil", "Le code renvoie un tool_result", "Le modèle rédige la réponse finale"],
          explain: "Le modèle ne fait que demander ; c'est ton code qui exécute (et qui contrôle)." },
        { type: "mcq", q: "Un LLM classe le message puis l'envoie au bon prompt spécialisé. Quel pattern ?",
          choices: ["Chaînage", "Routage", "Parallélisation", "Évaluateur-optimiseur"], answer: 1,
          explain: "Le routage aiguille chaque entrée vers le traitement adapté." },
        { type: "mcq", q: "Que peut exposer un serveur MCP ?", choices: ["Uniquement des images", "Des outils, des ressources et des prompts", "Seulement des mots de passe", "Des pages web statiques"], answer: 1,
          explain: "Ce sont les trois primitives côté serveur du protocole." },
        { type: "mcq", q: "Selon Anthropic, par quoi commencer ?", choices: ["Un framework multi-agents complexe", "La solution la plus simple qui marche", "Dix agents en parallèle", "Un modèle entraîné maison"], answer: 1,
          explain: "On ajoute de la complexité seulement si elle améliore des résultats mesurés." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "ae-evals",
      title: "Évaluations (evals)",
      icon: "target",
      theory: `
        <h2>Prouver que ça marche</h2>
        <p>La question qu'on te posera en entretien : <b>« Comment as-tu évalué ton système ? »</b></p>
        <p><b>1. Critères de succès</b> spécifiques, mesurables, atteignables et pertinents :
        pas « bonne qualité » mais « 90 % de réponses exactes sur 200 questions, latence &lt; 3 s, coût &lt; 0,01 $ par requête ».</p>
        <p><b>2. Jeu d'évaluation</b> qui ressemble aux vraies questions, avec des <b>cas limites</b> (hors sujet, ambigu, malveillant, très long).
        Mieux vaut beaucoup de cas notés automatiquement que quelques cas notés à la main.</p>
        <p><b>3. Méthodes de notation</b> :</p>
        <ul>
          <li><b>Par code</b> : correspondance exacte, regex, JSON valide — rapide et fiable.</li>
          <li><b>Par LLM</b> (LLM-as-judge) : pour le ton ou la fidélité. Grille claire, sortie contrainte (« oui/non », note 1-5), idéalement un autre modèle.</li>
          <li><b>Humaine</b> : la plus juste, la plus lente — pour calibrer les deux autres.</li>
        </ul>
        <p><b>4. Intégration continue</b> : les evals tournent à chaque changement de prompt ou de modèle, comme des tests unitaires.</p>`,
      example: `jeu_eval = [
    {"texte": "J'adore cette app !", "attendu": "positif"},
    {"texte": "Ça plante tout le temps.", "attendu": "negatif"},
    {"texte": "C'est correct, sans plus.", "attendu": "neutre"},
    {"texte": "Pas mal du tout", "attendu": "positif"},   # cas piège (négation)
]

def faux_classifieur(texte):
    # À remplacer par un appel au LLM
    t = texte.lower()
    if "pas" in t or "plante" in t:
        return "negatif"
    if "adore" in t:
        return "positif"
    return "neutre"

def exact(sortie, attendu):
    return sortie.strip().lower() == attendu

resultats = [exact(faux_classifieur(c["texte"]), c["attendu"]) for c in jeu_eval]
print(f"Exactitude : {sum(resultats)}/{len(resultats)} = {sum(resultats) / len(resultats):.0%}")
for cas, ok in zip(jeu_eval, resultats):
    if not ok:
        print("Échec :", cas["texte"])`,
      sources: [
        { title: "Claude Docs — Define success criteria and build evaluations", url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests" },
      ],
      exercises: [
        { type: "mcq", q: "Lequel est un bon critère de succès ?",
          choices: ["Le modèle doit être bon", "90 % d'exactitude sur 200 questions réelles", "Les utilisateurs doivent être contents", "Aucune erreur jamais"], answer: 1,
          explain: "Spécifique et mesurable, donc vérifiable automatiquement." },
        { type: "mcq", q: "Pour un juge LLM, quelle pratique est recommandée ?",
          choices: ["Le laisser répondre librement", "Contraindre sa sortie (oui/non, note 1-5) avec une grille", "Utiliser exactement le même prompt que la génération", "Ne jamais vérifier ses notes"], answer: 1,
          explain: "Une sortie contrainte et validée rend la note fiable et analysable." },
        { type: "mcq", q: "Plutôt beaucoup de cas notés automatiquement, ou peu de cas notés à la main ?",
          choices: ["Beaucoup de cas automatiques", "Peu de cas à la main", "Aucun cas", "Seulement des cas faciles"], answer: 0,
          explain: "Le volume donne un signal stable ; la notation humaine sert à calibrer." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "ae-prod",
      title: "Context engineering et production",
      icon: "gauge",
      theory: `
        <h2>Du prototype à l'app qui tient la charge</h2>
        <p><b>Le contexte est une ressource limitée.</b> Plus on remplit la fenêtre de contexte, plus l'attention du modèle se dilue.
        Le <b>context engineering</b> consiste à fournir le plus petit ensemble d'informations utiles à chaque étape :</p>
        <ul>
          <li>un prompt système clair, des <b>outils peu nombreux</b> et sans ambiguïté, quelques exemples bien choisis ;</li>
          <li>la récupération <b>juste à temps</b> (chercher un document quand il devient utile, au lieu de tout charger) ;</li>
          <li>la <b>compaction</b> : résumer l'historique ancien et garder les derniers échanges ;</li>
          <li>des <b>notes externes</b> (fichier, base) pour les longues tâches d'agent.</li>
        </ul>
        <p><b>En production</b>, on ajoute :</p>
        <ul>
          <li><b>Mise en cache du prompt</b> pour les longs préfixes répétés (moins cher, plus rapide).</li>
          <li><b>Routage</b> : un petit modèle rapide pour les tâches simples, un grand pour le raisonnement.</li>
          <li><b>Réessais avec délai exponentiel</b> (et un peu d'aléatoire) sur les erreurs de surcharge ou de limite de débit.</li>
          <li><b>Quotas par utilisateur</b> contre la consommation non bornée (OWASP LLM10).</li>
          <li><b>Observabilité</b> : tracer prompt, outils appelés, latence, coût et résultat des evals à chaque requête.</li>
        </ul>`,
      example: `import random

# 1. Compaction : un résumé + les 5 derniers messages
#    (le résumé "user" est suivi d'un message "assistant" : les rôles alternent toujours)
historique = [{"role": "user" if i % 2 == 0 else "assistant", "content": f"message {i}"} for i in range(12)]

def compacter(messages, garder=5):
    anciens, recents = messages[:-garder], messages[-garder:]
    resume = f"Résumé de {len(anciens)} messages précédents."
    return [{"role": "user", "content": resume}] + recents

compact = compacter(historique)
print(len(historique), "messages →", len(compact))
for m in compact:
    print(" ", m["role"], ":", m["content"])

# 2. Réessais avec délai exponentiel + aléatoire (jitter)
random.seed(1)
base = 0.5  # secondes
for tentative in range(5):
    delai = base * 2 ** tentative
    attente = delai + random.uniform(0, delai / 2)
    print(f"Tentative {tentative + 1} : attendre {attente:.2f} s")`,
      sources: [
        { title: "Anthropic — Effective context engineering for AI agents", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents" },
        { title: "Claude Docs — Prompt caching", url: "https://docs.claude.com/en/docs/build-with-claude/prompt-caching" },
        { title: "OWASP — Top 10 for LLM Applications 2025 (LLM10 Unbounded Consumption)", url: "https://genai.owasp.org/llm-top-10/" },
      ],
      exercises: [
        { type: "mcq", q: "Pourquoi ne pas mettre « tout » dans le contexte ?",
          choices: ["C'est interdit par l'API", "L'attention du modèle se dilue et le coût augmente", "Le modèle refuse les longs textes", "Ça n'a aucun effet"], answer: 1,
          explain: "Le contexte est une ressource finie : viser les tokens à fort signal." },
        { type: "fill", q: "Complète la formule du délai exponentiel :", code: `delai = base * 2 ** ___`, answers: ["tentative"],
          explain: "Le délai double à chaque tentative : 0,5 s, 1 s, 2 s, 4 s…" },
        { type: "mcq", q: "Quel est l'intérêt de la mise en cache du prompt ?",
          choices: ["Réduire coût et latence sur un long préfixe répété", "Rendre le modèle plus créatif", "Chiffrer les données", "Augmenter max_tokens"], answer: 0,
          explain: "Le préfixe déjà traité (consignes, documents) est réutilisé d'un appel à l'autre." },
        { type: "order", q: "Remets la compaction dans l'ordre :",
          lines: ["Séparer anciens et récents messages", "Résumer les anciens messages", "Envoyer le résumé suivi des messages récents"],
          explain: "On garde le fil de la conversation en économisant le contexte." },
      ],
    },
  ],
};
