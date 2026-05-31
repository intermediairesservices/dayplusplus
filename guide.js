const GUIDE_STORAGE_KEY = "progression365.v1.locale";

const guideTranslations = {
  fr: {
    "meta.title": "Guide Day++",
    "meta.description":
      "Guide Day++ : interface, vues, réglages, données hors ligne et mises à jour.",
    "guide.title": "Guide",
    "guide.back": "Retour",
    "guide.heroTitle": "Comprendre Day++.",
    "guide.heroText":
      "Day++ transforme une progression longue en décisions simples : valider aujourd'hui, lire la semaine, puis garder du recul avec les vues longues.",
    "guide.quickStartTitle": "Démarrage rapide",
    "guide.quickStart1": "Choisis un objectif, une durée et une date de début.",
    "guide.quickStart2":
      "Ouvre la vue Jour et maintiens le bouton pendant 5 secondes.",
    "guide.quickStart3":
      "Après validation, consulte la semaine puis navigue vers les vues plus longues.",
    "guide.quickStart4": "Installe la PWA pour l'utiliser hors ligne.",
    "guide.interfaceTitle": "Lire l'interface",
    "guide.headerTitle": "En-tête",
    "guide.header1": "Le titre affiche la progression active et le total validé.",
    "guide.header2": "Aujourd'hui ramène directement à la journée à valider.",
    "guide.header3": "Le sélecteur de langue change l'app et le guide.",
    "guide.navTitle": "Navigation",
    "guide.nav1":
      "Les onglets affichent seulement les vues compatibles avec la durée choisie.",
    "guide.nav2":
      "Jour sert à l'action, semaine au suivi court, mois et année au recul.",
    "guide.nav3":
      "Les flèches changent de semaine ou de mois sans modifier tes validations.",
    "guide.settingsPanelTitle": "Panneau Réglages",
    "guide.settingsPanel1":
      "Il regroupe objectif, dates, durée, mode, thème et rappels.",
    "guide.settingsPanel2":
      "Les compteurs indiquent les jours faits, prévus, le pourcentage, la série actuelle et le record.",
    "guide.settingsPanel3":
      "Sur mobile, le panneau s'ouvre comme une feuille pour garder la progression lisible.",
    "guide.moreTitle": "Menu Plus",
    "guide.more1": "Exporter crée une image partageable de la progression.",
    "guide.more2":
      "Installer ajoute Day++ comme application si le navigateur le propose.",
    "guide.more3":
      "Mettre à jour apparaît uniquement quand une nouvelle version est déjà prête.",
    "guide.viewsTitle": "Comprendre les vues",
    "guide.dayTitle": "Jour",
    "guide.dayText":
      "La vue principale. Le bouton rond demande un maintien de 5 secondes pour éviter les validations accidentelles. Une fois le jour validé, Day++ célèbre l'action puis ouvre la semaine.",
    "guide.weekTitle": "Semaine",
    "guide.weekText":
      "La semaine montre chaque jour, son numéro, sa date et son état : Fait, Aujourd'hui, À venir, À faire en mode souple, ou Manqué en mode strict.",
    "guide.monthTitle": "Mois",
    "guide.monthText":
      "Le mois sert à repérer les trous et les séries. En mode souple, les jours passés restent modifiables depuis cette vue.",
    "guide.groupsTitle": "Trimestre et semestre",
    "guide.groupsText":
      "Ces vues regroupent les jours par blocs. Elles sont utiles pour comparer les périodes sans lire chaque date une par une.",
    "guide.yearTitle": "Année",
    "guide.yearText":
      "La vue annuelle donne le bilan global avec des points par jour et des groupes par mois. Elle est pensée pour les captures d'écran et les bilans.",
    "guide.statusTitle": "États des jours",
    "guide.statusText":
      "Fait signifie validé. Aujourd'hui est le jour actif. À venir est verrouillé par le temps. À faire reste possible en mode souple. Manqué signale un jour passé non validé en mode strict.",
    "guide.settingsTitle": "Réglages et modes",
    "guide.durationTitle": "Durée",
    "guide.durationText":
      "Tu peux choisir une semaine, un mois, un trimestre, un semestre ou une année. La date de fin est proposée automatiquement, mais reste modifiable.",
    "guide.modeTitle": "Mode strict / souple",
    "guide.modeText":
      "Le mode strict garde le rituel quotidien : un jour passé non validé devient Manqué. Le mode souple autorise les corrections des jours passés dans les vues calendrier.",
    "guide.multiTitle": "Plusieurs progressions",
    "guide.multiText":
      "Chaque progression garde son objectif, ses dates, son thème, son mode et ses validations. Le sélecteur permet de passer d'un objectif à l'autre.",
    "guide.reminderTitle": "Rappels",
    "guide.reminderText":
      "Les rappels utilisent les notifications du navigateur. Si elles sont autorisées, Day++ peut rappeler le jour à valider à l'heure choisie.",
    "guide.themeTitle": "Thèmes",
    "guide.themeText":
      "Le thème change les couleurs de l'interface, des validations, des confettis et des exports. Le thème sombre reprend l'identité du thème principal avec une base nocturne.",
    "guide.resetTitle": "Réinitialisation",
    "guide.resetText":
      "Réinitialiser cette durée efface les validations de la période courante uniquement. Les autres progressions et leurs périodes restent séparées.",
    "guide.dataTitle": "Données, exports et hors ligne",
    "guide.data1":
      "Les progressions sont stockées localement dans IndexedDB, avec une copie de compatibilité dans localStorage.",
    "guide.data2":
      "L'app fonctionne hors ligne après le premier chargement grâce au service worker.",
    "guide.data3":
      "Sauvegarder exporte un fichier JSON complet. Restaurer relit ce fichier et remplace l'état local.",
    "guide.data4":
      "Exporter l'image génère une capture propre de la progression active, utile pour partager un bilan sans exposer les données brutes.",
    "guide.data5":
      "Chrome et la PWA partagent les données si elles viennent de la même URL et du même navigateur.",
    "guide.updateTitle": "Installation et mises à jour",
    "guide.update1":
      "Installer apparaît quand le navigateur fournit une invitation PWA.",
    "guide.update2":
      "Mettre à jour n'apparaît pas en permanence : il devient visible quand un nouveau service worker est installé en attente.",
    "guide.update3":
      "Quand tu appuies sur Mettre à jour, Day++ demande au nouveau service worker de prendre la main, puis recharge la page.",
    "guide.update4":
      "Si le bouton n'est pas visible, cela signifie généralement qu'aucune nouvelle version n'est encore prête dans ce navigateur.",
    "guide.note":
      "Le meilleur rythme est volontairement simple : ne gagne pas l'année aujourd'hui, gagne seulement aujourd'hui.",
  },
  en: {
    "meta.title": "Day++ Guide",
    "meta.description":
      "Day++ guide: interface, views, settings, offline data, and updates.",
    "guide.title": "Guide",
    "guide.back": "Back",
    "guide.heroTitle": "Understand Day++.",
    "guide.heroText":
      "Day++ turns a long progression into simple decisions: validate today, read the week, then keep perspective with longer views.",
    "guide.quickStartTitle": "Quick start",
    "guide.quickStart1": "Choose a goal, a duration, and a start date.",
    "guide.quickStart2": "Open the Day view and hold the button for 5 seconds.",
    "guide.quickStart3":
      "After validation, check the week and then move into longer views when you want context.",
    "guide.quickStart4": "Install the PWA to use it offline.",
    "guide.interfaceTitle": "Read the interface",
    "guide.headerTitle": "Header",
    "guide.header1": "The title shows the active progression and validated total.",
    "guide.header2": "Today takes you straight back to the day to validate.",
    "guide.header3": "The language selector changes both the app and the guide.",
    "guide.navTitle": "Navigation",
    "guide.nav1":
      "Tabs only show views compatible with the selected duration.",
    "guide.nav2":
      "Day is for action, week for short tracking, month and year for perspective.",
    "guide.nav3":
      "Arrows change week or month without changing your validations.",
    "guide.settingsPanelTitle": "Settings panel",
    "guide.settingsPanel1":
      "It groups the goal, dates, duration, mode, theme, and reminders.",
    "guide.settingsPanel2":
      "Counters show days done, planned days, percentage, current streak, and best streak.",
    "guide.settingsPanel3":
      "On mobile, the panel opens like a sheet so the progression stays readable.",
    "guide.moreTitle": "More menu",
    "guide.more1": "Export creates a shareable image of the progression.",
    "guide.more2":
      "Install adds Day++ as an app when the browser offers it.",
    "guide.more3":
      "Update appears only when a new version is already ready.",
    "guide.viewsTitle": "Understand the views",
    "guide.dayTitle": "Day",
    "guide.dayText":
      "The main view. The round button requires a 5-second hold to avoid accidental validation. Once the day is validated, Day++ celebrates the action and opens the week.",
    "guide.weekTitle": "Week",
    "guide.weekText":
      "The week shows each day, its number, date, and state: Done, Today, Upcoming, To do in flexible mode, or Missed in strict mode.",
    "guide.monthTitle": "Month",
    "guide.monthText":
      "The month helps reveal gaps and streaks. In flexible mode, past days remain editable from this view.",
    "guide.groupsTitle": "Quarter and semester",
    "guide.groupsText":
      "These views group days into blocks. They help compare periods without reading every date one by one.",
    "guide.yearTitle": "Year",
    "guide.yearText":
      "The year view gives a global review with one dot per day and groups by month. It is designed for screenshots and reviews.",
    "guide.statusTitle": "Day states",
    "guide.statusText":
      "Done means validated. Today is the active day. Upcoming is locked by time. To do remains possible in flexible mode. Missed marks a past unvalidated day in strict mode.",
    "guide.settingsTitle": "Settings and modes",
    "guide.durationTitle": "Duration",
    "guide.durationText":
      "Choose a week, month, quarter, semester, or year. The end date is suggested automatically, but remains editable.",
    "guide.modeTitle": "Strict / flexible mode",
    "guide.modeText":
      "Strict mode preserves the daily ritual: a past unvalidated day becomes Missed. Flexible mode lets you correct past days in calendar views.",
    "guide.multiTitle": "Multiple progressions",
    "guide.multiText":
      "Each progression keeps its own goal, dates, theme, mode, and validations. The selector lets you move between goals.",
    "guide.reminderTitle": "Reminders",
    "guide.reminderText":
      "Reminders use browser notifications. If allowed, Day++ can remind you to validate the day at the chosen time.",
    "guide.themeTitle": "Themes",
    "guide.themeText":
      "The theme changes the interface, validation colors, confetti, and exports. Dark theme keeps the main identity on a night base.",
    "guide.resetTitle": "Reset",
    "guide.resetText":
      "Reset this period clears validations for the current period only. Other progressions and their periods stay separate.",
    "guide.dataTitle": "Data, exports, and offline use",
    "guide.data1":
      "Progressions are stored locally in IndexedDB, with a compatibility copy in localStorage.",
    "guide.data2":
      "The app works offline after the first load thanks to the service worker.",
    "guide.data3":
      "Backup exports a complete JSON file. Restore reads that file and replaces the local state.",
    "guide.data4":
      "Export image generates a clean capture of the active progression, useful for sharing a review without exposing raw data.",
    "guide.data5":
      "Chrome and the PWA share data when they come from the same URL and browser.",
    "guide.updateTitle": "Installation and updates",
    "guide.update1":
      "Install appears when the browser provides a PWA install prompt.",
    "guide.update2":
      "Update is not always visible: it appears when a new service worker is installed and waiting.",
    "guide.update3":
      "When you press Update, Day++ asks the new service worker to take control, then reloads the page.",
    "guide.update4":
      "If the button is not visible, it usually means no new version is ready in this browser yet.",
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
