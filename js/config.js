export const SAVE_KEY = 'nobel_path_v6';
export const SAVE_VERSION = 7;
export const THEME_KEY = 'nobel_theme';
export const SOUND_KEY = 'nobel_sound';

export const SKILLS = ['math','chem','bio','it','write'];
export const SKILL_NAMES = {math:'Математика',chem:'Химия',bio:'Биология',it:'IT',write:'Письмо'};
export const SKILL_ICONS = {math:'🧮',chem:'🧪',bio:'🧬',it:'💻',write:'✍️'};

export const AVATARS_M = ['🧒','👦','🧑','👨','🧑‍🎓','🧑‍🔬','👨‍🔬','👨‍🏫','👨‍💼','👴'];
export const AVATARS_F = ['🧒','👧','🧑','👩','🧑‍🎓','🧑‍🔬','👩‍🔬','👩‍🏫','👩‍💼','👵'];

export const STAGES = {
  child: {name:'Детство', minAge:7, maxAge:17},
  uni: {name:'Университет', minAge:17, maxAge:23},
  phd: {name:'Аспирантура', minAge:23, maxAge:30},
  career: {name:'Карьера', minAge:30, maxAge:70}
};

export const SPEC_NAMES = {phys:'Физик',bio:'Биолог',it:'Программист'};

// ============================================================
// ЭКОНОМИКА И КАРЬЕРНАЯ ЛЕСТНИЦА
// ============================================================
// Зарплата за одно действие «Работать» на текущей должности.
export const SALARY = {
  'школьник': 0,
  'студент': 0,
  'аспирант': 0,
  'лаборант': 9000,
  'инженер': 11000,
  'м.н.с.': 14000,
  'н.с.': 17000,
  'с.н.с.': 21000,
  'зав. лаб.': 27000,
  'зам. директора': 33000,
  'директор НИИ': 42000
};

// Порядок должностей и требования для повышения.
// rep — репутация, influence — влияние, both нужны для перехода на следующий уровень.
export const POSITION_LADDER = [
  { from:'лаборант',       to:'м.н.с.',         rep:20, influence:0  },
  { from:'инженер',        to:'м.н.с.',         rep:20, influence:0  },
  { from:'м.н.с.',         to:'н.с.',           rep:40, influence:5  },
  { from:'н.с.',           to:'с.н.с.',         rep:55, influence:10 },
  { from:'с.н.с.',         to:'зав. лаб.',      rep:70, influence:16 },
  { from:'зав. лаб.',      to:'зам. директора', rep:80, influence:22 },
  { from:'зам. директора', to:'директор НИИ',   rep:90, influence:30 }
];

// Аренда/бытовые расходы в год. Дети живут с родителями — бесплатно.
export const RENT = [
  { maxAge: 17, sum: 0     },
  { maxAge: 23, sum: 1500  },
  { maxAge: 30, sum: 3000  },
  { maxAge: 38, sum: 5000  },
  { maxAge: 999, sum: 8000 }
];

// Пороги перехода на следующий этап жизни.
export const GATES = {
  uni:    { age: 17, int: 40 },
  phd:    { age: 23, int: 60, publications: 1 },
  career: { age: 30, discoveries: 1 }
};

// Энергия: база + бонусы за здоровье/харизму.
export const ENERGY = { base: 3, healthBonus: 70, charmBonus: 70 };

// ============================================================
// НАУЧНЫЙ ПРОЕКТ — главная долгая цель игры
// ============================================================
// Игрок выбирает направление в вузе (по специализации) и ведёт его
// через три этапа. Каждый этап — открытие, репутация и деньги.
// Прогресс дают действия «Работать над проектом» и события-прорывы.
export const PROJECTS = {
  quantum: {
    id: 'quantum', icon: '⚛️', title: 'Квантовые вычисления', spec: 'phys',
    desc: 'Кубиты, запутанность и квантовое превосходство.',
    tiers: [
      { name: 'Стабильный кубит', need: 120, cost: 1000, rep: 8, money: 12000 },
      { name: 'Квантовый алгоритм', need: 200, cost: 2500, rep: 10, money: 25000 },
      { name: 'Квантовое превосходство', need: 300, cost: 5000, rep: 14, money: 60000 }
    ]
  },
  genome: {
    id: 'genome', icon: '🧬', title: 'Редактирование генома', spec: 'bio',
    desc: 'CRISPR, стволовые клетки и борьба с наследственными болезнями.',
    tiers: [
      { name: 'Точный CRISPR', need: 110, cost: 1200, rep: 8, money: 12000 },
      { name: 'Модель заболевания', need: 200, cost: 3000, rep: 10, money: 25000 },
      { name: 'Терапия для человека', need: 300, cost: 6000, rep: 14, money: 60000 }
    ]
  },
  ai: {
    id: 'ai', icon: '🤖', title: 'Искусственный интеллект', spec: 'it',
    desc: 'Нейросети, интерпретируемость и вычисления на пределе.',
    tiers: [
      { name: 'Работающая архитектура', need: 110, cost: 800, rep: 8, money: 12000 },
      { name: 'Обучение без разметки', need: 200, cost: 2200, rep: 10, money: 25000 },
      { name: 'Общий интеллект', need: 300, cost: 4500, rep: 14, money: 60000 }
    ]
  }
};

