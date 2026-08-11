(() => {
  const magazine = document.querySelector('#magazine');
  const navigator = document.querySelector('#siteNavigator');
  const trigger = document.querySelector('#indexTrigger');
  const indexList = document.querySelector('#siteIndex');
  const logoLink = document.querySelector('#siteMark');
  const logo = document.querySelector('#siteLogo');
  const clock = document.querySelector('#siteClock');
  const form = document.querySelector('#contactForm');
  const status = document.querySelector('#contactStatus');
  if (!magazine || !navigator || !trigger) return;

  const cleanText = value => String(value || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const titleFor = (entry, fallback) => cleanText(entry.articleTitle || entry.title || entry.heading || entry.quote || fallback);

  function selectView(name) {
    navigator.querySelectorAll('[data-nav-tab]').forEach(button => button.classList.toggle('is-active', button.dataset.navTab === name));
    navigator.querySelectorAll('[data-nav-view]').forEach(view => view.classList.toggle('is-active', view.dataset.navView === name));
  }

  function openNavigator(view = 'index') {
    selectView(view);
    navigator.classList.add('is-open');
    navigator.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('navigator-open');
    navigator.querySelector('[data-nav-close]')?.focus({ preventScroll: true });
  }

  function closeNavigator() {
    navigator.classList.remove('is-open');
    navigator.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('navigator-open');
    trigger.focus({ preventScroll: true });
  }

  function goToSection(number) {
    const target = magazine.querySelector(`[data-section="${number}"]`);
    if (!target) return;
    closeNavigator();
    requestAnimationFrame(() => magazine.scrollTo({ top: target.offsetTop, behavior: 'smooth' }));
  }

  function buildIndex(entries) {
    if (!indexList) return;
    indexList.innerHTML = entries.map((entry, index) => {
      const number = String(index + 1).padStart(2, '0');
      const title = titleFor(entry, `Section ${number}`);
      return `<li><button type="button" data-jump="${number}"><span class="site-index__number">${number}</span><span class="site-index__title"></span><span class="site-index__type"></span></button></li>`;
    }).join('');
    entries.forEach((entry, index) => {
      const button = indexList.querySelector(`[data-jump="${String(index + 1).padStart(2, '0')}"]`);
      button.querySelector('.site-index__title').textContent = titleFor(entry, `Section ${index + 1}`);
      button.querySelector('.site-index__type').textContent = cleanText(entry.template).replace(/([A-Z])/g, ' $1');
    });
  }

  trigger.addEventListener('click', () => navigator.classList.contains('is-open') ? closeNavigator() : openNavigator('index'));
  navigator.querySelectorAll('[data-nav-close]').forEach(button => button.addEventListener('click', closeNavigator));
  navigator.querySelectorAll('[data-nav-tab]').forEach(button => button.addEventListener('click', () => selectView(button.dataset.navTab)));
  indexList?.addEventListener('click', event => {
    const button = event.target.closest('[data-jump]');
    if (button) goToSection(button.dataset.jump);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigator.classList.contains('is-open')) closeNavigator();
  });
  function onRendered(entries) {
    buildIndex(entries);
    const sectionMatch = window.location.hash.match(/^#section-(\d{2})$/);
    if (sectionMatch) requestAnimationFrame(() => {
      const target = magazine.querySelector(`[data-section="${sectionMatch[1]}"]`);
      if (target) magazine.scrollTop = target.offsetTop;
    });
  }
  document.addEventListener('awty:rendered', event => onRendered(event.detail.sections));
  if (Array.isArray(window.AWTY_RENDERED_SECTIONS)) onRendered(window.AWTY_RENDERED_SECTIONS);

  logoLink?.addEventListener('click', event => { event.preventDefault(); goToSection('01'); });
  logo?.addEventListener('error', () => logoLink.classList.add('is-missing'));
  if (logo?.complete && !logo.naturalWidth) logoLink?.classList.add('is-missing');

  function updateClock() {
    if (!clock) return;
    clock.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
  }
  updateClock();
  window.setInterval(updateClock, 1000);

  const initialView = window.location.hash.slice(1).toLowerCase();
  if (['index', 'about', 'contact'].includes(initialView)) openNavigator(initialView);

  form?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent(`AWTY? — message from ${data.get('name')}`);
    const body = encodeURIComponent(`${data.get('message')}\n\nFrom: ${data.get('name')} <${data.get('email')}>`);
    if (status) status.textContent = 'Opening your email client…';
    window.location.href = `mailto:hello@arewethereyet.world?subject=${subject}&body=${body}`;
  });
})();
