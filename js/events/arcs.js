export const arcEvents = [
  // --- ЛЮБОВЬ ---
  {
    text:'Ты встретил человека, от которого замирает сердце.',
    when:{minAge:20,maxAge:35},
    rare:true, rareId:'love_start',
    opts:[
      {t:'❤️ Подойти',f:(ctx)=>{
        if(ctx.d20()>8){
          ctx.setArc('love',{stage:'dating',years:0,partnerName:'Александра'});
          ctx.charm+=5;ctx.stress=Math.max(0,ctx.stress-10);
          ctx.log('❤️ Начали встречаться!');ctx.sound('success');
        } else {ctx.log('😞 Отказала.');ctx.sound('fail');}
      }},
      {t:'🚶 Пройти мимо',f:(ctx)=>{ctx.log('Мимо.');ctx.sound('click');}}
    ]
  },
  {
    text:'Ты думаешь о предложении руки и сердца.',
    when:{arc:'love',arcStage:'dating',minAge:22},
    rare:true, rareId:'love_marry',
    opts:[
      {t:'💍 Сделать предложение',f:(ctx)=>{
        if(ctx.money>=10000 && ctx.charm>=20){
          ctx.arcs.love.stage='married';ctx.money-=10000;
          ctx.log('💍 Поженились!');ctx.ach('married');ctx.ach('arc_love');ctx.sound('success');
        } else {ctx.log('😔 Она подумает. Нужно больше денег/харизмы.');ctx.sound('fail');}
      }},
      {t:'😴 Подождать',f:(ctx)=>{ctx.log('Подождал.');ctx.sound('click');}}
    ]
  },
  {
    text:'Супруг(а) хочет ребёнка.',
    when:{arc:'love',arcStage:'married',minAge:25},
    rare:true, rareId:'love_kid',
    opts:[
      {t:'👶 Согласиться',f:(ctx)=>{
        ctx.setArc('family',{stage:'kid'});
        ctx.money=Math.max(0,ctx.money-15000);
        ctx.log('👶 Родился ребёнок!');ctx.ach('parent');ctx.ach('parent_arc');ctx.sound('success');
      }},
      {t:'🚶 Отложить',f:(ctx)=>{ctx.log('Отложили.');ctx.sound('click');}}
    ]
  },

  // --- СОПЕРНИК ---
  {
    text:'В лаборатории появился амбициозный коллега — твой будущий соперник.',
    when:{minAge:25,maxAge:40,stage:['phd','career']},
    rare:true, rareId:'rival_start',
    opts:[
      {t:'🤝 Подружиться',f:(ctx)=>{ctx.setArc('rival',{name:'Виктор',stage:'appeared',years:0});ctx.log('🤝 Приятели-соперники.');ctx.sound('click');}},
      {t:'😤 Держать дистанцию',f:(ctx)=>{ctx.setArc('rival',{name:'Виктор',stage:'appeared',years:0});ctx.stress+=5;ctx.log('😤 Дистанция.');ctx.sound('click');}}
    ]
  },
  {
    text:'Соперник Виктор опубликовал статью, похожую на твою.',
    when:{arc:'rival',arcStage:'appeared',minAge:27},
    rare:true, rareId:'rival_clash',
    opts:[
      {t:'⚔️ Публично обвинить',f:(ctx)=>{
        if(ctx.rep>50){ctx.arcs.rival.stage='won';ctx.rep+=15;ctx.log('⚔️ Победил!');ctx.ach('arc_rival');ctx.sound('success');}
        else{ctx.arcs.rival.stage='lost';ctx.rep=Math.max(0,ctx.rep-10);ctx.log('💀 Проиграл.');ctx.sound('fail');}
      }},
      {t:'🤐 Промолчать',f:(ctx)=>{ctx.arcs.rival.stage='won';ctx.rep+=5;ctx.log('Не связался.');ctx.sound('click');}}
    ]
  },

  // --- ДРУГ ---
  {
    text:'Ты познакомился с весёлым студентом — кажется, вы станете друзьями.',
    when:{minAge:17,maxAge:25,stage:'uni'},
    rare:true, rareId:'friend_start',
    opts:[
      {t:'👥 Стать друзьями',f:(ctx)=>{
        ctx.setArc('friend',{name:'Макс',stage:'met',years:0});
        ctx.charm+=3;ctx.log('👥 Нашли друга!');ctx.ach('friend');ctx.sound('success');
      }},
      {t:'🚶 Отказаться',f:(ctx)=>{ctx.log('Отказ.');ctx.sound('click');}}
    ]
  },
  {
    text:'Твой друг Макс попал в беду и просит денег в долг.',
    when:{arc:'friend',arcStage:'met',minAge:20},
    rare:true, rareId:'friend_help',
    opts:[
      {t:'💵 Помочь (10 000 ₽)',f:(ctx)=>{
        if(ctx.money<10000){ctx.log('Нет денег.');return;}
        ctx.money-=10000;ctx.charm+=5;ctx.log('🤝 Помог другу.');ctx.sound('success');
      }},
      {t:'🚶 Отказать',f:(ctx)=>{ctx.arcs.friend.stage='lost';ctx.charm=Math.max(0,ctx.charm-3);ctx.log('😔 Отказал.');ctx.sound('fail');}}
    ]
  },

  // --- ХЕЙТЕР ---
  {
    text:'В сети появился блогер, который критикует твои работы.',
    when:{minAge:25,maxAge:50,rep:30},
    rare:true, rareId:'hater_start',
    opts:[
      {t:'😠 Ответить публично',f:(ctx)=>{
        ctx.setArc('hater',{name:'Критик',stage:'active',years:0});
        ctx.stress+=10;ctx.log('😠 Ответил.');ctx.sound('fail');
      }},
      {t:'😌 Игнорировать',f:(ctx)=>{
        ctx.setArc('hater',{name:'Критик',stage:'ignored',years:0});
        ctx.log('😌 Игнорирую.');ctx.sound('click');
      }}
    ]
  },
  {
    text:'Хейтер написал разгромную статью о тебе в научном журнале.',
    when:{arc:'hater',arcStage:'active',minAge:28},
    rare:true, rareId:'hater_attack',
    opts:[
      {t:'⚖️ Судиться',f:(ctx)=>{
        if(ctx.money>=50000){ctx.money-=50000;ctx.rep+=10;ctx.arcs.hater.stage='defeated';ctx.log('⚖️ Выиграл суд!');ctx.ach('hater');ctx.sound('success');}
        else{ctx.rep=Math.max(0,ctx.rep-15);ctx.log('💀 Проиграл из-за нехватки денег.');ctx.sound('fail');}
      }},
      {t:'😤 Ответить статьёй',f:(ctx)=>{
        if(ctx.int>60 && ctx.skills.write>30){ctx.rep+=15;ctx.arcs.hater.stage='defeated';ctx.log('📝 Ответил достойно!');ctx.ach('hater');ctx.sound('success');}
        else{ctx.rep=Math.max(0,ctx.rep-10);ctx.log('💀 Ответ слабый.');ctx.sound('fail');}
      }}
    ]
  },

  // --- СОАВТОР ---
  {
    text:'Коллега предложил совместный проект — вместе вы сильнее.',
    when:{minAge:25,maxAge:45,stage:['phd','career']},
    rare:true, rareId:'coauthor_start',
    opts:[
      {t:'🤝 Согласиться',f:(ctx)=>{
        ctx.setArc('coauthor',{name:'Елена',stage:'working',years:0,progress:0});
        ctx.log('🤝 Совместный проект!');ctx.ach('coauthor');ctx.sound('success');
      }},
      {t:'🚶 Отказаться',f:(ctx)=>{ctx.log('Отказ.');ctx.sound('click');}}
    ]
  },
  {
    text:'Совместная статья с Еленой почти готова. Нужен последний рывок.',
    when:{arc:'coauthor',arcStage:'working',minAge:27},
    rare:true, rareId:'coauthor_finish',
    opts:[
      {t:'💪 Доработать (стресс +, публикация +2)',f:(ctx)=>{
        ctx.stress+=15;ctx.publications+=2;ctx.rep+=10;
        ctx.arcs.coauthor.stage='done';
        ctx.log('📝 Статья готова! +2 публикации');ctx.sound('success');
      }},
      {t:'🚶 Бросить проект',f:(ctx)=>{ctx.arcs.coauthor.stage='failed';ctx.log('Проект заморожен.');ctx.sound('fail');}}
    ]
  },

  // --- ХОББИ ---
  {
    text:'Ты увлёкся новым хобби (🎨 рисование / 🎸 музыка / 🏔️ туризм).',
    when:{minAge:18,maxAge:55},
    rare:true, rareId:'hobby_start',
    opts:[
      {t:'🎨 Рисование',f:(ctx)=>{ctx.setArc('hobby',{name:'Рисование',icon:'🎨',stage:'active',years:0});ctx.stress=Math.max(0,ctx.stress-15);ctx.log('🎨 Увлёкся рисованием.');ctx.ach('hobby');ctx.sound('success');}},
      {t:'🎸 Музыка',f:(ctx)=>{ctx.setArc('hobby',{name:'Музыка',icon:'🎸',stage:'active',years:0});ctx.charm+=5;ctx.log('🎸 Увлёкся музыкой.');ctx.ach('hobby');ctx.sound('success');}},
      {t:'🏔️ Туризм',f:(ctx)=>{ctx.setArc('hobby',{name:'Туризм',icon:'🏔️',stage:'active',years:0});ctx.health+=10;ctx.log('🏔️ Увлёкся туризмом.');ctx.ach('hobby');ctx.sound('success');}}
    ]
  },
  {
    text:'Хобби отнимает много времени, но приносит радость. Продолжать?',
    when:{arc:'hobby',arcStage:'active',minAge:25},
    rare:true, rareId:'hobby_check',
    opts:[
      {t:'✅ Продолжать (−энергия, −стресс)',f:(ctx)=>{
        ctx.energy=Math.max(2,ctx.energy-1);ctx.stress=Math.max(0,ctx.stress-20);
        ctx.log('Продолжаешь хобби.');ctx.sound('success');
      }},
      {t:'❌ Бросить (фокус на науке)',f:(ctx)=>{
        ctx.arcs.hobby.stage='quit';ctx.int+=3;
        ctx.log('Бросил хобби ради науки.');ctx.sound('click');
      }}
    ]
  }
];