// Арки отношений: любовь, семья, соперник, наставник + короткие арки
// (друг, хейтер, соавтор, хобби). Каждая большая арка проходит 5-6 стадий
// и заканчивается последствием в финале.

const CHILD_NAMES = ['Миша', 'Саша', 'Лена', 'Тимур', 'Вера', 'Костя'];
const MENTORS = ['профессор Лихачёв', 'профессор Соколова', 'профессор Гринберг'];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export const arcEvents = [
  // ============================================================
  // ЛЮБОВЬ
  // ============================================================
  {
    text: 'На конференции после доклада к тебе подходят трое. У каждого — свой взгляд на жизнь.',
    when: { minAge: 20, maxAge: 32, noArc: 'love' },
    rareId: 'love_meet',
    opts: [
      { t: '🎨 Аня — художница', f: (ctx) => {
        const name = ctx.gender === 'f' ? 'Андрей' : 'Аня';
        ctx.setArc('love', { stage: 'dating', years: 0, love: 60, partner: { id: 'creative', name, icon: '🎨', trait: 'creative' } });
        ctx.charm += 3; ctx.stress = Math.max(0, ctx.stress - 8);
        ctx.log(`Ты начал встречаться с ${name}. Она умеет вытащить тебя из головы.`); ctx.sound('success');
      } },
      { t: '🔬 Ира — учёный', f: (ctx) => {
        const name = ctx.gender === 'f' ? 'Игорь' : 'Ира';
        ctx.setArc('love', { stage: 'dating', years: 0, love: 60, partner: { id: 'scientist', name, icon: '🔬', trait: 'scientist' } });
        ctx.int += 3; ctx.log(`Ты начал встречаться с ${name}. С ней можно говорить о работе.`); ctx.sound('success');
      } },
      { t: '💼 Саша — предприниматель', f: (ctx) => {
        const name = 'Саша';
        ctx.setArc('love', { stage: 'dating', years: 0, love: 55, partner: { id: 'business', name, icon: '💼', trait: 'business' } });
        ctx.money += 5000; ctx.stress += 3;
        ctx.log(`Ты начал встречаться с ${name}. Деньги есть, времени мало.`); ctx.sound('coin');
      } },
      { t: '🚶 Уйти домой работать', f: (ctx) => {
        ctx.int += 2; ctx.flags.soloPath = true;
        ctx.log('Ты выбрал работу. Пока.'); ctx.sound('click');
      } }
    ]
  },
  {
    text: 'Быт съедает романтику. Вы ссоритесь из-за посуды и твоих вечных опозданий.',
    when: { arc: 'love', arcStage: 'dating', minArcYears: 2 },
    rare: true, rareId: 'love_everyday',
    opts: [
      { t: '🤝 Договориться', f: (ctx) => { ctx.bump('love', 'love', 12); ctx.charm += 3; ctx.log('Вы научились разговаривать.'); ctx.sound('success'); } },
      { t: '😤 Отстоять своё', f: (ctx) => { ctx.bump('love', 'love', -10); ctx.stress += 5; ctx.int += 2; ctx.log('Ты настоял на своём. Стало тише, но холоднее.'); ctx.sound('fail'); } },
      { t: '🌹 Устроить свидание', f: (ctx) => {
        if (ctx.money < 8000) { ctx.log('Денег на свидание нет.'); return; }
        ctx.money -= 8000; ctx.bump('love', 'love', 18); ctx.stress = Math.max(0, ctx.stress - 10);
        ctx.log('Вечер вернул искру.'); ctx.sound('success');
      } }
    ]
  },
  {
    text: 'Ты думаешь о предложении руки и сердца. Кольцо и свадьба — не меньше 20 000 ₽.',
    when: { arc: 'love', arcStage: 'dating', minAge: 25 },
    rareId: 'love_marry',
    opts: [
      { t: '💍 Сделать предложение', f: (ctx) => {
        if (ctx.money < 20000) { ctx.log('Денег нет — отложил.'); ctx.sound('fail'); return; }
        ctx.money -= 20000; ctx.advance('love', 'married', { years: 0 });
        ctx.bump('love', 'love', 10);
        ctx.ach('married'); ctx.ach('arc_love');
        ctx.log('💍 Вы поженились!'); ctx.sound('levelup');
      } },
      { t: '😴 Подождать', f: (ctx) => { ctx.bump('love', 'love', -5); ctx.log('Ты отложил разговор.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Медовый месяц: можно рвануть в горы, а можно сэкономить и остаться дома.',
    when: { arc: 'love', arcStage: 'married', minArcYears: 1 },
    rare: true, rareId: 'love_honeymoon',
    opts: [
      { t: '🏔️ В горы (30 000 ₽)', f: (ctx) => {
        if (ctx.money < 30000) { ctx.log('На горы не хватило.'); ctx.bump('love', 'love', 3); return; }
        ctx.money -= 30000; ctx.bump('love', 'love', 20); ctx.health += 5; ctx.stress = Math.max(0, ctx.stress - 20);
        ctx.log('Месяц в горах — лучший год жизни.'); ctx.sound('success');
      } },
      { t: '🏠 Остаться дома', f: (ctx) => { ctx.money += 5000; ctx.bump('love', 'love', 4); ctx.log('Сэкономили, но мечта осталась.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Партнёр говорит: «Тебя нет дома. Ты живёшь в лаборатории».',
    when: { arc: 'love', arcStage: 'married', minAge: 42, minArcYears: 5 },
    rare: true, rareId: 'love_crisis',
    opts: [
      { t: '💑 Семейная терапия (30 000 ₽)', f: (ctx) => {
        if (ctx.money < 30000) { ctx.bump('love', 'love', -5); ctx.stress += 10; ctx.log('На терапию не хватило.'); return; }
        ctx.money -= 30000; ctx.bump('love', 'love', 18); ctx.stress = Math.max(0, ctx.stress - 12);
        ctx.log('Терапия помогла — вы снова вместе.'); ctx.sound('success');
      } },
      { t: '🔬 Уйти в работу', f: (ctx) => {
        ctx.bump('love', 'love', -25); ctx.rep = Math.min(100, ctx.rep + 8); ctx.stress += 8;
        ctx.log('Ты выбрал лабораторию. Дома — тишина.'); ctx.sound('fail');
      } },
      { t: '💔 Развестись', f: (ctx) => {
        ctx.advance('love', 'divorced'); ctx.money = Math.floor(ctx.money * 0.6); ctx.stress += 15;
        ctx.log('Развод. Половина денег и полгода пустоты.'); ctx.sound('fail');
      } }
    ]
  },
  {
    text: 'Вы вместе уже двадцать лет. Дети выросли, а вы всё ещё держитесь за руки.',
    when: { arc: 'love', arcStage: 'married', minAge: 55, minArcYears: 15 },
    rare: true, rareId: 'love_anniversary',
    opts: [
      { t: '💞 Отметить вдвоём', f: (ctx) => { ctx.bump('love', 'love', 15); ctx.health += 8; ctx.stress = Math.max(0, ctx.stress - 20); ctx.log('Годовщина в кругу семьи.'); ctx.sound('success'); } },
      { t: '🎉 Позвать всех', f: (ctx) => { ctx.bump('love', 'love', 10); ctx.influence += 3; ctx.money -= 20000; ctx.log('Большой праздник собрал коллег и друзей.'); ctx.sound('success'); } }
    ]
  },
  {
    text: 'К сорока годам ты так и не завёл семью. Иногда это грызёт.',
    when: { minAge: 40, noArc: 'love' },
    rare: true, rareId: 'love_single',
    opts: [
      { t: '🧘 Принять себя', f: (ctx) => { ctx.stress = Math.max(0, ctx.stress - 15); ctx.int += 4; ctx.log('Ты научился быть один.'); ctx.sound('success'); } },
      { t: '📱 Попробовать снова', f: (ctx) => {
        ctx.setArc('love', { stage: 'dating', years: 0, love: 50, partner: { id: 'creative', name: 'Марина', icon: '🎨', trait: 'creative' } });
        ctx.charm += 2; ctx.log('Ты решился на новые отношения.'); ctx.sound('success');
      } }
    ]
  },

  // ============================================================
  // СЕМЬЯ И ДЕТИ
  // ============================================================
  {
    text: 'Партнёр хочет ребёнка. Это не только радость, но и 15 000 ₽ расходов каждый год.',
    when: { arc: 'love', arcStage: 'married', minAge: 26, maxAge: 48, noArc: 'family' },
    rareId: 'family_start',
    opts: [
      { t: '👶 Согласиться', f: (ctx) => {
        const child = pick(CHILD_NAMES);
        ctx.setArc('family', { stage: 'kid', years: 0, childName: child, bond: 65 });
        ctx.money = Math.max(0, ctx.money - 15000); ctx.stress += 5;
        ctx.ach('parent'); ctx.ach('parent_arc');
        ctx.log(`👶 Родился ${child}!`); ctx.sound('levelup');
      } },
      { t: '🚶 Отложить', f: (ctx) => { ctx.bump('love', 'love', -8); ctx.log('Вы решили подождать.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Ребёнку пора в школу. Родительский чат уже делится мнениями.',
    when: { arc: 'family', arcStage: 'kid', minArcYears: 6 },
    rareId: 'family_school',
    opts: [
      { t: '🏫 Сильная школа (20 000 ₽)', f: (ctx) => {
        ctx.advance('family', 'school'); ctx.bump('family', 'bond', 10);
        ctx.money = Math.max(0, ctx.money - 20000); ctx.int += 2;
        ctx.log('Ты отдал ребёнка в сильную школу.'); ctx.sound('success');
      } },
      { t: '🏠 Школа во дворе', f: (ctx) => { ctx.advance('family', 'school'); ctx.bump('family', 'bond', 5); ctx.log('Обычная школа — зато друзья рядом.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Учитель говорит: у твоего ребёнка талант. Но развивать его — дорого.',
    when: { arc: 'family', arcStage: 'school', minArcYears: 11 },
    rareId: 'family_talent',
    opts: [
      { t: '🎻 Оплатить занятия (30 000 ₽)', f: (ctx) => {
        if (ctx.money < 30000) { ctx.log('На занятия не хватило.'); ctx.bump('family', 'bond', -5); return; }
        ctx.money -= 30000; ctx.advance('family', 'teen', { childTalent: 'art' }); ctx.bump('family', 'bond', 15);
        ctx.log('Ребёнок нашёл своё дело.'); ctx.sound('success');
      } },
      { t: '🔬 Направить в науку', f: (ctx) => {
        ctx.advance('family', 'teen', { childTalent: 'science' }); ctx.bump('family', 'bond', -5); ctx.int += 2;
        ctx.log('Ты решил, что ребёнок пойдёт в науку. Он не спорил.'); ctx.sound('click');
      } },
      { t: '🚶 Пусть сам решает', f: (ctx) => { ctx.advance('family', 'teen'); ctx.bump('family', 'bond', -10); ctx.log('Ты не стал вмешиваться.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Подросток хлопнул дверью: «Ты меня не понимаешь!»',
    when: { arc: 'family', arcStage: 'teen', minArcYears: 15 },
    rareId: 'family_teen',
    opts: [
      { t: '🗣️ Поговорить по-человечески', f: (ctx) => {
        ctx.advance('family', 'adult'); ctx.bump('family', 'bond', 15); ctx.charm += 3;
        ctx.log('Вы проговорили всю ночь.'); ctx.sound('success');
      } },
      { t: '📏 Наказать', f: (ctx) => { ctx.advance('family', 'adult'); ctx.bump('family', 'bond', -15); ctx.stress += 5; ctx.log('Дисциплина победила, близость — нет.'); ctx.sound('fail'); } },
      { t: '🚪 Отпустить', f: (ctx) => { ctx.advance('family', 'adult'); ctx.bump('family', 'bond', -5); ctx.stress = Math.max(0, ctx.stress - 5); ctx.log('Ты дал ему свободу.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Ребёнок вырос и выбирает, чем заниматься дальше.',
    when: { arc: 'family', arcStage: 'adult', minArcYears: 19 },
    rareId: 'family_adult',
    opts: [
      { t: '🎓 Пошёл в науку', f: (ctx) => {
        ctx.advance('family', 'legacy'); ctx.rep = Math.min(100, ctx.rep + 8); ctx.bump('family', 'bond', 10);
        ctx.ach('arc_family'); ctx.log('Твоя династия продолжается.'); ctx.sound('levelup');
      } },
      { t: '💼 Ушёл в бизнес', f: (ctx) => {
        ctx.advance('family', 'legacy'); ctx.money += 100000; ctx.bump('family', 'bond', 5);
        ctx.ach('arc_family'); ctx.log('Ребёнок выбрал деньги, но вас это не разделило.'); ctx.sound('coin');
      } },
      { t: '✈️ Уехал за границу', f: (ctx) => {
        ctx.advance('family', 'legacy'); ctx.bump('family', 'bond', -10); ctx.log('Он далеко. Но звонит по воскресеньям.'); ctx.sound('click');
      } }
    ]
  },

  // ============================================================
  // СОПЕРНИК
  // ============================================================
  {
    text: 'В лаборатории появился амбициозный Виктор. Он смотрит на твою тему подозрительно внимательно.',
    when: { minAge: 25, maxAge: 40, stage: ['phd', 'career'], noArc: 'rival' },
    rareId: 'rival_start',
    opts: [
      { t: '🤝 Быть на дружеской ноге', f: (ctx) => {
        ctx.setArc('rival', { name: 'Виктор', stage: 'appeared', years: 0, enemy: 0 });
        ctx.charm += 3; ctx.log('Вы пока приятели. Пока.'); ctx.sound('click');
      } },
      { t: '😤 Держать дистанцию', f: (ctx) => {
        ctx.setArc('rival', { name: 'Виктор', stage: 'appeared', years: 0, enemy: 1 });
        ctx.stress += 5; ctx.enemies += 1; ctx.log('Ты дал понять, что не дружишь.'); ctx.sound('click');
      } }
    ]
  },
  {
    text: 'Виктор опубликовал статью, почти идентичную твоей недописанной работе.',
    when: { arc: 'rival', arcStage: 'appeared', minAge: 27 },
    rareId: 'rival_clash',
    opts: [
      { t: '⚔️ Публично обвинить', f: (ctx) => {
        ctx.advance('rival', 'clash');
        if (ctx.rep > 45) { ctx.rep = Math.min(100, ctx.rep + 12); ctx.log('Коллеги поддержали тебя.'); ctx.sound('success'); }
        else { ctx.rep = Math.max(0, ctx.rep - 10); ctx.log('Тебя назвали скандалистом.'); ctx.sound('fail'); }
        ctx.enemies += 1;
      } },
      { t: '🤐 Написать быстрее следующий', f: (ctx) => {
        ctx.advance('rival', 'clash'); ctx.stress += 10; ctx.projectProgress(25);
        ctx.log('Ты ответил делом, а не словами.'); ctx.sound('click');
      } }
    ]
  },
  {
    text: 'Твой эксперимент испорчен: кто-то поменял реагенты. Подозрение падает на Виктора.',
    when: { arc: 'rival', arcStage: 'clash', minAge: 32 },
    rareId: 'rival_war',
    opts: [
      { t: '⚖️ Писать заявление', f: (ctx) => {
        ctx.advance('rival', 'war'); ctx.enemies += 1; ctx.stress += 10;
        if (ctx.d20() > 12) { ctx.rep = Math.min(100, ctx.rep + 8); ctx.log('Комиссия нашла виновного.'); ctx.sound('success'); }
        else { ctx.rep = Math.max(0, ctx.rep - 5); ctx.log('Доказать не удалось.'); ctx.sound('fail'); }
      } },
      { t: '🧘 Промолчать и переделать', f: (ctx) => {
        ctx.advance('rival', 'war'); ctx.stress += 12; ctx.projectProgress(15);
        ctx.log('Ты переделал работу и стал аккуратнее.'); ctx.sound('click');
      } },
      { t: '🤝 Поговорить лично', f: (ctx) => {
        ctx.advance('rival', 'duel'); ctx.charm += 4; ctx.stress += 5;
        ctx.log('Вы договорились выяснить всё публично, на конференции.'); ctx.sound('click');
      } }
    ]
  },
  {
    text: 'Конференция. Виктор вызывает тебя на публичную дискуссию по твоей теме.',
    when: { arc: 'rival', arcStage: ['clash', 'war'], minAge: 38 },
    rareId: 'rival_duel',
    opts: [
      { t: '🎤 Принять вызов', f: (ctx) => {
        const power = ctx.int + ctx.rep + ctx.charm;
        ctx.advance('rival', 'duel');
        if (power > 180) { ctx.rep = Math.min(100, ctx.rep + 15); ctx.ach('arc_rival'); ctx.log('Ты разнёс его аргументы в пух и прах.'); ctx.sound('levelup'); }
        else { ctx.rep = Math.max(0, ctx.rep - 8); ctx.log('Зал был не на твоей стороне.'); ctx.sound('fail'); }
        ctx.stress += 10;
      } },
      { t: '🕊️ Предложить мир', f: (ctx) => {
        ctx.advance('rival', 'friends'); ctx.enemies = Math.max(0, ctx.enemies - 1);
        ctx.rep = Math.min(100, ctx.rep + 5); ctx.charm += 3;
        ctx.log('Вы обнялись прямо на сцене. Зал аплодировал.'); ctx.sound('success');
      } },
      { t: '🚶 Отказаться', f: (ctx) => {
        ctx.advance('rival', 'lost'); ctx.rep = Math.max(0, ctx.rep - 10);
        ctx.log('Ты отказался — и это заметили.'); ctx.sound('fail');
      } }
    ]
  },
  {
    text: 'Прошло много лет. Виктор звонит впервые за десять лет.',
    when: { arc: 'rival', arcStage: ['won', 'lost', 'friends', 'duel'], minAge: 55 },
    rareId: 'rival_final',
    opts: [
      { t: '🍺 Встретиться', f: (ctx) => {
        ctx.advance('rival', 'friends'); ctx.stress = Math.max(0, ctx.stress - 15); ctx.charm += 3;
        ctx.log('Вы вспомнили всё и посмеялись. Врагов больше нет.'); ctx.sound('success');
      } },
      { t: '📞 Не брать трубку', f: (ctx) => {
        ctx.stress = Math.max(0, ctx.stress - 5);
        ctx.log('Ты не стал возвращаться в прошлое.'); ctx.sound('click');
      } }
    ]
  },

  // ============================================================
  // НАСТАВНИК
  // ============================================================
  {
    text: 'На защите семинара тебя замечает профессор. «Приходите ко мне в группу».',
    when: { minAge: 23, maxAge: 38, stage: ['phd', 'career'], noArc: 'mentor' },
    rareId: 'mentor_meet',
    opts: [
      { t: '🎓 Согласиться', f: (ctx) => {
        const name = pick(MENTORS);
        ctx.setArc('mentor', { name, stage: 'found', years: 0, bond: 60 });
        ctx.int += 3; ctx.log(`${name} взял тебя под крыло.`); ctx.sound('success');
      } },
      { t: '🚶 Работать самостоятельно', f: (ctx) => {
        ctx.int += 4; ctx.stress += 5; ctx.log('Ты решил ни от кого не зависеть.'); ctx.sound('click');
      } }
    ]
  },
  {
    text: 'Наставник просит: «Напиши за меня главу. Мне некогда, а тебе — опыт».',
    when: { arc: 'mentor', arcStage: 'found' },
    rareId: 'mentor_test',
    opts: [
      { t: '✍️ Написать', f: (ctx) => {
        ctx.advance('mentor', 'tested'); ctx.bump('mentor', 'bond', 15); ctx.stress += 12; ctx.publications += 1;
        ctx.log('Глава вышла под его именем. Ты получил опыт и соавторство.'); ctx.sound('click');
      } },
      { t: '🚫 Отказаться', f: (ctx) => {
        ctx.advance('mentor', 'tested'); ctx.bump('mentor', 'bond', -15); ctx.stress += 5;
        ctx.log('Он обиделся, но ты сохранил своё время.'); ctx.sound('fail');
      } }
    ]
  },
  {
    text: 'Наставник предлагает выдвинуть тебя на крупную премию. Но половина лавров достанется ему.',
    when: { arc: 'mentor', arcStage: ['found', 'tested'], minAge: 30 },
    rareId: 'mentor_support',
    opts: [
      { t: '🤝 Согласиться', f: (ctx) => {
        ctx.advance('mentor', 'supported'); ctx.bump('mentor', 'bond', 10);
        ctx.rep = Math.min(100, ctx.rep + 12); ctx.money += 40000;
        ctx.log('Премия получена — пополам.'); ctx.sound('success');
      } },
      { t: '🔬 Отказаться и идти самому', f: (ctx) => {
        ctx.advance('mentor', 'supported'); ctx.bump('mentor', 'bond', -10); ctx.stress += 8;
        ctx.log('Ты решил добиваться всего сам.'); ctx.sound('click');
      } }
    ]
  },
  {
    text: 'Наставник тяжело заболел. Врачи говорят — месяцы, не годы.',
    when: { arc: 'mentor', arcStage: ['supported', 'tested'], minAge: 45 },
    rareId: 'mentor_ill',
    opts: [
      { t: '🏥 Быть рядом', f: (ctx) => {
        ctx.advance('mentor', 'ill'); ctx.bump('mentor', 'bond', 20); ctx.stress += 12;
        if (ctx.money >= 30000) { ctx.money -= 30000; ctx.log('Ты оплатил лечение и уход.'); }
        ctx.log('Ты проводил с ним каждый свободный вечер.'); ctx.sound('click');
      } },
      { t: '📅 Навещать по выходным', f: (ctx) => {
        ctx.advance('mentor', 'ill'); ctx.bump('mentor', 'bond', 5); ctx.log('Ты старался успевать.'); ctx.sound('click');
      } }
    ]
  },
  {
    text: 'Наставник ушёл. На поминках его вдова передаёт тебе ключи от лаборатории.',
    when: { arc: 'mentor', arcStage: 'ill', minAge: 50 },
    rareId: 'mentor_legacy',
    opts: [
      { t: '🔑 Принять лабораторию', f: (ctx) => {
        ctx.advance('mentor', 'legacy'); ctx.influence += 10; ctx.rep = Math.min(100, ctx.rep + 15);
        ctx.ach('mentor'); ctx.log('Ты продолжил его дело. Лаборатория теперь твоя.'); ctx.sound('levelup');
      } },
      { t: '📚 Передать школе его имя', f: (ctx) => {
        ctx.advance('mentor', 'legacy'); ctx.rep = Math.min(100, ctx.rep + 8); ctx.influence += 5;
        ctx.log('Ты назвал научную школу его именем.'); ctx.sound('success');
      } }
    ]
  },

  // ============================================================
  // ДРУГ / ХЕЙТЕР / СОУЧАТОР / ХОББИ
  // ============================================================
  {
    text: 'Ты познакомился с весёлым студентом — кажется, вы станете друзьями.',
    when: { minAge: 17, maxAge: 25, stage: 'uni', noArc: 'friend' },
    rareId: 'friend_start', arcMinor: true,
    opts: [
      { t: '👥 Стать друзьями', f: (ctx) => {
        ctx.setArc('friend', { name: 'Макс', stage: 'met', years: 0 });
        ctx.charm += 3; ctx.log('Нашли друга!'); ctx.ach('friend'); ctx.sound('success');
      } },
      { t: '🚶 Отказаться', f: (ctx) => { ctx.log('Отказ.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Твой друг Макс попал в беду и просит денег в долг.',
    when: { arc: 'friend', arcStage: 'met', minAge: 20 },
    rareId: 'friend_help', arcMinor: true,
    opts: [
      { t: '💵 Помочь (10 000 ₽)', f: (ctx) => {
        if (ctx.money < 10000) { ctx.log('Нет денег.'); return; }
        ctx.money -= 10000; ctx.charm += 5; ctx.log('Помог другу.'); ctx.sound('success');
      } },
      { t: '🚶 Отказать', f: (ctx) => { ctx.advance('friend', 'lost'); ctx.charm = Math.max(0, ctx.charm - 3); ctx.log('Отказал.'); ctx.sound('fail'); } }
    ]
  },
  {
    text: 'В сети появился блогер, который критикует твои работы.',
    when: { minAge: 25, maxAge: 50, rep: 30, noArc: 'hater' },
    rareId: 'hater_start', arcMinor: true,
    opts: [
      { t: '😠 Ответить публично', f: (ctx) => {
        ctx.setArc('hater', { name: 'Критик', stage: 'active', years: 0 });
        ctx.stress += 10; ctx.log('Ответил.'); ctx.sound('fail');
      } },
      { t: '😌 Игнорировать', f: (ctx) => {
        ctx.setArc('hater', { name: 'Критик', stage: 'ignored', years: 0 });
        ctx.log('Игнорирую.'); ctx.sound('click');
      } }
    ]
  },
  {
    text: 'Хейтер написал разгромную статью о тебе в научном журнале.',
    when: { arc: 'hater', arcStage: 'active', minAge: 28 },
    rareId: 'hater_attack', arcMinor: true,
    opts: [
      { t: '⚖️ Судиться', f: (ctx) => {
        if (ctx.money < 50000) { ctx.rep = Math.max(0, ctx.rep - 15); ctx.log('Проиграл из-за нехватки денег.'); ctx.sound('fail'); return; }
        ctx.money -= 50000; ctx.rep = Math.min(100, ctx.rep + 10); ctx.advance('hater', 'defeated');
        ctx.log('Выиграл суд!'); ctx.ach('hater'); ctx.sound('success');
      } },
      { t: '📝 Ответить статьёй', f: (ctx) => {
        if (ctx.int > 60 && ctx.skills.write > 30) { ctx.rep = Math.min(100, ctx.rep + 15); ctx.advance('hater', 'defeated'); ctx.log('Ответил достойно!'); ctx.ach('hater'); ctx.sound('success'); }
        else { ctx.rep = Math.max(0, ctx.rep - 10); ctx.log('Ответ слабый.'); ctx.sound('fail'); }
      } }
    ]
  },
  {
    text: 'Коллега предложил совместный проект — вместе вы сильнее.',
    when: { minAge: 25, maxAge: 45, stage: ['phd', 'career'], noArc: 'coauthor' },
    rareId: 'coauthor_start', arcMinor: true,
    opts: [
      { t: '🤝 Согласиться', f: (ctx) => {
        ctx.setArc('coauthor', { name: 'Елена', stage: 'working', years: 0, progress: 0 });
        ctx.log('Совместный проект!'); ctx.ach('coauthor'); ctx.sound('success');
      } },
      { t: '🚶 Отказаться', f: (ctx) => { ctx.log('Отказ.'); ctx.sound('click'); } }
    ]
  },
  {
    text: 'Совместная статья с Еленой почти готова. Нужен последний рывок.',
    when: { arc: 'coauthor', arcStage: 'working', minAge: 27 },
    rareId: 'coauthor_finish', arcMinor: true,
    opts: [
      { t: '💪 Доработать (стресс +, публикация +2)', f: (ctx) => {
        ctx.stress += 15; ctx.publications += 2; ctx.rep = Math.min(100, ctx.rep + 10);
        ctx.advance('coauthor', 'done'); ctx.log('Статья готова! +2 публикации'); ctx.sound('success');
      } },
      { t: '🚶 Бросить проект', f: (ctx) => { ctx.advance('coauthor', 'failed'); ctx.log('Проект заморожен.'); ctx.sound('fail'); } }
    ]
  },
  {
    text: 'Ты увлёкся новым хобби (🎨 рисование / 🎸 музыка / 🏔️ туризм).',
    when: { minAge: 18, maxAge: 55, noArc: 'hobby' },
    rareId: 'hobby_start', arcMinor: true,
    opts: [
      { t: '🎨 Рисование', f: (ctx) => { ctx.setArc('hobby', { name: 'Рисование', icon: '🎨', stage: 'active', years: 0 }); ctx.stress = Math.max(0, ctx.stress - 15); ctx.log('Увлёкся рисованием.'); ctx.ach('hobby'); ctx.sound('success'); } },
      { t: '🎸 Музыка', f: (ctx) => { ctx.setArc('hobby', { name: 'Музыка', icon: '🎸', stage: 'active', years: 0 }); ctx.charm += 5; ctx.log('Увлёкся музыкой.'); ctx.ach('hobby'); ctx.sound('success'); } },
      { t: '🏔️ Туризм', f: (ctx) => { ctx.setArc('hobby', { name: 'Туризм', icon: '🏔️', stage: 'active', years: 0 }); ctx.health += 10; ctx.log('Увлёкся туризмом.'); ctx.ach('hobby'); ctx.sound('success'); } }
    ]
  },
  {
    text: 'Хобби отнимает много времени, но приносит радость. Продолжать?',
    when: { arc: 'hobby', arcStage: 'active', minAge: 25 },
    rareId: 'hobby_check', arcMinor: true,
    opts: [
      { t: '✅ Продолжать (−энергия, −стресс)', f: (ctx) => {
        ctx.energy = Math.max(2, ctx.energy - 1); ctx.stress = Math.max(0, ctx.stress - 20);
        ctx.log('Продолжаешь хобби.'); ctx.sound('success');
      } },
      { t: '❌ Бросить (фокус на науке)', f: (ctx) => {
        ctx.advance('hobby', 'quit'); ctx.int += 3; ctx.log('Бросил хобби ради науки.'); ctx.sound('click');
      } }
    ]
  }
];
