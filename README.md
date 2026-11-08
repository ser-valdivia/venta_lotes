# 🏡 Córdoba Serrana Inmuebles

Plataforma inmobiliaria interactiva para la publicación, filtrado y venta directa de **Terrenos en Villa Icho Cruz (Valle de Punilla)** y **Departamentos y Locales Comerciales en Córdoba Capital**.

Construida con **Bootstrap 5.3**, **JavaScript (ES6+)**, **Leaflet.js** y **Google Firebase (Firestore + Google Auth)**, optimizada para ejecutarse de forma **100% gratuita en GitHub Pages**.

---

## 🌟 Características Principales

* 📊 **Panel de Métricas y Rendimiento en Vivo (`admin.html`):**
  - **Visitas al Sitio:** Conteo acumulado de visitantes en tiempo real.
  - **Contactos por WhatsApp:** Número de personas que hicieron clic en *"Hablar por WhatsApp"*.
  - **Consultas por Correo:** Cantidad de formularios enviados a los propietarios.
  - **Tasa de Contacto (%):** Medición de efectividad y conversión de visitas a prospectos.
  - **Google Analytics 4 & Search Console:** Botones de acceso directo a tus estadísticas avanzadas oficiales de Google.
* 🔒 **Acceso de Administración con Cuenta de Google:**
  - Login seguro con Google restringido **exclusivamente a `sergiovaldivia4@gmail.com`**.
  - Si cualquier otra persona intenta ingresar al panel, el sistema le deniega el acceso automáticamente.
* ⚡ **Edición y Publicación en Tiempo Real (Sin Exportar Archivos):**
  - Cada vez que cargas un inmueble, cambias un precio, ocultas una propiedad o modificas fotos, **se guarda al instante en Google Cloud Firestore**.
  - **No necesitas descargar ni reemplazar `data.js`**: la web pública se actualiza sola de inmediato.
* 🗺️ **Mapa Satelital Interactivo (Esri World Imagery + OpenStreetMap):**
  - Delineación perimetral de lotes (polígonos) y pines temáticos (Deptos, Locales, Casas).
  - Botones de salto rápido entre *Villa Icho Cruz* y *Córdoba Capital*.
* 📐 **Herramienta de Mapa Doble en el Admin:**
  - `[ 📍 Modo Pin ]`: Clic en el mapa para capturar coordenadas centrales.
  - `[ 📐 Modo Polígono ]`: Clics sucesivos para trazar el perímetro del terreno con botón para deshacer puntos.
* 🖼️ **Gestor de Fotos compatible con Google Drive y Optimización SEO:**
  - Pega enlaces compartidos de Google Drive (`drive.google.com/file/d/.../view`) y el sistema los convierte automáticamente a imágenes web.
  - **Medida SEO recomendada:** `1200 × 800 píxeles` (<250 KB) para máxima velocidad en celulares y mejor posicionamiento en Google Imágenes.
* 📱 **Contacto Inteligente:**
  - Vía preferida configurable por dueño (WhatsApp directo con mensaje pre-armado o formulario de correo).

---

## 🚀 Cómo Conectar tu Proyecto de Google Firebase (en 2 minutos)

Para que el login con tu cuenta `sergiovaldivia4@gmail.com` y la base de datos en tiempo real funcionen:

1. Entra a [Firebase Console](https://console.firebase.google.com/) con tu cuenta de Google.
2. Haz clic en **"Agregar proyecto"** (nombre sugerido: `cordoba-serrana-inmuebles`).
3. En el menú lateral izquierdo:
   * Ve a **Compilación > Authentication**:
     - Presiona *Comenzar*.
     - En la pestaña *Proveedores de acceso*, selecciona **Google** y presiona **Habilitar** (elige tu correo de soporte `sergiovaldivia4@gmail.com`) y guarda.
   * Ve a **Compilación > Firestore Database**:
     - Presiona **Crear base de datos**.
     - Selecciona la ubicación (ej: `us-central` o `southamerica-east1`).
     - En las reglas de seguridad, puedes iniciar en **Modo de prueba** (permite leer y escribir mientras configuras).
4. En el engranaje superior ⚙️ (**Configuración del proyecto**) > pestaña **General**:
   * En la sección *"Tus apps"*, haz clic en el ícono Web **`</>`**.
   * Ponle un nombre (ej: `web`) y copia el bloque `firebaseConfig`.
5. Abre el archivo **`js/firebase-config.js`** en tu proyecto y reemplaza las claves:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "tu-proyecto.firebaseapp.com",
     projectId: "tu-proyecto",
     storageBucket: "tu-proyecto.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
6. **¡Listo!** A partir de ese momento, inicias sesión con tu Google en `admin.html` y todos los cambios se guardarán automáticamente en la nube sin tocar ningún archivo.

---

## 📁 Estructura de Archivos

```text
venta_lotes/
├── index.html              # Landing page pública y rastreador de métricas
├── admin.html              # Panel con Google Login y Dashboard de Métricas
├── css/
│   ├── styles.css          # Estilos de la landing page
│   └── admin.css           # Estilos del panel de control
├── js/
│   ├── firebase-config.js  # Credenciales de Google, Firestore y registro de eventos
│   ├── data.js             # Base de datos inicial / respaldo local
│   ├── map.js              # Mapa interactivo Leaflet
│   ├── app.js              # Lógica de la landing, carga en tiempo real y tracking
│   └── admin.js            # Lógica del panel, KPIs y guardado en Firestore
├── SPEC.md                 # Especificación técnica
└── README.md               # Esta guía
```

---

## 🌐 Despliegue en GitHub Pages

1. Sube los cambios a GitHub:
   ```bash
   git add .
   git commit -m "Córdoba Serrana Inmuebles con Métricas y Google Analytics"
   git push origin main
   ```
2. En GitHub: **Settings > Pages > Branch: main / folder: / (root) > Save**.
3. En 1 minuto tu sitio estará online en:
   👉 `https://<tu-usuario>.github.io/<tu-repositorio>/`
