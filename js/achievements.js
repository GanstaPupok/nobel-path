import { ACHIEVEMENTS } from './config.js';
import { S, addLog, saveState } from './state.js';
import { playSound } from './audio.js';

export function addAchievement(id){
  if(S.achievements.includes(id)) return;
  const a = ACHIEVEMENTS[id];
  if(!a) return;
  S.achievements.push(id);
  showToast(`${a.icon} Достижение: ${a.name}`);
  playSound('achievement');
  addLog(`🏅 ${a.name}`);
  saveState();
}

export function showToast(text){
  const t = document.createElement('div');
  t.className='ach-toast';
  t.textContent=text;
  document.body.appendChild(t);
  setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),300)},2600);
}

export function checkThresholds(){
  if(S.money>=1000000) addAchievement('rich');
  if(S.int>=90) addAchievement('genius');
  if(S.age>=40 && S.health>=100) addAchievement('healthy');
  if(S.stress>=90) addAchievement('survivor');
}