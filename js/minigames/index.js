import { playQuiz } from './quiz.js';
import { playPuzzle } from './puzzle.js';
import { playDefense } from './defense.js';

export const MINIGAMES = [
  {id:'quiz', icon:'🎓', title:'Научный тест', desc:'Ответь на 4 вопроса. Проверка интеллекта.', fn:playQuiz},
  {id:'puzzle', icon:'🧩', title:'Лабораторный пазл', desc:'Собери химическую формулу.', fn:playPuzzle},
  {id:'defense', icon:'🛡️', title:'Защита диссертации', desc:'QTE: успей нажать кнопку.', fn:playDefense}
];