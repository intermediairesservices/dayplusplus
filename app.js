const STORAGE_KEY = "progression365.v1";
const DB_NAME = "progression365";
const DB_VERSION = 1;
const DB_STORE = "app";
const DB_STATE_KEY = "state";
const HOLD_MS = 5000;
const DAY_MS = 24 * 60 * 60 * 1000;

const els = {
  periodTitle: document.querySelector("#periodTitle"),
  periodSubtitle: document.querySelector("#periodSubtitle"),
  settingsToggle: document.querySelector("#settingsToggle"),
  settingsPanel: document.querySelector("#settingsPanel"),
  offlineBadge: document.querySelector("#offlineBadge"),
  updateBtn: document.querySelector("#updateBtn"),
  installBtn: document.querySelector("#installBtn"),
  todayBtn: document.querySelector("#todayBtn"),
  exportImageBtn: document.querySelector("#exportImageBtn"),
  settingsForm: document.querySelector("#settingsForm"),
  progressSelect: document.querySelector("#progressSelect"),
  newProgressBtn: document.querySelector("#newProgressBtn"),
  deleteProgressBtn: document.querySelector("#deleteProgressBtn"),
  goalTitle: document.querySelector("#goalTitle"),
  durationType: document.querySelector("#durationType"),
  startDate: document.querySelector("#startDate"),
  endDate: document.querySelector("#endDate"),
  progressMode: document.querySelector("#progressMode"),
  themeSelect: document.querySelector("#themeSelect"),
  notificationToggle: document.querySelector("#notificationToggle"),
  notificationTime: document.querySelector("#notificationTime"),
  vibrationToggle: document.querySelector("#vibrationToggle"),
  notificationPermissionBtn: document.querySelector(
    "#notificationPermissionBtn",
  ),
  notificationStatus: document.querySelector("#notificationStatus"),
  currentYearBtn: document.querySelector("#currentYearBtn"),
  resetProgressBtn: document.querySelector("#resetProgressBtn"),
  backupBtn: document.querySelector("#backupBtn"),
  restoreBtn: document.querySelector("#restoreBtn"),
  restoreInput: document.querySelector("#restoreInput"),
  settingsExportImageBtn: document.querySelector("#settingsExportImageBtn"),
  viewTabs: document.querySelector("#viewTabs"),
  viewHost: document.querySelector("#viewHost"),
  metricDone: document.querySelector("#metricDone"),
  metricTotal: document.querySelector("#metricTotal"),
  metricPercent: document.querySelector("#metricPercent"),
  metricStreak: document.querySelector("#metricStreak"),
  metricBestStreak: document.querySelector("#metricBestStreak"),
  confettiCanvas: document.querySelector("#confettiCanvas"),
  onboardingModal: document.querySelector("#onboardingModal"),
  onboardingForm: document.querySelector("#onboardingForm"),
  onboardingGoalTitle: document.querySelector("#onboardingGoalTitle"),
  onboardingDuration: document.querySelector("#onboardingDuration"),
  onboardingStart: document.querySelector("#onboardingStart"),
  onboardingEnd: document.querySelector("#onboardingEnd"),
  onboardingMode: document.querySelector("#onboardingMode"),
  onboardingTheme: document.querySelector("#onboardingTheme"),
};

const durationLabels = {
  year: "Année",
  semester: "Semestre",
  quarter: "Trimestre",
  month: "Mois",
  week: "Semaine",
};

const viewOrder = ["day", "week", "month", "quarter", "semester", "year"];

const maxViewByDuration = {
  week: "week",
  month: "month",
  quarter: "quarter",
  semester: "semester",
  year: "year",
};

const durationMonths = {
  year: 12,
  semester: 6,
  quarter: 3,
  month: 1,
};

const themes = {
  primary: {
    accent: "#00599c",
    accentSoft: "#d9e9f8",
    accentMid: "#659ad2",
    done: "#008a78",
    doneSoft: "#dff5f1",
    warn: "#f5b942",
    bgA: "#f5f8fc",
    bgB: "#eef5fb",
    ink: "#082946",
    muted: "#64758a",
    line: "#d7e4f0",
  },
  pink: {
    accent: "#f64f92",
    accentSoft: "#ffd8e7",
    accentMid: "#ff8ab8",
    done: "#17a782",
    doneSoft: "#dff7ef",
    warn: "#f5b942",
    bgA: "#fbf8fa",
    bgB: "#f6fbf8",
    ink: "#2d3138",
    muted: "#7c838f",
    line: "#eadfe5",
  },
  green: {
    accent: "#14a66f",
    accentSoft: "#d7f5e9",
    accentMid: "#47c997",
    done: "#1b8fbe",
    doneSoft: "#dff3fb",
    warn: "#f5b942",
    bgA: "#f8fbf9",
    bgB: "#f3f8ff",
    ink: "#25322d",
    muted: "#738179",
    line: "#dce9e2",
  },
  blue: {
    accent: "#3478f6",
    accentSoft: "#dce8ff",
    accentMid: "#74a5ff",
    done: "#16a085",
    doneSoft: "#ddf6ef",
    warn: "#f5b942",
    bgA: "#f7faff",
    bgB: "#fbf8fa",
    ink: "#252f44",
    muted: "#747d8e",
    line: "#dfe6f3",
  },
  dark: {
    accent: "#f64f92",
    accentSoft: "#3b2631",
    accentMid: "#ff8ab8",
    done: "#21c996",
    doneSoft: "#173d34",
    warn: "#f5b942",
    bgA: "#111318",
    bgB: "#1d2028",
    ink: "#f6f7fb",
    muted: "#a7adba",
    line: "#333846",
  },
  sunset: {
    accent: "#e95f41",
    accentSoft: "#ffe0d6",
    accentMid: "#ff9a7b",
    done: "#7a9f35",
    doneSoft: "#eef6d8",
    warn: "#f0b735",
    bgA: "#fff8f3",
    bgB: "#f8fbf6",
    ink: "#332f2c",
    muted: "#837970",
    line: "#edded4",
  },
};

let state = null;
let holdState = null;
let confettiFrame = 0;
let isCreatingProgression = false;
let deferredInstallPrompt = null;
let waitingServiceWorker = null;
let refreshingForUpdate = false;
let reminderTimer = 0;
let storageWriteQueue = Promise.resolve();

init();

async function init() {
  state = await loadState();
  applyTheme();
  registerPwa();
  setInitialSettingsState();
  bindEvents();
  seedOnboardingForm();

  if (!state.onboardingComplete) {
    showOnboarding();
  }

  const period = getPeriod();
  const active = activeDate(period, todayDate());
  state.view = isCompleted(active) ? "week" : "day";
  applyLaunchView();
  state.monthCursor = monthKey(active);
  state.weekCursorNumber = dayNumber(period, active);
  saveState();
  render();
}

function setInitialSettingsState() {
  const shouldOpen = window.matchMedia("(min-width: 861px)").matches;
  document.body.classList.toggle("settings-open", shouldOpen);
  els.settingsToggle.setAttribute("aria-expanded", String(shouldOpen));
  syncSettingsToggleLabel(shouldOpen);
}

