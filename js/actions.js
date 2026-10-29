import { S, addLog } from './state.js';
import { playSound } from './audio.js';
import { addAchievement } from './achievements.js';
import { clamp } from './utils.js';
import { SKILLS } from './config.js';
import { getGlobalModifier } from './world.js'; 
import { addSkillPoint } from './skills.js'; 

function rndSkill(){ return SKILLS[Math.floor(Math.random()*SKILLS.length)]; }
const d20 = ()=>Math.floor(Math.random()*20)+1;

export function getActions(){
  const e = S.energy - S.actedThisYear;
  const acts = [];
  const add = (name,desc,cost,fn,cls='')=>{
    acts.push({name,desc,cost,fn,cls,disabled:e<cost});
  };

  if(S.stage==='child'){
    add('📚 Учиться в школе','Интеллект +3, стресс +4',1,()=>{
      S.int+=3;S.stress=clamp(S.stress+4,0,100);addLog('Учился.');playSound('click');
    });
    add('📖 Читать научные книги','Интеллект +5, навык +2',1,()=>{
      S.int+=5;S.skills[rndSkill()]+=2;S.stress=clamp(S.stress+2,0,100);addLog('Читал.');playSound('click');
    });
    add('🎈 Гулять с друзьями','Харизма +3, стресс −10',1,()=>{
      S.charm+=3;S.stress=clamp(S.stress-10,0,100);addLog('Гулял.');playSound('click');
    });
    add('🛵 Подработка','Деньги +300, здоровье −3',1,()=>{
      S.money+=300;S.health=clamp(S.health-3,0,100);addLog('Подрабатывал.');playSound('coin');
    });
    add('🏃 Спорт','Здоровье +10, стресс −10',1,()=>{
      S.health=clamp(S.health+10,0,100);S.stress=clamp(S.stress-10,0,100);addLog('Спорт.');playSound('click');
    },'safe');

    // Уникальные
    if(S.flags.poorStart){
      add('🧹 Мыть полы','Деньги +150, здоровье −2',1,()=>{
        S.money+=150;S.health=clamp(S.health-2,0,100);addLog('Уборка.');playSound('coin');
      });
    }
    if(S.flags.academicFamily){
      add('📝 Писать сочинения','Письмо +4, интеллект +2',1,()=>{
        S.skills.write+=4;S.int+=2;addLog('Сочинения.');playSound('click');
      });
    }
    if(S.flags.richStart){
      add('🎹 Кружок','Харизма +3, интеллект +2',1,()=>{
        S.charm+=3;S.int+=2;addLog('Кружок.');playSound('click');
      });
    }
    if(S.flags.orphan){
      add('🛡️ Отстаивать себя','Харизма +4, стресс +5',1,()=>{
        S.charm+=4;S.stress=clamp(S.stress+5,0,100);addLog('Отстаивал.');playSound('click');
      });
    }
    if(S.flags.prodigy){
      add('🧠 Олимпиадные задачи','Интеллект +6, стресс +6',1,()=>{
        S.int+=6;S.stress=clamp(S.stress+6,0,100);addLog('Олимпиады.');playSound('click');
      });
    }
    if(S.flags.athlete){
      add('🥇 Тренировка','Здоровье +8, харизма +2',1,()=>{
        S.health=clamp(S.health+8,0,100);S.charm+=2;addLog('Тренировка.');playSound('click');
      });
    }
  }

  if(S.stage==='uni'){
    add('🏫 Учиться в вузе','Интеллект +5, навык +3',1,()=>{
      S.int+=5;S.skills[rndSkill()]+=3;S.stress=clamp(S.stress+5,0,100);addLog('Учёба.');playSound('click');
    });
    add('🔬 Лабораторная работа','Навык +5, шанс открытия',1,()=>{
      S.skills[rndSkill()]+=5;
      if(d20()>15){S.discoveries++;S.rep=clamp(S.rep+5,0,100);addLog('🔬 Открытие!');addAchievement('first_disc');playSound('success');}
      else{addLog('Лабы.');playSound('click');}
      S.stress=clamp(S.stress+4,0,100);
    });
    add('💼 Подработка','Деньги +1500, здоровье −5',1,()=>{
      S.money+=1500;S.health=clamp(S.health-5,0,100);addLog('Подработка.');playSound('coin');
    });
    add('🎤 Конференция','Репутация +3, харизма +2',1,()=>{
      S.rep=clamp(S.rep+3,0,100);S.charm+=2;addLog('Конференция.');playSound('click');
    });
    add('🎭 Студенческий театр','Харизма +5, стресс −15',1,()=>{
      S.charm+=5;S.stress=clamp(S.stress-15,0,100);addLog('Театр.');playSound('click');
    });
    add('🏋️ Качалка','Здоровье +8, харизма +1',1,()=>{
      S.health=clamp(S.health+8,0,100);S.charm+=1;addLog('Качалка.');playSound('click');
    },'safe');
    add('😴 Отдых','Стресс −25, здоровье +5',1,()=>{
      S.stress=clamp(S.stress-25,0,100);S.health=clamp(S.health+5,0,100);addLog('Отдых.');playSound('click');
    },'safe');
  }

  if(S.stage==='phd'){
    add('🧪 Работа в лаборатории','Навык +5, деньги +3000',1,()=>{
      S.skills[rndSkill()]+=5;S.money+=3000;S.stress=clamp(S.stress+8,0,100);addLog('Лаборатория.');playSound('coin');
    });
    add('💥 Провести эксперимент','Риск! Открытие / провал',1,()=>{
      const bonus = (Math.floor(S.int/10) + (S.spec?3:0)) * getGlobalModifier('discoveryChance');
      const roll=d20()+bonus;
      S.money=Math.max(0,S.money-1000);S.stress=clamp(S.stress+10,0,100);
      if(roll>15){S.discoveries++;S.rep=clamp(S.rep+10,0,100);addLog('💥 Открытие!');addAchievement('first_disc');playSound('success');}
      else if(roll>8){addLog('Нейтрально.');playSound('click');}
      else{S.rep=clamp(S.rep-5,0,100);addLog('💀 Провал.');playSound('fail');}
    },'danger');
    add('📝 Написать статью','Публикация, если хватает навыка',1,()=>{
      S.stress = clamp(S.stress + (S.flags.geniusPub ? 0 : 5), 0, 100);;
      if(S.skills.write>10){S.publications++;S.rep=clamp(S.rep+5,0,100);addLog('📝 Статья!');if(S.publications===1)addAchievement('first_pub');playSound('success');}
      else{addLog('Отвергли.');playSound('fail');}
    });
    add('💰 Грантрайтинг','Шанс получить грант',1,()=>{
      const roll=d20()+Math.floor(S.charm/10);
      if(roll>12){S.money += 50000 * getGlobalModifier('grantMoney') * (S.flags.luckyGrants ? 2 : 1);S.rep=clamp(S.rep+5,0,100);S.grants++;addLog('💰 Грант! +50 000 ₽');addAchievement('first_grant');playSound('coin');}
      else{addLog('Отказ.');playSound('fail');}
      S.stress=clamp(S.stress+5,0,100);
    });
    add('👨‍🏫 Вести семинары','Харизма +4, деньги +2000',1,()=>{
      S.charm+=4;S.money+=2000;addLog('Семинары.');playSound('coin');
    });
    if(S.spec==='phys'){
      add('⚛️ Коллайдер','Риск: большое открытие',1,()=>{
        const roll=d20()+Math.floor(S.int/8);
        S.stress=clamp(S.stress+12,0,100);
        if(roll>16){S.discoveries++;S.rep=clamp(S.rep+15,0,100);addLog('⚛️ Частица!');playSound('success');}
        else{addLog('⚛️ Безрезультатно.');playSound('click');}
      },'special');
    }
    if(S.spec==='bio'){
      add('🧬 Культура','Навык +6, риск',1,()=>{
        S.skills.bio+=6;
        if(d20()>14){S.discoveries++;S.rep=clamp(S.rep+10,0,100);addLog('🧬 Результат!');playSound('success');}
        else{addLog('🧬 Обычно.');playSound('click');}
      },'special');
    }
    if(S.spec==='it'){
      add('💻 Симуляция','IT +6, шанс статьи',1,()=>{
        S.skills.it+=6;
        if(d20()>13){S.publications++;S.rep=clamp(S.rep+8,0,100);addLog('💻 Симуляция → статья!');playSound('success');}
        else{addLog('💻 Код работает.');playSound('click');}
      },'special');
    }
    add('😴 Отдохнуть','Стресс −25',1,()=>{
      S.stress=clamp(S.stress-25,0,100);addLog('Отдых.');playSound('click');
    },'safe');
  }

  if(S.stage==='career'){
    add('💼 Работать','Деньги +10000, стресс +10',1,()=>{
      S.money+=10000;S.stress=clamp(S.stress+10,0,100);addLog('Работа.');playSound('coin');
    });
    add('🌌 Big Science','Высокий риск и награда',1,()=>{
      const bonus = (Math.floor(S.int/8) + Math.floor(S.rep/10) + (S.spec?5:0)) * getGlobalModifier('discoveryChance');
      const roll=d20()+bonus;
      S.stress=clamp(S.stress+15,0,100);
      if(roll>18){S.discoveries++;S.rep=clamp(S.rep+20,0,100);S.money+=100000;addLog('🌌 Открытие! +100 000 ₽');addAchievement('big_science');playSound('success');}
      else if(roll>10){addLog('Скромно.');playSound('click');}
      else{S.rep=clamp(S.rep-10,0,100);S.health=clamp(S.health-20,0,100);addLog('💥 Авария.');playSound('fail');}
    },'danger');
    add('📰 Опубликовать статью','Публикация +1, репутация +8',1,()=>{
      S.publications++;S.rep=clamp(S.rep+8,0,100);S.stress=clamp(S.stress+5,0,100);
      addLog('📰 Статья!');playSound('success');
      if(S.publications>=5)addAchievement('five_pubs');
      if(S.publications>=10)addAchievement('ten_pubs');
    });
    add('📈 Инвестировать','Риск: ×2 / ×0.5 / ×0',1,()=>{
      const sum=Math.min(S.money,50000);
      if(sum<1000){addLog('Нет денег.');return;}
      S.money-=sum;
      const r=Math.random();
      if(r<0.4){S.money+=sum*2;addLog('📈 ×2!');playSound('coin');}
      else if(r<0.7){S.money+=Math.floor(sum*0.5);addLog('📉 ×0.5');playSound('click');}
      else{addLog('💸 Прогорело.');playSound('fail');}
    },'danger');
    add('⬆️ Заявка на повышение','Шанс повышения',1,()=>{
      const next={'школьник':'м.н.с.','лаборант':'м.н.с.','инженер':'м.н.с.','м.н.с.':'н.с.','н.с.':'с.н.с.','с.н.с.':'зав. лаб.','зав. лаб.':'зам. директора','зам. директора':'директор НИИ'};
      const req={'м.н.с.':{rep:20,charm:20},'н.с.':{rep:40,charm:40},'с.н.с.':{rep:60,charm:60},'зав. лаб.':{rep:75,charm:75},'зам. директора':{rep:85,charm:85},'директор НИИ':{rep:95,charm:95}};
      const target=next[S.position];
      if(!target){addLog('Уже на вершине.');return;}
      const r=req[target];
     
      // При утечке мозгов требования к репутации снижаются на 20%
      const reqRep = Math.floor(r.rep * getGlobalModifier('rep'));
      if(S.rep>=reqRep && S.charm>=r.charm){
        S.position=target;addLog(`🎉 Теперь ты ${target}.`);playSound('levelup');
        if(target==='директор НИИ')addAchievement('director');
      }else{addLog(`❌ Отказ (нужно репутация ${reqRep}, харизма ${r.charm}).`);playSound('fail');}
      S.stress=clamp(S.stress+5,0,100);
    });
    add('🧑‍🏫 Читать лекции','Харизма +3, деньги +8000',1,()=>{
      S.charm+=3;S.money+=8000;addLog('Лекции.');playSound('coin');
    });
    add('🏖️ Отпуск','Стресс −30, здоровье +5',1,()=>{
      S.stress=clamp(S.stress-30,0,100);S.health=clamp(S.health+5,0,100);addLog('Отпуск.');playSound('click');
    },'safe');
  }

  return acts;
}
