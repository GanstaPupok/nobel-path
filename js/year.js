import { S, saveState, addLog } from './state.js';
import { clamp } from './utils.js';
import { playSound } from './audio.js';
import { tickArcs } from './arcs.js';
import { checkFinal } from './finals.js';
import { rollDailyLife } from './daily.js';
import { tickQuests, maybeAddQuest } from './quests.js';
import { checkTreeConsequences } from './tree.js';
import { checkGlobalEvents, getGlobalModifier } from './world.js';
import { checkThresholds, addAchievement } from './achievements.js';
import { GATES, RENT, ENERGY } from './config.js';
import { checkMilestones } from './events/milestones.js';
import { rollEvent } from './events/engine.js';
import { startProjectForSpec } from './project.js';

export function rentForAge(age) {
  const row = RENT.find(r => age <= r.maxAge);
  return row ? row.sum : RENT[RENT.length - 1].sum;
}

export function endYear() {
  S.age++; S.year++; S.yearCount++;
  S.actedThisYear = 0;
  S.minigamesThisYear = 0;

  // Энергия на новый год
  S.energy = ENERGY.base
    + (S.health > ENERGY.healthBonus ? 1 : 0)
    + (S.charm > ENERGY.charmBonus ? 1 : 0)
    + ((S.boughtPerks || []).includes('workaholic') ? 1 : 0)
    + (S.energyBonus || 0);

  // Бытовые расходы. Дети живут с родителями и аренду не платят.
  const rent = rentForAge(S.age);
  const paid = Math.min(S.money, rent);
  S.money -= paid;
  if (paid < rent) {
    S.stress = clamp(S.stress + 15, 0, 100);
    addLog(`⚠️ Не хватило на жильё (нужно ${rent} ₽). Стресс +15.`);
    playSound('fail');
  }

  // Естественное восстановление: в норме стресс падает на 6 в год
  S.stress = clamp(S.stress + Math.round(4 * getGlobalModifier('stress')) - 10, 0, 100);

  // Характеристики упираются в предел 100
  S.int = Math.min(100, S.int);
  S.charm = Math.min(100, S.charm);

  // Организм восстанавливается, только если жить спокойно
  if (S.stress < 35) S.health = clamp(S.health + 3, 0, 100);

  // Возраст даёт о себе знать
  if (S.age > 50) S.health = clamp(S.health - 1, 0, 100);

  if (S.activeGlobalEvent === 'pandemic') {
    S.health = clamp(S.health - 5, 0, 100);
    if (Math.random() < 0.3) addLog('🦠 Ты переболел в пандемию.');
  }

  if (S.stress >= 100) {
    addLog('🔥 ВЫГОРАНИЕ! Ты не выдержал нагрузки. Пришлось взять академический отпуск на год.');
    S.stress = 50;
    S.health = clamp(S.health - 15, 0, 100);
    S.energy = 1;
    S.money = Math.max(0, S.money - 10000);
    playSound('fail');
  } else if (S.stress > 80) {
    S.health = clamp(S.health - 10, 0, 100);
    addLog('⚠️ Высокий стресс подорвал здоровье.');
  }

  tickArcs();
  tickQuests();
  checkGlobalEvents();
  maybeAddQuest();

  const treeMsg = checkTreeConsequences();
  if (treeMsg) addLog(treeMsg);

  advanceStage();
  checkThresholds();

  // Научная тема: подхватываем специализацию, если проект ещё не выбран
  if (!S.project && S.spec && ['uni', 'phd', 'career'].includes(S.stage)) {
    startProjectForSpec(S.spec);
  }

  // Вехи жизни и гарантированное событие года
  const hadEventThisYear = S.eventsThisYear > 0;
  const milestone = checkMilestones(S);
  if (milestone && !S.pendingEvent) {
    S.pendingEvent = milestone;
    S.eventsThisYear++;
  }
  if (!S.pendingEvent && !S.pendingModal && !hadEventThisYear) {
    const ev = rollEvent();
    if (ev) { S.pendingEvent = ev; S.eventsThisYear++; }
  }
  S.eventsThisYear = 0;

  if (S.health <= 0) {
    // Один раз за жизнь врачи вытаскивают с того света — второй раз нет.
    if (!S.flags.rescued) {
      S.flags.rescued = true;
      S.health = 30;
      S.stress = clamp(S.stress - 20, 0, 100);
      S.money = Math.max(0, S.money - 20000);
      addLog('🚑 Врачи спасли тебе жизнь. Здоровье 30, но силы на исходе — береги себя.');
      playSound('fail');
    } else {
      addLog('💔 Здоровье окончательно подорвано.');
    }
  }

  if (S.health <= 0 || S.age >= 65 || (S.stage === 'career' && S.age >= 58)) {
    checkFinal();
  }

  if (!S.finalReached) {
    S.dailyLife = null;
    rollDailyLife();
  }

  saveState();
}