function bindEvents() {
  els.settingsToggle.addEventListener("click", () => toggleSettings());
  els.updateBtn.addEventListener("click", activateWaitingServiceWorker);
  els.installBtn.addEventListener("click", installPwa);
  els.todayBtn.addEventListener("click", goToToday);
  els.exportImageBtn.addEventListener("click", exportProgressImage);
  els.settingsExportImageBtn.addEventListener("click", exportProgressImage);
  els.progressSelect.addEventListener("change", () =>
    switchProgression(els.progressSelect.value),
  );
  els.newProgressBtn.addEventListener("click", createProgression);
  els.deleteProgressBtn.addEventListener("click", deleteActiveProgression);

  els.durationType.addEventListener("change", () =>
    updateEndPreview(els.durationType, els.startDate, els.endDate),
  );
  els.startDate.addEventListener("change", () =>
    updateEndPreview(els.durationType, els.startDate, els.endDate),
  );
  els.themeSelect.addEventListener("change", () => {
    state.config.theme = els.themeSelect.value;
    applyTheme();
    saveState();
  });
  els.notificationPermissionBtn.addEventListener(
    "click",
    requestNotificationPermission,
  );
  els.notificationToggle.addEventListener("change", async () => {
    if (
      els.notificationToggle.checked &&
      notificationPermission() === "default"
    ) {
      await requestNotificationPermission();
    }
    syncNotificationStatus();
  });

  els.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applySettings();
  });

  els.currentYearBtn.addEventListener("click", () => {
    const now = todayDate();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    updateConfig({
      duration: "year",
      start: toDateKey(start),
      end: toDateKey(end),
    });
  });

  els.resetProgressBtn.addEventListener("click", () => {
    completedStore()[getPeriodId()] = {};
    state.view = "day";
    saveState();
    render();
  });

  els.backupBtn.addEventListener("click", exportBackup);
  els.restoreBtn.addEventListener("click", () => els.restoreInput.click());
  els.restoreInput.addEventListener("change", restoreBackup);

  els.onboardingDuration.addEventListener("change", () =>
    updateEndPreview(
      els.onboardingDuration,
      els.onboardingStart,
      els.onboardingEnd,
    ),
  );
  els.onboardingStart.addEventListener("change", () =>
    updateEndPreview(
      els.onboardingDuration,
      els.onboardingStart,
      els.onboardingEnd,
    ),
  );
  els.onboardingTheme.addEventListener("change", () => {
    state.config.theme = els.onboardingTheme.value;
    applyTheme();
  });
  els.onboardingForm.addEventListener("submit", completeOnboarding);

  els.viewTabs.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-view]");
    if (!button || button.disabled) return;
    state.view = button.dataset.view;
    if (state.view === "week" && !state.weekCursorNumber) {
      state.weekCursorNumber = dayNumber(
        getPeriod(),
        activeDate(getPeriod(), todayDate()),
      );
    }
    saveState();
    render();
  });

  els.viewHost.addEventListener("click", (event) => {
    const previousMonth = event.target.closest("[data-month-prev]");
    const nextMonth = event.target.closest("[data-month-next]");
    const previousWeek = event.target.closest("[data-week-prev]");
    const nextWeek = event.target.closest("[data-week-next]");
    const dateAction = event.target.closest("[data-date-action]");

    if (previousMonth) moveMonth(-1);
    if (nextMonth) moveMonth(1);
    if (previousWeek) moveWeek(-1);
    if (nextWeek) moveWeek(1);
    if (dateAction) toggleDateFromElement(dateAction);
  });

  els.viewHost.addEventListener("pointerdown", (event) => {
    const button = event.target.closest("[data-hold-button]");
    if (!button || button.disabled) return;
    startHold(event, button);
  });

  els.viewHost.addEventListener("selectstart", (event) => {
    if (event.target.closest("[data-hold-button]")) {
      event.preventDefault();
    }
  });

  window.addEventListener("pointerup", cancelHold);
  window.addEventListener("pointercancel", cancelHold);
  window.addEventListener("blur", cancelHold);
  window.addEventListener("resize", resizeConfettiCanvas);
  window.addEventListener("online", syncOnlineStatus);
  window.addEventListener("offline", syncOnlineStatus);
  window.addEventListener("hashchange", () => {
    applyLaunchView();
    saveState();
    render();
  });
}

function registerPwa() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then((registration) => {
          watchServiceWorker(registration);
        })
        .catch(() => {});
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshingForUpdate) return;
      refreshingForUpdate = true;
      window.location.reload();
    });
  }

  syncOnlineStatus();
  persistStorage();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    els.installBtn.hidden = false;
    if (window.gtag) {
      gtag("event", "before_install_prompt", {
        event_category: "engagement",
        event_label: "PWA install prompt",
      });
    }
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    els.installBtn.hidden = true;
    if (window.gtag) {
      gtag("event", "app_install", {
        event_category: "engagement",
        event_label: "PWA installed",
      });
    }
  });
}

function watchServiceWorker(registration) {
  if (registration.waiting && navigator.serviceWorker.controller) {
    showUpdateReady(registration.waiting);
  }

  registration.addEventListener("updatefound", () => {
    const worker = registration.installing;
    if (!worker) return;

    worker.addEventListener("statechange", () => {
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        showUpdateReady(worker);
      }
    });
  });
}

function showUpdateReady(worker) {
  waitingServiceWorker = worker;
  els.updateBtn.hidden = false;
}

function activateWaitingServiceWorker() {
  if (!waitingServiceWorker) return;
  waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
  els.updateBtn.disabled = true;
}

async function installPwa() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  els.installBtn.hidden = true;
}

function applyLaunchView() {
  const launchView = window.location.hash.replace("#", "");
  if (!getAllowedViews().includes(launchView)) return;
  state.view = launchView;
}

function syncOnlineStatus() {
  els.offlineBadge.hidden = navigator.onLine;
}

async function persistStorage() {
  if (!navigator.storage || !navigator.storage.persist) return;
  try {
    await navigator.storage.persist();
  } catch {}
}

function notificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission || "default";
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    syncNotificationStatus();
    return "unsupported";
  }

  try {
    const permission = await Notification.requestPermission();
    syncNotificationStatus();
    scheduleReminder();
    return permission;
  } catch {
    syncNotificationStatus();
    return notificationPermission();
  }
}

function syncNotificationStatus() {
  const permission = notificationPermission();
  const enabled = els.notificationToggle?.checked;
  const vibrationSupported = "vibrate" in navigator;

  if (permission === "unsupported") {
    els.notificationStatus.textContent = vibrationSupported
      ? "Notifications non supportées"
      : "Notifications et vibration non supportées";
    els.notificationPermissionBtn.disabled = true;
    return;
  }

  els.notificationPermissionBtn.disabled =
    permission === "granted" || permission === "denied";
  els.notificationPermissionBtn.textContent =
    permission === "granted"
      ? "Notifications autorisées"
      : "Autoriser les notifications";

  if (!enabled) {
    els.notificationStatus.textContent = vibrationSupported
      ? "Notifications désactivées"
      : "Notifications désactivées · vibration non supportée";
    return;
  }

  if (permission === "granted") {
    els.notificationStatus.textContent = vibrationSupported
      ? "Rappel actif"
      : "Rappel actif · vibration non supportée";
    return;
  }

  els.notificationStatus.textContent =
    permission === "denied"
      ? "Notifications bloquées dans le navigateur"
      : "Notifications à autoriser";
}

