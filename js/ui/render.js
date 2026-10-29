import { S, saveState, addLog } from '../state.js';
import { renderStart } from './start.js';
import { renderGame } from './game.js';
import { renderEvent } from './event.js';
import { renderModal } from './modal.js';
import { renderFinal } from './final.js';
import { getActions } from '../actions.js';
import { rollEvent } from '../events/engine.js';
import { checkThresholds } from '../achievements.js';
import { getAvailableTreeBranch, applyTreeChoice } from '../tree.js';
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
  if(Math.random()<0.3 && !S.pendingEvent && !S.pendingModal){
    const ev = rollEvent();
    if(ev) S.pendingEvent = ev;
  }
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

  const mg = document.createElement('button');
  mg.className = 'quest';
  S.minigamesThisYear = S.minigamesThisYear || 0;
  
  if (S.minigamesThisYear >= 2) {
    mg.disabled = true;
    mg.innerHTML = `🎮 Мини-игра<small>Лимит на этот год исчерпан (2/2)</small>`;
  } else {
    mg.innerHTML = `🎮 Мини-игра<small>${MINIGAMES.length} вариантов · осталось: ${2 - S.minigamesThisYear}</small>`;
    mg.onclick = ()=>{
      S.pendingModal = {
        title:'🎮 Мини-игра',
        desc:'Проверь себя и получи бонусы. (Не тратит энергию)',
        opts: MINIGAMES.map(m=>({
          title:`${m.icon} ${m.title}`,
          desc: m.desc,
          f:()=>{
            S.minigamesThisYear++;
            m.fn((result, good)=>{
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
  end.onclick = ()=>{
    playSound('year');
    endYear();
    render();
  };
  container.appendChild(end);
}
