import { S } from '../state.js';
import { escapeHtml } from '../utils.js';
import { makeCtx } from '../events/engine.js';
import { afterAction } from './render.js';

export function renderEvent(app){
  const e = S.pendingEvent;
  const title = e.title || (e.rare ? '🌟 Редкое событие' : '⚡ Событие');

  app.innerHTML = `
    <div class="event ${e.milestone ? 'milestone' : ''}">
      <h3>${escapeHtml(title)}</h3>
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
