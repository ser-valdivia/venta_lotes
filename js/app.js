/**
 * APLICACIÓN PRINCIPAL (APP.JS)
 * ------------------------------
 * Lógica de UI, renderizado de catálogo, filtros y envío de consultas por lote
 */

document.addEventListener("DOMContentLoaded", () => {
  inicializarConfiguracion();
  renderizarEstadisticas();
  renderizarTarjetasLotes(lotesData);
  initMapaLotes();
  setupFiltros();
});

// Configuración de textos del sitio
function inicializarConfiguracion() {
  document.title = `${sitioConfig.nombreProyecto} | Venta de Terrenos`;
  
  const brandElements = document.querySelectorAll(".site-brand-name");
  brandElements.forEach(el => el.textContent = sitioConfig.nombreProyecto);
  
  const subtitleEl = document.getElementById("site-subtitle");
  if (subtitleEl) subtitleEl.textContent = sitioConfig.subtitulo;
}

// Estadísticas para el Hero
function renderizarEstadisticas() {
  const total = lotesData.length;
  const disponibles = lotesData.filter(l => l.estado === "disponible").length;
  const reservados = lotesData.filter(l => l.estado === "reservado").length;
  
  const elTotal = document.getElementById("stat-total-lotes");
  const elDisponibles = document.getElementById("stat-disponibles");
  const elReservados = document.getElementById("stat-reservados");

  if (elTotal) elTotal.textContent = total;
  if (elDisponibles) elDisponibles.textContent = disponibles;
  if (elReservados) elReservados.textContent = reservados;
}

