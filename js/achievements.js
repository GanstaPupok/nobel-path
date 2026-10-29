import { ACHIEVEMENTS } from './config.js';
import { S, addLog, saveState } from './state.js';
import { playSound } from './audio.js';
import { addSkillPoint } from './skills.js';
import { chronicle } from './chronicle.js';

export const ACHIEVEMENT_GROUPS = {
  science: { icon: '🔬', title: 'Наука' },
  career: { icon: '🏛️', title: 'Карьера' },
  life: { icon: '🌿', title: 'Жизнь' },
  special: { icon: '✨', title: 'Особые' }
};

// Прогресс для измеримых достижений: [текущее значение, цель].
const PROGRESS = {
  first_pub: () => [S.publications, 1],
  five_pubs: () => [S.publications, 5],
  ten_pubs: () => [S.publications, 10],
  first_disc: () => [S.discoveries, 1],
  first_grant: () => [S.grants, 1],
  big_science: () => [S.topPubs || 0, 3],
  genius: () => [S.int, 90],
  published: () => [S.rep, 60],
  rich: () => [S.money, 1000000],
  survivor: () => [S.stress, 90],
  healthy: () => [S.health, 100],
  legend: () => [(S.achievements || []).length, 20],
  tree_master: () => [Object.keys(S.treeChoices || {}).length, 4],
  lucky: () => [(S.dailyStreak && S.dailyStreak.good) || 0, 3],
  unlucky: () => [(S.dailyStreak && S.dailyStreak.bad) || 0, 3],
  project_start: () => [S.project ? 1 : 0, 1],
  project_done: () => [(S.flags && S.flags.projectDone) ? 1 : 0, 1],
  professor: () => [positionRank(), 5],
  married: () => [arcStage('love', 'married') ? 1 : 0, 1],
  arc_love: () => [arcStage('love', 'married') ? 1 : 0, 1],
  parent: () => [(S.arcs.family && S.arcs.family.childName) ? 1 : 0, 1],
  arc_family: () => [arcStage('family', 'legacy') ? 1 : 0, 1],
  friend: () => [(S.arcs.friend && S.arcs.friend.stage === 'met') ? 1 : 0, 1],
  hobby: () => [(S.arcs.hobby && S.arcs.hobby.stage === 'active') ? 1 : 0, 1],
  coauthor: () => [(S.arcs.coauthor && S.arcs.coauthor.stage === 'working') ? 1 : 0, 1],
  mentor: () => [arcStage('mentor', 'legacy') ? 1 : 0, 1],
  hater: () => [arcStage('hater', 'defeated') ? 1 : 0, 1],
  arc_rival: () => [(S.arcs.rival && ['won', 'friends'].includes(S.arcs.rival.stage)) ? 1 : 0, 1],
  abroad: () => [(S.flags && S.flags.abroad) ? 1 : 0, 1],
  lecturer: () => [(S.flags && S.flags.lectured) ? 1 : 0, 1],
  polyglot: () => [S.int, 60]
};

const RANKS = ['лаборант', 'инженер', 'м.н.с.', 'н.с.', 'с.н.с.', 'зав. лаб.', 'зам. директора', 'директор НИИ'];

function positionRank() {
  const idx = RANKS.indexOf(S.position);
  return idx < 0 ? 0 : Math.min(idx, 5);
}

function arcStage(name, stage) {
  const arc = S.arcs && S.arcs[name];
  return !!(arc && arc.stage === stage);
}

/** Прогресс достижения или null, если оно не измеряется числом. */
export function achievementProgress(id) {
  const fn = PROGRESS[id];
  if (!fn) return null;
  let cur = 0;
  let max = 1;
  try {
    [cur, max] = fn();
  } catch (e) {
    return null;
  }
  if (!Number.isFinite(cur) || !Number.isFinite(max) || max <= 0) return null;
  const shown = Math.max(0, Math.min(cur, max));
  return { cur: shown, max, pct: Math.round(shown / max * 100) };
}

export function addAchievement(id) {
  if (!S || !S.achievements) return;
  if (S.achievements.includes(id)) return;
  const a = ACHIEVEMENTS[id];
  if (!a) return; // неизвестный id — молча игнорируем, чтобы не ломать сохранение
  S.achievements.push(id);
  if (!S.achievementDates || typeof S.achievementDates !== 'object') S.achievementDates = {};
  S.achievementDates[id] = S.age;
  chronicle(a.icon, a.name, 'achievement');
  showToast(`${a.icon} Достижение: ${a.name}`);
  playSound('achievement');
  addLog(`🏅 ${a.name}`);
  saveState();
}

export function showToast(text) {
  const t = document.createElement('div');
  t.className = 'ach-toast';
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2600);
}

// Очки навыков за важные вехи. Каждая выдаётся один раз.
const SKILL_MILESTONES = [
  { id: 'pub3',  title: '3 публикации',   check: () => S.publications >= 3 },
  { id: 'pub7',  title: '7 публикаций',   check: () => S.publications >= 7 },
  { id: 'disc2', title: '2 открытия',     check: () => S.discoveries >= 2 },
  { id: 'ns',    title: 'старший научный сотрудник', check: () => ['н.с.', 'с.н.с.', 'зав. лаб.', 'зам. директора', 'директор НИИ'].includes(S.position) },
  { id: 'prof',  title: 'заведующий лабораторией',   check: () => ['зав. лаб.', 'зам. директора', 'директор НИИ'].includes(S.position) }
];

export function checkThresholds() {
  if (!S || S.finalReached) return;

  if (S.money >= 1000000) addAchievement('rich');
  if (S.int >= 90) addAchievement('genius');
  if (S.age >= 40 && S.health >= 100) addAchievement('healthy');
  if (S.stress >= 90) addAchievement('survivor');
  if (S.rep >= 60) addAchievement('published');
  if (S.publications >= 5) addAchievement('five_pubs');
  if (S.publications >= 10) addAchievement('ten_pubs');
  if (S.topPubs >= 3) addAchievement('big_science');

  if (S.arcs && S.arcs.family && S.arcs.family.stage === 'kid') addAchievement('arc_family');
  if (S.flags && S.flags.abroad && S.int >= 60) addAchievement('polyglot');
  if (S.flags && (S.flags.poorStart || S.flags.orphan) && S.money >= 500000) addAchievement('selfmade');
  if (Object.keys(S.treeChoices || {}).length >= 4) addAchievement('tree_master');

  // Профессорские должности и завершённый проект
  if (['с.н.с.', 'зав. лаб.', 'зам. директора', 'директор НИИ'].includes(S.position)) addAchievement('professor');
  if (S.flags && S.flags.projectDone) addAchievement('project_done');
  if (S.achievements.length >= 20) addAchievement('legend');

  // Очки навыков за вехи
  if (!S.flags.skillMilestones) S.flags.skillMilestones = {};
  for (const m of SKILL_MILESTONES) {
    if (S.flags.skillMilestones[m.id]) continue;
    if (m.check()) {
      S.flags.skillMilestones[m.id] = true;
      addSkillPoint(1);
    }
  }
}
