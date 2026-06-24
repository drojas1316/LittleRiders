/* =======================================
BUSETAS - LITTLE RIDERS
Muestra las busetas disponibles y permite asignar
la ruta de una buseta a un hijo del padre actual.
========================================= */


let busetaSeleccionadaId = null;
let rutaSeleccionadaId = null;
let modalAsignarConfigurado = false;


/*
Cuando la base de datos está lista:
- protege la página
- carga las tarjetas de busetas
- configura el modal una sola vez
*/
document.addEventListener("baseDatosLista", function () {
    protegerPagina(["padre"]);

    cargarBusetas();

    if (!modalAsignarConfigurado) {
        configurarModalAsignarBuseta();
        modalAsignarConfigurado = true;
    }
});


/*
Carga todas las busetas y las muestra en tarjetas.
Cada buseta busca su ruta y su conductor asignado.
*/
function cargarBusetas() {
    const contenedor = document.getElementById("busetasList");

    if (!contenedor) {
        return;
    }

    const busetas = obtenerDatos(DB_KEYS.busetas);
    const rutas = obtenerDatos(DB_KEYS.rutas);
    const conductores = obtenerDatos(DB_KEYS.conductores);

    if (busetas.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-busetas">
                <i class="fa-solid fa-bus"></i>
                <h3>No hay busetas registradas</h3>
                <p>Cuando administración registre busetas, aparecerán aquí.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = "";

    busetas.forEach(function (buseta) {
        const ruta = rutas.find(function (ruta) {
            return ruta.busetaId === buseta.id;
        });

        const conductor = ruta
            ? conductores.find(function (conductor) {
                return conductor.id === ruta.conductorId;
            })
            : null;

        const nombreRuta = ruta ? ruta.nombre : "Sin ruta asignada";
        const nombreConductor = conductor ? conductor.nombre : "Sin conductor";
        const imagenBuseta = buseta.imagen || "img/busetas/buseta1.png";

        const estado = buseta.estado || "Activa";
        const estadoMinuscula = estado.toLowerCase();

        const estaEnMantenimiento = estadoMinuscula.includes("mantenimiento");

        const claseEstado = estaEnMantenimiento
            ? "mantenimiento"
            : "activa";

        let textoBoton = "Asignar a hijo";

        if (estaEnMantenimiento) {
            textoBoton = "No disponible";
        } else if (!ruta) {
            textoBoton = "Sin ruta asignada";
        }

        const claseBoton = !ruta || estaEnMantenimiento
            ? "sin-ruta"
            : "";

        contenedor.innerHTML += `
            <article class="buseta-card">

                <div class="buseta-img">
                    <img src="${imagenBuseta}" alt="${buseta.nombre}">
                </div>

                <div class="buseta-info">

                    <div class="buseta-top">
                        <div>
                            <h3>${buseta.nombre}</h3>
                            <p class="buseta-placa">Placa: ${buseta.placa}</p>
                        </div>

                        <span class="buseta-estado ${claseEstado}">
                            ${estado}
                        </span>
                    </div>

                    <div class="buseta-datos">

                        <div class="buseta-dato">
                            <i class="fa-solid fa-palette"></i>
                            <span>Color: ${buseta.color}</span>
                        </div>

                        <div class="buseta-dato">
                            <i class="fa-solid fa-users"></i>
                            <span>Capacidad: ${buseta.capacidad} estudiantes</span>
                        </div>

                        <div class="buseta-dato">
                            <i class="fa-solid fa-calendar"></i>
                            <span>Modelo: ${buseta.modelo}</span>
                        </div>

                        <div class="buseta-dato">
                            <i class="fa-solid fa-user-tie"></i>
                            <span>Conductor: ${nombreConductor}</span>
                        </div>

                        <div class="buseta-dato">
                            <i class="fa-solid fa-star"></i>
                            <span>Calificación: ${buseta.calificacion || "Sin calificación"}</span>
                        </div>

                    </div>

                    <span class="buseta-ruta">
                        ${nombreRuta}
                    </span>

                    <button 
                        type="button"
                        class="btn-asignar-buseta ${claseBoton}"
                        data-buseta-id="${buseta.id}"
                        data-ruta-id="${ruta ? ruta.id : ""}"
                        data-estado="${estado}"
                    >
                        <i class="fa-solid fa-child"></i>
                        ${textoBoton}
                    </button>

                </div>

            </article>
        `;
    });

    activarBotonesAsignarBuseta();
}


/*
Configura el modal de asignar buseta.
Aquí se activa:
- cerrar modal
- cerrar tocando el fondo
- guardar asignación con el formulario
*/
function configurarModalAsignarBuseta() {
    const modal = document.getElementById("modalAsignarBuseta");
    const cerrarModal = document.getElementById("cerrarModalAsignar");
    const form = document.getElementById("formAsignarBuseta");

    if (cerrarModal) {
        cerrarModal.addEventListener("click", function () {
            cerrarModalAsignarBuseta();
        });
    }

    if (modal) {
        modal.addEventListener("click", function (e) {
            if (e.target === modal) {
                cerrarModalAsignarBuseta();
            }
        });
    }

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            asignarBusetaAHijo();
        });
    }
}


