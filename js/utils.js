export const clamp=(v,mn,mx)=>Math.max(mn,Math.min(mx,v));
export const rnd=n=>Math.floor(Math.random()*n)+1;
export const d20=()=>rnd(20);
export const pick=arr=>arr[Math.floor(Math.random()*arr.length)];

export function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function formatMoney(n){
  return Number(n).toLocaleString('ru')+' ₽';
}

/**
 * Склонение существительных после числительных.
 * plural(3, ['год', 'года', 'лет']) → «года».
 */
export function plural(n, forms) {
  const abs = Math.abs(Number(n)) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

/** «34 года», «21 год», «11 лет». */
export function yearsWord(n) {
  return `${n} ${plural(n, ['год', 'года', 'лет'])}`;
}