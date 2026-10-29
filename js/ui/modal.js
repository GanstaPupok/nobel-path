import { S, saveState } from '../state.js';
import { escapeHtml, yearsWord } from '../utils.js';
import { render } from './render.js';
import { playSound } from '../audio.js';
import { SKILL_TREE, ACHIEVEMENTS } from '../config.js';
import { buyPerk, canBuyPerk } from '../skills.js';
import { ACHIEVEMENT_GROUPS, achievementProgress } from '../achievements.js';
import { TUTORIAL_STEPS, markTutorialSeen } from '../tutorial.js';
import { g } from '../text.js';
import { chronicleByAge, chronCount } from '../chronicle.js';

export function renderModal(app) {
  const m = S.pendingModal;
  if (!m) return;

  if (m.isSkillTree) return renderSkillTree(app, m);
  if (m.isAchievements) return renderAchievements(app, m);
  if (m.isChronicle) return renderChronicle(app, m);
  if (m.isTutorial) return renderTutorial(app, m);
  if (m.isLifeCard) return renderLifeCard(app, m);

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

let achievementTab = 'science';

function renderAchievements(app, m) {
  const unlocked = new Set(S.achievements);
  const entries = Object.entries(ACHIEVEMENTS);
  const total = entries.length;
  const got = entries.filter(([id]) => unlocked.has(id)).length;
  const pct = total ? Math.round(got / total * 100) : 0;

  const groups = Object.keys(ACHIEVEMENT_GROUPS);
  if (!groups.includes(achievementTab)) achievementTab = groups[0];

  const countIn = g => entries.filter(([id, a]) => a.group === g && unlocked.has(id)).length;
  const totalIn = g => entries.filter(([, a]) => a.group === g).length;

  const rows = entries
    .filter(([, a]) => a.group === achievementTab)
    .map(([id, a]) => {
      const isOpen = unlocked.has(id);
      const date = S.achievementDates && S.achievementDates[id];
      const prog = isOpen ? null : achievementProgress(id);
      return `
        <div class="ach-row ${isOpen ? 'unlocked' : 'locked'}">
          <div class="ach-row-icon">${a.icon}</div>
          <div class="ach-row-body">
            <div class="ach-row-top">
              <span class="ach-row-name">${escapeHtml(a.name)}</span>
              ${isOpen && date ? `<span class="ach-row-age">в ${date} лет</span>` : ''}
            </div>
            <div class="ach-row-desc">${escapeHtml(a.desc || '')}</div>
            ${prog ? `<div class="ach-row-progress">
              <div class="ach-row-bar"><div style="width:${prog.pct}%"></div></div>
              <span>${prog.cur}/${prog.max}</span>
            </div>` : ''}
          </div>
          <div class="ach-row-mark">${isOpen ? '✓' : '🔒'}</div>
        </div>`;
    }).join('');

  app.innerHTML = `
    <div class="modal-bg">
      <div class="modal tree-modal">
        <h2>${escapeHtml(m.title)}</h2>
        <div class="ach-summary">
          <div class="ach-summary-top">
            <span>Открыто <b>${got}</b> из ${total}</span>
            <span class="ach-summary-pct">${pct}%</span>
          </div>
          <div class="ach-summary-bar"><div style="width:${pct}%"></div></div>
        </div>
        <div class="ach-tabs">
          ${groups.map(g => `
            <button class="ach-tab ${g === achievementTab ? 'active' : ''}" data-group="${g}">
              ${ACHIEVEMENT_GROUPS[g].icon} ${ACHIEVEMENT_GROUPS[g].title}
              <span class="ach-tab-count">${countIn(g)}/${totalIn(g)}</span>
            </button>
          `).join('')}
        </div>
        <div class="ach-list-rows">${rows}</div>
        <button class="modal-close" id="closeAch">Закрыть</button>
      </div>
    </div>
  `;

  app.querySelectorAll('.ach-tab').forEach(tab => {
    tab.onclick = () => {
      achievementTab = tab.dataset.group;
      render();
    };
  });

  document.getElementById('closeAch').onclick = () => {
    S.pendingModal = null;
    saveState();
    render();
  };
}

function renderLifeCard(app, m) {
  app.innerHTML = `
    <div class="modal-bg">
      <div class="modal card-modal">
        <h2>📸 Карточка жизни</h2>
        ${m.image
          ? `<img class="life-card-img" src="${m.image}" alt="Карточка жизни">`
          : '<p>Не удалось нарисовать карточку.</p>'}
        <div class="card-actions">
          ${m.image ? `<a class="card-download" id="cardDownload" download="nobel-path.png" href="${m.image}">Скачать PNG</a>` : ''}
          <button class="modal-close" id="closeCard">Закрыть</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('closeCard').onclick = () => {
    S.pendingModal = null;
    saveState();
    render();
  };
}

function renderTutorial(app, m) {
  const step = Math.max(0, Math.min(TUTORIAL_STEPS.length - 1, m.step || 0));
  const item = TUTORIAL_STEPS[step];
  const last = step === TUTORIAL_STEPS.length - 1;

  app.innerHTML = `
    <div class="modal-bg">
      <div class="modal tutorial-modal">
        <div class="tut-progress">
          ${TUTORIAL_STEPS.map((_, i) => `<span class="tut-dot ${i <= step ? 'on' : ''}"></span>`).join('')}
          <span class="tut-counter">${step + 1} / ${TUTORIAL_STEPS.length}</span>
        </div>
        <div class="tut-icon">${item.icon}</div>
        <h2>${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.text)}</p>
        <div class="tut-actions">
          <button class="tut-skip" id="tutSkip">Пропустить</button>
          <button class="tut-next" id="tutNext">${last ? 'Начать' : 'Далее'}</button>
        </div>
      </div>
    </div>
  `;

  const finish = () => {
    markTutorialSeen();
    S.pendingModal = null;
    saveState();
    render();
  };

  document.getElementById('tutSkip').onclick = finish;
  document.getElementById('tutNext').onclick = () => {
    if (last) return finish();
    S.pendingModal = { isTutorial: true, step: step + 1 };
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
