(() => {
'use strict';
const contactToggle = document.getElementById('contactToggle');
const contactRail = document.getElementById('contactRail');
const communication = document.querySelector('.communication');
function setContacts(open, returnFocus = false) {
  contactRail.hidden = !open;
  if (!open) { contactPanel.hidden = true; contactRail.querySelectorAll("button").forEach(button => button.setAttribute("aria-expanded", "false")); }
  contactToggle.setAttribute('aria-expanded', String(open));
  contactToggle.setAttribute('aria-label', open ? 'Скрыть способы связи' : 'Показать способы связи');
  if (returnFocus) contactToggle.focus({preventScroll: true});
}
contactToggle.addEventListener('click', () => setContacts(contactRail.hidden));
document.addEventListener('pointerdown', event => {
  if (!communication.contains(event.target)) setContacts(false);
});
communication.addEventListener('focusout', event => {
  if (!communication.contains(event.relatedTarget)) setContacts(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !contactRail.hidden) setContacts(false, true);
});

const contactPanel = document.getElementById('contactPanel');
const contacts = {
 phone: {title:'Телефон Меридиам', value:'+7 (906) 489-19-49', copy:'+79064891949', href:'tel:+79064891949', action:'Позвонить'},
 telegram: {title:'Telegram', value:'@Meridiam_st', href:'https://t.me/Meridiam_st', action:'Открыть Telegram'},
 email: {title:'Электронная почта', value:'meridiamstudio@mail.ru', href:'mailto:meridiamstudio@mail.ru', action:'Написать письмо'},
 max: {title:'MAX — адрес профиля', value:'web.max.ru/154154235', href:'https://web.max.ru/154154235', action:'Открыть MAX'}
};
let selectedContact = null;
contactRail.querySelectorAll('[data-channel]').forEach(button => {
 button.addEventListener('click', () => {
  const key = button.dataset.channel;
  const open = contactPanel.hidden || selectedContact !== key;
  selectedContact = key;
  const item = contacts[key];
  document.getElementById('contactTitle').textContent = item.title;
  document.getElementById('contactValue').textContent = item.value;
  const link = document.getElementById('contactLink');
  link.href = item.href; link.textContent = item.action;
  link.target = item.href.startsWith('https:') ? '_blank' : '_self';
  link.rel = 'noopener noreferrer';
  document.getElementById('copyStatus').textContent = '';
  contactPanel.hidden = !open;
  contactRail.querySelectorAll('button').forEach(b => b.setAttribute('aria-expanded', String(open && b === button)));
 });
});
document.getElementById('copyContact').addEventListener('click', async () => {
 const item = contacts[selectedContact];
 const status = document.getElementById('copyStatus');
 try {
  await navigator.clipboard.writeText(item.copy || item.value);
  status.textContent = 'Скопировано';
 } catch (_) {
  const range = document.createRange();
  range.selectNodeContents(document.getElementById('contactValue'));
  const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
  status.textContent = 'Выделено — скопируйте вручную';
 }
});
})();
