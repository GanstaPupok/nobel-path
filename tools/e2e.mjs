/**
 * E2E-проверка игры в настоящем браузере (Chrome DevTools Protocol).
 * Без внешних зависимостей: только Node 22+ и установленный Chrome/Edge.
 *
 *   node tools/serve.mjs 8080          # в одном терминале
 *   node tools/e2e.mjs http://127.0.0.1:8080
 *
 * Путь к браузеру можно задать через CHROME_PATH.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL = process.argv[2] || 'http://127.0.0.1:8080/';
const PORT = 9333;

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].filter(Boolean);

const CHROME = CANDIDATES.find(p => existsSync(p));
if (!CHROME) {
  console.error('Не найден Chrome/Edge. Укажите путь в переменной CHROME_PATH.');
  process.exit(2);
}

const profile = mkdtempSync(join(tmpdir(), 'nobel-e2e-'));
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--mute-audio', '--window-size=420,900',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const j = await r.json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch (e) { /* браузер ещё стартует */ }
    await sleep(250);
  }
  throw new Error('Браузер не запустился');
}

const ws = new WebSocket(await getWsUrl());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let nextId = 1;
const pending = new Map();
const errors = [];
const consoleErrors = [];

ws.onmessage = ev => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    return;
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    const d = msg.params.exceptionDetails;
    errors.push(`${d.text} ${d.exception?.description || ''}`.trim());
  }
  if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
    consoleErrors.push(`console.${msg.params.type}: ` + msg.params.args.map(a => a.value ?? a.description ?? '').join(' '));
  }
  if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
    consoleErrors.push(`log: ${msg.params.entry.text}`);
  }
};

function send(method, params = {}, sessionId) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

const { targetInfos } = await send('Target.getTargets');
const page = targetInfos.find(t => t.type === 'page');
const { sessionId } = await send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);

await S('Runtime.enable');
await S('Log.enable');
await S('Page.enable');

const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok, extra });
  console.log(`${ok ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`);
};

