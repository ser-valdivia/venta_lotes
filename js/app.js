/**
 * APLICACIÓN PRINCIPAL (APP.JS) - CÓRDOBA SERRANA INMUEBLES
 * ---------------------------------------------------------
 * Lógica de UI, carga en tiempo real desde Firestore y contacto directo.
 */

let listaInmueblesGlobal = [];

document.addEventListener("DOMContentLoaded", async () => {
  inicializarConfiguracion();
  await cargarInmueblesPublicos();
  setupFiltros();

  // Registrar visita única por sesión para métricas
  if (!sessionStorage.getItem("visita_registrada")) {
    sessionStorage.setItem("visita_registrada", "true");
    if (typeof registrarEventoMetrica === "function") {
      registrarEventoMetrica("visita");
    }
  }
});

function trackWhatsApp() {
  if (typeof registrarEventoMetrica === "function") {
    registrarEventoMetrica("whatsapp");
  }
}

// Cargar catálogo desde Google Firestore en tiempo real (con fallback a data.js)
async function cargarInmueblesPublicos() {
  let datosEnNube = null;

  if (typeof obtenerInmueblesDesdeFirestore === "function") {
    try {
      datosEnNube = await obtenerInmueblesDesdeFirestore();
    } catch (e) {
      console.warn("Conexión a Firestore no disponible, usando base local:", e);
    }
  }

  if (datosEnNube && datosEnNube.length > 0) {
    listaInmueblesGlobal = datosEnNube;
  } else {
    // Si la base en la nube no está configurada o está vacía, usamos lotesData de data.js
    listaInmueblesGlobal = (typeof lotesData !== "undefined") ? [...lotesData] : [];
  }

  renderizarEstadisticas();
  renderizarTarjetasInmuebles(getInmueblesPublicados());
  initMapaLotes();
}

// Obtener solo inmuebles marcados como publicados y ordenados por su campo 'orden'
function getInmueblesPublicados() {
  return listaInmueblesGlobal
    .filter(inm => inm.publicado !== false)
    .sort((a, b) => (a.orden || 999) - (b.orden || 999));
}

// Configuración general de textos
function inicializarConfiguracion() {
  document.title = `${sitioConfig.nombreProyecto} | Terrenos y Propiedades en Córdoba`;
  
  const brandElements = document.querySelectorAll(".site-brand-name");
  brandElements.forEach(el => el.textContent = sitioConfig.nombreProyecto);
  
  const subtitleEl = document.getElementById("site-subtitle");
  if (subtitleEl) subtitleEl.textContent = sitioConfig.subtitulo;

  const currentYearEl = document.getElementById("footer-year");
  if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();
}

// Estadísticas del Hero
function renderizarEstadisticas() {
  const publicados = getInmueblesPublicados();
  const total = publicados.length;
  const disponibles = publicados.filter(l => l.estado === "disponible").length;
  const reservados = publicados.filter(l => l.estado === "reservado").length;
  
  const elTotal = document.getElementById("stat-total-lotes");
  const elDisponibles = document.getElementById("stat-disponibles");
  const elReservados = document.getElementById("stat-reservados");

  if (elTotal) elTotal.textContent = total;
  if (elDisponibles) elDisponibles.textContent = disponibles;
  if (elReservados) elReservados.textContent = reservados;
}

