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