import { ALL_EVENTS } from './index.js';
import { S } from '../state.js';

// Создаём ctx для событий — обёртки над состоянием
export function makeCtx(){
  return {
    get int(){return S.int}, set int(v){S.int=v},
    get health(){return S.health}, set health(v){S.health=Math.max(0,Math.min(100,v))},
    get charm(){return S.charm}, set charm(v){S.charm=Math.max(0,v)},
    get money(){return S.money}, set money(v){S.money=Math.max(0,v)},
    get stress(){return S.stress}, set stress(v){S.stress=Math.max(0,Math.min(100,v))},
    get rep(){return S.rep}, set rep(v){S.rep=Math.max(0,Math.min(100,v))},
    get energy(){return S.energy}, set energy(v){S.energy=v},
    get skills(){return S.skills},
    get arcs(){return S.arcs},
    get publications(){return S.publications}, set publications(v){S.publications=v},
    get discoveries(){return S.discoveries}, set discoveries(v){S.discoveries=v},
    d20:()=>Math.floor(Math.random()*20)+1,
    log:(m)=>{ import('../state.js').then(m2=>m2.addLog(m)); },
    sound:(n)=>{ import('../audio.js').then(m2=>m2.playSound(n)); },
    ach:(id)=>{ import('../achievements.js').then(m2=>m2.addAchievement(id)); },
    setArc:(name,data)=>{ S.arcs[name]=data; }
  };
}

export function rollEvent(){
  const pool = ALL_EVENTS.filter(e=>{
    if(!e.opts || !e.text) return false;
    if(!checkWhen(e.when)) return false;
    if(e.rare && e.rareId && S.rareSeen.includes(e.rareId)) return false;
    return true;
  });
  if(!pool.length) return null;
  const ev = pool[Math.floor(Math.random()*pool.length)];
  if(ev.rare && ev.rareId && !S.rareSeen.includes(ev.rareId)) S.rareSeen.push(ev.rareId);
  return ev;
}

export function checkWhen(w){
  if(!w) return true;
  if(w.minAge!==undefined && S.age<w.minAge) return false;
  if(w.maxAge!==undefined && S.age>w.maxAge) return false;
  if(w.stage){
    const stages = Array.isArray(w.stage)?w.stage:[w.stage];
    if(!stages.includes(S.stage)) return false;
  }
  if(w.flag && !S.flags[w.flag]) return false;
  if(w.spec && S.spec!==w.spec) return false;
  if(w.rep!==undefined && S.rep<w.rep) return false;
  if(w.arc){
    const arc = S.arcs[w.arc];
    if(!arc) return false;
    if(w.arcStage && arc.stage!==w.arcStage) return false;
  }
  return true;
}