// Renderizar tarjetas de inmuebles en la cuadrícula
function renderizarTarjetasInmuebles(listaInmuebles) {
  const container = document.getElementById("lotes-container");
  if (!container) return;

  if (listaInmuebles.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search display-3 text-muted"></i>
        <h4 class="mt-3 text-muted">No se encontraron propiedades con los filtros seleccionados</h4>
        <button class="btn btn-outline-success mt-2" onclick="limpiarFiltros()">Restablecer Filtros</button>
      </div>
    `;
    return;
  }

  container.innerHTML = listaInmuebles.map(inm => {
    const fotoPortada = (inm.fotos && inm.fotos.length > 0) 
      ? inm.fotos[0] 
      : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80";

    const badgeEstado = `<span class="badge-lote badge-${inm.estado}">${inm.estado}</span>`;
    const tipoTexto = getNombreTipo(inm.tipo);
    const tipoBadge = `<span class="badge-tipo badge-tipo-${inm.tipo || 'lote'}">${tipoTexto}</span>`;

    const canales = inm.contacto?.canales || { whatsapp: true, email: true, telefono: false };
    const viaPrincipal = inm.contacto?.viaPrincipal || "whatsapp";

    let botonesContactoHTML = "";
    if (viaPrincipal === "whatsapp" && canales.whatsapp && inm.propietario?.whatsapp) {
      const msgWA = encodeURIComponent(`Hola ${inm.propietario.nombre}, me interesa información sobre "${inm.titulo || inm.numero}" (${inm.ubicacion}) publicado por ${inm.precio}.`);
      botonesContactoHTML = `
        <a href="https://wa.me/${inm.propietario.whatsapp}?text=${msgWA}" target="_blank" class="btn btn-accent btn-sm w-100" onclick="trackWhatsApp()">
          <i class="bi bi-whatsapp"></i> Hablar por WhatsApp
        </a>
        ${canales.email ? `
          <button class="btn btn-outline-secondary btn-sm w-100 mt-1" onclick="abrirModalContacto('${inm.id}')">
            <i class="bi bi-envelope"></i> Consulta por Email
          </button>
        ` : ''}
      `;
    } else {
      botonesContactoHTML = `
        <button class="btn btn-accent btn-sm w-100" onclick="abrirModalContacto('${inm.id}')">
          <i class="bi bi-envelope-paper-fill"></i> Contactar Propietario
        </button>
        ${canales.whatsapp && inm.propietario?.whatsapp ? `
          <a href="https://wa.me/${inm.propietario.whatsapp}" target="_blank" class="btn btn-outline-success btn-sm w-100 mt-1" onclick="trackWhatsApp()">
            <i class="bi bi-whatsapp"></i> Enviar WhatsApp
          </a>
        ` : ''}
      `;
    }

    return `
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="lote-card">
          <div class="lote-card-img-wrapper">
            <img src="${fotoPortada}" alt="${inm.titulo || inm.numero}" class="lote-card-img" loading="lazy" onerror="this.src='https://placehold.co/600x400?text=Foto+Inmueble'">
            <div class="lote-badge-top-left d-flex flex-column gap-1">
              ${tipoBadge}
              ${badgeEstado}
            </div>
            <div class="lote-price-tag">
              ${inm.precio}
            </div>
          </div>

          <div class="lote-card-body">
            <div class="mb-1">
              <span class="text-danger small fw-bold">
                <i class="bi bi-geo-alt-fill"></i> ${inm.ubicacion}
              </span>
              <h3 class="lote-title mt-1">${inm.titulo || inm.numero}</h3>
              <small class="text-muted fw-semibold">${inm.manzana || inm.zonaDetalle || ''}</small>
            </div>
            
            <p class="text-muted small mb-2 text-truncate">${inm.descripcion || ''}</p>
            
            <div class="lote-specs">
              <div class="lote-spec-item" title="Superficie total">
                <i class="bi bi-aspect-ratio-fill"></i>
                <span><strong>${inm.superficie}</strong> m²</span>
              </div>
              <div class="lote-spec-item" title="Dimensiones">
                <i class="bi bi-bounding-box-circles"></i>
                <span class="text-truncate" style="max-width: 140px;">${inm.dimensiones || 'A consultar'}</span>
              </div>
            </div>

            <div class="mt-auto d-grid gap-2">
              <div class="row g-2">
                <div class="col-6">
                  <button class="btn btn-outline-dark btn-sm w-100" onclick="seleccionarLoteEnMapa('${inm.id}')">
                    <i class="bi bi-geo-alt-fill text-danger"></i> Ver en Mapa
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100" onclick="abrirModalDetalle('${inm.id}')">
                    <i class="bi bi-images"></i> Ficha y Fotos
                  </button>
                </div>
              </div>
              
              <div class="mt-1">
                ${botonesContactoHTML}
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }).join("");
}

