import { S, addLog } from './state.js';
import { playSound } from './audio.js';
import { addAchievement } from './achievements.js';
import { clamp } from './utils.js';

// Пул шаблонов квестов.
// ВАЖНО: в сохранении лежат только {id, startAge, startValue, deadlineAge},
// а функции (check) берутся отсюда — иначе JSON их теряет и игра падает.
export const QUEST_POOL = [
  {
    id: 'publish', icon: '📝',
    title: 'Опубликуй статью',
    desc: 'Нужно опубликовать хотя бы 1 статью за 3 года.',
    check: () => S.publications, target: 1, years: 3,
    reward: { money: 15000, rep: 5 }, fail: { money: -5000 }
  },
  {
    id: 'experiment', icon: '💥',
    title: 'Проведи успешный эксперимент',
    desc: 'Соверши открытие за 4 года.',
    check: () => S.discoveries, target: 1, years: 4,
    reward: { money: 20000, rep: 10 }, fail: { stress: 15 }
  },
  {
    id: 'network', icon: '🤝',
    title: 'Заведи знакомства',
    desc: 'Подними харизму на +10 за 3 года.',
    check: () => S.charm, target: 10, years: 3,
    reward: { money: 10000, rep: 3, charm: 2 }, fail: { charm: -3 }
  },
  {
    id: 'selfcare', icon: '💚',
    title: 'Заботься о себе',
    desc: 'Держи здоровье выше 80 в течение 3 лет.',
    check: () => S.health, target: 80, years: 3, requireAbove: true,
    reward: { health: 15 }, fail: { health: -10 }
  },
  {
    id: 'stress_free', icon: '🧘',
    title: 'Без выгорания',
    desc: 'Держи стресс ниже 40 в течение 3 лет.',
    check: () => S.stress, target: 40, invert: true, years: 3,
    reward: { stress: -10, money: 5000 }, fail: { stress: 20 }
  },
  {
    id: 'earn', icon: '💰',
    title: 'Заработай денег',
    desc: 'Накопи 100 000 ₽ за 5 лет.',
    check: () => S.money, target: 100000, years: 5,
    reward: { money: 50000 }, fail: { money: -10000 }
  }
];

/** Достаёт активные квесты с рабочими функциями. */
export function getActiveQuests() {
  const out = [];
  for (const q of S.quests || []) {
    const tpl = QUEST_POOL.find(t => t.id === q.id);
    if (!tpl) continue; // квест удалён из игры — просто забываем его
    out.push({
      ...tpl,
      startAge: q.startAge,
      startValue: q.startValue,
      deadlineAge: q.deadlineAge
    });
  }
  return out;
}

/** Прогресс квеста в процентах — для полоски в интерфейсе. */
export function questProgress(q) {
  const cur = q.check();
  if (q.invert) {
    const pct = clamp((1 - cur / q.target) * 100, 0, 100);
    return { pct, label: `сейчас ${cur}, нужно ниже ${q.target}` };
  }
  if (q.requireAbove) {
    return { pct: cur >= q.target ? 100 : clamp(cur / q.target * 100, 0, 100), label: `${cur} из ${q.target}` };
  }
  const gained = Math.max(0, cur - q.startValue);
  return { pct: clamp(gained / q.target * 100, 0, 100), label: `${Math.min(gained, q.target)} из ${q.target}` };
}

export function maybeAddQuest() {
  if (!S.quests) S.quests = [];
  if (S.quests.length >= 2) return;
  if (Math.random() > 0.25) return; // 25% шанс в год

  const existingIds = S.quests.map(q => q.id);
  const pool = QUEST_POOL.filter(q => !existingIds.includes(q.id));
  if (!pool.length) return;

  const tpl = pool[Math.floor(Math.random() * pool.length)];
  S.quests.push({
    id: tpl.id,
    startAge: S.age,
    startValue: tpl.check(),
    deadlineAge: S.age + tpl.years
  });
  addLog(`📋 Новый квест: ${tpl.icon} ${tpl.title}`);
  playSound('minigame');
}

function applyDelta(delta) {
  Object.entries(delta || {}).forEach(([k, v]) => {
    if (k === 'money') S.money = Math.max(0, S.money + v);
    else if (k === 'rep') S.rep = clamp(S.rep + v, 0, 100);
    else if (k === 'health') S.health = clamp(S.health + v, 0, 100);
    else if (k === 'stress') S.stress = clamp(S.stress + v, 0, 100);
    else if (k === 'charm') S.charm = Math.max(0, S.charm + v);
  });
}

export function tickQuests() {
  if (!S.quests || !S.quests.length) return;

  const quests = getActiveQuests();
  const keep = [];
  const results = [];

  for (const q of quests) {
    const cur = q.check();
    let success = false;

    if (q.invert) {
      // Инвертированные квесты проверяются только на дедлайне.
      success = S.age >= q.deadlineAge && cur < q.target;
    } else if (q.requireAbove) {
      success = S.age >= q.deadlineAge && cur >= q.target;
    } else {
      success = cur - q.startValue >= q.target;
    }

    if (success) {
      applyDelta(q.reward);
      results.push(`✅ Квест «${q.title}» выполнен!`);
      addAchievement('quest_hero');
      continue;
    }

    if (S.age >= q.deadlineAge) {
      applyDelta(q.fail);
      results.push(`❌ Квест «${q.title}» провален (дедлайн).`);
      continue;
    }

    keep.push({ id: q.id, startAge: q.startAge, startValue: q.startValue, deadlineAge: q.deadlineAge });
  }

  S.quests = keep;
  results.forEach(r => addLog(r));
}
