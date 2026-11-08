# Especificación Técnica y Plan de Ejecución: Córdoba Serrana Inmuebles

> **Estado del Documento:** IMPLEMENTADO / LISTO PARA PRODUCCIÓN  
> **Última actualización:** 2026-11-07  
> **Nombre Comercial:** Córdoba Serrana Inmuebles  
> **Autenticación:** Google Sign-In (Exclusivo para `sergiovaldivia4@gmail.com`)  
> **Base de Datos & Métricas:** Google Cloud Firestore (Tiempo Real) + Respaldo Local  
> **Métricas Integradas:** Contador de Visitas, Clics en WhatsApp, Consultas por Correo, Google Analytics 4 y Search Console  
> **Ubicaciones:** Villa Icho Cruz (Valle de Punilla) y Córdoba Capital, Argentina  

---

## 1. Visión General y Alcance

### 1.1 Objetivo
Plataforma web inmobiliaria moderna, responsive (mobile-first) y autoadministrable, optimizada para **GitHub Pages** (hosting gratuito con certificado SSL). Permite la publicación, filtrado y venta de:
* **Lotes / Terrenos** (en Villa Icho Cruz y Valle de Punilla).
* **Departamentos y Locales Comerciales** (en la Ciudad de Córdoba).
* **Casas / Cabañas**.

### 1.2 Seguridad, Autoadministración y Analítica
* **Control de Acceso:** `admin.html` cuenta con una pantalla de bloqueo que requiere inicio de sesión con Google. Solo la cuenta `sergiovaldivia4@gmail.com` tiene autorización de acceso.
* **Persistencia sin Archivos:** Cada cambio, alta o baja se impacta directamente en **Google Firestore**, eliminando la necesidad de descargar o copiar archivos `data.js`.
* **Métricas en Tiempo Real:** Medición de visitantes al sitio web, tasa de conversión y clics hacia WhatsApp y correo de los propietarios.

---

## 2. Arquitectura de Módulos

```text
venta_lotes/
├── index.html              # Landing page pública: catálogo, mapa satelital, modales y rastreo de visitas
├── admin.html              # Panel con pantalla de acceso con Google y Dashboard de Métricas
├── css/
│   ├── styles.css          # Estilos de la landing (paleta verde bosque, oro y glassmorphism)
│   └── admin.css           # Estilos del panel de control
├── js/
│   ├── firebase-config.js  # Configuración de Google Auth, Firestore y sistema de métricas
│   ├── data.js             # Base de datos local inicial / respaldo
│   ├── map.js              # Mapa interactivo Leaflet (polígonos, pines y popups)
│   ├── app.js              # Lógica de la landing: filtros por tipo/zona, orden, contacto y eventos
│   └── admin.js            # Lógica del panel: geolocalizador doble, fotos, Firestore y KPIs
├── SPEC.md                 # Especificación técnica
└── README.md               # Guía de configuración paso a paso
```

---

## 3. Características Clave

1. **Dashboard de Métricas en Vivo (`admin.html`):**
   * 👥 **Total de Visitas Únicas al Sitio:** Conteo en tiempo real.
   * 💬 **Contactos por WhatsApp:** Número de interesados que abrieron chat directo con dueños.
   * ✉️ **Leads por Correo:** Consultas enviadas a través del formulario.
   * 📊 **Tasa de Contacto (%):** Porcentaje de conversión de visitas a contactos reales.
   * 🔍 **Acceso directo a Google Analytics 4 y Google Search Console.**
2. **Autenticación Oficial Google:** Mediante Firebase Auth con Popup nativo de Google.
3. **Edición en Tiempo Real:** Las actualizaciones de disponibilidad, precios, orden y fotos se sincronizan instantáneamente en la web pública.
4. **Herramienta de Mapa Doble:** Conmutador interactivo entre Modo Pin (coordenadas) y Modo Polígono (perímetro) sobre mapas satelitales Esri y callejeros OSM.
5. **Conversor de Google Drive:** Transformación automática de enlaces compartidos a imágenes compatibles con la web.
6. **Guía SEO para Fotos:** 1200x800 px, <250 KB (WebP/JPG) para optimizar Google Core Web Vitals (LCP).
