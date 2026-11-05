'use strict';
const el = id => document.getElementById(id);
const dialog = el('example');
let current, opener;
function node(tag, text, className) {
  const item = document.createElement(tag);
  item.textContent = text;
  if (className) item.className = className;
  return item;
}
function openControl(control, button) {
  opener = button;
  dialog.classList.toggle('event-detail', control.kind === 'events');
  el('controlName').textContent = control.category || 'LIFECYCLE CONTROL  /  ' + control.name.toUpperCase();
  el('question').textContent = control.title;
  el('steps').replaceChildren(...control.steps.map(([key, body, status]) => {
    const row = document.createElement('div');
    const definition = node('dd', '');
    if(status) definition.append(node('strong', status, 'event-status'));
    definition.append(document.createTextNode(body));
    row.append(node('dt', key), definition);
    return row;
  }));
  const source = el('source');
  source.replaceChildren();
  const sources = control.sources || (control.source ? [control.source] : []);
  for (const url of sources) {
    const link = node('a', 'Source · ' + new URL(url).hostname + new URL(url).pathname);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    source.append(link);
  }
  if (!sources.length) source.textContent = 'Illustrative checkpoint design';
  if (control.note) source.prepend(node('p', control.note));
  dialog.showModal();
  dialog.scrollTop = 0;
}
for (const control of controls) {
  const card = node('button', '', 'card');
  card.setAttribute('aria-label', control.name);
  card.setAttribute('aria-haspopup', 'dialog');
  const plus = node('span', '+', 'plus');
  plus.setAttribute('aria-hidden', 'true');
  card.append(node('span', control.name, 'name'), plus, node('strong', control.action), node('span', control.example, 'hint'));
  card.onclick = () => openControl(control, card);
  el('cards').append(card);
}
slides.forEach((slide, i) => el('jump').add(new Option((i+1)+' / '+slides.length+'  ·  '+slide.title, i+1)));
function showSlide() {
  if(location.hash === '#slide-15') history.replaceState(null, '', '#slide-'+(slides.findIndex(s=>s.view==='lifecycle')+1));
  const match = /^#slide-(\d+)$/.exec(location.hash);
  current = match && +match[1] >= 1 && +match[1] <= slides.length ? +match[1] : 1;
  if (dialog.open) dialog.close();
  const slide = slides[current-1], hub = slide.view === 'lifecycle', figure = el('figure');
  const native = Boolean(diagrams[slide.view]);
  figure.hidden = hub || native;
  el('diagram').hidden = !native;
  if(native) {
    el('diagram').innerHTML = diagrams[slide.view];
    el('diagram').querySelectorAll('[data-detail="events"]').forEach(button => {
      button.onclick = () => openControl(eventDetail, button);
    });
  }
  el('pageNumber').textContent = String(current).padStart(2,'0');
  el('pageNumber').hidden = hub || native;
  el('lifecycle').hidden = !hub;
  if (!hub && !native) {
    figure.src = slide.image;
    figure.alt = slide.title + '. ' + slide.description;
  }
  el('jump').value = String(current);
  el('previous').disabled = current === 1;
  el('next').disabled = current === slides.length;
  el('notes').open = false;
  el('noteText').textContent = slide.notes;
  el('status').textContent = 'Slide '+current+' of '+slides.length+'. '+slide.title;
  document.title = slide.title+' | Context & Harness Engineering';
}
function go(n) {
  if (dialog.open || n < 1 || n > slides.length || n === current) return;
  history.pushState(null, '', '#slide-'+n);
  showSlide();
}
el('previous').onclick = () => go(current-1);
el('next').onclick = () => go(current+1);
el('jump').onchange = e => go(+e.target.value);
el('close').onclick = () => dialog.close();
dialog.onclose = () => { if (opener && opener.isConnected) opener.focus(); };
window.addEventListener('hashchange', showSlide);
document.addEventListener('keydown', e => {
  if(dialog.open || e.altKey || e.ctrlKey || e.metaKey || e.target.matches('select')) return;
  if(e.key==='ArrowRight' || e.key==='ArrowLeft'){
    e.preventDefault(); go(current+(e.key==='ArrowRight'?1:-1));
  }
});
showSlide();
