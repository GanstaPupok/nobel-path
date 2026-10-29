import { S } from '../state.js';
import { escapeHtml } from '../utils.js';
import { makeCtx } from '../events/engine.js';
import { render } from './render.js';
import { afterAction } from './render.js';

export function renderEvent(app){
  const e = S.pendingEvent;
  app.innerHTML = `
    <div class="event">
      <h3>⚡ Событие</h3>
      ${e.rare?'<div class="ev-meta">🌟 редкое событие</div>':''}
      <p>${escapeHtml(e.text)}</p>
      <div class="opts" id="eventOpts"></div>
    </div>
  `;
  const box = document.getElementById('eventOpts');
  const ctx = makeCtx();
  e.opts.forEach(o=>{
    const b = document.createElement('button');
    b.textContent = o.t;
    b.onclick = ()=>{
      o.f(ctx);
      S.pendingEvent = null;
      afterAction();
    };
    box.appendChild(b);
  });
}