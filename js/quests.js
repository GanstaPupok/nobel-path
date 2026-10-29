import { S, saveState, addLog } from './state.js';
import { playSound } from './audio.js';
import { addAchievement } from './achievements.js';

// Пул шаблонов квестов
export const QUEST_POOL = [
  {
    id:'publish',
    icon:'📝',
    title:'Опубликуй статью',
    desc:'Нужно опубликовать хотя бы 1 статью за 3 года.',
    check:()=>S.publications,
    target:1,
    years:3,
    reward:{money:15000, rep:5},
    fail:{money:-5000}
  },
  {
    id:'experiment',
    icon:'💥',
    title:'Проведи успешный эксперимент',
    desc:'Соверши открытие за 4 года.',
    check:()=>S.discoveries,
    target:1,
    years:4,
    reward:{money:20000, rep:10},
    fail:{stress:15}
  },
  {
    id:'network',
    icon:'🤝',
    title:'Заведи знакомства',
    desc:'Подними харизму на +10 за 3 года.',
    check:()=>S.charm,
    dynamic:()=>true,
    target:10,
    years:3,
    reward:{money:10000, rep:3},
    fail:{charm:-5}
  },
  {
    id:'selfcare',
    icon:'💚',
    title:'Заботься о себе',
    desc:'Держи здоровье выше 80 в течение 3 лет.',
    check:()=>S.health,
    target:80,
    years:3,
    reward:{health:15},
    fail:{health:-10}
  },
  {
    id:'stress_free',
    icon:'🧘',
    title:'Без выгорания',
    desc:'Держи стресс ниже 40 в течение 3 лет.',
    check:()=>S.stress,
    invert:true,
    target:40,
    years:3,
    reward:{stress:-10, money:5000},
    fail:{stress:20}
  },
  {
    id:'earn',
    icon:'💰',
    title:'Заработай денег',
    desc:'Накопи 100 000 ₽ за 5 лет.',
    check:()=>S.money,
    target:100000,
    years:5,
    reward:{money:50000},
    fail:{money:-10000}
  }
];

export function maybeAddQuest(){
  if(S.quests.length >= 2) return;
  if(Math.random() > 0.25) return; // 25% шанс в год

  const existingIds = S.quests.map(q=>q.id);
  const pool = QUEST_POOL.filter(q=>!existingIds.includes(q.id));
  if(!pool.length) return;

  const tpl = pool[Math.floor(Math.random()*pool.length)];
  const q = {
    ...tpl,
    startAge:S.age,
    startValue:tpl.check(),
    deadlineAge:S.age + tpl.years
  };
  S.quests.push(q);
  addLog(`📋 Новый квест: ${q.icon} ${q.title}`);
  playSound('minigame');
}

export function tickQuests(){
  if(!S.quests.length) return;
  const results = [];
  S.quests = S.quests.filter(q=>{
    // Проверка успеха
    const cur = q.check();
    let success = false;
    if(q.invert){
      success = cur < q.target && S.age >= q.startAge + 1;
    } else {
      success = cur - q.startValue >= q.target;
    }
    if(success){
      // Награда
      if(q.reward){
        Object.entries(q.reward).forEach(([k,v])=>{
          if(k==='money') S.money+=v;
          else if(k==='rep') S.rep=Math.min(100,S.rep+v);
          else if(k==='health') S.health=Math.min(100,S.health+v);
          else if(k==='stress') S.stress=Math.max(0,S.stress+v);
          else if(k==='charm') S.charm+=v;
        });
      }
      results.push(`✅ Квест «${q.title}» выполнен!`);
      addAchievement('quest_hero');
      return false;
    }
    // Дедлайн
    if(S.age >= q.deadlineAge){
      if(q.fail){
        Object.entries(q.fail).forEach(([k,v])=>{
          if(k==='money') S.money=Math.max(0,S.money+v);
          else if(k==='stress') S.stress=Math.min(100,S.stress+v);
          else if(k==='health') S.health=Math.max(0,S.health+v);
          else if(k==='charm') S.charm=Math.max(0,S.charm+v);
        });
      }
      results.push(`❌ Квест «${q.title}» провален (дедлайн).`);
      return false;
    }
    return true;
  });
  results.forEach(r=>addLog(r));
}