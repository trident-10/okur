const STORAGE_KEY = "okur-data-v1";
const PREFS_KEY = "okur-prefs-v1";
const PROGRESS_KEY = "okur-progress-v1";
const VOCAB_KEY = "okur-vocab-v1";
const SPEEDS = [0.4, 0.6, 0.8, 1, 1.2, 1.5, 1.8, 2.2];
const FONT_SIZES = ["1.25rem", "1.45rem", "1.7rem", "2rem"];

const CHUNK_MODES = {
  comfort: { minWords: 5, targetWords: 7, maxWords: 9, maxChars: 48 },
  focus: { minWords: 3, targetWords: 5, maxWords: 6, maxChars: 34 },
};

const SMALL_WORDS = new Set([
  "a", "an", "the", "of", "to", "in", "on", "at", "for", "from", "by", "with",
  "as", "or", "and", "but", "nor", "so", "yet", "is", "are", "was", "were",
  "be", "am", "do", "does", "did", "if", "than", "that", "this", "these",
  "those", "my", "your", "his", "her", "its", "our", "their", "into", "onto",
  "over", "under", "about", "after", "before", "between", "through", "during",
]);

const BREAK_BEFORE = new Set([
  "and", "but", "or", "nor", "so", "yet", "because", "when", "while",
  "although", "though", "unless", "until", "after", "before", "since",
  "whereas", "which", "who", "whom", "whose", "where", "wherever", "whether",
]);

const editorScreen = document.getElementById("editor-screen");
const readerScreen = document.getElementById("reader-screen");
const textInput = document.getElementById("text-input");
const wordCount = document.getElementById("word-count");
const startBtn = document.getElementById("start-btn");
const resumeBtn = document.getElementById("resume-btn");
const vocabBtn = document.getElementById("vocab-btn");
const historySection = document.getElementById("history-section");
const historyList = document.getElementById("history-list");
const homePanelMsg = document.getElementById("home-panel-msg");
const homePanelActions = document.getElementById("home-panel-actions");
const homeStatStreak = document.getElementById("home-stat-streak");
const homeStatVocab = document.getElementById("home-stat-vocab");
const homeStatTexts = document.getElementById("home-stat-texts");
const quickStart = document.getElementById("quick-start");
const quickStartList = document.getElementById("quick-start-list");

const SAMPLE_TEXTS = [
  {
    title: "Günlük alışkanlık",
    text: "Learning English every day is a small habit with a big result. When you read aloud for just ten minutes, your mouth learns the rhythm of the language. Mistakes are normal. Keep going, and your confidence grows with every page.",
  },
  {
    title: "Kısa hikâye",
    text: "On a quiet morning, Maya opened a new book and whispered the first sentence. The words felt strange at first, then familiar. She paused, tried again, and smiled. Practice turned fear into curiosity, and curiosity into skill.",
  },
  {
    title: "Konuşma pratiği",
    text: "Excuse me, could you tell me how to get to the library? Sure. Walk straight for two blocks, then turn left at the café. You will see a tall brick building. Thank you so much. You are welcome. Have a nice day!",
  },
];
const scroller = document.getElementById("scroller");
const prompterText = document.getElementById("prompter-text");
const playBtn = document.getElementById("play-btn");
const slowerBtn = document.getElementById("slower-btn");
const fasterBtn = document.getElementById("faster-btn");
const backBtn = document.getElementById("back-btn");
const fontBtn = document.getElementById("font-btn");
const speedLabel = document.getElementById("speed-label");
const finishBtn = document.getElementById("finish-btn");
const markHint = document.getElementById("mark-hint");
const doneOverlay = document.getElementById("done-overlay");
const againBtn = document.getElementById("again-btn");
const reviewFromDoneBtn = document.getElementById("review-from-done-btn");
const doneBackBtn = document.getElementById("done-back-btn");
const streakLabel = document.getElementById("streak-label");
const settingsBtn = document.getElementById("settings-btn");
const settingsOverlay = document.getElementById("settings-overlay");
const settingsClose = document.getElementById("settings-close");
const vocabOverlay = document.getElementById("vocab-overlay");
const vocabList = document.getElementById("vocab-list");
const vocabEmpty = document.getElementById("vocab-empty");
const vocabReviewBtn = document.getElementById("vocab-review-btn");
const vocabClearBtn = document.getElementById("vocab-clear-btn");
const vocabClose = document.getElementById("vocab-close");
const reminderToggle = document.getElementById("reminder-toggle");
const reminderTime = document.getElementById("reminder-time");
const installBtn = document.getElementById("install-btn");
const installHint = document.getElementById("install-hint");
const wipeBtn = document.getElementById("clear-texts-btn");
const metaTheme = document.getElementById("meta-theme-color");
const statTime = document.getElementById("stat-time");
const statWpm = document.getElementById("stat-wpm");
const statPauses = document.getElementById("stat-pauses");
const statStreak = document.getElementById("stat-streak");
const editorActions = document.querySelector(".editor-actions");

