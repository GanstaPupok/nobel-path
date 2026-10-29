/**
 * Headless-симулятор «Пути к Нобелевке».
 * Прогоняет сотни жизней без браузера: ловит падения, NaN, зависания
 * и показывает, каких финалов реально достигает игрок.
 *
 *   node tools/simulate.mjs [жизней]
 *
 * Ничего не пишет на диск — только отчёт в консоль.
 */
const store = new Map();
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
  clear: () => store.clear()
};

class El {
  constructor(tag = 'div') {
    this.tagName = tag; this.children = []; this.style = {}; this.dataset = {};
    this.classList = { add() {}, remove() {}, contains() { return false; } };
    this._html = '';
  }
  appendChild(c) { this.children.push(c); return c; }
  replaceChildren() { this.children = []; }
  querySelectorAll() { return []; }
  querySelector() { return null; }
  addEventListener() {}
  remove() {}
  set innerHTML(v) { this._html = String(v); }
  get innerHTML() { return this._html; }
}

globalThis.document = {
  getElementById: () => null,
  createElement: t => new El(t),
  querySelector: () => null,
  querySelectorAll: () => [],
  body: new El('body'),
  documentElement: { setAttribute() {} },
  addEventListener() {}
};
globalThis.window = {};
globalThis.confirm = () => false;

const BASE = '../js/';
const stateMod = await import(BASE + 'state.js');
const { getActions } = await import(BASE + 'actions.js');
const { endYear } = await import(BASE + 'year.js');
const { applyBackstory } = await import(BASE + 'backstory.js');
const { rollEvent, makeCtx } = await import(BASE + 'events/engine.js');
const { getAvailableTreeBranch, applyTreeChoice } = await import(BASE + 'tree.js');
const { currentTier, projectStatus } = await import(BASE + 'project.js');
const { GATES, RENT } = await import(BASE + 'config.js');
const { rentForAge } = await import(BASE + 'year.js');

const S = () => stateMod.S;

function assertFinite(tag) {
  const s = S();
  const bad = [];
  for (const k of ['int', 'health', 'charm', 'money', 'stress', 'rep', 'energy', 'publications', 'discoveries', 'age', 'influence', 'enemies']) {
    if (!Number.isFinite(s[k])) bad.push(`${k}=${s[k]}`);
  }
  for (const [k, v] of Object.entries(s.skills || {})) if (!Number.isFinite(v)) bad.push(`skills.${k}=${v}`);
  if (bad.length) throw new Error(`Некорректные значения [${tag}]: ${bad.join(', ')}`);
}

function reload() {
  stateMod.saveState();
  stateMod.initState(); // как перезагрузка страницы
}

/** Выбор действия «умным» игроком: сначала цели этапа, потом выживание. */
function smartPick(actions) {
  const s = S();
  const byName = n => actions.find(a => a.name.includes(n));
  const usable = actions.filter(a => !a.disabled);
  if (!usable.length) return null;

  // Выживание превыше всего
  if (s.stress > 65) {
    const rest = byName('Отдохнуть') || byName('Отпуск') || byName('Гулять') || byName('Спорт');
    if (rest) return rest;
  }
  if (s.money < rentForAge(s.age + 1) && s.stage === 'career') {
    const job = byName('Работать');
    if (job) return job;
  }

  if (s.stage === 'child') {
    if (s.int < GATES.uni.int) return byName('Читать научные книги') || byName('Учиться в школе');
    if (s.stress > 50) return byName('Спорт') || byName('Гулять');
    return byName('Учиться в школе') || usable[0];
  }
  if (s.stage === 'uni') {
    if (s.skills.write < 8) return byName('Учиться в вузе');
    if (s.publications < GATES.phd.publications) return byName('Написать курсовую');
    if (s.int < GATES.phd.int) return byName('Учиться в вузе');
    if (s.money < RENT[1].sum) return byName('Подработка');
    return byName('Лабораторная работа') || usable[0];
  }
  if (s.stage === 'phd') {
    const tier = currentTier();
    if (tier && s.money >= tier.cost) return byName('Работать над проектом');
    if (s.discoveries < GATES.career.discoveries) return byName('Провести эксперимент') || byName('Работа в лаборатории');
    if (s.skills.write <= 12) return byName('Работа в лаборатории');
    return byName('Написать статью') || usable[0];
  }
  // career
  if (!s.project) return byName('Выбрать научную тему') || usable[0];
  const tier = currentTier();
  if (tier && s.money >= tier.cost && !s.flags.projectDone) return byName('Работать над проектом');
  if (s.money < 20000) return byName('Работать');
  if (s.rep < 60) return byName('Опубликовать статью');
  if (s.influence < 30) return byName('Наладить связи');
  if (s.int < 90) return byName('Читать литературу');
  const promo = byName('Заявка на повышение');
  if (promo && !promo.disabled) return promo;
  if (tier && s.money >= tier.cost) return byName('Работать над проектом');
  return usable[0];
}

