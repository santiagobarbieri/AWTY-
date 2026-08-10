(() => {
  const listEl = document.getElementById('sectionList');
  const addSelect = document.getElementById('addTemplateSelect');
  const btnAdd = document.getElementById('btnAdd');
  const btnDownload = document.getElementById('btnDownload');
  const btnCopy = document.getElementById('btnCopy');
  const statusEl = document.getElementById('adminStatus');
  const editorEmpty = document.getElementById('editorEmpty');
  const editorForm = document.getElementById('editorForm');
  const previewFrame = document.getElementById('previewFrame');

  const schema = window.AWTY_SCHEMA;
  const templates = window.AWTY_TEMPLATES;

  let sections = [];
  let activeIndex = -1;
  let dirty = false;

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function markDirty() {
    dirty = true;
    setStatus('cambios sin descargar');
  }

  // ---------- carga inicial ----------

  async function load() {
    try {
      const res = await fetch('./content.json');
      sections = await res.json();
      setStatus(`${sections.length} secciones cargadas`);
    } catch (err) {
      sections = [];
      setStatus('no se pudo cargar content.json');
      console.error(err);
    }
    renderTemplateOptions();
    renderList();
  }

  function renderTemplateOptions() {
    addSelect.innerHTML = Object.entries(schema)
      .map(([key, def]) => `<option value="${key}">${def.label}</option>`)
      .join('');
  }

  function defaultValueFor(field) {
    if (field.type === 'list-text') return [];
    if (field.type === 'list-item') return [];
    return '';
  }

  function blankEntry(templateKey) {
    const def = schema[templateKey];
    const entry = { template: templateKey };
    def.fields.forEach(f => { entry[f.key] = defaultValueFor(f); });
    return entry;
  }

  // ---------- lista lateral ----------

  function renderList() {
    listEl.innerHTML = '';
    sections.forEach((entry, idx) => {
      const def = schema[entry.template] || { label: entry.template };
      const titleGuess = entry.title || entry.heading || entry.quote || entry.articleTitle || '(sin título)';

      const li = document.createElement('li');
      li.className = 'admin__list-item' + (idx === activeIndex ? ' is-active' : '');
      li.innerHTML = `
        <span class="admin__list-item-id">${String(idx + 1).padStart(2, '0')}</span>
        <span class="admin__list-item-info">
          <div class="admin__list-item-title">${stripTags(titleGuess)}</div>
          <div class="admin__list-item-tpl">${def.label}</div>
        </span>
        <span class="admin__list-item-actions">
          <button class="admin__icon-btn" data-action="up" title="Subir" ${idx === 0 ? 'disabled' : ''}>↑</button>
          <button class="admin__icon-btn" data-action="down" title="Bajar" ${idx === sections.length - 1 ? 'disabled' : ''}>↓</button>
          <button class="admin__icon-btn" data-action="delete" title="Eliminar">✕</button>
        </span>
      `;

      li.querySelector('.admin__list-item-info').addEventListener('click', () => selectSection(idx));
      li.querySelector('[data-action="up"]').addEventListener('click', e => { e.stopPropagation(); moveSection(idx, -1); });
      li.querySelector('[data-action="down"]').addEventListener('click', e => { e.stopPropagation(); moveSection(idx, 1); });
      li.querySelector('[data-action="delete"]').addEventListener('click', e => { e.stopPropagation(); deleteSection(idx); });

      listEl.appendChild(li);
    });
  }

  function stripTags(str) {
    return String(str).replace(/<[^>]*>/g, ' / ');
  }

  function moveSection(idx, dir) {
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    [sections[idx], sections[target]] = [sections[target], sections[idx]];
    if (activeIndex === idx) activeIndex = target;
    else if (activeIndex === target) activeIndex = idx;
    markDirty();
    renderList();
    renderEditor();
  }

  function deleteSection(idx) {
    if (!confirm('¿Eliminar esta sección? No se puede deshacer acá — pero si ya descargaste una versión anterior del JSON, siempre podés volver a subir esa.')) return;
    sections.splice(idx, 1);
    if (activeIndex === idx) activeIndex = -1;
    else if (activeIndex > idx) activeIndex -= 1;
    markDirty();
    renderList();
    renderEditor();
  }

  function selectSection(idx) {
    activeIndex = idx;
    renderList();
    renderEditor();
  }

  btnAdd.addEventListener('click', () => {
    const entry = blankEntry(addSelect.value);
    sections.push(entry);
    activeIndex = sections.length - 1;
    markDirty();
    renderList();
    renderEditor();
  });

  // ---------- editor de campos ----------

  function renderEditor() {
    if (activeIndex < 0 || !sections[activeIndex]) {
      editorEmpty.hidden = false;
      editorForm.hidden = true;
      renderPreview(null);
      return;
    }

    editorEmpty.hidden = true;
    editorForm.hidden = false;
    editorForm.innerHTML = '';

    const entry = sections[activeIndex];
    const def = schema[entry.template];
    if (!def) {
      editorForm.innerHTML = `<p>Plantilla desconocida: ${entry.template}</p>`;
      return;
    }

    const hint = document.createElement('p');
    hint.className = 'admin__form-hint';
    hint.textContent = def.hint || '';
    editorForm.appendChild(hint);

    def.fields.forEach(field => {
      editorForm.appendChild(buildField(entry, field));
    });

    renderPreview(entry);
  }

  function buildField(entry, field) {
    const wrap = document.createElement('div');
    wrap.className = 'admin__field';

    const label = document.createElement('label');
    label.textContent = field.label;
    wrap.appendChild(label);

    if (field.type === 'textarea') {
      const textarea = document.createElement('textarea');
      textarea.value = entry[field.key] || '';
      textarea.addEventListener('input', () => {
        entry[field.key] = textarea.value;
        onFieldChange(entry);
      });
      wrap.appendChild(textarea);

    } else if (field.type === 'image') {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = './assets/images/nombre-de-archivo.jpg';
      input.value = entry[field.key] || '';

      const img = document.createElement('img');
      img.className = 'admin__image-preview' + (input.value ? ' has-src' : '');
      img.src = resolveAssetPath(input.value);
      img.onerror = () => img.classList.remove('has-src');
      img.onload = () => { if (input.value) img.classList.add('has-src'); };

      input.addEventListener('input', () => {
        entry[field.key] = input.value;
        img.src = resolveAssetPath(input.value);
        onFieldChange(entry);
      });

      wrap.appendChild(input);
      wrap.appendChild(img);

    } else if (field.type === 'list-text') {
      const textarea = document.createElement('textarea');
      textarea.value = (entry[field.key] || []).join('\n');
      textarea.addEventListener('input', () => {
        entry[field.key] = textarea.value.split('\n').map(s => s.trim()).filter(Boolean);
        onFieldChange(entry);
      });
      wrap.appendChild(textarea);

    } else if (field.type === 'list-item') {
      wrap.appendChild(buildListItemEditor(entry, field));

    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = entry[field.key] || '';
      input.addEventListener('input', () => {
        entry[field.key] = input.value;
        onFieldChange(entry);
      });
      wrap.appendChild(input);
    }

    return wrap;
  }

  function buildListItemEditor(entry, field) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';

    if (!Array.isArray(entry[field.key])) entry[field.key] = [];

    function redraw() {
      container.innerHTML = '';
      entry[field.key].forEach((item, i) => {
        const block = document.createElement('div');
        block.className = 'admin__list-item-block';

        field.itemFields.forEach(sub => {
          const subLabel = document.createElement('label');
          subLabel.textContent = sub.label;
          subLabel.style.fontSize = '10px';
          subLabel.style.opacity = '0.6';

          const subInput = document.createElement('input');
          subInput.type = 'text';
          subInput.value = item[sub.key] || '';
          subInput.placeholder = sub.isImage ? './assets/images/archivo.jpg' : '';
          subInput.addEventListener('input', () => {
            item[sub.key] = subInput.value;
            onFieldChange(entry);
          });

          block.appendChild(subLabel);
          block.appendChild(subInput);
        });

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'admin__remove-row';
        removeBtn.textContent = 'Quitar';
        removeBtn.addEventListener('click', () => {
          entry[field.key].splice(i, 1);
          redraw();
          onFieldChange(entry);
        });

        block.appendChild(removeBtn);
        container.appendChild(block);
      });

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'admin__add-row';
      addBtn.textContent = '+ Agregar ítem';
      addBtn.addEventListener('click', () => {
        const blank = {};
        field.itemFields.forEach(sub => { blank[sub.key] = ''; });
        entry[field.key].push(blank);
        redraw();
        onFieldChange(entry);
      });
      container.appendChild(addBtn);
    }

    redraw();
    return container;
  }

  function onFieldChange(entry) {
    markDirty();
    renderPreview(entry);
    // Actualiza el título mostrado en la lista sin redibujar todo.
    const li = listEl.children[activeIndex];
    if (li) {
      const titleGuess = entry.title || entry.heading || entry.quote || entry.articleTitle || '(sin título)';
      li.querySelector('.admin__list-item-title').textContent = stripTags(titleGuess);
    }
  }

  function resolveAssetPath(path) {
    return path || '';
  }

  // ---------- vista previa ----------

  function renderPreview(entry) {
    if (!entry) {
      previewFrame.srcdoc = '';
      return;
    }

    const render = templates[entry.template];
    if (!render) return;

    const templateFileMap = {
      cover: 'cover', index: 'index', photoFeature: 'photo-feature',
      duoImage: 'duo-image', quote: 'quote', article: 'article',
      listFeature: 'list-feature', outro: 'outro'
    };
    const cssFile = templateFileMap[entry.template] || entry.template;

    const style = entry.template === 'cover' && entry.backgroundImage
      ? ` style="--cover-image:url('${entry.backgroundImage.replace(/^\./, '')}')"`
      : '';

    // admin.html vive en la raíz, igual que index.html, por lo que las
    // rutas de las plantillas se pueden usar sin transformarlas.
    const html = render(entry);

    previewFrame.srcdoc = `<!doctype html>
<html><head>
<link rel="stylesheet" href="./css/global.css">
<link rel="stylesheet" href="./css/${cssFile}.css">
<style>html,body{height:100%;overflow:hidden}</style>
</head>
<body>
<section class="section tpl-${entry.template}"${style}>${html}</section>
</body></html>`;
  }

  // ---------- exportar ----------

  btnDownload.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(sections, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content.json';
    a.click();
    URL.revokeObjectURL(url);
    dirty = false;
    setStatus('descargado ✓');
  });

  btnCopy.addEventListener('click', async () => {
    await navigator.clipboard.writeText(JSON.stringify(sections, null, 2));
    setStatus('copiado ✓');
  });

  window.addEventListener('beforeunload', e => {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  load();
})();
