import { S, saveState, addLog } from '../state.js';
import { SKILLS, SKILL_NAMES, SPEC_NAMES, STAGES, BACKSTORIES, GLOBAL_EVENTS } from '../config.js';
import { escapeHtml, formatMoney, clamp } from '../utils.js';
import { getArcCards } from '../arcs.js';
import { getActions } from '../actions.js';
import { renderActions } from './render.js';
import { playSound, isSoundOn, toggleSound } from '../audio.js';
import { getTheme, toggleTheme } from '../theme.js';
import { render } from './render.js';

export function getAvatar(){
  const arr = S.gender==='m' ? ['🧒','👦','🧑','👨','🧑‍🎓','🧑‍🔬','👨‍🔬','👨‍🏫','👨‍💼','👴']
                            : ['🧒','👧','🧑','👩','🧑‍🎓','🧑‍🔬','👩‍🔬','👩‍🏫','👩‍💼','👵'];
  if(S.age<10) return arr[0];
  if(S.age<18) return arr[1];
  if(S.age<25) return arr[4];
  if(S.age<35) return arr[5];
  if(S.age<50) return arr[6];
  if(S.age<65) return arr[7];
  return arr[9];
}

export function statHTML(label,val,barVal,barMax,color){
  let bar='';
  if(barVal!==undefined){
    const pct = clamp(barVal/barMax*100,0,100);
    bar = `<div class="bar"><div style="width:${pct}%;background:${color||'var(--accent)'}"></div></div>`;
  }
  return `<div class="stat"><div class="label">${label}</div><div class="val">${val}</div>${bar}</div>`;
}

export function renderGame(app){
  const e = S.energy - S.actedThisYear;
  const bs = S.backstory ? BACKSTORIES[S.backstory] : null;
  const arcs = getArcCards();

  app.innerHTML = `
    <div class="top-bar">
      <button id="soundBtn">${isSoundOn()?'🔊':'🔇'}</button>
      <button id="themeBtn">${getTheme()==='dark'?'🌙':'☀️'}</button>
      <button id="resetBtn">🔄</button>
    </div>

    <div class="hero">
      <div class="avatar">${getAvatar()}</div>
      <div class="hero-info">
        <div class="name">${escapeHtml(S.name)}, ${S.age} лет</div>
        <div class="role">${S.position}${S.spec?' · '+SPEC_NAMES[S.spec]:''}</div>
        <div class="stage">Этап: ${STAGES[S.stage]?.name||'—'} · ⚡ ${e}/${S.energy}</div>
        ${bs?`<div class="bs-tag">${bs.icon} ${bs.title}</div>`:''}
      </div>
    </div>

    ${S.activeGlobalEvent ? `
      <div class="daily-card" style="border-color:var(--red); background:linear-gradient(135deg, rgba(248,81,73,0.15), rgba(233,69,96,0.1));">
        <div class="daily-icon">${GLOBAL_EVENTS[S.activeGlobalEvent].icon}</div>
        <div class="daily-text">
          <b>Мировое событие: ${GLOBAL_EVENTS[S.activeGlobalEvent].title}</b>
          <br><span style="color:var(--muted);font-size:12px">${GLOBAL_EVENTS[S.activeGlobalEvent].desc} (осталось лет: ${S.globalEventYearsLeft})</span>
        </div>
      </div>
    ` : ''}

    ${S.dailyLife?`
      <div class="daily-card">
        <div class="daily-icon">${S.dailyLife.icon}</div>
        <div class="daily-text"><b>Ежедневное:</b> ${escapeHtml(S.dailyLife.text)}<br>
        <span style="color:var(--muted);font-size:12px">→ ${escapeHtml(S.dailyLife.result)}</span></div>
      </div>`:''}

    ${arcs.length?`<div class="arcs-section">${arcs.map(c=>`
      <div class="arc-card" style="border-color:${c.color}">
        <div class="arc-icon">${c.icon}</div>
        <div class="arc-text">${escapeHtml(c.text)}</div>
      </div>
    `).join('')}</div>`:''}

    ${S.quests.length?S.quests.map(q=>`
      <div class="quest-card">
        <div class="q-icon">${q.icon}</div>
        <div class="q-text"><b>Квест:</b> ${escapeHtml(q.title)} — ${escapeHtml(q.desc)}
        <div class="q-deadline">До ${q.deadlineAge} лет</div></div>
      </div>
    `).join(''):''}

    <div class="stats">
      ${statHTML('Интеллект',S.int,S.int,100,'var(--blue)')}
      ${statHTML('Здоровье',S.health,S.health,100,'var(--green)')}
      ${statHTML('Харизма',S.charm,S.charm,100,'var(--purple)')}
      ${statHTML('Стресс',S.stress+'%',S.stress,100,'var(--red)')}
      ${statHTML('Репутация',S.rep,S.rep,100,'var(--gold)')}
      ${statHTML('Деньги',formatMoney(S.money))}
      ${statHTML('Публикаций',S.publications)}
      ${statHTML('Открытий',S.discoveries)}
    </div>

    <div class="skills">
      ${SKILLS.map(k=>`<div class="skill"><div class="label">${SKILL_NAMES[k]}</div><div class="val">${S.skills[k]}</div></div>`).join('')}
    </div>

    <div class="log" id="logBox">
      ${S.log.map(l=>`<p><span class="age">[${l.age}]</span>${escapeHtml(l.msg)}</p>`).join('')}
    </div>

    <div class="actions" id="actions"></div>
  `;

  document.getElementById('soundBtn').onclick = ()=>{ toggleSound(); render(); };
  document.getElementById('themeBtn').onclick = ()=>{ toggleTheme(); render(); };
  document.getElementById('resetBtn').onclick = ()=>{ if(confirm('Начать заново?')) { localStorage.removeItem('nobel_path_v6'); location.reload(); } };

  renderActions();
}
