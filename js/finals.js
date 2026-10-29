import { S, addLog, saveState, Legacy, saveLegacy } from './state.js';
import { playSound } from './audio.js';
import { addAchievement } from './achievements.js';
import { NOBEL } from './config.js';
import { chronicle } from './chronicle.js';

export const FINALS = {
  nobel: { title: '🥇 Нобелевский лауреат!', desc: 'Ты достиг вершин науки. Твоё имя в учебниках.', color: 'var(--gold)' },
  director: { title: '🏛️ Директор НИИ', desc: 'Ты возглавил институт и определяешь, куда идёт наука.', color: 'var(--blue)' },
  famous: { title: '🌍 Мировая величина', desc: 'Твои статьи цитируют по всему миру.', color: 'var(--green)' },
  business: { title: '💼 Бизнес от науки', desc: 'Ты превратил науку в капитал.', color: 'var(--purple)' },
  death: { title: '💔 Здоровье не выдержало', desc: 'Ты ушёл слишком рано. Наука забрала всё.', color: 'var(--red)' },
  burnout: { title: '🔥 Выгорание', desc: 'Ты ушёл из науки. Здоровье важнее.', color: 'var(--red)' },
  loser: { title: '😞 Бездарь', desc: 'Увы, наука тебя не приняла.', color: 'var(--muted)' },
  teacher: { title: '🧑‍🏫 Преподаватель, которого любят', desc: 'Ты воспитал не одно поколение студентов.', color: 'var(--blue)' }
};

export function checkFinal() {
  if (!S || S.finalReached) return;

  if (S.health <= 0) S.final = 'death';
  else if (S.rep >= NOBEL.rep && S.int >= NOBEL.int && S.discoveries >= NOBEL.discoveries
           && S.publications >= NOBEL.publications && S.flags.projectDone) S.final = 'nobel';
  else if (S.position === 'директор НИИ') S.final = 'director';
  else if (S.publications >= 8 && S.rep >= 75 && S.discoveries >= 2) S.final = 'famous';
  else if (S.money >= 5000000) S.final = 'business';
  else if (S.stress >= 85) S.final = 'burnout';
  else if (S.int < 40 && S.publications < 2) S.final = 'loser';
  else S.final = 'teacher';

  S.finalReached = true;
  chronicle('🏁', FINALS[S.final] ? FINALS[S.final].title : 'Финал жизни');
  if (S.final === 'nobel') addAchievement('nobel');

  S.personaTitle = pickPersona();

  addLog('🏁 Жизнь подошла к финалу.');
  playSound('final');

  // --- НАЧИСЛЕНИЕ НАСЛЕДИЯ ---
  let points = 40;
  points += S.achievements.length * 8;
  points += S.publications * 4;
  points += S.discoveries * 10;
  points += Math.floor(S.money / 200000);
  points += Math.floor(S.rep / 5);
  if (S.final === 'nobel') points += 100;
  if (S.flags.projectDone) points += 30;

  // Отношения дают заметную прибавку — это тоже часть прожитой жизни
  const a = S.arcs || {};
  if (a.love && a.love.stage === 'married') points += 15;
  if (a.family && a.family.stage === 'legacy') points += 20;
  if (a.mentor && a.mentor.stage === 'legacy') points += 15;
  if (a.rival && (a.rival.stage === 'won' || a.rival.stage === 'friends')) points += 10;
  points = Math.max(10, points);

  Legacy.points += points;
  Legacy.runs = (Legacy.runs || 0) + 1;
  saveLegacy();
  S.earnedLegacy = points;

  saveState();
}

function pickPersona() {
  const a = S.arcs || {};
  const love = a.love;
  const fam = a.family;
  const mentor = a.mentor;
  const rival = a.rival;

  if (mentor && mentor.stage === 'legacy' && fam && fam.stage === 'legacy') return 'Старейшина науки';
  if (love && love.stage === 'married' && fam && fam.stage === 'legacy') return 'Профессор с семьёй';
  if (love && love.stage === 'married' && S.money > 5000000) return 'Профессор с капиталом';
  if (love && love.stage === 'divorced' && S.discoveries >= 4) return 'Жизнь в науке';
  if (love && love.stage === 'divorced') return 'Человек после развода';
  if (fundingBadge()) return 'Гений-одиночка';
  if (rival && (rival.stage === 'won' || rival.stage === 'friends') && S.rep >= 70) return 'Победа над соперником';
  if (a.hobby && a.hobby.stage === 'active') return 'Творческая натура';
  if (S.enemies >= 5) return 'Мастер интриг';
  if (S.health < 30) return 'На пределе сил';
  if (S.influence >= 20) return 'Политик от науки';
  if (S.publications >= 10) return 'Машина публикаций';
  return S.gender === 'f' ? 'Учёная' : 'Обычный учёный';
}

function fundingBadge() {
  return S.discoveries >= 5 && (!S.arcs.love || S.arcs.love.stage !== 'married');
}
