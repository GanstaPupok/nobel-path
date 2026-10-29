import { S, saveState } from '../state.js';
import { playSound } from '../audio.js';
import { addAchievement } from '../achievements.js';
import { showMinigameResult } from './index.js';

const QUIZ_POOL = [
  {q:'Сколько планет в Солнечной системе?', a:['7','8','9','10'], correct:1},
  {q:'Что такое H₂O?', a:['Кислород','Вода','Перекись','Соль'], correct:1},
  {q:'Кто открыл закон всемирного тяготения?', a:['Эйнштейн','Ньютон','Галилей','Кеплер'], correct:1},
  {q:'Какой газ преобладает в атмосфере Земли?', a:['Кислород','Азот','Углекислый','Водород'], correct:1},
  {q:'Что изучает биология?', a:['Звёзды','Живое','Химию','Математику'], correct:1},
  {q:'Что такое ДНК?', a:['Белок','Молекула наследственности','Углевод','Липид'], correct:1},
  {q:'Кто сформулировал теорию относительности?', a:['Бор','Эйнштейн','Планк','Резерфорд'], correct:1},
  {q:'Что такое фотосинтез?', a:['Дыхание','Превращение света в энергию','Деление клетки','Рост'], correct:1},
  {q:'Какой элемент обозначается Fe?', a:['Фтор','Железо','Фосфор','Франций'], correct:1},
  {q:'Что такое гравитация?', a:['Сила притяжения','Сила отталкивания','Поле','Волна'], correct:0},
  {q:'Сколько хромосом у человека?', a:['23','44','46','48'], correct:2},
  {q:'Что такое скорость света?', a:['300 км/с','300 000 км/с','3 000 км/с','30 000 км/с'], correct:1}
];

export function playQuiz(onDone){
  const questions = shuffle([...QUIZ_POOL]).slice(0,4);
  let idx = 0;
  let score = 0;

  function render(){
    if(idx >= questions.length) return finish();
    const q = questions[idx];
    const overlay = document.createElement('div');
    overlay.className='mg-overlay';
    overlay.innerHTML = `
      <div class="mg-box">
        <h2>🎓 Научный тест</h2>
        <p class="mg-hint">Вопрос ${idx+1} из ${questions.length}. Проверка интеллекта.</p>
        <div class="mg-progress">
          ${questions.map((_,i)=>`<div class="dot ${i<idx?'done':i===idx?'active':''}"></div>`).join('')}
        </div>
        <div class="mg-question">${q.q}</div>
        <div class="mg-options" id="qOpts"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    const box = overlay.querySelector('#qOpts');
    q.a.forEach((ans,i)=>{
      const b = document.createElement('button');
      b.textContent = ans;
      b.onclick = ()=>{
        if(i === q.correct){ b.classList.add('correct'); score++; playSound('success'); }
        else { b.classList.add('wrong'); q.a.forEach((_,j)=>{ if(j===q.correct) box.children[j].classList.add('correct'); }); playSound('fail'); }
        box.querySelectorAll('button').forEach(x=>x.disabled=true);
        setTimeout(()=>{ overlay.remove(); idx++; render(); }, 800);
      };
      box.appendChild(b);
    });
  }

  function finish(){
    const good = score >= 3;
    if(good){
      S.int += 5;
      S.rep += 2;
      playSound('success');
      if(S.minigameDone.quiz===0) addAchievement('quiz_master');
    } else {
      S.stress = Math.min(100, S.stress + 5);
      playSound('fail');
    }
    S.minigameDone.quiz++;
    saveState();
    onDone && onDone(good ? `${score}/${questions.length} — Отлично! +5 интеллект` : `${score}/${questions.length} — Слабо. +5 стресс`, good);
  }

  render();
}

function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}