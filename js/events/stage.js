// События, привязанные к этапу жизни. Дают выбор с ощутимыми последствиями
// и подсвечивают характер героя.
export const stageEvents = [
  // ---------- ДЕТСТВО ----------
  {
    text: 'Старшеклассники пристают к младшему. Ты видел это на перемене.',
    when: { minAge: 9, maxAge: 16 },
    opts: [
      { t: '🛡️ Вступиться', f: (ctx) => { ctx.charm += 5; ctx.rep += 3; ctx.health -= 5; ctx.log('Ты вступился — и получил пару синяков.'); ctx.sound('success'); } },
      { t: '🚶 Пройти мимо', f: (ctx) => { ctx.stress += 6; ctx.log('Ты сделал вид, что не заметил.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'В школе объявили конкурс проектов. Приз — поездка и уважение учителей.',
    when: { minAge: 12, maxAge: 16 },
    opts: [
      { t: '🔬 Сделать проект', f: (ctx) => {
        if (ctx.int > 35) { ctx.int += 5; ctx.rep += 6; ctx.charm += 2; ctx.log('Твой проект взял первое место!'); ctx.sound('success'); }
        else { ctx.stress += 8; ctx.log('Проект не оценили — опыта не хватило.'); ctx.sound('fail'); }
      } },
      { t: '🎨 Нарисовать плакат', f: (ctx) => { ctx.charm += 4; ctx.skills.write += 2; ctx.log('Плакат всем понравился.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Родители ссорятся из-за денег. Слышно через стену.',
    when: { minAge: 9, maxAge: 16, flag: 'poorStart' },
    opts: [
      { t: '🛵 Пойти работать', f: (ctx) => { ctx.money += 600; ctx.stress += 10; ctx.charm += 2; ctx.log('Ты принёс домой первые деньги.'); ctx.sound('coin'); } },
      { t: '📖 Уйти в книги', f: (ctx) => { ctx.int += 6; ctx.stress += 4; ctx.log('Ты спрятался в книгах.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Учительница говорит: «Тебе надо в физматшколу, здесь тебе скучно».',
    when: { minAge: 13, maxAge: 16 },
    opts: [
      { t: '🏫 Перейти в сильную школу', f: (ctx) => { ctx.int += 9; ctx.charm -= 3; ctx.stress += 10; ctx.log('Новая школа — новые требования.'); ctx.sound('levelup'); } },
      { t: '🏠 Остаться с друзьями', f: (ctx) => { ctx.charm += 5; ctx.stress = Math.max(0, ctx.stress - 5); ctx.log('Ты остался в своей школе.'); ctx.sound('click'); } }
    ]
  },

  // ---------- УНИВЕРСИТЕТ ----------
  {
    text: 'Однокурсники зовут в студенческий стартап: обещают долю и «опыт на всю жизнь».',
    when: { minAge: 18, maxAge: 23, stage: 'uni' },
    opts: [
      { t: '🚀 Согласиться', f: (ctx) => {
        ctx.skills.it += 6; ctx.charm += 3; ctx.stress += 10;
        if (ctx.d20() > 14) { ctx.money += 60000; ctx.log('Стартап неожиданно взлетел — ты в плюсе!'); ctx.sound('success'); }
        else ctx.log('Стартап заглох, зато ты научился делать продукт.');
      } },
      { t: '📚 Сосредоточиться на учёбе', f: (ctx) => { ctx.int += 4; ctx.log('Ты выбрал учёбу.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'На сессии ты понимаешь, что не готов. До экзамена — ночь.',
    when: { minAge: 18, maxAge: 23, stage: 'uni' },
    opts: [
      { t: '📝 Выучить всё за ночь', f: (ctx) => { ctx.int += 5; ctx.stress += 12; ctx.health -= 4; ctx.log('Ты не спал, но сдал.'); ctx.sound('success'); } },
      { t: '🙈 Списать', f: (ctx) => {
        if (ctx.charm > 20) { ctx.stress += 5; ctx.log('Ты списал и не попался.'); ctx.sound('click'); }
        else { ctx.rep -= 6; ctx.stress += 15; ctx.log('Преподаватель заметил — стыд и пересдача.'); ctx.sound('fail'); }
      } }
    ]
  },
  {
    text: 'Ты нашёл ошибку в статье своего профессора. Ошибка серьёзная.',
    when: { minAge: 20, maxAge: 30, stage: ['uni', 'phd'] },
    opts: [
      { t: '⚖️ Написать об этом', f: (ctx) => { ctx.rep += 8; ctx.int += 3; ctx.enemies += 1; ctx.log('Профессор недоволен, но правда на твоей стороне.'); ctx.sound('success'); } },
      { t: '📧 Написать лично', f: (ctx) => { ctx.rep += 3; ctx.charm += 3; ctx.log('Профессор поблагодарил и пригласил в проект.'); ctx.sound('success'); } },
      { t: '🤐 Промолчать', f: (ctx) => { ctx.stress += 5; ctx.log('Ты промолчал.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Летняя стажировка в лаборатории: работы много, платят ноль, зато рядом сильные люди.',
    when: { minAge: 19, maxAge: 25, stage: ['uni', 'phd'] },
    opts: [
      { t: '🔬 Пойти', f: (ctx) => { ctx.int += 6; ctx.skills.chem += 5; ctx.projectProgress(20); ctx.stress += 8; ctx.log('Стажировка дала данные и знакомства.'); ctx.sound('success'); } },
      { t: '💼 Пойти на оплачиваемую работу', f: (ctx) => { ctx.money += 20000; ctx.log('Лето было сытым, но не научным.'); ctx.sound('coin'); } }
    ]
  },

  // ---------- АСПИРАНТУРА ----------
  {
    text: 'Наставник опубликовал твою идею под своим именем. В статье даже нет ссылки на тебя.',
    when: { minAge: 24, maxAge: 32, stage: 'phd' },
    opts: [
      { t: '⚖️ Требовать справедливости', f: (ctx) => { ctx.rep += 6; ctx.enemies += 2; ctx.stress += 15; ctx.log('Конфликт с наставником вышел наружу.'); ctx.sound('success'); } },
      { t: '🤐 Проглотить', f: (ctx) => { ctx.int += 3; ctx.stress += 12; ctx.log('Ты промолчал. Это запомнится.'); ctx.sound('fail'); } }
    ]
  },
  {
    text: 'Главное оборудование сломалось. Ремонт — 5000 ₽ и неделя простоя.',
    when: { stage: 'phd' },
    opts: [
      { t: '🔧 Починить самому', f: (ctx) => {
        if (ctx.money < 5000) { ctx.log('Денег нет — простоя не избежать.'); return; }
        ctx.money -= 5000; ctx.int += 3; ctx.health -= 5; ctx.projectProgress(15); ctx.log('Ты починил прибор сам.'); ctx.sound('success');
      } },
      { t: '📞 Ждать ремонтную службу', f: (ctx) => { ctx.stress += 10; ctx.log('Неделя простоя выбила тебя из графика.'); ctx.sound('fail'); } }
    ]
  },
  {
    text: 'Тебя пригласили на полгода в зарубежную лабораторию.',
    when: { minAge: 24, maxAge: 40, stage: ['phd', 'career'] },
    opts: [
      { t: '✈️ Поехать', f: (ctx) => { ctx.int += 10; ctx.rep += 8; ctx.money += 50000; ctx.charm += 4; ctx.flags.abroad = true; ctx.ach('abroad'); ctx.log('Полгода за границей изменили тебя.'); ctx.sound('success'); } },
      { t: '🏠 Остаться', f: (ctx) => { ctx.stress -= 5; ctx.projectProgress(15); ctx.log('Ты остался в родной лаборатории.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Конкурент опубликовал статью на твою тему. Он был быстрее на две недели.',
    when: { minAge: 24, maxAge: 50, stage: ['phd', 'career'] },
    opts: [
      { t: '🔥 Работать вдвое больше', f: (ctx) => { ctx.stress += 18; ctx.projectProgress(30); ctx.log('Ты включил режим аврала.'); ctx.sound('click'); } },
      { t: '🧘 Сменить акцент исследования', f: (ctx) => { ctx.int += 4; ctx.stress += 5; ctx.log('Ты нашёл новый угол зрения.'); ctx.sound('success'); } }
    ]
  },

  // ---------- КАРЬЕРА ----------
  {
    text: 'Министерство требует отчёт. Результаты скромные, но если «причесать» — выглядит лучше.',
    when: { minAge: 30, stage: 'career' },
    opts: [
      { t: '🎨 Приукрасить', f: (ctx) => { ctx.money += 20000; ctx.stress += 10; ctx.flags.padded = true; ctx.log('Отчёт принят. Внутри ты знаешь правду.'); ctx.sound('coin'); } },
      { t: '📊 Написать как есть', f: (ctx) => { ctx.rep += 4; ctx.stress += 8; ctx.log('Бюджет урезали, но совесть чиста.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Студент просит взять его в лабораторию. Глаза горят, знаний — ноль.',
    when: { minAge: 30, stage: 'career' },
    opts: [
      { t: '🧑‍🏫 Взять', f: (ctx) => { ctx.influence += 3; ctx.rep += 3; ctx.stress += 6; ctx.ach('mentor'); ctx.log('У тебя появился ученик.'); ctx.sound('success'); } },
      { t: '🚪 Отказать', f: (ctx) => { ctx.log('Ты отказал — наставничество не твоё.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Ректор предлагает должность декана: больше власти, меньше науки.',
    when: { minAge: 35, stage: 'career', rep: 50 },
    opts: [
      { t: '🏛️ Согласиться', f: (ctx) => { ctx.influence += 10; ctx.stress += 15; ctx.flags.dean = true; ctx.log('Ты стал деканом.'); ctx.sound('levelup'); } },
      { t: '🔬 Остаться учёным', f: (ctx) => { ctx.int += 4; ctx.rep += 5; ctx.log('Ты выбрал лабораторию.'); ctx.sound('success'); } }
    ]
  },
  {
    text: 'Корпорация предлагает 500 000 ₽ за твои патенты. Взамен — никаких публикаций.',
    when: { minAge: 32, stage: 'career' },
    opts: [
      { t: '💰 Продать', f: (ctx) => { ctx.money += 500000; ctx.rep -= 15; ctx.log('Патенты ушли, счета выросли, соавторы обиделись.'); ctx.sound('coin'); } },
      { t: '🔬 Отказаться', f: (ctx) => { ctx.rep += 8; ctx.log('Ты оставил науку открытой.'); ctx.sound('success'); } }
    ]
  },
  {
    text: 'Конференция в Женеве. Взнос и билеты — 20 000 ₽ из своего кармана.',
    when: { minAge: 26, stage: ['phd', 'career'] },
    opts: [
      { t: '✈️ Поехать', f: (ctx) => {
        if (ctx.money < 20000) { ctx.log('Денег на поездку нет.'); return; }
        ctx.money -= 20000; ctx.int += 5; ctx.rep += 8; ctx.charm += 3;
        ctx.log('Женева дала знакомства и идеи.'); ctx.sound('success');
      } },
      { t: '🎥 Смотреть онлайн', f: (ctx) => { ctx.int += 2; ctx.stress -= 3; ctx.log('Ты посмотрел трансляцию.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Ты выгорел. Врач советует месяц в горах — без ноутбука.',
    when: { minAge: 30 },
    cond: (ctx) => ctx.stress > 60,
    opts: [
      { t: '🏔️ Уехать', f: (ctx) => {
        if (ctx.money < 40000) { ctx.log('На отпуск нет денег, но ты взял неделю за свой счёт.'); ctx.stress = Math.max(0, ctx.stress - 15); return; }
        ctx.money -= 40000; ctx.stress = Math.max(0, ctx.stress - 35); ctx.health += 10;
        ctx.log('Горы вернули тебя к жизни.'); ctx.sound('success');
      } },
      { t: '💻 Работать дальше', f: (ctx) => { ctx.stress += 10; ctx.health -= 8; ctx.log('Отпуск отложен — как всегда.'); ctx.sound('fail'); } }
    ]
  },
  {
    text: 'Аспирант приносит черновик статьи. Он слабый, но старался.',
    when: { minAge: 33, stage: 'career' },
    opts: [
      { t: '✍️ Переписать самому', f: (ctx) => { ctx.publications += 1; ctx.stress += 12; ctx.log('Статья вышла — под двумя именами.'); ctx.sound('success'); } },
      { t: '📝 Заставить переписать', f: (ctx) => { ctx.rep += 4; ctx.influence += 2; ctx.log('Аспирант вырос на этой правке.'); ctx.sound('success'); } }
    ]
  }
];
