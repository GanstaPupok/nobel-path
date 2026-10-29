import { BACKSTORIES } from '../config.js';
import { S, saveState, addLog } from '../state.js';
import { playSound } from '../audio.js';
import { renderBonusTags, applyBackstory } from '../backstory.js';
import { rollDailyLife } from '../daily.js';
import { isSoundOn, toggleSound } from '../audio.js';
import { getTheme, toggleTheme } from '../theme.js';
import { escapeHtml } from '../utils.js';
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

      <button class="start-btn" id="startBtn" disabled>🎓 Начать путь</button>
    </div>
  `;

  document.getElementById('soundBtn').onclick = ()=>{ toggleSound(); render(); };
  document.getElementById('themeBtn').onclick = ()=>{ toggleTheme(); render(); };

  const inp = document.getElementById('inpName');
  const btn = document.getElementById('startBtn');
  const pick = document.getElementById('genderPick');
  const bsGrid = document.getElementById('bsGrid');
  let chosenGender='m';
  let chosenBs=null;

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
    S.avatarSeed = Math.random();
    S.started = true;
    addLog(`Ты родился! Имя: ${S.name}. Предыстория: ${BACKSTORIES[chosenBs].title}.`);
    rollDailyLife();
    S.dailyLifeSeen = true;
    playSound('success');
    saveState();
    render();
  };
}