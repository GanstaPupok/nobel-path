import { S } from './state.js';
import { clamp } from './utils.js';

// Черты партнёра дают маленький пассивный бонус каждый год.
export const PARTNER_TRAITS = {
  creative: { label: 'творческая натура', icon: '🎨' },
  scientist: { label: 'учёный', icon: '🔬' },
  business: { label: 'предприниматель', icon: '💼' }
};

export function tickArcs() {
  const a = S.arcs;
  Object.keys(a).forEach(k => { if (a[k]) a[k].years = (a[k].years || 0) + 1; });

  // Чувства медленно остывают, если не уделять времени
  if (a.love && (a.love.stage === 'dating' || a.love.stage === 'married')) {
    a.love.love = clamp((a.love.love ?? 60) - 1, 0, 100);
  }

  // Пассивный вклад партнёра
  if (a.love && a.love.partner) {
    switch (a.love.partner.trait) {
      case 'creative': S.stress = clamp(S.stress - 2, 0, 100); break;
      case 'scientist': S.int = Math.min(100, S.int + 1); break;
      case 'business': S.money += 3000; break;
    }
  }
  if (a.love && a.love.stage === 'married' && (a.love.love || 0) >= 60) {
    S.stress = clamp(S.stress - 2, 0, 100);
  }
  if (a.love && a.love.stage === 'married' && (a.love.love || 0) < 25) {
    S.stress = clamp(S.stress + 4, 0, 100);
  }

  // Ребёнок требует денег, но крепкая связь держит здоровье
  if (a.family) {
    if (['kid', 'school', 'teen'].includes(a.family.stage)) S.money = Math.max(0, S.money - 3000);
    if ((a.family.bond || 0) >= 60) S.health = clamp(S.health + 2, 0, 100);
  }

  if (a.hobby && a.hobby.stage === 'active') {
    S.stress = clamp(S.stress - 3, 0, 100);
    S.money += 500;
  }
  if (a.friend && a.friend.stage === 'met') {
    S.money += 1000;
  }
}

function heartBar(value) {
  const n = Math.round(clamp(value || 0, 0, 100) / 20);
  return '❤️'.repeat(n) + '🤍'.repeat(5 - n);
}

export function getArcCards() {
  const cards = [];
  const a = S.arcs;

  if (a.love) {
    // старые сохранения хранили только partnerName
    const p = a.love.partner || (a.love.partnerName ? { name: a.love.partnerName, icon: '💞' } : null);
    const who = p ? `${p.icon} ${p.name}` : 'любимый человек';
    if (a.love.stage === 'dating') {
      cards.push({ icon: '💞', color: 'var(--pink)', text: `Встречаешься: ${who} · ${a.love.years || 0} г. · чувства ${Math.round(a.love.love || 0)}/100` });
    } else if (a.love.stage === 'married') {
      cards.push({ icon: '💍', color: 'var(--gold)', text: `Брак: ${who} · ${a.love.years || 0} лет ${heartBar(a.love.love)}` });
    } else if (a.love.stage === 'divorced') {
      cards.push({ icon: '💔', color: 'var(--red)', text: 'Развод. Бывшая семья осталась в прошлом.' });
    }
  }

  if (a.family) {
    const c = a.family.childName || 'Ребёнок';
    const stageText = {
      kid: `${c} ещё маленький — нужны деньги и время.`,
      school: `${c} пошёл в школу.`,
      teen: `${c} — подросток, с ним непросто.`,
      adult: `${c} вырос и выбрал свой путь.`,
      legacy: `${c} продолжает твоё дело.`
    }[a.family.stage] || `${c} рядом.`;
    cards.push({ icon: '👶', color: 'var(--pink)', text: `${stageText} Связь: ${Math.round(a.family.bond || 0)}/100` });
  }

  if (a.rival) {
    const r = a.rival.name || 'соперник';
    const text = {
      appeared: `${r} — твой научный конкурент.`,
      clash: `${r} украл твою идею. Противостояние.`,
      war: `${r} вредит лаборатории. Война.`,
      duel: `Публичная дуэль с ${r} на конференции.`,
      won: `Ты победил ${r} — он больше не мешает.`,
      lost: `${r} оказался сильнее. Урок на всю жизнь.`,
      friends: `Вы с ${r} помирились и работаете вместе.`
    }[a.rival.stage] || `${r} рядом.`;
    cards.push({ icon: '⚔️', color: 'var(--red)', text });
  }

  if (a.mentor) {
    const m = a.mentor.name || 'наставник';
    const text = {
      found: `${m} взял тебя под крыло.`,
      tested: `${m} проверяет тебя на прочность.`,
      supported: `${m} продвигает твои работы.`,
      ill: `${m} болеет — ты рядом.`,
      legacy: `${m} ушёл, оставив тебе свою школу.`
    }[a.mentor.stage] || `${m} рядом.`;
    cards.push({ icon: '🎓', color: 'var(--purple)', text });
  }

  if (a.friend && a.friend.stage === 'met') {
    cards.push({ icon: '👥', color: 'var(--green)', text: `Друг ${a.friend.name} поддерживает тебя. (Деньги +1000/год)` });
  }
  if (a.hater && a.hater.stage === 'active') {
    cards.push({ icon: '😠', color: 'var(--red)', text: `Хейтер ${a.hater.name} пишет гадости о тебе в сети.` });
  }
  if (a.coauthor && a.coauthor.stage === 'working') {
    cards.push({ icon: '🤝', color: 'var(--purple)', text: `Соавтор ${a.coauthor.name} — вместе пишете статью.` });
  }
  if (a.hobby && a.hobby.stage === 'active') {
    cards.push({ icon: a.hobby.icon || '🎨', color: 'var(--gold2)', text: `Хобби: ${a.hobby.name}. (Стресс −3, деньги +500/год)` });
  }

  return cards;
}

/** Короткая сводка для финального экрана. */
export function arcSummary() {
  const a = S.arcs;
  const out = [];
  if (a.love && (a.love.partner || a.love.partnerName)) {
    const p = a.love.partner || { name: a.love.partnerName, icon: '💞' };
    if (a.love.stage === 'married') out.push(`${p.icon} ${p.name}: брак ${a.love.years || 0} лет`);
    else if (a.love.stage === 'dating') out.push(`${p.icon} ${p.name}: встречаетесь`);
    else if (a.love.stage === 'divorced') out.push(`${p.icon} ${p.name}: развод`);
  }
  if (a.family && a.family.childName) {
    out.push(`👶 ${a.family.childName}${a.family.stage === 'adult' || a.family.stage === 'legacy' ? ' — взрослый' : ''}`);
  }
  if (a.rival) {
    const st = a.rival.stage;
    out.push(`⚔️ ${a.rival.name}: ${st === 'won' ? 'победа' : st === 'lost' ? 'поражение' : st === 'friends' ? 'примирение' : 'соперничество'}`);
  }
  if (a.mentor) out.push(`🎓 ${a.mentor.name}: ${a.mentor.stage === 'legacy' ? 'наследие' : 'наставник'}`);
  if (a.hobby && a.hobby.stage === 'active') out.push(`${a.hobby.icon} ${a.hobby.name}`);
  return out;
}
