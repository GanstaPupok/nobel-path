export const commonEvents = [
  {
    text:'Ты нашёл старую книгу по квантовой физике на чердаке.',
    when:{maxAge:17},
    opts:[
      {t:'📖 Прочитать (+5 интеллект)',f:(ctx)=>{ctx.int+=5;ctx.log('+5 интеллекта.');ctx.sound('success');}},
      {t:'💵 Продать (+500 ₽)',f:(ctx)=>{ctx.money+=500;ctx.log('+500 ₽.');ctx.sound('coin');}}
    ]
  },
  {
    text:'Учитель предложил участвовать в олимпиаде.',
    when:{minAge:10,maxAge:17},
    opts:[
      {t:'🏆 Участвовать (риск)',f:(ctx)=>{
        if(ctx.d20()>10){ctx.int+=10;ctx.rep+=5;ctx.log('🏆 Победа!');ctx.ach('olymp');ctx.sound('success');}
        else{ctx.stress+=10;ctx.log('😞 Проиграл.');ctx.sound('fail');}
      }},
      {t:'🚶 Отказаться',f:(ctx)=>{ctx.log('Отказ.');ctx.sound('click');}}
    ]
  },
  {
    text:'Внезапная простуда перед сессией.',
    when:{minAge:16,maxAge:30,stage:'uni'},
    opts:[
      {t:'😷 Перетерпеть (−10 здоровье)',f:(ctx)=>{ctx.health-=10;ctx.log('🤒 Переболел.');ctx.sound('fail');}},
      {t:'🏥 Больничный (стресс −20)',f:(ctx)=>{ctx.stress=Math.max(0,ctx.stress-20);ctx.log('🏥 Отлежался.');ctx.sound('click');}}
    ]
  },
  {
    text:'На улице ты встретил бездомного, который просит денег.',
    when:{minAge:10,maxAge:70},
    opts:[
      {t:'💵 Дать 100 ₽ (+харизма)',f:(ctx)=>{
        if(ctx.money>=100){ctx.money-=100;ctx.charm+=2;ctx.log('🤝 Помог.');ctx.sound('success');}
        else ctx.log('Денег нет.');
      }},
      {t:'🚶 Пройти мимо',f:(ctx)=>{ctx.log('Прошёл мимо.');ctx.sound('click');}}
    ]
  },
  {
    text:'Ночной марафон сериала vs подготовка к экзамену.',
    when:{minAge:14,maxAge:22},
    opts:[
      {t:'📺 Сериал (−стресс, −интеллект)',f:(ctx)=>{ctx.stress=Math.max(0,ctx.stress-15);ctx.int=Math.max(0,ctx.int-2);ctx.log('📺 Сериал.');ctx.sound('click');}},
      {t:'📚 Подготовка (+интеллект, +стресс)',f:(ctx)=>{ctx.int+=4;ctx.stress+=8;ctx.log('📚 Подготовился.');ctx.sound('success');}}
    ]
  },
  {
    text:'На конференции тебя раскритиковали в пух и прах.',
    when:{minAge:20,maxAge:55},
    opts:[
      {t:'💪 Принять критику',f:(ctx)=>{ctx.int+=5;ctx.stress+=10;ctx.log('💪 Воспринял.');ctx.sound('success');}},
      {t:'😤 Спорить',f:(ctx)=>{ctx.charm=Math.max(0,ctx.charm-3);ctx.stress+=15;ctx.log('😤 Поспорил.');ctx.sound('fail');}}
    ]
  },
  {
    text:'В лаборатории произошла утечка химикатов.',
    when:{stage:'phd'},
    opts:[
      {t:'🦸 Устранить самому',f:(ctx)=>{ctx.health-=15;ctx.rep+=8;ctx.log('🦸 Предотвратил!');ctx.sound('success');}},
      {t:'📞 Вызвать службу',f:(ctx)=>{ctx.log('Служба приехала.');ctx.sound('click');}}
    ]
  },
  {
    text:'Тебе предложили продать разработку корпорации.',
    when:{minAge:25,maxAge:60,stage:['phd','career']},
    opts:[
      {t:'💰 Продать',f:(ctx)=>{ctx.money+=200000;ctx.rep=Math.max(0,ctx.rep-15);ctx.log('💰 +200 000 ₽');ctx.sound('coin');}},
      {t:'🔬 Оставить в науке',f:(ctx)=>{ctx.rep+=10;ctx.log('🔬 Открыто.');ctx.sound('success');}}
    ]
  },
  {
    text:'Ты выиграл конкурс молодых учёных!',
    when:{minAge:20,maxAge:35,stage:['uni','phd']},
    opts:[
      {t:'🎉 Принять приз',f:(ctx)=>{ctx.money+=30000;ctx.rep+=10;ctx.log('🏆 Выиграл!');ctx.sound('success');}}
    ]
  },
  {
    text:'Плагиат: коллега украл твою идею.',
    when:{minAge:23,maxAge:60,stage:['phd','career']},
    opts:[
      {t:'⚖️ Бороться',f:(ctx)=>{ctx.stress+=20;ctx.rep+=10;ctx.log('⚖️ Отстоял!');ctx.sound('success');}},
      {t:'🤐 Промолчать',f:(ctx)=>{ctx.rep=Math.max(0,ctx.rep-5);ctx.log('🤐 Промолчал.');ctx.sound('fail');}}
    ]
  },
  {
    text:'Тебе предложили написать научно-популярную книгу.',
    when:{minAge:25,maxAge:65,stage:['phd','career']},
    cond:(ctx)=>ctx.skills.write>20,
    opts:[
      {t:'✍️ Написать',f:(ctx)=>{ctx.money+=40000;ctx.rep+=10;ctx.skills.write+=5;ctx.log('📕 Книга!');ctx.ach('book');ctx.sound('success');}},
      {t:'🚶 Отказаться',f:(ctx)=>{ctx.log('Отказ.');ctx.sound('click');}}
    ]
  },
  {
    text:'Ты получил грант на стажировку за границей!',
    when:{minAge:23,maxAge:40,stage:['phd','career']},
    opts:[
      {t:'✈️ Поехать',f:(ctx)=>{ctx.int+=10;ctx.rep+=10;ctx.charm+=3;ctx.log('✈️ За границей!');ctx.ach('abroad');ctx.sound('success');}},
      {t:'🚶 Остаться',f:(ctx)=>{ctx.log('Остался.');ctx.sound('click');}}
    ]
  },
  {
    text:'Тебя номинировали на престижную премию.',
    when:{minAge:30,maxAge:65},
    opts:[
      {t:'🏆 Ждать результат',f:(ctx)=>{
        if(ctx.rep>60 && ctx.d20()>8){ctx.money+=150000;ctx.rep+=20;ctx.log('🏆 Премия!');ctx.ach('award');ctx.sound('success');}
        else{ctx.log('😔 Не дали.');ctx.sound('fail');}
      }}
    ]
  },
  {
    text:'Пандемия: все ушли на удалёнку.',
    when:{minAge:20},
    opts:[
      {t:'🏠 Работать из дома',f:(ctx)=>{ctx.stress+=10;ctx.health-=5;ctx.money+=3000;ctx.log('🏠 Из дома.');ctx.sound('fail');}},
      {t:'🚶 Взять паузу',f:(ctx)=>{ctx.stress=Math.max(0,ctx.stress-15);ctx.log('😴 Пауза.');ctx.sound('click');}}
    ]
  },
  {
    text:'Ты случайно открыл побочный эффект эксперимента.',
    when:{stage:['phd','career']},
    opts:[
      {t:'🔬 Изучить',f:(ctx)=>{
        if(ctx.d20()>10){ctx.discoveries++;ctx.rep+=15;ctx.log('💥 Открытие!');ctx.ach('first_disc');ctx.sound('success');}
        else{ctx.log('🔬 Ничего.');ctx.sound('click');}
      }},
      {t:'🤐 Забыть',f:(ctx)=>{ctx.log('Забыл.');ctx.sound('click');}}
    ]
  },
  {
    text:'Тебе предложили участвовать в секретном проекте.',
    when:{stage:'career',minAge:30},
    opts:[
      {t:'🕵️ Согласиться (риск)',f:(ctx)=>{
        if(ctx.d20()>14){ctx.money+=300000;ctx.rep+=15;ctx.log('🕵️ Успех!');ctx.ach('arc_secret');ctx.sound('success');}
        else{ctx.rep=Math.max(0,ctx.rep-20);ctx.health-=15;ctx.log('💀 Провал.');ctx.sound('fail');}
      }},
      {t:'🚶 Отказаться',f:(ctx)=>{ctx.log('Отказ.');ctx.sound('click');}}
    ]
  }
];