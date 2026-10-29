import { S, addLog } from './state.js';
import { playSound } from './audio.js';
import { addAchievement } from './achievements.js';
import { clamp } from './utils.js';
import { SKILLS, SALARY, POSITION_LADDER, PROJECTS } from './config.js';
import { getGlobalModifier } from './world.js';
import { addSkillPoint } from './skills.js';
import { chronicle } from './chronicle.js';
import { currentTier, addProjectProgress, progressPerAction, startProjectForSpec, projectDef } from './project.js';
import { JOURNAL_TIERS, canSubmit, submitPaper } from './publishing.js';

function rndSkill() { return SKILLS[Math.floor(Math.random() * SKILLS.length)]; }
const d20 = () => Math.floor(Math.random() * 20) + 1;

const RANK = {
  'школьник': 0, 'студент': 0, 'аспирант': 1, 'лаборант': 0, 'инженер': 0,
  'м.н.с.': 2, 'н.с.': 3, 'с.н.с.': 4, 'зав. лаб.': 5, 'зам. директора': 6, 'директор НИИ': 7
};
const rank = () => RANK[S.position] ?? 0;

/**
 * Собирает действия на текущий год.
 * opts: { moneyCost, req, reqText, group } — деньги, условия и группа в интерфейсе.
 */
export function getActions() {
  const left = S.energy - S.actedThisYear;
  const acts = [];

  const add = (name, desc, cost, fn, cls = '', opts = {}) => {
    const moneyCost = opts.moneyCost || 0;
    const hasMoney = S.money >= moneyCost;
    const meetsReq = opts.req === undefined ? true : !!opts.req;
    const disabled = left < cost || !hasMoney || !meetsReq;

    let hint = desc;
    if (moneyCost) hint += ` · 💰 ${moneyCost} ₽`;
    if (!meetsReq && opts.reqText) hint += ` · 🔒 ${opts.reqText}`;

    acts.push({ name, desc: hint, cost, fn, cls, disabled, group: opts.group || 'science' });
  };

  const projectAction = (group, desc = 'Прогресс темы, навык +2') => {
    const tier = currentTier();
    if (!tier) return;
    const gain = progressPerAction();
    add('📊 Работать над проектом', `${desc} (+${gain})`, 1, () => {
      const msgs = addProjectProgress(gain);
      S.skills[rndSkill()] += 2;
      S.stress = clamp(S.stress + 6, 0, 100);
      addLog(`Работал над темой «${tier.name}».`);
      msgs.forEach(m => addLog(m));
      playSound(msgs.length ? 'success' : 'click');
    }, 'special', { moneyCost: tier.cost, group });
  };

  // ============ ДЕТСТВО ============
  if (S.stage === 'child') {
    add('📚 Учиться в школе', 'Интеллект +3, стресс +4', 1, () => {
      S.int += 3; S.stress = clamp(S.stress + 4, 0, 100); addLog('Учился в школе.'); playSound('click');
    });
    add('📖 Читать научные книги', 'Интеллект +5, навык +2', 1, () => {
      S.int += 5; S.skills[rndSkill()] += 2; S.stress = clamp(S.stress + 2, 0, 100);
      addLog('Читал научные книги.'); playSound('click');
    });
    add('🤖 Кружок робототехники', 'IT +4, интеллект +2, харизма +1', 1, () => {
      S.skills.it += 4; S.int += 2; S.charm += 1; S.stress = clamp(S.stress + 3, 0, 100);
      addLog('Собирал роботов в кружке.'); playSound('click');
    }, '', { req: S.int >= 30, reqText: 'нужно 30 интеллекта' });

    add('🎈 Гулять с друзьями', 'Харизма +3, стресс −10', 1, () => {
      S.charm += 3; S.stress = clamp(S.stress - 10, 0, 100); addLog('Гулял с друзьями.'); playSound('click');
    }, '', { group: 'life' });
    add('🏃 Спорт', 'Здоровье +10, стресс −10', 1, () => {
      S.health = clamp(S.health + 10, 0, 100); S.stress = clamp(S.stress - 10, 0, 100);
      addLog('Занимался спортом.'); playSound('click');
    }, 'safe', { group: 'life' });
    add('🛵 Подработка (курьер)', 'Деньги +400, здоровье −5', 1, () => {
      S.money += 400; S.health = clamp(S.health - 5, 0, 100); addLog('Развозил заказы.'); playSound('coin');
    }, '', { group: 'life' });

    if (S.flags.poorStart) {
      add('🧹 Мыть полы', 'Деньги +200, здоровье −2', 1, () => {
        S.money += 200; S.health = clamp(S.health - 2, 0, 100); addLog('Убирался.'); playSound('coin');
      }, '', { group: 'life' });
    }
    if (S.flags.academicFamily) {
      add('📝 Писать сочинения', 'Письмо +4, интеллект +2', 1, () => {
        S.skills.write += 4; S.int += 2; addLog('Писал сочинения.'); playSound('click');
      }, '', { group: 'life' });
    }
    if (S.flags.richStart) {
      add('🎹 Кружок', 'Харизма +3, интеллект +2', 1, () => {
        S.charm += 3; S.int += 2; addLog('Ходил на кружок.'); playSound('click');
      }, '', { group: 'life' });
    }
  }

  // ============ УНИВЕРСИТЕТ ============
  if (S.stage === 'uni') {
    add('🏫 Учиться в вузе', 'Интеллект +5, навык +3', 1, () => {
      S.int += 5; S.skills[rndSkill()] += 3; S.stress = clamp(S.stress + 5, 0, 100);
      addLog('Учился в вузе.'); playSound('click');
    });
    add('🔬 Лабораторная работа', 'Навык +5, шанс открытия', 1, () => {
      S.skills[rndSkill()] += 5;
      S.stress = clamp(S.stress + 4, 0, 100);
      const msgs = addProjectProgress(8);
      msgs.forEach(m => addLog(m));
      if (d20() + Math.floor(S.int / 20) > 16) {
        S.discoveries++; S.rep = clamp(S.rep + 5, 0, 100);
        addLog('🔬 Неожиданный результат в лаборатории!'); addAchievement('first_disc'); playSound('success');
      } else {
        addLog('Работал в лаборатории.'); playSound('click');
      }
    });
    projectAction('science');
    add('📄 Написать курсовую', 'Публикация +1, репутация +4', 1, () => {
      S.publications++; S.rep = clamp(S.rep + 4, 0, 100); S.skills.write += 2;
      S.stress = clamp(S.stress + 8, 0, 100);
      addLog('📄 Курсовая опубликована!'); addAchievement('first_pub'); playSound('success');
    }, '', { req: S.skills.write >= 8, reqText: 'нужно Письмо 8' });
    add('🏅 Олимпиада', 'Репутация +5, интеллект +3', 1, () => {
      S.rep = clamp(S.rep + 5, 0, 100); S.int += 3; S.stress = clamp(S.stress + 6, 0, 100);
      addLog('🏅 Выступил на олимпиаде.'); addAchievement('olymp'); playSound('success');
    }, 'special', { req: S.int >= 50, reqText: 'нужно 50 интеллекта' });
    add('💡 Оформить патент', 'Деньги +25 000, репутация +4', 1, () => {
      S.money += 25000; S.rep = clamp(S.rep + 4, 0, 100);
      addLog('💡 Патент оформлен!'); addAchievement('patent'); playSound('coin');
    }, '', { req: S.skills.it >= 25 || S.skills.chem >= 25, reqText: 'нужен навык 25 (IT или химия)' });

    add('🎤 Конференция', 'Репутация +3, харизма +2, прогресс темы', 1, () => {
      S.rep = clamp(S.rep + 3, 0, 100); S.charm += 2;
      addProjectProgress(10).forEach(m => addLog(m));
      addLog('Выступил на конференции.'); playSound('click');
    }, '', { group: 'career' });
    add('💼 Подработка (официант)', 'Деньги +2500, здоровье −6', 1, () => {
      S.money += 2500; S.health = clamp(S.health - 6, 0, 100); addLog('Подрабатывал официантом.'); playSound('coin');
    }, '', { group: 'life' });
    add('🎭 Студенческий театр', 'Харизма +5, стресс −15', 1, () => {
      S.charm += 5; S.stress = clamp(S.stress - 15, 0, 100); addLog('Играл в театре.'); playSound('click');
    }, '', { group: 'life' });
    add('😴 Отдохнуть', 'Стресс −25, здоровье +5', 1, () => {
      S.stress = clamp(S.stress - 25, 0, 100); S.health = clamp(S.health + 5, 0, 100);
      addLog('Отдыхал.'); playSound('click');
    }, 'safe', { group: 'life' });
    add('👨‍🏫 Нанять репетитора', 'Интеллект +10, стресс −5', 1, () => {
      S.int += 10; S.stress = clamp(S.stress - 5, 0, 100);
      addLog('Репетитор подтянул тебя.'); playSound('coin');
    }, 'special', { moneyCost: 5000, group: 'life' });
  }

  // ============ АСПИРАНТУРА ============
  if (S.stage === 'phd') {
    add('🧪 Работа в лаборатории', 'Навык +5, деньги +5000', 1, () => {
      S.skills[rndSkill()] += 5; S.money += 5000; S.stress = clamp(S.stress + 8, 0, 100);
      addLog('Работал в лаборатории.'); playSound('coin');
    });
    projectAction('science');
    add('💥 Провести эксперимент', 'Риск! Открытие или провал', 1, () => {
      S.money -= 3000;
      const bonus = Math.floor(S.int / 12) + (S.spec ? 2 : 0);
      const roll = d20() + Math.round(bonus * getGlobalModifier('discoveryChance'));
      S.stress = clamp(S.stress + 12, 0, 100);
      if (roll > 17) {
        S.discoveries++; S.rep = clamp(S.rep + 8, 0, 100);
        addLog('💥 Открытие!');
        addProjectProgress(30).forEach(m => addLog(m));
        addAchievement('first_disc'); addSkillPoint(1); playSound('success');
      } else if (roll > 10) {
        addProjectProgress(10).forEach(m => addLog(m));
        addLog('Эксперимент дал нейтральный результат.'); playSound('click');
      } else {
        S.rep = clamp(S.rep - 5, 0, 100); addLog('💀 Эксперимент провалился.'); playSound('fail');
      }
    }, 'danger', { moneyCost: 3000 });

    add('📝 Написать статью', 'Публикация +1, репутация +5', 1, () => {
      S.stress = clamp(S.stress + (S.flags.geniusPub ? 0 : 8), 0, 100);
      if (S.skills.write > 12) {
        S.publications++; S.rep = clamp(S.rep + 5, 0, 100); S.skills.write += 1;
        addLog('📝 Статья опубликована!');
        if (S.publications === 1) addAchievement('first_pub');
        addSkillPoint(1); playSound('success');
      } else {
        addLog('Статью отвергли: нужен навык Письмо > 12.'); playSound('fail');
      }
    });

    add('💰 Грантрайтинг', 'Шанс получить грант', 1, () => {
      const roll = d20() + Math.floor(S.charm / 10);
      if (roll > 12) {
        const grant = Math.round(80000 * getGlobalModifier('grantMoney') * (S.flags.luckyGrants ? 2 : 1));
        S.money += grant; S.rep = clamp(S.rep + 8, 0, 100); S.grants++;
        addLog(`💰 Грант получен! +${grant} ₽`); addAchievement('first_grant'); playSound('coin');
      } else {
        addLog('В гранте отказано.'); playSound('fail');
      }
      S.stress = clamp(S.stress + 10, 0, 100);
    }, '', { group: 'career' });

    add('🎓 Вести семинар', 'Харизма +2, репутация +3, прогресс темы', 1, () => {
      S.charm += 2; S.rep = clamp(S.rep + 3, 0, 100); S.stress = clamp(S.stress + 4, 0, 100);
      addProjectProgress(5).forEach(m => addLog(m));
      addLog('Провёл семинар для студентов.'); playSound('click');
    }, '', { req: S.skills.write >= 15, reqText: 'нужно Письмо 15', group: 'career' });

    add('😴 Отдохнуть', 'Стресс −25', 1, () => {
      S.stress = clamp(S.stress - 25, 0, 100); addLog('Отдыхал.'); playSound('click');
    }, 'safe', { group: 'life' });
  }

  // ============ КАРЬЕРА ============
  if (S.stage === 'career') {
    const trackSalary = S.track === 'industry' ? 1.3 : 1;
    const salary = Math.round((SALARY[S.position] || 8000) * trackSalary);
    add('💼 Работать', `Деньги +${salary} ₽, стресс +8`, 1, () => {
      const earned = Math.round(salary * getGlobalModifier('salary'));
      S.money += earned; S.stress = clamp(S.stress + 8, 0, 100);
      addLog(`Работал (${S.position}): +${earned} ₽.`); playSound('coin');
    }, '', { group: 'career' });

    if (!S.project) {
      const options = Object.values(PROJECTS);
      add('💡 Выбрать научную тему', 'Начать свой проект', 1, () => {
        S.pendingModal = {
          title: '💡 Научная тема',
          desc: 'Над чем ты будешь работать ближайшие годы? Тему можно вести до конца жизни.',
          opts: options.map(p => ({
            title: `${p.icon} ${p.title}`,
            desc: `${p.desc} Этапы: ${p.tiers.map(t => t.name).join(' → ')}`,
            f: () => {
              S.spec = p.spec;
              startProjectForSpec(p.spec);
            }
          }))
        };
      }, 'special', { req: true, group: 'science' });
    } else {
      projectAction('science');
    }

    add('🌌 Big Science', 'Высокий риск и награда', 1, () => {
      S.money -= 15000;
      const bonus = Math.floor(S.int / 15) + Math.floor(S.rep / 15) + (S.spec ? 2 : 0);
      const roll = d20() + Math.round(bonus * getGlobalModifier('discoveryChance'));
      S.stress = clamp(S.stress + 20, 0, 100);
      if (roll > 24) {
        S.discoveries++; S.rep = clamp(S.rep + 15, 0, 100); S.money += 150000;
        addLog('🌌 Крупное открытие!');
        addProjectProgress(45).forEach(m => addLog(m));
        addAchievement('big_science'); addSkillPoint(1); playSound('success');
      } else if (roll > 15) {
        addProjectProgress(15).forEach(m => addLog(m));
        addLog('Результат скромный, но данные есть.'); playSound('click');
      } else {
        S.rep = clamp(S.rep - 15, 0, 100); S.health = clamp(S.health - 20, 0, 100);
        addLog('💥 Авария в лаборатории.'); playSound('fail');
      }
    }, 'danger', { moneyCost: 15000 });

    add('📰 Подготовить статью', 'Выбрать журнал: тезисы, обычный или топовый', 1, () => {
      S.pendingModal = {
        title: '📰 Куда отправить статью',
        desc: 'Чем престижнее журнал, тем больше репутации — и тем выше риск отказа.',
        opts: JOURNAL_TIERS.map(tier => ({
          title: `${tier.icon} ${tier.title}`,
          desc: canSubmit(tier) ? tier.desc : `${tier.desc} Сейчас не хватает навыков.`,
          f: () => {
            const res = submitPaper(tier.id);
            if (res) addLog(res.text);
          }
        }))
      };
    });

    add('✍️ Написать монографию', 'Публикации +2, деньги +30 000', 1, () => {
      S.publications += 2; S.money += 30000; S.rep = clamp(S.rep + 6, 0, 100);
      S.skills.write += 3; S.stress = clamp(S.stress + 15, 0, 100);
      addLog('📕 Монография издана!'); addAchievement('book'); playSound('success');
    }, 'special', { req: S.skills.write >= 25, reqText: 'нужно Письмо 25' });

    add('📚 Читать литературу', 'Интеллект +2, навык +1', 1, () => {
      S.int += 2; S.skills[rndSkill()] += 1; S.stress = clamp(S.stress + 3, 0, 100);
      addLog('Читал литературу.'); playSound('click');
    });

    add('🏆 Подать на премию', 'Шанс престижной награды', 1, () => {
      const chance = 0.25 + S.rep / 200;
      if (Math.random() < chance) {
        S.money += 120000; S.rep = clamp(S.rep + 12, 0, 100);
        addLog('🏆 Ты получил престижную премию!'); addAchievement('award'); playSound('levelup');
      } else {
        addLog('😔 В этом году премию дали другому.'); playSound('fail');
      }
      S.stress = clamp(S.stress + 5, 0, 100);
    }, '', { req: S.rep >= 55 && S.publications >= 3, reqText: 'нужно 55 репутации и 3 публикации', group: 'career' });

    const lectureRep = S.track === 'teach' ? 8 : 4;
    add('🎓 Читать лекции', `Репутация +${lectureRep}, харизма +2`, 1, () => {
      S.rep = clamp(S.rep + lectureRep, 0, 100); S.charm += 2; S.stress = clamp(S.stress + 5, 0, 100);
      S.flags.lectured = true; addAchievement('lecturer');
      addLog(`Читал лекции студентам. Репутация +${lectureRep}.`); playSound('click');
    }, '', { group: 'career' });

    add('🎤 Публичная лекция', 'Деньги +8000, репутация +4, стресс −5', 1, () => {
      S.money += 8000; S.rep = clamp(S.rep + 4, 0, 100); S.stress = clamp(S.stress - 5, 0, 100);
      addLog('Выступил с публичной лекцией.'); playSound('success');
    }, 'safe', { req: S.charm >= 35, reqText: 'нужно 35 харизмы', group: 'career' });

    add('🧑‍🏫 Взять аспиранта', 'Репутация +5, влияние +2, навык +2', 1, () => {
      S.rep = clamp(S.rep + 5, 0, 100); S.influence += 2; S.skills[rndSkill()] += 2;
      S.stress = clamp(S.stress + 5, 0, 100);
      addLog('👨‍🎓 У тебя появился аспирант.'); addAchievement('mentor'); playSound('success');
    }, '', { req: rank() >= 3, reqText: 'нужна должность н.с.', group: 'career' });

    add('💼 Консалтинг', 'Деньги +30 000, репутация −3', 1, () => {
      S.money += 30000; S.rep = clamp(S.rep - 3, 0, 100);
      addLog('💼 Провёл платный консалтинг.'); playSound('coin');
    }, '', { req: S.int >= (S.track === 'industry' ? 40 : 65), reqText: S.track === 'industry' ? 'нужно 40 интеллекта' : 'нужно 65 интеллекта', group: 'career' });

    add('🏛️ Плести интриги', 'Влияние +2, враги +1', 1, () => {
      S.influence += 2; S.enemies += 1; S.stress = clamp(S.stress + 5, 0, 100);
      addLog('🏛️ Плёл интриги.'); playSound('click');
    }, '', { group: 'career' });
    add('🤝 Наладить связи', 'Влияние +3, стресс −5', 1, () => {
      S.influence += 3; S.stress = clamp(S.stress - 5, 0, 100);
      addLog('🤝 Налаживал связи.'); playSound('success');
    }, 'safe', { group: 'career' });
    add('🧑‍🏫 Создать научную школу', 'Нужно 10 влияния. Репутация +10', 1, () => {
      if (S.influence >= 10) {
        S.influence -= 10; S.rep = clamp(S.rep + 10, 0, 100); S.skills[rndSkill()] += 5;
        addLog('🧑‍🏫 Научная школа создана!'); addAchievement('mentor'); playSound('success');
      } else {
        addLog('❌ Мало влияния.'); playSound('fail');
      }
    }, 'special', { group: 'career' });

    const step = POSITION_LADDER.find(p => p.from === S.position);
    add('⬆️ Заявка на повышение',
      step ? `Нужно: репутация ${step.rep}, влияние ${Math.ceil(step.influence * (S.track === 'admin' ? 0.8 : 1))}` : 'Ты уже на вершине',
      1, () => {
        const st = POSITION_LADDER.find(p => p.from === S.position);
        if (!st) { addLog('Ты уже на вершине карьеры.'); return; }

        if (S.enemies >= 3 && Math.random() < S.enemies * 0.08) {
          addLog('❌ Враги подставили тебя на комиссии!');
          S.stress = clamp(S.stress + 15, 0, 100); playSound('fail'); return;
        }
        const needInf = Math.ceil(st.influence * (S.track === 'admin' ? 0.8 : 1));
        if (S.rep >= st.rep && S.influence >= needInf) {
          S.position = st.to;
          chronicle('⬆️', `Повышение: ${st.to}`);
          addLog(`🎉 Повышение! Теперь ты ${st.to}.`);
          if (st.to === 'директор НИИ') addAchievement('director');
          playSound('levelup');
        } else {
          addLog(`❌ Отказ. Нужно: репутация ${st.rep} (у тебя ${S.rep}), влияние ${needInf} (у тебя ${S.influence}).`);
          playSound('fail');
        }
        S.stress = clamp(S.stress + 5, 0, 100);
      }, 'special', { req: !!step, reqText: 'максимальная должность', group: 'career' });

    add('📈 Инвестировать', 'Риск: ×3 / ×0 / −50%', 1, () => {
      const sum = Math.min(S.money, 50000);
      if (sum < 5000) { addLog('Нужно хотя бы 5000 ₽.'); return; }
      S.money -= sum;
      const r = Math.random();
      if (r < 0.3) { S.money += sum * 3; addLog('📈 Инвестиция утроилась!'); playSound('coin'); }
      else if (r < 0.6) { addLog('📉 Инвестиция сгорела.'); playSound('click'); }
      else { S.money += Math.floor(sum * 0.5); addLog('💸 Потерял половину.'); playSound('fail'); }
    }, 'danger', { group: 'life' });

    add('🏖️ Отпуск', 'Стресс −30, здоровье +5', 1, () => {
      S.stress = clamp(S.stress - 30, 0, 100); S.health = clamp(S.health + 5, 0, 100);
      addLog('Был в отпуске.'); playSound('click');
    }, 'safe', { group: 'life' });

    add('🧘 Медитация', 'Стресс −18, здоровье +2', 1, () => {
      S.stress = clamp(S.stress - 18, 0, 100); S.health = clamp(S.health + 2, 0, 100);
      addLog('Медитировал.'); playSound('click');
    }, 'safe', { req: S.stress >= 50, reqText: 'нужен стресс 50+', group: 'life' });
  }

  // ============ ОТНОШЕНИЯ (доступны на любом этапе) ============
  const love = S.arcs.love;
  if (love && (love.stage === 'dating' || love.stage === 'married')) {
    const who = love.partner ? love.partner.name : 'партнёром';
    add('❤️ Время с партнёром', 'Чувства +8, стресс −8', 1, () => {
      love.love = Math.min(100, (love.love || 0) + 8);
      S.stress = clamp(S.stress - 8, 0, 100);
      addLog(`Провёл вечер с ${who}.`); playSound('success');
    }, 'safe', { group: 'life' });
  }
  if (S.arcs.family && ['kid', 'school', 'teen'].includes(S.arcs.family.stage)) {
    const child = S.arcs.family.childName || 'ребёнком';
    add('👶 Время с ребёнком', 'Связь +8, стресс −6', 1, () => {
      S.arcs.family.bond = Math.min(100, (S.arcs.family.bond || 0) + 8);
      S.stress = clamp(S.stress - 6, 0, 100);
      addLog(`Провёл день с ${child}.`); playSound('success');
    }, 'safe', { group: 'life' });
  }
  if (S.arcs.mentor && ['found', 'tested', 'supported', 'ill'].includes(S.arcs.mentor.stage)) {
    const m = S.arcs.mentor.name || 'наставником';
    add('🎓 Навестить наставника', 'Связь +5, репутация +1, стресс −5', 1, () => {
      S.arcs.mentor.bond = Math.min(100, (S.arcs.mentor.bond || 0) + 5);
      S.rep = clamp(S.rep + 1, 0, 100);
      S.stress = clamp(S.stress - 5, 0, 100);
      addLog(`Поговорил с ${m}.`); playSound('click');
    }, '', { group: 'life' });
  }

  return acts;
}

/** Названия групп действий для интерфейса. */
export const ACTION_GROUPS = {
  science: { icon: '🔬', title: 'Наука' },
  career: { icon: '🏛️', title: 'Карьера' },
  life: { icon: '🌿', title: 'Жизнь' }
};
