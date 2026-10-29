import { S, saveState, addLog } from './state.js';
import { SKILL_TREE } from './config.js';
import { playSound } from './audio.js';
import { clamp } from './utils.js';

// Начисление очков навыков
export function addSkillPoint(amount = 1) {
  if (!Number.isFinite(S.skillPoints)) S.skillPoints = 0;
  S.skillPoints += amount;
  const word = amount % 10 === 1 && amount % 100 !== 11 ? 'очко' : (amount % 10 >= 2 && amount % 10 <= 4 && (amount % 100 < 10 || amount % 100 >= 20) ? 'очка' : 'очков');
  addLog(`🌟 Получено ${amount} ${word} навыков!`);
  playSound('levelup');
  saveState();
}

export function canBuyPerk(perkId) {
  const perk = SKILL_TREE[perkId];
  if (!perk) return false;
  if ((S.boughtPerks || []).includes(perkId)) return false;
  return (S.skillPoints || 0) >= perk.cost;
}

// Покупка перка
export function buyPerk(perkId) {
  const perk = SKILL_TREE[perkId];
  if (!perk) return false;

  if (!Number.isFinite(S.skillPoints)) S.skillPoints = 0;
  if (!Array.isArray(S.boughtPerks)) S.boughtPerks = [];

  if (S.boughtPerks.includes(perkId)) return false;
  if (S.skillPoints < perk.cost) return false;

  S.skillPoints -= perk.cost;
  S.boughtPerks.push(perkId);

  // Применяем эффект
  switch (perkId) {
    case 'prodigy': S.int += 10; break;
    case 'speaker': S.charm += 10; break;
    case 'iron_health': S.health = clamp(S.health + 20, 0, 100); break;
    case 'stress_resist': S.stress = clamp(S.stress - 10, 0, 100); break;
    case 'rival_master': S.rep = clamp(S.rep + 10, 0, 100); break;
    // workaholic учитывается в расчёте энергии каждого года (см. year.js)
    case 'lucky_grants': S.flags.luckyGrants = true; break;
    case 'genius_pub': S.flags.geniusPub = true; break;
  }
  if (perkId === 'workaholic') S.stress = clamp(S.stress + 5, 0, 100);

  addLog(`🌟 Куплен навык: ${perk.title}`);
  playSound('success');
  saveState();
  return true;
}
