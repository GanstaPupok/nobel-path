import { S, addLog } from './state.js';
import { LAB } from './config.js';
import { playSound } from './audio.js';
import { chronicle } from './chronicle.js';
import { formatMoney } from './utils.js';

export function labLevel(id) {
  return (S.lab && S.lab[id]) || 0;
}

/** Доступные улучшения (ещё не максимальные). */
export function labOptions() {
  const out = [];
  for (const [id, up] of Object.entries(LAB)) {
    const level = labLevel(id);
    if (level >= up.maxLevel) continue;
    const cost = up.levels[level].cost;
    out.push({ id, up, level, cost, nextLevel: level + 1 });
  }
  return out;
}

/** Покупка улучшения. Возвращает {ok, text}. */
export function buyLab(id) {
  const up = LAB[id];
  if (!up) return null;

  const level = labLevel(id);
  if (level >= up.maxLevel) return { ok: false, text: 'Это уже максимум.' };

  const cost = up.levels[level].cost;
  if (S.money < cost) return { ok: false, text: `Не хватает денег: нужно ${formatMoney(cost)}.` };

  S.money -= cost;
  if (!S.lab) S.lab = {};
  S.lab[id] = level + 1;
  chronicle(up.icon, `${up.title}: уровень ${level + 1}`);
  playSound('levelup');
  return { ok: true, text: `${up.icon} ${up.title} — уровень ${level + 1}.` };
}

/** Открывает модалку с улучшениями лаборатории. */
export function openLab() {
  const opts = labOptions();
  if (!opts.length) {
    addLog('Лаборатория уже полностью оборудована.');
    return false;
  }

  S.pendingModal = {
    title: '🏗️ Лаборатория',
    desc: 'Вложи деньги в технику — она ускорит науку и добавит энергии.',
    opts: opts.map(o => ({
      title: `${o.up.icon} ${o.up.title} (ур. ${o.nextLevel}/${o.up.maxLevel})`,
      desc: `${o.up.desc} · цена ${formatMoney(o.cost)}${S.money < o.cost ? ' — не хватает' : ''}`,
      f: () => {
        const res = buyLab(o.id);
        if (res) addLog(res.text);
      }
    }))
  };
  return true;
}

/** Короткая строка состояния для описания действия. */
export function labSummary() {
  return `оборудование ${labLevel('equipment')}/3 · компьютер ${labLevel('computer')}/3`;
}
