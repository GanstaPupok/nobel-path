import { S, saveState } from '../state.js';
import { escapeHtml } from '../utils.js';
import { render } from './render.js';
import { playSound } from '../audio.js';
import { SKILL_TREE, ACHIEVEMENTS } from '../config.js';
import { buyPerk, canBuyPerk } from '../skills.js';

export function renderModal(app) {
  const m = S.pendingModal;
  if (!m) return;

  if (m.isSkillTree) return renderSkillTree(app, m);
  if (m.isAchievements) return renderAchievements(app, m);

  app.innerHTML = `
    <div class="modal-bg">
      <div class="modal">
        <h2>${escapeHtml(m.title)}</h2>
        <p>${escapeHtml(m.desc)}</p>
        <div class="opts" id="modalOpts"></div>
      </div>
    </div>
  `;
  const box = document.getElementById('modalOpts');
  m.opts.forEach(o => {
    const d = document.createElement('div');
    d.className = 'opt';
    d.innerHTML = `<h4>${escapeHtml(o.title)}</h4><p>${escapeHtml(o.desc)}</p>`;
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
