import { S } from './state.js';
import { addAchievement } from './achievements.js';

// Ветки древа: ключ -> выбор -> последствия
// Выборы делаются в детстве/вузе, срабатывают позже через treeChoices

export const TREE_BRANCHES = {
  // Ветка "Наука vs Дружба" (10-16)
  science_vs_friends:{
    when:{minAge:10,maxAge:16,stage:'child'},
    question:'Друзья зовут гулять, но завтра важная контрольная.',
    options:[
      {id:'science', text:'📚 Остаться готовиться', short:'Наука',
       apply:()=>{ S.int+=5; S.charm=Math.max(0,S.charm-2); },
       future:'В 35 лет ты получишь бонус к публикациям — пригодилась дисциплина.'},
      {id:'friends', text:'🎈 Пойти с друзьями', short:'Дружба',
       apply:()=>{ S.charm+=5; S.int=Math.max(0,S.int-1); },
       future:'В 30 лет старый друг поможет с деньгами.'}
    ]
  },
  // Ветка "Честность vs Выгода" (18-25)
  honest_vs_profit:{
    when:{minAge:18,maxAge:25,stage:['uni','phd']},
    question:'Ты нашёл в лаборатории чужие записи с идеей. Что делать?',
    options:[
      {id:'honest', text:'🤝 Вернуть автору', short:'Честность',
       apply:()=>{ S.rep+=5; S.charm+=2; },
       future:'Через 10 лет автор (теперь профессор) замолвит за тебя слово.'},
      {id:'profit', text:'😈 Использовать', short:'Выгода',
       apply:()=>{ S.int+=5; S.rep=Math.max(0,S.rep-3); },
       future:'В 40 лет тебя могут разоблачить.'}
    ]
  },
  // Ветка "Семья vs Карьера" (28-35)
  family_vs_career:{
    when:{minAge:28,maxAge:35,stage:'career'},
    question:'Тебе предложили должность за границей на 3 года. Но у тебя семья.',
    options:[
      {id:'career', text:'✈️ Уехать', short:'Карьера',
       apply:()=>{ S.money+=100000; S.stress=clamp(S.stress+20,0,100); },
       future:'Возможен развод и сложные отношения с детьми.'},
      {id:'family', text:'🏡 Остаться', short:'Семья',
       apply:()=>{ S.charm+=5; S.stress=clamp(S.stress-10,0,100); },
       future:'Тёплые отношения с семьёй в старости.'}
    ]
  },
  // Ветка "Риск vs Стабильность" (30-40)
  risk_vs_stable:{
    when:{minAge:30,maxAge:40,stage:'career'},
    question:'Коллеги зовут в рискованный стартап. Гарантий нет.',
    options:[
      {id:'risk', text:'🚀 Согласиться', short:'Риск',
       apply:()=>{ S.money+=50000; S.stress=clamp(S.stress+15,0,100); },
       future:'В 45 лет стартап может выстрелить — или прогореть.'},
      {id:'stable', text:'🏛️ Остаться в НИИ', short:'Стабильность',
       apply:()=>{ S.rep+=5; S.stress=clamp(S.stress-5,0,100); },
       future:'Стабильная пенсия и уважение коллег.'}
    ]
  }
};

// Срабатывание последствий через годы
export const TREE_CONSEQUENCES = [
  {
    key:'science',
    when:{age:35},
    fn:()=>{
      S.publications += 2;
      return '🌳 Дисциплина из детства дала плоды: +2 публикации.';
    }
  },
  {
    key:'friends',
    when:{age:30},
    fn:()=>{
      S.money += 30000;
      return '🌳 Старый друг помог с деньгами: +30 000 ₽.';
    }
  },
  {
    key:'honest',
    when:{age:35},
    fn:()=>{
      S.rep = clamp(S.rep+15,0,100);
      return '🌳 Профессор замолвил слово: +15 репутации.';
    }
  },
  {
    key:'profit',
    when:{age:40},
    fn:()=>{
      if(Math.random()<0.5){
        S.rep = Math.max(0,S.rep-30);
        S.stress = clamp(S.stress+20,0,100);
        return '🌳 Разоблачение! −30 репутации, +20 стресса.';
      }
      return '🌳 Твоя тайна не раскрыта.';
    }
  },
  {
    key:'career',
    when:{age:38},
    fn:()=>{
      S.money += 200000;
      S.charm = Math.max(0,S.charm-5);
      return '🌳 Карьера за границей: +200 000 ₽, но семья отдалилась.';
    }
  },
  {
    key:'family',
    when:{age:50},
    fn:()=>{
      S.stress = clamp(S.stress-20,0,100);
      S.health = clamp(S.health+10,0,100);
      return '🌳 Семья рядом в старости: −20 стресса, +10 здоровья.';
    }
  },
  {
    key:'risk',
    when:{age:45},
    fn:()=>{
      if(Math.random()<0.4){
        S.money += 500000;
        addAchievement('rich');
        return '🌳 Стартап выстрелил! +500 000 ₽.';
      }
      S.money = Math.max(0, S.money-100000);
      return '🌳 Стартап прогорел. −100 000 ₽.';
    }
  },
  {
    key:'stable',
    when:{age:60},
    fn:()=>{
      S.rep = clamp(S.rep+10,0,100);
      return '🌳 Стабильность дала уважение: +10 репутации.';
    }
  }
];

function clamp(v,mn,mx){return Math.max(mn,Math.min(mx,v));}

export function getAvailableTreeBranch(){
  for(const [key, branch] of Object.entries(TREE_BRANCHES)){
    if(S.treeChoices[key]) continue;
    const w = branch.when;
    if(w.minAge && S.age<w.minAge) continue;
    if(w.maxAge && S.age>w.maxAge) continue;
    if(w.stage){
      const stages = Array.isArray(w.stage)?w.stage:[w.stage];
      if(!stages.includes(S.stage)) continue;
    }
    return {key, ...branch};
  }
  return null;
}

export function applyTreeChoice(key, optionId){
  const branch = TREE_BRANCHES[key];
  if(!branch) return;
  const opt = branch.options.find(o=>o.id===optionId);
  if(!opt) return;
  opt.apply();
  S.treeChoices[key] = {option:optionId, age:S.age};
  return opt;
}

export function checkTreeConsequences(){
  for(const cons of TREE_CONSEQUENCES){
    const choice = S.treeChoices[cons.key];
    if(!choice) continue;
    if(choice.fired) continue;
    if(S.age >= cons.when.age){
      const msg = cons.fn();
      choice.fired = true;
      return msg;
    }
  }
  return null;
}

export function countTreeChoices(){
  return Object.keys(S.treeChoices).length;
}