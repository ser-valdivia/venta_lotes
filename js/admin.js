/**
 * LÓGICA DEL PANEL DE ADMINISTRACIÓN - CÓRDOBA SERRANA INMUEBLES
 * -------------------------------------------------------------
 * Integrado con Google Sign-In y Google Cloud Firestore (Tiempo Real).
 */

let inventarioInmuebles = [];
let adminMap = null;
let currentMarker = null;
let currentPolygonLayer = null;

let modoMapaActual = "pin"; // "pin" o "poligono"
let coordenadasSeleccionadas = [-31.4555, -64.5575]; // [Lat, Lng]
let poligonoSeleccionado = []; // [[Lat, Lng], ...]

// Inicialización con listener de autenticación
document.addEventListener("DOMContentLoaded", () => {
  // Detectar si se está ejecutando desde archivo local (file://)
  if (window.location.protocol === "file:") {
    const avisoEl = document.getElementById("aviso-file-protocol");
    if (avisoEl) avisoEl.style.display = "block";
  }

  verificarEstadoAutenticacion();
});

function entrarModoLocalOffline() {
  mostrarPanelAdmin({ email: ADMIN_EMAIL_AUTORIZADO + " (Modo Local)" });
  inicializarDatosAdmin();
}

// GESTIÓN DE ACCESO CON GOOGLE
function verificarEstadoAutenticacion() {
  if (typeof auth !== "undefined" && auth) {
    auth.onAuthStateChanged(async (user) => {
      if (user && user.email.toLowerCase() === ADMIN_EMAIL_AUTORIZADO.toLowerCase()) {
        mostrarPanelAdmin(user);
        await inicializarDatosAdmin();
      } else {
        mostrarPantallaLogin();
      }
    });
  } else {
    // Si aún no están cargadas las claves de Firebase, permitir modo desarrollo local
    console.warn("Firebase no activo o en desarrollo local.");
    mostrarPantallaLogin();
  }
}

async function iniciarSesionAdmin() {
  const user = await loginConGoogle();
  if (user) {
    mostrarPanelAdmin(user);
    await inicializarDatosAdmin();
  }
}

function mostrarPantallaLogin() {
  document.getElementById("seccion-login").style.display = "flex";
  document.getElementById("seccion-panel-admin").style.display = "none";
}

function mostrarPanelAdmin(user) {
  document.getElementById("seccion-login").style.display = "none";
  document.getElementById("seccion-panel-admin").style.display = "block";
  const userEmailEl = document.getElementById("admin-user-email");
  if (userEmailEl && user) {
    userEmailEl.textContent = user.email;
  }
}

// CARGA DE DATOS (FIRESTORE CON FALLBACK)
async function inicializarDatosAdmin() {
  // Intentar cargar desde Firestore
  const datosFirestore = await obtenerInmueblesDesdeFirestore();

  if (datosFirestore !== null && datosFirestore.length > 0) {
    inventarioInmuebles = datosFirestore;
  } else if (datosFirestore !== null && datosFirestore.length === 0) {
    // Firestore está configurado pero vacío: sembrar con datos de data.js
    await sembrarDatosInicialesEnFirestore(lotesData);
    inventarioInmuebles = [...lotesData];
  } else {
    // Modo local / Fallback a LocalStorage o data.js
    const guardado = localStorage.getItem("cordoba_serrana_inventario");
    if (guardado) {
      try { inventarioInmuebles = JSON.parse(guardado); } catch (e) { inventarioInmuebles = [...lotesData]; }
    } else {
      inventarioInmuebles = [...lotesData];
    }
  }

  inventarioInmuebles.sort((a, b) => (a.orden || 999) - (b.orden || 999));
  renderizarTablaInmuebles();
  await cargarMetricasAdmin();
}