const state = {
  playing: false,
  speedIndex: 3,
  fontIndex: 1,
  rafId: 0,
  lastTs: 0,
  wakeLock: null,
  lines: [],
  offset: 0,
  track: null,
  wordTotal: 0,
  sessionStarted: false,
  activeMs: 0,
  pauseCount: 0,
  resumeFromProgress: false,
  reviewMode: false,
  reviewRestore: null,
};

let deferredInstall = null;
let reminderTimer = 0;
let swReg = null;

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadPrefs() {
  try {
    return {
      theme: "dark",
      orientation: "any",
      chunkMode: "comfort",
      reminderOn: false,
      reminderTime: "20:00",
      streak: 0,
      lastReadDate: "",
      lastReminderDate: "",
      ...(JSON.parse(localStorage.getItem(PREFS_KEY)) || {}),
    };
  } catch {
    return {
      theme: "dark",
      orientation: "any",
      chunkMode: "comfort",
      reminderOn: false,
      reminderTime: "20:00",
      streak: 0,
      lastReadDate: "",
      lastReminderDate: "",
    };
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

function hashText(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || null;
  } catch {
    return null;
  }
}

function saveProgress(payload) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

function clearProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    /* ignore */
  }
}

function loadVocab() {
  try {
    const parsed = JSON.parse(localStorage.getItem(VOCAB_KEY));
    if (parsed && Array.isArray(parsed.items)) return parsed;
  } catch {
    /* ignore */
  }
  return { items: [] };
}

function saveVocab(data) {
  try {
    localStorage.setItem(VOCAB_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function normalizeWord(raw) {
  return String(raw || "")
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu, "")
    .replace(/’/g, "'");
}

function displayWord(raw) {
  const key = normalizeWord(raw);
  if (!key) return "";
  const match = String(raw).match(/[\p{L}\p{N}'][\p{L}\p{N}']*/u);
  return match ? match[0] : key;
}

function hasVocab(key) {
  return loadVocab().items.some((item) => item.key === key);
}

function addVocab(raw, context) {
  const key = normalizeWord(raw);
  const display = displayWord(raw);
  if (!key || key.length < 2 || !/[\p{L}]/u.test(key)) return null;

  const data = loadVocab();
  const existing = data.items.find((item) => item.key === key);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    if (context && !existing.context) existing.context = context;
    existing.display = display || existing.display;
  } else {
    data.items.unshift({
      key,
      display: display || key,
      context: context || "",
      addedAt: todayKey(),
      count: 1,
    });
  }
  saveVocab(data);
  updateVocabButton();
  return key;
}

function removeVocab(key) {
  const data = loadVocab();
  data.items = data.items.filter((item) => item.key !== key);
  saveVocab(data);
  updateVocabButton();
}

function clearVocab() {
  const ok = window.confirm("Tüm işaretli kelimeler silinecek.");
  if (!ok) return;
  saveVocab({ items: [] });
  updateVocabButton();
  renderVocabOverlay();
}

function updateVocabButton() {
  const n = loadVocab().items.length;
  vocabBtn.textContent = n ? `Kelimeler · ${n}` : "Kelimeler";
  reviewFromDoneBtn.hidden = n === 0;
  updateHomePanel();
}

function updateHomePanel() {
  if (!homePanelMsg || !homePanelActions) return;

  const prefs = loadPrefs();
  const today = todayKey();
  const streak = prefs.streak || 0;
  const readToday = prefs.lastReadDate === today;
  const vocabCount = loadVocab().items.length;
  const textCount = (loadData().history || []).length;

  if (homeStatStreak) homeStatStreak.textContent = String(streak);
  if (homeStatVocab) homeStatVocab.textContent = String(vocabCount);
  if (homeStatTexts) homeStatTexts.textContent = String(textCount);

  homePanelMsg.classList.remove("is-done");
  if (readToday && streak > 0) {
    homePanelMsg.textContent = `${streak} günlük seri — bugün tamamlandı.`;
    homePanelMsg.classList.add("is-done");
  } else if (streak > 0) {
    homePanelMsg.textContent = `${streak} günlük seri. Bugün okumayı unutma.`;
  } else {
    homePanelMsg.textContent = "Kısa günlük okumalar İngilizceni güçlendirir.";
  }

  homePanelActions.innerHTML = "";
  if (vocabCount > 0) {
    const reviewBtn = document.createElement("button");
    reviewBtn.type = "button";
    reviewBtn.className = "home-panel-chip";
    reviewBtn.textContent = `${vocabCount} kelime · Tekrar et`;
    reviewBtn.addEventListener("click", startVocabReview);
    homePanelActions.appendChild(reviewBtn);
  }

  updateQuickStart();
}

function applySampleText(text) {
  textInput.value = text;
  persistCurrent();
  updateWordCount();
  textInput.focus();
}

function updateQuickStart() {
  if (!quickStart || !quickStartList) return;
  const empty = !textInput.value.trim();
  quickStart.hidden = !empty;
  if (!empty) return;

  if (quickStartList.childElementCount) return;

  SAMPLE_TEXTS.forEach((sample) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quick-start-btn";
    const preview = sample.text.replace(/\s+/g, " ").slice(0, 64);
    btn.innerHTML = `<strong>${escapeHtml(sample.title)}</strong><span>${escapeHtml(preview)}…</span>`;
    btn.addEventListener("click", () => applySampleText(sample.text));
    quickStartList.appendChild(btn);
  });
}