function runLife({ policy = 'smart', reloads = false } = {}) {
  localStorage.clear();
  stateMod.initState();
  const s = S();
  s.name = 'Тест'; s.started = true; s.stage = 'child'; s.backstory = 'teacher';
  applyBackstory();

  let guard = 0;
  const seen = new Set(['child']);
  const usedActions = new Set();
  let eventsSeen = 0;
  try {
    while (!S().finalReached && guard++ < 300) {
      const actions = getActions();
      let pick = null;
      if (policy === 'smart') pick = smartPick(actions);
      else {
        const usable = actions.filter(a => !a.disabled);
        pick = usable.length ? usable[(Math.random() * usable.length) | 0] : null;
      }
      if (pick) {
        S().actedThisYear += pick.cost;
        pick.fn();
        usedActions.add(pick.name);
      }

      // Модалки (выбор темы, специализация) — выбираем первый вариант
      if (S().pendingModal && S().pendingModal.opts) {
        const opt = S().pendingModal.opts[(Math.random() * S().pendingModal.opts.length) | 0];
        opt.f();
        S().pendingModal = null;
      }

      if (Math.random() < 0.3 && !S().pendingEvent) {
        const ev = rollEvent();
        if (ev) {
          S().pendingEvent = ev;
          ev.opts[(Math.random() * ev.opts.length) | 0].f(makeCtx());
          S().pendingEvent = null;
          eventsSeen++;
        }
      }

      // Жизненные выборы (в игре их показывает afterAction)
      const branch = getAvailableTreeBranch();
      if (branch && Math.random() < 0.4) {
        applyTreeChoice(branch.key, branch.options[(Math.random() * branch.options.length) | 0].id);
      }
      assertFinite('действие');

      if (reloads && Math.random() < 0.3) reload();

      endYear();
      // события и вехи, назначенные концом года
      if (S().pendingEvent) {
        const ev = S().pendingEvent;
        ev.opts[(Math.random() * ev.opts.length) | 0].f(makeCtx());
        S().pendingEvent = null;
        eventsSeen++;
      }
      S().pendingModal = null;
      seen.add(S().stage);
      assertFinite('конец года');
      S().pendingModal = null;
      S().pendingEvent = null;
    }
  } catch (e) {
    return { crash: e.message, stack: (e.stack || '').split('\n')[1]?.trim(), age: S().age, stage: S().stage };
  }

  if (!S().finalReached) return { crash: 'жизнь не завершилась за 300 лет', age: S().age, stage: S().stage };

  const o = S();
  return {
    crash: null, final: o.final, age: o.age, stage: o.stage, position: o.position,
    int: o.int, rep: o.rep, pubs: o.publications, disc: o.discoveries,
    money: o.money, stress: o.stress, health: o.health,
    ach: o.achievements.length, skillPoints: o.skillPoints,
    tree: Object.keys(o.treeChoices).length, salary: o.position,
    seenStages: [...seen], usedActions: usedActions.size, eventsSeen,
    project: projectStatus() ? (S().flags.projectDone ? 'done' : 'in progress') : 'none',
    milestones: (o.milestones || []).length,
    love: o.arcs.love ? o.arcs.love.stage : 'none',
    family: o.arcs.family ? o.arcs.family.stage : 'none',
    mentor: o.arcs.mentor ? o.arcs.mentor.stage : 'none',
    rival: o.arcs.rival ? o.arcs.rival.stage : 'none'
  };
}

