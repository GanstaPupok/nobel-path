import { initState } from './state.js';
import { applyTheme } from './theme.js';
import { render } from './ui/render.js';

// Применяем тему
applyTheme();

// Инициализируем состояние
initState();

// Запускаем рендер
render();