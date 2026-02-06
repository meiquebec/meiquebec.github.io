import './includes/menu';

const driftTime = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--drift-time').replace(/s$/gi, ''));
const delay = 0 - (Math.floor(Math.random() * (driftTime + 1)));
requestAnimationFrame(() => document.documentElement.style.setProperty('--drift-time-delay',`${delay}s`));
