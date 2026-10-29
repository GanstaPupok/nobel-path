import { SOUND_KEY } from './config.js';

let soundEnabled = localStorage.getItem(SOUND_KEY) !== 'off';
let audioCtx = null;

export function isSoundOn(){ return soundEnabled; }

export function toggleSound(){
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, soundEnabled ? 'on' : 'off');
  if(soundEnabled) playSound('click');
  return soundEnabled;
}

function getCtx(){
  if(!audioCtx){
    try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e){ return null; }
  }
  if(audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, duration, type='sine', vol=0.08, delay=0){
  if(!soundEnabled) return;
  const ctx = getCtx(); if(!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type=type; osc.frequency.value=freq;
  const t0 = ctx.currentTime+delay;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0+0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0+duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0); osc.stop(t0+duration+0.02);
}

const SOUNDS = {
  click:()=>tone(600,0.08,'square',0.05),
  success:()=>{tone(523,0.12);tone(659,0.12,'sine',0.08,0.1);tone(784,0.18,'sine',0.08,0.2);},
  fail:()=>{tone(300,0.15,'sawtooth',0.06);tone(200,0.2,'sawtooth',0.06,0.12);},
  coin:()=>{tone(988,0.08,'square',0.06);tone(1319,0.12,'square',0.05,0.08);},
  levelup:()=>{tone(523,0.1,'triangle',0.08);tone(659,0.1,'triangle',0.08,0.1);tone(784,0.1,'triangle',0.08,0.2);tone(1047,0.25,'triangle',0.09,0.3);},
  achievement:()=>{tone(784,0.1,'triangle',0.09);tone(1047,0.1,'triangle',0.09,0.1);tone(1319,0.3,'triangle',0.1,0.2);},
  year:()=>{tone(440,0.1);tone(554,0.15,'sine',0.06,0.1);},
  daily:()=>{tone(660,0.08);tone(880,0.12,'sine',0.06,0.08);},
  final:()=>{[523,659,784,1047,1319].forEach((f,i)=>tone(f,0.35,'triangle',0.1,i*0.12));},
  minigame:()=>{tone(880,0.1,'triangle',0.07);tone(1175,0.15,'triangle',0.07,0.1);}
};

export function playSound(name){
  if(!soundEnabled) return;
  const fn = SOUNDS[name]; if(fn) fn();
}