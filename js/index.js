const formulario = document.getElementById("contactForm");

if (formulario) {
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const mensaje = document.getElementById("mensaje").value.trim();

        limpiarErroresContacto();

        let formularioValido = true;

        if (nombre.length < 3) {
            mostrarErrorContacto("nombre", "El nombre debe tener al menos 3 letras.");
            formularioValido = false;
        } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
            mostrarErrorContacto("nombre", "El nombre solo debe contener letras.");
            formularioValido = false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            mostrarErrorContacto("correo", "Ingresa un correo válido.");
            formularioValido = false;
        }

        if (!/^[0-9]{8}$/.test(telefono)) {
            mostrarErrorContacto("telefono", "El teléfono debe tener 8 números.");
            formularioValido = false;
        }

        if (mensaje.length < 10) {
            mostrarErrorContacto("mensaje", "El mensaje debe tener al menos 10 caracteres.");
            formularioValido = false;
        }

        if (!formularioValido) {
            return;
        }

        const numeroWhatsApp = "50684297000";

        const texto = `Hola, soy ${nombre}.

Correo: ${correo}
Teléfono: ${telefono}

Mensaje:
${mensaje}`;

        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;

        window.open(url, "_blank");
        formulario.reset();
    });
}

function mostrarErrorContacto(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);

    campo.classList.add("input-error");

    const error = document.createElement("small");
    error.classList.add("mensaje-error");
    error.textContent = mensaje;

    campo.parentElement.appendChild(error);
}

function limpiarErroresContacto() {
    const errores = document.querySelectorAll(".mensaje-error");
    const campos = document.querySelectorAll(".input-error");

    errores.forEach(function (error) {
        error.remove();
    });

    campos.forEach(function (campo) {
        campo.classList.remove("input-error");
    });
}


/* =======================================
CARGAR BUSETAS DESDE JSON
========================================= */

const vehiclesTrack = document.getElementById("vehiclesTrack");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

let intervaloBusetas;

/* Funciona con localStorage */
if (vehiclesTrack) {
    document.addEventListener("baseDatosLista", function () {
        cargarBusetas();
    });
}

/* Funciona con localStorage */
function cargarBusetas() {
    const busetas = obtenerDatos(DB_KEYS.busetas); /* consulta a localStorage */

    mostrarBusetas(busetas);
    activarCarruselBusetas();
}

function mostrarBusetas(busetas) {
    vehiclesTrack.innerHTML = "";

    busetas.forEach(function (buseta) {

        const estadoClase = buseta.estado.toLowerCase().includes("mantenimiento")
            ? "mantenimiento"
            : "";

        vehiclesTrack.innerHTML += `
            <div class="vehicle-card">

                <div class="vehicle-image">
                    <img src="${buseta.imagen}" alt="${buseta.nombre}">
                </div>

                <h3>${buseta.nombre}</h3>

                <div class="vehicle-info">
                    <p><strong>Capacidad:</strong> ${buseta.capacidad} niños</p>
                    <p><strong>Año:</strong> ${buseta.modelo}</p>
                    <p><strong>Placa:</strong> ${buseta.placa}</p>
                    <p><strong>Color:</strong> ${buseta.color}</p>
                    <p><strong>Ruta:</strong> ${buseta.ruta}</p>
                </div>

                <div class="vehicle-bottom">
                    <span class="vehicle-status ${estadoClase}">
                        ${buseta.estado}
                    </span>

                    <span class="vehicle-rating">
                        <i class="fa-solid fa-star"></i>
                        ${buseta.calificacion}
                    </span>
                </div>

            </div>
        `;
    });
}

let carruselBusetasActivo = false;


function activarCarruselBusetas() {

    if (carruselBusetasActivo) {
        return;
    }

    carruselBusetasActivo = true;

    const desplazamiento = 360;

    btnNext.addEventListener("click", function () {
        vehiclesTrack.scrollLeft += desplazamiento;
        reiniciarAutoMovimiento();
    });

    btnPrev.addEventListener("click", function () {
        vehiclesTrack.scrollLeft -= desplazamiento;
        reiniciarAutoMovimiento();
    });

    iniciarAutoMovimiento();
}

function iniciarAutoMovimiento() {
    intervaloBusetas = setInterval(function () {

        const llegoAlFinal =
            vehiclesTrack.scrollLeft + vehiclesTrack.clientWidth >= vehiclesTrack.scrollWidth - 5;

        if (llegoAlFinal) {
            vehiclesTrack.scrollLeft = 0;
        } else {
            vehiclesTrack.scrollLeft += 360;
        }

    }, 3500);
}

