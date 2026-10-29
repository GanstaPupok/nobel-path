import { THEME_KEY } from './config.js';
import { playSound } from './audio.js';

let currentTheme = localStorage.getItem(THEME_KEY) || 'dark';

export function applyTheme(){
  document.documentElement.setAttribute('data-theme', currentTheme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.content = currentTheme==='dark' ? '#0a0e14' : '#f6f8fa';
}

export function toggleTheme(){
  currentTheme = currentTheme==='dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, currentTheme);
  applyTheme();
  playSound('click');
  return currentTheme;
}

export function getTheme(){ return currentTheme; }