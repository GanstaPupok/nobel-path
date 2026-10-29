import { S } from './state.js';
import { clamp } from './utils.js';
import { playSound } from './audio.js';
import { chronicle } from './chronicle.js';
import { addSkillPoint } from './skills.js';

/**
 * Публикация статьи. Уровень журнала — это выбор между скоростью,
 * престижем и риском отказа.
 */
export const JOURNAL_TIERS = [
  {
    id: 'conf',
    icon: '🗞️',
    title: 'Сборник конференции',
    desc: 'Быстро, без риска, но почти без веса. Публикация +1, репутация +2.',
    rep: 2,
    stress: 4,
    minWrite: 0,
    minInt: 0,
    chance: 1
  },
  {
    id: 'normal',
    icon: '📗',
    title: 'Обычный журнал',
    desc: 'Нормальная статья. Публикация +1, репутация +6. Нужно Письмо 12.',
    rep: 6,
    stress: 8,
    minWrite: 12,
    minInt: 0,
    chance: 0.8
  },
  {
    id: 'top',
    icon: '📘',
    title: 'Топовый журнал',
    desc: 'Репутация +15 и место в науке. Нужны Письмо 30 и Интеллект 60, риск отказа.',
    rep: 15,
    stress: 15,
    minWrite: 30,
    minInt: 60,
    chance: 0.45
  }
];

export function canSubmit(tier) {
  if (S.skills.write < tier.minWrite) return false;
  if (S.int < tier.minInt) return false;
  return true;
}

/** Отправляет статью в журнал. Возвращает сообщение для журнала событий. */
export function submitPaper(tierId) {
  const tier = JOURNAL_TIERS.find(t => t.id === tierId);
  if (!tier) return null;

  if (!canSubmit(tier)) {
    const need = [];
    if (tier.minWrite) need.push(`Письмо ${tier.minWrite}`);
    if (tier.minInt) need.push(`интеллект ${tier.minInt}`);
    return { ok: false, text: `Журнал не принял рукопись: нужно ${need.join(' и ')}.` };
  }

  // Шанс зависит от навыка письма и интеллекта
  const bonus = (S.skills.write - tier.minWrite) / 200 + (S.int - tier.minInt) / 400;
  const chance = clamp(tier.chance + Math.max(0, bonus), 0, 0.95);
  const accepted = Math.random() < chance;

  S.stress = clamp(S.stress + tier.stress, 0, 100);

  if (!accepted) {
    if (tier.id === 'top') {
      S.rep = clamp(S.rep - 2, 0, 100);
      playSound('fail');
      return { ok: false, text: '📘 Топовый журнал отклонил статью. Рецензенты были беспощадны.' };
    }
    S.stress = clamp(S.stress + 4, 0, 100);
    playSound('fail');
    return { ok: false, text: `📗 ${tier.title} попросил доработать рукопись. Обидно.` };
  }

  // Отдача падает с числом статей — «фармить» публикации невыгодно
  const decay = Math.max(1, 10 - Math.floor(S.publications / 2)) / 10;
  const repGain = Math.max(1, Math.round(tier.rep * decay));

  S.publications++;
  S.rep = clamp(S.rep + repGain, 0, 100);
  if (tier.id === 'top') {
    S.topPubs = (S.topPubs || 0) + 1;
    S.money += 10000;
    chronicle('📘', `Статья в топовом журнале (репутация +${repGain})`);
    addSkillPoint(1);
  } else if (tier.id === 'normal') {
    chronicle('📗', `Статья в журнале (репутация +${repGain})`);
  } else {
    chronicle('🗞️', `Тезисы на конференции (репутация +${repGain})`);
  }

  playSound('success');
  return { ok: true, text: `${tier.icon} Статья принята! Репутация +${repGain}.` };
}
