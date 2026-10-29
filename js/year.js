import { S, saveState, addLog } from './state.js';
import { clamp } from './utils.js';
import { playSound } from './audio.js';
import { tickArcs } from './arcs.js';
import { checkFinal } from './finals.js';
import { rollDailyLife } from './daily.js';
import { tickQuests, maybeAddQuest } from './quests.js';
import { checkTreeConsequences } from './tree.js';

export function endYear(){
  S.age++; S.year++; S.yearCount++;
  S.actedThisYear = 0;
  S.energy = 3 + (S.health>70?1:0) + (S.charm>70?1:0);
  S.money = Math.max(0, S.money - 2000);
  S.stress = clamp(S.stress - 5, 0, 100);
  if(S.stress > 80){ S.health = clamp(S.health - 10, 0, 100); addLog('⚠️ Высокий стресс подорвал здоровье.'); }

  tickArcs();
  tickQuests();
  maybeAddQuest();

  // Проверка последствий древа
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