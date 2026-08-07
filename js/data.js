/**
 * MODELO DE DATOS DE LOTES (TERRENOS)
 * -----------------------------------
 * Puedes editar este archivo fácilmente para agregar nuevos lotes,
 * cambiar precios, fotos, superficies o los datos de contacto de cada propietario.
 */

const lotesData = [
  {
    id: "lote-01",
    numero: "Lote 01",
    manzana: "Manzana A",
    superficie: 450, // En metros cuadrados (m²)
    dimensiones: "15m frente x 30m fondo",
    precio: "$25,000 USD",
    precioUSD: 25000,
    estado: "disponible", // Opciones: "disponible", "reservado", "vendido"
    destacado: true,
    propietario: {
      nombre: "Juan Carlos Gómez",
      email: "juancarlos.lote1@ejemplo.com",
      telefono: "+54 9 11 5555-0101",
      whatsapp: "5491155550101"
    },
    coordenadas: [-31.4167, -64.1833], // Coordenada central para el marcador [Lat, Lng]
    poligono: [
      [-31.4165, -64.1836],
      [-31.4165, -64.1830],
      [-31.4169, -64.1830],
      [-31.4169, -64.1836]
    ],
    fotos: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80"
    ],
    caracteristicas: ["Luz eléctrica", "Agua de red", "Escritura inmediata", "Vista a las sierras"],
    descripcion: "Hermoso lote plano ubicado en esquina sobre calle principal. Excelente orientación solar norte, rodeado de entorno natural consolidado y listo para construir."
  },
  {
    id: "lote-02",
    numero: "Lote 02",
    manzana: "Manzana A",
    superficie: 520,
    dimensiones: "16m frente x 32.5m fondo",
    precio: "$29,500 USD",
    precioUSD: 29500,
    estado: "disponible",
    destacado: false,
    propietario: {
      nombre: "María Elena Rossi",
      email: "maria.rossi.prop@ejemplo.com",
      telefono: "+54 9 11 5555-0202",
      whatsapp: "5491155550202"
    },
    coordenadas: [-31.4167, -64.1827],
    poligono: [
      [-31.4165, -64.1830],
      [-31.4165, -64.1824],
      [-31.4169, -64.1824],
      [-31.4169, -64.1830]
    ],
    fotos: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
    ],
    caracteristicas: ["Luz subterránea", "Agua corriente", "Gas natural", "Cerca del centro comercial"],
    descripcion: "Lote residencial amplio con leve pendiente que favorece vistas panorámicas. Servicios completos en puerta."
  },
  {
    id: "lote-03",
    numero: "Lote 03",
    manzana: "Manzana B",
    superficie: 600,
    dimensiones: "20m frente x 30m fondo",
    precio: "$34,000 USD",
    precioUSD: 34000,
    estado: "reservado",
    destacado: true,
    propietario: {
      nombre: "Roberto Fernández",
      email: "roberto.terrenos@ejemplo.com",
      telefono: "+54 9 11 5555-0303",
      whatsapp: "5491155550303"
    },
    coordenadas: [-31.4172, -64.1833],
    poligono: [
      [-31.4170, -64.1836],
      [-31.4170, -64.1830],
      [-31.4174, -64.1830],
      [-31.4174, -64.1836]
    ],
    fotos: [
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
    ],
    caracteristicas: ["Terreno arbolado", "Agua corriente", "Seguridad 24hs", "Apto crédito"],
    descripcion: "Lote preferencial con vegetación autóctona preservada. Ideal para vivienda permanente o casa de fin de semana."
  },
  {
    id: "lote-04",
    numero: "Lote 04",
    manzana: "Manzana B",
    superficie: 480,
    dimensiones: "15m frente x 32m fondo",
    precio: "$26,800 USD",
    precioUSD: 26800,
    estado: "vendido",
    destacado: false,
    propietario: {
      nombre: "Desarrolladora Valdivia",
      email: "ventas@valdivialotes.com",
      telefono: "+54 9 11 5555-0404",
      whatsapp: "5491155550404"
    },
    coordenadas: [-31.4172, -64.1827],
    poligono: [
      [-31.4170, -64.1830],
      [-31.4170, -64.1824],
      [-31.4174, -64.1824],
      [-31.4174, -64.1830]
    ],
    fotos: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
    ],
    caracteristicas: ["Vendido", "Barrio cerrado", "Servicios subterráneos"],
    descripcion: "Lote vendido. Excelente ubicación central."
  },
  {
    id: "lote-05",
    numero: "Lote 05",
    manzana: "Manzana C",
    superficie: 750,
    dimensiones: "25m frente x 30m fondo",
    precio: "$42,000 USD",
    precioUSD: 42000,
    estado: "disponible",
    destacado: true,
    propietario: {
      nombre: "Ana Lucía Benítez",
      email: "anabenitez.lote5@ejemplo.com",
      telefono: "+54 9 11 5555-0505",
      whatsapp: "5491155550505"
    },
    coordenadas: [-31.4177, -64.1833],
    poligono: [
      [-31.4175, -64.1837],
      [-31.4175, -64.1829],
      [-31.4179, -64.1829],
      [-31.4179, -64.1837]
    ],
    fotos: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80"
    ],
    caracteristicas: ["Lote Macro", "Apto subdivisión o Dúplex", "Acceso pavimentado", "Todos los servicios"],
    descripcion: "Lote premium de gran tamaño en la mejor zona del desarrollo. Apto para construcción de vivienda unifamiliar o proyecto multifamiliar."
  },
  {
    id: "lote-06",
    numero: "Lote 06",
    manzana: "Manzana C",
    superficie: 510,
    dimensiones: "17m frente x 30m fondo",
    precio: "$28,000 USD",
    precioUSD: 28000,
    estado: "disponible",
    destacado: false,
    propietario: {
      nombre: "Esteban Suárez",
      email: "esteban.suarez@ejemplo.com",
      telefono: "+54 9 11 5555-0606",
      whatsapp: "5491155550606"
    },
    coordenadas: [-31.4177, -64.1825],
    poligono: [
      [-31.4175, -64.1829],
      [-31.4175, -64.1821],
      [-31.4179, -64.1821],
      [-31.4179, -64.1829]
    ],
    fotos: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
    ],
    caracteristicas: ["Luz eléctrica", "Agua corriente", "Escritura inmediata"],
    descripcion: "Lote rectangular regular con suelos firmes para edificación inmediata."
  }
];

// Configuración general del sitio
const sitioConfig = {
  nombreProyecto: "Valdivia Lotes & Terrenos",
  subtitulo: "Encuentra el terreno ideal para construir tus sueños",
  telefonoGeneral: "+54 9 11 5555-9999",
  emailGeneral: "contacto@valdivialotes.com",
  coordenadasMapaCentro: [-31.4171, -64.1830],
  zoomMapaInicial: 17,
  // Claves opcionales para integración con EmailJS (gratuito)
  emailjsPublicKey: "",
  emailjsServiceId: "",
  emailjsTemplateId: ""
};
