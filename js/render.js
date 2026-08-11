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

  // Curated reading rhythm: long reads are separated by visual pages,
  // listening notes and archive formats instead of forming one block.
  const editorialOrder = [
    'ARE WE THERE YET?', 'CONTENTS', 'ANIMALS IN THE FOG',
    'THE ROOM BETWEEN ROOMS', 'A magazine does not end on the page. It keeps making noise somewhere else.',
    'EVERYTHING KEEPS A SIGNAL', 'TWO IDIOTS IN BERLIN', 'LIGHT IS ANOTHER INSTRUMENT',
    'JUDAS', 'PLAY THESE AFTER MIDNIGHT', 'NOISE FOR A CITY THAT NEVER SLEEPS',
    'THE WOMAN INSIDE YOUR COFFEE CUP', 'TURN IT UP', 'PRINT IT BEFORE THE POLICE ARRIVE',
    'ART AFTER DARK', 'GOING OUT AT NIGHT', 'ONE HOUR TO BECOME SOMEONE ELSE',
    'OBLIQUE', 'THE RED CURTAIN', 'THE RAPPER WAS ALWAYS A BARD',
    'I ♥ NY WAS DRAWN IN A TAXI', 'THIS IS NOT THE END.'
  ];
  const editorialPosition = new Map(editorialOrder.map((key, index) => [key, index]));
  const sectionKey = entry => String(entry.articleTitle || entry.title || entry.heading || entry.quote || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  sections = sections
    .map((entry, sourceIndex) => ({ entry, sourceIndex }))
    .sort((a, b) => {
      const aPosition = editorialPosition.get(sectionKey(a.entry)) ?? editorialOrder.length + a.sourceIndex;
      const bPosition = editorialPosition.get(sectionKey(b.entry)) ?? editorialOrder.length + b.sourceIndex;
      return aPosition - bPosition;
    })
    .map(item => item.entry);

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
    const attributes = window.AWTY_SECTION_ATTRIBUTES(entry);
    const extras = window.AWTY_SECTION_EXTRAS(entry);
    return `<section class="section tpl-${entry.template}" data-section="${position}"${attributes}>${render(entry)}${extras}</section>`;
  }).join('');

  if (indicatorTotal) {
    indicatorTotal.textContent = `/${String(sections.length).padStart(2, '0')}`;
  }

  if (window.AWTYLoop && typeof window.AWTYLoop.init === 'function') {
    window.AWTYLoop.init();
  }
})();
