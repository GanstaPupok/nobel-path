import { S, saveState, addLog } from './state.js';
import { SKILL_TREE } from './config.js';
import { playSound } from './audio.js';
import { clamp } from './utils.js';
import { render } from './ui/render.js';

// Начисление очков
export function addSkillPoint(amount = 1) {
  if (!S.skillPoints) S.skillPoints = 0;
  S.skillPoints += amount;
  addLog(`🌟 Получено ${amount} очко навыков!`);
  playSound('levelup');
  saveState();
}

// Покупка перка
export function buyPerk(perkId) {
  const perk = SKILL_TREE[perkId];
  if (!perk) return;
  
  if (!S.skillPoints) S.skillPoints = 0;
  if (!S.boughtPerks) S.boughtPerks = [];
  
  if (S.boughtPerks.includes(perkId)) return;
  if (S.skillPoints < perk.cost) return;

  S.skillPoints -= perk.cost;
  S.boughtPerks.push(perkId);
  
  // Применяем эффект
  if (perkId === 'prodigy') S.int += 10;
  if (perkId === 'speaker') S.charm += 10;
  if (perkId === 'iron_health') S.health = clamp(S.health + 20, 0, 100);
  if (perkId === 'stress_resist') S.stress = clamp(S.stress - 10, 0, 100);
  if (perkId === 'rival_master') S.rep = clamp(S.rep + 10, 0, 100);
  if (perkId === 'workaholic') S.energy += 1;
  if (perkId === 'lucky_grants') S.flags.luckyGrants = true;
  if (perkId === 'genius_pub') S.flags.geniusPub = true;

  addLog(`🌟 Куплен навык: ${perk.title}`);
  playSound('success');
  saveState();
}

// Рендер модалки дерева
export function openSkillTree() {
  S.pendingModal = {
    isSkillTree: true,
    title: '🌳 Дерево навыков',
    desc: 'Трать очки навыков на пассивные улучшения.'
  };
  render();
}