// Сколько прогресса проекта даёт одно действие (зависит от лучшего навыка)
export const PROJECT_PROGRESS = { base: 22, perSkill: 6 };

// Условия «нобелевского» финала — нужен завершённый проект и серьёзные показатели
export const NOBEL = { rep: 95, int: 95, discoveries: 5, publications: 8 };


export const BACKSTORIES = {
  worker:{
    id:'worker', icon:'🏭', title:'Рабочая семья',
    desc:'Отец — токарь на заводе, мать — медсестра. В доме нет денег, но есть уважение к труду.',
    bonus:{money:500, health:10},
    flags:{poorStart:true},
    tag:'Бедная семья · +здоровье'
  },
  teacher:{
    id:'teacher', icon:'📚', title:'Ребёнок учителей',
    desc:'Родители — преподаватели. Книги дома повсюду, но денег в обрез.',
    bonus:{money:200, int:8, skills:{write:5}},
    flags:{academicFamily:true},
    tag:'Интеллигенция · +интеллект'
  },
  rich:{
    id:'rich', icon:'💼', title:'Ребёнок бизнесменов',
    desc:'Родители — владельцы фирмы. Денег много, внимания мало.',
    bonus:{money:5000, int:2, charm:5, stress:5},
    flags:{richStart:true},
    tag:'Богатая семья · +деньги'
  },
  orphan:{
    id:'orphan', icon:'🏠', title:'Детдом',
    desc:'Ты вырос без родителей. Всё, что имеешь — это воля и упорство.',
    bonus:{int:3, health:-5, charm:-3, stress:10},
    flags:{orphan:true, toughStart:true},
    tag:'Сирота · тяжёлый старт'
  },
  prodigy:{
    id:'prodigy', icon:'🌟', title:'Вундеркинд',
    desc:'Ты с детства поражал учителей. Но со сверстниками не ладил.',
    bonus:{int:12, charm:-5, stress:5},
    flags:{prodigy:true},
    tag:'Гений · −харизма'
  },
  athlete:{
    id:'athlete', icon:'🏋️', title:'Спортивный ребёнок',
    desc:'Ты с детства в спорте. Здоровье — твоё богатство.',
    bonus:{health:20, int:-3, charm:3, stress:-5},
    flags:{athlete:true},
    tag:'Спортсмен · +здоровье'
  }
};

export const ACHIEVEMENTS = {
  olymp:{icon:'🥇',name:'Победа на олимпиаде'},
  first_pub:{icon:'📝',name:'Первая публикация'},
  first_grant:{icon:'💰',name:'Первый грант'},
  first_disc:{icon:'💥',name:'Первое открытие'},
  big_science:{icon:'🌌',name:'Big Science'},
  five_pubs:{icon:'📚',name:'Пять статей'},
  ten_pubs:{icon:'📖',name:'Десять статей'},
  abroad:{icon:'✈️',name:'Работа за границей'},
  book:{icon:'📕',name:'Автор книги'},
  award:{icon:'🏆',name:'Престижная премия'},
  director:{icon:'🏛️',name:'Директор НИИ'},
  nobel:{icon:'🥇',name:'Нобелевская премия'},
  rich:{icon:'💎',name:'Миллион на счету'},
  healthy:{icon:'💪',name:'Крепкое здоровье'},
  genius:{icon:'🧠',name:'Гений'},
  survivor:{icon:'🛡️',name:'Стальные нервы'},
  married:{icon:'❤️',name:'Семья'},
  parent:{icon:'👶',name:'Родительство'},
  published:{icon:'📰',name:'В центре внимания'},
  polyglot:{icon:'🌍',name:'Связи за рубежом'},
  lucky:{icon:'🍀',name:'Полоса везения'},
  unlucky:{icon:'💀',name:'Полоса невезения'},
  selfmade:{icon:'🔨',name:'Путь снизу'},
  comeback:{icon:'🔥',name:'Второе дыхание'},
  mentor:{icon:'🧑‍🏫',name:'Наставничество'},
  parent_arc:{icon:'🏡',name:'Дружная семья'},
  arc_love:{icon:'💞',name:'Настоящая любовь'},
  arc_family:{icon:'👨‍👩‍👧',name:'Династия'},
  arc_rival:{icon:'⚔️',name:'Победа над соперником'},
  arc_secret:{icon:'🕵️',name:'Тайна сохранена'},
  friend:{icon:'👥',name:'Верный друг'},
  hater:{icon:'😠',name:'Хейт пережит'},
  coauthor:{icon:'🤝',name:'Соавторство'},
  hobby:{icon:'🎨',name:'Хобби'},
  quiz_master:{icon:'🎓',name:'Эрудит'},
  puzzle_master:{icon:'🧩',name:'Мастер пазла'},
  defense_master:{icon:'🛡️',name:'Мастер защиты'},
  quest_hero:{icon:'⭐',name:'Мастер квестов'},
  tree_master:{icon:'🌳',name:'Мудрость'},
  project_start:{icon:'💡',name:'Своя тема'},
  project_done:{icon:'🚀',name:'Научный прорыв'},
  professor:{icon:'🎓',name:'Профессор'},
  lecturer:{icon:'🎤',name:'Лектор'},
  patent:{icon:'🧾',name:'Патент'},
  legend:{icon:'👑',name:'Легенда'}
};