// CARGAR MÉTRICAS Y CONTADORES EN TIEMPO REAL
async function cargarMetricasAdmin() {
  if (typeof obtenerMetricasAcumuladas === "function") {
    try {
      const metricas = await obtenerMetricasAcumuladas();
      const elVisitas = document.getElementById("metrica-visitas");
      const elWhatsApp = document.getElementById("metrica-whatsapp");
      const elEmail = document.getElementById("metrica-email");
      const elConversion = document.getElementById("metrica-conversion");

      const visitas = metricas.totalVisitas || 0;
      const whatsapp = metricas.clicsWhatsApp || 0;
      const email = metricas.consultasEmail || 0;

      if (elVisitas) elVisitas.textContent = visitas.toLocaleString();
      if (elWhatsApp) elWhatsApp.textContent = whatsapp.toLocaleString();
      if (elEmail) elEmail.textContent = email.toLocaleString();

      if (elConversion) {
        const totalContactos = whatsapp + email;
        const tasa = visitas > 0 ? ((totalContactos / visitas) * 100).toFixed(1) : "0.0";
        elConversion.textContent = `${tasa}%`;
      }
    } catch (e) {
      console.warn("No se pudieron cargar las métricas:", e);
    }
  }
}

function persistirInventarioLocal() {
  localStorage.setItem("cordoba_serrana_inventario", JSON.stringify(inventarioInmuebles));
}

