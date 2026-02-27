// --- Estado en memoria ---
let contactos = [];

// --- Helpers DOM ---
const $ = (sel) => document.querySelector(sel);
const tbody = $("#tbody");
const statusEl = $("#status");

// --- Helpers de seguridad para XML/HTML ---
function escapeXml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  }[c]));
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

// --- Render tabla ---
function render() {
  if (contactos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:#b9c6e6;">No hay contactos.</td></tr>`;
    return;
  }

  tbody.innerHTML = contactos.map((c) => `
    <tr>
      <td>${escapeHtml(c.id)}</td>
      <td>${escapeHtml(c.nombre)}</td>
      <td>${escapeHtml(c.telefono)}</td>
      <td>${escapeHtml(c.mail)}</td>
      <td>${escapeHtml(c.direccion)}</td>
      <td><button class="mini" data-del="${escapeHtml(c.id)}">Eliminar</button></td>
    </tr>
  `).join("");
}

// --- CRUD básico ---
function addContacto(c) {
  // Evitar IDs duplicados
  if (contactos.some(x => x.id === c.id)) {
    throw new Error(`Ya existe un contacto con id=${c.id}`);
  }
  contactos.push(c);
  // Ordenar por id (numérico si aplica)
  contactos.sort((a, b) => {
    const na = Number(a.id), nb = Number(b.id);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return String(a.id).localeCompare(String(b.id));
  });
  render();
}

function deleteContactoById(id) {
  contactos = contactos.filter(c => c.id !== id);
  render();
}

// --- Exportar a XML (id como atributo) ---
function exportToXmlString() {
  // Estructura:
  // <contactos>
  //   <contacto id="1">
  //     <nombre>...</nombre>
  //     ...
  //   </contacto>
  // </contactos>
  const items = contactos.map(c => `
  <contacto id="${escapeXml(c.id)}">
    <nombre>${escapeXml(c.nombre)}</nombre>
    <telefono>${escapeXml(c.telefono)}</telefono>
    <mail>${escapeXml(c.mail)}</mail>
    <direccion>${escapeXml(c.direccion)}</direccion>
  </contacto>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<contactos>
${items}
</contactos>
`;
}

function downloadXml(filename, xmlString) {
  const blob = new Blob([xmlString], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  a.remove();
  URL.revokeObjectURL(url);
}

// --- Importar desde XML ---
function getText(parent, tag) {
  const el = parent.getElementsByTagName(tag)[0];
  return el ? el.textContent.trim() : "";
}

function importFromXmlString(xmlText) {
  const xmlDoc = new DOMParser().parseFromString(xmlText, "application/xml");

  // Detectar errores de parseo
  const parserError = xmlDoc.getElementsByTagName("parsererror")[0];
  if (parserError) {
    throw new Error("XML inválido o mal formado.");
  }

  const root = xmlDoc.getElementsByTagName("contactos")[0];
  if (!root) {
    throw new Error("No se encontró el elemento raíz <contactos>.");
  }

  const nodes = Array.from(root.getElementsByTagName("contacto"));

  const imported = nodes.map(node => {
    const id = node.getAttribute("id")?.trim() || "";
    if (!id) throw new Error("Hay un <contacto> sin atributo id.");

    return {
      id,
      nombre: getText(node, "nombre"),
      telefono: getText(node, "telefono"),
      mail: getText(node, "mail"),
      direccion: getText(node, "direccion"),
    };
  });

  // Reemplazar lista completa (puedes cambiar a "mezclar" si prefieres)
  contactos = [];
  // Validar duplicados dentro del XML
  const seen = new Set();
  for (const c of imported) {
    if (seen.has(c.id)) throw new Error(`ID duplicado en el XML: ${c.id}`);
    seen.add(c.id);
    contactos.push(c);
  }

  render();
  return imported.length;
}

// --- Eventos UI ---
$("#form").addEventListener("submit", (ev) => {
  ev.preventDefault();
  setStatus("");

  const c = {
    id: $("#id").value.trim(),
    nombre: $("#nombre").value.trim(),
    telefono: $("#telefono").value.trim(),
    mail: $("#mail").value.trim(),
    direccion: $("#direccion").value.trim(),
  };

  if (!c.id || !c.nombre) {
    setStatus("ID y Nombre son obligatorios.");
    return;
  }

  try {
    addContacto(c);
    setStatus("Contacto agregado.");
    ev.target.reset();
    $("#id").focus();
  } catch (e) {
    setStatus("Error: " + (e?.message || String(e)));
  }
});

$("#clear").addEventListener("click", () => {
  contactos = [];
  render();
  setStatus("Lista vaciada.");
});

$("#export").addEventListener("click", () => {
  const xml = exportToXmlString();
  const stamp = new Date().toISOString().slice(0, 10);
  downloadXml(`contactos_${stamp}.xml`, xml);
  setStatus("XML exportado.");
});

$("#importFile").addEventListener("change", async (ev) => {
  setStatus("");
  const file = ev.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const count = importFromXmlString(text);
    setStatus(`Importados ${count} contacto(s) desde XML.`);
  } catch (e) {
    setStatus("Error importando: " + (e?.message || String(e)));
  } finally {
    // Permite volver a importar el mismo archivo si se elige otra vez
    ev.target.value = "";
  }
});

// Delegación para borrar
tbody.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button[data-del]");
  if (!btn) return;
  deleteContactoById(btn.dataset.del);
  setStatus("Contacto eliminado.");
});

// Inicial
render();