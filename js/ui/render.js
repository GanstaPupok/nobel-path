import { S, saveState, addLog } from '../state.js';
import { renderStart } from './start.js';
import { renderGame } from './game.js';
import { renderEvent } from './event.js';
import { renderModal } from './modal.js';
import { renderFinal } from './final.js';
import { getActions, ACTION_GROUPS } from '../actions.js';
import { rollEvent } from '../events/engine.js';
import { checkThresholds } from '../achievements.js';
import { getAvailableTreeBranch, applyTreeChoice } from '../tree.js';
import { endYear } from '../year.js';
import { MINIGAMES } from '../minigames/index.js';
import { playSound } from '../audio.js';

export function render() {
  const app = document.getElementById('app');
  if (!app) return;
  if (!S.started) return renderStart(app);
  if (S.finalReached) return renderFinal(app);
  if (S.pendingModal) return renderModal(app);
  if (S.pendingEvent) return renderEvent(app);
  return renderGame(app);
}

/** Вызывается после любого действия игрока: события, выборы, достижения. */
export function afterAction() {
  if (S.finalReached) { saveState(); return render(); }

  if (Math.random() < 0.3 && !S.pendingEvent && !S.pendingModal) {
    const ev = rollEvent();
    if (ev) {
      S.pendingEvent = ev;
      S.eventsThisYear = (S.eventsThisYear || 0) + 1;
    }
  }
  if (!S.pendingEvent && !S.pendingModal) {
    const branch = getAvailableTreeBranch();
    if (branch && Math.random() < 0.4) {
      S.pendingModal = {
        title: '🌳 Жизненный выбор',
        desc: branch.question,
        opts: branch.options.map(o => ({
          title: o.text,
          desc: o.future,
          f: () => { applyTreeChoice(branch.key, o.id); }
        }))
      };
    }
  }
  checkThresholds();
  saveState();
  render();
}

// Выбранная вкладка действий. Не сохраняется — интерфейсная настройка.
let activeGroup = 'science';

export function renderActions() {
  const container = document.getElementById('actions');
  if (!container) return;
  const acts = getActions();
  container.innerHTML = '';

  // Вкладки: наука / карьера / жизнь — чтобы не скроллить двадцать кнопок
  const groups = Object.keys(ACTION_GROUPS).filter(g => acts.some(a => a.group === g));
  if (!groups.includes(activeGroup)) activeGroup = groups[0] || 'science';

  if (groups.length > 1) {
    const tabs = document.createElement('div');
    tabs.className = 'action-tabs';
    groups.forEach(g => {
      const count = acts.filter(a => a.group === g).length;
      const b = document.createElement('button');
      b.className = 'action-tab' + (g === activeGroup ? ' active' : '');
      b.innerHTML = `${ACTION_GROUPS[g].icon} ${ACTION_GROUPS[g].title}<span class="tab-count">${count}</span>`;
      b.onclick = () => { activeGroup = g; renderActions(); };
      tabs.appendChild(b);
    });
    container.appendChild(tabs);
  }

  const items = acts.filter(a => a.group === activeGroup);
  items.forEach((a, i) => {
    const b = document.createElement('button');
    b.disabled = a.disabled;
    if (a.cls) b.classList.add(a.cls);
    b.style.animation = `fadeInUp .3s ease ${i * 0.03}s both`;
    b.innerHTML = `${a.name}<small>${a.desc} · ⚡${a.cost}</small>`;
    b.onclick = () => {
      S.actedThisYear += a.cost;
      a.fn();
      afterAction();
    };
    container.appendChild(b);
  });

  const mg = document.createElement('button');
  mg.className = 'quest';
  S.minigamesThisYear = S.minigamesThisYear || 0;

  if (S.minigamesThisYear >= 2) {
    mg.disabled = true;
    mg.innerHTML = `🎮 Мини-игра<small>Лимит на этот год исчерпан (2/2)</small>`;
  } else {
    mg.innerHTML = `🎮 Мини-игра<small>${MINIGAMES.length} вариантов · осталось: ${2 - S.minigamesThisYear}</small>`;
    mg.onclick = () => {
      S.pendingModal = {
        title: '🎮 Мини-игра',
        desc: 'Проверь себя и получи бонусы. (Не тратит энергию)',
        opts: MINIGAMES.map(m => ({
          title: `${m.icon} ${m.title}`,
          desc: m.desc,
          f: () => {
            S.minigamesThisYear++;
            m.fn((result) => {
              addLog(`🎮 Мини-игра: ${result}`);
              afterAction();
            });
          }
        }))
      };
      render();
    };
  }
  container.appendChild(mg);

  const end = document.createElement('button');
  end.className = 'end-year';
  end.innerHTML = '➡️ Завершить год<small>Пропустить оставшиеся действия</small>';
  end.onclick = () => {
    playSound('year');
    endYear();
    render();
  };
  container.appendChild(end);
}