// RENDERIZAR TABLA EN ADMIN
function renderizarTablaInmuebles() {
  const tbody = document.getElementById("tabla-inmuebles-body");
  if (!tbody) return;

  if (inventarioInmuebles.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-2"></i>
          No hay inmuebles cargados. Presiona <strong>"Cargar Nuevo Inmueble"</strong> para comenzar.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = inventarioInmuebles.map((inmueble, index) => {
    const fotoPortada = (inmueble.fotos && inmueble.fotos.length > 0)
      ? convertirUrlGoogleDrive(inmueble.fotos[0])
      : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80";

    const isPublicado = inmueble.publicado !== false;

    return `
      <tr class="${!isPublicado ? 'table-light opacity-75' : ''}">
        <td>
          <input type="number" class="form-control order-input" value="${inmueble.orden || (index + 1)}" min="1" 
            onchange="actualizarOrdenInmueble('${inmueble.id}', this.value)" title="Cambiar orden de posición">
        </td>
        <td>
          <img src="${fotoPortada}" class="photo-preview-box" alt="Foto" onerror="this.src='https://placehold.co/100x70?text=Sin+Foto'">
        </td>
        <td>
          <strong class="d-block text-dark">${inmueble.titulo || inmueble.numero}</strong>
          <small class="text-muted">${inmueble.manzana || ''}</small>
        </td>
        <td>
          <span class="badge-tipo badge-tipo-${inmueble.tipo || 'lote'}">
            ${getNombreTipoInmueble(inmueble.tipo)}
          </span>
        </td>
        <td>
          <small class="fw-semibold text-secondary"><i class="bi bi-geo-alt-fill text-danger me-1"></i>${inmueble.ubicacion}</small>
        </td>
        <td>
          <strong class="text-dark">${inmueble.precio || '$' + (inmueble.precioUSD || 0)}</strong>
        </td>
        <td>
          <span class="badge-lote badge-${inmueble.estado}">${inmueble.estado}</span>
        </td>
        <td>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="switch-pub-${inmueble.id}" 
              ${isPublicado ? 'checked' : ''} onchange="togglePublicadoInmueble('${inmueble.id}')">
            <label class="form-check-label small fw-semibold ${isPublicado ? 'text-success' : 'text-muted'}" for="switch-pub-${inmueble.id}">
              ${isPublicado ? 'Visible' : 'Oculto'}
            </label>
          </div>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirModalEditarInmueble('${inmueble.id}')" title="Editar Inmueble">
            <i class="bi bi-pencil-fill"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarInmueble('${inmueble.id}')" title="Eliminar">
            <i class="bi bi-trash-fill"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function getNombreTipoInmueble(tipo) {
  switch (tipo) {
    case "departamento": return "Departamento";
    case "local": return "Local Comercial";
    case "casa": return "Casa / Cabaña";
    case "lote":
    default: return "Lote / Terreno";
  }
}

// ACTUALIZAR ORDEN EN TIEMPO REAL
async function actualizarOrdenInmueble(id, nuevoOrden) {
  const inmueble = inventarioInmuebles.find(i => i.id === id);
  if (!inmueble) return;
  const ordenNum = parseInt(nuevoOrden) || 1;
  inmueble.orden = ordenNum;

  // Actualizar en Firestore en tiempo real
  await actualizarCampoInmuebleFirestore(id, "orden", ordenNum);

  inventarioInmuebles.sort((a, b) => (a.orden || 999) - (b.orden || 999));
  persistirInventarioLocal();
  renderizarTablaInmuebles();
}

// TOGGLE PUBLICADO EN TIEMPO REAL
async function togglePublicadoInmueble(id) {
  const inmueble = inventarioInmuebles.find(i => i.id === id);
  if (!inmueble) return;
  const nuevoEstado = !(inmueble.publicado !== false);
  inmueble.publicado = nuevoEstado;

  // Actualizar en Firestore en tiempo real
  await actualizarCampoInmuebleFirestore(id, "publicado", nuevoEstado);

  persistirInventarioLocal();
  renderizarTablaInmuebles();
}

// ELIMINAR EN TIEMPO REAL
async function eliminarInmueble(id) {
  const inmueble = inventarioInmuebles.find(i => i.id === id);
  if (!inmueble) return;
  if (confirm(`¿Estás seguro de eliminar "${inmueble.titulo || inmueble.numero}"?`)) {
    // Eliminar de Firestore
    await eliminarInmuebleDeFirestore(id);

    inventarioInmuebles = inventarioInmuebles.filter(i => i.id !== id);
    persistirInventarioLocal();
    renderizarTablaInmuebles();
  }
}

// MODAL DE ALTA / EDICIÓN
function abrirModalNuevoInmueble() {
  document.getElementById("formInmueble").reset();
  document.getElementById("form-id").value = "";
  document.getElementById("modalFormTitulo").innerHTML = '<i class="bi bi-plus-circle-fill me-2 text-warning"></i> Cargar Nuevo Inmueble';
  
  const maxOrden = inventarioInmuebles.reduce((max, i) => Math.max(max, i.orden || 0), 0);
  document.getElementById("form-orden").value = maxOrden + 1;

  coordenadasSeleccionadas = [-31.4555, -64.5575];
  poligonoSeleccionado = [];

  document.getElementById("fotos-inputs-container").innerHTML = "";
  agregarCampoFoto("");

  actualizarDisplayCoordenadas();

  const modal = new bootstrap.Modal(document.getElementById("modalInmuebleForm"));
  modal.show();

  setTimeout(initAdminMap, 300);
}

function abrirModalEditarInmueble(id) {
  const inm = inventarioInmuebles.find(i => i.id === id);
  if (!inm) return;

  document.getElementById("form-id").value = inm.id;
  document.getElementById("modalFormTitulo").innerHTML = `<i class="bi bi-pencil-square me-2 text-warning"></i> Editar: ${inm.titulo || inm.numero}`;

  document.getElementById("form-titulo").value = inm.titulo || inm.numero || "";
  document.getElementById("form-tipo").value = inm.tipo || "lote";
  document.getElementById("form-estado").value = inm.estado || "disponible";
  document.getElementById("form-ubicacion").value = inm.ubicacion || "Villa Icho Cruz";
  document.getElementById("form-manzana").value = inm.manzana || "";
  document.getElementById("form-zonaDetalle").value = inm.zonaDetalle || "";
  document.getElementById("form-precioUSD").value = inm.precioUSD || 0;
  document.getElementById("form-superficie").value = inm.superficie || 0;
  document.getElementById("form-dimensiones").value = inm.dimensiones || "";
  document.getElementById("form-orden").value = inm.orden || 1;
  document.getElementById("form-descripcion").value = inm.descripcion || "";
  document.getElementById("form-caracteristicas").value = (inm.caracteristicas || []).join(", ");

  const prop = inm.propietario || {};
  document.getElementById("form-owner-name").value = prop.nombre || "";
  document.getElementById("form-owner-email").value = prop.email || "";
  document.getElementById("form-owner-phone").value = prop.telefono || "";
  document.getElementById("form-owner-whatsapp").value = prop.whatsapp || "";

  const canales = (inm.contacto && inm.contacto.canales) ? inm.contacto.canales : { whatsapp: true, email: true, telefono: false };
  document.getElementById("check-canal-whatsapp").checked = canales.whatsapp !== false;
  document.getElementById("check-canal-email").checked = canales.email !== false;
  document.getElementById("check-canal-telefono").checked = canales.telefono === true;

  const viaPrin = (inm.contacto && inm.contacto.viaPrincipal) ? inm.contacto.viaPrincipal : "whatsapp";
  if (viaPrin === "email") {
    document.getElementById("via-prin-email").checked = true;
  } else {
    document.getElementById("via-prin-wa").checked = true;
  }

  coordenadasSeleccionadas = inm.coordenadas || [-31.4555, -64.5575];
  poligonoSeleccionado = inm.poligono ? [...inm.poligono] : [];
  actualizarDisplayCoordenadas();

  const containerFotos = document.getElementById("fotos-inputs-container");
  containerFotos.innerHTML = "";
  if (inm.fotos && inm.fotos.length > 0) {
    inm.fotos.forEach(f => agregarCampoFoto(f));
  } else {
    agregarCampoFoto("");
  }

  const modal = new bootstrap.Modal(document.getElementById("modalInmuebleForm"));
  modal.show();

  setTimeout(initAdminMap, 300);
}

// MAPA DEL ADMIN
function initAdminMap() {
  const mapDiv = document.getElementById("admin-map");
  if (!mapDiv) return;

  if (!adminMap) {
    adminMap = L.map("admin-map").setView(coordenadasSeleccionadas, 16);

    const satelital = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "Esri Satellite"
    }).addTo(adminMap);

    const callejero = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "OpenStreetMap"
    });

    L.control.layers({ "🌍 Satelital": satelital, "🗺️ Callejero": callejero }, null, { position: "topright" }).addTo(adminMap);
    adminMap.on("click", onAdminMapClick);
  } else {
    adminMap.invalidateSize();
    adminMap.setView(coordenadasSeleccionadas, 16);
  }

  dibujarEnMapaAdmin();
}

function setModoMapa(modo) {
  modoMapaActual = modo;
  const btnDeshacer = document.getElementById("btn-deshacer-punto");
  const btnLimpiar = document.getElementById("btn-limpiar-poligono");

  if (modo === "poligono") {
    btnDeshacer.disabled = poligonoSeleccionado.length === 0;
    btnLimpiar.disabled = poligonoSeleccionado.length === 0;
  } else {
    btnDeshacer.disabled = true;
    btnLimpiar.disabled = poligonoSeleccionado.length === 0;
  }
}

function onAdminMapClick(e) {
  const latLng = [parseFloat(e.latlng.lat.toFixed(6)), parseFloat(e.latlng.lng.toFixed(6))];

  if (modoMapaActual === "pin") {
    coordenadasSeleccionadas = latLng;
  } else if (modoMapaActual === "poligono") {
    poligonoSeleccionado.push(latLng);
    document.getElementById("btn-deshacer-punto").disabled = false;
    document.getElementById("btn-limpiar-poligono").disabled = false;
  }

  dibujarEnMapaAdmin();
  actualizarDisplayCoordenadas();
}

function dibujarEnMapaAdmin() {
  if (!adminMap) return;

  if (currentMarker) adminMap.removeLayer(currentMarker);
  if (coordenadasSeleccionadas) {
    currentMarker = L.marker(coordenadasSeleccionadas, { draggable: true }).addTo(adminMap);
    currentMarker.on("dragend", (e) => {
      const pos = e.target.getLatLng();
      coordenadasSeleccionadas = [parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6))];
      actualizarDisplayCoordenadas();
    });
  }

  if (currentPolygonLayer) adminMap.removeLayer(currentPolygonLayer);
  if (poligonoSeleccionado && poligonoSeleccionado.length > 0) {
    currentPolygonLayer = L.polygon(poligonoSeleccionado, {
      color: "#10b981",
      fillColor: "#10b981",
      fillOpacity: 0.4,
      weight: 3
    }).addTo(adminMap);
  }
}

function deshacerUltimoPuntoPoligono() {
  if (poligonoSeleccionado.length > 0) {
    poligonoSeleccionado.pop();
    dibujarEnMapaAdmin();
    actualizarDisplayCoordenadas();
    if (poligonoSeleccionado.length === 0) {
      document.getElementById("btn-deshacer-punto").disabled = true;
      document.getElementById("btn-limpiar-poligono").disabled = true;
    }
  }
}

function limpiarPoligonoMapa() {
  poligonoSeleccionado = [];
  dibujarEnMapaAdmin();
  actualizarDisplayCoordenadas();
  document.getElementById("btn-deshacer-punto").disabled = true;
  document.getElementById("btn-limpiar-poligono").disabled = true;
}

function cambiarCentroMapaSegunZona(zona) {
  if (!adminMap) return;
  if (zona === "Córdoba Capital") {
    coordenadasSeleccionadas = [-31.4201, -64.1888];
  } else {
    coordenadasSeleccionadas = [-31.4555, -64.5575];
  }
  adminMap.setView(coordenadasSeleccionadas, 15);
  dibujarEnMapaAdmin();
  actualizarDisplayCoordenadas();
}

function actualizarDisplayCoordenadas() {
  const elCoord = document.getElementById("form-coordenadas-display");
  const elCount = document.getElementById("form-poligono-count");
  if (elCoord) elCoord.value = `Lat: ${coordenadasSeleccionadas[0]}, Lng: ${coordenadasSeleccionadas[1]}`;
  if (elCount) elCount.value = `${poligonoSeleccionado.length} vértices trazados`;
}

// GESTOR DE FOTOS Y GOOGLE DRIVE
function agregarCampoFoto(url = "") {
  const container = document.getElementById("fotos-inputs-container");
  if (!container) return;

  const urlConvertida = convertirUrlGoogleDrive(url);
  const div = document.createElement("div");
  div.className = "photo-input-group d-flex align-items-center gap-2";

  div.innerHTML = `
    <img src="${urlConvertida || 'https://placehold.co/100x70?text=Foto'}" class="photo-preview-box" alt="Vista previa" 
         onerror="this.src='https://placehold.co/100x70?text=Inv%C3%A1lida'">
    <div class="flex-grow-1">
      <input type="url" class="form-control form-control-sm input-foto-url" value="${url}" 
             placeholder="Pega la URL de la imagen o enlace de Google Drive..." 
             oninput="actualizarPreviewFoto(this)">
    </div>
    <button type="button" class="btn btn-sm btn-outline-danger" onclick="eliminarCampoFoto(this)" title="Quitar foto">
      <i class="bi bi-trash"></i>
    </button>
  `;

  container.appendChild(div);
}

function eliminarCampoFoto(btn) {
  const grupo = btn.closest(".photo-input-group");
  if (grupo) grupo.remove();
}

function actualizarPreviewFoto(input) {
  const grupo = input.closest(".photo-input-group");
  if (!grupo) return;
  const img = grupo.querySelector("img");
  const urlDirecta = convertirUrlGoogleDrive(input.value.trim());
  if (img) img.src = urlDirecta || 'https://placehold.co/100x70?text=Foto';
}

function convertirUrlGoogleDrive(url) {
  if (!url) return "";
  if (!url.includes("drive.google.com")) return url;

  const matchFile = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFile && matchFile[1]) return `https://drive.google.com/thumbnail?id=${matchFile[1]}&sz=w1200`;

  const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return `https://drive.google.com/thumbnail?id=${matchId[1]}&sz=w1200`;

  return url;
}

// GUARDAR INMUEBLE EN TIEMPO REAL
async function guardarInmueble(e) {
  e.preventDefault();

  const idExistente = document.getElementById("form-id").value;
  const esNuevo = !idExistente;
  const id = esNuevo ? `inmueble-${Date.now()}` : idExistente;

  const fotoInputs = document.querySelectorAll(".input-foto-url");
  const fotos = [];
  fotoInputs.forEach(inp => {
    const val = inp.value.trim();
    if (val) fotos.push(convertirUrlGoogleDrive(val));
  });

  const caracRaw = document.getElementById("form-caracteristicas").value;
  const caracteristicas = caracRaw.split(",").map(c => c.trim()).filter(c => c.length > 0);
  const precioUSD = parseFloat(document.getElementById("form-precioUSD").value) || 0;

  const nuevoInmueble = {
    id: id,
    orden: parseInt(document.getElementById("form-orden").value) || 1,
    publicado: true,
    tipo: document.getElementById("form-tipo").value,
    titulo: document.getElementById("form-titulo").value.trim(),
    manzana: document.getElementById("form-manzana").value.trim(),
    ubicacion: document.getElementById("form-ubicacion").value,
    zonaDetalle: document.getElementById("form-zonaDetalle").value.trim(),
    superficie: parseFloat(document.getElementById("form-superficie").value) || 0,
    dimensiones: document.getElementById("form-dimensiones").value.trim(),
    precio: `$${precioUSD.toLocaleString('en-US')} USD`,
    precioUSD: precioUSD,
    estado: document.getElementById("form-estado").value,
    destacado: true,
    propietario: {
      nombre: document.getElementById("form-owner-name").value.trim(),
      email: document.getElementById("form-owner-email").value.trim(),
      telefono: document.getElementById("form-owner-phone").value.trim(),
      whatsapp: document.getElementById("form-owner-whatsapp").value.trim().replace(/\D/g, '')
    },
    contacto: {
      canales: {
        whatsapp: document.getElementById("check-canal-whatsapp").checked,
        email: document.getElementById("check-canal-email").checked,
        telefono: document.getElementById("check-canal-telefono").checked
      },
      viaPrincipal: document.querySelector('input[name="viaPrincipalRadio"]:checked').value
    },
    coordenadas: coordenadasSeleccionadas,
    poligono: poligonoSeleccionado,
    fotos: fotos.length > 0 ? fotos : ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"],
    caracteristicas: caracteristicas,
    descripcion: document.getElementById("form-descripcion").value.trim()
  };

  // Guardar en Firestore en tiempo real
  try {
    await guardarInmuebleEnFirestore(nuevoInmueble);
  } catch (err) {
    console.warn("No se pudo guardar en Firestore, guardando localmente:", err);
  }

  if (esNuevo) {
    inventarioInmuebles.push(nuevoInmueble);
  } else {
    const idx = inventarioInmuebles.findIndex(i => i.id === id);
    if (idx !== -1) {
      nuevoInmueble.publicado = inventarioInmuebles[idx].publicado !== false;
      inventarioInmuebles[idx] = nuevoInmueble;
    }
  }

  inventarioInmuebles.sort((a, b) => (a.orden || 999) - (b.orden || 999));
  persistirInventarioLocal();
  renderizarTablaInmuebles();

  const modalEl = document.getElementById("modalInmuebleForm");
  const modalInst = bootstrap.Modal.getInstance(modalEl);
  if (modalInst) modalInst.hide();

  alert("✅ ¡Inmueble guardado y publicado en tiempo real!");
}

// BACKUP EN ARCHIVO DATA.JS (OPCIONAL)
function generarCodigoDataJS() {
  const jsonLotes = JSON.stringify(inventarioInmuebles, null, 2);
  const jsonSitio = JSON.stringify(sitioConfig, null, 2);

  return `/**
 * MODELO DE DATOS DE INMUEBLES - CÓRDOBA SERRANA INMUEBLES
 * Copia de seguridad generada el: ${new Date().toLocaleString()}
 */

const lotesData = ${jsonLotes};

const sitioConfig = ${jsonSitio};
`;
}

function abrirModalExportar() {
  const codigo = generarCodigoDataJS();
  document.getElementById("export-code-area").value = codigo;
  const modal = new bootstrap.Modal(document.getElementById("modalExportar"));
  modal.show();
}

function copiarCodigoDataJS() {
  const textarea = document.getElementById("export-code-area");
  textarea.select();
  navigator.clipboard.writeText(textarea.value).then(() => {
    alert("📋 ¡Código copiado al portapapeles!");
  });
}

function descargarArchivoDataJS() {
  const codigo = generarCodigoDataJS();
  const blob = new Blob([codigo], { type: "application/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.js";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