export function advanceStage() {
  if (S.stage === 'child' && S.age >= GATES.uni.age) {
    if (S.int >= GATES.uni.int) {
      S.stage = 'uni'; S.position = 'студент';
      addLog('🎓 Ты поступил в вуз!');
      playSound('levelup');
      S.pendingModal = {
        title: '🎓 Выбор специализации',
        desc: 'Пора определиться с направлением науки.',
        opts: [
          { title: '⚛️ Физик', desc: '+5 интеллекта. Тема: квантовые вычисления', f: () => { S.spec = 'phys'; S.int += 5; startProjectForSpec('phys'); } },
          { title: '🧬 Биолог', desc: '+10 здоровья. Тема: редактирование генома', f: () => { S.spec = 'bio'; S.health = clamp(S.health + 10, 0, 100); startProjectForSpec('bio'); } },
          { title: '💻 Программист', desc: '+10 IT. Тема: искусственный интеллект', f: () => { S.spec = 'it'; S.skills.it += 10; startProjectForSpec('it'); } }
        ]
      };
    } else {
      addLog(`😔 Для вуза нужно ${GATES.uni.int} интеллекта, у тебя ${S.int}. Ещё год подготовки.`);
      playSound('fail');
    }
  }

  if (S.stage === 'uni' && S.age >= GATES.phd.age) {
    if (S.int >= GATES.phd.int && S.publications >= GATES.phd.publications) {
      S.stage = 'phd'; S.position = 'аспирант';
      addLog('🎓 Ты поступил в аспирантуру!');
      addAchievement('first_pub');
      playSound('levelup');
    } else {
      S.stage = 'career'; S.position = 'лаборант';
      const missing = [];
      if (S.int < GATES.phd.int) missing.push(`интеллект ${S.int}/${GATES.phd.int}`);
      if (S.publications < GATES.phd.publications) missing.push(`публикации ${S.publications}/${GATES.phd.publications}`);
      addLog(`😔 В аспирантуру не взяли (${missing.join(', ')}). Ты лаборант.`);
      playSound('fail');
    }
  }

  if (S.stage === 'phd' && S.age >= GATES.career.age) {
    S.stage = 'career';
    if (S.discoveries >= GATES.career.discoveries) {
      S.position = 'м.н.с.';
      addLog('🎓 Защита прошла! Ты младший научный сотрудник.');
      playSound('levelup');
    } else {
      S.position = 'инженер';
      addLog(`😔 Диссертация провалена (открытий ${S.discoveries}/${GATES.career.discoveries}). Ты инженер.`);
      playSound('fail');
    }
  }

  // Страховка: после 30 лет нельзя застрять в детстве/вузе
  if (S.age >= GATES.career.age && (S.stage === 'child' || S.stage === 'uni')) {
    S.stage = 'career';
    if (S.position === 'школьник' || S.position === 'студент') S.position = 'лаборант';
    addLog('🕐 Жизнь заставила начать работать: ты лаборант.');
  }
}
