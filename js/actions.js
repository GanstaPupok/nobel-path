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
  const add = (name,desc,cost,fn,cls='',moneyCost=0)=>{
    // Если действие требует денег, проверяем, есть ли они
    const canAfford = S.money >= moneyCost;
    acts.push({name,desc: desc + (moneyCost ? ` (Цена: ${moneyCost}₽)` : ''), cost, fn, cls, disabled: e<cost || !canAfford});
  };

  if(S.stage==='child'){
    add('📚 Учиться в школе','Интеллект +3, стресс +4',1,()=>{
      S.int+=3;S.stress=clamp(S.stress+4,0,100);addLog('Учился.');playSound('click');
    });
    add('📖 Читать научные книги','Интеллект +5, навык +2',1,()=>{
      S.int+=5;S.skills[rndSkill()]+=2;S.stress=clamp(S.stress+2,0,100);addLog('Читал.');playSound('click');
    }, '', 0);
    add('🎈 Гулять с друзьями','Харизма +3, стресс −10',1,()=>{
      S.charm+=3;S.stress=clamp(S.stress-10,0,100);addLog('Гулял.');playSound('click');
    });
    // Подработка в детстве — копейки, но и расходов нет
    add('🛵 Подработка (курьер)','Деньги +400, здоровье −5',1,()=>{
      S.money+=400;S.health=clamp(S.health-5,0,100);addLog('Развозил заказы.');playSound('coin');
    },'',0);
    add('🏃 Спорт','Здоровье +10, стресс −10',1,()=>{
      S.health=clamp(S.health+10,0,100);S.stress=clamp(S.stress-10,0,100);addLog('Спорт.');playSound('click');
    },'safe');
    
    // Уникальные действия предысторий
    if(S.flags.poorStart){
      add('🧹 Мыть полы','Деньги +200, здоровье −2',1,()=>{
        S.money+=200;S.health=clamp(S.health-2,0,100);addLog('Уборка.');playSound('coin');
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
    // Студенческая подработка
    add('💼 Подработка (официант)','Деньги +2000, здоровье −8',1,()=>{
      S.money+=2000;S.health=clamp(S.health-8,0,100);addLog('Подработка.');playSound('coin');
    });
    add('🎤 Конференция','Репутация +3, харизма +2',1,()=>{
      S.rep=clamp(S.rep+3,0,100);S.charm+=2;addLog('Конференция.');playSound('click');
    });
    add('🎭 Студенческий театр','Харизма +5, стресс −15',1,()=>{
      S.charm+=5;S.stress=clamp(S.stress-15,0,100);addLog('Театр.');playSound('click');
    });
    add('😴 Отдых','Стресс −25, здоровье +5',1,()=>{
      S.stress=clamp(S.stress-25,0,100);S.health=clamp(S.health+5,0,100);addLog('Отдых.');playSound('click');
    },'safe');
    
    // ТРАТЫ: Репетиторство (усиленный рост интеллекта за деньги)
    add('👨‍🏫 Нанять репетитора','Интеллект +10, стресс −5',1,()=>{
      S.int+=10;S.stress=clamp(S.stress-5,0,100);addLog('Репетитор подтянул тебя.');playSound('coin');
    },'special', 5000);
  }

  if(S.stage==='phd'){
    // Зарплата в аспирантуре — скромная
    add('🧪 Работа в лаборатории','Навык +5, деньги +4000',1,()=>{
      S.skills[rndSkill()]+=5;S.money+=4000;S.stress=clamp(S.stress+8,0,100);addLog('Лаборатория.');playSound('coin');
    });
    
    // Эксперимент ТЕПЕРЬ ТРЕБУЕТ ДЕНЕГ
    add('💥 Провести эксперимент','Риск! Открытие / провал',1,()=>{
      S.money -= 3000; // Траты на реактивы
      const bonus=(Math.floor(S.int/10)+(S.spec?3:0)) * getGlobalModifier('discoveryChance');
      const roll=d20()+bonus;
      S.stress=clamp(S.stress+12,0,100);
      if(roll>15){S.discoveries++;S.rep=clamp(S.rep+15,0,100);addLog('💥 Открытие!');addAchievement('first_disc');addSkillPoint(1);playSound('success');}
      else if(roll>8){addLog('Нейтрально.');playSound('click');}
      else{S.rep=clamp(S.rep-5,0,100);addLog('💀 Провал.');playSound('fail');}
    },'danger', 3000);

    add('📝 Написать статью','Публикация (требует навыка)',1,()=>{
      S.stress=clamp(S.stress + (S.flags.geniusPub ? 0 : 8),0,100);
      if(S.skills.write>15){S.publications++;S.rep=clamp(S.rep+5,0,100);addLog('📝 Статья!');if(S.publications===1)addAchievement('first_pub');addSkillPoint(1);playSound('success');}
      else{addLog('Отвергли (нужен навык Письмо > 15).');playSound('fail');}
    });

    // Гранты дают ощутимый буст, но их еще надо выбить
    add('💰 Грантрайтинг','Шанс получить грант',1,()=>{
      const roll=d20()+Math.floor(S.charm/10);
      if(roll>12){
        const grant = 80000 * getGlobalModifier('grantMoney') * (S.flags.luckyGrants ? 2 : 1);
        S.money += grant;
        S.rep=clamp(S.rep+8,0,100);S.grants++;addLog(`💰 Грант получен! +${grant}₽`);addAchievement('first_grant');playSound('coin');
      }
      else{addLog('Отказ.');playSound('fail');}
      S.stress=clamp(S.stress+10,0,100);
    });
    
    add('😴 Отдохнуть','Стресс −25',1,()=>{
      S.stress=clamp(S.stress-25,0,100);addLog('Отдых.');playSound('click');
    },'safe');
  }

  if(S.stage==='career'){
    // Теперь работа дает не 10000, а 8000, чтобы стимулировать науку
    add('💼 Работать','Деньги +8000, стресс +10',1,()=>{
      S.money+=8000;S.stress=clamp(S.stress+10,0,100);addLog('Работа.');playSound('coin');
    });
    
    // Big Science — дорогое удовольствие
    add('🌌 Big Science','Высокий риск и награда',1,()=>{
      S.money -= 15000; 
      const bonus=(Math.floor(S.int/8)+Math.floor(S.rep/10)+(S.spec?5:0)) * getGlobalModifier('discoveryChance');
      const roll=d20()+bonus;
      S.stress=clamp(S.stress+20,0,100);
      if(roll>18){S.discoveries++;S.rep=clamp(S.rep+25,0,100);S.money+=150000;addLog('🌌 Открытие!');addAchievement('big_science');addSkillPoint(1);playSound('success');}
      else if(roll>10){addLog('Скромно.');playSound('click');}
      else{S.rep=clamp(S.rep-15,0,100);S.health=clamp(S.health-20,0,100);addLog('💥 Авария.');playSound('fail');}
    },'danger', 15000);

    add('📰 Опубликовать статью','Публикация +1, репутация +8',1,()=>{
      S.publications++;S.rep=clamp(S.rep+8,0,100);S.stress=clamp(S.stress+10,0,100);
      addLog('📰 Статья!');addSkillPoint(1);playSound('success');
      if(S.publications>=5)addAchievement('five_pubs');
      if(S.publications>=10)addAchievement('ten_pubs');
    });

    // Инвестиции: теперь можно потерять много, но и заработать
    add('📈 Инвестировать','Риск: ×3 / ×0 / −50%',1,()=>{
      const sum=Math.min(S.money, 50000);
      if(sum<5000){addLog('Нужно хотя бы 5000₽.');return;}
      S.money-=sum;
      const r=Math.random();
      if(r<0.3){S.money+=sum*3;addLog('📈 ×3!');playSound('coin');}
      else if(r<0.6){addLog('📉 В ноль.');playSound('click');}
      else{const loss = Math.floor(sum*0.5); S.money+=loss; addLog('💸 Потерял половину.');playSound('fail');}
    },'danger');

    // Повышение
    add('⬆️ Заявка на повышение','Шанс повышения',1,()=>{
      const next={'школьник':'м.н.с.','лаборант':'м.н.с.','инженер':'м.н.с.','м.н.с.':'н.с.','н.с.':'с.н.с.','с.н.с.':'зав. лаб.','зав. лаб.':'зам. директора','зам. директора':'директор НИИ'};
      const req={'м.н.с.':{rep:20,charm:20},'н.с.':{rep:40,charm:40},'с.н.с.':{rep:60,charm:60},'зав. лаб.':{rep:75,charm:75},'зам. директора':{rep:85,charm:85},'директор НИИ':{rep:95,charm:95}};
      const target=next[S.position];
      if(!target){addLog('Уже на вершине.');return;}
      const r=req[target];

      if (S.enemies >= 3 && Math.random() < (S.enemies * 0.1)) {
        addLog(`❌ Враги подставили тебя!`); S.stress = clamp(S.stress + 15, 0, 100); playSound('fail'); return;
      }
      const reqRep = Math.floor(r.rep * getGlobalModifier('rep'));
      if(S.rep>=reqRep&&S.charm>=r.charm){
        S.position=target;addLog(`🎉 Теперь ты ${target}.`);playSound('levelup');
        if(target==='директор НИИ')addAchievement('director');
      }else{addLog(`❌ Отказ (нужно ${reqRep}/${r.charm}).`);playSound('fail');}
      S.stress=clamp(S.stress+5,0,100);
    });

    // Политика
    add('🏛️ Плести интриги', 'Влияние +2, Враги +1', 1, ()=>{
      S.influence += 2; S.enemies += 1; addLog('🏛️ Интриги.'); playSound('click');
    });
    add('🤝 Наладить связи', 'Влияние +3, стресс −5', 1, ()=>{
      S.influence += 3; S.stress = clamp(S.stress - 5, 0, 100); addLog('🤝 Связи.'); playSound('success');
    }, 'safe');
    add('🧑‍🏫 Создать научную школу', 'Требует 10 Влияния. Репутация +10', 1, ()=>{
      if(S.influence >= 10){
        S.influence -= 10; S.rep = clamp(S.rep + 10, 0, 100); S.skills[rndSkill()] += 5;
        addLog('🧑‍🏫 Школа создана!'); addAchievement('mentor'); playSound('success');
      } else { addLog('❌ Мало влияния.'); playSound('fail'); }
    }, 'special');
    
    add('🏖️ Отпуск','Стресс −30, здоровье +5',1,()=>{
      S.stress=clamp(S.stress-30,0,100);S.health=clamp(S.health+5,0,100);addLog('Отпуск.');playSound('click');
    },'safe');
  }

  return acts;
}
