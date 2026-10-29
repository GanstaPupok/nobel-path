import { S } from '../state.js';
import { escapeHtml } from '../utils.js';
import { render } from './render.js';
import { playSound } from '../audio.js';
import { saveState } from '../state.js';

export function renderModal(app){
  const m = S.pendingModal;
  app.innerHTML = `
    <div class="modal-bg">
      <div class="modal">
        <h2>${escapeHtml(m.title)}</h2>
        <p>${escapeHtml(m.desc)}</p>
        <div class="opts" id="modalOpts"></div>
      </div>
    </div>
  `;
  const box = document.getElementById('modalOpts');
  m.opts.forEach(o=>{
    const d = document.createElement('div');
    d.className='opt';
    d.innerHTML = `<h4>${escapeHtml(o.title)}</h4><p>${escapeHtml(o.desc)}</p>`;
    d.onclick = ()=>{
      playSound('click');
      o.f();
      S.pendingModal = null;
      saveState();
      render();
    };
    box.appendChild(d);
  });
}