function scheduleReminder() {
  if (reminderTimer) {
    window.clearTimeout(reminderTimer);
    reminderTimer = 0;
  }

  if (!state.onboardingComplete || !state.config.reminderEnabled) return;
  if (notificationPermission() !== "granted") return;

  const delay = nextReminderDelay();
  reminderTimer = window.setTimeout(async () => {
    await showDailyReminder();
    scheduleReminder();
  }, delay);
}

function nextReminderDelay() {
  const [hours, minutes] = (state.config.reminderTime || "09:00")
    .split(":")
    .map(Number);
  const now = new Date();
  const next = new Date(now);
  next.setHours(hours || 0, minutes || 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

async function showDailyReminder() {
  const period = getPeriod();
  const today = todayDate();
  if (!isWithin(today, period)) return;

  const active = activeDate(period, today);
  if (isCompleted(active)) return;

  const number = dayNumber(period, active);
  const title = `Jour ${number} à valider`;
  const options = {
    body: `${state.config.title} · ${formatShortDate(active)}`,
    icon: "icons/day-plus-plus-192.png",
    badge: "icons/day-plus-plus-192.png",
    tag: `day-plus-plus-${state.activeProgressId}-${toDateKey(active)}`,
    data: { url: "./index.html#day" },
    vibrate: state.config.vibrationEnabled === false ? undefined : [70, 35, 70],
  };

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.showNotification) {
        await registration.showNotification(title, options);
        vibrate([70, 35, 70]);
        return;
      }
    }

    new Notification(title, options);
    vibrate([70, 35, 70]);
  } catch {}
}

function vibrate(pattern) {
  if (state.config.vibrationEnabled === false || !("vibrate" in navigator))
    return;
  navigator.vibrate(pattern);
}

async function loadState() {
  const fallback = createFallbackState();
  const indexedState = await readIndexedState();
  if (indexedState) return normalizeState(indexedState, fallback, true);

  const savedRaw = readLegacyState();
  if (!savedRaw) return createInitialState(fallback);

  try {
    const saved = JSON.parse(savedRaw);
    if (!saved) return createInitialState(fallback);
    return normalizeState(saved, fallback, true);
  } catch {
    return createInitialState(fallback);
  }
}

function createFallbackState() {
  const now = todayDate();
  return {
    version: 5,
    onboardingComplete: false,
    activeProgressId: "default",
    progressions: {},
    config: {
      title: "Progression 365",
      duration: "year",
      start: `${now.getFullYear()}-01-01`,
      end: `${now.getFullYear()}-12-31`,
      mode: "strict",
      theme: "primary",
      reminderEnabled: false,
      reminderTime: "09:00",
      vibrationEnabled: true,
    },
    completions: {},
    view: "day",
    monthCursor: `${now.getFullYear()}-${pad(now.getMonth() + 1)}`,
    weekCursorNumber: null,
  };
}

function normalizeState(saved, fallback, hadSaved) {
  if (saved.progressions && saved.activeProgressId) {
    const progressions = {};
    Object.values(saved.progressions).forEach((progression) => {
      const normalized = normalizeProgression(progression, fallback);
      if ((saved.version || 0) < 4 && normalized.config.theme === "pink") {
        normalized.config.theme = "primary";
      }
      progressions[normalized.id] = normalized;
    });
    const ids = Object.keys(progressions);
    if (!ids.length) return createInitialState(fallback);
    const activeProgressId = progressions[saved.activeProgressId]
      ? saved.activeProgressId
      : ids[0];
    return hydrateActiveState({
      ...fallback,
      version: 5,
      onboardingComplete: saved.onboardingComplete ?? ids.length > 0,
      activeProgressId,
      progressions,
    });
  }

  const migrated = normalizeProgression(
    {
      id: makeProgressionId(),
      config: saved.config,
      completions: saved.completions,
      view: saved.view,
      monthCursor: saved.monthCursor,
      weekCursorNumber: saved.weekCursorNumber,
    },
    fallback,
  );
  if ((saved.version || 0) < 4 && migrated.config.theme === "pink") {
    migrated.config.theme = "primary";
  }

  return hydrateActiveState({
    ...fallback,
    version: 5,
    onboardingComplete: saved.onboardingComplete ?? false,
    activeProgressId: migrated.id,
    progressions: { [migrated.id]: migrated },
  });
}

function saveState() {
  if (!state) return;
  syncActiveProgress();
  const serialized = JSON.stringify(state);
  writeLegacyState(serialized);
  queueIndexedStateWrite(serialized);
}

async function readIndexedState() {
  try {
    const db = await openStorageDb();
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(DB_STORE, "readonly");
      const request = transaction.objectStore(DB_STORE).get(DB_STATE_KEY);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch {
    return null;
  }
}

function queueIndexedStateWrite(serialized) {
  const snapshot = JSON.parse(serialized);
  storageWriteQueue = storageWriteQueue
    .catch(() => {})
    .then(() => writeIndexedState(snapshot))
    .catch(() => {});
}

async function writeIndexedState(nextState) {
  const db = await openStorageDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DB_STORE, "readwrite");
    transaction.objectStore(DB_STORE).put(nextState, DB_STATE_KEY);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

function openStorageDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in globalThis)) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("IndexedDB blocked"));
  });
}

