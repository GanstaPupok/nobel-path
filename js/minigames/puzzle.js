import { S, saveState } from '../state.js';
import { playSound } from '../audio.js';
import { addAchievement } from '../achievements.js';

const FORMULAS = [
  {name:'Вода', parts:['H','H','O']},
  {name:'Углекислый газ', parts:['C','O','O']},
  {name:'Метан', parts:['C','H','H','H','H']},
  {name:'Серная кислота', parts:['H','H','S','O','O','O','O']},
  {name:'Аммиак', parts:['N','H','H','H']},
  {name:'Глюкоза', parts:['C','C','C','C','C','C','O','O','O','O','O','O']}
];

const TILE_COLORS = {H:'#58a6ff',O:'#f85149',C:'#3fb950',N:'#a371f7',S:'#ffd700'};

export function playPuzzle(onDone){
  const formula = FORMULAS[Math.floor(Math.random()*FORMULAS.length)];
  const parts = [...formula.parts];
  const shuffled = shuffle([...parts]);

  const overlay = document.createElement('div');
  overlay.className='mg-overlay';
  overlay.innerHTML = `
    <div class="mg-box">
      <h2>🧩 Лабораторный пазл</h2>
      <p class="mg-hint">Собери формулу: <b>${formula.name}</b></p>
      <div class="mg-puzzle-slots" id="slots">
        ${parts.map((_,i)=>`<div class="mg-puzzle-slot" data-idx="${i}"></div>`).join('')}
      </div>
      <div class="mg-puzzle-tiles" id="tiles">
        ${shuffled.map((p,i)=>`<div class="mg-puzzle-tile" data-idx="${i}" style="color:${TILE_COLORS[p]||'#fff'}">${p}</div>`).join('')}
      </div>
      <div class="mg-result" id="result"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  let placed = 0;
  const slots = overlay.querySelectorAll('.mg-puzzle-slot');
  const tiles = overlay.querySelectorAll('.mg-puzzle-tile');

  tiles.forEach(tile=>{
    tile.onclick = ()=>{
      if(tile.classList.contains('used')) return;
      const tileIdx = parseInt(tile.dataset.idx);
      const expected = parts[placed];
      const actual = shuffled[tileIdx];
      if(expected === actual){
        // Правильно
        slots[placed].textContent = actual;
        slots[placed].classList.add('filled');
        slots[placed].style.color = TILE_COLORS[actual]||'#fff';
        tile.classList.add('used');
        playSound('click');
        placed++;
        if(placed === parts.length){
          // Готово
          setTimeout(()=>finish(true), 400);
        }
      } else {
        // Неправильно
        tile.style.transform = 'translateX(8px)';
        setTimeout(()=>tile.style.transform='', 150);
        playSound('fail');
        S.stress = Math.min(100, S.stress + 2);
      }
    };
  });

  function finish(success){
    if(success){
      S.skills.chem += 3;
      S.int += 2;
      playSound('success');
      if(S.minigameDone.puzzle===0) addAchievement('puzzle_master');
      overlay.querySelector('#result').className='mg-result good';
      overlay.querySelector('#result').textContent = `✅ Формула собрана! +3 химия, +2 интеллект`;
    } else {
      S.stress = Math.min(100, S.stress+5);
      playSound('fail');
      overlay.querySelector('#result').className='mg-result bad';
      overlay.querySelector('#result').textContent = '❌ Не удалось собрать.';
    }
    S.minigameDone.puzzle++;
    saveState();
    setTimeout(()=>{
      overlay.remove();
      onDone && onDone(success ? 'Формула собрана!' : 'Провал', success);
    }, 1400);
  }
}

function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}