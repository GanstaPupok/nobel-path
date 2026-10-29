import { S, saveState } from '../state.js';
import { playSound } from '../audio.js';
import { addAchievement } from '../achievements.js';
import { clamp } from '../utils.js';

// В каждом наборе ровно одна запись неверна. why — объяснение для игрока.
const SETS = [
  {
    list: ['H₂O', 'CO₂', 'NaCl', 'C₆H₁₂O₆', 'H₃O₂'],
    fake: 'H₃O₂',
    why: 'H₃O₂ — такой устойчивой молекулы нет. У воды H₂O, у перекиси H₂O₂.'
  },
  {
    list: ['E=mc²', 'F=ma', 'a²+b²=c²', 'V=IR', 'F=m·v'],
    fake: 'F=m·v',
    why: 'F=m·v — неверно: это формула импульса (p=mv). Второй закон Ньютона: F=ma.'
  },
  {
    list: ['H₂O', 'O₂', 'N₂', 'CO₂', 'He₂'],
    fake: 'He₂',
    why: 'Гелий — благородный газ, он одноатомный: He, а не He₂.'
  },
  {
    list: ['Fe', 'Au', 'Ag', 'Cu', 'Mz'],
    fake: 'Mz',
    why: 'Mz не существует: Fe — железо, Au — золото, Ag — серебро, Cu — медь.'
  }
];

export function playSpotError(onDone) {
  const set = SETS[Math.floor(Math.random() * SETS.length)];
  const shuffled = [...set.list].sort(() => Math.random() - 0.5);

  const overlay = document.createElement('div');
  overlay.className = 'mg-overlay';
  overlay.innerHTML = `
    <div class="mg-box">
      <h2>🔍 Найди ошибку</h2>
      <p class="mg-hint">Одна из записей неверна. Кликни на неё!</p>
      <div class="mg-options mg-grid-2" id="errOpts">
        ${shuffled.map(f => `<button class="mg-formula" data-f="${f}">${f}</button>`).join('')}
      </div>
      <div class="mg-result" id="result"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const box = overlay.querySelector('#errOpts');
  const result = overlay.querySelector('#result');
  let finished = false;

  box.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      if (finished) return;
      finished = true;

      const isCorrect = btn.dataset.f === set.fake;
      box.querySelectorAll('button').forEach(b => { b.disabled = true; });

      if (isCorrect) {
        btn.classList.add('correct');
        result.className = 'mg-result good';
        result.textContent = '✅ Верно!';
        S.int += 2; S.skills.chem += 2;
        if (!S.minigameDone.spot) addAchievement('quiz_master');
        playSound('success');
      } else {
        btn.classList.add('wrong');
        box.querySelectorAll('button').forEach(b => {
          if (b.dataset.f === set.fake) b.classList.add('correct');
        });
        result.className = 'mg-result bad';
        result.textContent = '❌ Ошибся.';
        S.stress = clamp(S.stress + 5, 0, 100);
        playSound('fail');
      }

      const note = document.createElement('p');
      note.className = 'mg-hint mg-why';
      note.textContent = set.why;
      result.after(note);

      S.minigameDone.spot = (S.minigameDone.spot || 0) + 1;
      saveState();

      setTimeout(() => {
        overlay.remove();
        onDone && onDone(isCorrect ? 'Ошибка найдена!' : 'Не угадал', isCorrect);
      }, 1800);
    };
  });
}
