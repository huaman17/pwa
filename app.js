// 📌 Registrar el service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(reg => console.log("✅ Service Worker registrado", reg.scope))
    .catch(err => console.log("❌ Error en Service Worker", err));
}

// 📌 Función para simular una petición de red
async function cargarDatos() {
  try {
    const respuesta = await fetch("https://jsonplaceholder.typicode.com/posts/1");
    const datos = await respuesta.json();
    document.getElementById("contenido").innerText = "📡 " + datos.title;
  } catch (error) {
    document.getElementById("contenido").innerText = "⚠️ Sin conexión, cargando datos en caché...";
  }
}

// Cargar datos al iniciar
cargarDatos();