function updateMarkHint() {
  if (!markHint) return;
  markHint.hidden = state.playing || readerScreen.hidden;
}

function buildReviewText(items) {
  return items
    .map((item) => {
      if (item.context && item.context.trim()) return item.context.trim();
      return item.display;
    })
    .join("\n\n");
}

function renderVocabOverlay() {
  const items = loadVocab().items;
  vocabList.innerHTML = "";
  vocabEmpty.hidden = items.length > 0;
  vocabReviewBtn.disabled = items.length === 0;
  vocabClearBtn.hidden = items.length === 0;

  items.forEach((item) => {
    const li = document.createElement("li");
    const main = document.createElement("div");
    main.className = "vocab-main";
    const title = document.createElement("strong");
    title.textContent = item.display;
    main.appendChild(title);
    if (item.context) {
      const ctx = document.createElement("p");
      ctx.className = "vocab-ctx";
      ctx.textContent = item.context;
      main.appendChild(ctx);
    }
    const forget = document.createElement("button");
    forget.type = "button";
    forget.className = "vocab-forget";
    forget.textContent = "Öğrendim";
    forget.addEventListener("click", () => {
      removeVocab(item.key);
      renderVocabOverlay();
      refreshMarkedWords();
    });
    li.appendChild(main);
    li.appendChild(forget);
    vocabList.appendChild(li);
  });
}

function openVocabOverlay() {
  renderVocabOverlay();
  vocabOverlay.hidden = false;
}

function closeVocabOverlay() {
  vocabOverlay.hidden = true;
}

function refreshMarkedWords() {
  if (!state.track) return;
  const marked = new Set(loadVocab().items.map((item) => item.key));
  state.track.querySelectorAll(".word").forEach((el) => {
    el.classList.toggle("is-marked", marked.has(el.dataset.key));
  });
}

function toggleWordMark(wordEl) {
  const key = wordEl.dataset.key;
  if (!key) return;
  const line = wordEl.closest(".prompt-line");
  const context = line ? line.textContent.trim() : "";
  if (hasVocab(key)) {
    removeVocab(key);
    wordEl.classList.remove("is-marked");
  } else {
    addVocab(wordEl.textContent, context);
    wordEl.classList.add("is-marked");
  }
}

function startVocabReview() {
  const items = loadVocab().items;
  if (!items.length) return;
  state.reviewRestore = textInput.value;
  state.reviewMode = true;
  textInput.value = buildReviewText(items);
  updateWordCount();
  closeVocabOverlay();
  doneOverlay.hidden = true;
  openReader(false);
}

function clearAllTexts() {
  const ok = window.confirm("Kutudaki metin ve önceki metinler silinecek. Streak ve ayarlar kalır.");
  if (!ok) return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem("okur-current-v2");
  } catch {
    /* ignore */
  }

  textInput.value = "";
  state.lines = [];
  state.offset = 0;
  state.track = null;
  state.wordTotal = 0;
  resetSessionTimers();
  applyOffset(0);
  renderEditor();
  updateWordCount();
  settingsOverlay.hidden = true;
}

function saveData(data) {
  const write = (payload) => localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  try {
    write(data);
  } catch {
    const slim = {
      current: data.current,
      history: (data.history || []).slice(0, 5).map((item) => ({
        date: item.date,
        words: item.words,
        text: item.text.length > 500 ? `${item.text.slice(0, 500)}…` : item.text,
      })),
    };
    try {
      write(slim);
    } catch {
      try {
        write({ current: data.current, history: [] });
      } catch {
        try {
          localStorage.setItem("okur-current-v2", data.current || "");
        } catch {
          /* ignore */
        }
      }
    }
  }
}

function persistCurrent() {
  const text = textInput.value;
  try {
    localStorage.setItem("okur-current-v2", text);
  } catch {
    /* ignore */
  }
  const data = loadData();
  data.current = text;
  saveData(data);
  updateResumeChip();
}

function loadData() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { current: "", history: [] };
    const backup = localStorage.getItem("okur-current-v2");
    if (backup && backup.length > (parsed.current || "").length) {
      parsed.current = backup;
    }
    return parsed;
  } catch {
    return { current: localStorage.getItem("okur-current-v2") || "", history: [] };
  }
}

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function formatDuration(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const color = theme === "light" ? "#f3f1ec" : "#161616";
  if (metaTheme) metaTheme.content = color;
}

async function applyOrientation(mode) {
  try {
    if (!screen.orientation || !screen.orientation.lock) return;
    if (mode === "any") {
      if (screen.orientation.unlock) screen.orientation.unlock();
      return;
    }
    await screen.orientation.lock(mode);
  } catch {
    /* browsers may block outside fullscreen / PWA */
  }
}

function daysBetween(a, b) {
  if (!a || !b) return Infinity;
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const start = Date.UTC(ay, am - 1, ad);
  const end = Date.UTC(by, bm - 1, bd);
  return Math.round((end - start) / 86400000);
}

