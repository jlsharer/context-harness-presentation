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
  el('controlName').textContent = 'LIFECYCLE CONTROL  /  ' + control.name.toUpperCase();
  el('question').textContent = control.title;
  el('steps').replaceChildren(...control.steps.map(([key, body]) => {
    const row = document.createElement('div');
    row.append(node('dt', key), node('dd', body));
    return row;
  }));
  const source = el('source');
  source.replaceChildren();
  if (control.source) {
    const link = node('a', 'Source · ' + new URL(control.source).hostname);
    link.href = control.source;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    source.append(link);
  } else source.textContent = 'Illustrative checkpoint design';
  dialog.showModal();
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
  const match = /^#slide-(\d+)$/.exec(location.hash);
  current = match && +match[1] >= 1 && +match[1] <= slides.length ? +match[1] : 1;
  if (dialog.open) dialog.close();
  const slide = slides[current-1], hub = current === 15, figure = el('figure');
  figure.hidden = hub;
  el('lifecycle').hidden = !hub;
  if (!hub) {
    figure.src = 'slides/slide-'+String(current).padStart(2,'0')+'.png';
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
dialog.onclose = () => { if (current===15 && opener) opener.focus(); };
window.addEventListener('hashchange', showSlide);
document.addEventListener('keydown', e => {
  if(dialog.open || e.altKey || e.ctrlKey || e.metaKey || e.target.matches('select')) return;
  if(e.key==='ArrowRight' || e.key==='ArrowLeft'){
    e.preventDefault(); go(current+(e.key==='ArrowRight'?1:-1));
  }
});
showSlide();