function readLegacyState() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeLegacyState(serialized) {
  try {
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {}
}

function createInitialState(fallback) {
  const progression = normalizeProgression(
    {
      id: "default",
      config: fallback.config,
      completions: {},
      view: fallback.view,
      monthCursor: fallback.monthCursor,
      weekCursorNumber: fallback.weekCursorNumber,
    },
    fallback,
  );

  return hydrateActiveState({
    ...fallback,
    activeProgressId: progression.id,
    progressions: { [progression.id]: progression },
  });
}

function normalizeProgression(progression, fallback) {
  const config = {
    ...fallback.config,
    ...(progression.config || {}),
  };

  config.title = cleanTitle(config.title);
  config.mode = config.mode === "flexible" ? "flexible" : "strict";
  config.theme = themes[config.theme] ? config.theme : "primary";
  config.reminderEnabled = Boolean(config.reminderEnabled);
  config.reminderTime = isValidTime(config.reminderTime)
    ? config.reminderTime
    : "09:00";
  config.vibrationEnabled = config.vibrationEnabled !== false;

  return {
    id: progression.id || makeProgressionId(),
    config,
    completions: progression.completions || {},
    view: progression.view || "day",
    monthCursor: progression.monthCursor || fallback.monthCursor,
    weekCursorNumber: progression.weekCursorNumber || null,
  };
}

function hydrateActiveState(nextState) {
  const active =
    nextState.progressions[nextState.activeProgressId] ||
    Object.values(nextState.progressions)[0];
  nextState.activeProgressId = active.id;
  nextState.config = active.config;
  nextState.completions = active.completions;
  nextState.view = active.view;
  nextState.monthCursor = active.monthCursor;
  nextState.weekCursorNumber = active.weekCursorNumber;
  return nextState;
}

function syncActiveProgress() {
  if (!state.progressions || !state.activeProgressId) return;
  const active = state.progressions[state.activeProgressId];
  if (!active) return;
  active.config = state.config;
  active.completions = state.completions;
  active.view = state.view;
  active.monthCursor = state.monthCursor;
  active.weekCursorNumber = state.weekCursorNumber;
}

function completedStore() {
  if (!state.completions) state.completions = {};
  return state.completions;
}

function activeProgression() {
  return state.progressions[state.activeProgressId];
}

function switchProgression(id) {
  if (!state.progressions[id] || id === state.activeProgressId) return;
  syncActiveProgress();
  state.activeProgressId = id;
  hydrateActiveState(state);
  applyTheme();
  saveState();
  seedOnboardingForm();
  render();
}

function createProgression() {
  syncActiveProgress();
  const now = todayDate();
  const progression = normalizeProgression(
    {
      id: makeProgressionId(),
      config: {
        title: `Progression ${Object.keys(state.progressions).length + 1}`,
        duration: "year",
        start: `${now.getFullYear()}-01-01`,
        end: `${now.getFullYear()}-12-31`,
        mode: "strict",
        theme: state.config.theme || "primary",
        reminderEnabled: false,
        reminderTime: "09:00",
        vibrationEnabled: state.config.vibrationEnabled !== false,
      },
      completions: {},
      view: "day",
      monthCursor: monthKey(now),
      weekCursorNumber: null,
    },
    {
      config: state.config,
      monthCursor: monthKey(now),
    },
  );

  state.progressions[progression.id] = progression;
  state.activeProgressId = progression.id;
  hydrateActiveState(state);
  isCreatingProgression = true;
  seedOnboardingForm();
  showOnboarding();
  applyTheme();
  saveState();
  render();
}

function deleteActiveProgression() {
  const ids = Object.keys(state.progressions);
  if (ids.length <= 1) return;
  const activeTitle = state.config.title;
  if (!confirm(`Supprimer "${activeTitle}" ?`)) return;

  delete state.progressions[state.activeProgressId];
  state.activeProgressId = Object.keys(state.progressions)[0];
  hydrateActiveState(state);
  applyTheme();
  saveState();
  render();
}

function syncProgressionControls() {
  els.progressSelect.innerHTML = Object.values(state.progressions)
    .map(
      (progression) =>
        `<option value="${progression.id}">${escapeHtml(progression.config.title)}</option>`,
    )
    .join("");
  els.progressSelect.value = state.activeProgressId;
  els.deleteProgressBtn.disabled = Object.keys(state.progressions).length <= 1;
}

function applySettings() {
  updateConfig({
    title: cleanTitle(els.goalTitle.value),
    duration: els.durationType.value,
    start: els.startDate.value,
    end: els.endDate.value,
    mode: els.progressMode.value,
    theme: els.themeSelect.value,
    reminderEnabled: els.notificationToggle.checked,
    reminderTime: els.notificationTime.value,
    vibrationEnabled: els.vibrationToggle.checked,
  });
}

function updateConfig(nextConfig) {
  const start = parseDateKey(nextConfig.start) || todayDate();
  let end =
    parseDateKey(nextConfig.end) ||
    autoEndDate(nextConfig.duration || state.config.duration, start);
  if (end < start) end = start;

  state.config = {
    ...state.config,
    ...nextConfig,
    title: cleanTitle(nextConfig.title ?? state.config.title),
    start: toDateKey(start),
    end: toDateKey(end),
    reminderTime: isValidTime(nextConfig.reminderTime)
      ? nextConfig.reminderTime
      : state.config.reminderTime || "09:00",
    vibrationEnabled:
      typeof nextConfig.vibrationEnabled === "boolean"
        ? nextConfig.vibrationEnabled
        : state.config.vibrationEnabled !== false,
  };

  const period = getPeriod();
  const active = activeDate(period, todayDate());
  state.view = isCompleted(active) ? "week" : "day";
  state.monthCursor = monthKey(active);
  state.weekCursorNumber = dayNumber(period, active);
  applyTheme();
  saveState();
  closeSettingsOnSmallScreens();
  render();
}

function completeOnboarding(event) {
  event.preventDefault();
  state.onboardingComplete = true;
  updateConfig({
    title: cleanTitle(els.onboardingGoalTitle.value),
    duration: els.onboardingDuration.value,
    start: els.onboardingStart.value,
    end: els.onboardingEnd.value,
    mode: els.onboardingMode.value,
    theme: els.onboardingTheme.value,
  });
  isCreatingProgression = false;
  hideOnboarding();
}

function seedOnboardingForm() {
  const period = getPeriod();
  els.onboardingGoalTitle.value = state.config.title;
  els.onboardingDuration.value = state.config.duration;
  els.onboardingStart.value = toDateKey(period.start);
  els.onboardingEnd.value = toDateKey(period.end);
  els.onboardingMode.value = state.config.mode;
  els.onboardingTheme.value = state.config.theme;
}

function showOnboarding() {
  document.body.classList.add("onboarding-open");
  els.onboardingModal.hidden = false;
}

function hideOnboarding() {
  document.body.classList.remove("onboarding-open");
  els.onboardingModal.hidden = true;
}

function updateEndPreview(durationEl, startEl, endEl) {
  const start = parseDateKey(startEl.value);
  if (!start) return;
  endEl.value = toDateKey(autoEndDate(durationEl.value, start));
}

function render() {
  const period = getPeriod();
  const days = getPeriodDays(period);
  const active = activeDate(period, todayDate());
  const currentDayNumber = dayNumber(period, active);
  const doneCount = completedCount(days);
  const percent = days.length ? Math.round((doneCount / days.length) * 100) : 0;
  const streak = getStreakStats(days, period);

  els.periodTitle.textContent = `${state.config.title} ${currentDayNumber}/${days.length}`;
  els.periodSubtitle.textContent = `${formatDate(period.start)} - ${formatDate(period.end)} · ${modeLabel()}`;
  els.metricDone.textContent = String(doneCount);
  els.metricTotal.textContent = String(days.length);
  els.metricPercent.textContent = `${percent}%`;
  els.metricStreak.textContent = String(streak.current);
  els.metricBestStreak.textContent = String(streak.best);

  syncProgressionControls();
  syncSettingsForm();
  ensureViewAllowed();
  syncTabs();
  els.viewHost.dataset.view = state.view;

  if (state.view === "day") renderDayView(period, active, days.length, streak);
  if (state.view === "week") renderWeekView(period, active);
  if (state.view === "month") renderMonthView(period, active);
  if (state.view === "quarter") renderQuarterView(period);
  if (state.view === "semester") renderSemesterView(period);
  if (state.view === "year") renderYearView(period, streak);
  scheduleReminder();
}

function syncSettingsForm() {
  els.goalTitle.value = state.config.title;
  els.durationType.value = state.config.duration;
  els.startDate.value = state.config.start;
  els.endDate.value = state.config.end;
  els.progressMode.value = state.config.mode;
  els.themeSelect.value = state.config.theme;
  els.notificationToggle.checked = Boolean(state.config.reminderEnabled);
  els.notificationTime.value = state.config.reminderTime || "09:00";
  els.vibrationToggle.checked = state.config.vibrationEnabled !== false;
  syncNotificationStatus();
}

function syncTabs() {
  const allowedViews = getAllowedViews();
  els.viewTabs.querySelectorAll("button[data-view]").forEach((button) => {
    const isAllowed = allowedViews.includes(button.dataset.view);
    button.hidden = !isAllowed;
    button.disabled = !isAllowed;
    button.classList.toggle("is-active", button.dataset.view === state.view);
  });
}

function toggleSettings(forceOpen) {
  const willOpen =
    typeof forceOpen === "boolean"
      ? forceOpen
      : !document.body.classList.contains("settings-open");

  document.body.classList.toggle("settings-open", willOpen);
  els.settingsToggle.setAttribute("aria-expanded", String(willOpen));
  syncSettingsToggleLabel(willOpen);

  if (willOpen) {
    window.setTimeout(() => {
      els.settingsPanel.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 0);
  }
}

function syncSettingsToggleLabel(isOpen) {
  els.settingsToggle.textContent = isOpen ? "Fermer" : "Réglages";
}

function closeSettingsOnSmallScreens() {
  if (!window.matchMedia("(max-width: 860px)").matches) return;
  toggleSettings(false);
}

function goToToday() {
  const period = getPeriod();
  const active = activeDate(period, todayDate());
  state.view = "day";
  state.monthCursor = monthKey(active);
  state.weekCursorNumber = dayNumber(period, active);
  saveState();
  closeSettingsOnSmallScreens();
  render();

  window.setTimeout(() => {
    els.viewHost.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
}

function getAllowedViews() {
  const maxView = maxViewByDuration[state.config.duration] || "year";
  const maxIndex = viewOrder.indexOf(maxView);
  return viewOrder.slice(0, maxIndex + 1);
}

function ensureViewAllowed() {
  const allowedViews = getAllowedViews();
  if (allowedViews.includes(state.view)) return;
  state.view = allowedViews[allowedViews.length - 1] || "day";
  saveState();
}

function renderDayView(period, active, totalDays, streak) {
  const number = dayNumber(period, active);
  const complete = isCompleted(active);
  const label = complete ? "Fait" : "Tenir 5s";
  const sub = complete ? "aujourd'hui" : "appuyer";

  els.viewHost.innerHTML = `
    <article class="view-panel">
      <div class="section-head">
        <div>
          <h2>Jour ${number}</h2>
          <p>${formatDate(active)} · ${number} sur ${totalDays}</p>
        </div>
        <div class="pill-row">
          <span class="progress-pill">${complete ? "Accompli" : "En cours"}</span>
          <span class="progress-pill streak-pill">${streak.current} streak</span>
        </div>
      </div>
      <div class="day-stage">
        <div class="hold-area">
          <button class="hold-button ${complete ? "is-done" : ""}" type="button" data-hold-button ${complete ? "disabled" : ""} style="--fill: ${complete ? "100%" : "0%"}">
            <span>
              <span class="hold-main">${label}</span>
              <span class="hold-sub">${sub}</span>
            </span>
          </button>
          <div class="day-date">${formatShortDate(active)}</div>
          <div class="completion-note">${complete ? "La journée est validée." : strictHint()}</div>
        </div>
      </div>
    </article>
  `;
}

function renderWeekView(period, active) {
  const days = getPeriodDays(period);
  const activeNumber = dayNumber(period, active);
  const cursorNumber = clampNumber(
    state.weekCursorNumber || activeNumber,
    1,
    days.length,
  );
  const weekStartNumber = Math.floor((cursorNumber - 1) / 7) * 7 + 1;
  const weekDays = Array.from(
    { length: 7 },
    (_, index) => days[weekStartNumber + index - 1] || null,
  );
  const complete = weekDays.filter(
    (day) => day && isCompleted(day.date),
  ).length;
  const visible = weekDays.filter(Boolean).length || 1;

  state.weekCursorNumber = cursorNumber;

  els.viewHost.innerHTML = `
    <article class="view-panel">
      <div class="section-head">
        <div>
          <h2>Semaine ${Math.ceil(weekStartNumber / 7)}</h2>
          <p>Jours ${weekStartNumber} - ${Math.min(weekStartNumber + 6, days.length)}</p>
        </div>
        <div class="nav-arrows">
          <button class="round-nav" type="button" data-week-prev ${weekStartNumber === 1 ? "disabled" : ""} aria-label="Semaine précédente">&lsaquo;</button>
          <span class="progress-pill">${Math.round((complete / visible) * 100)}%</span>
          <button class="round-nav" type="button" data-week-next ${weekStartNumber + 7 > days.length ? "disabled" : ""} aria-label="Semaine suivante">&rsaquo;</button>
        </div>
      </div>
      <div class="week-track">
        ${weekDays.map((day, index) => renderWeekDay(period, day, index)).join("")}
      </div>
    </article>
  `;
}

function renderWeekDay(period, day, index) {
  if (!day) {
    return `
      <div class="week-day is-outside">
        <div class="day-bubble">-</div>
        <div class="week-label">
          <span class="week-name">Hors durée</span>
          <span class="week-date">-</span>
        </div>
        <div class="week-status">-</div>
      </div>
    `;
  }

  const complete = isCompleted(day.date);
  const isToday = isSameDate(day.date, todayDate());
  const isFuture = day.date > todayDate();
  const actionable = canToggleDate(day.date);
  const status = complete
    ? "Fait"
    : isToday
      ? "Aujourd'hui"
      : isFuture
        ? "À venir"
        : "À faire";
  const classes = [
    "week-day",
    complete ? "is-complete" : "",
    isToday ? "is-today" : "",
    isFuture ? "is-future" : "",
    actionable ? "is-actionable" : "is-locked",
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <div class="${classes}" data-date-action="${day.key}" title="${dateActionTitle(day.date)}">
      <div class="day-bubble">${day.number}</div>
      <div class="week-label">
        <span class="week-name">${weekdayName(day.date, index)}</span>
        <span class="week-date">${formatShortDate(day.date)}</span>
      </div>
      <div class="week-status">${status}</div>
    </div>
  `;
}

function renderMonthView(period, active) {
  const months = getPeriodMonths(period);
  if (!months.length) {
    renderEmpty();
    return;
  }

  const activeKey = monthKey(active);
  if (!months.some((month) => month.key === state.monthCursor)) {
    state.monthCursor = activeKey;
  }

  const index = Math.max(
    0,
    months.findIndex((month) => month.key === state.monthCursor),
  );
  const month = months[index] || months[0];
  const complete = month.days.filter((day) => isCompleted(day.date)).length;
  const percent = month.days.length
    ? Math.round((complete / month.days.length) * 100)
    : 0;

  els.viewHost.innerHTML = `
    <article class="view-panel">
      <div class="month-card">
        <div class="section-head">
          <div>
            <h2>${month.title}</h2>
            <p>${month.days.length} jours · ${complete} faits</p>
          </div>
          <div class="nav-arrows">
            <button class="round-nav" type="button" data-month-prev ${index === 0 ? "disabled" : ""} aria-label="Mois précédent">&lsaquo;</button>
            <span class="progress-pill">${percent}%</span>
            <button class="round-nav" type="button" data-month-next ${index === months.length - 1 ? "disabled" : ""} aria-label="Mois suivant">&rsaquo;</button>
          </div>
        </div>
        ${renderCalendarMonth(period, month)}
      </div>
    </article>
  `;
}

function renderCalendarMonth(period, month) {
  const weekdays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const first = new Date(month.year, month.month, 1);
  const last = new Date(month.year, month.month + 1, 0);
  const cells = [];

  for (let i = 0; i < first.getDay(); i += 1) cells.push(null);
  for (let day = 1; day <= last.getDate(); day += 1)
    cells.push(new Date(month.year, month.month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return `
    <div class="calendar-grid">
      <div class="weekday-row">
        ${weekdays.map((day) => `<div class="weekday">${day}</div>`).join("")}
      </div>
      ${weeks.map((week) => renderCalendarWeek(period, week)).join("")}
    </div>
  `;
}

function renderCalendarWeek(period, week) {
  const activeIndexes = week
    .map((date, index) => (date && isWithin(date, period) ? index : -1))
    .filter((index) => index >= 0);
  const firstIndex = activeIndexes[0];
  const lastIndex = activeIndexes[activeIndexes.length - 1];

  return `
    <div class="calendar-week">
      ${week.map((date, index) => renderCalendarDay(period, date, index, firstIndex, lastIndex)).join("")}
    </div>
  `;
}

function renderCalendarDay(period, date, index, firstIndex, lastIndex) {
  if (!date) return `<div class="calendar-day"></div>`;

  const inPeriod = isWithin(date, period);
  const actionable = inPeriod && canToggleDate(date);
  const classes = [
    "calendar-day",
    inPeriod ? "has-day" : "",
    inPeriod && isCompleted(date) ? "is-complete" : "",
    isSameDate(date, todayDate()) ? "is-today" : "",
    !inPeriod ? "is-muted" : "",
    actionable ? "is-actionable" : "",
    index === firstIndex ? "trail-start" : "",
    index === lastIndex ? "trail-end" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <div class="${classes}" ${inPeriod ? `data-date-action="${toDateKey(date)}"` : ""} title="${inPeriod ? dateActionTitle(date) : "Hors progression"}">
      <div class="calendar-number">${date.getDate()}</div>
    </div>
  `;
}

function renderQuarterView(period) {
  const quarters = chunk(getPeriodMonths(period), 3);
  els.viewHost.innerHTML = `
    <article class="view-panel">
      <div class="section-head">
        <div>
          <h2>Trimestres</h2>
          <p>${quarters.length} groupe${quarters.length > 1 ? "s" : ""}</p>
        </div>
      </div>
      <div class="group-grid">
        ${quarters.map((months, index) => renderGroupCard(`Trimestre ${index + 1}`, months)).join("")}
      </div>
    </article>
  `;
}

function renderSemesterView(period) {
  const semesters = chunk(getPeriodMonths(period), 6);
  els.viewHost.innerHTML = `
    <article class="view-panel">
      <div class="section-head">
        <div>
          <h2>Semestres</h2>
          <p>${semesters.length} groupe${semesters.length > 1 ? "s" : ""}</p>
        </div>
      </div>
      <div class="group-grid">
        ${semesters.map((months, index) => renderGroupCard(`Semestre ${index + 1}`, months)).join("")}
      </div>
    </article>
  `;
}

function renderGroupCard(title, months) {
  const days = months.flatMap((month) => month.days);
  const done = days.filter((day) => isCompleted(day.date)).length;
  const percent = days.length ? Math.round((done / days.length) * 100) : 0;

  return `
    <article class="group-card">
      <h3>${title}</h3>
      <p>${months[0].shortTitle} - ${months[months.length - 1].shortTitle}</p>
      <div class="bar" aria-label="${percent}%"><span style="--width: ${percent}%"></span></div>
      <div class="mini-months">
        ${months.map((month) => `<span class="mini-month">${month.shortTitle}</span>`).join("")}
      </div>
      <div class="mini-days">
        ${days.map((day) => renderMiniDot(day)).join("")}
      </div>
    </article>
  `;
}

function renderMiniDot(day) {
  const classes = [
    "mini-dot",
    isCompleted(day.date) ? "is-complete" : "",
    isSameDate(day.date, todayDate()) ? "is-today" : "",
    canToggleDate(day.date) ? "is-actionable" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `<span class="${classes}" data-date-action="${day.key}" title="${dateActionTitle(day.date)}"></span>`;
}

function renderYearView(period, streak) {
  const months = getPeriodMonths(period);
  const days = getPeriodDays(period);
  const done = completedCount(days);
  const percent = days.length ? Math.round((done / days.length) * 100) : 0;
  const remaining = Math.max(0, days.length - done);

  els.viewHost.innerHTML = `
    <article class="view-panel year-panel">
      <div class="year-capture">
        <div class="year-capture-head">
          <div>
            <h2>${state.config.title}</h2>
            <p>${formatDate(period.start)} - ${formatDate(period.end)}</p>
          </div>
          <div class="year-score">
            <strong>${percent}%</strong>
            <span>${done}/${days.length}</span>
          </div>
        </div>
        <div class="year-progress-line" aria-label="${percent}%">
          <span style="--width: ${percent}%"></span>
        </div>
        <div class="year-stats">
          <span>${done} faits</span>
          <span>${remaining} restants</span>
          <span>${streak.current} streak</span>
          <span>${streak.best} record</span>
        </div>
        <div class="year-grid">
          ${months.map((month) => renderYearMonth(month)).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderYearMonth(month) {
  const done = month.days.filter((day) => isCompleted(day.date)).length;
  const percent = month.days.length
    ? Math.round((done / month.days.length) * 100)
    : 0;

  return `
    <section class="year-month">
      <div class="year-month-head">
        <h3>${month.shortTitle}</h3>
        <span>${percent}%</span>
      </div>
      <div class="year-dots">
        ${month.days.map((day) => renderYearDot(day)).join("")}
      </div>
    </section>
  `;
}

function renderYearDot(day) {
  const classes = [
    "year-dot",
    isCompleted(day.date) ? "is-complete" : "",
    isSameDate(day.date, todayDate()) ? "is-today" : "",
    canToggleDate(day.date) ? "is-actionable" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `<span class="${classes}" data-date-action="${day.key}" title="${dateActionTitle(day.date)}"></span>`;
}

function renderEmpty() {
  els.viewHost.innerHTML = `
    <article class="view-panel empty-state">
      <p>Aucune date dans cette durée.</p>
    </article>
  `;
}

function startHold(event, button) {
  event.preventDefault();
  cancelHold();
  if (button.setPointerCapture) button.setPointerCapture(event.pointerId);

  const startedAt = performance.now();
  holdState = { button, frame: 0 };

  const tick = (time) => {
    if (!holdState) return;
    const progress = Math.min(1, (time - startedAt) / HOLD_MS);
    button.style.setProperty("--fill", `${Math.round(progress * 100)}%`);

    if (progress >= 1) {
      completeActiveDay();
      return;
    }

    holdState.frame = requestAnimationFrame(tick);
  };

  holdState.frame = requestAnimationFrame(tick);
}

function cancelHold() {
  if (!holdState) return;
  cancelAnimationFrame(holdState.frame);
  holdState.button.style.setProperty("--fill", "0%");
  holdState = null;
}

function completeActiveDay() {
  if (!holdState) return;
  cancelAnimationFrame(holdState.frame);
  holdState.button.style.setProperty("--fill", "100%");
  holdState = null;

  const period = getPeriod();
  const active = activeDate(period, todayDate());
  completedMap()[toDateKey(active)] = true;
  state.weekCursorNumber = dayNumber(period, active);
  saveState();
  celebrate();
  render();

  window.setTimeout(() => {
    state.view = "week";
    saveState();
    render();
  }, 900);
}

function toggleDateFromElement(element) {
  const date = parseDateKey(element.dataset.dateAction);
  if (!date || !canToggleDate(date)) return;

  const key = toDateKey(date);
  const map = completedMap();
  map[key] = !map[key];
  if (!map[key]) delete map[key];

  saveState();
  if (map[key] && isSameDate(date, todayDate())) celebrate();
  render();
}

function canToggleDate(date) {
  return (
    state.config.mode === "flexible" &&
    date <= todayDate() &&
    isWithin(date, getPeriod())
  );
}

function dateActionTitle(date) {
  if (canToggleDate(date))
    return isCompleted(date) ? "Retirer ce jour" : "Valider ce jour";
  return state.config.mode === "strict"
    ? "Mode strict: validation depuis la vue Jour"
    : "";
}

function moveMonth(direction) {
  const months = getPeriodMonths(getPeriod());
  const current = months.findIndex((month) => month.key === state.monthCursor);
  const nextIndex = Math.min(
    months.length - 1,
    Math.max(0, current + direction),
  );
  state.monthCursor = months[nextIndex].key;
  saveState();
  render();
}

function moveWeek(direction) {
  const total = getPeriodDays(getPeriod()).length;
  const cursor = state.weekCursorNumber || 1;
  state.weekCursorNumber = clampNumber(cursor + direction * 7, 1, total);
  saveState();
  render();
}

function getPeriod() {
  const start = parseDateKey(state.config.start) || todayDate();
  let end =
    parseDateKey(state.config.end) || autoEndDate(state.config.duration, start);
  if (end < start) end = start;
  return { start, end };
}

function getPeriodId() {
  const period = getPeriod();
  return `${toDateKey(period.start)}_${toDateKey(period.end)}`;
}

function completedMap() {
  const periodId = getPeriodId();
  const store = completedStore();
  if (!store[periodId]) store[periodId] = {};
  return store[periodId];
}

function isCompleted(date) {
  return Boolean(completedMap()[toDateKey(date)]);
}

function completedCount(days) {
  return days.filter((day) => isCompleted(day.date)).length;
}

function getStreakStats(days, period) {
  let best = 0;
  let run = 0;
  days.forEach((day) => {
    if (isCompleted(day.date)) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  });

  let cursor = activeDate(period, todayDate());
  if (todayDate() < period.start) return { current: 0, best };
  if (todayDate() <= period.end && !isCompleted(cursor)) {
    cursor = addDays(cursor, -1);
  }

  let current = 0;
  while (cursor >= period.start && isCompleted(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return { current, best };
}

function getPeriodDays(period) {
  const days = [];
  const total = diffDays(period.start, period.end) + 1;
  for (let index = 0; index < total; index += 1) {
    const date = addDays(period.start, index);
    days.push({ date, key: toDateKey(date), number: index + 1 });
  }
  return days;
}

function getPeriodMonths(period) {
  const months = [];
  let cursor = new Date(period.start.getFullYear(), period.start.getMonth(), 1);

  while (cursor <= period.end) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const monthStart = maxDate(new Date(year, month, 1), period.start);
    const monthEnd = minDate(new Date(year, month + 1, 0), period.end);
    const days = [];

    for (let date = monthStart; date <= monthEnd; date = addDays(date, 1)) {
      days.push({
        date,
        key: toDateKey(date),
        number: dayNumber(period, date),
      });
    }

    months.push({
      key: `${year}-${pad(month + 1)}`,
      year,
      month,
      title: new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric",
      }).format(cursor),
      shortTitle: new Intl.DateTimeFormat("fr-FR", {
        month: "short",
        year: "2-digit",
      }).format(cursor),
      days,
    });

    cursor = new Date(year, month + 1, 1);
  }

  return months;
}

function exportProgressImage() {
  const period = getPeriod();
  const days = getPeriodDays(period);
  const months = getPeriodMonths(period);
  const done = completedCount(days);
  const percent = days.length ? Math.round((done / days.length) * 100) : 0;
  const streak = getStreakStats(days, period);
  const theme = currentTheme();
  const width = 1500;
  const columns =
    months.length > 6 ? 4 : Math.min(3, Math.max(1, months.length));
  const cardGap = 22;
  const margin = 56;
  const cardWidth = Math.floor(
    (width - margin * 2 - cardGap * (columns - 1)) / columns,
  );
  const cardHeight = 200;
  const rows = Math.ceil(months.length / columns);
  const height =
    margin + 190 + rows * cardHeight + Math.max(0, rows - 1) * cardGap + margin;

  const canvas = document.createElement("canvas");
  const ratio = 2;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  ctx.fillStyle = theme.bgA;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = theme.accent;
  ctx.font = "800 22px system-ui, sans-serif";
  ctx.fillText("DAY++", margin, margin + 8);

  ctx.fillStyle = theme.ink;
  ctx.font = "900 58px system-ui, sans-serif";
  ctx.fillText(state.config.title, margin, margin + 78);

  ctx.fillStyle = theme.muted;
  ctx.font = "700 24px system-ui, sans-serif";
  ctx.fillText(
    `${formatDate(period.start)} - ${formatDate(period.end)} · ${modeLabel()}`,
    margin,
    margin + 120,
  );

  ctx.textAlign = "right";
  ctx.fillStyle = theme.ink;
  ctx.font = "900 64px system-ui, sans-serif";
  ctx.fillText(`${percent}%`, width - margin, margin + 76);
  ctx.fillStyle = theme.muted;
  ctx.font = "800 22px system-ui, sans-serif";
  ctx.fillText(
    `${done}/${days.length} jours · streak ${streak.current} · record ${streak.best}`,
    width - margin,
    margin + 116,
  );
  ctx.textAlign = "left";

  drawRoundRect(
    ctx,
    margin,
    margin + 148,
    width - margin * 2,
    18,
    9,
    "#eee6ec",
  );
  drawRoundRect(
    ctx,
    margin,
    margin + 148,
    (width - margin * 2) * (percent / 100),
    18,
    9,
    theme.accent,
  );

  months.forEach((month, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = margin + col * (cardWidth + cardGap);
    const y = margin + 196 + row * (cardHeight + cardGap);
    drawExportMonth(ctx, month, x, y, cardWidth, cardHeight, theme);
  });

  const link = document.createElement("a");
  link.download = `${slugify(state.config.title)}-${toDateKey(period.start)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function drawExportMonth(ctx, month, x, y, width, height, theme) {
  const done = month.days.filter((day) => isCompleted(day.date)).length;
  const percent = month.days.length
    ? Math.round((done / month.days.length) * 100)
    : 0;
  const first = new Date(month.year, month.month, 1);
  const last = new Date(month.year, month.month + 1, 0);
  const activeDays = new Map(
    month.days.map((day) => [toDateKey(day.date), day]),
  );
  const weekdays = ["D", "L", "M", "M", "J", "V", "S"];

  drawRoundRect(ctx, x, y, width, height, 12, "#ffffff");
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 2;
  strokeRoundRect(ctx, x, y, width, height, 12);

  ctx.fillStyle = theme.ink;
  ctx.font = "850 22px system-ui, sans-serif";
  ctx.fillText(month.shortTitle, x + 18, y + 34);
  ctx.fillStyle = theme.muted;
  ctx.font = "800 16px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`${percent}%`, x + width - 18, y + 33);
  ctx.textAlign = "left";

  const cellWidth = (width - 36) / 7;
  const dotSize = Math.min(13, cellWidth * 0.34);
  const startX = x + 18;
  const weekLabelY = y + 61;
  const startY = y + 84;
  const rowGap = 18;

  ctx.font = "800 12px system-ui, sans-serif";
  ctx.fillStyle = theme.muted;
  ctx.textAlign = "center";
  weekdays.forEach((label, index) => {
    ctx.fillText(label, startX + index * cellWidth + cellWidth / 2, weekLabelY);
  });
  ctx.textAlign = "left";

  for (
    let dayNumberInMonth = 1;
    dayNumberInMonth <= last.getDate();
    dayNumberInMonth += 1
  ) {
    const date = new Date(month.year, month.month, dayNumberInMonth);
    const key = toDateKey(date);
    const activeDay = activeDays.get(key);
    const cellIndex = first.getDay() + dayNumberInMonth - 1;
    const col = cellIndex % 7;
    const row = Math.floor(cellIndex / 7);
    const cx = startX + col * cellWidth + cellWidth / 2;
    const cy = startY + row * rowGap;

    ctx.beginPath();
    ctx.arc(cx, cy, dotSize / 2, 0, Math.PI * 2);
    ctx.fillStyle =
      activeDay && isCompleted(activeDay.date)
        ? theme.accent
        : activeDay
          ? "#ece7eb"
          : "#f6f2f5";
    ctx.fill();
    if (activeDay && isSameDate(activeDay.date, todayDate())) {
      ctx.strokeStyle = theme.warn;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }
}

function exportBackup() {
  syncActiveProgress();
  const payload = {
    app: "Day++",
    exportedAt: new Date().toISOString(),
    state,
  };
  downloadBlob(
    JSON.stringify(payload, null, 2),
    `${slugify(state.config.title)}-backup.json`,
    "application/json",
  );
}

function restoreBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const payload = JSON.parse(reader.result);
      const restored = payload.state || payload;
      state = normalizeState(restored, createFallbackState(), true);
      saveState();
      applyTheme();
      seedOnboardingForm();
      hideOnboarding();
      render();
      alert("Sauvegarde restaurée.");
    } catch {
      alert("Impossible de lire cette sauvegarde.");
    } finally {
      els.restoreInput.value = "";
    }
  });
  reader.readAsText(file);
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function applyTheme() {
  const theme = currentTheme();
  document.body.dataset.theme = state.config.theme;
  document.documentElement.style.setProperty("--bg", theme.bgA);
  document.documentElement.style.setProperty("--bg-2", theme.bgB);
  document.documentElement.style.setProperty("--surface", "#ffffff");
  document.documentElement.style.setProperty("--ink", theme.ink);
  document.documentElement.style.setProperty("--muted", theme.muted);
  document.documentElement.style.setProperty("--line", theme.line);
  document.documentElement.style.setProperty("--accent", theme.accent);
  document.documentElement.style.setProperty("--accent-soft", theme.accentSoft);
  document.documentElement.style.setProperty("--accent-mid", theme.accentMid);
  document.documentElement.style.setProperty("--done", theme.done);
  document.documentElement.style.setProperty("--done-soft", theme.doneSoft);
  document.documentElement.style.setProperty("--warn", theme.warn);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme.accent);
}

function currentTheme() {
  return themes[state.config.theme] || themes.primary;
}

function modeLabel() {
  return state.config.mode === "flexible" ? "Mode souple" : "Mode strict";
}

function strictHint() {
  return state.config.mode === "flexible"
    ? "Tu peux aussi valider les jours passés dans les autres vues."
    : "";
}

function cleanTitle(value) {
  return (
    String(value || "Progression 365")
      .trim()
      .slice(0, 42) || "Progression 365"
  );
}

function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || ""));
}

function makeProgressionId() {
  if (globalThis.crypto && globalThis.crypto.randomUUID)
    return globalThis.crypto.randomUUID();
  return `progression-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function autoEndDate(duration, start) {
  if (duration === "week") return addDays(start, 6);
  const months = durationMonths[duration] || 12;
  return addDays(addMonthsClamped(start, months), -1);
}

function activeDate(period, today) {
  if (today < period.start) return period.start;
  if (today > period.end) return period.end;
  return today;
}

function parseDateKey(value) {
  if (!value) return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function todayDate() {
  return startOfDay(new Date());
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, amount) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function addMonthsClamped(date, amount) {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const maxDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  target.setDate(Math.min(date.getDate(), maxDay));
  return startOfDay(target);
}

function diffDays(start, end) {
  return Math.round((startOfDay(end) - startOfDay(start)) / DAY_MS);
}

function dayNumber(period, date) {
  return diffDays(period.start, date) + 1;
}

function isWithin(date, period) {
  return date >= period.start && date <= period.end;
}

function isSameDate(a, b) {
  return toDateKey(a) === toDateKey(b);
}

function minDate(a, b) {
  return a < b ? a : b;
}

function maxDate(a, b) {
  return a > b ? a : b;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function weekdayName(date, fallbackIndex) {
  if (date) {
    return new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(date);
  }
  return ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."][
    fallbackIndex
  ];
}

function slugify(value) {
  return (
    String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "progression"
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function drawRoundRect(ctx, x, y, width, height, radius, fillStyle) {
  ctx.fillStyle = fillStyle;
  roundedPath(ctx, x, y, width, height, radius);
  ctx.fill();
}

function strokeRoundRect(ctx, x, y, width, height, radius) {
  roundedPath(ctx, x, y, width, height, radius);
  ctx.stroke();
}

function roundedPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function resizeConfettiCanvas() {
  const ratio = window.devicePixelRatio || 1;
  els.confettiCanvas.width = Math.floor(window.innerWidth * ratio);
  els.confettiCanvas.height = Math.floor(window.innerHeight * ratio);
  els.confettiCanvas.style.width = `${window.innerWidth}px`;
  els.confettiCanvas.style.height = `${window.innerHeight}px`;
  const context = els.confettiCanvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function celebrate() {
  vibrate([45, 35, 80]);
  resizeConfettiCanvas();
  cancelAnimationFrame(confettiFrame);

  const context = els.confettiCanvas.getContext("2d");
  const theme = currentTheme();
  const colors = [
    theme.accent,
    theme.done,
    theme.warn,
    theme.ink,
    theme.accentMid,
  ];
  const particles = Array.from({ length: 130 }, () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight * 0.42,
    vx: (Math.random() - 0.5) * 13,
    vy: Math.random() * -11 - 4,
    size: Math.random() * 12 + 10,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.32,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: Math.random() > 0.22 ? "plus" : "square",
    life: Math.random() * 50 + 70,
  }));

  const draw = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle) => {
      particle.life -= 1;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.22;
      particle.rotation += particle.spin;

      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillStyle = particle.color;
      context.strokeStyle = particle.color;
      context.globalAlpha = Math.max(0, particle.life / 90);

      if (particle.shape === "plus") {
        context.lineWidth = Math.max(2, particle.size * 0.18);
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(-particle.size / 2, 0);
        context.lineTo(particle.size / 2, 0);
        context.moveTo(0, -particle.size / 2);
        context.lineTo(0, particle.size / 2);
        context.stroke();
      } else {
        context.fillRect(
          -particle.size / 2,
          -particle.size / 2,
          particle.size,
          particle.size * 0.64,
        );
      }

      context.restore();
    });

    if (particles.some((particle) => particle.life > 0)) {
      confettiFrame = requestAnimationFrame(draw);
    } else {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };

  draw();
}
