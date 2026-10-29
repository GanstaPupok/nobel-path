import { S, saveState, addLog } from './state.js';
import { clamp } from './utils.js';
import { playSound } from './audio.js';
import { tickArcs } from './arcs.js';
import { checkFinal } from './finals.js';
import { rollDailyLife } from './daily.js';
import { tickQuests, maybeAddQuest } from './quests.js';
import { checkTreeConsequences } from './tree.js';
import { checkGlobalEvents, getGlobalModifier } from './world.js';

export function endYear(){
  S.age++; S.year++; S.yearCount++;
  S.actedThisYear = 0;
  S.minigamesThisYear = 0; // Сброс лимита мини-игр
  S.energy = 3 + (S.health>70?1:0) + (S.charm>70?1:0);
  
  // Стоимость жизни растет с возрастом
  let baseRent = 1000;
  if (S.age > 18) baseRent = 3000;
  if (S.age > 25) baseRent = 6000;
  if (S.age > 35) baseRent = 10000;
  
  const rent = Math.floor(baseRent / getGlobalModifier('salary'));
  S.money = Math.max(0, S.money - rent);
  
  if (S.money === 0 && rent > 0) {
    S.stress = clamp(S.stress + 15, 0, 100);
    addLog('⚠️ Тебе не хватило денег на жизнь! Стресс вырос.');
  }
  S.stress = clamp(S.stress + (5 * getGlobalModifier('stress')) - 10, 0, 100); 
  
  // Влияние пандемии
  if (S.activeGlobalEvent === 'pandemic') {
    S.health = clamp(S.health - 5, 0, 100);
    if (Math.random() < 0.3) addLog('🦠 Ты переболел в пандемию.');
  }

  if(S.stress >= 100){
    addLog('🔥 ВЫГОРАНИЕ! Ты не выдержал нагрузки. Пришлось взять академический отпуск на год.');
    S.stress = 50; // Сбрасываем стресс
    S.health = clamp(S.health - 15, 0, 100);
    S.energy = 1; // В этом году мало энергии
    S.money = Math.max(0, S.money - 10000); // Расходы на лечение
    playSound('fail');
  } else if(S.stress > 80){ 
    S.health = clamp(S.health - 10, 0, 100); 
    addLog('⚠️ Высокий стресс подорвал здоровье.'); 
  }

  tickArcs();
  tickQuests();
  checkGlobalEvents();
  maybeAddQuest();

  const treeMsg = checkTreeConsequences();
  if(treeMsg) addLog(treeMsg);

  // Смена этапа
  if(S.stage==='child' && S.age>=17){
    if(S.int>=40){
      S.stage='uni'; S.position='студент';
      addLog('🎓 Ты поступил в вуз!');
      playSound('levelup');
      S.pendingModal = {
        title:'🎓 Выбор специализации',
        desc:'Пора определиться с направлением науки.',
        opts:[
          {title:'⚛️ Физик',desc:'+3 к экспериментам, +5 интеллекта',f:()=>{S.spec='phys';S.int+=5;}},
          {title:'🧬 Биолог',desc:'+3 к экспериментам, +10 здоровья',f:()=>{S.spec='bio';S.health=clamp(S.health+10,0,100);}},
          {title:'💻 Программист',desc:'+3 к экспериментам, +10 IT',f:()=>{S.spec='it';S.skills.it+=10;}}
        ]
      };
    } else {
      addLog('😔 Интеллекта не хватило для вуза. Год подготовки.');
      playSound('fail');
    }
  }
  if(S.stage==='uni' && S.age>=23){
    if(S.int>=60 && S.publications>=1){
      S.stage='phd'; S.position='аспирант';
      addLog('🎓 Аспирантура!');
      playSound('levelup');
    } else {
      S.stage='career'; S.position='лаборант';
      addLog('😔 В аспирантуру не взяли.');
      playSound('fail');
    }
  }
  if(S.stage==='phd' && S.age>=30){
    if(S.discoveries>=1){
      S.stage='career'; S.position='м.н.с.';
      addLog('🎓 Защита! Ты м.н.с.');
      playSound('levelup');
    } else {
      S.stage='career'; S.position='инженер';
      addLog('😔 Диссертация провалена.');
      playSound('fail');
    }
  }

  if(S.age>=65 || (S.stage==='career' && S.age>=58)){
    checkFinal();
  }

  if(!S.finalReached){
    S.dailyLife = null;
    rollDailyLife();
  }

  saveState();
}
