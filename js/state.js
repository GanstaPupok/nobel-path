import { SAVE_KEY, SAVE_VERSION } from './config.js';
import { g } from './text.js';

const LEGACY_KEY = 'nobel_path_legacy';

export let S;
// Наследие — межсессионная мета-прогрессия.
// upgrades: { perkId: level } — купленные улучшения сохраняются навсегда.
export let Legacy = { points: 0, upgrades: {}, runs: 0, tutorialSeen: false, version: SAVE_VERSION };

export function loadLegacy() {
  try {
    const d = localStorage.getItem(LEGACY_KEY);
    if (d) {
      const parsed = JSON.parse(d);
      if (parsed && typeof parsed === 'object') Legacy = parsed;
    }
  } catch (e) { /* битые данные — начинаем с чистого наследия */ }
  if (!Legacy.upgrades || typeof Legacy.upgrades !== 'object') Legacy.upgrades = {};
  if (!Number.isFinite(Legacy.points)) Legacy.points = 0;
  if (!Number.isFinite(Legacy.runs)) Legacy.runs = 0;
  if (typeof Legacy.tutorialSeen !== 'boolean') Legacy.tutorialSeen = false;
}

export function saveLegacy() {
  try { localStorage.setItem(LEGACY_KEY, JSON.stringify(Legacy)); } catch (e) {}
}

export function freshState() {
  return {
    version: SAVE_VERSION,
    age: 7, year: 0, name: 'Алекс', gender: 'm', avatarSeed: Math.random(),
    int: 5, health: 100, charm: 5, money: 0, energy: 2, stress: 0, rep: 0,
    skills: { math: 0, chem: 0, bio: 0, it: 0, write: 0 },
    stage: 'child', spec: null,
    publications: 0, topPubs: 0, discoveries: 0, grants: 0,
    position: 'школьник', actedThisYear: 0,
    log: [], pendingEvent: null, pendingModal: null, pendingCinema: null,
    finalReached: false, final: null,
    achievements: [], achievementDates: {}, flags: {}, started: false,
    dailyLife: null, dailyLifeSeen: false, dailyStreak: { good: 0, bad: 0 },
    backstory: null,
    arcs: { love: null, rival: null, family: null, mentor: null, friend: null, hater: null, coauthor: null, hobby: null },
    rareSeen: [],
    milestones: [],
    chronicle: [],
    track: null,
    project: null,
    lab: { equipment: 0, computer: 0, setup: 0 },
    daily: null,
    eventsThisYear: 0,
    yearCount: 0,
    quests: [],
    minigameDone: { quiz: 0, puzzle: 0, defense: 0, spot: 0 },
    minigamesThisYear: 0,
    treeChoices: {},
    energyBonus: 0,
    recentEvents: [],
    skillPoints: 0,
    boughtPerks: [],
    activeGlobalEvent: null,
    influence: 0,
    enemies: 0,
    globalEventYearsLeft: 0
  };
}

/**
 * Приводит сохранение любой версии к актуальной структуре.
 * Всё, что могло не сохраниться (функции, новые поля), чинится здесь.
 */
