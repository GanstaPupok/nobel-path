import { S, addLog } from './state.js';
import { PROJECTS, PROJECT_PROGRESS, TRACKS } from './config.js';
import { playSound } from './audio.js';
import { addAchievement } from './achievements.js';
import { clamp } from './utils.js';
import { chronicle } from './chronicle.js';

/** Описание текущего проекта или null. */
export function projectDef() {
  return S.project ? PROJECTS[S.project.id] : null;
}

/** Текущий этап проекта (или null, если проект завершён). */
export function currentTier() {
  const def = projectDef();
  if (!def || !S.project) return null;
  return S.project.tier < def.tiers.length ? def.tiers[S.project.tier] : null;
}

export function startProject(projectId, opts = {}) {
  const def = PROJECTS[projectId];
  if (!def) return false;
  S.project = { id: projectId, tier: 0, progress: 0 };
  addAchievement('project_start');
  if (!opts.silent) {
    addLog(`💡 Новая тема: ${def.icon} ${def.title}. Этап «${def.tiers[0].name}».`);
    playSound('levelup');
  }
  return true;
}

/** Проект по специализации игрока. */
export function startProjectForSpec(spec, opts) {
  const def = Object.values(PROJECTS).find(p => p.spec === spec);
  return def ? startProject(def.id, opts) : false;
}

/** Сколько прогресса даст одно действие — чем сильнее навыки, тем быстрее. */
export function progressPerAction() {
  const best = Math.max(...Object.values(S.skills || { math: 0 }));
  return PROJECT_PROGRESS.base + Math.floor(best / PROJECT_PROGRESS.perSkill);
}

/**
 * Добавляет прогресс проекту. Возвращает массив сообщений
 * о завершённых этапах (чтобы показать их игроку).
 */
export function addProjectProgress(amount) {
  const def = projectDef();
  const tier = currentTier();
  if (!def || !tier) return [];

  const messages = [];
  const mult = S.track && TRACKS[S.track] ? TRACKS[S.track].projectMult : 1;
  const delta = amount > 0 ? Math.round(amount * mult) : amount;
  S.project.progress = Math.max(0, S.project.progress + delta);

  while (S.project.tier < def.tiers.length) {
    const t = def.tiers[S.project.tier];
    if (S.project.progress < t.need) break;
    S.project.progress -= t.need;
    S.project.tier++;

    S.discoveries++;
    S.rep = clamp(S.rep + t.rep, 0, 100);
    S.money += t.money;
    chronicle('💥', `Открытие: «${t.name}»`);
    messages.push(`💥 Открытие! «${t.name}» — репутация +${t.rep}, ${t.money} ₽`);

    if (S.project.tier >= def.tiers.length) {
      S.flags.projectDone = true;
      chronicle('🚀', `Тема «${def.title}» закрыта целиком`);
      S.rep = clamp(S.rep + 10, 0, 100);
      addAchievement('project_done');
      messages.push(`🚀 Тема «${def.title}» закрыта целиком. Ты в учебниках.`);
      playSound('levelup');
    } else {
      messages.push(`➡️ Следующий этап: «${def.tiers[S.project.tier].name}».`);
    }
  }

  return messages;
}

/** Данные для интерфейса. */
export function projectStatus() {
  const def = projectDef();
  if (!def) return null;
  const tier = currentTier();
  if (!tier) {
    return { def, done: true, title: def.title, icon: def.icon, tierName: 'завершён', pct: 100, label: 'все этапы пройдены' };
  }
  return {
    def,
    done: false,
    title: def.title,
    icon: def.icon,
    tierName: tier.name,
    tierIndex: S.project.tier + 1,
    tiersTotal: def.tiers.length,
    pct: clamp(S.project.progress / tier.need * 100, 0, 100),
    label: `${S.project.progress} / ${tier.need}`,
    cost: tier.cost
  };
}
