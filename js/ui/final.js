import { S, Legacy, newLife } from '../state.js';
import { ACHIEVEMENTS, BACKSTORIES } from '../config.js';
import { FINALS } from '../finals.js';
import { escapeHtml, formatMoney } from '../utils.js';
import { getAvatar, statHTML } from './game.js';
import { isSoundOn, toggleSound } from '../audio.js';
import { getTheme, toggleTheme } from '../theme.js';
import { render } from './render.js';

export function renderFinal(app) {
  const f = FINALS[S.final] || FINALS.teacher;
  const bs = S.backstory ? BACKSTORIES[S.backstory] : null;
  const badges = S.achievements
    .map(id => ACHIEVEMENTS[id])
    .filter(Boolean)
    .map((a, i) => `<div class="ach-badge" style="animation-delay:${i * 0.04}s">${a.icon} ${a.name}</div>`)
    .join('');

  app.innerHTML = `
    <div class="top-bar">
      <button id="soundBtn">${isSoundOn() ? '🔊' : '🔇'}</button>
      <button id="themeBtn">${getTheme() === 'dark' ? '🌙' : '☀️'}</button>
    </div>
    <div class="final">
      <div class="final-avatar">${getAvatar()}</div>
      <h2 style="color:${f.color}">${escapeHtml(f.title)}</h2>
      ${bs ? `<p class="muted small">${bs.icon} ${bs.title}</p>` : ''}
      <div class="desc">${escapeHtml(f.desc)}</div>

      <div class="persona">🏅 Титул: ${escapeHtml(S.personaTitle || 'Учёный')}</div>

      <div class="legacy-block">
        <h3>🌀 Получено Наследия: +${S.earnedLegacy || 0} ОН</h3>
        <p class="muted small">Всего накоплено: <b>${Legacy.points}</b> ОН · прожито жизней: ${Legacy.runs || 1}.
        Очки можно потратить при следующем рождении.</p>
      </div>

      <div class="summary">
        ${statHTML('Возраст', S.age)}
        ${statHTML('Интеллект', S.int)}
        ${statHTML('Репутация', S.rep)}
        ${statHTML('Публикаций', S.publications)}
        ${statHTML('Открытий', S.discoveries)}
        ${statHTML('Деньги', formatMoney(S.money))}
      </div>

      ${badges ? `<h3 class="final-ach-title">🏅 Достижения (${S.achievements.length})</h3>
        <div class="ach-list">${badges}</div>` : ''}

      <button id="resetBtn">🔄 Начать новую жизнь</button>
    </div>
  `;
  document.getElementById('soundBtn').onclick = () => { toggleSound(); render(); };
  document.getElementById('themeBtn').onclick = () => { toggleTheme(); render(); };
  document.getElementById('resetBtn').onclick = () => newLife();
}
