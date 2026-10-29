import { SAVE_KEY } from './config.js';

const LEGACY_KEY = 'nobel_path_legacy';

export let S;
export let Legacy = { points: 0, upgrades: {} };

export function loadLegacy() {
  try {
    const d = localStorage.getItem(LEGACY_KEY);
    if(d) Legacy = JSON.parse(d);
  } catch(e){}
}
export function saveLegacy() {
  localStorage.setItem(LEGACY_KEY, JSON.stringify(Legacy));
}

export function freshState(){
  return {
    age:7, year:0, name:'Алекс', gender:'m', avatarSeed:Math.random(),
    int:5, health:100, charm:5, money:0, energy:3, stress:0, rep:0,
    skills:{math:0,chem:0,bio:0,it:0,write:0},
    stage:'child', spec:null,
    publications:0, discoveries:0, grants:0,
    position:'школьник', actedThisYear:0,
    log:[], pendingEvent:null, pendingModal:null,
    finalReached:false, final:null,
    achievements:[], flags:{}, started:false,
    dailyLife:null, dailyLifeSeen:false, dailyStreak:{good:0,bad:0},
    backstory:null,
    arcs:{love:null,rival:null,family:null,mentor:null,friend:null,hater:null,coauthor:null,hobby:null},
    rareSeen:[],
    milestones:[],
    yearCount:0,
    quests:[],
    minigameDone:{quiz:0,puzzle:0,defense:0},
    treeChoices:{},
    legacyUpgrades: {},
    skillPoints: 0,
    boughtPerks: []
  };
}

export function loadState(){
  try{
    const d = localStorage.getItem(SAVE_KEY);
    if(d){ S = JSON.parse(d); return true; }
  }catch(e){}
  return false;
}

export function initState(){
  loadLegacy();
  if(!loadState()){
    S = freshState();
  }
  // Миграции
  if(!S.arcs) S.arcs = {};
  ['love','rival','family','mentor','friend','hater','coauthor','hobby'].forEach(k=>{
    if(S.arcs[k]===undefined) S.arcs[k]=null;
  });
  if(!S.rareSeen) S.rareSeen=[];
  if(!S.milestones) S.milestones=[];
  if(S.yearCount===undefined) S.yearCount=0;
  if(!S.quests) S.quests=[];
  if(!S.minigameDone) S.minigameDone={quiz:0,puzzle:0,defense:0};
  if(!S.treeChoices) S.treeChoices={};
  if(!S.legacyUpgrades) S.legacyUpgrades={};
  if(S.skillPoints === undefined) S.skillPoints = 0;
  if(!S.boughtPerks) S.boughtPerks = [];
  
  saveState();
}

export function saveState(){
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }catch(e){}
}

export function resetState(){
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(LEGACY_KEY);
  location.reload();
}

export function addLog(msg){
  S.log.unshift({age:S.age,msg});
  if(S.log.length>80) S.log.pop();
}
