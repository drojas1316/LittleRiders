/* =======================================
SEED - CARGA INICIAL DE DATOS
========================================= */

document.addEventListener("DOMContentLoaded", function() {
    inicializarBaseDatos();
});

async function inicializarBaseDatos() {
    //solo para probar, en producción se debe cargar una sola vez y luego comentar esta función
    const MODO_DESARROLLO = true; // Cambia a false para producción y evitar recargas innecesarias

    const yaInicializado = localStorage.getItem(DB_KEYS.inicializado);

    if (yaInicializado === "true" && !MODO_DESARROLLO) {
        console.log("Little Riders: base de datos ya inicializada.");

        document.dispatchEvent(new Event("baseDatosLista"));
        return;
    }

    try {
        await cargarJsonEnStorage("data/usuarios.json", DB_KEYS.usuarios);
        await cargarJsonEnStorage("data/padres.json", DB_KEYS.padres);
        await cargarJsonEnStorage("data/hijos.json", DB_KEYS.hijos);
        await cargarJsonEnStorage("data/conductores.json", DB_KEYS.conductores);
        await cargarJsonEnStorage("data/busetas.json", DB_KEYS.busetas);
        await cargarJsonEnStorage("data/rutas.json", DB_KEYS.rutas);
        await cargarJsonEnStorage("data/pagos.json", DB_KEYS.pagos);
        await cargarJsonEnStorage("data/mensajes.json", DB_KEYS.mensajes);
        await cargarJsonEnStorage("data/alertas.json", DB_KEYS.alertas);
        await cargarJsonEnStorage("data/gps.json", DB_KEYS.gps);

        localStorage.setItem(DB_KEYS.inicializado, "true");

        console.log("Little Riders: base de datos inicializada correctamente.");

        document.dispatchEvent(new Event("baseDatosLista"));
        
    } catch (error) {
        console.error("Error inicializando la base de datos:", error);
    }
}


async function cargarJsonEnStorage(rutaJson, claveStorage) {
    const respuesta = await fetch(rutaJson);

    if (!respuesta.ok) {
        throw new Error(`No se pudo cargar ${rutaJson}`);
    }

    const datos = await respuesta.json();

    guardarDatos(claveStorage, datos);
}