export const backstoryEvents = [
  {
    text:'В детдоме старшие отбирают твои вещи.',
    when:{flag:'orphan',maxAge:16},
    rare:true, rareId:'orphan_fight',
    opts:[
      {t:'🛡️ Дать отпор',f:(ctx)=>{ctx.charm+=5;ctx.stress+=10;ctx.log('🛡️ Отпор!');ctx.ach('comeback');ctx.sound('success');}},
      {t:'😔 Промолчать',f:(ctx)=>{ctx.charm=Math.max(0,ctx.charm-2);ctx.log('😔 Промолчал.');ctx.sound('fail');}}
    ]
  },
  {
    text:'Мать не может оплатить тебе экскурсию.',
    when:{flag:'poorStart',maxAge:16},
    rare:true, rareId:'poor_trip',
    opts:[
      {t:'💰 Отказаться от поездки',f:(ctx)=>{ctx.stress+=5;ctx.log('Остался дома.');ctx.sound('fail');}},
      {t:'🛵 Подработать на поездку',f:(ctx)=>{ctx.money=Math.max(0,ctx.money-100);ctx.charm+=3;ctx.log('Заработал!');ctx.sound('success');}}
    ]
  },
  {
    text:'Отец предлагает дорогую игрушку, но ты хотел книгу.',
    when:{flag:'richStart',maxAge:16},
    rare:true, rareId:'rich_choice',
    opts:[
      {t:'🎮 Игрушка',f:(ctx)=>{ctx.charm+=3;ctx.log('Игрушка.');ctx.sound('click');}},
      {t:'📚 Книга',f:(ctx)=>{ctx.int+=5;ctx.log('Книга.');ctx.sound('success');}}
    ]
  },
  {
    text:'Одноклассники смеются над тобой за странность.',
    when:{flag:'prodigy',minAge:10,maxAge:16},
    rare:true, rareId:'prodigy_bully',
    opts:[
      {t:'😤 Замкнуться',f:(ctx)=>{ctx.int+=5;ctx.charm=Math.max(0,ctx.charm-5);ctx.log('Ушёл в себя.');ctx.sound('click');}},
      {t:'🤝 Подружиться',f:(ctx)=>{ctx.charm+=5;ctx.stress+=5;ctx.log('Подружился.');ctx.sound('success');}}
    ]
  },
  {
    text:'Тренер зовёт тебя в профессиональный спорт.',
    when:{flag:'athlete',minAge:13,maxAge:18},
    rare:true, rareId:'athlete_call',
    opts:[
      {t:'🏋️ Согласиться',f:(ctx)=>{ctx.health+=15;ctx.int=Math.max(0,ctx.int-8);ctx.log('Выбрал спорт.');ctx.sound('click');}},
      {t:'📚 Отказаться',f:(ctx)=>{ctx.int+=5;ctx.log('Выбрал науку.');ctx.sound('success');}}
    ]
  }
];