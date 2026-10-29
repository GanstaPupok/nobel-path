import { S, Legacy, newLife, saveLegacy } from '../state.js';
import { ACHIEVEMENTS, BACKSTORIES } from '../config.js';
import { FINALS } from '../finals.js';
import { escapeHtml, formatMoney } from '../utils.js';
import { arcSummary } from '../arcs.js';
import { buildEpilogue } from '../epilogue.js';
import { getAvatar, statHTML } from './game.js';
import { isSoundOn, toggleSound } from '../audio.js';
import { getTheme, toggleTheme } from '../theme.js';
import { render } from './render.js';
import { g } from '../text.js';
import { todayResult, shareText } from '../dailychallenge.js';
import { buildLifeCard } from '../sharecard.js';

export function renderFinal(app) {
  const f = FINALS[S.final] || FINALS.teacher;
  const bs = S.backstory ? BACKSTORIES[S.backstory] : null;
  const life = arcSummary();
  const epilogue = buildEpilogue();
  const child = S.arcs && S.arcs.family ? S.arcs.family.childName : null;
  const daily = S.daily ? todayResult() : null;
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
      <h2 style="color:${f.color}">${escapeHtml(g(f.title))}</h2>
      ${bs ? `<p class="muted small">${bs.icon} ${bs.title}</p>` : ''}
      <div class="desc">${escapeHtml(g(f.desc))}</div>

      <div class="persona">🏅 Титул: ${escapeHtml(S.personaTitle || 'Учёный')}</div>

      ${daily ? `<div class="daily-result">
        <h3>🎯 Испытание дня</h3>
        <div class="daily-result-score">${daily.score} очков</div>
        <p class="muted small">${escapeHtml(daily.final)} · публикаций ${daily.publications} · открытий ${daily.discoveries} · достижений ${daily.achievements}</p>
        <button class="daily-share" id="shareDaily">Скопировать результат</button>
      </div>` : ''}

      ${epilogue.length ? `<div class="epilogue">
        <h3>Эпилог</h3>
        ${epilogue.map(p => `<p>${escapeHtml(p)}</p>`).join('')}
      </div>` : ''}

      ${life.length ? `<div class="final-life">
        <h3>Жизнь вне науки</h3>
        <div class="life-chips">${life.map(x => `<span class="life-chip">${escapeHtml(x)}</span>`).join('')}</div>
      </div>` : ''}

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

      <button id="cardBtn" class="card-btn">📸 Карточка жизни</button>
      ${child ? `<button id="dynastyBtn" class="dynasty-btn">👶 Продолжить династию: ${escapeHtml(child)}</button>` : ''}
      <button id="resetBtn">🔄 Начать новую жизнь</button>
    </div>
  `;
  document.getElementById('soundBtn').onclick = () => { toggleSound(); render(); };
  document.getElementById('themeBtn').onclick = () => { toggleTheme(); render(); };
  document.getElementById('resetBtn').onclick = () => newLife();
  document.getElementById('cardBtn').onclick = () => {
    S.pendingModal = { isLifeCard: true, image: buildLifeCard() };
    render();
  };
  const shareBtn = document.getElementById('shareDaily');
  if (shareBtn && daily) {
    shareBtn.onclick = async () => {
      const text = shareText(daily);
      try {
        await navigator.clipboard.writeText(text);
        shareBtn.textContent = 'Скопировано ✓';
      } catch (e) {
        shareBtn.textContent = text;
      }
    };
  }
  if (child) {
    document.getElementById('dynastyBtn').onclick = () => {
      Legacy.nextChild = {
        name: child,
        gender: S.arcs.family.childGender === 'f' ? 'f' : 'm',
        parentName: S.name,
        parentFinal: S.final,
        generation: (Legacy.generation || 1) + 1,
        inherit: {
          int: Math.floor(S.int / 20),
          charm: Math.floor(S.charm / 20),
          money: Math.min(50000, Math.floor(S.money * 0.03)),
          rep: Math.floor(S.rep / 10)
        }
      };
      saveLegacy();
      newLife();
    };
  }
}
