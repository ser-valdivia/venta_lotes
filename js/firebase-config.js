/**
 * CONFIGURACIÓN DE GOOGLE FIREBASE - CÓRDOBA SERRANA INMUEBLES
 * -------------------------------------------------------------
 * Manejo de Autenticación con Google, Base de Datos Firestore y Métricas en Tiempo Real.
 */

// Correo autorizado con acceso exclusivo
const ADMIN_EMAIL_AUTORIZADO = "sergiovaldivia4@gmail.com";

// Configuración de Firebase (reemplaza con tus credenciales de consola Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyA0yKAAXbuXSQoUddWxzdZPPmwkDmZZLyQ",
  authDomain: "cordoba-serrana-inmuebles.firebaseapp.com",
  projectId: "cordoba-serrana-inmuebles",
  storageBucket: "cordoba-serrana-inmuebles.firebasestorage.app",
  messagingSenderId: "95745398989",
  appId: "1:95745398989:web:0dcd17ca9b0c25ccbdf184",
  measurementId: "G-TPN0V9BMGG"
};

// Variable para verificar si Firebase está configurado con credenciales reales
const isFirebaseConfigurado = () => {
  return firebaseConfig.apiKey && firebaseConfig.apiKey !== "TU_API_KEY";
};

let auth = null;
let db = null;

// Inicializar Firebase si las librerías están cargadas
if (typeof firebase !== "undefined") {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    db = firebase.firestore();
  } catch (error) {
    console.warn("Firebase aún no está configurado con claves activas. Operando en modo local.", error);
  }
}

// 1. INICIAR SESIÓN CON GOOGLE
async function loginConGoogle() {
  if (window.location.protocol === "file:") {
    alert("ℹ️ Estás abriendo el archivo con doble clic (file:///):\n\nGoogle OAuth no permite iniciar sesión desde archivos locales en el disco por seguridad de los navegadores.\n\nPara usar Google Sign-In, debes abrirlo desde un servidor local (http://localhost) o directamente en GitHub Pages (https://).\n\nPuedes presionar el botón azul 'Entrar en Modo Local de Prueba' para ingresar al panel sin necesidad de servidor.");
    return null;
  }

  if (!auth) {
    alert("Para activar el inicio de sesión con Google, primero ingresa tus claves de Firebase en 'js/firebase-config.js'.");
    return null;
  }

  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    
    // Validar si es el correo autorizado
    if (user.email.toLowerCase() !== ADMIN_EMAIL_AUTORIZADO.toLowerCase()) {
      await auth.signOut();
      alert(`⛔ Acceso Denegado: La cuenta ${user.email} no tiene permisos de administrador.`);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);
    alert("Error al iniciar sesión con Google: " + error.message);
    return null;
  }
}

// 2. CERRAR SESIÓN
async function logoutGoogle() {
  if (auth) {
    await auth.signOut();
  }
  window.location.reload();
}

// 3. OBTENER INMUEBLES DESDE FIRESTORE
async function obtenerInmueblesDesdeFirestore() {
  if (!db || !isFirebaseConfigurado()) {
    return null;
  }

  try {
    const snapshot = await db.collection("inmuebles").get();
    if (snapshot.empty) {
      return [];
    }
    const lista = [];
    snapshot.forEach(doc => {
      lista.push({ id: doc.id, ...doc.data() });
    });
    lista.sort((a, b) => (a.orden || 999) - (b.orden || 999));
    return lista;
  } catch (error) {
    console.error("Error al leer desde Firestore:", error);
    return null;
  }
}

// 4. GUARDAR O ACTUALIZAR UN INMUEBLE EN FIRESTORE
async function guardarInmuebleEnFirestore(inmueble) {
  if (!db || !isFirebaseConfigurado()) {
    return false;
  }

  try {
    const id = inmueble.id;
    const datos = { ...inmueble };
    delete datos.id;
    await db.collection("inmuebles").doc(id).set(datos, { merge: true });
    return true;
  } catch (error) {
    console.error("Error al guardar en Firestore:", error);
    throw error;
  }
}