/** Drop broken streaks when the app opens on a later day. */
function refreshStreakStatus() {
  const prefs = loadPrefs();
  const today = todayKey();
  const last = prefs.lastReadDate || "";
  const gap = daysBetween(last, today);

  if (!last) {
    prefs.streak = 0;
  } else if (gap > 1) {
    // Missed at least one full day
    prefs.streak = 0;
  }

  savePrefs(prefs);
  updateStreakLabel();
  return prefs;
}

function updateStreakLabel() {
  const prefs = loadPrefs();
  const today = todayKey();
  const streak = prefs.streak || 0;
  streakLabel.classList.remove("is-done", "is-waiting");
  if (prefs.lastReadDate === today && streak > 0) {
    streakLabel.textContent = `${streak} · tamam`;
    streakLabel.classList.add("is-done");
  } else if (streak > 0) {
    streakLabel.textContent = `${streak} gün`;
    streakLabel.classList.add("is-waiting");
  } else {
    streakLabel.textContent = "0 gün";
  }
  updateHomePanel();
}

function bumpStreak() {
  const prefs = loadPrefs();
  const today = todayKey();
  const last = prefs.lastReadDate || "";
  const gap = daysBetween(last, today);

  if (last === today) {
    // Already counted today
    updateStreakLabel();
    return prefs.streak || 0;
  }

  if (gap === 1) {
    prefs.streak = (prefs.streak || 0) + 1;
  } else {
    prefs.streak = 1;
  }

  prefs.lastReadDate = today;
  savePrefs(prefs);
  updateStreakLabel();
  return prefs.streak;
}

function updateResumeChip() {
  const progress = loadProgress();
  const text = textInput.value.trim();
  const match = progress && text && progress.hash === hashText(text) && progress.offset > 24;
  resumeBtn.hidden = !match;
}

function renderEditor() {
  const data = loadData();
  if (!textInput.value && data.current) {
    textInput.value = data.current;
  }
  updateWordCount();
  renderHistory(data.history);
  refreshStreakStatus();
  updateResumeChip();
  updateVocabButton();
  updateHomePanel();
}

function textareaMaxHeight() {
  const dockRaw = getComputedStyle(document.documentElement).getPropertyValue("--dock-h").trim();
  const dockH = Number.parseFloat(dockRaw) || 112;
  const topbar = document.querySelector(".topbar");
  const meta = document.querySelector(".editor-meta");
  const editorBottom = document.getElementById("editor-bottom");
  const topbarH = topbar ? topbar.offsetHeight : 44;
  const metaH = meta ? meta.offsetHeight : 32;
  const bottomH = editorBottom ? editorBottom.offsetHeight : 0;
  const editorPad = 18;
  const safeTop = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--safe-top")) || 0;
  return Math.max(
    120,
    window.innerHeight - dockH - topbarH - metaH - editorPad - bottomH - safeTop - 16
  );
}

function autoResizeTextarea() {
  if (!textInput) return;
  textInput.style.height = "0px";
  const max = textareaMaxHeight();
  const next = Math.min(textInput.scrollHeight, max);
  textInput.style.height = `${Math.max(120, next)}px`;
}

function updateWordCount() {
  const n = countWords(textInput.value);
  wordCount.textContent = `${n} kelime`;
  startBtn.disabled = n === 0;
  updateQuickStart();
  autoResizeTextarea();
}

function renderHistory(history) {
  historyList.innerHTML = "";
  if (!history.length) {
    historySection.hidden = true;
    updateHomePanel();
    autoResizeTextarea();
    return;
  }
  historySection.hidden = false;
  updateHomePanel();
  autoResizeTextarea();
  history.slice(0, 12).forEach((item) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    const preview = item.text.trim().slice(0, 72).replace(/\s+/g, " ");
    btn.innerHTML = `<span class="history-preview">${escapeHtml(preview)}${item.text.trim().length > 72 ? "…" : ""}</span><span class="meta">${formatDate(item.date)} · ${item.words} kelime</span>`;
    btn.addEventListener("click", () => {
      textInput.value = item.text;
      persistCurrent();
      updateWordCount();
      textInput.focus();
    });
    li.appendChild(btn);
    historyList.appendChild(li);
  });
  autoResizeTextarea();
}

function saveToHistory(text) {
  try {
    localStorage.setItem("okur-current-v2", text);
  } catch {
    /* ignore */
  }
  const data = loadData();
  data.current = text;
  const entry = { date: todayKey(), text, words: countWords(text) };
  data.history = [entry, ...data.history.filter((item) => item.date !== entry.date || item.text !== text)].slice(0, 8);
  saveData(data);
}

function getChunkConfig() {
  const mode = loadPrefs().chunkMode === "focus" ? "focus" : "comfort";
  return CHUNK_MODES[mode];
}

function wordKey(raw) {
  return String(raw || "")
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu, "")
    .replace(/’/g, "'");
}

function isSmallWord(raw) {
  return SMALL_WORDS.has(wordKey(raw));
}

function isHardEnd(raw) {
  if (isKeepTogetherToken(raw)) return false;
  return /[.!?…]"?$/.test(raw) || /[.!?…]['’]"?$/.test(raw);
}

