/* =======================================
ALERTAS - LITTLE RIDERS
Muestra alertas del usuario actual y permite
filtrarlas por llegada, demora, incidente,
comunicado o no leídas.
========================================= */

let filtroActual = "todas";


document.addEventListener("baseDatosLista", function () {
    protegerPagina(["padre", "admin"]);
    cargarAlertas();
    activarFiltrosAlertas();
});


function cargarAlertas() {
    const contenedor = document.getElementById("alertasList");

    if (!contenedor) {
        return;
    }

    const usuario = obtenerUsuarioActual();

    if (!usuario) {
        return;
    }

    const alertas = obtenerDatos(DB_KEYS.alertas);
    const rutas = obtenerDatos(DB_KEYS.rutas);
    const hijos = obtenerDatos(DB_KEYS.hijos);

    let alertasUsuario = alertas.filter(function (alerta) {
        return alerta.usuarioId === usuario.id;
    });

    if (filtroActual === "no-leidas") {
        alertasUsuario = alertasUsuario.filter(function (alerta) {
            return alerta.leida === false;
        });
    } else if (filtroActual !== "todas") {
        alertasUsuario = alertasUsuario.filter(function (alerta) {
            return alerta.tipo === filtroActual;
        });
    }

    alertasUsuario.sort(function (a, b) {
        return new Date(b.fecha.replace(" ", "T")) - new Date(a.fecha.replace(" ", "T"));
    });

    if (alertasUsuario.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-alertas">
                <i class="fa-solid fa-bell-slash"></i>
                <h3>No hay alertas disponibles</h3>
                <p>No encontramos alertas para el filtro seleccionado.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = "";

    alertasUsuario.forEach(function (alerta) {
        const icono = obtenerIconoAlerta(alerta.tipo);
        const fechaFormateada = formatearFechaAlerta(alerta.fecha);

        const ruta = rutas.find(function (ruta) {
            return ruta.id === alerta.rutaId;
        });

        const hijo = hijos.find(function (hijo) {
            return hijo.id === alerta.hijoId;
        });

        const nombreRuta = ruta ? ruta.nombre : "General";
        const nombreHijo = hijo ? hijo.nombre : "";

        const claseLeida = alerta.leida ? "leida" : "no-leida";
        const textoPrioridad = alerta.prioridad === "alta" ? "Alta prioridad" : "Normal";

        contenedor.innerHTML += `
            <article class="alerta-card ${claseLeida}" data-id="${alerta.id}">

                <div class="alerta-icono ${alerta.tipo}">
                    <i class="fa-solid ${icono}"></i>
                </div>

                <div class="alerta-info">
                    <div class="alerta-title-row">
                        <h3>${alerta.titulo}</h3>

                        ${alerta.leida
                ? `<span class="alerta-leida">Leída</span>`
                : `<span class="alerta-nueva">Nueva</span>`
            }
                    </div>

                    <p>${alerta.mensaje}</p>

                    ${nombreHijo
                ? `<small class="alerta-hijo">Estudiante: ${nombreHijo}</small>`
                : ""
            }
                </div>

                <div class="alerta-extra">
                    <span class="alerta-hora">${fechaFormateada}</span>
                    <span class="alerta-ruta">${nombreRuta}</span>
                    <span class="alerta-prioridad ${alerta.prioridad}">
                    ${textoPrioridad}
                    </span>

                    <div class="alerta-menu-wrapper">
                        <button class="btn-menu-alerta" type="button" data-id="${alerta.id}">
                            <i class="fa-solid fa-ellipsis"></i>
                        </button>

                        <div class="menu-alerta">
                            <button type="button" class="opcion-marcar-leida" data-id="${alerta.id}">
                                <i class="fa-solid fa-check"></i>
                                Marcar como leída
                            </button>

                            <button type="button" class="opcion-eliminar-alerta" data-id="${alerta.id}">
                                <i class="fa-solid fa-trash"></i>
                                Eliminar notificación
                            </button>
                        </div>
                    </div>
                </div>

            </article>
        `;
    });

    activarMenusAlertas();
}


function activarFiltrosAlertas() {
    const botones = document.querySelectorAll(".alerta-filtro");

    botones.forEach(function (boton) {
        boton.addEventListener("click", function () {
            botones.forEach(function (item) {
                item.classList.remove("active");
            });

            boton.classList.add("active");

            filtroActual = boton.dataset.filtro;

            cargarAlertas();
        });
    });
}

/*
Activa el menú de tres puntos de cada alerta.
Desde aquí se puede marcar como leída o eliminar.
*/
function activarMenusAlertas() {
    const botonesMenu = document.querySelectorAll(".btn-menu-alerta");
    const botonesMarcar = document.querySelectorAll(".opcion-marcar-leida");
    const botonesEliminar = document.querySelectorAll(".opcion-eliminar-alerta");

    botonesMenu.forEach(function (boton) {
        boton.addEventListener("click", function (e) {
            e.stopPropagation();

            const tarjeta = boton.closest(".alerta-card");
            const wrapper = boton.closest(".alerta-menu-wrapper");
            const menu = wrapper.querySelector(".menu-alerta");

            cerrarMenusAlertas(menu);

            menu.classList.toggle("active");

            if (tarjeta) {
                tarjeta.classList.toggle("menu-abierto", menu.classList.contains("active"));
            }
        });
    });

    botonesMarcar.forEach(function (boton) {
        boton.addEventListener("click", function (e) {
            e.stopPropagation();

            const alertaId = Number(boton.dataset.id);

            marcarAlertaComoLeida(alertaId);
        });
    });

    botonesEliminar.forEach(function (boton) {
        boton.addEventListener("click", function (e) {
            e.stopPropagation();

            const alertaId = Number(boton.dataset.id);

            eliminarAlerta(alertaId);
        });
    });
}

/*
Cierra todos los menús de alerta, excepto uno opcional.
*/
function cerrarMenusAlertas(menuActual) {
    const menus = document.querySelectorAll(".menu-alerta");
    const tarjetas = document.querySelectorAll(".alerta-card");

    menus.forEach(function (menu) {
        if (menu !== menuActual) {
            menu.classList.remove("active");
        }
    });

    tarjetas.forEach(function (tarjeta) {
        const menu = tarjeta.querySelector(".menu-alerta");

        if (!menu || !menu.classList.contains("active")) {
            tarjeta.classList.remove("menu-abierto");
        }
    });
}

/*
Elimina definitivamente una alerta del localStorage.
*/
function eliminarAlerta(alertaId) {
    const alertas = obtenerDatos(DB_KEYS.alertas);

    const alertaExiste = alertas.some(function (alerta) {
        return alerta.id === alertaId;
    });

    if (!alertaExiste) {
        mostrarNotificacion("No se encontró la alerta.", "error");
        return;
    }

    const alertasActualizadas = alertas.filter(function (alerta) {
        return alerta.id !== alertaId;
    });

    localStorage.setItem(
        DB_KEYS.alertas,
        JSON.stringify(alertasActualizadas)
    );

    mostrarNotificacion("Notificación eliminada.", "success");

    cargarAlertas();
}


/*
Cierra los menús cuando se hace click fuera.
*/
document.addEventListener("click", function () {
    cerrarMenusAlertas();
});

/*
Marca una alerta como leída en localStorage.
*/


function marcarAlertaComoLeida(alertaId) {
    const alertas = obtenerDatos(DB_KEYS.alertas);

    const alerta = alertas.find(function (item) {
        return item.id === alertaId;
    });

    if (!alerta) {
        mostrarNotificacion("No se encontró la alerta.", "error");
        return;
    }

    if (alerta.leida) {
        mostrarNotificacion("Esta alerta ya estaba marcada como leída.", "info");
        return;
    }

    const alertaActualizada = {
        ...alerta,
        leida: true
    };

    actualizarDato(DB_KEYS.alertas, alertaId, alertaActualizada);

    mostrarNotificacion("Alerta marcada como leída.", "success");

    cargarAlertas();
}


function obtenerIconoAlerta(tipo) {
    if (tipo === "llegada") {
        return "fa-check";
    }

    if (tipo === "demora") {
        return "fa-clock";
    }

    if (tipo === "incidente") {
        return "fa-triangle-exclamation";
    }

    if (tipo === "comunicado") {
        return "fa-message";
    }

    return "fa-bell";
}


function formatearFechaAlerta(fecha) {
    if (!fecha) {
        return "Fecha no registrada";
    }

    const fechaCompatible = fecha.replace(" ", "T");
    const fechaObjeto = new Date(fechaCompatible);

    if (isNaN(fechaObjeto.getTime())) {
        return fecha;
    }

    return fechaObjeto.toLocaleString("es-CR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}