// 5. ELIMINAR UN INMUEBLE DE FIRESTORE
async function eliminarInmuebleDeFirestore(id) {
  if (!db || !isFirebaseConfigurado()) {
    return false;
  }

  try {
    await db.collection("inmuebles").doc(id).delete();
    return true;
  } catch (error) {
    console.error("Error al eliminar de Firestore:", error);
    throw error;
  }
}

// 6. ACTUALIZAR ORDEN O PUBLICACIÓN EN FIRESTORE
async function actualizarCampoInmuebleFirestore(id, campo, valor) {
  if (!db || !isFirebaseConfigurado()) {
    return false;
  }

  try {
    const actualizacion = {};
    actualizacion[campo] = valor;
    await db.collection("inmuebles").doc(id).update(actualizacion);
    return true;
  } catch (error) {
    console.error(`Error al actualizar ${campo} en Firestore:`, error);
    throw error;
  }
}

// 7. SEMBRAR DATOS INICIALES EN FIRESTORE
async function sembrarDatosInicialesEnFirestore(datosIniciales) {
  if (!db || !isFirebaseConfigurado()) return;

  try {
    const snapshot = await db.collection("inmuebles").limit(1).get();
    if (snapshot.empty && datosIniciales && datosIniciales.length > 0) {
      console.log("Firestore está vacío. Sembrando catálogo inicial...");
      const batch = db.batch();
      datosIniciales.forEach(item => {
        const docRef = db.collection("inmuebles").doc(item.id);
        const copia = { ...item };
        delete copia.id;
        batch.set(docRef, copia);
      });
      await batch.commit();
      console.log("Catálogo inicial cargado exitosamente en Firestore.");
    }
  } catch (error) {
    console.warn("No se pudieron sembrar datos iniciales:", error);
  }
}

// ==============================================================
// 8. SISTEMA DE MÉTRICAS EN TIEMPO REAL (VISITAS Y CONVERSIONES)
// ==============================================================

// Registrar un evento de métrica ("visita", "whatsapp", "email", "mapa")
async function registrarEventoMetrica(tipoEvento) {
  const campoMap = {
    visita: "totalVisitas",
    whatsapp: "clicsWhatsApp",
    email: "consultasEmail",
    mapa: "interaccionesMapa"
  };

  const campo = campoMap[tipoEvento];
  if (!campo) return;

  // 1. Guardar en Firestore si está disponible
  if (db && isFirebaseConfigurado()) {
    try {
      const updateData = {
        ultimaActividad: new Date().toISOString()
      };
      updateData[campo] = firebase.firestore.FieldValue.increment(1);
      await db.collection("metricas").doc("resumen").set(updateData, { merge: true });
    } catch (e) {
      console.warn("No se pudo registrar métrica en Firestore:", e);
    }
  }

  // 2. Guardar también en LocalStorage (respaldo offline)
  try {
    const guardadas = JSON.parse(localStorage.getItem("cordoba_serrana_metricas") || "{}");
    guardadas[campo] = (guardadas[campo] || 0) + 1;
    guardadas.ultimaActividad = new Date().toISOString();
    localStorage.setItem("cordoba_serrana_metricas", JSON.stringify(guardadas));
  } catch (e) {
    // Silencioso
  }
}

// Obtener métricas acumuladas para el panel de administración
async function obtenerMetricasAcumuladas() {
  let metricas = {
    totalVisitas: 0,
    clicsWhatsApp: 0,
    consultasEmail: 0,
    interaccionesMapa: 0,
    ultimaActividad: null
  };

  // Intentar leer de Firestore
  if (db && isFirebaseConfigurado()) {
    try {
      const doc = await db.collection("metricas").doc("resumen").get();
      if (doc.exists) {
        metricas = { ...metricas, ...doc.data() };
        return metricas;
      }
    } catch (e) {
      console.warn("Error al leer métricas de Firestore, usando local:", e);
    }
  }

  // Fallback a LocalStorage
  try {
    const guardadas = JSON.parse(localStorage.getItem("cordoba_serrana_metricas") || "{}");
    metricas = { ...metricas, ...guardadas };
  } catch (e) {}

  return metricas;
}
