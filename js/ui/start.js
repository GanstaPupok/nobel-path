import { BACKSTORIES, LEGACY_PERKS } from '../config.js';
import { S, saveState, addLog, Legacy, saveLegacy } from '../state.js';
import { playSound, isSoundOn, toggleSound } from '../audio.js';
import { getTheme, toggleTheme } from '../theme.js';
import { renderBonusTags, applyBackstory } from '../backstory.js';
import { rollDailyLife } from '../daily.js';
import { clamp } from '../utils.js';
import { render } from './render.js';

export function renderStart(app) {
  app.innerHTML = `
    <div class="top-bar">
      <button id="soundBtn">${isSoundOn() ? '🔊' : '🔇'}</button>
      <button id="themeBtn">${getTheme() === 'dark' ? '🌙' : '☀️'}</button>
    </div>
    <div class="start-screen">
      <h2>👋 Новая жизнь</h2>
      <p class="hint">С чего начнётся твоя жизнь? Это повлияет на всё.
        ${Legacy.runs ? `<br><span class="muted small">Прожито жизней: ${Legacy.runs}</span>` : ''}
      </p>

      <div class="field">
        <label>Имя</label>
        <input type="text" id="inpName" maxlength="20" placeholder="Введи имя" value="Алекс">
      </div>

      <div class="field">
        <label>Пол</label>
        <div class="gender-picker" id="genderPick">
          <button data-g="m" class="selected">👦<span>Мальчик</span></button>
          <button data-g="f">👧<span>Девочка</span></button>
        </div>
      </div>

      <div class="field">
        <label>Предыстория</label>
        <div class="backstory-grid" id="bsGrid"></div>
      </div>

      <div class="legacy-section">
        <div class="legacy-head">
          <h3>🌀 Наследие</h3>
          <span class="legacy-points" id="legacyPoints">${Legacy.points} ОН</span>
        </div>
        <p class="hint small">Покупается один раз и работает во всех следующих жизнях.</p>
        <div class="legacy-grid" id="legacyGrid"></div>
      </div>

      <button class="start-btn" id="startBtn" disabled>🎓 Начать путь</button>
    </div>
  `;

  document.getElementById('soundBtn').onclick = () => { toggleSound(); render(); };
  document.getElementById('themeBtn').onclick = () => { toggleTheme(); render(); };

  const inp = document.getElementById('inpName');
  const btn = document.getElementById('startBtn');
  const pick = document.getElementById('genderPick');
  const bsGrid = document.getElementById('bsGrid');
  const legacyGrid = document.getElementById('legacyGrid');
  const legacyPoints = document.getElementById('legacyPoints');

  let chosenGender = 'm';
  let chosenBs = null;

  bsGrid.innerHTML = Object.values(BACKSTORIES).map(b => `
    <div class="backstory-card" data-bs="${b.id}">
      <div class="bs-head">
        <div class="bs-icon">${b.icon}</div>
        <div class="bs-title">${b.title}</div>
      </div>
      <div class="bs-desc">${b.desc}</div>
      <div class="bs-bonus">${renderBonusTags(b.bonus)}<span>${b.tag}</span></div>
    </div>
  `).join('');

  bsGrid.addEventListener('click', e => {
    const card = e.target.closest('.backstory-card');
    if (!card) return;
    playSound('click');
    bsGrid.querySelectorAll('.backstory-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    chosenBs = card.dataset.bs;
    check();
  });

  // ---- Наследие ----
  function renderLegacy() {
    legacyGrid.innerHTML = Object.values(LEGACY_PERKS).map(p => {
      const level = (Legacy.upgrades || {})[p.id] || 0;
      const maxed = level >= p.maxLevel;
      const canBuy = !maxed && Legacy.points >= p.cost;
      const label = maxed ? 'Максимум' : `Купить: ${p.cost} ОН`;
      return `
        <div class="legacy-card ${maxed ? 'maxed' : ''}">
          <div class="legacy-icon">${p.icon}</div>
          <div class="legacy-title">${p.title}${level > 0 ? ` <span class="lvl">ур. ${level}</span>` : ''}</div>
          <div class="legacy-desc">${p.desc}</div>
          <button class="buy-btn" data-id="${p.id}" ${canBuy ? '' : 'disabled'}>${label}</button>
        </div>
      `;
    }).join('');
    legacyPoints.textContent = `${Legacy.points} ОН`;
  }

  legacyGrid.addEventListener('click', e => {
    const b = e.target.closest('.buy-btn');
    if (!b || b.disabled) return;
    const perk = LEGACY_PERKS[b.dataset.id];
    if (!perk) return;
    if (!Legacy.upgrades) Legacy.upgrades = {};
    const level = Legacy.upgrades[perk.id] || 0;
    if (level >= perk.maxLevel || Legacy.points < perk.cost) return;

    Legacy.points -= perk.cost;
    Legacy.upgrades[perk.id] = level + 1;
    saveLegacy();
    playSound('levelup');
    renderLegacy();
  });

  renderLegacy();

  const check = () => { btn.disabled = inp.value.trim().length < 1 || !chosenBs; };
  inp.addEventListener('input', check);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !btn.disabled) btn.click(); });

  pick.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    playSound('click');
    pick.querySelectorAll('button').forEach(x => x.classList.remove('selected'));
    b.classList.add('selected');
    chosenGender = b.dataset.g;
  });

  check();

  btn.onclick = () => {
    S.name = inp.value.trim().slice(0, 20) || 'Алекс';
    S.gender = chosenGender;
    S.backstory = chosenBs;
    applyBackstory();
    applyLegacyUpgrades();
    S.avatarSeed = Math.random();
    S.started = true;
    addLog(`Ты родился! Имя: ${S.name}. Предыстория: ${BACKSTORIES[chosenBs].title}.`);
    const perks = Object.keys(Legacy.upgrades || {}).length;
    if (perks > 0) addLog('🌀 Наследие предков помогло тебе на старте.');
    rollDailyLife();
    S.dailyLifeSeen = true;
    playSound('success');
    saveState();
    render();
  };
}

// Бонусы купленного наследия применяются к новой жизни.
function applyLegacyUpgrades() {
  for (const [id, level] of Object.entries(Legacy.upgrades || {})) {
    const perk = LEGACY_PERKS[id];
    if (!perk || level <= 0) continue;
    const times = Math.min(level, perk.maxLevel);
    for (let i = 0; i < times; i++) {
      const e = perk.effect;
      if (e.int) S.int += e.int;
      if (e.charm) S.charm += e.charm;
      if (e.health) S.health = clamp(S.health + e.health, 0, 100);
      if (e.money) S.money += e.money;
      if (e.energy) {
        S.energyBonus = (S.energyBonus || 0) + e.energy;
        S.energy += e.energy; // бонус действует уже в первом году
      }
    }
  }
}
