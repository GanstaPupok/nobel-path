import { S, addLog, saveState } from './state.js';
import { playSound } from './audio.js';
import { addAchievement } from './achievements.js';
import { clamp } from './utils.js';

export const FINALS = {
  nobel:{title:'🥇 Нобелевский лауреат!',desc:'Ты достиг вершин науки. Твоё имя в учебниках.',color:'var(--gold)'},
  director:{title:'🏛️ Директор НИИ',desc:'Ты возглавил институт.',color:'var(--blue)'},
  famous:{title:'🌍 Всемирно известный учёный',desc:'Твои статьи цитируют по всему миру.',color:'var(--green)'},
  business:{title:'💼 Успешный бизнесмен от науки',desc:'Ты превратил науку в капитал.',color:'var(--purple)'},
  burnout:{title:'💔 Выгорание',desc:'Ты ушёл из науки. Здоровье важнее.',color:'var(--red)'},
  loser:{title:'😞 Бездарь',desc:'Увы, наука тебя не приняла.',color:'var(--muted)'},
  teacher:{title:'🧑‍🏫 Хороший преподаватель',desc:'Ты воспитал не одно поколение.',color:'var(--blue)'}
};

export function checkFinal(){
  S.finalReached = true;
  if(S.rep>=90 && S.int>=90 && S.discoveries>=3){S.final='nobel';addAchievement('nobel');}
  else if(S.position==='директор НИИ')S.final='director';
  else if(S.publications>=5 && S.rep>=80)S.final='famous';
  else if(S.money>=10000000)S.final='business';
  else if(S.stress>=90)S.final='burnout';
  else if(S.int<30 && S.publications<2)S.final='loser';
  else S.final='teacher';
  addLog('🏁 Жизнь подошла к финалу.');
  playSound('final');
  saveState();
}