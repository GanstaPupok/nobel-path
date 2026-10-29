export const SAVE_KEY = 'nobel_path_v6';
export const THEME_KEY = 'nobel_theme';
export const SOUND_KEY = 'nobel_sound';

export const SKILLS = ['math','chem','bio','it','write'];
export const SKILL_NAMES = {math:'Математика',chem:'Химия',bio:'Биология',it:'IT',write:'Письмо'};

export const AVATARS_M = ['🧒','👦','🧑','👨','🧑‍🎓','🧑‍🔬','👨‍🔬','👨‍🏫','👨‍💼','👴'];
export const AVATARS_F = ['🧒','👧','🧑','👩','🧑‍🎓','🧑‍🔬','👩‍🔬','👩‍🏫','👩‍💼','👵'];

export const STAGES = {
  child: {name:'Детство', minAge:7, maxAge:17},
  uni: {name:'Университет', minAge:17, maxAge:23},
  phd: {name:'Аспирантура', minAge:23, maxAge:30},
  career: {name:'Карьера', minAge:30, maxAge:70}
};

export const SPEC_NAMES = {phys:'Физик',bio:'Биолог',it:'Программист'};

export const BACKSTORIES = {
  worker:{
    id:'worker', icon:'🏭', title:'Сын рабочего',
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
    id:'orphan', icon:'🏠', title:'Воспитанник детдома',
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
  olymp:{icon:'🥇',name:'Олимпиадник'},
  first_pub:{icon:'📝',name:'Первая публикация'},
  first_grant:{icon:'💰',name:'Первый грант'},
  first_disc:{icon:'💥',name:'Первое открытие'},
  big_science:{icon:'🌌',name:'Big Science'},
  five_pubs:{icon:'📚',name:'Плодовитый автор'},
  ten_pubs:{icon:'📖',name:'Научный гигант'},
  abroad:{icon:'✈️',name:'За границей'},
  book:{icon:'📕',name:'Автор книги'},
  award:{icon:'🏆',name:'Престижная премия'},
  director:{icon:'🏛️',name:'Директор НИИ'},
  nobel:{icon:'🥇',name:'Нобель'},
  rich:{icon:'💎',name:'Миллионер'},
  healthy:{icon:'💪',name:'Здоровяк'},
  genius:{icon:'🧠',name:'Гений'},
  survivor:{icon:'🛡️',name:'Выживший'},
  married:{icon:'❤️',name:'Семьянин'},
  parent:{icon:'👶',name:'Родитель'},
  published:{icon:'📰',name:'Медийный'},
  polyglot:{icon:'🌍',name:'Международник'},
  lucky:{icon:'🍀',name:'Счастливчик'},
  unlucky:{icon:'💀',name:'Невезучий'},
  selfmade:{icon:'🔨',name:'Самородок'},
  comeback:{icon:'🔥',name:'Восставший из пепла'},
  mentor:{icon:'🧑‍🏫',name:'Наставник'},
  parent_arc:{icon:'🏡',name:'Семьянин-2'},
  arc_love:{icon:'💞',name:'Настоящая любовь'},
  arc_family:{icon:'👨‍👩‍👧',name:'Династия'},
  arc_rival:{icon:'⚔️',name:'Победитель соперника'},
  arc_secret:{icon:'🕵️',name:'Хранитель тайны'},
  friend:{icon:'👥',name:'Верный друг'},
  hater:{icon:'😠',name:'Прошёл через хейт'},
  coauthor:{icon:'🤝',name:'Соавтор'},
  hobby:{icon:'🎨',name:'Хобби'},
  quiz_master:{icon:'🎓',name:'Знаток'},
  puzzle_master:{icon:'🧩',name:'Лаборант-виртуоз'},
  defense_master:{icon:'🛡️',name:'Защитник'},
  quest_hero:{icon:'⭐',name:'Герой квестов'},
  tree_master:{icon:'🌳',name:'Мудрец'}
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
    desc: 'Ты пишешь статьи в два раза быстрее.', effect: 'Написание статьи требует на 5 стресса меньше', cost: 2
  },
  rival_master: {
    id: 'rival_master', icon: '⚔️', title: 'Интриган',
    desc: 'Ты всегда на шаг впереди конкурентов.', effect: '+10 к Репутации сразу', cost: 3
  },
  stress_resist: {
    id: 'stress_resist', icon: '🧘', title: 'Дзен',
    desc: 'Ты сохраняешь спокойствие в любой ситуации.', effect: '-10 к Стрессу сразу', cost: 1
  }
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
