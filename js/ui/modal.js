import { S, saveState } from '../state.js';
import { escapeHtml } from '../utils.js';
import { render } from './render.js';
import { playSound } from '../audio.js';
import { SKILL_TREE } from '../config.js';

export function renderModal(app){
  const m = S.pendingModal;
  
  if (m.isSkillTree) {
    return renderSkillTree(app, m);
  }

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
  m.opts.forEach(o=>{
    const d = document.createElement('div');
    d.className='opt';
    d.innerHTML = `<h4>${escapeHtml(o.title)}</h4><p>${escapeHtml(o.desc)}</p>`;
    d.onclick = ()=>{
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
        <p>${escapeHtml(m.desc)} <br> <b>Доступно очков:</b> ${S.skillPoints}</p>
        <div class="tree-grid" id="treeGrid"></div>
        <button style="background:var(--panel2); margin-top:16px; width:100%; text-align:center;" id="closeTree">Закрыть</button>
      </div>
    </div>
  `;
  
  const grid = document.getElementById('treeGrid');
  grid.innerHTML = Object.values(SKILL_TREE).map(p => {
    const bought = S.boughtPerks.includes(p.id);
    const canBuy = !bought && S.skillPoints >= p.cost;
    return `
      <div class="tree-node ${bought?'bought':''} ${!canBuy&&!bought?'locked':''}" data-id="${p.id}">
        <h4>${p.icon} ${p.title}</h4>
        <p>${p.desc}</p>
        <p style="color:var(--blue); margin-top:4px;"><b>${p.effect}</b></p>
        <span class="cost">${bought ? 'Куплено' : `${p.cost} ОН`}</span>
      </div>
    `;
  }).join('');

  document.getElementById('closeTree').onclick = () => {
    S.pendingModal = null;
    render();
  };

  grid.querySelectorAll('.tree-node').forEach(node => {
    node.onclick = () => {
      const id = node.dataset.id;
      if (S.boughtPerks.includes(id)) return;
      import('../skills.js').then(mod => {
        mod.buyPerk(id);
        render(); // Перерисовываем модалку
      });
    };
  });
}
