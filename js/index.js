const formulario = document.getElementById("contactForm");

if (formulario) {
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nombre = document.getElementById("nombre").value;
        const correo = document.getElementById("correo").value;
        const telefono = document.getElementById("telefono").value;
        const mensaje = document.getElementById("mensaje").value;

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



/* =======================================
CARGAR BUSETAS DESDE JSON
========================================= */

const vehiclesTrack = document.getElementById("vehiclesTrack");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

let intervaloBusetas;

if (vehiclesTrack) {
    cargarBusetas();
}

function cargarBusetas() {
    fetch("data/busetas.json")
        .then(function(respuesta) {
            return respuesta.json();
        })
        .then(function(busetas) {
            mostrarBusetas(busetas);
            activarCarruselBusetas();
        })
        .catch(function(error) {
            console.log("Error al cargar las busetas:", error);
        });
}

function mostrarBusetas(busetas) {
    vehiclesTrack.innerHTML = "";

    busetas.forEach(function(buseta) {

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

function activarCarruselBusetas() {
    const desplazamiento = 360;

    btnNext.addEventListener("click", function() {
        vehiclesTrack.scrollLeft += desplazamiento;
        reiniciarAutoMovimiento();
    });

    btnPrev.addEventListener("click", function() {
        vehiclesTrack.scrollLeft -= desplazamiento;
        reiniciarAutoMovimiento();
    });

    iniciarAutoMovimiento();
}

function iniciarAutoMovimiento() {
    intervaloBusetas = setInterval(function() {

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

if (driversTrack) {
    cargarConductores();
}

function cargarConductores() {
    fetch("data/conductores.json")
        .then(function(respuesta) {
            return respuesta.json();
        })
        .then(function(conductores) {
            mostrarConductores(conductores);
            activarCarruselConductores();
        })
        .catch(function(error) {
            console.log("Error al cargar los conductores:", error);
        });
}

function mostrarConductores(conductores) {
    driversTrack.innerHTML = "";

    conductores.forEach(function(conductor) {

        const estadoClase = conductor.estado.toLowerCase().includes("ruta")
            ? "ruta"
            : "";

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
                    <p><strong>Buseta:</strong> ${conductor.busetaAsignada}</p>
                    <p><strong>Placa:</strong> ${conductor.placaAsignada}</p>
                </div>

                <div class="driver-bottom">
                    <span class="driver-status ${estadoClase}">
                        ${conductor.estado}
                    </span>

                    <span class="driver-bus">
                        ${conductor.busetaAsignada}
                    </span>
                </div>

            </div>
        `;
    });
}

function activarCarruselConductores() {
    const desplazamiento = 370;

    if (btnDriverNext) {
        btnDriverNext.addEventListener("click", function() {
            driversTrack.scrollLeft += desplazamiento;
            reiniciarAutoConductores();
        });
    }

    if (btnDriverPrev) {
        btnDriverPrev.addEventListener("click", function() {
            driversTrack.scrollLeft -= desplazamiento;
            reiniciarAutoConductores();
        });
    }

    iniciarAutoConductores();
}

function iniciarAutoConductores() {
    intervaloConductores = setInterval(function() {

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