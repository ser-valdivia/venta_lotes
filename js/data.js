/**
 * MODELO DE DATOS DE INMUEBLES - CÓRDOBA SERRANA INMUEBLES
 * --------------------------------------------------------
 * Base de datos editable para Terrenos en las Sierras y Propiedades en Córdoba.
 * Este archivo puede ser actualizado manualmente o exportado desde el panel 'admin.html'.
 */

const lotesData = [
  {
    id: "inmueble-01",
    orden: 1,
    publicado: true,
    tipo: "lote", // "lote", "departamento", "local", "casa"
    titulo: "Lote 01 - Vista a las Altas Cumbres",
    manzana: "Manzana A - Lote 01",
    ubicacion: "Villa Icho Cruz",
    zonaDetalle: "A 300m del Río Icho Cruz, Punilla",
    superficie: 550, // m²
    dimensiones: "15m frente x 36.6m fondo",
    precio: "$27,000 USD",
    precioUSD: 27000,
    estado: "disponible", // "disponible", "reservado", "vendido"
    destacado: true,
    propietario: {
      nombre: "Juan Carlos Gómez",
      email: "juancarlos.lote1@ejemplo.com",
      telefono: "+54 9 3541 55-0101",
      whatsapp: "5493541550101"
    },
    contacto: {
      canales: {
        whatsapp: true,
        email: true,
        telefono: true
      },
      viaPrincipal: "whatsapp" // "whatsapp" o "email"
    },
    coordenadas: [-31.4552, -64.5578],
    poligono: [
      [-31.4550, -64.5581],
      [-31.4550, -64.5575],
      [-31.4554, -64.5575],
      [-31.4554, -64.5581]
    ],
    fotos: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80"
    ],
    caracteristicas: ["Luz eléctrica", "Agua corriente de red", "Escritura inmediata", "Vista panorámica a las Altas Cumbres"],
    descripcion: "Hermoso lote plano ubicado a pocas cuadras del río Icho Cruz. Excelente entorno natural, arboleda autóctona y vista directa a las sierras."
  },
  {
    id: "inmueble-02",
    orden: 2,
    publicado: true,
    tipo: "departamento",
    titulo: "Departamento 2 Ambientes con Balcón",
    manzana: "Edificio Miradores - Piso 4",
    ubicacion: "Córdoba Capital",
    zonaDetalle: "Barrio Nueva Córdoba, Calle Obispo Trejo",
    superficie: 54,
    dimensiones: "48m² cubiertos + 6m² balcón",
    precio: "$68,000 USD",
    precioUSD: 68000,
    estado: "disponible",
    destacado: true,
    propietario: {
      nombre: "María Elena Rossi",
      email: "maria.rossi.prop@ejemplo.com",
      telefono: "+54 9 351 555-0202",
      whatsapp: "5493515550202"
    },
    contacto: {
      canales: {
        whatsapp: true,
        email: true,
        telefono: false
      },
      viaPrincipal: "whatsapp"
    },
    coordenadas: [-31.4285, -64.1882],
    poligono: [],
    fotos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ],
    caracteristicas: ["1 Dormitorio con placard", "Cocina integrada con barra", "Gas natural", "Balcón con asador", "Seguridad 24hs"],
    descripcion: "Excelente departamento en pleno corazón de Nueva Córdoba, a pasos de Ciudad Universitaria y Parque Las Heras. Ideal para renta estudiantil o primera vivienda."
  },
  {
    id: "inmueble-03",
    orden: 3,
    publicado: true,
    tipo: "local",
    titulo: "Local Comercial sobre Avenida Principal",
    manzana: "Galería Central - Local 12",
    ubicacion: "Córdoba Capital",
    zonaDetalle: "Zona Centro / Peatonal 9 de Julio",
    superficie: 85,
    dimensiones: "6m vidriera x 14.1m fondo",
    precio: "$95,000 USD",
    precioUSD: 95000,
    estado: "disponible",
    destacado: true,
    propietario: {
      nombre: "Esteban Suárez",
      email: "esteban.locales@ejemplo.com",
      telefono: "+54 9 351 555-0303",
      whatsapp: "5493515550303"
    },
    contacto: {
      canales: {
        whatsapp: true,
        email: true,
        telefono: true
      },
      viaPrincipal: "email"
    },
    coordenadas: [-31.4135, -64.1810],
    poligono: [],
    fotos: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
    ],
    caracteristicas: ["Gran frente vidriado", "Baño propio y depósito", "Bajas expensas", "Zona de altísimo flujo peatonal"],
    descripcion: "Local comercial estratégico con excelente visibilidad y tránsito continuo. Apto para diversos rubros comerciales, indumentaria, café o tecnología."
  },
  {
    id: "inmueble-04",
    orden: 4,
    publicado: true,
    tipo: "lote",
    titulo: "Lote 02 - Zona Residencial Icho Cruz",
    manzana: "Manzana A - Lote 02",
    ubicacion: "Villa Icho Cruz",
    zonaDetalle: "Entorno consolidado, Punilla",
    superficie: 620,
    dimensiones: "18m frente x 34.4m fondo",
    precio: "$31,500 USD",
    precioUSD: 31500,
    estado: "disponible",
    destacado: false,
    propietario: {
      nombre: "Roberto Fernández",
      email: "roberto.terrenos@ejemplo.com",
      telefono: "+54 9 3541 55-0303",
      whatsapp: "5493541550303"
    },
    contacto: {
      canales: {
        whatsapp: true,
        email: true,
        telefono: false
      },
      viaPrincipal: "whatsapp"
    },
    coordenadas: [-31.4552, -64.5571],
    poligono: [
      [-31.4550, -64.5574],
      [-31.4550, -64.5568],
      [-31.4554, -64.5568],
      [-31.4554, -64.5574]
    ],
    fotos: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
    ],
    caracteristicas: ["Servicio de agua", "Luz en puerta", "Entorno residencial consolidado", "Cerca del centro comercial"],
    descripcion: "Lote amplio con leve pendiente favorable para diseño arquitectónico multinivel. Ubicación tranquila y segura en Villa Icho Cruz."
  },
  {
    id: "inmueble-05",
    orden: 5,
    publicado: true,
    tipo: "casa",
    titulo: "Cabaña Serrana con Gran Parque",
    manzana: "Calle Los Molles s/n",
    ubicacion: "Villa Icho Cruz",
    zonaDetalle: "A metros del Balneario Natural",
    superficie: 780,
    dimensiones: "110m² cubiertos / 780m² terreno",
    precio: "$84,000 USD",
    precioUSD: 84000,
    estado: "reservado",
    destacado: true,
    propietario: {
      nombre: "Ana Lucía Benítez",
      email: "anabenitez.lote5@ejemplo.com",
      telefono: "+54 9 3541 55-0505",
      whatsapp: "5493541550505"
    },
    contacto: {
      canales: {
        whatsapp: true,
        email: true,
        telefono: true
      },
      viaPrincipal: "whatsapp"
    },
    coordenadas: [-31.4564, -64.5578],
    poligono: [
      [-31.4562, -64.5582],
      [-31.4562, -64.5574],
      [-31.4566, -64.5574],
      [-31.4566, -64.5582]
    ],
    fotos: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80"
    ],
    caracteristicas: ["2 Dormitorios", "Galería con asador", "Gran parque arbolado", "Cochera cubierta"],
    descripcion: "Hermosa cabaña serrana construida en madera y ladrillo visto, ideal para descanso familiar o explotación turística en temporada."
  }
];

// Configuración general del sitio
const sitioConfig = {
  nombreProyecto: "Córdoba Serrana Inmuebles",
  subtitulo: "Terrenos en las Sierras y Propiedades Urbanas en Córdoba",
  emailGeneral: "sergiovaldivia4@gmail.com",
  // Coordenadas centrales por defecto (Villa Icho Cruz, Punilla)
  coordenadasMapaCentro: [-31.4555, -64.5575],
  zoomMapaInicial: 15,
  // Coordenadas alternativas para Córdoba Capital
  coordenadasCordobaCapital: [-31.4201, -64.1888],
  // Claves opcionales para integración con EmailJS (gratuito)
  emailjsPublicKey: "",
  emailjsServiceId: "",
  emailjsTemplateId: ""
};
