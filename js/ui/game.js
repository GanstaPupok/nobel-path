import { S, newLife } from '../state.js';
import { SKILLS, SKILL_NAMES, SKILL_ICONS, SPEC_NAMES, STAGES, BACKSTORIES, GLOBAL_EVENTS, ACHIEVEMENTS, GATES, NOBEL, PROJECTS, TRACKS } from '../config.js';
import { escapeHtml, formatMoney, clamp, yearsWord } from '../utils.js';
import { getArcCards } from '../arcs.js';
import { getActiveQuests, questProgress } from '../quests.js';
import { projectStatus } from '../project.js';
import { renderActions } from './render.js';
import { isSoundOn, toggleSound } from '../audio.js';
import { getTheme, toggleTheme } from '../theme.js';
import { render } from './render.js';
import { openTutorial } from '../tutorial.js';

export function getAvatar() {
  const m = ['🧒', '👦', '🧑', '👨', '🧑‍🎓', '🧑‍🔬', '👨‍🔬', '👨‍🏫', '👨‍💼', '👴'];
  const f = ['🧒', '👧', '🧑', '👩', '🧑‍🎓', '🧑‍🔬', '👩‍🔬', '👩‍🏫', '👩‍💼', '👵'];
  const arr = S.gender === 'f' ? f : m;
  if (S.age < 10) return arr[0];
  if (S.age < 18) return arr[1];
  if (S.age < 25) return arr[4];
  if (S.age < 35) return arr[5];
  if (S.age < 50) return arr[6];
  if (S.age < 65) return arr[7];
  return arr[9];
}

export function statHTML(label, val, barVal, barMax, color, icon = '') {
  let bar = '';
  if (barVal !== undefined) {
    const pct = clamp(barVal / barMax * 100, 0, 100);
    bar = `<div class="bar"><div style="width:${pct}%;background:${color || 'var(--accent)'}"></div></div>`;
  }
  const head = `<div class="stat-head">${icon ? `<span class="stat-icon">${icon}</span>` : ''}<span class="label">${label}</span></div>`;
  return `<div class="stat">${head}<div class="val">${val}</div>${bar}</div>`;
}

/** Текущая цель этапа — чтобы игрок понимал, к чему готовиться. */
export function getGoal() {
  if (S.stage === 'child') {
    const ok = S.int >= GATES.uni.int;
    return ok
      ? `✅ Поступление в вуз — интеллект ${S.int}/${GATES.uni.int}`
      : `🎯 Вуз в ${GATES.uni.age}: нужно ${GATES.uni.int} интеллекта (у тебя ${S.int})`;
  }
  if (S.stage === 'uni') {
    return `🎯 Аспирантура в ${GATES.phd.age}: интеллект ${S.int}/${GATES.phd.int}, публикации ${S.publications}/${GATES.phd.publications}`;
  }
  if (S.stage === 'phd') {
    return `🎯 Защита в ${GATES.career.age}: открытия ${S.discoveries}/${GATES.career.discoveries}`;
  }
  return `🎯 Нобель: репутация ${S.rep}/${NOBEL.rep}, интеллект ${S.int}/${NOBEL.int}, открытия ${S.discoveries}/${NOBEL.discoveries}`;
}

/** Трекер нобелевских критериев для этапа карьеры. */
function nobelTracker() {
  const items = [
    { label: 'Репутация', cur: S.rep, need: NOBEL.rep },
    { label: 'Интеллект', cur: S.int, need: NOBEL.int },
    { label: 'Открытия', cur: S.discoveries, need: NOBEL.discoveries }
  ];
  return `<div class="nobel-track">${items.map(i => {
    const done = i.cur >= i.need;
    return `<div class="nobel-chip ${done ? 'done' : ''}">${done ? '✅' : '⬜'} ${i.label} ${Math.min(i.cur, i.need)}/${i.need}</div>`;
  }).join('')}</div>`;
}

