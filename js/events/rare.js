export const rareEvents = [
  {
    text:'Ты попал в аварию, но отделался лёгким испугом.',
    when:{minAge:18}, rare:true, rareId:'accident',
    opts:[
      {t:'😨 Переосмыслить жизнь',f:(ctx)=>{ctx.stress=Math.max(0,ctx.stress-20);ctx.health-=10;ctx.log('😨 Переосмыслил.');ctx.sound('fail');}},
      {t:'🏥 Обратиться к врачу',f:(ctx)=>{ctx.money=Math.max(0,ctx.money-5000);ctx.health-=3;ctx.log('🏥 Врач.');ctx.sound('click');}}
    ]
  },
  {
    text:'Ты встретил на улице старого друга детства.',
    when:{minAge:20}, rare:true, rareId:'oldfriend',
    opts:[
      {t:'🍺 Посидеть в баре',f:(ctx)=>{ctx.charm+=3;ctx.money=Math.max(0,ctx.money-1000);ctx.stress=Math.max(0,ctx.stress-10);ctx.log('🍺 Вспомнил детство.');ctx.sound('click');}},
      {t:'🚶 Спешить',f:(ctx)=>{ctx.log('Спешил.');ctx.sound('click');}}
    ]
  },
  {
    text:'Тебе предложили купить лотерейный билет (1000 ₽).',
    when:{minAge:18,maxAge:65}, rare:true, rareId:'lottery',
    opts:[
      {t:'🎰 Купить',f:(ctx)=>{
        if(ctx.money<1000){ctx.log('Нет денег.');return;}
        ctx.money-=1000;
        const r=Math.random();
        if(r<0.01){ctx.money+=100000;ctx.log('🎉 ДЖЕКПОТ! +100 000 ₽');ctx.sound('success');}
        else if(r<0.1){ctx.money+=3000;ctx.log('🎉 Выигрыш.');ctx.sound('coin');}
        else{ctx.log('😞 Пусто.');ctx.sound('fail');}
      }},
      {t:'🚶 Не покупать',f:(ctx)=>{ctx.log('Не купил.');ctx.sound('click');}}
    ]
  },
  {
    text:'У тебя угнали велосипед.',
    when:{minAge:10,maxAge:30}, rare:true, rareId:'bike',
    opts:[
      {t:'😤 Подать заявление',f:(ctx)=>{ctx.stress+=8;ctx.charm+=2;ctx.log('😤 Заявление.');ctx.sound('click');}},
      {t:'😔 Смириться',f:(ctx)=>{ctx.stress+=4;ctx.money=Math.max(0,ctx.money-2000);ctx.log('😔 Смирился.');ctx.sound('fail');}}
    ]
  }
];