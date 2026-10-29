import { S, saveState } from '../state.js';
import { escapeHtml, yearsWord } from '../utils.js';
import { render } from './render.js';
import { playSound } from '../audio.js';
import { SKILL_TREE, ACHIEVEMENTS } from '../config.js';
import { buyPerk, canBuyPerk } from '../skills.js';
import { g } from '../text.js';
import { chronicleByAge, chronCount } from '../chronicle.js';

export function renderModal(app) {
  const m = S.pendingModal;
  if (!m) return;

  if (m.isSkillTree) return renderSkillTree(app, m);
  if (m.isAchievements) return renderAchievements(app, m);
  if (m.isChronicle) return renderChronicle(app, m);

  app.innerHTML = `
    <div class="modal-bg">
      <div class="modal">
        <h2>${escapeHtml(g(m.title))}</h2>
        <p>${escapeHtml(g(m.desc))}</p>
        <div class="opts" id="modalOpts"></div>
      </div>
    </div>
  `;
  const box = document.getElementById('modalOpts');
  m.opts.forEach(o => {
    const d = document.createElement('div');
    d.className = 'opt';
    d.innerHTML = `<h4>${escapeHtml(g(o.title))}</h4><p>${escapeHtml(g(o.desc))}</p>`;
    d.onclick = () => {
      playSound('click');
      o.f();
      S.pendingModal = null;
      saveState();
      render();
    };
    box.appendChild(d);
  });
}

function renderSkillTree(app, m) {
  app.innerHTML = `
    <div class="modal-bg">
      <div class="modal tree-modal">
        <h2>${escapeHtml(m.title)}</h2>
        <p>${escapeHtml(m.desc)} <br><b>Доступно очков:</b> ${S.skillPoints}</p>
        <div class="tree-grid" id="treeGrid"></div>
        <button class="modal-close" id="closeTree">Закрыть</button>
      </div>
    </div>
  `;

  const grid = document.getElementById('treeGrid');
  grid.innerHTML = Object.values(SKILL_TREE).map(p => {
    const bought = (S.boughtPerks || []).includes(p.id);
    const can = canBuyPerk(p.id);
    return `
      <div class="tree-node ${bought ? 'bought' : ''} ${!can && !bought ? 'locked' : ''}" data-id="${p.id}">
        <h4>${p.icon} ${p.title}</h4>
        <p>${p.desc}</p>
        <p class="tree-effect"><b>${p.effect}</b></p>
        <span class="cost">${bought ? 'Куплено' : `${p.cost} ОН`}</span>
      </div>
    `;
  }).join('');

  document.getElementById('closeTree').onclick = () => {
    S.pendingModal = null;
    saveState();
    render();
  };

  grid.querySelectorAll('.tree-node').forEach(node => {
    node.onclick = () => {
      if (buyPerk(node.dataset.id)) render();
    };
  });
}

function renderAchievements(app, m) {
  const unlocked = new Set(S.achievements);
  app.innerHTML = `
    <div class="modal-bg">
      <div class="modal tree-modal">
        <h2>${escapeHtml(m.title)}</h2>
        <p>${escapeHtml(m.desc)}</p>
        <div class="ach-grid" id="achGrid"></div>
        <button class="modal-close" id="closeAch">Закрыть</button>
      </div>
    </div>
  `;
  document.getElementById('achGrid').innerHTML = Object.entries(ACHIEVEMENTS).map(([id, a]) => `
    <div class="ach-cell ${unlocked.has(id) ? 'unlocked' : 'locked'}">
      <span class="ach-icon">${a.icon}</span>
      <span class="ach-name">${unlocked.has(id) ? a.name : '???'}</span>
    </div>
  `).join('');

  document.getElementById('closeAch').onclick = () => {
    S.pendingModal = null;
    saveState();
    render();
  };
}

function renderChronicle(app, m) {
  const groups = chronicleByAge();
  app.innerHTML = `
    <div class="modal-bg">
      <div class="modal chron-modal">
        <h2>${escapeHtml(m.title)}</h2>
        <p>${groups.length
          ? `Записей: ${chronCount()}. Здесь всё, чем запомнилась жизнь.`
          : 'Пока пусто — проживи несколько лет, и здесь появятся важные моменты.'}</p>
        <div class="chron-list">
          ${groups.map(gr => `
            <div class="chron-group">
              <div class="chron-age">${yearsWord(gr.age)}</div>
              ${gr.items.map(e => `<div class="chron-item"><span class="chron-icon">${e.icon}</span><span>${escapeHtml(e.text)}</span></div>`).join('')}
            </div>
          `).join('')}
        </div>
        <button class="modal-close" id="closeChron">Закрыть</button>
      </div>
    </div>
  `;
  document.getElementById('closeChron').onclick = () => {
    S.pendingModal = null;
    saveState();
    render();
  };
}