function report(title, results) {
  console.log(`\n=== ${title} ===`);
  const crashed = results.filter(r => r.crash);
  if (crashed.length) {
    console.log(`💥 падений: ${crashed.length}/${results.length}`);
    console.log('   первое:', crashed[0].crash, crashed[0].stack || '');
  } else {
    console.log(`✅ падений: 0/${results.length}`);
  }

  const ok = results.filter(r => !r.crash);
  if (!ok.length) return;

  const finals = {};
  for (const r of ok) finals[r.final] = (finals[r.final] || 0) + 1;
  const total = ok.length;
  console.log('финалы:', Object.entries(finals)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${Math.round(v / total * 100)}%`).join(' · '));

  const avg = k => Math.round(ok.reduce((a, r) => a + r[k], 0) / total);
  console.log(`среднее: возраст ${avg('age')} · инт ${avg('int')} · репутация ${avg('rep')} · ` +
    `публикации ${avg('pubs')} · открытия ${avg('disc')} · деньги ${avg('money')} · ` +
    `стресс ${avg('stress')} · здоровье ${avg('health')}`);
  console.log(`макс. публикаций: ${Math.max(...ok.map(r => r.pubs))} · макс. открытий: ${Math.max(...ok.map(r => r.disc))}`);
  console.log(`очков навыков за жизнь (сред.): ${avg('skillPoints')} · выборов древа (сред.): ${avg('tree')}`);
  console.log(`разных действий за жизнь: ${avg('usedActions')} · событий за жизнь: ${avg('eventsSeen')} · вех: ${avg('milestones')}`);
  const proj = {};
  for (const r of ok) proj[r.project] = (proj[r.project] || 0) + 1;
  console.log('проект:', Object.entries(proj).map(([k, v]) => `${k} ${Math.round(v / total * 100)}%`).join(' · '));

  const dist = key => {
    const m = {};
    for (const r of ok) m[r[key]] = (m[r[key]] || 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round(v / total * 100)}%`).join(' · ');
  };
  console.log('любовь:', dist('love'));
  console.log('семья:', dist('family'));
  console.log('наставник:', dist('mentor'));
  console.log('соперник:', dist('rival'));

  const reached = {};
  for (const r of ok) reached[r.stage] = (reached[r.stage] || 0) + 1;
  console.log('этап на финале:', Object.entries(reached).map(([k, v]) => `${k} ${v}/${total}`).join(' · '));

  const via = { uni: 0, phd: 0 };
  for (const r of ok) {
    if (r.seenStages.includes('uni')) via.uni++;
    if (r.seenStages.includes('phd')) via.phd++;
  }
  console.log(`прошли вуз: ${via.uni}/${total} · аспирантуру: ${via.phd}/${total}`);
}

const N = Number(process.argv[2] || 200);
console.log(`Симуляция: ${N} жизней на стратегию`);

report('Умный игрок, без перезагрузок', Array.from({ length: N }, () => runLife({ policy: 'smart' })));
report('Умный игрок, перезагрузка страницы каждый третий год', Array.from({ length: N }, () => runLife({ policy: 'smart', reloads: true })));
report('Случайный игрок', Array.from({ length: N }, () => runLife({ policy: 'random' })));
