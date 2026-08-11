// templates.js
// Una función por plantilla: recibe los datos de una sección (según
// schema.js) y devuelve el HTML interno de esa sección. El wrapper
// <section class="section"> lo arma render.js, acá solo va el
// contenido específico de cada molde.

window.AWTY_SECTION_ATTRIBUTES = d => {
  const styles = [];
  if (d.backgroundColor) styles.push(`background-color:${d.backgroundColor}`);
  if (d.textColor) styles.push(`color:${d.textColor}`);
  if (d.accentColor) styles.push(`--custom-accent:${d.accentColor}`);

  const attrs = [];
  if (styles.length) attrs.push(`style="${styles.join(';')}"`);
  if (d.imageFit) attrs.push(`data-image-fit="${d.imageFit}"`);
  if (d.imagePosition) attrs.push(`data-image-position="${d.imagePosition}"`);
  if (d.articleLayout) attrs.push(`data-article-layout="${d.articleLayout}"`);
  return attrs.length ? ` ${attrs.join(' ')}` : '';
};

window.AWTY_SECTION_EXTRAS = d => {
  if (!d.buttonLabel || !d.buttonUrl) return '';
  const newTab = d.buttonNewTab === '1' ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a class="section-cta" href="${d.buttonUrl}"${newTab}>${d.buttonLabel}<span aria-hidden="true">↗</span></a>`;
};

function youtubeId(url = '') {
  const match = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return match ? match[1] : '';
}

window.AWTY_TEMPLATES = {
  cover(d) {
    return `
      <img class="cover__img" src="${d.backgroundImage || ''}" alt="">
      <p class="cover__eyebrow">${d.eyebrow || ''}</p>
      <h1 class="cover__title">${d.title || ''}</h1>
      <p class="cover__issue">${d.issueLine || ''}</p>
    `;
  },

  index(d) {
    const items = (d.items || []).map(item => `
      <li class="index__item">
        <span class="index__number">${item.number || ''}</span>
        <strong class="index__title">${item.title || ''}</strong>
        <em class="index__tag">${item.tag || ''}</em>
      </li>
    `).join('');

    return `
      <header class="index__header">
        <p class="index__label">${d.issueLabel || ''}</p>
        <h2 class="index__heading">${d.heading || ''}</h2>
      </header>
      <ol class="index__list">${items}</ol>
      <p class="index__note">${d.note || ''}</p>
    `;
  },

  photoFeature(d) {
    return `
      <img class="photo-feature__img" src="${d.image || ''}" alt="${d.imageAlt || ''}">
      <div class="photo-feature__panel">
        <p class="photo-feature__kicker">${d.kicker || ''}</p>
        <h2 class="photo-feature__title">${d.title || ''}</h2>
        <p class="photo-feature__body">${d.body || ''}</p>
      </div>
    `;
  },

  duoImage(d) {
    const imgs = d.images || [];
    const figure = (img, mod) => img ? `
      <figure class="duo-image__figure duo-image__figure--${mod}">
        <img src="${img.src || ''}" alt="${img.alt || ''}">
        <figcaption>${img.caption || ''}</figcaption>
      </figure>
    ` : '';

    return `
      <div class="duo-image__title-block">
        <p class="duo-image__kicker">${d.kicker || ''}</p>
        <h2 class="duo-image__title">${d.title || ''}</h2>
      </div>
      ${figure(imgs[0], 'one')}
      ${figure(imgs[1], 'two')}
      <p class="duo-image__note">${d.note || ''}</p>
    `;
  },

  quote(d) {
    const tags = (d.tags || []).map(t => `<span>${t}</span>`).join('');
    return `
      <p class="quote__label">${d.label || ''}</p>
      <blockquote class="quote__text">&ldquo;${d.quote || ''}&rdquo;</blockquote>
      <div class="quote__tags">${tags}</div>
    `;
  },

  article(d) {
    const paragraphs = (d.paragraphs || []).map(p => `<p>${p}</p>`).join('');
    const panelStyles = [];
    if (d.articlePanelBackground === 'transparent') {
      panelStyles.push('background-color:transparent', 'backdrop-filter:none');
    } else if (d.articlePanelBackground === 'glass') {
      const glassColor = d.articlePanelColor || '#111111';
      panelStyles.push(`background-color:color-mix(in srgb, ${glassColor} 72%, transparent)`, 'backdrop-filter:blur(14px)');
    } else if (d.articlePanelColor) {
      panelStyles.push(`background-color:${d.articlePanelColor}`);
    }
    if (d.articleBodyColor) panelStyles.push(`color:${d.articleBodyColor}`);
    const panelStyle = panelStyles.length ? ` style="${panelStyles.join(';')}"` : '';
    return `
      <div class="article__intro" style="background-image:url('${d.backgroundImage || ''}')">
        <p class="article__top-label">${d.topLabel || ''}</p>
        <h2 class="article__title">${d.title || ''}</h2>
        <p class="article__subtitle">${d.subtitle || ''}</p>
      </div>
      <article class="article__panel" aria-label="${d.articleTitle || ''}"${panelStyle}>
        <p class="article__kicker">${d.articleKicker || ''}</p>
        <h3 class="article__headline">${d.articleTitle || ''}</h3>
        <p class="article__author">${d.author || ''}</p>
        <div class="article__body">${paragraphs}</div>
        ${d.note ? `<p class="article__note">${d.note}</p>` : ''}
      </article>
    `;
  },

  listFeature(d) {
    const steps = (d.steps || []).map(s => `<li>${s}</li>`).join('');
    return `
      <div class="list-feature__title-block">
        <p class="list-feature__kicker">${d.kicker || ''}</p>
        <h2 class="list-feature__title">${d.title || ''}</h2>
      </div>
      <img class="list-feature__img" src="${d.image || ''}" alt="${d.imageAlt || ''}">
      <ol class="list-feature__steps">${steps}</ol>
    `;
  },

  outro(d) {
    const credits = (d.credits || []).map(c => `<p>${c}</p>`).join('');
    return `
      <img class="outro__img" src="${d.image || ''}" alt="${d.imageAlt || ''}">
      <div class="outro__overlay"></div>
      <p class="outro__kicker">${d.kicker || ''}</p>
      <h2 class="outro__title">${d.title || ''}</h2>
      <div class="outro__credits">${credits}</div>
    `;
  },

  videoFeature(d) {
    const id = youtubeId(d.youtubeUrl);
    const autoplay = d.autoplay === '1';
    const params = autoplay ? '?autoplay=1&mute=1&loop=1&playlist=' + id + '&controls=0' : '?rel=0';
    const media = id
      ? `<iframe class="video-feature__iframe" src="https://www.youtube-nocookie.com/embed/${id}${params}" title="${d.title || 'Video'}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
      : '<div class="video-feature__empty">Pegá una URL válida de YouTube</div>';
    return `
      ${media}
      <div class="video-feature__shade"></div>
      <div class="video-feature__content">
        <p class="video-feature__kicker">${d.kicker || ''}</p>
        <h2 class="video-feature__title">${d.title || ''}</h2>
        <p class="video-feature__caption">${d.caption || ''}</p>
      </div>
    `;
  }
};