function isSoftEnd(raw) {
  return /[,;:—–]$/.test(raw) || /[,;:]['’]"?$/.test(raw);
}

function shouldBreakBefore(raw) {
  return BREAK_BEFORE.has(wordKey(raw));
}

function isKeepTogetherToken(raw) {
  const w = String(raw || "").replace(/^[("'“‘]+|[)"'”’.,;:!?…]+$/g, "");
  return /^(?:[ap]\.m\.?)$/i.test(w)
    || /^(?:[ap]m)$/i.test(w)
    || /^(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc)$/i.test(w)
    || /^\d{1,2}:\d{2}$/.test(w)
    || /^\d{1,2}:\d{2}\s*[ap]\.m\.?$/i.test(String(raw || "").replace(/[("'“‘]+|[)"'”’,;:!?…]+$/g, ""));
}

function normalizeTimeMarks(text) {
  return text
    .replace(/\b(\d{1,2}:\d{2})\s*([ap])\s*\.\s*m\s*\.?/gi, "$1 $2∯m∯")
    .replace(/\b(\d{1,2})(?:\s*\.)?\s*([ap])\s*\.\s*m\s*\.?/gi, "$1 $2∯m∯")
    .replace(/\b(\d{1,2})\s*([ap])\.?\s*m\b/gi, "$1 $2∯m∯")
    .replace(/\b(\d{1,2})\s*([ap])m\b/gi, "$1 $2∯m∯")
    .replace(/\b([ap])\s*\.\s*m\s*\.?/gi, "$1∯m∯");
}

function protectAbbreviations(text) {
  return normalizeTimeMarks(text)
    .replace(/\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|approx|Dept|Univ)\./gi, (m) => m.replace(".", "∯"))
    .replace(/\b(e\.g|i\.e|u\.s|u\.k)\./gi, (m) => m.replace(/\./g, "∯"))
    .replace(/(\d)\.(\d)/g, "$1∯$2");
}

function restoreAbbreviations(text) {
  return text.replace(/∯/g, ".");
}

function splitSentences(text) {
  const protectedText = protectAbbreviations(text);
  const parts = protectedText.match(/[^.!?…]+[.!?…]+(?:["'”’])?|[^.!?…]+$/g) || [protectedText];
  return parts.map((part) => restoreAbbreviations(part).trim()).filter(Boolean);
}

function joinWords(words) {
  return words.join(" ");
}

function tokenizeWords(sentence) {
  const raw = sentence.split(/\s+/).filter(Boolean);
  const words = [];
  for (let i = 0; i < raw.length; i += 1) {
    const cur = raw[i];
    const next = raw[i + 1];
    const third = raw[i + 2];

    if (
      /^\d{1,2}(?::\d{2})?$/.test(cur) &&
      next &&
      /^(?:[ap]\.m\.?|[ap]m)[,;:!?…]*$/i.test(next)
    ) {
      words.push(`${cur} ${next}`);
      i += 1;
      continue;
    }

    if (/^[ap]\.?$/i.test(cur) && next && /^m\.?[,;:!?…]*$/i.test(next)) {
      const punct = (next.match(/[,;:!?…]+$/) || [""])[0];
      words.push(`${cur.charAt(0).toLowerCase()}.m.${punct}`.replace(/\.\.([,;:!?…])/g, ".$1"));
      i += 1;
      continue;
    }

    if (
      /^\d{1,2}\.?$/.test(cur) &&
      next &&
      /^[ap]\.?$/i.test(next) &&
      third &&
      /^m\.?[,;:!?…]*$/i.test(third)
    ) {
      const punct = (third.match(/[,;:!?…]+$/) || [""])[0];
      words.push(
        `${cur.replace(/\.$/, "")} ${next.charAt(0).toLowerCase()}.m.${punct}`.replace(
          /\.\.([,;:!?…])/g,
          ".$1"
        )
      );
      i += 2;
      continue;
    }

    words.push(cur);
  }
  return words;
}

function packWords(words, cfg) {
  const lines = [];
  let i = 0;

  while (i < words.length) {
    const remaining = words.length - i;
    if (remaining <= cfg.maxWords) {
      lines.push(joinWords(words.slice(i)));
      break;
    }

    let take = Math.min(cfg.targetWords, remaining);
    const searchMax = Math.min(cfg.maxWords, remaining);
    const searchMin = Math.min(cfg.minWords, searchMax);

    let softAt = -1;
    for (let j = searchMax; j >= searchMin; j -= 1) {
      const w = words[i + j - 1];
      if (isSoftEnd(w) || isHardEnd(w)) {
        softAt = j;
        break;
      }
    }
    if (softAt > 0) {
      take = softAt;
    } else {
      let conjAt = -1;
      for (let j = Math.min(take + 2, searchMax); j >= searchMin; j -= 1) {
        if (j < remaining && shouldBreakBefore(words[i + j])) {
          conjAt = j;
          break;
        }
      }
      if (conjAt >= searchMin) take = conjAt;
    }

    // Never split a glued time token mid-way (already one token),
    // and avoid ending right before a.m./p.m.
    while (
      take < searchMax &&
      /^(?:[ap]\.m\.?|[ap]m)[,;:!?…]*$/i.test(words[i + take] || "")
    ) {
      take += 1;
    }

    while (
      take > searchMin &&
      joinWords(words.slice(i, i + take)).length > cfg.maxChars
    ) {
      take -= 1;
    }

    while (
      take < searchMax &&
      isSmallWord(words[i + take - 1]) &&
      !isSoftEnd(words[i + take - 1]) &&
      !isHardEnd(words[i + take - 1])
    ) {
      const nextLen = joinWords(words.slice(i, i + take + 1)).length;
      if (nextLen > cfg.maxChars + 10) break;
      take += 1;
    }

    const leftover = remaining - take;
    if (leftover > 0 && leftover < cfg.minWords && take + leftover <= cfg.maxWords + 1) {
      take = remaining;
    } else if (leftover === 1 && take < searchMax) {
      take += 1;
    }

    if (take < 1) take = 1;
    lines.push(joinWords(words.slice(i, i + take)));
    i += take;
  }

  return lines;
}

function chunkText(text) {
  const cleaned = text
    .replace(/^(#{1,6})\s+/gm, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!cleaned) return [];

  const cfg = getChunkConfig();
  const lines = [];
  const paragraphs = cleaned.split(/\n\s*\n/).map((p) => p.replace(/\n/g, " ").trim()).filter(Boolean);

  paragraphs.forEach((paragraph) => {
    splitSentences(paragraph).forEach((sentence) => {
      const words = tokenizeWords(sentence);
      if (!words.length) return;
      if (words.length <= cfg.maxWords && joinWords(words).length <= cfg.maxChars + 12) {
        lines.push(joinWords(words));
        return;
      }
      packWords(words, cfg).forEach((line) => lines.push(line));
    });
  });

  return lines;
}

function renderPrompter(text, startOffset = 0) {
  state.lines = chunkText(text);
  state.wordTotal = countWords(text);
  state.track = null;

  const marked = new Set(loadVocab().items.map((item) => item.key));
  prompterText.replaceChildren();
  const track = document.createElement("div");
  track.className = "prompt-track";

  state.lines.forEach((line) => {
    const lineEl = document.createElement("div");
    lineEl.className = "prompt-line";
    const words = line.split(/\s+/).filter(Boolean);
    words.forEach((token, index) => {
      const key = normalizeWord(token);
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = token;
      if (key) {
        span.dataset.key = key;
        if (marked.has(key)) span.classList.add("is-marked");
      }
      lineEl.appendChild(span);
      if (index < words.length - 1) {
        lineEl.appendChild(document.createTextNode(" "));
      }
    });
    track.appendChild(lineEl);
  });

  prompterText.appendChild(track);
  state.track = track;

  const credit = document.createElement("div");
  credit.className = "prompt-credit";
  credit.setAttribute("aria-hidden", "true");
  credit.innerHTML = `Yapan<br><strong>Mete Artun Altay</strong>`;
  track.appendChild(credit);

  document.documentElement.style.setProperty("--read-size", FONT_SIZES[state.fontIndex]);
  applyOffset(Math.max(0, startOffset));
  updateFinishButton();
}

function applyOffset(y) {
  state.offset = y;
  if (state.track) {
    state.track.style.transform = `translate3d(0, ${-y}px, 0)`;
  }
  updateFinishButton();
}

function maxOffset() {
  if (!state.track) return 0;
  const content = state.track.scrollHeight;
  const view = scroller.clientHeight;
  // Wait until text + credit have scrolled fully past the reading band
  return Math.max(0, content + view * 0.28);
}

function updateFinishButton() {
  if (!finishBtn) return;
  const canFinish = !readerScreen.hidden && state.sessionStarted && !state.playing;
  finishBtn.hidden = !canFinish;
}

function pixelsPerSecond() {
  return 46 * SPEEDS[state.speedIndex];
}

function updateSpeedLabel() {
  speedLabel.textContent = `${SPEEDS[state.speedIndex].toFixed(1)}×`;
}

function bumpSpeed(delta) {
  state.speedIndex = Math.max(0, Math.min(SPEEDS.length - 1, state.speedIndex + delta));
  updateSpeedLabel();
}

function persistSessionProgress(text) {
  if (!text) return;
  saveProgress({
    hash: hashText(text),
    offset: state.offset,
    speedIndex: state.speedIndex,
    fontIndex: state.fontIndex,
    updatedAt: Date.now(),
  });
  updateResumeChip();
}

async function lockScreen() {
  try {
    if ("wakeLock" in navigator) {
      state.wakeLock = await navigator.wakeLock.request("screen");
    }
  } catch {
    state.wakeLock = null;
  }
}

function unlockScreen() {
  if (state.wakeLock) {
    state.wakeLock.release().catch(() => {});
    state.wakeLock = null;
  }
}

function tick(ts) {
  if (!state.playing) return;
  if (!state.lastTs) state.lastTs = ts;
  const delta = Math.min(Math.max(ts - state.lastTs, 0), 40);
  state.lastTs = ts;
  state.activeMs += delta;

  const next = state.offset + (pixelsPerSecond() * delta) / 1000;
  const max = maxOffset();
  if (max > 0 && next >= max) {
    applyOffset(max);
    finishSession(true);
    return;
  }
  applyOffset(next);
  state.rafId = requestAnimationFrame(tick);
}

function startScrolling() {
  if (!state.lines.length) return;
  state.playing = true;
  state.sessionStarted = true;
  state.lastTs = 0;
  readerScreen.classList.remove("is-paused");
  playBtn.textContent = "Duraklat";
  updateMarkHint();
  updateFinishButton();
  lockScreen();
  cancelAnimationFrame(state.rafId);
  state.rafId = requestAnimationFrame(tick);
}

function pauseScrolling(countPause = true) {
  const wasPlaying = state.playing;
  state.playing = false;
  cancelAnimationFrame(state.rafId);
  state.rafId = 0;
  readerScreen.classList.add("is-paused");
  playBtn.textContent = "Devam";
  updateMarkHint();
  updateFinishButton();
  unlockScreen();
  if (countPause && wasPlaying && state.sessionStarted) {
    state.pauseCount += 1;
  }
  persistSessionProgress(textInput.value.trim());
}

function showSummary(streak) {
  const minutes = state.activeMs / 60000;
  const wpm = minutes > 0 ? Math.round(state.wordTotal / minutes) : 0;
  statTime.textContent = formatDuration(state.activeMs);
  statWpm.textContent = String(wpm);
  statPauses.textContent = String(state.pauseCount);
  statStreak.textContent = String(streak);
  updateVocabButton();
  if (finishBtn) finishBtn.hidden = true;
  doneOverlay.hidden = false;
}

function finishSession(completed) {
  pauseScrolling(false);
  playBtn.textContent = "Başlat";
  updateMarkHint();
  updateFinishButton();
  if (!completed) return;
  clearProgress();
  updateResumeChip();
  const streak = bumpStreak();
  showSummary(streak);
}

function resetSessionTimers() {
  state.activeMs = 0;
  state.pauseCount = 0;
  state.sessionStarted = false;
}

function resetPromptPosition() {
  applyOffset(0);
  resetSessionTimers();
}

function openReader(fromResume) {
  const text = textInput.value.trim();
  if (!text) return;
  if (!state.reviewMode) saveToHistory(text);

  const progress = loadProgress();
  const same = progress && progress.hash === hashText(text);
  let startOffset = 0;
  if (fromResume && same) {
    startOffset = progress.offset || 0;
    if (typeof progress.speedIndex === "number") state.speedIndex = progress.speedIndex;
    if (typeof progress.fontIndex === "number") state.fontIndex = progress.fontIndex;
  } else if (!fromResume) {
    clearProgress();
  }

  resetSessionTimers();
  renderPrompter(text, startOffset);
  updateSpeedLabel();
  doneOverlay.hidden = true;
  editorScreen.hidden = true;
  if (editorActions) editorActions.hidden = true;
  readerScreen.hidden = false;
  readerScreen.classList.add("is-paused");
  playBtn.textContent = "Başlat";
  state.resumeFromProgress = Boolean(fromResume && same);
  updateMarkHint();
  updateFinishButton();
}

function closeReader() {
  if (state.sessionStarted && state.offset > 24 && !state.reviewMode) {
    persistSessionProgress(textInput.value.trim());
  }
  pauseScrolling(false);
  playBtn.textContent = "Başlat";
  doneOverlay.hidden = true;
  readerScreen.hidden = true;
  editorScreen.hidden = false;
  if (editorActions) editorActions.hidden = false;
  if (finishBtn) finishBtn.hidden = true;
  if (state.reviewMode && typeof state.reviewRestore === "string") {
    textInput.value = state.reviewRestore;
    persistCurrent();
    state.reviewRestore = null;
  }
  state.reviewMode = false;
  updateMarkHint();
  renderEditor();
}

async function ensureNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

async function fireReminder() {
  const prefs = loadPrefs();
  const today = todayKey();
  if (prefs.lastReadDate === today) return;
  if (prefs.lastReminderDate === today) return;
  if (!(await ensureNotificationPermission())) return;

  prefs.lastReminderDate = today;
  savePrefs(prefs);

  const payload = {
    type: "notify",
    title: "Okur",
    body: "Bugünkü İngilizce metnini okuma zamanı.",
  };

  if (swReg) {
    swReg.active?.postMessage(payload);
    return;
  }
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(payload.title, { body: payload.body, icon: "assets/icon.svg" });
  }
}

function scheduleReminderChecks() {
  clearInterval(reminderTimer);
  reminderTimer = window.setInterval(() => {
    const prefs = loadPrefs();
    if (!prefs.reminderOn) return;
    const [hh, mm] = (prefs.reminderTime || "20:00").split(":").map(Number);
    const now = new Date();
    if (now.getHours() === hh && now.getMinutes() === mm) {
      fireReminder();
    }
  }, 30000);
}

function syncSettingsUI() {
  const prefs = loadPrefs();
  applyTheme(prefs.theme);
  applyOrientation(prefs.orientation || "any");
  reminderToggle.checked = Boolean(prefs.reminderOn);
  reminderTime.value = prefs.reminderTime || "20:00";
  const chunkMode = prefs.chunkMode === "focus" ? "focus" : "comfort";

  document.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.theme === prefs.theme);
  });
  document.querySelectorAll("[data-chunk]").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.chunk === chunkMode);
  });
}

textInput.addEventListener("paste", (event) => {
  const clip = event.clipboardData?.getData("text/plain");
  if (!clip) return;
  event.preventDefault();
  const start = textInput.selectionStart ?? textInput.value.length;
  const end = textInput.selectionEnd ?? start;
  textInput.value = `${textInput.value.slice(0, start)}${clip}${textInput.value.slice(end)}`;
  const cursor = start + clip.length;
  textInput.setSelectionRange(cursor, cursor);
  updateWordCount();
  persistCurrent();
});

textInput.addEventListener("input", () => {
  updateWordCount();
  persistCurrent();
});

startBtn.addEventListener("click", () => openReader(false));
resumeBtn.addEventListener("click", () => openReader(true));
backBtn.addEventListener("click", closeReader);
doneBackBtn.addEventListener("click", closeReader);
if (finishBtn) {
  finishBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    finishSession(true);
  });
}

againBtn.addEventListener("click", () => {
  doneOverlay.hidden = true;
  resetPromptPosition();
  playBtn.textContent = "Başlat";
});

playBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  if (state.playing) pauseScrolling();
  else startScrolling();
});

slowerBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  bumpSpeed(-1);
});

fasterBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  bumpSpeed(1);
});

speedLabel.addEventListener("click", (event) => {
  event.stopPropagation();
  state.speedIndex = (state.speedIndex + 1) % SPEEDS.length;
  updateSpeedLabel();
});

fontBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  state.fontIndex = (state.fontIndex + 1) % FONT_SIZES.length;
  document.documentElement.style.setProperty("--read-size", FONT_SIZES[state.fontIndex]);
});

scroller.addEventListener(
  "touchmove",
  (event) => {
    if (state.playing) event.preventDefault();
  },
  { passive: false }
);

scroller.addEventListener("click", (event) => {
  const wordEl = event.target.closest(".word");
  if (wordEl && wordEl.dataset.key && !state.playing) {
    event.stopPropagation();
    toggleWordMark(wordEl);
    return;
  }
  if (state.playing) pauseScrolling();
  else startScrolling();
});

vocabBtn.addEventListener("click", openVocabOverlay);
vocabClose.addEventListener("click", closeVocabOverlay);
vocabReviewBtn.addEventListener("click", startVocabReview);
vocabClearBtn.addEventListener("click", clearVocab);
reviewFromDoneBtn.addEventListener("click", startVocabReview);

vocabOverlay.addEventListener("click", (event) => {
  if (event.target === vocabOverlay) closeVocabOverlay();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && state.playing) pauseScrolling();
  if (!document.hidden) refreshStreakStatus();
});

