import { S, saveState } from '../state.js';
import { playSound } from '../audio.js';
import { addAchievement } from '../achievements.js';

const FORMULAS = [
  { list: ['H2O', 'CO2', 'NaCl', 'C6H12O6', 'H2SO4'], fake: 'NaCl' },
  { list: ['E=mc2', 'F=ma', 'a2+b2=c2', 'V=IR', 'PV=nRT'], fake: 'E=mc2' },
  { list: ['H2O', 'O2', 'N2', 'CO2', 'He2'], fake: 'He2' },
  { list: ['Fe', 'Au', 'Ag', 'Cu', 'Mg'], fake: 'Mg' }
];

export function playSpotError(onDone){
  const set = FORMULAS[Math.floor(Math.random() * FORMULAS.length)];
  const shuffled = [...set.list].sort(() => Math.random() - 0.5);

  const overlay = document.createElement('div');
  overlay.className = 'mg-overlay';
  overlay.innerHTML = `
    <div class="mg-box">
      <h2>🔍 Найди ошибку</h2>
      <p class="mg-hint">Одна из формул записана неверно. Кликни на неё!</p>
      <div class="mg-options" id="errOpts" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        ${shuffled.map(f => `<button style="text-align:center; font-size:18px; font-family:monospace;" data-f="${f}">${f}</button>`).join('')}
      </div>
      <div class="mg-result" id="result"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const box = document.getElementById('errOpts');
  const result = document.getElementById('result');
  let finished = false;

  box.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      if (finished) return;
      finished = true;
      
      const isCorrect = btn.dataset.f === set.fake;
      box.querySelectorAll('button').forEach(b => b.disabled = true);
      
      if (isCorrect) {
        btn.classList.add('correct');
        result.className = 'mg-result good';
        result.textContent = '✅ Верно!';
        S.int += 2; S.skills.chem += 2;
        playSound('success');
      } else {
        btn.classList.add('wrong');
        result.className = 'mg-result bad';
        result.textContent = '❌ Ошибся.';
        S.stress = Math.min(100, S.stress + 5);
        playSound('fail');
      }
      S.minigameDone.spot = (S.minigameDone.spot || 0) + 1;
      saveState();

      setTimeout(() => {
        overlay.remove();
        onDone && onDone(isCorrect ? 'Ошибка найдена!' : 'Не угадал', isCorrect);
      }, 1500);
    };
  });
}
