import { S } from './state.js';
import { ACHIEVEMENTS, TRACKS } from './config.js';
import { FINALS } from './finals.js';
import { yearsWord } from './utils.js';
import { getAvatar } from './ui/game.js';
import { dailyScore } from './dailychallenge.js';

const FINAL_COLORS = {
  nobel: '#ffcf5c',
  director: '#5aa9ff',
  famous: '#3ddc97',
  business: '#b185ff',
  death: '#ff6b81',
  burnout: '#ff6b81',
  loser: '#8d95b5',
  teacher: '#5aa9ff'
};

const FONT = "'Segoe UI', system-ui, -apple-system, sans-serif";
const EMOJI = "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth, maxLines) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

/** Рисует карточку жизни 1080×1080 и возвращает dataURL PNG. */
export function buildLifeCard() {
  if (typeof document === 'undefined') return null;
  const size = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return null;

  // Фон
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#0b1020');
  bg.addColorStop(0.55, '#161033');
  bg.addColorStop(1, '#201338');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Свечение сверху
  const glow = ctx.createRadialGradient(size * 0.5, size * 0.2, 40, size * 0.5, size * 0.2, size * 0.75);
  glow.addColorStop(0, 'rgba(124,92,255,0.38)');
  glow.addColorStop(1, 'rgba(124,92,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // Рамка
  ctx.strokeStyle = 'rgba(255,207,92,0.55)';
  ctx.lineWidth = 6;
  roundRect(ctx, 40, 40, size - 80, size - 80, 44);
  ctx.stroke();

  ctx.textAlign = 'center';

  // Заголовок
  ctx.fillStyle = '#ffcf5c';
  ctx.font = `800 36px ${FONT}`;
  ctx.fillText('ПУТЬ К НОБЕЛЕВКЕ', size / 2, 128);

  // Аватар
  ctx.font = `150px ${EMOJI}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(getAvatar(), size / 2, 268);

  // Имя и роль
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#eef2ff';
  ctx.font = `800 56px ${FONT}`;
  ctx.fillText(S.name, size / 2, 400);

  ctx.fillStyle = '#8d95b5';
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText(`${yearsWord(S.age)}${S.track && TRACKS[S.track] ? ' · ' + TRACKS[S.track].title : ''}`, size / 2, 446);

  // Финальный заголовок
  const f = FINALS[S.final] || FINALS.teacher;
  ctx.fillStyle = FINAL_COLORS[S.final] || '#ffcf5c';
  ctx.font = `800 46px ${FONT}`;
  const titleLines = wrapText(ctx, f.title, size - 200, 2);
  titleLines.forEach((line, i) => ctx.fillText(line, size / 2, 540 + i * 56));

  // Титул
  if (S.personaTitle) {
    ctx.fillStyle = '#b185ff';
    ctx.font = `600 28px ${FONT}`;
    ctx.fillText(S.personaTitle, size / 2, 540 + titleLines.length * 56 + 14);
  }

  // Статистика
  const stats = [
    ['публикаций', S.publications],
    ['открытий', S.discoveries],
    ['репутация', S.rep]
  ];
  const statsY = 760;
  stats.forEach(([label, value], i) => {
    const x = size / 2 + (i - 1) * 260;
    ctx.fillStyle = '#eef2ff';
    ctx.font = `800 52px ${FONT}`;
    ctx.fillText(String(value), x, statsY);
    ctx.fillStyle = '#8d95b5';
    ctx.font = `500 24px ${FONT}`;
    ctx.fillText(label, x, statsY + 34);
  });

  // Достижения
  const got = (S.achievements || []).map(id => ACHIEVEMENTS[id]).filter(Boolean);
  ctx.fillStyle = '#ffcf5c';
  ctx.font = `700 28px ${FONT}`;
  ctx.fillText(`🏅 ${got.length} достижений`, size / 2, 880);
  ctx.fillStyle = '#c9d0e4';
  ctx.font = `500 24px ${FONT}`;
  const names = got.slice(0, 3).map(a => a.name).join(' · ');
  if (names) ctx.fillText(names, size / 2, 918);

  // Подвал
  ctx.fillStyle = '#8d95b5';
  ctx.font = `500 22px ${FONT}`;
  const dateLabel = S.daily ? `испытание дня ${S.daily.date}` : `ganstapupok.github.io/nobel-path`;
  ctx.fillText(dateLabel, size / 2, 990);

  try {
    return canvas.toDataURL('image/png');
  } catch (e) {
    return null;
  }
}

/** Запасной вариант: очки за жизнь для текста. */
export function lifeScore() {
  return dailyScore(S);
}
