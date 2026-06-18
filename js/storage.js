/* =======================================
LOCALSTORAGE - LITTLE RIDERS
Base de datos simulada
========================================= */

const DB_KEYS = {
    usuarios: "lr_usuarios",
    padres: "lr_padres",
    hijos: "lr_hijos",
    conductores: "lr_conductores",
    busetas: "lr_busetas",
    rutas: "lr_rutas",
    pagos: "lr_pagos",
    mensajes: "lr_mensajes",
    alertas: "lr_alertas",
    gps: "lr_gps",
    sesion: "lr_sesion",
    inicializado: "lr_inicializado"
};

/* Guardar una lista u objeto en localStorage */
function guardarDatos(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}


/* Obtener datos desde localStorage */
function obtenerDatos(clave) {
    const datos = localStorage.getItem(clave);

    if (!datos) {
        return [];
    }

    return JSON.parse(datos);
}

/* Obtener un registro por id */
function obtenerPorId(clave, id) {
    const datos = obtenerDatos(clave);

    return datos.find(item => item.id === Number(id));
}


/* Agregar un nuevo registro */
function agregarDato(clave, nuevoDato) {
    const datos = obtenerDatos(clave);

    const nuevoId = datos.length > 0
        ? Math.max(...datos.map(item => item.id)) + 1
        : 1;

    nuevoDato.id = nuevoId;

    datos.push(nuevoDato);

    guardarDatos(clave, datos);

    return nuevoDato;
}


/* Actualizar un registro */
function actualizarDato(clave, id, datosActualizados) {
    const datos = obtenerDatos(clave);

    const datosModificados = datos.map(item => {
        if (item.id === Number(id)) {
            return {
                ...item,
                ...datosActualizados
            };
        }

        return item;
    });

    guardarDatos(clave, datosModificados);
}



/* Eliminar un registro */
function eliminarDato(clave, id) {
    const datos = obtenerDatos(clave);

    const datosFiltrados = datos.filter(item => item.id !== Number(id));

    guardarDatos(clave, datosFiltrados);
}



/* Limpiar toda la base de datos simulada */
function limpiarBaseDatos() {
    Object.values(DB_KEYS).forEach(clave => {
        localStorage.removeItem(clave);
    });
}