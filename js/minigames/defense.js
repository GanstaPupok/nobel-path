import { S, saveState } from '../state.js';
import { playSound } from '../audio.js';
import { addAchievement } from '../achievements.js';

const WORDS = ['ДИССЕРТАЦИЯ','ГИПОТЕЗА','ЭКСПЕРИМЕНТ','АКАДЕМИЯ','ТЕОРИЯ','АНАЛИЗ','СИНТЕЗ','МЕТОДОЛОГИЯ'];

export function playDefense(onDone){
  const rounds = 3;
  let round = 0;
  let wins = 0;
  const word = WORDS[Math.floor(Math.random()*WORDS.length)];

  const overlay = document.createElement('div');
  overlay.className='mg-overlay';
  document.body.appendChild(overlay);

  function renderRound(){
    if(round >= rounds) return finish();
    const timeLimit = 1200 - round*200; // 1200, 1000, 800 мс
    const isMain = round < 2;

    overlay.innerHTML = `
      <div class="mg-box">
        <h2>🛡️ Защита диссертации</h2>
        <p class="mg-hint">Раунд ${round+1} из ${rounds}. Успей нажать кнопку!</p>
        <div class="mg-progress">
          ${Array(rounds).fill(0).map((_,i)=>`<div class="dot ${i<round?'done':i===round?'active':''}"></div>`).join('')}
        </div>
        <div class="mg-timer"><div id="timerBar" style="width:100%"></div></div>
        <div class="mg-qte-area">
          <div class="mg-qte-word">${word}</div>
          <div class="mg-qte-hint">Нажми как можно быстрее!</div>
          <button id="qteBtn">🛡️ ЗАЩИТИТЬСЯ!</button>
        </div>
        <div class="mg-result" id="result"></div>
      </div>
    `;

    const bar = overlay.querySelector('#timerBar');
    const btn = overlay.querySelector('#qteBtn');
    const result = overlay.querySelector('#result');
    let start = performance.now();
    let finished = false;

    const interval = setInterval(()=>{
      const elapsed = performance.now() - start;
      const pct = Math.max(0, 100 - (elapsed/timeLimit*100));
      bar.style.width = pct + '%';
      if(elapsed >= timeLimit && !finished){
        finished = true;
        clearInterval(interval);
        result.className='mg-result bad';
        result.textContent = '⏰ Не успел!';
        playSound('fail');
        setTimeout(()=>{ round++; renderRound(); }, 900);
      }
    }, 30);

    btn.onclick = ()=>{
      if(finished) return;
      finished = true;
      clearInterval(interval);
      const elapsed = performance.now() - start;
      if(elapsed < timeLimit){
        wins++;
        result.className='mg-result good';
        result.textContent = `✅ Успел за ${Math.round(elapsed)} мс!`;
        playSound('success');
      }
      setTimeout(()=>{ round++; renderRound(); }, 700);
    };
  }

  function finish(){
    if(wins >= 2){
      S.rep += 5;
      S.int += 2;
      playSound('success');
      if(S.minigameDone.defense===0) addAchievement('defense_master');
      overlay.innerHTML = `
        <div class="mg-box">
          <h2>🛡️ Защита пройдена!</h2>
          <div class="mg-result good">✅ ${wins} из ${rounds} раундов. +5 репутация, +2 интеллект</div>
          <button class="mg-close" id="closeBtn">Закрыть</button>
        </div>
      `;
    } else {
      S.stress = Math.min(100, S.stress+10);
      playSound('fail');
      overlay.innerHTML = `
        <div class="mg-box">
          <h2>🛡️ Защита провалена</h2>
          <div class="mg-result bad">❌ Только ${wins} из ${rounds}. +10 стресс</div>
          <button class="mg-close" id="closeBtn">Закрыть</button>
        </div>
      `;
    }
    overlay.querySelector('#closeBtn').onclick = ()=>{
      overlay.remove();
      onDone && onDone(wins>=2 ? 'Защита пройдена!' : 'Провал', wins>=2);
    };
    S.minigameDone.defense++;
    saveState();
  }

  renderRound();
}