async function evalJs(expr) {
  const r = await S('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) {
    throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  }
  return r.result.value;
}
const click = sel => evalJs(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return false;e.click();return true})()`);

/** Закрывает всё, что могло перекрыть экран: события, модалки, мини-игры. */
async function clearOverlays() {
  for (let i = 0; i < 6; i++) {
    const what = await evalJs(`(() => {
      const opt = document.querySelector('.modal .opt');
      if (opt) { opt.click(); return 'modal'; }
      const ev = document.querySelector('.event .opts button');
      if (ev) { ev.click(); return 'event'; }
      const close = document.querySelector('.mg-close');
      if (close) { close.click(); return 'mg-close'; }
      const mgOpt = document.querySelector('.mg-options button');
      if (mgOpt) { mgOpt.click(); return 'mg-option'; }
      return null;
    })()`);
    if (!what) return;
    await sleep(180);
  }
}

const save = () => evalJs(`(()=>{const r=localStorage.getItem('nobel_path_v6');return r?JSON.parse(r):null})()`);

await S('Page.navigate', { url: URL });
await sleep(1400);

// ---------- Стартовый экран ----------
check('стартовый экран отрисован', await evalJs(`!!document.querySelector('.start-screen')`));
const cards = await evalJs(`document.querySelectorAll('.backstory-card').length`);
check('карточки предысторий', cards === 6, `${cards} шт.`);
check('кнопка старта заблокирована без выбора', await evalJs(`document.getElementById('startBtn').disabled`));

// ---------- Наследие ----------
await evalJs(`localStorage.setItem('nobel_path_legacy', JSON.stringify({points:500, upgrades:{}, runs:0})); location.reload();`);
await sleep(1100);
const buy = await evalJs(`(() => {
  const b = document.querySelector('.buy-btn[data-id="intellect"]');
  if (!b) return 'нет кнопки';
  const before = document.getElementById('legacyPoints').textContent;
  b.click();
  return before + ' -> ' + document.getElementById('legacyPoints').textContent;
})()`);
check('покупка наследия списывает очки', /500 ОН\s*->\s*350 ОН/.test(buy), buy);

// ---------- Старт игры ----------
await evalJs(`(() => {
  document.querySelector('.backstory-card[data-bs="prodigy"]').click();
  const inp = document.getElementById('inpName');
  inp.value = 'Тест';
  inp.dispatchEvent(new Event('input'));
})()`);
check('кнопка старта активна после выбора', await evalJs(`!document.getElementById('startBtn').disabled`));
await click('#startBtn');
await sleep(600);

check('игровой экран отрисован', await evalJs(`!!document.querySelector('.hero')`));
const actionCount = await evalJs(`document.querySelectorAll('#actions button').length`);
check('действия доступны', actionCount >= 4, `${actionCount} кнопок`);
check('показана цель этапа', await evalJs(`!!document.querySelector('.goal')`),
  await evalJs(`document.querySelector('.goal')?.textContent || ''`));
check('наследие применилось к старту', await evalJs(`JSON.parse(localStorage.getItem('nobel_path_v6')).int >= 22`),
  `интеллект ${(await save())?.int}`);

// ---------- Несколько лет игры ----------
for (let year = 0; year < 5; year++) {
  for (let act = 0; act < 2; act++) {
    await evalJs(`(() => {
      const btns = [...document.querySelectorAll('#actions button')]
        .filter(b => !b.disabled && !b.classList.contains('end-year') && !b.classList.contains('quest'));
      if (btns.length) btns[0].click();
    })()`);
    await sleep(160);
    await clearOverlays();
  }
  await clearOverlays();
  const ended = await click('.end-year');
  if (!ended) {
    // возможно, показался финал или мы застряли в модалке
    await clearOverlays();
    await click('.end-year');
    await sleep(200);
  }
  await sleep(260);
}

let s = await save();
check('возраст растёт и сохраняется', s && s.age >= 11, `возраст ${s?.age}, этап ${s?.stage}`);
check('квесты сохраняются без функций', (s?.quests || []).every(q => typeof q.id === 'string'),
  `${s?.quests?.length ?? 0} квестов`);
check('в сохранении нет функций-полей', s && s.pendingEvent === null && s.pendingModal === null);

// ---------- Перезагрузка ----------
await evalJs(`location.reload()`);
await sleep(1100);
s = await save();
check('после перезагрузки игра продолжается', await evalJs(`!!document.querySelector('.hero')`), `возраст ${s?.age}`);

// ---------- Дерево навыков ----------
const treeOpened = await evalJs(`(() => {
  const b = document.getElementById('treeBtn');
  if (!b) return false;
  b.click();
  return !!document.querySelector('.tree-modal');
})()`);
check('дерево навыков открывается', treeOpened);
await click('#closeTree');
await sleep(200);

// ---------- Достижения ----------
const achOpened = await evalJs(`(() => {
  document.getElementById('achBtn').click();
  return document.querySelectorAll('.ach-cell').length;
})()`);
check('экран достижений открывается', achOpened > 20, `${achOpened} ячеек`);
await click('#closeAch');
await sleep(200);

// ---------- Ключевые моменты жизни ----------
await evalJs(`(() => {
  const raw = JSON.parse(localStorage.getItem('nobel_path_v6'));
  raw.age = 22; raw.stage = 'phd'; raw.position = 'аспирант'; raw.milestones = [];
  raw.pendingEvent = null; raw.pendingModal = null;
  localStorage.setItem('nobel_path_v6', JSON.stringify(raw));
})()`);
await evalJs(`location.reload()`);
await sleep(1000);
await click('.end-year');
await sleep(600);
check('веха жизни показывается как событие', await evalJs(`!!document.querySelector('.event.milestone')`),
  await evalJs(`document.querySelector('.event.milestone h3')?.textContent || 'нет'`));
await clearOverlays();

// ---------- Проект и трекер Нобеля ----------
await evalJs(`(() => {
  const raw = JSON.parse(localStorage.getItem('nobel_path_v6'));
  raw.age = 34; raw.stage = 'career'; raw.position = 'м.н.с.'; raw.spec = 'phys';
  raw.project = { id: 'quantum', tier: 0, progress: 40 };
  raw.rep = 60; raw.int = 70; raw.discoveries = 2; raw.energy = 3; raw.actedThisYear = 0;
  raw.money = 200000; raw.pendingEvent = null; raw.pendingModal = null;
  raw.arcs = {
    love: { stage: 'married', years: 4, love: 65, partner: { id: 'creative', name: 'Аня', icon: '🎨', trait: 'creative' } },
    family: { stage: 'kid', years: 2, childName: 'Миша', bond: 65 },
    rival: { name: 'Виктор', stage: 'clash', years: 3 },
    mentor: { name: 'профессор Лихачёв', stage: 'supported', years: 2, bond: 60 },
    friend: null, hater: null, coauthor: null, hobby: null
  };
  localStorage.setItem('nobel_path_v6', JSON.stringify(raw));
})()`);
await evalJs(`location.reload()`);
await sleep(1000);
check('карточка проекта отображается', await evalJs(`!!document.querySelector('.project-card')`),
  await evalJs(`document.querySelector('.project-meta')?.textContent || 'нет'`));
check('трекер Нобеля отображается', await evalJs(`document.querySelectorAll('.nobel-chip').length === 3`));
check('действия разложены по вкладкам', await evalJs(`document.querySelectorAll('.action-tab').length >= 2`),
  `${await evalJs(`document.querySelectorAll('.action-tab').length`)} вкладок`);
check('карточки арок отношений видны', await evalJs(`document.querySelectorAll('.arc-card').length >= 3`),
  `${await evalJs(`document.querySelectorAll('.arc-card').length`)} карточек`);

// вкладка «Жизнь»: действие с партнёром повышает чувства
await evalJs(`(() => {
  const tab = [...document.querySelectorAll('.action-tab')].find(t => t.textContent.includes('Жизнь'));
  if (tab) tab.click();
})()`);
await sleep(250);
const loveBefore = (await save())?.arcs?.love?.love;
await evalJs(`(() => {
  const b = [...document.querySelectorAll('#actions button')].find(x => x.textContent.includes('Время с партнёром'));
  if (b) b.click();
})()`);
await sleep(450);
await clearOverlays();
const loveAfter = (await save())?.arcs?.love?.love;
check('время с партнёром укрепляет отношения', loveAfter > loveBefore, `${loveBefore} → ${loveAfter}`);

const projectBefore = (await save())?.project?.progress;
await evalJs(`(() => {
  const tab = [...document.querySelectorAll('.action-tab')].find(t => t.textContent.includes('Наука'));
  if (tab) tab.click();
})()`);
await sleep(200);
await evalJs(`(() => {
  const b = [...document.querySelectorAll('#actions button')].find(x => x.textContent.includes('Работать над проектом'));
  if (b) b.click();
})()`);
await sleep(500);
await clearOverlays();
const projectAfter = (await save())?.project;
check('действие двигает проект вперёд', projectAfter && (projectAfter.progress > projectBefore || projectAfter.tier > 0),
  `прогресс ${projectBefore} → ${projectAfter?.progress}, этап ${projectAfter?.tier}`);

// ---------- Финал ----------
await evalJs(`(() => {
  const raw = JSON.parse(localStorage.getItem('nobel_path_v6'));
  raw.age = 57; raw.stage = 'career'; raw.position = 'м.н.с.'; raw.rep = 50; raw.int = 60;
  localStorage.setItem('nobel_path_v6', JSON.stringify(raw));
})()`);
await evalJs(`location.reload()`);
await sleep(1100);
await clearOverlays();
await click('.end-year');
await sleep(700);
check('финальный экран показан', await evalJs(`!!document.querySelector('.final')`),
  await evalJs(`document.querySelector('.final h2')?.textContent || 'нет'`));
check('финал показывает наследие', await evalJs(`/Наследи/.test(document.querySelector('.final')?.textContent||'')`));
const legacyAfter = await evalJs(`JSON.parse(localStorage.getItem('nobel_path_legacy') || '{}')`);
check('наследие начислено за жизнь', (legacyAfter.points || 0) > 350, `${legacyAfter.points} ОН`);

// ---------- Новая жизнь ----------
await click('#resetBtn');
await sleep(1000);
check('новая жизнь начинается со старт-экрана', await evalJs(`!!document.querySelector('.start-screen')`));
const legacyKeep = await evalJs(`JSON.parse(localStorage.getItem('nobel_path_legacy') || '{}')`);
check('наследие сохраняется между жизнями', (legacyKeep.points || 0) >= (legacyAfter.points || 0));

// ---------- Ошибки ----------
const realErrors = errors.filter(e => !/favicon/i.test(e));
check('нет JS-исключений', realErrors.length === 0, realErrors.slice(0, 3).join(' | '));
check('нет ошибок в консоли', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

const failed = results.filter(r => !r.ok);
console.log(`\n--- итог: ${results.length - failed.length}/${results.length} проверок ---`);
if (errors.length) console.log('исключения:', errors);
if (consoleErrors.length) console.log('консоль:', consoleErrors);

ws.close();
chrome.kill();
process.exit(failed.length ? 1 : 0);
