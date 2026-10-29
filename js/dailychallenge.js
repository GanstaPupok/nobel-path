// Ежедневное испытание: одна и та же жизнь для всех.
// Сид фиксируется по дате, поэтому события и броски совпадают у разных людей.

const RESULTS_KEY = 'nobel_path_daily';

let savedRandom = null;

/** Детерминированный генератор mulberry32. */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Подменяет Math.random на детерминированный поток. */
export function seedRandom(seed) {
  if (!savedRandom) savedRandom = Math.random;
  Math.random = mulberry32(hashString(String(seed)));
}

export function resetRandom() {
  if (savedRandom) Math.random = savedRandom;
}

/** Ключ сегодняшнего дня в локальной зоне. */
export function todayKey() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function dailySeed(date = todayKey()) {
  return `nobel-path-${date}`;
}

export function loadDailyResults() {
  try {
    return JSON.parse(localStorage.getItem(RESULTS_KEY)) || {};
  } catch (e) {
    return {};
  }
}

export function todayResult() {
  return loadDailyResults()[todayKey()] || null;
}

/** Очки для сравнения результатов. */
export function dailyScore(s) {
  let score = 0;
  score += (s.achievements || []).length * 10;
  score += (s.publications || 0) * 3;
  score += (s.topPubs || 0) * 5;
  score += (s.discoveries || 0) * 6;
  score += Math.round((s.rep || 0) / 2);
  score += Math.round((s.money || 0) / 50000);
  if (s.final === 'nobel') score += 100;
  if (s.flags && s.flags.projectDone) score += 20;
  return score;
}

export function saveDailyResult(s) {
  if (!s.daily) return null;
  const entry = {
    date: s.daily.date,
    name: s.name,
    final: s.final,
    score: dailyScore(s),
    age: s.age,
    publications: s.publications,
    discoveries: s.discoveries,
    achievements: (s.achievements || []).length
  };
  const all = loadDailyResults();
  // оставляем лучший результат за день
  if (!all[entry.date] || all[entry.date].score < entry.score) {
    all[entry.date] = entry;
    try { localStorage.setItem(RESULTS_KEY, JSON.stringify(all)); } catch (e) {}
  }
  return entry;
}

/** Текст для «поделиться». */
export function shareText(entry) {
  return [
    `🎓 Путь к Нобелевке — испытание дня ${entry.date}`,
    `${entry.final} · ${entry.score} очков`,
    `публикаций ${entry.publications}, открытий ${entry.discoveries}, достижений ${entry.achievements}`,
    'ganstapupok.github.io/nobel-path'
  ].join('\n');
}
