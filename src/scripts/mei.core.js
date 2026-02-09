import './includes/secrets';
import './includes/helpers';
import './includes/menu';
import './includes/gallery';
import './includes/carte';

const driftTime = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--drift-time').replace(/s$/gi, ''));
const delay = 0 - (Math.floor(Math.random() * (driftTime + 1)));
requestAnimationFrame(() => document.documentElement.style.setProperty('--drift-time-delay',`${delay}s`));
