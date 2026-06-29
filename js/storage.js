/* =======================================
LOCALSTORAGE - LITTLE RIDERS
Centraliza la lectura y escritura de datos
simulados en localStorage.
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

/* Guarda una lista u objeto en localStorage.
   Parámetros:
   - clave: nombre de la clave de almacenamiento.
   - datos: valor serializable para persistir.
*/
function guardarDatos(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}


/* Recupera datos desde localStorage.
   Si la clave no existe, devuelve un arreglo vacío.
*/
function obtenerDatos(clave) {
    const datos = localStorage.getItem(clave);

    if (!datos) {
        return [];
    }

    return JSON.parse(datos);
}

/* Obtiene un registro por su identificador.
   Parámetros:
   - clave: colección de datos.
   - id: identificador del registro.
*/
function obtenerPorId(clave, id) {
    const datos = obtenerDatos(clave);

    return datos.find(item => item.id === Number(id));
}


/* Agrega un nuevo registro a una colección.
   El id se asigna automáticamente si no existe.
*/
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


/* Actualiza un registro existente por id.
   Parámetros:
   - clave: colección en la que se encuentra el registro.
   - id: identificador a modificar.
   - datosActualizados: campos nuevos para fusionar.
*/
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