// ============================================================
// НАСЛЕДИЕ (МЕТА-ПРОГРЕССИЯ)
// ============================================================
export const LEGACY_PERKS = {
  money: {
    id:'money', icon:'💰', title:'Семейный капитал', 
    desc:'Ты родился в семье с сбережениями.',
    cost: 100, effect:{ money: 10000 }, maxLevel: 3
  },
  intellect: {
    id:'intellect', icon:'🧠', title:'Гены гения', 
    desc:'Твои родители были очень умны.',
    cost: 150, effect:{ int: 5 }, maxLevel: 5
  },
  health: {
    id:'health', icon:'💪', title:'Крепкое здоровье', 
    desc:'Хорошая наследственность.',
    cost: 120, effect:{ health: 15 }, maxLevel: 3
  },
  charm: {
    id:'charm', icon:'🗣️', title:'Обаяние', 
    desc:'Ты умеешь нравиться людям с детства.',
    cost: 150, effect:{ charm: 5 }, maxLevel: 3
  },
  energy: {
    id:'energy', icon:'⚡', title:'Выносливость', 
    desc:'Тебе нужно меньше времени на отдых.',
    cost: 300, effect:{ energy: 1 }, maxLevel: 2
  }
};

// ============================================================
// ДЕРЕВО НАВЫКОВ
// ============================================================
export const SKILL_TREE = {
  prodigy: {
    id: 'prodigy', icon: '🧠', title: 'Врождённый талант',
    desc: 'Ты схватываешь всё на лету.', effect: '+10 к Интеллекту сразу', cost: 1
  },
  workaholic: {
    id: 'workaholic', icon: '☕', title: 'Трудоголик',
    desc: 'Ты работаешь без устали, но сильно устаёшь.', effect: '+1 Энергия, +5 Стресс', cost: 2
  },
  speaker: {
    id: 'speaker', icon: '🎙️', title: 'Оратор',
    desc: 'Ты умеешь убеждать людей.', effect: '+10 к Харизме сразу', cost: 1
  },
  lucky_grants: {
    id: 'lucky_grants', icon: '💰', title: 'Грантоед',
    desc: 'Ты знаешь, как выбивать деньги.', effect: 'Гранты приносят в 2 раза больше денег', cost: 3
  },
  iron_health: {
    id: 'iron_health', icon: '🛡️', title: 'Железное здоровье',
    desc: 'Ты никогда не болеешь.', effect: '+20 к Здоровью сразу', cost: 2
  },
  genius_pub: {
    id: 'genius_pub', icon: '📝', title: 'Скорочтение',
    desc: 'Ты пишешь статьи на лету.', effect: 'Статьи в аспирантуре не добавляют стресс', cost: 2
  },
  rival_master: {
    id: 'rival_master', icon: '⚔️', title: 'Интриган',
    desc: 'Ты всегда на шаг впереди конкурентов.', effect: '+10 к Репутации сразу', cost: 3
  },
  stress_resist: {
    id: 'stress_resist', icon: '🧘', title: 'Дзен',
    desc: 'Ты сохраняешь спокойствие в любой ситуации.', effect: '-10 к Стрессу сразу', cost: 1
  }
};

// ============================================================
// ГЛОБАЛЬНЫЕ КРИЗИСЫ (МИРОВЫЕ СОБЫТИЯ)
// ============================================================
export const GLOBAL_EVENTS = {
  funding_crisis: {
    id: 'funding_crisis', icon: '📉', title: 'Кризис финансирования',
    desc: 'Государство урезало бюджет на науку. Гранты дают реже, зарплаты падают.',
    duration: 4,
    effects: { grantMoney: 0.2, salary: 0.6 }
  },
  revolution: {
    id: 'revolution', icon: '🚀', title: 'Научная революция',
    desc: 'Прорыв в технологиях! Открытия даются легче, но конкуренция выросла.',
    duration: 3,
    effects: { discoveryChance: 1.5, stress: 1.5 }
  },
  pandemic: {
    id: 'pandemic', icon: '🦠', title: 'Пандемия',
    desc: 'Мир на карантине. Учёные нужны как никогда, но здоровье под угрозой.',
    duration: 2,
    effects: { health: 0.7, grantMoney: 2.0 }
  },
  brain_drain: {
    id: 'brain_drain', icon: '✈️', title: 'Утечка мозгов',
    desc: 'Многие учёные уехали за границу. Освободились должности, но репутация упала.',
    duration: 5,
    effects: { promotionChance: 1.5, rep: 0.8 }
  }
};