window.addEventListener("focus", () => {
  refreshStreakStatus();
});

settingsBtn.addEventListener("click", () => {
  syncSettingsUI();
  settingsOverlay.hidden = false;
});

settingsClose.addEventListener("click", () => {
  settingsOverlay.hidden = true;
});

settingsOverlay.addEventListener("click", (event) => {
  if (event.target === settingsOverlay) settingsOverlay.hidden = true;
});

document.querySelectorAll("[data-theme]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const prefs = loadPrefs();
    prefs.theme = btn.dataset.theme;
    savePrefs(prefs);
    syncSettingsUI();
  });
});

document.querySelectorAll("[data-chunk]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const prefs = loadPrefs();
    prefs.chunkMode = btn.dataset.chunk === "focus" ? "focus" : "comfort";
    savePrefs(prefs);
    syncSettingsUI();
    if (!readerScreen.hidden) {
      renderPrompter(textInput.value.trim(), state.offset || 0);
    }
  });
});

reminderToggle.addEventListener("change", async () => {
  const prefs = loadPrefs();
  prefs.reminderOn = reminderToggle.checked;
  if (prefs.reminderOn) {
    const ok = await ensureNotificationPermission();
    if (!ok) {
      reminderToggle.checked = false;
      prefs.reminderOn = false;
    }
  }
  savePrefs(prefs);
});

reminderTime.addEventListener("change", () => {
  const prefs = loadPrefs();
  prefs.reminderTime = reminderTime.value || "20:00";
  savePrefs(prefs);
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstall = event;
  installBtn.hidden = false;
  installHint.textContent = "Telefonda uygulama gibi açmak için ekle.";
});

installBtn.addEventListener("click", async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  installBtn.hidden = true;
});

wipeBtn.addEventListener("click", clearAllTexts);

window.addEventListener("appinstalled", () => {
  installBtn.hidden = true;
  installHint.textContent = "Uygulama ana ekrana eklendi.";
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js?v=39")
    .then((reg) => {
      swReg = reg;
    })
    .catch(() => {});
}

syncSettingsUI();
scheduleReminderChecks();
renderEditor();
updateSpeedLabel();
autoResizeTextarea();
window.addEventListener("resize", autoResizeTextarea);
window.addEventListener("orientationchange", () => {
  window.setTimeout(autoResizeTextarea, 150);
});
