import { ACHIEVEMENTS } from './config.js';
import { S, addLog, saveState } from './state.js';
import { playSound } from './audio.js';
import { addSkillPoint } from './skills.js';
import { chronicle } from './chronicle.js';

export function addAchievement(id) {
  if (!S || !S.achievements) return;
  if (S.achievements.includes(id)) return;
  const a = ACHIEVEMENTS[id];
  if (!a) return; // неизвестный id — молча игнорируем, чтобы не ломать сохранение
  S.achievements.push(id);
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
