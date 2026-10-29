import { ALL_EVENTS } from './index.js';
import { S, addLog } from '../state.js';
import { playSound } from '../audio.js';
import { addAchievement } from '../achievements.js';
import { addProjectProgress } from '../project.js';
import { chronicle } from '../chronicle.js';
import { queueCinema } from '../cinema.js';

/**
 * Контекст события — обёртки над состоянием игры.
 * Все сеттеры зажимают значения в допустимые границы, чтобы события
 * не могли загнать характеристики в NaN или отрицательные числа.
 */
export function makeCtx() {
  return {
    get age() { return S.age; },
    get gender() { return S.gender; },
    get stage() { return S.stage; },
    get position() { return S.position; },
    get int() { return S.int; }, set int(v) { S.int = Math.max(0, v); },
    get health() { return S.health; }, set health(v) { S.health = Math.max(0, Math.min(100, v)); },
    get charm() { return S.charm; }, set charm(v) { S.charm = Math.max(0, v); },
    get money() { return S.money; }, set money(v) { S.money = Math.max(0, v); },
    get stress() { return S.stress; }, set stress(v) { S.stress = Math.max(0, Math.min(100, v)); },
    get rep() { return S.rep; }, set rep(v) { S.rep = Math.max(0, Math.min(100, v)); },
    get energy() { return S.energy; }, set energy(v) { S.energy = v; },
    get influence() { return S.influence; }, set influence(v) { S.influence = Math.max(0, v); },
    get enemies() { return S.enemies; }, set enemies(v) { S.enemies = Math.max(0, v); },
    get publications() { return S.publications; }, set publications(v) { S.publications = v; },
    get discoveries() { return S.discoveries; }, set discoveries(v) { S.discoveries = v; },
    get skills() { return S.skills; },
    get arcs() { return S.arcs; },
    get flags() { return S.flags; },
    get project() { return S.project; },
    d20: () => Math.floor(Math.random() * 20) + 1,
    log: (m) => addLog(m),
    sound: (n) => playSound(n),
    ach: (id) => addAchievement(id),
    chronicle: (icon, text) => chronicle(icon, text),
    cinema: (data) => queueCinema(data),
    projectProgress: (n) => { addProjectProgress(n).forEach(m => addLog(m)); },
    setArc: (name, data) => { S.arcs[name] = data; },
    arc: (name) => S.arcs[name],
    /** Меняет числовую характеристику арки (любовь, связь с ребёнком) в пределах 0..100. */
    bump: (name, key, delta) => {
      const a = S.arcs[name];
      if (!a) return;
      a[key] = Math.max(0, Math.min(100, (a[key] || 0) + delta));
    },
    /** Переводит арку на следующую стадию, сохраняя остальные поля. */
    advance: (name, stage, extra = {}) => {
      if (!S.arcs[name]) return;
      Object.assign(S.arcs[name], { stage }, extra);
    }
  };
}

export function checkWhen(w) {
  if (!w) return true;
  if (w.minAge !== undefined && S.age < w.minAge) return false;
  if (w.maxAge !== undefined && S.age > w.maxAge) return false;
  if (w.stage) {
    const stages = Array.isArray(w.stage) ? w.stage : [w.stage];
    if (!stages.includes(S.stage)) return false;
  }
  if (w.flag && !S.flags[w.flag]) return false;
  if (w.spec && S.spec !== w.spec) return false;
  if (w.rep !== undefined && S.rep < w.rep) return false;
  if (w.int !== undefined && S.int < w.int) return false;
  if (w.arc) {
    const arc = S.arcs[w.arc];
    if (!arc) return false;
    if (w.arcStage) {
      const stages = Array.isArray(w.arcStage) ? w.arcStage : [w.arcStage];
      if (!stages.includes(arc.stage)) return false;
    }
    // Минимальная «глубина» арки: сколько лет она уже тянется
    if (w.minArcYears !== undefined && (arc.years || 0) < w.minArcYears) return false;
  }
  if (w.noArc && S.arcs[w.noArc]) return false;
  if (w.hasArc && !S.arcs[w.hasArc]) return false;
  if (w.minLove !== undefined && (!S.arcs.love || (S.arcs.love.love || 0) < w.minLove)) return false;
  return true;
}

/** Случайное событие с учётом редкости и недавно увиденных. */
export function rollEvent() {
  const ctx = makeCtx();
  const recent = S.recentEvents || [];

  const pool = ALL_EVENTS.filter(e => {
    if (!e.opts || !e.text) return false;
    if (!checkWhen(e.when)) return false;
    if (e.cond && !e.cond(ctx)) return false;
    if (e.rare && e.rareId && S.rareSeen.includes(e.rareId)) return false;
    if (recent.includes(e.text)) return false;
    return true;
  });
  if (!pool.length) return null;

  // Сюжетные арки важнее случайных vignette. Каждая арка получает свой
  // «ход»: иначе одна активная линия (например, любовь) съедает все годы
  // и до детей или наставника дело не доходит.
  const arcPool = pool.filter(e => e.when && (e.when.arc || e.when.noArc) && !e.arcMinor);
  let chosenPool = pool;
  if (arcPool.length && Math.random() < 0.7) {
    const byArc = new Map();
    for (const e of arcPool) {
      const key = e.when.arc || e.when.noArc || 'other';
      if (!byArc.has(key)) byArc.set(key, []);
      byArc.get(key).push(e);
    }
    const keys = [...byArc.keys()];
    chosenPool = byArc.get(keys[(Math.random() * keys.length) | 0]);
  }

  // Редкие события выпадают в 3 раза реже обычных.
  const weights = chosenPool.map(e => (e.rare ? 1 / 3 : 1) * (e.weight || 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let ev = chosenPool[chosenPool.length - 1];
  for (let i = 0; i < chosenPool.length; i++) {
    r -= weights[i];
    if (r <= 0) { ev = chosenPool[i]; break; }
  }

  if (ev.rare && ev.rareId && !S.rareSeen.includes(ev.rareId)) S.rareSeen.push(ev.rareId);

  // Не повторяем одни и те же события подряд
  if (!S.recentEvents) S.recentEvents = [];
  S.recentEvents.push(ev.text);
  if (S.recentEvents.length > 6) S.recentEvents.shift();

  return ev;
}
