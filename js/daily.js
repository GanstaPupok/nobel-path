import { S, addLog } from './state.js';
import { playSound } from './audio.js';
import { addAchievement } from './achievements.js';
import { clamp, pick } from './utils.js';
import { g } from './text.js';

const DAILY_EVENTS = [
  {icon:'☀️',text:'Отличная погода — настроение улучшилось.',eff:()=>{S.stress=clamp(S.stress-5,0,100);return 'стресс −5';},good:true},
  {icon:'🍀',text:'Находка: купюра!',eff:()=>{S.money+=500;return 'деньги +500 ₽';},good:true},
  {icon:'☕',text:'Утренний кофе взбодрил.',eff:()=>{S.energy=Math.min(6,S.energy+1);return 'энергия +1';},good:true},
  {icon:'📖',text:'Интересная статья.',eff:()=>{S.int+=2;return 'интеллект +2';},good:true},
  {icon:'🤝',text:'Приятный разговор.',eff:()=>{S.charm+=2;return 'харизма +2';},good:true},
  {icon:'💪',text:'Зарядка с утра.',eff:()=>{S.health=clamp(S.health+3,0,100);return 'здоровье +3';},good:true},
  {icon:'🌟',text:'Удача!',eff:()=>{S.stress=clamp(S.stress-10,0,100);S.money+=200;return 'стресс −10, деньги +200 ₽';},good:true},
  {icon:'🎁',text:'Друг подарил книгу.',eff:()=>{S.skills.write+=1;return 'письмо +1';},good:true},
  {icon:'🌧️',text:'Дождь.',eff:()=>{S.stress=clamp(S.stress+5,0,100);return 'стресс +5';},good:false},
  {icon:'🚌',text:'Автобус уехал без тебя.',eff:()=>{S.health=clamp(S.health-2,0,100);S.stress=clamp(S.stress+4,0,100);return 'здоровье −2, стресс +4';},good:false},
  {icon:'📱',text:'Телефон разбит.',eff:()=>{S.money=Math.max(0,S.money-1500);return 'деньги −1500 ₽';},good:false},
  {icon:'😴',text:'Бессонная ночь.',eff:()=>{S.energy=Math.max(2,S.energy-1);return 'энергия −1';},good:false},
  {icon:'🤒',text:'Простуда.',eff:()=>{S.health=clamp(S.health-5,0,100);return 'здоровье −5';},good:false},
  {icon:'😤',text:'Ссора с соседом.',eff:()=>{S.charm=Math.max(0,S.charm-2);S.stress=clamp(S.stress+6,0,100);return 'харизма −2, стресс +6';},good:false},
  {icon:'💸',text:'Забытый счёт.',eff:()=>{S.money=Math.max(0,S.money-800);return 'деньги −800 ₽';},good:false},
  {icon:'📉',text:'Неудачный день.',eff:()=>{S.stress=clamp(S.stress+8,0,100);S.int=Math.max(0,S.int-1);return 'стресс +8, интеллект −1';},good:false},
  {icon:'🌅',text:'Обычное утро.',eff:()=>'ничего',good:null},
  {icon:'🎵',text:'Любимая песня.',eff:()=>{S.stress=clamp(S.stress-3,0,100);return 'стресс −3';},good:true},
  {icon:'🍎',text:'Яблоко на завтрак.',eff:()=>{S.health=clamp(S.health+1,0,100);return 'здоровье +1';},good:true}
];

export function rollDailyLife(){
  const ev = pick(DAILY_EVENTS);
  const result = ev.eff();
  // Утренние события описывают героя — согласуем род
  const text = g(ev.text);
  S.dailyLife = {icon:ev.icon, text, result, good:ev.good};
  if(ev.good === true){
    S.dailyStreak.good++; S.dailyStreak.bad=0;
    if(S.dailyStreak.good>=3) addAchievement('lucky');
  } else if(ev.good === false){
    S.dailyStreak.bad++; S.dailyStreak.good=0;
    if(S.dailyStreak.bad>=3) addAchievement('unlucky');
  }
  addLog(`🌅 Утро: ${text} (${result})`);
  playSound('daily');
}