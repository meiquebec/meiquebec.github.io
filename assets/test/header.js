(() => {
  const root = document.documentElement;
  const logo = document.getElementById('brandLogo');

  const MIN_H = 80;           // px
  const SHRINK_DISTANCE = 220; // px de scroll pour atteindre le min (ajuste à ton goût)

  let ratio = 1; // fallback

  function px(n){ return `${Math.round(n)}px`; }

  function computeMaxHeaderPx() {
    // 60vmin -> pixels
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    const logoWpx = 0.60 * vmin;
    return logoWpx * ratio;
  }

  function updateHeaderFromScroll() {
    const maxH = computeMaxHeaderPx();
    const clampedMax = Math.max(maxH, MIN_H); // sécurité

    const t = Math.min(Math.max(window.scrollY / SHRINK_DISTANCE, 0), 1);
    const h = clampedMax + (MIN_H - clampedMax) * t;

    root.style.setProperty('--header-max', px(clampedMax));
    root.style.setProperty('--header-h', px(h));
  }

  function initRatioAndRun() {
    // ratio basé sur les dimensions intrinsèques du fichier image
    if (logo.naturalWidth && logo.naturalHeight) {
      ratio = logo.naturalHeight / logo.naturalWidth;
    } else {
      // fallback: ratio via layout (moins fiable si l'image n'est pas affichée)
      const r = logo.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) ratio = r.height / r.width;
    }
    updateHeaderFromScroll();
  }

  // Attend que l'image soit chargée pour avoir naturalWidth/Height
  if (logo.complete) initRatioAndRun();
  else logo.addEventListener('load', initRatioAndRun, { once: true });

  window.addEventListener('scroll', updateHeaderFromScroll, { passive: true });
  window.addEventListener('resize', updateHeaderFromScroll);
})();
