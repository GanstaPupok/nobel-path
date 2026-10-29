import { BACKSTORIES, SKILL_NAMES } from './config.js';
import { S } from './state.js';
import { clamp } from './utils.js';

export function applyBackstory(){
  const bs = BACKSTORIES[S.backstory];
  if(!bs) return;
  const b = bs.bonus;
  if(b.money) S.money += b.money;
  if(b.int) S.int += b.int;
  if(b.health) S.health = clamp(S.health + b.health, 0, 100);
  if(b.charm) S.charm = Math.max(0, S.charm + b.charm);
  if(b.stress) S.stress = clamp(S.stress + b.stress, 0, 100);
  if(b.skills) Object.entries(b.skills).forEach(([k,v])=>S.skills[k]+=v);
  Object.assign(S.flags, bs.flags);
}

export function renderBonusTags(b){
  const tags=[];
  if(b.money) tags.push(`💰 +${b.money} ₽`);
  if(b.int) tags.push(`🧠 +${b.int} интеллект`);
  if(b.health) tags.push(`❤️ ${b.health>0?'+':''}${b.health} здоровье`);
  if(b.charm) tags.push(`🗣️ ${b.charm>0?'+':''}${b.charm} харизма`);
  if(b.stress) tags.push(`😰 ${b.stress>0?'+':''}${b.stress} стресс`);
  if(b.skills) Object.entries(b.skills).forEach(([k,v])=>tags.push(`📚 +${v} ${SKILL_NAMES[k]}`));
  return tags.map(t=>`<span>${t}</span>`).join('');
}