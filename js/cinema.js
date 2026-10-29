// Кинематографичные вставки на важные события: частицы, иконка, заголовок.
// Это не видео, а лёгкая canvas-анимация — быстро грузится и работает офлайн.
import { S } from './state.js';

const KINDS = {
  nobel: { colors: ['#ffcf5c', '#ffb020', '#fff2c4', '#ffffff'], sparkle: true },
  success: { colors: ['#3ddc97', '#4fd8e8', '#5aa9ff', '#a78bfa'], sparkle: false },
  love: { colors: ['#ff8fb1', '#ff6b81', '#ffcf5c', '#ffffff'], sparkle: true },
  family: { colors: ['#ff8fb1', '#b185ff', '#5aa9ff', '#ffffff'], sparkle: true },
  sad: { colors: ['#6b7280', '#8d95b5', '#3b4252'], sparkle: false }
};

/**
 * Показывает вставку поверх игры. Возвращает Promise, который
 * разрешается, когда сцена закончилась или её закрыли.
 */
export function playCinema({ kind = 'success', icon = '✨', title = '', subtitle = '', duration = 2600 }) {
  if (typeof document === 'undefined' || !document.body) return Promise.resolve();

  const conf = KINDS[kind] || KINDS.success;
  const overlay = document.createElement('div');
  overlay.className = `cinema cinema-${kind}`;
  overlay.innerHTML = `
    <canvas class="cinema-canvas"></canvas>
    <div class="cinema-card">
      <div class="cinema-icon">${icon}</div>
      <h2>${escapeText(title)}</h2>
      ${subtitle ? `<p>${escapeText(subtitle)}</p>` : ''}
      <div class="cinema-hint">нажми, чтобы продолжить</div>
    </div>
  `;
  document.body.appendChild(overlay);

  const canvas = overlay.querySelector('.cinema-canvas');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;

  let width = 0;
  let height = 0;
  const particles = [];
  const makeParticle = () => ({
    x: Math.random() * width,
    y: height + Math.random() * 60,
    vx: (Math.random() - 0.5) * 0.9,
    vy: -(1.2 + Math.random() * 2.4),
    r: 1.5 + Math.random() * 3.5,
    color: conf.colors[(Math.random() * conf.colors.length) | 0],
    life: 0.6 + Math.random() * 0.6
  });

  function resize() {
    if (!canvas || !ctx) return;
    width = canvas.width = overlay.clientWidth || 360;
    height = canvas.height = overlay.clientHeight || 640;
  }
  resize();

  if (ctx) {
    for (let i = 0; i < 90; i++) {
      const p = makeParticle();
      p.y = Math.random() * height;
      particles.push(p);
    }
  }

  let raf = null;
  let last = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

  function frame(now) {
    if (!ctx) return;
    const dt = Math.min(48, now - last) / 16.7;
    last = now;

    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.012 * dt;
      p.life -= 0.003 * dt;
      if (p.y < -20 || p.life <= 0) Object.assign(p, makeParticle());
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }
  if (ctx && typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(frame);

  // Анимация иконки и текста — через CSS-класс
  requestAnimationFrame(() => overlay.classList.add('show'));

  return new Promise(resolve => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (raf) cancelAnimationFrame(raf);
      overlay.classList.add('out');
      setTimeout(() => { overlay.remove(); resolve(); }, 380);
    };
    overlay.addEventListener('click', finish);
    setTimeout(finish, duration);
  });
}

function escapeText(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Ставит сцену в очередь: её покажет ближайший render(). */
export function queueCinema(data) {
  if (!S) return;
  S.pendingCinema = data;
}
