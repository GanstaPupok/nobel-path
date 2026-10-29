import { S } from './state.js';
import { g } from './text.js';

/**
 * Хроника жизни — короткая летопись ключевых моментов.
 * В отличие от журнала (последние 80 строк) хранится всю жизнь и
 * показывается отдельным экраном «📜 Хроника».
 */
export function chronicle(icon, text, kind = 'event') {
  if (!S) return;
  if (!Array.isArray(S.chronicle)) S.chronicle = [];
  const entry = { age: S.age, icon, text: g(String(text)), kind };
  // Не дублируем одну и ту же запись, если она уже есть у этого возраста
  const last = S.chronicle[S.chronicle.length - 1];
  if (last && last.age === entry.age && last.text === entry.text) return;
  S.chronicle.push(entry);
  if (S.chronicle.length > 300) S.chronicle.shift();
}

/** Сколько записей в хронике. */
export function chronCount() {
  return Array.isArray(S.chronicle) ? S.chronicle.length : 0;
}

/** Записи, сгруппированные по возрасту (от старших к младшим). */
export function chronicleByAge() {
  const list = Array.isArray(S.chronicle) ? S.chronicle : [];
  const map = new Map();
  for (const entry of list) {
    if (!map.has(entry.age)) map.set(entry.age, []);
    map.get(entry.age).push(entry);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([age, items]) => ({ age, items }));
}
