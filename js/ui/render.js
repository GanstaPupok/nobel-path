import { S, saveState, addLog } from '../state.js';
import { renderStart } from './start.js';
import { renderGame } from './game.js';
import { renderEvent } from './event.js';
import { renderModal } from './modal.js';
import { renderFinal } from './final.js';
import { getActions } from '../actions.js';
import { rollEvent } from '../events/engine.js';
import { checkThresholds } from '../achievements.js';
import { getAvailableTreeBranch, applyTreeChoice, TREE_BRANCHES } from '../tree.js';
import { endYear } from '../year.js';
import { MINIGAMES } from '../minigames/index.js';
import { playSound } from '../audio.js';

export function render(){
  const app = document.getElementById('app');
  if(!S.started) return renderStart(app);
  if(S.finalReached) return renderFinal(app);
  if(S.pendingModal) return renderModal(app);
  if(S.pendingEvent) return renderEvent(app);
  return renderGame(app);
}

export function afterAction(){
  // Шанс события
  if(Math.random()<0.3 && !S.pendingEvent && !S.pendingModal){
    const ev = rollEvent();
    if(ev) S.pendingEvent = ev;
  }
  // Древо решений
  if(!S.pendingEvent && !S.pendingModal){
    const branch = getAvailableTreeBranch();
    if(branch && Math.random()<0.4){
      S.pendingModal = {
        title:'🌳 Жизненный выбор',
        desc: branch.question,
        opts: branch.options.map(o=>({
          title:o.text,
          desc:o.future,
          f:()=>{ applyTreeChoice(branch.key, o.id); }
        }))
      };
    }
  }
  checkThresholds();
  saveState();
  render();
}

export function renderActions(){
  const container = document.getElementById('actions');
  if(!container) return;
  const acts = getActions();
  container.innerHTML = '';

  acts.forEach((a,i)=>{
    const b = document.createElement('button');
    b.disabled = a.disabled;
    if(a.cls) b.classList.add(a.cls);
    b.style.animation = `fadeInUp .3s ease ${i*0.03}s both`;
    b.innerHTML = `${a.name}<small>${a.desc} · ⚡${a.cost}</small>`;
    b.onclick = ()=>{
      S.actedThisYear += a.cost;
      a.fn();
      afterAction();
    };
    container.appendChild(b);
  });

  // Кнопка мини-игры
  const mg = document.createElement('button');
  mg.className = 'quest';
  const mgList = MINIGAMES;
  mg.innerHTML = `🎮 Мини-игра<small>${mgList.length} вариантов · не тратит энергию</small>`;
  mg.onclick = ()=>{
    // Выбор мини-игры через модалку
    S.pendingModal = {
      title:'🎮 Мини-игра',
      desc:'Проверь себя и получи бонусы.',
      opts: mgList.map(m=>({
        title:`${m.icon} ${m.title}`,
        desc: m.desc,
        f:()=>{
          m.fn((result, good)=>{
            addLog(`🎮 Мини-игра: ${result}`);
            afterAction();
          });
        }
      }))
    };
    render();
  };
  container.appendChild(mg);

  // Кнопка завершения года
  const end = document.createElement('button');
  end.className = 'end-year';
  end.innerHTML = '➡️ Завершить год<small>Пропустить оставшиеся действия</small>';
  end.onclick = ()=>{
    playSound('year');
    endYear();
    render();
  };
  container.appendChild(end);
}