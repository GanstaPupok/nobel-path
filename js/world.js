import { S, addLog, saveState } from './state.js';
import { GLOBAL_EVENTS } from './config.js';
import { playSound } from './audio.js';

// Проверка и запуск нового события
export function checkGlobalEvents() {
  // Если событие уже идет, уменьшаем таймер
  if (S.activeGlobalEvent) {
    S.globalEventYearsLeft--;
    if (S.globalEventYearsLeft <= 0) {
      addLog(`🌍 Мировое событие «${GLOBAL_EVENTS[S.activeGlobalEvent].title}» закончилось.`);
      S.activeGlobalEvent = null;
    }
    return;
  }

  // Иначе с небольшим шансом запускаем новое (раз в 5-10 лет)
  if (S.age > 15 && Math.random() < 0.15) {
    const keys = Object.keys(GLOBAL_EVENTS);
    const newEvent = keys[Math.floor(Math.random() * keys.length)];
    
    S.activeGlobalEvent = newEvent;
    S.globalEventYearsLeft = GLOBAL_EVENTS[newEvent].duration;
    
    const ev = GLOBAL_EVENTS[newEvent];
    addLog(`🌍 МИРОВОЕ СОБЫТИЕ: ${ev.icon} ${ev.title}!`);
    playSound('levelup'); // Используем звук левелапа для важности
  }
}

// Получить текущий модификатор (например, на зарплату или гранты)
export function getGlobalModifier(key) {
  if (!S.activeGlobalEvent) return 1;
  const ev = GLOBAL_EVENTS[S.activeGlobalEvent];
  return ev.effects[key] !== undefined ? ev.effects[key] : 1;
}
