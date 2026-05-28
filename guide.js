const GUIDE_STORAGE_KEY = "progression365.v1.locale";

const guideTranslations = {
  fr: {
    "meta.title": "Guide Day++",
    "meta.description": "Guide d'utilisation de Day++.",
    "guide.title": "Guide",
    "guide.back": "Retour",
    "guide.heroTitle": "Un jour à la fois.",
    "guide.heroText":
      "Day++ découpe un objectif long en vues plus petites pour garder le cerveau concentré sur l'action du jour.",
    "guide.quickStartTitle": "Démarrage rapide",
    "guide.quickStart1": "Choisis un objectif, une durée et une date de début.",
    "guide.quickStart2":
      "Ouvre la vue Jour et maintiens le bouton pendant 5 secondes.",
    "guide.quickStart3":
      "Après validation, consulte la semaine puis navigue vers les vues plus longues.",
    "guide.quickStart4": "Installe la PWA pour l'utiliser hors ligne.",
    "guide.viewsTitle": "Comprendre les vues",
    "guide.dayTitle": "Jour",
    "guide.dayText":
      "La vue principale. Ton objectif devient simplement : valider aujourd'hui.",
    "guide.weekTitle": "Semaine",
    "guide.weekText":
      "Une progression courte de 7 jours, utile pour voir que tu avances sans afficher toute l'année.",
    "guide.monthTitle": "Mois, trimestre, semestre",
    "guide.monthText":
      "Ces vues servent à prendre du recul sans transformer le défi en montagne.",
    "guide.yearTitle": "Année",
    "guide.yearText":
      "La vue annuelle est pensée pour les captures d'écran et le bilan global.",
    "guide.settingsTitle": "Réglages utiles",
    "guide.durationTitle": "Durée",
    "guide.durationText":
      "Tu peux choisir une semaine, un mois, un trimestre, un semestre ou une année personnalisée.",
    "guide.modeTitle": "Mode strict / souple",
    "guide.modeText":
      "Le mode strict valide depuis la vue Jour. Le mode souple permet aussi de corriger les jours passés.",
    "guide.multiTitle": "Plusieurs progressions",
    "guide.multiText":
      "Crée plusieurs objectifs, chacun avec son nom, ses dates, son thème et ses validations.",
    "guide.reminderTitle": "Rappels",
    "guide.reminderText":
      "Active les notifications et la vibration si ton navigateur les supporte.",
    "guide.dataTitle": "Données et hors ligne",
    "guide.data1": "Les progressions sont stockées localement dans IndexedDB.",
    "guide.data2": "L'app fonctionne hors ligne après le premier chargement.",
    "guide.data3":
      "Utilise Sauvegarder / Restaurer pour transférer tes données vers un autre appareil ou navigateur.",
    "guide.data4":
      "Chrome et la PWA partagent les données si elles viennent de la même URL GitHub Pages.",
    "guide.note":
      "Le meilleur rythme est volontairement simple : ne gagne pas l'année aujourd'hui, gagne seulement aujourd'hui.",
  },
  en: {
    "meta.title": "Day++ Guide",
    "meta.description": "How to use Day++.",
    "guide.title": "Guide",
    "guide.back": "Back",
    "guide.heroTitle": "One day at a time.",
    "guide.heroText":
      "Day++ breaks a long goal into smaller views so your brain stays focused on today's action.",
    "guide.quickStartTitle": "Quick start",
    "guide.quickStart1": "Choose a goal, a duration, and a start date.",
    "guide.quickStart2": "Open the Day view and hold the button for 5 seconds.",
    "guide.quickStart3":
      "After validation, check the week and then move into longer views when you want context.",
    "guide.quickStart4": "Install the PWA to use it offline.",
    "guide.viewsTitle": "Understand the views",
    "guide.dayTitle": "Day",
    "guide.dayText": "The main view. Your goal becomes simple: validate today.",
    "guide.weekTitle": "Week",
    "guide.weekText":
      "A short 7-day progress view, useful for seeing momentum without showing the whole year.",
    "guide.monthTitle": "Month, quarter, semester",
    "guide.monthText":
      "These views give you perspective without turning the challenge into a mountain.",
    "guide.yearTitle": "Year",
    "guide.yearText":
      "The yearly view is designed for screenshots and global review.",
    "guide.settingsTitle": "Useful settings",
    "guide.durationTitle": "Duration",
    "guide.durationText":
      "Choose a week, month, quarter, semester, or a custom year.",
    "guide.modeTitle": "Strict / flexible mode",
    "guide.modeText":
      "Strict mode validates from the Day view. Flexible mode also lets you correct past days.",
    "guide.multiTitle": "Multiple progressions",
    "guide.multiText":
      "Create several goals, each with its own name, dates, theme, and validations.",
    "guide.reminderTitle": "Reminders",
    "guide.reminderText":
      "Enable notifications and vibration if your browser supports them.",
    "guide.dataTitle": "Data and offline use",
    "guide.data1": "Progressions are stored locally in IndexedDB.",
    "guide.data2": "The app works offline after the first load.",
    "guide.data3":
      "Use Backup / Restore to move your data to another device or browser.",
    "guide.data4":
      "Chrome and the PWA share data when they come from the same GitHub Pages URL.",
    "guide.note":
      "The best rhythm is intentionally simple: do not win the year today, win only today.",
  },
};

function guideRequestedLocale() {
  const lang = new URLSearchParams(window.location.search).get("lang");
  return lang === "en" || lang === "fr" ? lang : null;
}

function guideSavedLocale() {
  try {
    const saved = localStorage.getItem(GUIDE_STORAGE_KEY);
    return saved === "en" || saved === "fr" ? saved : null;
  } catch {
    return null;
  }
}

function guideDetectLocale() {
  const requested = guideRequestedLocale();
  if (requested) return requested;
  const saved = guideSavedLocale();
  if (saved) return saved;
  const language =
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    "fr";
  return language.toLowerCase().startsWith("en") ? "en" : "fr";
}

function guideTranslate(key) {
  const locale = guideDetectLocale();
  return guideTranslations[locale]?.[key] || guideTranslations.fr[key] || key;
}

function applyGuideLanguage() {
  const locale = guideDetectLocale();
  document.documentElement.lang = locale;
  document.title = guideTranslate("meta.title");
  document
    .querySelector("#guideDescription")
    ?.setAttribute("content", guideTranslate("meta.description"));
  document.querySelector("#guideLanguageSelect").value = locale;
  document.querySelector("#backToApp").href = `index.html?lang=${locale}`;

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = guideTranslate(node.dataset.i18n);
  });
}

document
  .querySelector("#guideLanguageSelect")
  .addEventListener("change", (event) => {
    const locale = event.target.value === "en" ? "en" : "fr";
    try {
      localStorage.setItem(GUIDE_STORAGE_KEY, locale);
    } catch {}
    const url = new URL(window.location.href);
    url.searchParams.set("lang", locale);
    window.history.replaceState({}, "", url);
    applyGuideLanguage();
  });

applyGuideLanguage();
