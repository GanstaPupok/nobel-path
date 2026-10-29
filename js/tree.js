import { S } from './state.js';
import { addAchievement } from './achievements.js';
import { clamp } from './utils.js';

// Ветки древа: выборы делаются в детстве/вузе, последствия срабатывают позже.
// Ключ ветки хранится в S.treeChoices, а последствия ищутся по паре branch+option.

export const TREE_BRANCHES = {
  // Ветка "Наука vs Дружба" (10-16)
  science_vs_friends: {
    when: { minAge: 10, maxAge: 16, stage: 'child' },
    question: 'Друзья зовут гулять, но завтра важная контрольная.',
    options: [
      { id: 'science', text: '📚 Остаться готовиться', short: 'Наука',
        apply: () => { S.int += 5; S.charm = Math.max(0, S.charm - 2); },
        future: 'В 35 лет ты получишь бонус к публикациям — пригодилась дисциплина.' },
      { id: 'friends', text: '🎈 Пойти с друзьями', short: 'Дружба',
        apply: () => { S.charm += 5; S.int = Math.max(0, S.int - 1); },
        future: 'В 30 лет старый друг поможет с деньгами.' }
    ]
  },
  // Ветка "Честность vs Выгода" (18-25)
  honest_vs_profit: {
    when: { minAge: 18, maxAge: 25, stage: ['uni', 'phd'] },
    question: 'Ты нашёл в лаборатории чужие записи с идеей. Что делать?',
    options: [
      { id: 'honest', text: '🤝 Вернуть автору', short: 'Честность',
        apply: () => { S.rep += 5; S.charm += 2; },
        future: 'Через 10 лет автор (теперь профессор) замолвит за тебя слово.' },
      { id: 'profit', text: '😈 Использовать', short: 'Выгода',
        apply: () => { S.int += 5; S.rep = Math.max(0, S.rep - 3); },
        future: 'В 40 лет тебя могут разоблачить.' }
    ]
  },
  // Ветка "Семья vs Карьера" (28-35)
  family_vs_career: {
    when: { minAge: 28, maxAge: 35, stage: 'career' },
    question: 'Тебе предложили должность за границей на 3 года. Но у тебя семья.',
    options: [
      { id: 'career', text: '✈️ Уехать', short: 'Карьера',
        apply: () => { S.money += 100000; S.stress = clamp(S.stress + 20, 0, 100); },
        future: 'Возможен развод и сложные отношения с детьми.' },
      { id: 'family', text: '🏡 Остаться', short: 'Семья',
        apply: () => { S.charm += 5; S.stress = clamp(S.stress - 10, 0, 100); },
        future: 'Тёплые отношения с семьёй в старости.' }
    ]
  },
  // Ветка "Риск vs Стабильность" (30-40)
  risk_vs_stable: {
    when: { minAge: 30, maxAge: 40, stage: 'career' },
    question: 'Коллеги зовут в рискованный стартап. Гарантий нет.',
    options: [
      { id: 'risk', text: '🚀 Согласиться', short: 'Риск',
        apply: () => { S.money += 50000; S.stress = clamp(S.stress + 15, 0, 100); },
        future: 'В 45 лет стартап может выстрелить — или прогореть.' },
      { id: 'stable', text: '🏛️ Остаться в НИИ', short: 'Стабильность',
        apply: () => { S.rep += 5; S.stress = clamp(S.stress - 5, 0, 100); },
        future: 'Стабильная пенсия и уважение коллег.' }
    ]
  },
  // Ветка "Наставник vs Одиночка" (30-45)
  mentor_vs_solo: {
    when: { minAge: 30, maxAge: 45, stage: 'career' },
    question: 'К тебе просится талантливый студент. Ученик отнимет время, но вырастит имя.',
    options: [
      { id: 'mentor', text: '🧑‍🏫 Взять ученика', short: 'Наставник',
        apply: () => { S.influence += 5; S.rep = clamp(S.rep + 3, 0, 100); S.stress = clamp(S.stress + 5, 0, 100); },
        future: 'К 50 годам ученики создадут тебе репутацию.' },
      { id: 'solo', text: '🚪 Работать одному', short: 'Одиночка',
        apply: () => { S.int += 5; S.stress = clamp(S.stress - 5, 0, 100); },
        future: 'К 50 годам ты будешь единственным автором всех своих работ.' }
    ]
  },
  // Ветка "Деньги vs Свобода" (26-38)
  money_vs_freedom: {
    when: { minAge: 26, maxAge: 38, stage: ['phd', 'career'] },
    question: 'Корпорация даёт деньги на лабораторию — но все результаты станут её собственностью.',
    options: [
      { id: 'money', text: '💰 Взять деньги', short: 'Деньги',
        apply: () => { S.money += 200000; S.rep = clamp(S.rep - 5, 0, 100); },
        future: 'Через 10 лет придётся отчитываться перед спонсором.' },
      { id: 'freedom', text: '🕊️ Отказаться', short: 'Свобода',
        apply: () => { S.rep = clamp(S.rep + 8, 0, 100); S.stress = clamp(S.stress + 5, 0, 100); },
        future: 'Через 10 лет свобода принесёт признание.' }
    ]
  }
};

