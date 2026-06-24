/* =======================================
NOTIFICACIONES - LITTLE RIDERS
Se usa en hijos, busetas, conductores, etc.
========================================= */

function mostrarNotificacion(mensaje, tipo = "info") {
    let contenedor = document.getElementById("notificaciones");

    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "notificaciones";
        contenedor.classList.add("notificaciones");
        document.body.appendChild(contenedor);
    }

    const notificacion = document.createElement("div");
    notificacion.classList.add("notificacion", tipo);

    let icono = "fa-circle-info";

    if (tipo === "success") {
        icono = "fa-circle-check";
    }

    if (tipo === "error") {
        icono = "fa-circle-xmark";
    }

    if (tipo === "warning") {
        icono = "fa-triangle-exclamation";
    }

    notificacion.innerHTML = `
        <i class="fa-solid ${icono}"></i>
        <span>${mensaje}</span>
    `;

    contenedor.appendChild(notificacion);

    setTimeout(function () {
        notificacion.classList.add("ocultar");
    }, 3200);

    setTimeout(function () {
        notificacion.remove();
    }, 3800);
}