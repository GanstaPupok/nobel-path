import { S } from '../state.js';
import { ACHIEVEMENTS, BACKSTORIES } from '../config.js';
import { FINALS } from '../finals.js';
import { escapeHtml, formatMoney } from '../utils.js';
import { getAvatar, statHTML } from './game.js';
import { isSoundOn, toggleSound } from '../audio.js';
import { getTheme, toggleTheme } from '../theme.js';
import { render } from './render.js';

export function renderFinal(app){
  const f = FINALS[S.final];
  const bs = S.backstory ? BACKSTORIES[S.backstory] : null;
  app.innerHTML = `
    <div class="top-bar">
      <button id="soundBtn">${isSoundOn()?'🔊':'🔇'}</button>
      <button id="themeBtn">${getTheme()==='dark'?'🌙':'☀️'}</button>
    </div>
    <div class="final">
      <div style="font-size:80px;margin-bottom:16px;animation:pulse 2s ease-in-out infinite">${getAvatar()}</div>
      <h2 style="color:${f.color}">${f.title}</h2>
      ${bs?`<p style="color:var(--muted);font-size:13px">${bs.icon} ${bs.title}</p>`:''}
      <div class="desc">${f.desc}</div>
      <div class="summary">
        ${statHTML('Возраст',S.age)}
        ${statHTML('Интеллект',S.int)}
        ${statHTML('Репутация',S.rep)}
        ${statHTML('Публикаций',S.publications)}
        ${statHTML('Открытий',S.discoveries)}
        ${statHTML('Деньги',formatMoney(S.money))}
      </div>
      ${S.achievements.length?`
        <h3 style="color:var(--gold);margin-bottom:8px">🏅 Достижения (${S.achievements.length})</h3>
        <div class="ach-list">
          ${S.achievements.map((id,i)=>`<div class="ach-badge" style="animation-delay:${i*0.06}s">${ACHIEVEMENTS[id].icon} ${ACHIEVEMENTS[id].name}</div>`).join('')}
        </div>
      `:''}
      <button id="resetBtn">🔄 Начать новую жизнь</button>
    </div>
  `;
  document.getElementById('soundBtn').onclick = ()=>{ toggleSound(); render(); };
  document.getElementById('themeBtn').onclick = ()=>{ toggleTheme(); render(); };
  document.getElementById('resetBtn').onclick = ()=>{ localStorage.removeItem('nobel_path_v6'); location.reload(); };
}