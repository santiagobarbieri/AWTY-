// render.js
// Lee content.json, arma cada <section> con la plantilla que le
// corresponde y recién ahí inicializa el loop infinito (que necesita
// las secciones ya en el DOM para calcular alturas).

(async () => {
  const magazine = document.querySelector('#magazine');
  const indicator = document.querySelector('#sectionIndicator');
  const indicatorTotal = document.querySelector('#sectionIndicatorTotal');
  if (!magazine) return;

  let sections;
  try {
    const res = await fetch('./content.json');
    if (!res.ok) throw new Error(`content.json respondió ${res.status}`);
    sections = await res.json();
  } catch (err) {
    magazine.innerHTML = `
      <section class="section" style="display:grid;place-items:center;background:#14120f;color:#ece6d8;padding:24px;text-align:center;font-family:Arial,sans-serif">
        <div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.1em;opacity:.7">ERROR AL CARGAR content.json</p>
          <p style="max-width:520px;margin:12px auto 0">${err.message}. Si estás abriendo el archivo directo (file://), corré un servidor local — por ejemplo <code>npx serve</code> — porque los navegadores bloquean fetch() a archivos locales.</p>
        </div>
      </section>`;
    console.error('AWTY render error:', err);
    return;
  }

  if (!Array.isArray(sections) || !sections.length) {
    magazine.innerHTML = '<section class="section"></section>';
    return;
  }

  // El número que se ve en el indicador es la posición real en el
  // array (no un "id" a mano) — así nunca se desincroniza al
  // reordenar o agregar secciones desde el panel.
  magazine.innerHTML = sections.map((entry, idx) => {
    const render = window.AWTY_TEMPLATES[entry.template];
    const position = String(idx + 1).padStart(2, '0');
    if (!render) {
      console.warn(`AWTY: plantilla desconocida "${entry.template}" (posición ${position})`);
      return '';
    }
    return `<section class="section tpl-${entry.template}" data-section="${position}">${render(entry)}</section>`;
  }).join('');

  if (indicatorTotal) {
    indicatorTotal.textContent = `/${String(sections.length).padStart(2, '0')}`;
  }

  if (window.AWTYLoop && typeof window.AWTYLoop.init === 'function') {
    window.AWTYLoop.init();
  }
})();
