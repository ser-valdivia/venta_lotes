/**
 * LÓGICA DEL MAPA INTERACTIVO (LEAFLET.JS) - CÓRDOBA SERRANA INMUEBLES
 * -------------------------------------------------------------------
 * Renderizado de inmuebles, polígonos y pines satelitales / callejeros.
 */

let mapInstance = null;
let lotesPoligonoMap = {};
let lotesMarkerMap = {};

function initMapaLotes() {
  const container = document.getElementById("mapa-container");
  if (!container) return;

  const centro = sitioConfig.coordenadasMapaCentro || [-31.4555, -64.5575];
  const zoom = sitioConfig.zoomMapaInicial || 15;
  
  if (!mapInstance) {
    mapInstance = L.map("mapa-container").setView(centro, zoom);

    const callejeroTile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    const satelitalTile = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN"
    });

    satelitalTile.addTo(mapInstance);

    const baseMaps = {
      "🌍 Vista Satelital": satelitalTile,
      "🗺️ Mapa Callejero": callejeroTile
    };
    L.control.layers(baseMaps, null, { position: "topright" }).addTo(mapInstance);
  } else {
    mapInstance.invalidateSize();
  }

  renderizarInmueblesEnMapa();
}

function getEstiloPorEstado(estado) {
  switch (estado) {
    case "disponible":
      return { color: "#10b981", fillColor: "#10b981", fillOpacity: 0.45, weight: 3 };
    case "reservado":
      return { color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.5, weight: 3 };
    case "vendido":
      return { color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.55, weight: 3 };
    default:
      return { color: "#6b7280", fillColor: "#9ca3af", fillOpacity: 0.3, weight: 2 };
  }
}

function renderizarInmueblesEnMapa() {
  if (!mapInstance) return;

  // Limpiar capas previas si existieran
  Object.values(lotesPoligonoMap).forEach(layer => mapInstance.removeLayer(layer));
  Object.values(lotesMarkerMap).forEach(marker => mapInstance.removeLayer(marker));
  lotesPoligonoMap = {};
  lotesMarkerMap = {};

  // Tomar lista publicada global (desde Firestore o data.js)
  const lista = (typeof getInmueblesPublicados === "function") 
    ? getInmueblesPublicados() 
    : (typeof lotesData !== "undefined" ? lotesData.filter(i => i.publicado !== false) : []);

  lista.forEach((inm) => {
    const estilo = getEstiloPorEstado(inm.estado);

    // 1. Polígono si existe
    if (inm.poligono && inm.poligono.length > 0) {
      const polygonLayer = L.polygon(inm.poligono, estilo).addTo(mapInstance);

      polygonLayer.bindTooltip(
        `<strong>${inm.titulo || inm.numero}</strong> (${inm.superficie} m²) - <span style="text-transform:capitalize;">${inm.estado}</span>`, 
        { sticky: true }
      );

      polygonLayer.bindPopup(crearPopupHTML(inm));
      lotesPoligonoMap[inm.id] = polygonLayer;
    }

    // 2. Marcador con etiqueta distintiva
    if (inm.coordenadas && inm.coordenadas.length === 2) {
      const etiquetaCorta = (inm.tipo === "departamento") ? "Depto" : ((inm.tipo === "local") ? "Local" : (inm.numero || "Inmueble"));
      
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
        "><i class="bi bi-geo-alt-fill"></i> ${etiquetaCorta}</div>`,
        iconSize: [65, 24],
        iconAnchor: [32, 12]
      });

      const marker = L.marker(inm.coordenadas, { icon: customMarkerIcon }).addTo(mapInstance);
      marker.bindPopup(crearPopupHTML(inm));
      lotesMarkerMap[inm.id] = marker;
    }
  });
}

function crearPopupHTML(inm) {
  const fotoPortada = (inm.fotos && inm.fotos.length > 0) 
    ? inm.fotos[0] 
    : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80";

  return `
    <div class="map-popup-card">
      <img src="${fotoPortada}" alt="${inm.titulo}" class="map-popup-img" onerror="this.src='https://placehold.co/300x150?text=Foto'">
      <div class="map-popup-body">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong style="font-size: 1.05rem; color: #0f392b;">${inm.titulo || inm.numero}</strong>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-1">
          <small class="text-danger fw-bold"><i class="bi bi-geo-alt-fill"></i> ${inm.ubicacion}</small>
          <span class="badge-lote badge-${inm.estado}">${inm.estado}</span>
        </div>
        <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.4rem;">
          ${inm.superficie} m² | ${inm.dimensiones || 'A consultar'}
        </div>
        <div style="font-weight: 700; color: #d9a74a; font-size: 1.1rem;" class="mb-2">
          ${inm.precio}
        </div>
        <div class="d-grid gap-1">
          <button class="btn btn-sm btn-accent w-100" onclick="abrirModalContacto('${inm.id}')">
            <i class="bi bi-envelope-fill"></i> Contactar Propietario
          </button>
          <button class="btn btn-sm btn-outline-secondary w-100 mt-1" onclick="abrirModalDetalle('${inm.id}')">
            <i class="bi bi-eye"></i> Ver Ficha y Fotos
          </button>
        </div>
      </div>
    </div>
  `;
}

// Centrar mapa según la zona elegida
function enfocarZonaEnMapa(zona) {
  if (!mapInstance) return;
  if (zona === "cordoba") {
    mapInstance.setView([-31.4201, -64.1888], 14, { animate: true });
  } else {
    mapInstance.setView([-31.4555, -64.5575], 15, { animate: true });
  }
}

// Enfocar lote específico
function seleccionarLoteEnMapa(inmuebleId) {
  if (typeof registrarEventoMetrica === "function") {
    registrarEventoMetrica("mapa");
  }

  const lista = (typeof listaInmueblesGlobal !== "undefined" && listaInmueblesGlobal.length > 0)
    ? listaInmueblesGlobal
    : (typeof lotesData !== "undefined" ? lotesData : []);

  const inm = lista.find(l => l.id === inmuebleId);
  if (!inm || !mapInstance) return;

  const mapaEl = document.getElementById("seccion-mapa");
  if (mapaEl) {
    mapaEl.scrollIntoView({ behavior: "smooth" });
  }

  if (inm.coordenadas) {
    mapInstance.setView(inm.coordenadas, 17, { animate: true });
  }

  setTimeout(() => {
    if (lotesMarkerMap[inmuebleId]) {
      lotesMarkerMap[inmuebleId].openPopup();
    } else if (lotesPoligonoMap[inmuebleId]) {
      lotesPoligonoMap[inmuebleId].openPopup();
    }
  }, 400);
}
