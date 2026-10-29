import { BACKSTORIES, LEGACY_PERKS } from '../config.js';
import { S, saveState, addLog, Legacy, saveLegacy } from '../state.js';
import { playSound, isSoundOn, toggleSound } from '../audio.js';
import { getTheme, toggleTheme } from '../theme.js';
import { renderBonusTags, applyBackstory } from '../backstory.js';
import { rollDailyLife } from '../daily.js';
import { escapeHtml, clamp } from '../utils.js';
import { render } from './render.js';

export function renderStart(app){
  app.innerHTML = `
    <div class="top-bar">
      <button id="soundBtn">${isSoundOn()?'🔊':'🔇'}</button>
      <button id="themeBtn">${getTheme()==='dark'?'🌙':'☀️'}</button>
    </div>
    <div class="start-screen">
      <h2>👋 Новая жизнь</h2>
      <p class="hint">Кем ты родился? Это повлияет на всю жизнь.</p>

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

      <!-- БЛОК НАСЛЕДИЯ -->
      <div class="legacy-section" style="border:1px solid var(--purple); border-radius:12px; padding:12px; background:rgba(163,113,247,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h3 style="margin:0; color:var(--purple); font-size:16px;">🌀 Наследие</h3>
          <span style="font-weight:700; color:var(--gold);">${Legacy.points} ОН</span>
        </div>
        <p style="font-size:12px; color:var(--muted); margin:0 0 10px;">Потрать очки, чтобы следующая жизнь была проще.</p>
        <div class="legacy-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:8px;" id="legacyGrid"></div>
      </div>

      <button class="start-btn" id="startBtn" disabled>🎓 Начать путь</button>
    </div>
  `;

  document.getElementById('soundBtn').onclick = ()=>{ toggleSound(); render(); };
  document.getElementById('themeBtn').onclick = ()=>{ toggleTheme(); render(); };

  const inp = document.getElementById('inpName');
  const btn = document.getElementById('startBtn');
  const pick = document.getElementById('genderPick');
  const bsGrid = document.getElementById('bsGrid');
  const legacyGrid = document.getElementById('legacyGrid');
  
  let chosenGender='m';
  let chosenBs=null;

  // Рендер карточек предысторий
  bsGrid.innerHTML = Object.values(BACKSTORIES).map(b=>`
    <div class="backstory-card" data-bs="${b.id}">
      <div class="bs-head">
        <div class="bs-icon">${b.icon}</div>
        <div class="bs-title">${b.title}</div>
      </div>
      <div class="bs-desc">${b.desc}</div>
      <div class="bs-bonus">${renderBonusTags(b.bonus)}<span>${b.tag}</span></div>
    </div>
  `).join('');

  bsGrid.addEventListener('click', e=>{
    const card = e.target.closest('.backstory-card');
    if(!card) return;
    playSound('click');
    bsGrid.querySelectorAll('.backstory-card').forEach(c=>c.classList.remove('selected'));
    card.classList.add('selected');
    chosenBs = card.dataset.bs;
    check();
  });

  // Рендер карточек наследия
  function renderLegacy(){
    legacyGrid.innerHTML = Object.values(LEGACY_PERKS).map(p=>{
      const bought = S.legacyUpgrades[p.id] || 0; // Мы будем хранить купленные в S
      const canBuy = Legacy.points >= p.cost && bought < p.maxLevel;
      
      return `
        <div class="legacy-card" style="background:var(--panel2); border:1px solid var(--border); border-radius:8px; padding:8px; text-align:center;">
          <div style="font-size:24px;">${p.icon}</div>
          <div style="font-size:12px; font-weight:700; color:var(--gold); margin-top:4px;">${p.title} ${bought>0?`(Ур.${bought})`:''}</div>
          <div style="font-size:10px; color:var(--muted); margin-bottom:8px;">${p.desc}</div>
          <button class="buy-btn" data-id="${p.id}" ${canBuy?'':'disabled'} 
                  style="padding:4px; font-size:11px; min-height:auto; text-align:center; width:100%; ${canBuy?'background:var(--purple)':'background:var(--panel3); color:#777;'}">
            ${bought >= p.maxLevel ? 'Максимум' : `Купить: ${p.cost} ОН`}
          </button>
        </div>
      `;
    }).join('');
    
    // Вешаем обработчики на кнопки покупки
    document.querySelectorAll('.buy-btn').forEach(b => {
      b.onclick = () => {
        const perkId = b.dataset.id;
        const perk = LEGACY_PERKS[perkId];
        const bought = S.legacyUpgrades[perkId] || 0;
        if(Legacy.points >= perk.cost && bought < perk.maxLevel){
          Legacy.points -= perk.cost;
          S.legacyUpgrades[perkId] = bought + 1;
          saveLegacy();
          saveState();
          playSound('levelup');
          render(); // Перерисовываем, чтобы обновить очки
        }
      };
    });
  }
  renderLegacy();

  const check = ()=>{ btn.disabled = inp.value.trim().length<1 || !chosenBs; };
  inp.addEventListener('input', check);
  inp.addEventListener('keydown', e=>{ if(e.key==='Enter'&&!btn.disabled) btn.click(); });

  pick.addEventListener('click', e=>{
    const b = e.target.closest('button');
    if(!b) return;
    playSound('click');
    pick.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));
    b.classList.add('selected');
    chosenGender = b.dataset.g;
  });

  check();

  btn.onclick = ()=>{
    S.name = inp.value.trim().slice(0,20) || 'Алекс';
    S.gender = chosenGender;
    S.backstory = chosenBs;
    applyBackstory();
    applyLegacyUpgrades(); // <-- ПРИМЕНЯЕМ УЛУЧШЕНИЯ
    S.avatarSeed = Math.random();
    S.started = true;
    addLog(`Ты родился! Имя: ${S.name}. Предыстория: ${BACKSTORIES[chosenBs].title}.`);
    if (Object.keys(S.legacyUpgrades).length > 0) {
      addLog(`🌀 Наследие предков помогло тебе на старте.`);
    }
    rollDailyLife();
    S.dailyLifeSeen = true;
    playSound('success');
    saveState();
    render();
  };
}

// Вспомогательная функция для применения бонусов
function applyLegacyUpgrades(){
  for (const [id, level] of Object.entries(S.legacyUpgrades)) {
    if (level <= 0) continue;
    const perk = LEGACY_PERKS[id];
    if (!perk) continue;
    
    // Применяем эффекты в зависимости от уровня
    for (let i = 0; i < level; i++) {
      if (perk.effect.int) S.int += perk.effect.int;
      if (perk.effect.charm) S.charm += perk.effect.charm;
      if (perk.effect.health) S.health = clamp(S.health + perk.effect.health, 0, 100);
      if (perk.effect.money) S.money += perk.effect.money;
      if (perk.effect.energy) S.energy += perk.effect.energy;
    }
  }
}