function getNombreTipo(tipo) {
  switch (tipo) {
    case "departamento": return "Departamento";
    case "local": return "Local Comercial";
    case "casa": return "Casa / Cabaña";
    case "lote":
    default: return "Lote / Terreno";
  }
}

// Configurar Filtros
function setupFiltros() {
  const selectTipo = document.getElementById("filter-tipo");
  const selectUbicacion = document.getElementById("filter-ubicacion");
  const selectEstado = document.getElementById("filter-estado");
  const inputSearch = document.getElementById("filter-search");
  const selectOrden = document.getElementById("filter-orden");

  const aplicarFiltros = () => {
    let resultado = getInmueblesPublicados();

    if (selectTipo && selectTipo.value !== "todos") {
      resultado = resultado.filter(i => (i.tipo || "lote") === selectTipo.value);
    }

    if (selectUbicacion && selectUbicacion.value !== "todas") {
      resultado = resultado.filter(i => i.ubicacion === selectUbicacion.value);
    }

    if (selectEstado && selectEstado.value !== "todos") {
      resultado = resultado.filter(i => i.estado === selectEstado.value);
    }

    if (inputSearch && inputSearch.value.trim() !== "") {
      const query = inputSearch.value.toLowerCase().trim();
      resultado = resultado.filter(i => 
        (i.titulo || "").toLowerCase().includes(query) ||
        (i.numero || "").toLowerCase().includes(query) ||
        (i.manzana || "").toLowerCase().includes(query) ||
        (i.ubicacion || "").toLowerCase().includes(query) ||
        (i.descripcion || "").toLowerCase().includes(query)
      );
    }

    if (selectOrden) {
      if (selectOrden.value === "orden-prioridad") {
        resultado.sort((a, b) => (a.orden || 999) - (b.orden || 999));
      } else if (selectOrden.value === "precio-asc") {
        resultado.sort((a, b) => (a.precioUSD || 0) - (b.precioUSD || 0));
      } else if (selectOrden.value === "precio-desc") {
        resultado.sort((a, b) => (b.precioUSD || 0) - (a.precioUSD || 0));
      } else if (selectOrden.value === "superficie-desc") {
        resultado.sort((a, b) => (b.superficie || 0) - (a.superficie || 0));
      }
    }

    renderizarTarjetasInmuebles(resultado);
  };

  if (selectTipo) selectTipo.addEventListener("change", aplicarFiltros);
  if (selectUbicacion) selectUbicacion.addEventListener("change", aplicarFiltros);
  if (selectEstado) selectEstado.addEventListener("change", aplicarFiltros);
  if (inputSearch) inputSearch.addEventListener("input", aplicarFiltros);
  if (selectOrden) selectOrden.addEventListener("change", aplicarFiltros);
}

function limpiarFiltros() {
  if (document.getElementById("filter-tipo")) document.getElementById("filter-tipo").value = "todos";
  if (document.getElementById("filter-ubicacion")) document.getElementById("filter-ubicacion").value = "todas";
  if (document.getElementById("filter-estado")) document.getElementById("filter-estado").value = "todos";
  if (document.getElementById("filter-search")) document.getElementById("filter-search").value = "";
  if (document.getElementById("filter-orden")) document.getElementById("filter-orden").value = "orden-prioridad";
  renderizarTarjetasInmuebles(getInmueblesPublicados());
}

