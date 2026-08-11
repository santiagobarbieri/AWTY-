// schema.js
// Define qué campos tiene cada plantilla y cómo se editan en el panel.
// Este archivo es la única fuente de verdad sobre la forma de una
// sección: agregar un campo acá lo agrega automáticamente al admin.
// types de campo soportados por el panel: "text", "textarea", "url",
// "color", "select", "image", "list-text" y "list-item"
// (lista de objetos con sub-campos, ver "index" e "imágenes duo").

window.AWTY_SCHEMA = {
  cover: {
    label: "Portada",
    hint: "Título grande a pantalla completa con imagen de fondo.",
    fields: [
      { key: "eyebrow", label: "Eyebrow (sello superior)", type: "text" },
      { key: "title", label: "Título (usá <br> para cortar línea)", type: "textarea" },
      { key: "issueLine", label: "Línea de edición", type: "text" },
      { key: "backgroundImage", label: "Imagen de fondo", type: "image" }
    ]
  },
  index: {
    label: "Índice",
    hint: "Tabla de contenidos de la edición.",
    fields: [
      { key: "issueLabel", label: "Etiqueta de edición", type: "text" },
      { key: "heading", label: "Título", type: "text" },
      {
        key: "items", label: "Ítems del índice", type: "list-item",
        itemFields: [
          { key: "number", label: "Número de página" },
          { key: "title", label: "Título de la nota" },
          { key: "tag", label: "Categoría" }
        ]
      },
      { key: "note", label: "Nota al pie", type: "textarea" }
    ]
  },
  photoFeature: {
    label: "Nota fotográfica",
    hint: "Foto grande + un párrafo corto. Para ensayos visuales, escenas, crónicas breves.",
    fields: [
      { key: "image", label: "Imagen", type: "image" },
      { key: "imageAlt", label: "Descripción de la imagen (accesibilidad)", type: "text" },
      { key: "kicker", label: "Kicker (categoría / número)", type: "text" },
      { key: "title", label: "Título (usá <br> para cortar línea)", type: "textarea" },
      { key: "body", label: "Párrafo (mantenelo corto — una idea)", type: "textarea" }
    ]
  },
  duoImage: {
    label: "Par de imágenes",
    hint: "Dos imágenes en diálogo, para archivo o hallazgos.",
    fields: [
      { key: "kicker", label: "Kicker", type: "text" },
      { key: "title", label: "Título (usá <br> para cortar línea)", type: "textarea" },
      {
        key: "images", label: "Imágenes", type: "list-item",
        itemFields: [
          { key: "src", label: "Imagen", isImage: true },
          { key: "alt", label: "Descripción (accesibilidad)" },
          { key: "caption", label: "Pie de foto" }
        ]
      },
      { key: "note", label: "Nota", type: "textarea" }
    ]
  },
  quote: {
    label: "Cita / Intermedio",
    hint: "Pausa editorial. Una frase, sin imagen.",
    fields: [
      { key: "label", label: "Etiqueta", type: "text" },
      { key: "quote", label: "Cita", type: "textarea" },
      { key: "tags", label: "Palabras sueltas (una por línea)", type: "list-text" }
    ]
  },
  article: {
    label: "Nota larga",
    hint: "El único formato con texto extenso — para entrevistas o crónicas profundas.",
    fields: [
      { key: "backgroundImage", label: "Imagen de fondo", type: "image" },
      { key: "topLabel", label: "Etiqueta superior", type: "text" },
      { key: "title", label: "Título corto", type: "text" },
      { key: "subtitle", label: "Bajada corta", type: "text" },
      { key: "articleKicker", label: "Kicker del artículo", type: "text" },
      { key: "articleTitle", label: "Título del artículo", type: "text" },
      { key: "author", label: "Autor/a", type: "text" },
      { key: "paragraphs", label: "Párrafos (uno por línea)", type: "list-text" },
      { key: "note", label: "Nota al pie", type: "text" },
      { key: "articlePanelColor", label: "Fondo del bloque de lectura", type: "color", group: "Colores del artículo" },
      { key: "articleBodyColor", label: "Texto del bloque de lectura", type: "color", group: "Colores del artículo" }
    ]
  },
  listFeature: {
    label: "Guía / Pasos",
    hint: "Manual breve o lista de instrucciones con imagen.",
    fields: [
      { key: "kicker", label: "Kicker", type: "text" },
      { key: "title", label: "Título (usá <br> para cortar línea)", type: "textarea" },
      { key: "image", label: "Imagen", type: "image" },
      { key: "imageAlt", label: "Descripción de la imagen (accesibilidad)", type: "text" },
      { key: "steps", label: "Pasos (uno por línea)", type: "list-text" }
    ]
  },
  outro: {
    label: "Cierre",
    hint: "Última sección — créditos y despedida.",
    fields: [
      { key: "image", label: "Imagen de fondo", type: "image" },
      { key: "imageAlt", label: "Descripción de la imagen (accesibilidad)", type: "text" },
      { key: "kicker", label: "Kicker", type: "text" },
      { key: "title", label: "Título (usá <br> para cortar línea)", type: "textarea" },
      { key: "credits", label: "Créditos (uno por línea)", type: "list-text" }
    ]
  },
  videoFeature: {
    label: "Video / YouTube",
    hint: "Video a pantalla completa con título y enlace opcional. Pegá cualquier URL normal de YouTube o youtu.be.",
    fields: [
      { key: "youtubeUrl", label: "URL de YouTube", type: "url" },
      { key: "kicker", label: "Kicker", type: "text" },
      { key: "title", label: "Título (usá <br> para cortar línea)", type: "textarea" },
      { key: "caption", label: "Texto breve", type: "textarea" },
      { key: "autoplay", label: "Reproducción", type: "select", options: [
        { value: "0", label: "Manual" },
        { value: "1", label: "Automática, muda y en loop" }
      ] }
    ]
  }
};

const AWTY_COMMON_FIELDS = [
  { key: "backgroundColor", label: "Color de fondo personalizado", type: "color", group: "Personalización" },
  { key: "textColor", label: "Color de texto personalizado", type: "color", group: "Personalización" },
  { key: "accentColor", label: "Color de acento / botón", type: "color", group: "Personalización" },
  { key: "imageFit", label: "Ajuste de las fotos", type: "select", group: "Personalización", options: [
    { value: "", label: "Usar diseño original" },
    { value: "cover", label: "Llenar el espacio" },
    { value: "contain", label: "Mostrar foto completa" }
  ] },
  { key: "imagePosition", label: "Foco de las fotos", type: "select", group: "Personalización", options: [
    { value: "", label: "Centro / original" },
    { value: "top", label: "Arriba" },
    { value: "bottom", label: "Abajo" },
    { value: "left", label: "Izquierda" },
    { value: "right", label: "Derecha" }
  ] },
  { key: "buttonLabel", label: "Texto del botón", type: "text", group: "Botón / enlace" },
  { key: "buttonUrl", label: "URL del botón", type: "url", group: "Botón / enlace" },
  { key: "buttonNewTab", label: "Apertura del enlace", type: "select", group: "Botón / enlace", options: [
    { value: "", label: "Misma pestaña" },
    { value: "1", label: "Nueva pestaña" }
  ] }
];

Object.values(window.AWTY_SCHEMA).forEach(definition => {
  definition.fields.push(...AWTY_COMMON_FIELDS.map(field => ({ ...field })));
});