// Renderizar tarjetas de lotes en la cuadrícula
function renderizarTarjetasLotes(listaLotes) {
  const container = document.getElementById("lotes-container");
  if (!container) return;

  if (listaLotes.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search display-1 text-muted"></i>
        <h4 class="mt-3 text-muted">No se encontraron lotes con los filtros seleccionados</h4>
        <button class="btn btn-outline-success mt-2" onclick="limpiarFiltros()">Limpiar Filtros</button>
      </div>
    `;
    return;
  }

  container.innerHTML = listaLotes.map(lote => {
    const fotoPortada = (lote.fotos && lote.fotos.length > 0) 
      ? lote.fotos[0] 
      : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80";

    const badgeEstado = `<span class="badge-lote badge-${lote.estado}">${lote.estado}</span>`;
    
    return `
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="lote-card">
          <div class="lote-card-img-wrapper">
            <img src="${fotoPortada}" alt="${lote.numero}" class="lote-card-img">
            <div class="lote-badge-top-left">
              ${badgeEstado}
            </div>
            <div class="lote-price-tag">
              ${lote.precio}
            </div>
          </div>
          <div class="lote-card-body">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <h3 class="lote-title">${lote.numero}</h3>
              <small class="text-muted fw-semibold">${lote.manzana}</small>
            </div>
            <p class="text-muted small mb-2 text-truncate">${lote.descripcion}</p>
            
            <div class="lote-specs">
              <div class="lote-spec-item" title="Superficie total">
                <i class="bi bi-aspect-ratio-fill"></i>
                <span><strong>${lote.superficie}</strong> m²</span>
              </div>
              <div class="lote-spec-item" title="Dimensiones del terreno">
                <i class="bi bi-bounding-box-circles"></i>
                <span>${lote.dimensiones}</span>
              </div>
            </div>

            <div class="mt-auto d-grid gap-2">
              <div class="row g-2">
                <div class="col-6">
                  <button class="btn btn-outline-dark btn-sm w-100" onclick="seleccionarLoteEnMapa('${lote.id}')">
                    <i class="bi bi-geo-alt-fill text-danger"></i> Ver Mapa
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100" onclick="abrirModalDetalle('${lote.id}')">
                    <i class="bi bi-images"></i> Detalle
                  </button>
                </div>
              </div>
              
              <button class="btn btn-accent btn-sm w-100 mt-1" onclick="abrirModalContacto('${lote.id}')">
                <i class="bi bi-envelope-paper-fill"></i> Contactar Dueño
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Configurar Filtros Interactivos
function setupFiltros() {
  const selectEstado = document.getElementById("filter-estado");
  const inputSearch = document.getElementById("filter-search");
  const selectOrden = document.getElementById("filter-orden");

  const aplicarFiltros = () => {
    let resultado = [...lotesData];

    // 1. Filtrar por Estado
    if (selectEstado && selectEstado.value !== "todos") {
      resultado = resultado.filter(l => l.estado === selectEstado.value);
    }

    // 2. Búsqueda por Texto
    if (inputSearch && inputSearch.value.trim() !== "") {
      const query = inputSearch.value.toLowerCase().trim();
      resultado = resultado.filter(l => 
        l.numero.toLowerCase().includes(query) ||
        l.manzana.toLowerCase().includes(query) ||
        l.descripcion.toLowerCase().includes(query)
      );
    }

    // 3. Ordenamiento
    if (selectOrden) {
      if (selectOrden.value === "precio-asc") {
        resultado.sort((a, b) => a.precioUSD - b.precioUSD);
      } else if (selectOrden.value === "precio-desc") {
        resultado.sort((a, b) => b.precioUSD - a.precioUSD);
      } else if (selectOrden.value === "superficie-desc") {
        resultado.sort((a, b) => b.superficie - a.superficie);
      }
    }

    renderizarTarjetasLotes(resultado);
  };

  if (selectEstado) selectEstado.addEventListener("change", aplicarFiltros);
  if (inputSearch) inputSearch.addEventListener("input", aplicarFiltros);
  if (selectOrden) selectOrden.addEventListener("change", aplicarFiltros);
}

function limpiarFiltros() {
  document.getElementById("filter-estado").value = "todos";
  document.getElementById("filter-search").value = "";
  document.getElementById("filter-orden").value = "default";
  renderizarTarjetasLotes(lotesData);
}

// MODAL DE DETALLE Y FOTOS DE LOTE
function abrirModalDetalle(loteId) {
  const lote = lotesData.find(l => l.id === loteId);
  if (!lote) return;

  const modalEl = document.getElementById("modalDetalle");
  const modalBody = document.getElementById("modalDetalleBody");
  
  // Generar Carrusel de Fotos
  const fotosHTML = lote.fotos.map((foto, index) => `
    <div class="carousel-item ${index === 0 ? 'active' : ''}">
      <img src="${foto}" class="d-block w-100" style="height: 380px; object-fit: cover; border-radius: 12px;" alt="${lote.numero}">
    </div>
  `).join("");

  const listaCaracteristicas = (lote.caracteristicas || []).map(item => `
    <li class="col-6 mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>${item}</li>
  `).join("");

  modalBody.innerHTML = `
    <div class="row">
      <div class="col-lg-7">
        <div id="carouselLoteFotos" class="carousel slide mb-3" data-bs-ride="carousel">
          <div class="carousel-inner">
            ${fotosHTML}
          </div>
          ${lote.fotos.length > 1 ? `
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
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h2 class="h3 font-serif mb-0 text-success">${lote.numero}</h2>
          <span class="badge-lote badge-${lote.estado}">${lote.estado}</span>
        </div>
        <p class="text-muted fw-bold">${lote.manzana}</p>

        <h3 class="display-6 font-serif text-warning-emphasis fw-bold my-3">${lote.precio}</h3>

        <div class="p-3 bg-light rounded mb-3">
          <div class="row text-center">
            <div class="col-6 border-end">
              <small class="text-muted d-block">Superficie</small>
              <strong class="fs-5">${lote.superficie} m²</strong>
            </div>
            <div class="col-6">
              <small class="text-muted d-block">Medidas</small>
              <strong class="fs-6">${lote.dimensiones}</strong>
            </div>
          </div>
        </div>

        <p class="text-secondary">${lote.descripcion}</p>

        <div class="owner-info-box mt-3 mb-4">
          <small class="text-uppercase fw-bold text-muted d-block">Propietario / Dueño del Lote:</small>
          <div class="d-flex align-items-center gap-2 mt-1">
            <i class="bi bi-person-bounding-box fs-4 text-primary"></i>
            <div>
              <strong>${lote.propietario.nombre}</strong><br>
              <small class="text-muted"><i class="bi bi-envelope"></i> ${lote.propietario.email}</small>
            </div>
          </div>
        </div>

        <div class="d-grid gap-2">
          <button class="btn btn-accent btn-lg" onclick="abrirModalContacto('${lote.id}')">
            <i class="bi bi-chat-dots-fill"></i> Contactar a ${lote.propietario.nombre}
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4 pt-3 border-top">
      <h5 class="fw-bold mb-3"><i class="bi bi-stars text-warning me-2"></i>Características y Servicios</h5>
      <ul class="row list-unstyled">
        ${listaCaracteristicas}
      </ul>
    </div>
  `;

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

// MODAL DE CONTACTO DIRIGIDO AL DUEÑO
function abrirModalContacto(loteId) {
  const lote = lotesData.find(l => l.id === loteId);
  if (!lote) return;

  // Si existe el modal de detalle abierto, cerrarlo primero
  const modalDetalleEl = document.getElementById("modalDetalle");
  const modalDetalleInst = bootstrap.Modal.getInstance(modalDetalleEl);
  if (modalDetalleInst) modalDetalleInst.hide();

  // Rellenar campos ocultos y visibles
  document.getElementById("contact-lote-id").value = lote.id;
  document.getElementById("contact-lote-titulo").textContent = `${lote.numero} (${lote.manzana})`;
  document.getElementById("contact-owner-name").textContent = lote.propietario.nombre;
  document.getElementById("contact-owner-email").textContent = lote.propietario.email;
  
  // Enlace directo de WhatsApp
  const btnWhatsapp = document.getElementById("contact-whatsapp-link");
  if (btnWhatsapp && lote.propietario.whatsapp) {
    const mensajeWA = encodeURIComponent(`Hola ${lote.propietario.nombre}, vi la publicación de tu ${lote.numero} (${lote.superficie} m²) por ${lote.precio} y quisiera solicitar información.`);
    btnWhatsapp.href = `https://wa.me/${lote.propietario.whatsapp}?text=${mensajeWA}`;
    btnWhatsapp.style.display = "inline-flex";
  } else if (btnWhatsapp) {
    btnWhatsapp.style.display = "none";
  }

  // Asunto por defecto
  document.getElementById("contact-subject").value = `Consulta por ${lote.numero} - ${lote.manzana} (${lote.superficie}m²)`;

  const modalContactoEl = document.getElementById("modalContacto");
  const bsContactoModal = new bootstrap.Modal(modalContactoEl);
  bsContactoModal.show();
}

// Procesar el envío de la consulta
function procesarEnvioConsulta(event) {
  event.preventDefault();
  
  const loteId = document.getElementById("contact-lote-id").value;
  const lote = lotesData.find(l => l.id === loteId);
  
  const nombreRemitente = document.getElementById("contact-user-name").value;
  const emailRemitente = document.getElementById("contact-user-email").value;
  const telefonoRemitente = document.getElementById("contact-user-phone").value;
  const mensajeRemitente = document.getElementById("contact-user-message").value;

  if (!lote) return;

  const emailDestino = lote.propietario.email;
  const asunto = `[Consulta Lotes] Interés en ${lote.numero} de ${nombreRemitente}`;
  const cuerpoMensaje = 
    `Hola ${lote.propietario.nombre},\n\n` +
    `Tienes una nueva consulta sobre tu ${lote.numero} (${lote.superficie} m²):\n\n` +
    `👤 Nombre: ${nombreRemitente}\n` +
    `✉️ Email de contacto: ${emailRemitente}\n` +
    `📞 Teléfono: ${telefonoRemitente}\n\n` +
    `💬 Mensaje:\n"${mensajeRemitente}"\n\n` +
    `--- Enviado desde la web ${sitioConfig.nombreProyecto} ---`;

  // Opción 1: Enviar mediante EmailJS si está configurado
  if (window.emailjs && sitioConfig.emailjsPublicKey && sitioConfig.emailjsServiceId) {
    emailjs.send(sitioConfig.emailjsServiceId, sitioConfig.emailjsTemplateId, {
      to_email: emailDestino,
      to_name: lote.propietario.nombre,
      from_name: nombreRemitente,
      from_email: emailRemitente,
      phone: telefonoRemitente,
      lote_numero: lote.numero,
      message: mensajeRemitente
    }).then(() => {
      mostrarAlertaExito("¡Mensaje enviado con éxito directamente al dueño!");
    }).catch(err => {
      console.error("Error EmailJS:", err);
      abrirMailtoFallback(emailDestino, asunto, cuerpoMensaje);
    });
  } else {
    // Opción 2: Fallback directo abriendo cliente de correo pre-configurado
    abrirMailtoFallback(emailDestino, asunto, cuerpoMensaje);
  }

  // Cerrar modal
  const modalContactoEl = document.getElementById("modalContacto");
  const modalInst = bootstrap.Modal.getInstance(modalContactoEl);
  if (modalInst) modalInst.hide();
  
  // Limpiar formulario
  document.getElementById("formConsultaModal").reset();
}

function abrirMailtoFallback(email, asunto, cuerpo) {
  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  window.open(mailtoUrl, '_blank');
  
  mostrarAlertaExito(`Se ha preparado la consulta para enviarla al correo (${email}) del propietario.`);
}

function mostrarAlertaExito(mensajeText) {
  alert(`✅ ${mensajeText}`);
}