// MODAL DE DETALLE Y FOTOS
function abrirModalDetalle(inmuebleId) {
  const inm = listaInmueblesGlobal.find(l => l.id === inmuebleId);
  if (!inm) return;

  const modalEl = document.getElementById("modalDetalle");
  const modalBody = document.getElementById("modalDetalleBody");
  
  const fotosHTML = (inm.fotos || []).map((foto, index) => `
    <div class="carousel-item ${index === 0 ? 'active' : ''}">
      <img src="${foto}" class="d-block w-100" style="height: 380px; object-fit: cover; border-radius: 12px;" alt="${inm.titulo}" onerror="this.src='https://placehold.co/800x500?text=Foto'">
    </div>
  `).join("");

  const listaCaracteristicas = (inm.caracteristicas || []).map(item => `
    <li class="col-md-6 mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>${item}</li>
  `).join("");

  const viaPrincipal = inm.contacto?.viaPrincipal || "whatsapp";
  const canales = inm.contacto?.canales || { whatsapp: true, email: true };

  modalBody.innerHTML = `
    <div class="row">
      <div class="col-lg-7">
        <div id="carouselLoteFotos" class="carousel slide mb-3" data-bs-ride="carousel">
          <div class="carousel-inner">
            ${fotosHTML}
          </div>
          ${(inm.fotos && inm.fotos.length > 1) ? `
            <button class="carousel-control-prev" type="button" data-bs-target="#carouselLoteFotos" data-bs-slide="prev">
              <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carouselLoteFotos" data-bs-slide="next">
              <span class="carousel-control-next-icon"></span>
            </button>
          ` : ''}
        </div>
      </div>

      <div class="col-lg-5">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="badge-tipo badge-tipo-${inm.tipo || 'lote'}">${getNombreTipo(inm.tipo)}</span>
          <span class="badge-lote badge-${inm.estado}">${inm.estado}</span>
        </div>

        <h2 class="h4 font-serif fw-bold text-success mt-2 mb-1">${inm.titulo || inm.numero}</h2>
        <p class="text-danger small fw-semibold mb-2">
          <i class="bi bi-geo-alt-fill"></i> ${inm.ubicacion} ${inm.zonaDetalle ? ' - ' + inm.zonaDetalle : ''}
        </p>

        <h3 class="display-6 font-serif text-warning-emphasis fw-bold my-2">${inm.precio}</h3>

        <div class="p-3 bg-light rounded mb-3">
          <div class="row text-center">
            <div class="col-6 border-end">
              <small class="text-muted d-block">Superficie</small>
              <strong class="fs-5">${inm.superficie} m²</strong>
            </div>
            <div class="col-6">
              <small class="text-muted d-block">Medidas</small>
              <strong class="fs-6">${inm.dimensiones || 'A consultar'}</strong>
            </div>
          </div>
        </div>

        <p class="text-secondary small">${inm.descripcion || ''}</p>

        <div class="owner-info-box mt-3 mb-3">
          <small class="text-uppercase fw-bold text-muted d-block" style="font-size: 0.75rem;">Propietario / Contacto:</small>
          <div class="d-flex align-items-center gap-2 mt-1">
            <i class="bi bi-person-circle fs-3 text-success"></i>
            <div>
              <strong>${inm.propietario.nombre}</strong><br>
              <small class="text-muted"><i class="bi bi-envelope"></i> ${inm.propietario.email}</small>
            </div>
          </div>
        </div>

        <div class="d-grid gap-2">
          ${(viaPrincipal === 'whatsapp' && canales.whatsapp && inm.propietario?.whatsapp) ? `
            <a href="https://wa.me/${inm.propietario.whatsapp}?text=${encodeURIComponent('Hola, me interesa información sobre ' + (inm.titulo || inm.numero))}" target="_blank" class="btn btn-success btn-lg" onclick="trackWhatsApp()">
              <i class="bi bi-whatsapp"></i> Hablar por WhatsApp
            </a>
          ` : ''}

          ${canales.email ? `
            <button class="btn btn-accent btn-lg" onclick="abrirModalContacto('${inm.id}')">
              <i class="bi bi-envelope-fill"></i> Enviar Mensaje al Dueño
            </button>
          ` : ''}
        </div>
      </div>
    </div>

    ${listaCaracteristicas.length > 0 ? `
      <div class="mt-4 pt-3 border-top">
        <h6 class="fw-bold mb-3"><i class="bi bi-stars text-warning me-2"></i>Características y Servicios</h6>
        <ul class="row list-unstyled small">
          ${listaCaracteristicas}
        </ul>
      </div>
    ` : ''}
  `;

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

// MODAL DE CONTACTO
function abrirModalContacto(inmuebleId) {
  const inm = listaInmueblesGlobal.find(l => l.id === inmuebleId);
  if (!inm) return;

  const modalDetalleEl = document.getElementById("modalDetalle");
  const modalDetalleInst = bootstrap.Modal.getInstance(modalDetalleEl);
  if (modalDetalleInst) modalDetalleInst.hide();

  document.getElementById("contact-lote-id").value = inm.id;
  document.getElementById("contact-lote-titulo").textContent = inm.titulo || inm.numero;
  document.getElementById("contact-owner-name").textContent = inm.propietario.nombre;
  document.getElementById("contact-owner-email").textContent = inm.propietario.email;
  
  const btnWhatsapp = document.getElementById("contact-whatsapp-link");
  if (btnWhatsapp && inm.propietario.whatsapp) {
    const mensajeWA = encodeURIComponent(`Hola ${inm.propietario.nombre}, vi la publicación de "${inm.titulo || inm.numero}" en ${inm.ubicacion} por ${inm.precio} y quisiera consultar.`);
    btnWhatsapp.href = `https://wa.me/${inm.propietario.whatsapp}?text=${mensajeWA}`;
    btnWhatsapp.style.display = "inline-flex";
  } else if (btnWhatsapp) {
    btnWhatsapp.style.display = "none";
  }

  document.getElementById("contact-subject").value = `Consulta por ${inm.titulo || inm.numero} - ${inm.ubicacion} (${inm.precio})`;

  const modalContactoEl = document.getElementById("modalContacto");
  const bsContactoModal = new bootstrap.Modal(modalContactoEl);
  bsContactoModal.show();
}

function procesarEnvioConsulta(event) {
  event.preventDefault();
  
  if (typeof registrarEventoMetrica === "function") {
    registrarEventoMetrica("email");
  }
  
  const inmId = document.getElementById("contact-lote-id").value;
  const inm = listaInmueblesGlobal.find(l => l.id === inmId);
  
  const nombreRemitente = document.getElementById("contact-user-name").value;
  const emailRemitente = document.getElementById("contact-user-email").value;
  const telefonoRemitente = document.getElementById("contact-user-phone").value;
  const mensajeRemitente = document.getElementById("contact-user-message").value;

  if (!inm) return;

  const emailDestino = inm.propietario.email;
  const asunto = `[Consulta Inmuebles] Interés en ${inm.titulo || inm.numero} de ${nombreRemitente}`;
  const cuerpoMensaje = 
    `Hola ${inm.propietario.nombre},\n\n` +
    `Tienes una nueva consulta sobre tu propiedad "${inm.titulo || inm.numero}" (${inm.ubicacion}):\n\n` +
    `👤 Nombre: ${nombreRemitente}\n` +
    `✉️ Email de contacto: ${emailRemitente}\n` +
    `📞 Teléfono: ${telefonoRemitente}\n\n` +
    `💬 Mensaje:\n"${mensajeRemitente}"\n\n` +
    `--- Enviado desde la web ${sitioConfig.nombreProyecto} ---`;

  if (window.emailjs && sitioConfig.emailjsPublicKey && sitioConfig.emailjsServiceId) {
    emailjs.send(sitioConfig.emailjsServiceId, sitioConfig.emailjsTemplateId, {
      to_email: emailDestino,
      to_name: inm.propietario.nombre,
      from_name: nombreRemitente,
      from_email: emailRemitente,
      phone: telefonoRemitente,
      inmueble_titulo: inm.titulo || inm.numero,
      message: mensajeRemitente
    }).then(() => {
      alert("✅ ¡Consulta enviada con éxito directamente al dueño!");
    }).catch(err => {
      console.error("Error EmailJS:", err);
      abrirMailtoFallback(emailDestino, asunto, cuerpoMensaje);
    });
  } else {
    abrirMailtoFallback(emailDestino, asunto, cuerpoMensaje);
  }

  const modalContactoEl = document.getElementById("modalContacto");
  const modalInst = bootstrap.Modal.getInstance(modalContactoEl);
  if (modalInst) modalInst.hide();
  
  document.getElementById("formConsultaModal").reset();
}

function abrirMailtoFallback(email, asunto, cuerpo) {
  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  window.open(mailtoUrl, '_blank');
  alert(`✅ Se preparó la consulta para enviarla al correo (${email}) del propietario.`);
}
