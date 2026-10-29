import { S } from './state.js';
import { PROJECTS, TRACKS } from './config.js';
import { g } from './text.js';
import { yearsWord } from './utils.js';

/**
 * Эпилог — несколько абзацев о том, чем закончилась жизнь.
 * Собирается из состояния: карьера, тема, семья, дети, соперник,
 * наставник и финальная реплика под конкретную концовку.
 */
export function buildEpilogue() {
  const a = S.arcs || {};
  const track = S.track ? TRACKS[S.track] : null;
  const out = [];

  // --- Карьера и наука ---
  const career = [`К ${S.age} годам — должность «${S.position}»`];
  if (track) career.push(`ветка «${track.title}»`);
  career.push(`${S.publications} публикаций и ${S.discoveries} открытий`);
  out.push(career.join(', ') + '.');

  if (S.project && PROJECTS[S.project.id]) {
    const def = PROJECTS[S.project.id];
    out.push(S.flags && S.flags.projectDone
      ? `Тема «${def.title}» закрыта целиком: ${def.tiers.map(t => t.name).join(' → ')}.`
      : `Тема «${def.title}» осталась незаконченной — до последнего этапа не дошло.`);
  }

  // --- Семья ---
  const love = a.love;
  if (love && (love.partner || love.partnerName)) {
    const name = love.partner ? love.partner.name : love.partnerName;
    if (love.stage === 'married') {
      out.push(`Партнёр — ${name}: ${yearsWord(love.years || 0)} вместе, и это оказалось важнее статей.`);
    } else if (love.stage === 'divorced') {
      out.push(`С ${name} вы развелись. Иногда созваниваетесь — уже почти по-дружески.`);
    } else {
      out.push(`Партнёр — ${name}.`);
    }
  } else if (love && love.stage === 'divorced') {
    out.push('Семейная жизнь закончилась разводом.');
  } else {
    out.push('Семьи так и не появилось — наука оказалась ревнивой.');
  }

  // --- Дети ---
  const fam = a.family;
  if (fam && fam.childName) {
    const girl = fam.childGender === 'f';
    const who = girl ? 'Дочь' : 'Сын';
    const tail = {
      legacy: girl ? 'продолжила твоё дело' : 'продолжил твоё дело',
      adult: girl ? 'выросла и выбрала свой путь' : 'вырос и выбрал свой путь',
      teen: 'переживает трудный возраст',
      school: girl ? 'учится в школе' : 'учится в школе',
      kid: girl ? 'ещё маленькая' : 'ещё маленький'
    }[fam.stage] || 'рядом';
    out.push(`${who} ${fam.childName} ${tail}.`);
  }

  // --- Соперник и наставник ---
  if (a.rival) {
    const st = a.rival.stage;
    out.push({
      won: `С ${a.rival.name} вы так и не помирились — но последнее слово осталось за тобой.`,
      friends: `С ${a.rival.name} вы помирились: старый соперник стал соавтором.`,
      lost: `${a.rival.name} оказался сильнее, и это до сих пор задевает.`,
      duel: `Дуэль с ${a.rival.name} закончилась вничью — и на этом всё.`
    }[st] || `С ${a.rival.name} вы разошлись по разным лабораториям.`);
  }

  if (a.mentor) {
    out.push(a.mentor.stage === 'legacy'
      ? 'Наставник ушёл, оставив тебе лабораторию и своих учеников.'
      : 'Наставник по-прежнему на связи — звонит по праздникам.');
  }

  // --- Финальная реплика под концовку ---
  const closing = {
    nobel: 'Твоё имя теперь в учебниках, а студенты пересказывают твои лекции как анекдоты.',
    director: 'Институт теперь живёт по твоим правилам — даже теми, кто был против.',
    famous: 'Твои статьи читают в трёх странах, и это приятнее любых должностей.',
    business: 'Наука стала бизнесом — и, надо признать, это оказалось выгодно.',
    teacher: 'Выпускники заходят на кафедру просто так — проведать.',
    burnout: 'Ты ушёл вовремя. Иногда лаборатория снится — но уже без паники.',
    death: 'Остались статьи, несколько тёплых воспоминаний и незаконченная тема.',
    loser: 'Ты не стал великим учёным. Но кем-то всё же стал.'
  }[S.final];
  if (closing) out.push(closing);

  return out.map(p => g(p));
}
