/**
 * LÓGICA DEL MAPA INTERACTIVO (LEAFLET.JS)
 * -----------------------------------------
 * Renderizado de lotes en mapa satelital/vectorial con Leaflet
 */

let mapInstance = null;
let lotesPoligonoMap = {}; // Guarda referencia a los elementos de capa de cada lote
let lotesMarkerMap = {};

function initMapaLotes() {
  const container = document.getElementById("mapa-container");
  if (!container) return;

  // 1. Inicializar Mapa centrado en la posición global
  const centro = sitioConfig.coordenadasMapaCentro;
  const zoom = sitioConfig.zoomMapaInicial;
  
  mapInstance = L.map("mapa-container").setView(centro, zoom);

  // 2. Capa Callejera (OpenStreetMap)
  const callejeroTile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  // 3. Capa Satelital (Esri World Imagery - Alta calidad gratuita)
  const satelitalTile = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  });

  // Añadir capa satelital por defecto
  satelitalTile.addTo(mapInstance);

  // Control para alternar entre Mapa Satelital y Callejero
  const baseMaps = {
    "🌍 Vista Satelital": satelitalTile,
    "🗺️ Mapa Callejero": callejeroTile
  };
  L.control.layers(baseMaps, null, { position: "topright" }).addTo(mapInstance);

  // 4. Dibujar los lotes en el mapa
  renderizarLotesEnMapa();
}

function getEstiloPorEstado(estado) {
  switch (estado) {
    case "disponible":
      return {
        color: "#10b981",
        fillColor: "#10b981",
        fillOpacity: 0.45,
        weight: 3
      };
    case "reservado":
      return {
        color: "#f59e0b",
        fillColor: "#f59e0b",
        fillOpacity: 0.5,
        weight: 3
      };
    case "vendido":
      return {
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 0.55,
        weight: 3
      };
    default:
      return {
        color: "#6b7280",
        fillColor: "#9ca3af",
        fillOpacity: 0.3,
        weight: 2
      };
  }
}

function renderizarLotesEnMapa() {
  if (!mapInstance) return;

  lotesData.forEach((lote) => {
    const estilo = getEstiloPorEstado(lote.estado);

    // A) Dibujar Polígono si existe
    if (lote.poligono && lote.poligono.length > 0) {
      const polygonLayer = L.polygon(lote.poligono, estilo).addTo(mapInstance);

      // Tooltip al pasar el cursor
      polygonLayer.bindTooltip(
        `<strong>${lote.numero}</strong> (${lote.superficie} m²) - <span style="text-transform:capitalize;">${lote.estado}</span>`, 
        { sticky: true }
      );

      // Popup al hacer clic
      const popupHTML = crearPopupHTML(lote);
      polygonLayer.bindPopup(popupHTML);

      lotesPoligonoMap[lote.id] = polygonLayer;
    }

    // B) Colocar Marcador con Icono Personalizado en el centro del lote
    const iconoColor = lote.estado === "disponible" ? "green" : (lote.estado === "reservado" ? "orange" : "red");
    
    // Crear marcador circular distintivo
    const customMarkerIcon = L.divIcon({
      className: "custom-map-pin",
      html: `<div style="
        background-color: ${estilo.color};
        color: white;
        font-weight: 700;
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 12px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        border: 2px solid white;
        white-space: nowrap;
      ">${lote.numero}</div>`,
      iconSize: [60, 24],
      iconAnchor: [30, 12]
    });

    const marker = L.marker(lote.coordenadas, { icon: customMarkerIcon }).addTo(mapInstance);
    marker.bindPopup(crearPopupHTML(lote));
    lotesMarkerMap[lote.id] = marker;
  });
}

function crearPopupHTML(lote) {
  const fotoPortada = (lote.fotos && lote.fotos.length > 0) 
    ? lote.fotos[0] 
    : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80";

  return `
    <div class="map-popup-card">
      <img src="${fotoPortada}" alt="${lote.numero}" class="map-popup-img">
      <div class="map-popup-body">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong style="font-size: 1.1rem; color: #0f392b;">${lote.numero}</strong>
          <span class="badge-lote badge-${lote.estado}">${lote.estado}</span>
        </div>
        <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem;">
          <i class="bi bi-grid-3x3-gap"></i> ${lote.manzana} | ${lote.superficie} m²
        </div>
        <div style="font-weight: 700; color: #d9a74a; font-size: 1.05rem;" class="mb-2">
          ${lote.precio}
        </div>
        <div class="d-grid gap-1">
          <button class="btn btn-sm btn-accent w-100" onclick="abrirModalContacto('${lote.id}')">
            <i class="bi bi-envelope-fill"></i> Contactar Propietario
          </button>
          <button class="btn btn-sm btn-outline-secondary w-100 mt-1" onclick="abrirModalDetalle('${lote.id}')">
            <i class="bi bi-eye"></i> Ver Detalles y Fotos
          </button>
        </div>
      </div>
    </div>
  `;
}

// Función para enfocar un lote específico desde la lista/cards
function seleccionarLoteEnMapa(loteId) {
  const lote = lotesData.find(l => l.id === loteId);
  if (!lote || !mapInstance) return;

  // Scroll suave hacia la sección del mapa
  const mapaEl = document.getElementById("seccion-mapa");
  if (mapaEl) {
    mapaEl.scrollIntoView({ behavior: "smooth" });
  }

  // Centrar mapa con zoom ajustado
  mapInstance.setView(lote.coordenadas, 18, { animate: true });

  // Abrir popup del marcador o polígono
  setTimeout(() => {
    if (lotesMarkerMap[loteId]) {
      lotesMarkerMap[loteId].openPopup();
    } else if (lotesPoligonoMap[loteId]) {
      lotesPoligonoMap[loteId].openPopup();
    }
  }, 400);
}