function migrate(raw) {
  const s = Object.assign(freshState(), raw || {});

  // Объекты, которые могли быть записаны как null/строки
  s.skills = Object.assign({ math: 0, chem: 0, bio: 0, it: 0, write: 0 }, s.skills || {});
  s.flags = s.flags && typeof s.flags === 'object' ? s.flags : {};
  s.arcs = s.arcs && typeof s.arcs === 'object' ? s.arcs : {};
  ['love', 'rival', 'family', 'mentor', 'friend', 'hater', 'coauthor', 'hobby']
    .forEach(k => { if (s.arcs[k] === undefined) s.arcs[k] = null; });
  s.treeChoices = s.treeChoices || {};
  s.boughtPerks = Array.isArray(s.boughtPerks) ? s.boughtPerks : [];
  s.rareSeen = Array.isArray(s.rareSeen) ? s.rareSeen : [];
  s.recentEvents = Array.isArray(s.recentEvents) ? s.recentEvents : [];
  s.energyBonus = Number.isFinite(s.energyBonus) ? s.energyBonus : 0;
  s.eventsThisYear = Number.isFinite(s.eventsThisYear) ? s.eventsThisYear : 0;
  if (s.project && typeof s.project !== 'object') s.project = null;
  if (s.daily && typeof s.daily !== 'object') s.daily = null;
  s.lab = Object.assign({ equipment: 0, computer: 0, setup: 0 }, s.lab || {});
  s.milestones = Array.isArray(s.milestones) ? s.milestones : [];
  s.chronicle = Array.isArray(s.chronicle) ? s.chronicle : [];
  if (s.track && typeof s.track !== 'string') s.track = null;
  s.achievements = Array.isArray(s.achievements) ? s.achievements : [];
  if (!s.achievementDates || typeof s.achievementDates !== 'object') s.achievementDates = {};
  s.log = Array.isArray(s.log) ? s.log : [];
  s.quests = Array.isArray(s.quests) ? s.quests : [];
  s.minigameDone = Object.assign({ quiz: 0, puzzle: 0, defense: 0, spot: 0 }, s.minigameDone || {});
  s.dailyStreak = Object.assign({ good: 0, bad: 0 }, s.dailyStreak || {});
  s.energy = Number.isFinite(s.energy) ? s.energy : 3;
  s.skillPoints = Number.isFinite(s.skillPoints) ? s.skillPoints : 0;
  s.influence = Number.isFinite(s.influence) ? s.influence : 0;
  s.enemies = Number.isFinite(s.enemies) ? s.enemies : 0;
  s.globalEventYearsLeft = Number.isFinite(s.globalEventYearsLeft) ? s.globalEventYearsLeft : 0;
  s.minigamesThisYear = Number.isFinite(s.minigamesThisYear) ? s.minigamesThisYear : 0;

  // Числовые характеристики: защита от NaN из старых сохранений и событий
  const base = freshState();
  ['int', 'health', 'charm', 'money', 'stress', 'rep', 'publications', 'topPubs', 'discoveries', 'age', 'year']
    .forEach(k => { if (!Number.isFinite(s[k])) s[k] = base[k]; });
  for (const k of Object.keys(s.skills)) {
    if (!Number.isFinite(s.skills[k])) s.skills[k] = 0;
  }

  // Защита от битых значений: характеристики не выходят за границы
  const clampNum = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
  s.health = clampNum(s.health, 0, 100);
  s.stress = clampNum(s.stress, 0, 100);
  s.rep = clampNum(s.rep, 0, 100);
  s.age = Math.max(7, Math.floor(s.age));
  if (!['child', 'uni', 'phd', 'career'].includes(s.stage)) s.stage = 'child';

  // События и модалки содержат функции — после перезагрузки их не восстановить.
  s.pendingEvent = null;
  s.pendingModal = null;
  s.pendingCinema = null;

  // Квесты хранятся как данные; шаблоны подтягиваются по id в quests.js.
  s.quests = s.quests
    .filter(q => q && typeof q.id === 'string')
    .map(q => ({
      id: q.id,
      startAge: Number.isFinite(q.startAge) ? q.startAge : s.age,
      startValue: Number.isFinite(q.startValue) ? q.startValue : 0,
      deadlineAge: Number.isFinite(q.deadlineAge) ? q.deadlineAge : s.age + 3
    }));

  s.version = SAVE_VERSION;
  return s;
}

/**
 * Данные для записи в localStorage.
 * Функции в состоянии недопустимы — они не переживают JSON.
 */
export function snapshot() {
  return JSON.stringify({
    ...S,
    version: SAVE_VERSION,
    pendingEvent: null,
    pendingModal: null,
    pendingCinema: null,
    quests: (S.quests || []).map(q => ({
      id: q.id,
      startAge: q.startAge,
      startValue: q.startValue,
      deadlineAge: q.deadlineAge
    }))
  });
}

/**
 * Полностью заменяет состояние новой жизнью (используется ежедневным
 * испытанием, где нельзя опираться на случайный прогресс).
 */
export function newState(overrides = {}) {
  S = Object.assign(freshState(), overrides);
  saveState();
  return S;
}

export function saveState() {
  try { localStorage.setItem(SAVE_KEY, snapshot()); } catch (e) {}
}

export function loadState() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (!d) return false;
    const raw = JSON.parse(d);
    if (!raw || typeof raw !== 'object') return false;
    S = migrate(raw);
    return true;
  } catch (e) {
    return false;
  }
}

export function initState() {
  loadLegacy();
  if (!loadState()) S = freshState();
  saveState();
}

/** Начать новую жизнь, сохранив накопленное Наследие. */
export function newLife() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  location.reload();
}

export function addLog(msg) {
  if (!S) return;
  S.log.unshift({ age: S.age, msg: g(msg) });
  if (S.log.length > 80) S.log.pop();
}
