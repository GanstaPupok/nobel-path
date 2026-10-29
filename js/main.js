import { S, initState } from './state.js';
import { seedRandom } from './dailychallenge.js';
import { applyTheme } from './theme.js';
import { render } from './ui/render.js';

// Применяем тему
applyTheme();

// Инициализируем состояние
initState();

// Если идёт ежедневное испытание — восстанавливаем его сид
if (S.daily) seedRandom(`${S.daily.seed}:${S.year}`);

// Запускаем рендер
render();

// PWA: офлайн-режим и установка на телефон.
// Регистрация после загрузки, чтобы не тормозить первый экран.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // На file:// или без HTTPS service worker недоступен — игра работает как обычно
    });
  });
}
