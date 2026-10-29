import { S } from './state.js';
import { clamp } from './utils.js';

export function tickArcs(){
  if(S.arcs.love) S.arcs.love.years = (S.arcs.love.years||0) + 1;
  if(S.arcs.rival) S.arcs.rival.years = (S.arcs.rival.years||0) + 1;
  if(S.arcs.friend) S.arcs.friend.years = (S.arcs.friend.years||0) + 1;
  if(S.arcs.hater) S.arcs.hater.years = (S.arcs.hater.years||0) + 1;
  if(S.arcs.coauthor) S.arcs.coauthor.years = (S.arcs.coauthor.years||0) + 1;
  if(S.arcs.hobby) S.arcs.hobby.years = (S.arcs.hobby.years||0) + 1;

  // Пассивные эффекты от арок
  if (S.arcs.hobby && S.arcs.hobby.stage === 'active') {
    S.stress = clamp(S.stress - 3, 0, 100);
    S.money += 500;
  }
  if (S.arcs.love && S.arcs.love.stage === 'married') {
    S.stress = clamp(S.stress - 2, 0, 100);
  }
  if (S.arcs.friend && S.arcs.friend.stage === 'met') {
    S.money += 1000;
  }
}

export function getArcCards(){
  const cards = [];
  const a = S.arcs;

  if(a.love){
    if(a.love.stage==='dating') cards.push({icon:'💞', text:`Романтика: встречаешься с ${a.love.partnerName||'любимым человеком'} уже ${a.love.years} г.`, color:'var(--accent)'});
    if(a.love.stage==='married') cards.push({icon:'💍', text:`Семья: женаты ${a.love.years} лет. (Стресс −2/год)`, color:'var(--gold)'});
  }
  if(a.rival && (a.rival.stage==='appeared'||a.rival.stage==='clash')){
    cards.push({icon:'⚔️', text:`Соперник: ${a.rival.name} — твой научный конкурент.`, color:'var(--red)'});
  }
  if(a.family && a.family.stage==='kid'){
    cards.push({icon:'👶', text:`Ребёнок растёт, требует времени и денег.`, color:'var(--blue)'});
  }
  if(a.friend && a.friend.stage==='met'){
    cards.push({icon:'👥', text:`Друг: ${a.friend.name} — поддерживает тебя. (Деньги +1000/год)`, color:'var(--green)'});
  }
  if(a.hater && a.hater.stage==='active'){
    cards.push({icon:'😠', text:`Хейтер: ${a.hater.name} пишет гадости о тебе в сети.`, color:'var(--red)'});
  }
  if(a.coauthor && a.coauthor.stage==='working'){
    cards.push({icon:'🤝', text:`Соавтор: ${a.coauthor.name} — вместе пишете статью.`, color:'var(--purple)'});
  }
  if(a.hobby && a.hobby.stage==='active'){
    cards.push({icon:a.hobby.icon||'🎨', text:`Хобби: ${a.hobby.name} — отдушина. (Стресс −3, Деньги +500/год)`, color:'var(--gold2)'});
  }

  return cards;
}
