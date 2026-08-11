(() => {
  const magazine = document.querySelector('#magazine');
  const indicator = document.querySelector('#sectionIndicator');

  if (!magazine) return;

  let sectionHeight = magazine.clientHeight;
  let isRepositioning = false;
  let ticking = false;
  let resizeTimer;

  const getSections = () => [...magazine.querySelectorAll('.section')];

  function updateSectionHeight() {
    sectionHeight = magazine.clientHeight;
    document.documentElement.style.setProperty('--viewport-height', `${sectionHeight}px`);
  }

  function updateIndicator(sections) {
    if (!sections.length) return;

    const center = magazine.scrollTop + sectionHeight / 2;
    let active = sections[0];

    for (const section of sections) {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;

      if (center >= top && center < bottom) {
        active = section;
        break;
      }
    }

    if (indicator) {
      indicator.textContent = active.dataset.section || '--';
    }
  }

  // Parallax continuo: --progress va de -1 (sección arriba, saliendo)
  // a 0 (centrada) a 1 (abajo, entrando). --fade acompaña con una
  // caída de opacidad suave hacia los bordes. Se corre en cada frame
  // de scroll para que el movimiento siga al gesto sin delay.
  function updateParallax(sections) {
    const center = magazine.scrollTop + sectionHeight / 2;

    for (const section of sections) {
      const sectionCenter = section.offsetTop + section.offsetHeight / 2;
      const progress = (sectionCenter - center) / sectionHeight;
      const fade = 1 - Math.min(Math.abs(progress), 1) * 0.35;

      section.style.setProperty('--progress', progress.toFixed(3));
      section.style.setProperty('--fade', fade.toFixed(3));
    }
  }

  function moveFirstToEnd() {
    const first = magazine.firstElementChild;
    if (!first) return;

    const height = first.offsetHeight;
    magazine.appendChild(first);
    magazine.scrollTop -= height;
  }

  function moveLastToBeginning() {
    const last = magazine.lastElementChild;
    if (!last) return;

    const height = last.offsetHeight;
    magazine.prepend(last);
    magazine.scrollTop += height;
  }

  function maintainInfiniteLoop() {
    if (isRepositioning) return;

    const sections = getSections();
    if (sections.length < 3) return;

    const needsReposition =
      magazine.scrollTop < sectionHeight * 0.5 ||
      magazine.scrollTop >
        magazine.scrollHeight - magazine.clientHeight - sectionHeight * 0.5;

    if (!needsReposition) return;

    isRepositioning = true;

    // Mantiene siempre una sección de margen por encima y por debajo.
    // Al compensar scrollTop en el mismo frame, el usuario no percibe
    // que los nodos cambiaron de posición dentro del DOM. Como ya no
    // hay scroll-snap, no hay animación nativa con la que pelear.
    while (magazine.scrollTop < sectionHeight * 0.5) {
      moveLastToBeginning();
    }

    while (
      magazine.scrollTop >
      magazine.scrollHeight - magazine.clientHeight - sectionHeight * 0.5
    ) {
      moveFirstToEnd();
    }

    requestAnimationFrame(() => {
      isRepositioning = false;
    });
  }

  function onScroll() {
    maintainInfiniteLoop();

    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        const sections = getSections();
        updateParallax(sections);
        updateIndicator(sections);
        ticking = false;
      });
    }
  }

  function initialize() {
    updateSectionHeight();

    const availableSections = getSections();
    if (!availableSections.length) return;

    if (magazine.dataset.loopReady === 'true') {
      const currentSections = getSections();
      updateParallax(currentSections);
      updateIndicator(currentSections);
      return;
    }
    magazine.dataset.loopReady = 'true';

    // Coloca la última sección arriba de la primera para permitir
    // scroll hacia arriba desde el primer instante.
    const last = magazine.lastElementChild;
    if (last) {
      magazine.prepend(last);
      magazine.scrollTop = last.offsetHeight;
    }

    const sections = getSections();
    updateParallax(sections);
    updateIndicator(sections);
  }

  magazine.addEventListener('scroll', onScroll, { passive: true });

  window.AWTYLoop = { init: initialize };

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      const activeId = indicator?.textContent;
      updateSectionHeight();

      if (activeId) {
        const active = magazine.querySelector(`[data-section="${activeId}"]`);
        if (active) {
          magazine.scrollTop = active.offsetTop;
        }
      }

      const sections = getSections();
      updateParallax(sections);
      updateIndicator(sections);
    }, 120);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
