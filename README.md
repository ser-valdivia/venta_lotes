# 🏡 Landing Page de Venta de Lotes y Terrenos

Plataforma web interactiva para la publicación, filtrado y venta directa de lotes/terrenos, construida con **Bootstrap 5**, **JavaScript (ES6)** y **Leaflet.js**. Diseñada para ser desplegada de forma **100% gratuita en GitHub Pages**.

---

## ✨ Características Principales

- 🗺️ **Mapa Interactivo con Vista Satelital y Callejera**: Visualización de delimitaciones/polígonos de lotes y marcadores interactivos codificados por estado (Verde = Disponible, Naranja = Reservado, Rojo = Vendido).
- ✉️ **Contacto Directo por Lote**: Cada terreno posee sus propios datos de propietario. Al hacer clic en *Contactar*, la consulta se redirige automáticamente al correo electrónico o WhatsApp del dueño específico de ese terreno.
- 🖼️ **Ficha Técnica y Galería de Fotos**: Modal con carrusel de fotografías en alta resolución, dimensiones, superficie en m², lista de servicios y descripción detallada.
- 🔍 **Filtros Interactivos**: Búsqueda por palabra clave, filtrado por estado (Disponible/Reservado/Vendido) y ordenamiento por precio o superficie.
- 📱 **Diseño Responsive y Moderno**: Adaptado para teléfonos móviles, tablets y computadoras.

---

## 📁 Estructura del Proyecto

```text
venta_lotes/
├── index.html              # Estructura principal con Bootstrap 5 y modales
├── css/
│   └── styles.css          # Estilos personalizados, gradientes y estados de lotes
├── js/
│   ├── data.js             # Modelo de datos editable (Lotes, superficies, dueños, fotos)
│   ├── map.js              # Lógica del mapa interactivo con Leaflet.js
│   └── app.js              # Lógica del catálogo, filtros y envío de consultas
└── README.md               # Instrucciones de uso y despliegue
```

---

## 🛠️ ¿Cómo Agregar o Modificar Lotes y Fotos?

Toda la información del proyecto se gestiona desde el archivo **`js/data.js`**. No necesitas modificar código HTML ni estructuras complejas.

### Ejemplo de cómo editar un lote en `js/data.js`:

```javascript
{
  id: "lote-01",
  numero: "Lote 01",
  manzana: "Manzana A",
  superficie: 450, // En metros cuadrados (m²)
  dimensiones: "15m frente x 30m fondo",
  precio: "$25,000 USD",
  precioUSD: 25000,
  estado: "disponible", // "disponible", "reservado", "vendido"
  propietario: {
    nombre: "Juan Carlos Gómez",
    email: "correo.dueno@ejemplo.com", // ✉️ Aquí llega la consulta del comprador
    telefono: "+54 9 11 5555-0101",
    whatsapp: "5491155550101" // Sin símbolo '+' para el enlace directo
  },
  coordenadas: [-31.4167, -64.1833], // [Latitud, Longitud] para la ubicación del pin
  poligono: [ // Puntos para el perímetro en el mapa
    [-31.4165, -64.1836],
    [-31.4165, -64.1830],
    [-31.4169, -64.1830],
    [-31.4169, -64.1836]
  ],
  fotos: [
    "https://tu-servidor.com/foto1.jpg",
    "https://tu-servidor.com/foto2.jpg"
  ],
  caracteristicas: ["Luz eléctrica", "Agua de red", "Escritura inmediata"],
  descripcion: "Hermoso lote plano ubicado en esquina..."
}
```

---

## 🚀 Cómo Subir a GitHub Pages (Hosting Gratuito)

1. **Subir los cambios a GitHub**:
   ```bash
   git add .
   git commit -m "Landing page de venta de lotes lista"
   git push origin main
   ```

2. **Activar GitHub Pages**:
   - Ve a tu repositorio en GitHub.
   - Haz clic en la pestaña **Settings** (Configuración).
   - En el menú lateral izquierdo, selecciona **Pages**.
   - En la sección **Build and deployment** -> **Branch**:
     - Selecciona la rama `main` (o `master`).
     - Selecciona la carpeta `/ (root)`.
   - Haz clic en **Save** (Guardar).

3. **¡Listo!** En aproximadamente 1 a 2 minutos, GitHub te proporcionará el enlace público de tu sitio web (ej: `https://tu-usuario.github.io/venta_lotes/`).

---

## 📧 Configuración de Correo de Consultas

Por defecto, al presionar **Enviar Mensaje al Correo del Dueño**, la página:
1. Abre el cliente de correo predeterminado del usuario con el correo del dueño pre-completado en el destinatario, asunto y mensaje (`mailto:`).
2. Proporciona un botón directo de **WhatsApp** con un mensaje pre-armado dirigido al número del dueño.

### Opción opcional: Envío silencioso con EmailJS (Gratis)
Si deseas que los mensajes se envíen en segundo plano sin abrir el cliente de correo:
1. Regístrate gratis en [EmailJS.com](https://www.emailjs.com/).
2. Crea un servicio de email y una plantilla.
3. Copia tus claves en la variable `sitioConfig` al final de `js/data.js`:
   ```javascript
   const sitioConfig = {
     emailjsPublicKey: "TU_PUBLIC_KEY",
     emailjsServiceId: "TU_SERVICE_ID",
     emailjsTemplateId: "TU_TEMPLATE_ID"
   };
   ```
