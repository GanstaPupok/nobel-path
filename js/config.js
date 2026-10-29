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