function reiniciarAutoMovimiento() {
    clearInterval(intervaloBusetas);
    iniciarAutoMovimiento();
}



/* =======================================
CARGAR CONDUCTORES DESDE JSON
========================================= */

const driversTrack = document.getElementById("driversTrack");
const btnDriverPrev = document.getElementById("btnDriverPrev");
const btnDriverNext = document.getElementById("btnDriverNext");

let intervaloConductores;

/* Funciona con localStorage */
if (driversTrack) {
    document.addEventListener("baseDatosLista", function () {  /* consulta a localStorage */
        cargarConductores();
    });
}

/* Funciona con localStorage */
function cargarConductores() {
    const conductores = obtenerDatos(DB_KEYS.conductores);  /* consulta a localStorage */
    const busetas = obtenerDatos(DB_KEYS.busetas);

    mostrarConductores(conductores, busetas);
    activarCarruselConductores();
}

function mostrarConductores(conductores, busetas) {
    driversTrack.innerHTML = "";

    conductores.forEach(function (conductor) {

        const buseta = busetas.find(function (item) {
            return item.id === conductor.busetaId;
        });

        const estadoClase = conductor.estado.toLowerCase().includes("ruta")
            ? "ruta"
            : "";

        const nombreBuseta = buseta ? buseta.nombre : "Sin asignar";
        const placaBuseta = buseta ? buseta.placa : "N/A";

        driversTrack.innerHTML += `
            <div class="driver-card">

                <div class="driver-top">

                    <div class="driver-image">
                        <img src="${conductor.imagen}" alt="${conductor.nombre}">
                    </div>

                    <div class="driver-name">
                        <h3>${conductor.nombre}</h3>

                        <span class="driver-rating">
                            <i class="fa-solid fa-star"></i>
                            ${conductor.calificacion}
                        </span>
                    </div>

                </div>

                <div class="driver-info">
                    <p><strong>Experiencia:</strong> ${conductor.experiencia} años</p>
                    <p><strong>Licencia:</strong> ${conductor.licencia}</p>
                    <p><strong>Teléfono:</strong> ${conductor.telefono}</p>
                    <p><strong>Buseta:</strong> ${nombreBuseta}</p>
                    <p><strong>Placa:</strong> ${placaBuseta}</p>
                </div>

                <div class="driver-bottom">
                    <span class="driver-status ${estadoClase}">
                        ${conductor.estado}
                    </span>

                    <span class="driver-bus">
                        ${nombreBuseta}
                    </span>
                </div>

            </div>
        `;
    });
}

let carruselConductoresActivo = false;

function activarCarruselConductores() {
    if (carruselConductoresActivo) {
        return;
    }

    carruselConductoresActivo = true;

    const desplazamiento = 370;

    if (btnDriverNext) {
        btnDriverNext.addEventListener("click", function () {
            driversTrack.scrollLeft += desplazamiento;
            reiniciarAutoConductores();
        });
    }

    if (btnDriverPrev) {
        btnDriverPrev.addEventListener("click", function () {
            driversTrack.scrollLeft -= desplazamiento;
            reiniciarAutoConductores();
        });
    }

    iniciarAutoConductores();
}

function iniciarAutoConductores() {
    intervaloConductores = setInterval(function () {

        const llegoAlFinal =
            driversTrack.scrollLeft + driversTrack.clientWidth >= driversTrack.scrollWidth - 5;

        if (llegoAlFinal) {
            driversTrack.scrollLeft = 0;
        } else {
            driversTrack.scrollLeft += 370;
        }

    }, 4000);
}

function reiniciarAutoConductores() {
    clearInterval(intervaloConductores);
    iniciarAutoConductores();
}



/* =======================================
HEADER ANIMADO AL CARGAR Y AL HACER SCROLL
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const header = document.querySelector("header");

    if (!header) {
        return;
    }

    let ultimaPosicionScroll = window.scrollY;

    setTimeout(function () {
        header.classList.add("header-visible");
    }, 200);

    window.addEventListener("scroll", function () {

        const posicionActual = window.scrollY;

        if (posicionActual <= 80) {
            header.classList.remove("header-hidden");
            header.classList.add("header-visible");
            ultimaPosicionScroll = posicionActual;
            return;
        }

        if (posicionActual > ultimaPosicionScroll) {
            header.classList.remove("header-visible");
            header.classList.add("header-hidden");
        } else {
            header.classList.remove("header-hidden");
            header.classList.add("header-visible");
        }

        ultimaPosicionScroll = posicionActual;
    });

});