/** Карточка научного проекта. */
function projectCard() {
  const p = projectStatus();
  if (!p) return '';
  if (p.done) {
    return `<div class="project-card done">
      <div class="project-icon">${p.icon}</div>
      <div class="project-body">
        <div class="project-title">${escapeHtml(p.title)}</div>
        <div class="project-meta">Все этапы пройдены — тема закрыта</div>
      </div>
    </div>`;
  }
  return `<div class="project-card">
    <div class="project-icon">${p.icon}</div>
    <div class="project-body">
      <div class="project-title">${escapeHtml(p.title)} <span class="project-step">этап ${p.tierIndex}/${p.tiersTotal}</span></div>
      <div class="project-meta">${escapeHtml(p.tierName)} · <span class="muted">${p.label} · 💰 ${p.cost} ₽ за попытку</span></div>
      <div class="project-bar"><div style="width:${p.pct}%"></div></div>
    </div>
  </div>`;
}

export function renderGame(app) {
  const left = S.energy - S.actedThisYear;
  const bs = S.backstory ? BACKSTORIES[S.backstory] : null;
  const arcs = getArcCards();
  const quests = getActiveQuests();
  const ge = S.activeGlobalEvent ? GLOBAL_EVENTS[S.activeGlobalEvent] : null;
  const project = projectCard();
  const pips = Array.from({ length: Math.max(0, S.energy) }, (_, i) =>
    `<span class="pip ${i < left ? 'on' : ''}"></span>`).join('');
  const noProjectTopics = !S.project && ['phd', 'career'].includes(S.stage)
    ? Object.values(PROJECTS).map(p => `<span class="topic-pill">${p.icon} ${p.title}</span>`).join('')
    : '';

  app.innerHTML = `
    <div class="top-bar">
      <button id="soundBtn" title="Звук">${isSoundOn() ? '🔊' : '🔇'}</button>
      <button id="themeBtn" title="Тема">${getTheme() === 'dark' ? '🌙' : '☀️'}</button>
      <button id="treeBtn" class="badge-btn ${S.skillPoints > 0 ? 'has-points' : ''}" title="Дерево навыков">🌳 ${S.skillPoints}</button>
      <button id="achBtn" class="badge-btn" title="Достижения">🏅 ${S.achievements.length}</button>
      <button id="chronBtn" class="badge-btn" title="Хроника жизни">📜 ${(S.chronicle || []).length}</button>
      <button id="helpBtn" title="Как играть">❓</button>
      <button id="resetBtn" title="Начать заново">🔄</button>
    </div>

    <div class="hero">
      <div class="avatar">${getAvatar()}</div>
      <div class="hero-info">
        <div class="name">${escapeHtml(S.name)}, ${yearsWord(S.age)}</div>
        <div class="role">${escapeHtml(S.position)}${S.spec ? ' · ' + SPEC_NAMES[S.spec] : ''}${S.track && TRACKS[S.track] ? ' · ' + TRACKS[S.track].short : ''}</div>
        <div class="stage"><span>Этап: ${STAGES[S.stage]?.name || '—'}</span><span class="pips">${pips}</span></div>
        <div class="goal">${getGoal()}</div>
        ${S.daily ? `<div class="daily-badge">🎯 Испытание дня ${escapeHtml(S.daily.date)}</div>` : ''}
        ${bs ? `<div class="bs-tag">${bs.icon} ${bs.title}</div>` : ''}
      </div>
    </div>

    ${S.stage === 'career' ? nobelTracker() : ''}
    ${project}
    ${noProjectTopics ? `<div class="topics-hint"><b>Доступные темы:</b> ${noProjectTopics}</div>` : ''}

    ${ge ? `
      <div class="daily-card danger-card">
        <div class="daily-icon">${ge.icon}</div>
        <div class="daily-text">
          <b>Мировое событие: ${ge.title}</b>
          <br><span class="muted small">${ge.desc} (осталось лет: ${S.globalEventYearsLeft})</span>
        </div>
      </div>
    ` : ''}

    ${S.dailyLife ? `
      <div class="daily-card">
        <div class="daily-icon">${S.dailyLife.icon}</div>
        <div class="daily-text"><b>Утро:</b> ${escapeHtml(S.dailyLife.text)}<br>
        <span class="muted small">→ ${escapeHtml(S.dailyLife.result)}</span></div>
      </div>` : ''}

    ${arcs.length ? `<div class="arcs-section">${arcs.map(c => `
      <div class="arc-card" style="border-color:${c.color}">
        <div class="arc-icon">${c.icon}</div>
        <div class="arc-text">${escapeHtml(c.text)}</div>
      </div>
    `).join('')}</div>` : ''}

    ${quests.map(q => {
      const p = questProgress(q);
      return `
      <div class="quest-card">
        <div class="q-icon">${q.icon}</div>
        <div class="q-text">
          <b>Квест:</b> ${escapeHtml(q.title)} — ${escapeHtml(q.desc)}
          <div class="q-bar"><div style="width:${p.pct}%"></div></div>
          <div class="q-deadline">${escapeHtml(p.label)} · до ${q.deadlineAge} лет</div>
        </div>
      </div>`;
    }).join('')}

    <div class="stats">
      ${statHTML('Интеллект', S.int, S.int, 100, 'var(--blue)', '🧠')}
      ${statHTML('Здоровье', S.health, S.health, 100, 'var(--green)', '❤️')}
      ${statHTML('Харизма', S.charm, S.charm, 100, 'var(--purple)', '🗣️')}
      ${statHTML('Стресс', S.stress + '%', S.stress, 100, 'var(--red)', '😰')}
      ${statHTML('Репутация', S.rep, S.rep, 100, 'var(--gold)', '⭐')}
      ${statHTML('Деньги', formatMoney(S.money), undefined, 1, 'var(--gold)', '💰')}
      ${statHTML('Публикаций', S.publications, undefined, 1, 'var(--blue)', '📄')}
      ${statHTML('Открытий', S.discoveries, undefined, 1, 'var(--purple)', '💥')}
      ${statHTML('Влияние', S.influence, S.influence, 30, 'var(--blue)', '🏛️')}
      ${statHTML('Враги', S.enemies, S.enemies, 10, 'var(--red)', '⚔️')}
    </div>

    <div class="skills">
      ${SKILLS.map(k => `<div class="skill"><span class="skill-icon">${SKILL_ICONS[k] || ''}</span><span class="label">${SKILL_NAMES[k]}</span><span class="val">${S.skills[k]}</span></div>`).join('')}
    </div>

    <div class="log" id="logBox">
      ${S.log.map(l => `<p><span class="age">[${l.age}]</span>${escapeHtml(l.msg)}</p>`).join('')}
    </div>

    <div class="actions" id="actions"></div>
  `;

  const logBox = document.getElementById('logBox');
  if (logBox) logBox.scrollTop = 0;

  document.getElementById('soundBtn').onclick = () => { toggleSound(); render(); };
  document.getElementById('themeBtn').onclick = () => { toggleTheme(); render(); };
  document.getElementById('treeBtn').onclick = () => {
    S.pendingModal = {
      isSkillTree: true,
      title: '🌳 Дерево навыков',
      desc: S.skillPoints > 0
        ? 'Трать очки навыков на пассивные улучшения.'
        : 'Очки навыков дают за публикации, открытия и повышения.'
    };
    render();
  };
  document.getElementById('achBtn').onclick = () => {
    S.pendingModal = { isAchievements: true, title: '🏅 Достижения', desc: `Открыто ${S.achievements.length} из ${Object.keys(ACHIEVEMENTS).length}` };
    render();
  };
  document.getElementById('chronBtn').onclick = () => {
    S.pendingModal = { isChronicle: true, title: '📜 Хроника жизни' };
    render();
  };
  document.getElementById('helpBtn').onclick = () => openTutorial(0);
  document.getElementById('resetBtn').onclick = () => {
    if (confirm('Начать жизнь заново? Наследие сохранится.')) newLife();
  };

  renderActions();
}
