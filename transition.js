'use strict';

const first = document.getElementById('first-page');
const second = document.getElementById('second-page');
const status = document.querySelector('.status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const selectedVariant = new URLSearchParams(location.search).get('transition');
const variant = ['horizon', 'sunrise'].includes(selectedVariant) ? selectedVariant : 'orbit';
const timings = {
  orbit: { reveal: 3550, fade: 1750, cards: 850 },
  sunrise: { reveal: 2850, fade: 1600, cards: 0 },
  horizon: { reveal: 2600, fade: 1200, cards: 0 }
};
const timing = timings[variant];
document.body.dataset.transition = variant;
document.body.style.setProperty('--gallery-fade', timing.fade + 'ms');
let secondReady = false;
let stage = 'first';
let revealTimer;
let finishTimer;
let cardsTimer;

function tellFirst(type) {
  first.contentWindow.postMessage({ type, variant }, location.origin);
}

function showGallery() {
  stage = 'transition';
  document.body.classList.add('departing');
  status.hidden = true;
  first.inert = true;
  tellFirst('meridiam:depart');
  second.contentWindow.postMessage({ type: 'meridiam:prepare' }, location.origin);
  document.body.classList.toggle('reduced', reducedMotion.matches);

  revealTimer = setTimeout(() => {
    document.body.classList.add('revealing');
    cardsTimer = setTimeout(() => {
      second.contentWindow.postMessage({ type: 'meridiam:arrive' }, location.origin);
    }, reducedMotion.matches ? 0 : timing.cards);
    finishTimer = setTimeout(() => {
      document.body.classList.add('gallery');
      document.body.classList.remove('revealing');
      first.setAttribute('aria-hidden', 'true');
      second.removeAttribute('aria-hidden');
      second.inert = false;
      tellFirst('meridiam:pause');
      stage = 'second';
      if (location.hash !== '#directions') {
        history.pushState(null, '', '#directions');
      }
      second.contentWindow.focus();
    }, reducedMotion.matches ? 200 : timing.fade + 50);
  }, reducedMotion.matches ? 0 : timing.reveal);
}

function showFirst() {
  clearTimeout(revealTimer);
  clearTimeout(finishTimer);
  clearTimeout(cardsTimer);
  stage = 'first';
  status.hidden = true;
  second.inert = true;
  second.setAttribute('aria-hidden', 'true');
  first.inert = false;
  first.removeAttribute('aria-hidden');
  document.body.classList.remove('gallery', 'revealing', 'departing');
  tellFirst('meridiam:reset');
}

second.addEventListener('load', () => {
  secondReady = true;
  if (stage === 'waiting' || location.hash === '#directions') showGallery();
});

window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== first.contentWindow) return;
  if (event.data?.type === 'meridiam:sun-position' && stage === 'transition') {
    document.body.style.setProperty('--sun-x', event.data.x * 100 + '%');
    document.body.style.setProperty('--sun-y', event.data.y * 100 + '%');
    return;
  }
  if (event.data?.type !== 'meridiam:explore' || stage !== 'first') return;
  if (secondReady) {
    showGallery();
  } else {
    stage = 'waiting';
    status.hidden = false;
  }
});

window.addEventListener('popstate', () => {
  if (location.hash === '#directions') {
    if (secondReady && stage === 'first') showGallery();
  } else {
    showFirst();
  }
});