/*
Activa todos los botones de asignar buseta.

Si la buseta está en mantenimiento o no tiene ruta,
muestra una notificación y no abre el modal.
*/
function activarBotonesAsignarBuseta() {
    const botones = document.querySelectorAll(".btn-asignar-buseta");

    botones.forEach(function (boton) {
        boton.addEventListener("click", function () {
            const estado = boton.dataset.estado.toLowerCase();

            busetaSeleccionadaId = Number(boton.dataset.busetaId);
            rutaSeleccionadaId = Number(boton.dataset.rutaId);

            if (estado.includes("mantenimiento")) {
                mostrarNotificacion(
                    "Esta buseta está en mantenimiento y no se puede asignar.",
                    "warning"
                );
                return;
            }

            if (!rutaSeleccionadaId) {
                mostrarNotificacion(
                    "Esta buseta todavía no tiene una ruta asignada.",
                    "warning"
                );
                return;
            }

            cargarHijosEnSelect();
            abrirModalAsignarBuseta();
        });
    });
}


/*
Carga en el select solo los hijos activos del padre actual.
*/
function cargarHijosEnSelect() {
    const select = document.getElementById("selectHijoAsignar");

    if (!select) {
        return;
    }

    const sesion = obtenerSesion();
    const usuario = obtenerUsuarioActual();

    if (!sesion && !usuario) {
        mostrarNotificacion("No hay una sesión activa.", "error");
        return;
    }

    const usuarioId = usuario ? usuario.id : sesion.usuarioId;

    const padres = obtenerDatos(DB_KEYS.padres);
    const hijos = obtenerDatos(DB_KEYS.hijos);

    const padreActual = padres.find(function (padre) {
        return padre.usuarioId === usuarioId;
    });

    select.innerHTML = `<option value="">Seleccionar hijo</option>`;

    if (!padreActual) {
        mostrarNotificacion("No se encontró el perfil del padre.", "error");
        return;
    }

    const hijosPadre = hijos.filter(function (hijo) {
        return hijo.padreId === padreActual.id && hijo.estado === "activo";
    });

    if (hijosPadre.length === 0) {
        select.innerHTML += `
            <option value="" disabled>
                No tienes hijos registrados
            </option>
        `;
        return;
    }

    hijosPadre.forEach(function (hijo) {
        select.innerHTML += `
            <option value="${hijo.id}">
                ${hijo.nombre} - ${hijo.grado}
            </option>
        `;
    });
}


/*
Abre el modal de asignar buseta.
*/
function abrirModalAsignarBuseta() {
    const modal = document.getElementById("modalAsignarBuseta");

    if (modal) {
        modal.classList.add("active");
    }
}


/*
Cierra el modal y limpia la selección temporal.
*/
function cerrarModalAsignarBuseta() {
    const modal = document.getElementById("modalAsignarBuseta");
    const select = document.getElementById("selectHijoAsignar");

    if (modal) {
        modal.classList.remove("active");
    }

    if (select) {
        select.value = "";
    }

    busetaSeleccionadaId = null;
    rutaSeleccionadaId = null;
}


/*
Asigna la ruta de la buseta seleccionada al hijo seleccionado.

Importante:
El hijo no guarda busetaId directamente.
El hijo guarda rutaId.
La ruta es la que tiene busetaId y conductorId.
*/
function asignarBusetaAHijo() {
    const select = document.getElementById("selectHijoAsignar");

    if (!select) {
        mostrarNotificacion("No se encontró el selector de hijos.", "error");
        return;
    }

    const hijoId = Number(select.value);

    if (!hijoId) {
        mostrarNotificacion("Debes seleccionar un hijo.", "warning");
        return;
    }

    if (!rutaSeleccionadaId) {
        mostrarNotificacion("No se encontró la ruta de esta buseta.", "error");
        return;
    }

    const hijo = obtenerPorId(DB_KEYS.hijos, hijoId);

    if (!hijo) {
        mostrarNotificacion("No se encontró el hijo seleccionado.", "error");
        return;
    }

    const hijoActualizado = {
        ...hijo,
        rutaId: rutaSeleccionadaId
    };

    actualizarDato(DB_KEYS.hijos, hijoId, hijoActualizado);

    mostrarNotificacion("Buseta asignada correctamente.", "success");

    cerrarModalAsignarBuseta();
}