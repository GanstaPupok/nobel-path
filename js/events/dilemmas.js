// Моральные развилки и дорогие решения. Не привязаны к этапу,
// но требуют ресурсов или ставят на кон репутацию.
export const dilemmaEvents = [
  {
    text: 'Коллега просит подписать статью, которую ты не читал. Взамен обещает ответную услугу.',
    when: { minAge: 24 },
    opts: [
      { t: '✍️ Подписать', f: (ctx) => { ctx.publications += 1; ctx.rep -= 4; ctx.stress += 6; ctx.log('Ты подписал. Соавторство — тоже работа.'); ctx.sound('click'); } },
      { t: '🚫 Отказаться', f: (ctx) => { ctx.rep += 3; ctx.enemies += 1; ctx.log('Отказ обидел коллегу, но совесть чиста.'); ctx.sound('success'); } }
    ]
  },
  {
    text: 'Данные не сходятся с гипотезой. Можно «подчистить» выбросы — и статья выйдет.',
    when: { minAge: 26, stage: ['phd', 'career'] },
    opts: [
      { t: '🩹 Подчистить', f: (ctx) => {
        ctx.publications += 1; ctx.rep += 5; ctx.stress += 15; ctx.flags.falsified = true;
        ctx.log('Статья вышла. Внутри — сомнение.'); ctx.sound('click');
      } },
      { t: '📉 Опубликовать отрицательный результат', f: (ctx) => { ctx.rep += 8; ctx.int += 4; ctx.stress += 5; ctx.log('Честность иногда дороже эффектной статьи.'); ctx.sound('success'); } },
      { t: '🗑️ Выбросить данные', f: (ctx) => { ctx.stress += 10; ctx.log('Месяцы работы — в корзину.'); ctx.sound('fail'); } }
    ]
  },
  {
    text: 'Поздний звонок: мать попала в больницу. Нужны деньги на операцию.',
    when: { minAge: 22 },
    opts: [
      { t: '💳 Взять кредит', f: (ctx) => { ctx.money += 100000; ctx.stress += 20; ctx.flags.debt = true; ctx.charm += 2; ctx.log('Ты взял кредит и не пожалел.'); ctx.sound('coin'); } },
      { t: '🏥 Достать деньги любым путём', f: (ctx) => {
        if (ctx.money < 100000) { ctx.money = Math.max(0, ctx.money + 100000); ctx.rep -= 10; ctx.stress += 25; ctx.log('Ты занял у всех, у кого мог. Репутация пострадала.'); ctx.sound('fail'); }
        else { ctx.money -= 100000; ctx.stress += 10; ctx.log('Ты оплатил операцию.'); ctx.sound('success'); }
      } }
    ]
  },
  {
    text: 'Журналист предлагает деньги за «сенсацию» о твоём институте. Факты он подгонит сам.',
    when: { minAge: 30, stage: 'career' },
    opts: [
      { t: '💰 Взять деньги', f: (ctx) => { ctx.money += 60000; ctx.rep -= 12; ctx.enemies += 2; ctx.log('Скандал вышел. Деньги остались.'); ctx.sound('coin'); } },
      { t: '🚫 Отказаться', f: (ctx) => { ctx.rep += 5; ctx.log('Ты отказался от лёгких денег.'); ctx.sound('success'); } }
    ]
  },
  {
    text: 'Тебе предлагают читать платный курс вместо работы над проектом. Оплата щедрая.',
    when: { minAge: 28, stage: 'career' },
    opts: [
      { t: '💼 Взять курс', f: (ctx) => { ctx.money += 90000; ctx.charm += 4; ctx.stress += 8; ctx.projectProgress(-10); ctx.log('Курс оплачен, проект подождал.'); ctx.sound('coin'); } },
      { t: '🔬 Работать над темой', f: (ctx) => { ctx.projectProgress(20); ctx.log('Ты остался в лаборатории.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Блогер с миллионом подписчиков обвинил тебя в плагиате. Это клевета, но шумно.',
    when: { minAge: 25, rep: 40 },
    opts: [
      { t: '⚖️ Судиться', f: (ctx) => {
        if (ctx.money < 50000) { ctx.rep -= 8; ctx.stress += 15; ctx.log('На суд не хватило денег.'); ctx.sound('fail'); return; }
        ctx.money -= 50000; ctx.rep += 8; ctx.enemies -= 1; ctx.log('Суд выигран, репутация восстановлена.'); ctx.sound('success');
      } },
      { t: '📢 Ответить публично', f: (ctx) => {
        if (ctx.charm > 40) { ctx.rep += 6; ctx.charm += 3; ctx.log('Твой ответ стал вирусным.'); ctx.sound('success'); }
        else { ctx.rep -= 5; ctx.stress += 12; ctx.log('Ответ вышел неубедительным.'); ctx.sound('fail'); }
      } },
      { t: '😌 Игнорировать', f: (ctx) => { ctx.stress += 6; ctx.log('Через месяц все забыли.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Старый друг просит пристроить его сына в лабораторию. Парень слабый, но друг — настоящий.',
    when: { minAge: 30, stage: 'career' },
    opts: [
      { t: '🤝 Взять', f: (ctx) => { ctx.charm += 5; ctx.rep -= 4; ctx.stress += 5; ctx.log('Друг благодарен, коллеги косились.'); ctx.sound('click'); } },
      { t: '🙅 Отказать', f: (ctx) => { ctx.rep += 3; ctx.charm -= 3; ctx.log('Друг обиделся.'); ctx.sound('fail'); } }
    ]
  },
  {
    text: 'На конференции ты знакомишься с человеком, который через десять лет может стать твоим главным союзником или соперником.',
    when: { minAge: 25, maxAge: 45 },
    opts: [
      { t: '🤝 Обменяться идеями', f: (ctx) => { ctx.charm += 4; ctx.int += 3; ctx.influence += 2; ctx.log('Вы договорились о совместной работе.'); ctx.sound('success'); } },
      { t: '🔒 Держать дистанцию', f: (ctx) => { ctx.rep += 2; ctx.log('Ты не стал раскрываться.'); ctx.sound('click'); } }
    ]
  }
];