// Срабатывание последствий через годы.
// branch+option — какую ветку и какой выбор отслеживаем.
export const TREE_CONSEQUENCES = [
  {
    branch: 'science_vs_friends', option: 'science', age: 35,
    fn: () => {
      S.publications += 2;
      return '🌳 Дисциплина из детства дала плоды: +2 публикации.';
    }
  },
  {
    branch: 'science_vs_friends', option: 'friends', age: 30,
    fn: () => {
      S.money += 30000;
      addAchievement('friend');
      return '🌳 Старый друг помог с деньгами: +30 000 ₽.';
    }
  },
  {
    branch: 'honest_vs_profit', option: 'honest', age: 35,
    fn: () => {
      S.rep = clamp(S.rep + 15, 0, 100);
      return '🌳 Профессор замолвил слово: +15 репутации.';
    }
  },
  {
    branch: 'honest_vs_profit', option: 'profit', age: 40,
    fn: () => {
      if (Math.random() < 0.5) {
        S.rep = Math.max(0, S.rep - 30);
        S.stress = clamp(S.stress + 20, 0, 100);
        return '🌳 Разоблачение! −30 репутации, +20 стресса.';
      }
      return '🌳 Твоя тайна не раскрыта.';
    }
  },
  {
    branch: 'family_vs_career', option: 'career', age: 38,
    fn: () => {
      S.money += 200000;
      S.charm = Math.max(0, S.charm - 5);
      return '🌳 Карьера за границей: +200 000 ₽, но семья отдалилась.';
    }
  },
  {
    branch: 'family_vs_career', option: 'family', age: 50,
    fn: () => {
      S.stress = clamp(S.stress - 20, 0, 100);
      S.health = clamp(S.health + 10, 0, 100);
      return '🌳 Семья рядом в старости: −20 стресса, +10 здоровья.';
    }
  },
  {
    branch: 'risk_vs_stable', option: 'risk', age: 45,
    fn: () => {
      if (Math.random() < 0.4) {
        S.money += 500000;
        addAchievement('rich');
        return '🌳 Стартап выстрелил! +500 000 ₽.';
      }
      S.money = Math.max(0, S.money - 100000);
      return '🌳 Стартап прогорел. −100 000 ₽.';
    }
  },
  {
    branch: 'risk_vs_stable', option: 'stable', age: 60,
    fn: () => {
      S.rep = clamp(S.rep + 10, 0, 100);
      return '🌳 Стабильность дала уважение: +10 репутации.';
    }
  },
  {
    branch: 'mentor_vs_solo', option: 'mentor', age: 50,
    fn: () => {
      S.rep = clamp(S.rep + 10, 0, 100);
      S.influence += 5;
      return '🌳 Твои ученики выросли и защитили диссертации: +10 репутации, +5 влияния.';
    }
  },
  {
    branch: 'mentor_vs_solo', option: 'solo', age: 50,
    fn: () => {
      S.int += 3;
      S.publications += 1;
      return '🌳 Одиночная работа дала точность: +3 интеллекта, +1 публикация.';
    }
  },
  {
    branch: 'money_vs_freedom', option: 'money', age: 45,
    fn: () => {
      S.money += 100000;
      S.rep = clamp(S.rep - 8, 0, 100);
      return '🌳 Спонсор потребовал своё: +100 000 ₽ и −8 репутации.';
    }
  },
  {
    branch: 'money_vs_freedom', option: 'freedom', age: 45,
    fn: () => {
      S.rep = clamp(S.rep + 10, 0, 100);
      return '🌳 Свобода принесла уважение коллег: +10 репутации.';
    }
  }
];

export function getAvailableTreeBranch() {
  for (const [key, branch] of Object.entries(TREE_BRANCHES)) {
    if (S.treeChoices[key]) continue;
    const w = branch.when;
    if (w.minAge && S.age < w.minAge) continue;
    if (w.maxAge && S.age > w.maxAge) continue;
    if (w.stage) {
      const stages = Array.isArray(w.stage) ? w.stage : [w.stage];
      if (!stages.includes(S.stage)) continue;
    }
    return { key, ...branch };
  }
  return null;
}

export function applyTreeChoice(key, optionId) {
  const branch = TREE_BRANCHES[key];
  if (!branch) return null;
  const opt = branch.options.find(o => o.id === optionId);
  if (!opt) return null;
  opt.apply();
  S.treeChoices[key] = { option: optionId, age: S.age, fired: false };
  return opt;
}

export function checkTreeConsequences() {
  for (const cons of TREE_CONSEQUENCES) {
    const choice = S.treeChoices[cons.branch];
    if (!choice || choice.option !== cons.option) continue;
    if (choice.fired) continue;
    if (S.age >= cons.age) {
      choice.fired = true;
      return cons.fn();
    }
  }
  return null;
}
