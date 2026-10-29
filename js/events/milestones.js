// Ключевые моменты жизни. Срабатывают один раз в указанном возрасте,
// показываются как события с заголовком и дают настоящий выбор.
// Эффекты намеренно заметные — это вехи, а не рядовые события.
import { chronicle } from '../chronicle.js';

export const MILESTONES = [
  {
    id: 'first_book', age: 8, title: 'Первая настоящая книга',
    text: 'В библиотеке ты наткнулся на взрослую энциклопедию. Она огромная, а во дворе играют.',
    opts: [
      { t: '📖 Взять домой', f: (ctx) => { ctx.int += 6; ctx.skills.write += 2; ctx.stress += 3; ctx.log('Ты проглотил энциклопедию за месяц.'); ctx.sound('success'); } },
      { t: '⚽ Пойти во двор', f: (ctx) => { ctx.charm += 5; ctx.stress = Math.max(0, ctx.stress - 5); ctx.log('Двор запомнил тебя как своего.'); ctx.sound('click'); } }
    ]
  },
  {
    id: 'skip_school', age: 11, title: 'Прогулять или нет',
    text: 'Друзья зовут в кино, а завтра контрольная по математике. Учительница уже косо смотрит.',
    opts: [
      { t: '🎬 Пойти с друзьями', f: (ctx) => { ctx.charm += 6; ctx.int -= 2; ctx.stress = Math.max(0, ctx.stress - 8); ctx.flags.skippedSchool = true; ctx.log('Прогулял — и не пожалел (пока).'); ctx.sound('click'); } },
      { t: '📐 Остаться за учебником', f: (ctx) => { ctx.int += 6; ctx.skills.math += 3; ctx.stress += 4; ctx.log('Контрольная сдана на пять.'); ctx.sound('success'); } }
    ]
  },
  {
    id: 'first_love', age: 14, title: 'Первое чувство',
    text: 'В классе появилась девочка, из-за которой ты забываешь про физику. Она просит помочь с задачами.',
    opts: [
      { t: '💞 Помогать каждый вечер', f: (ctx) => { ctx.charm += 7; ctx.int += 3; ctx.stress -= 4; ctx.flags.firstLove = true; ctx.log('Физика вдруг стала романтичной.'); ctx.sound('success'); } },
      { t: '📚 Сказать, что занят', f: (ctx) => { ctx.int += 6; ctx.skills.math += 2; ctx.charm -= 2; ctx.log('Ты выбрал задачи.'); ctx.sound('click'); } }
    ]
  },
  {
    id: 'graduation', age: 17, title: 'Выпускной',
    text: 'Школа закончена. Последний вечер — и дальше каждый сам по себе.',
    opts: [
      { t: '🥇 Взять медаль', f: (ctx) => { ctx.int += 5; ctx.rep += 8; ctx.ach('olymp'); ctx.log('Ты получил золотую медаль.'); ctx.sound('levelup'); } },
      { t: '🎉 Гулять до утра', f: (ctx) => { ctx.charm += 8; ctx.stress = Math.max(0, ctx.stress - 15); ctx.log('Ты запомнил этот вечер навсегда.'); ctx.sound('success'); } },
      { t: '💼 Сразу на подработку', f: (ctx) => { ctx.money += 5000; ctx.stress += 5; ctx.log('Лето началось с работы.'); ctx.sound('coin'); } }
    ]
  },
  {
    id: 'summer_school', age: 20, title: 'Летняя научная школа',
    text: 'Тебя пригласили в летнюю школу — сильная программа, но месяц без работы и 3000 ₽ взноса.',
    opts: [
      { t: '🏕️ Поехать', f: (ctx) => { if (ctx.money < 3000) { ctx.log('Денег не хватает.'); return; } ctx.money -= 3000; ctx.int += 9; ctx.charm += 4; ctx.flags.summerSchool = true; ctx.log('Школа дала знакомства и мозговую осанку.'); ctx.sound('success'); } },
      { t: '💼 Остаться работать', f: (ctx) => { ctx.money += 9000; ctx.stress += 3; ctx.log('Лето проработал.'); ctx.sound('coin'); } }
    ]
  },
  {
    id: 'thesis_topic', age: 23, title: 'Тема диссертации',
    text: 'Научный руководитель предлагает два пути: скучная, но надёжная тема — или рискованная.',
    opts: [
      { t: '🛡️ Надёжная тема', f: (ctx) => { ctx.stress -= 5; ctx.rep += 4; ctx.flags.safeTopic = true; ctx.log('Ты выбрал надёжный путь.'); ctx.sound('click'); } },
      { t: '🚀 Рискованная тема', f: (ctx) => { ctx.stress += 10; ctx.int += 4; ctx.flags.boldTopic = true; ctx.log('Ты пошёл в неизвестность. Время покажет.'); ctx.sound('levelup'); } }
    ]
  },
  {
    id: 'first_big_grant', age: 27, title: 'Первый большой грант',
    text: 'Грант на 300 000 ₽ на три года. Отчётность жёсткая, но без денег лаборатория встанет.',
    opts: [
      { t: '📝 Взять и работать', f: (ctx) => { ctx.money += 300000; ctx.stress += 15; ctx.flags.bigGrant = true; ctx.log('Грант твой. Обязательств — на три года вперёд.'); ctx.sound('coin'); } },
      { t: '🚶 Отказаться', f: (ctx) => { ctx.stress -= 5; ctx.rep -= 3; ctx.log('Ты выбрал свободу.'); ctx.sound('click'); } }
    ]
  },
  {
    id: 'industry_offer', age: 31, title: 'Звонок из индустрии',
    text: 'Крупная компания предлагает 500 000 ₽ в год и лабораторию — но без статей и конференций.',
    opts: [
      { t: '💼 Уйти в индустрию', f: (ctx) => { ctx.money += 500000; ctx.rep -= 12; ctx.stress += 10; ctx.flags.industry = true; ctx.log('Ты сменил халат на офис.'); ctx.sound('coin'); } },
      { t: '🔬 Остаться в науке', f: (ctx) => { ctx.rep += 6; ctx.int += 3; ctx.log('Наука дороже денег — по крайней мере сегодня.'); ctx.sound('success'); } }
    ]
  },
  {
    id: 'midlife', age: 36, title: 'Кризис середины пути',
    text: 'Всё стабильно: должность, статьи, усталость. Может, сменить тему, пока не поздно?',
    opts: [
      { t: '🔄 Начать с чистого листа', f: (ctx) => { ctx.stress += 15; ctx.int += 5; ctx.flags.restarted = true; ctx.log('Ты сменил направление. Тело привыкло к стрессу.'); ctx.sound('levelup'); } },
      { t: '🧘 Продолжать спокойно', f: (ctx) => { ctx.stress -= 12; ctx.health += 5; ctx.log('Ты выбрал стабильность.'); ctx.sound('click'); } }
    ]
  },
  {
    id: 'face_of_science', age: 42, title: 'Лицо науки',
    text: 'Тебя хотят сделать лицом научпопа: интервью, лекции, реклама. Научная работа встанет.',
    opts: [
      { t: '📺 Согласиться', f: (ctx) => { ctx.charm += 8; ctx.rep += 8; ctx.stress += 12; ctx.money += 40000; ctx.ach('published'); ctx.log('Ты стал медийным учёным.'); ctx.sound('success'); } },
      { t: '🔇 Остаться в лаборатории', f: (ctx) => { ctx.rep += 5; ctx.stress -= 6; ctx.log('Лаборатория важнее эфира.'); ctx.sound('click'); } }
    ]
  },
  {
    id: 'anniversary', age: 50, title: 'Пятьдесят',
    text: 'Коллеги собрали юбилей. За спиной — годы, впереди — меньше, чем хотелось бы.',
    opts: [
      { t: '🏛️ Возглавить кафедру', f: (ctx) => { ctx.influence += 8; ctx.stress += 8; ctx.ach('mentor'); ctx.log('Ты стал администратором от науки.'); ctx.sound('levelup'); } },
      { t: '🌿 Уйти в тень', f: (ctx) => { ctx.stress -= 20; ctx.health += 8; ctx.log('Ты выбрал тишину и здоровье.'); ctx.sound('success'); } }
    ]
  },
  {
    id: 'summing_up', age: 56, title: 'Подведение итогов',
    text: 'Пора решить, что останется после тебя.',
    opts: [
      { t: '🎓 Передать школу', f: (ctx) => { ctx.rep += 8; ctx.influence += 5; ctx.ach('mentor'); ctx.log('У тебя уже есть ученики.'); ctx.sound('levelup'); } },
      { t: '📕 Дописать книгу', f: (ctx) => { ctx.publications += 2; ctx.skills.write += 5; ctx.money += 30000; ctx.ach('book'); ctx.log('Книга вышла в свет.'); ctx.sound('success'); } }
    ]
  }
];

/** Возвращает событие-веху для текущего возраста (или null). */
export function checkMilestones(S) {
  if (!S.milestones) S.milestones = [];
  const m = MILESTONES.find(x => x.age === S.age && !S.milestones.includes(x.id));
  if (!m) return null;
  S.milestones.push(m.id);
  chronicle('🎬', m.title);
  return {
    milestone: true,
    title: `🎬 ${m.title}`,
    text: m.text,
    opts: m.opts
  };
}
