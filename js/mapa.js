let mapa;
let marcadorBuseta;
let lineaRuta;
let lineaRecorrida;

let rutas = [];
let gps = [];
let hijos = [];
let padres = [];
let busetas = [];
let conductores = [];

let rutaActual;
let gpsActual;
let hijoActual;
let busetaActual;
let conductorActual;

let indiceActual = 0;
let intervaloMovimiento;

document.addEventListener("DOMContentLoaded", function () {
    cargarDatosMapa();
});

function cargarDatosMapa() {
    rutas = obtenerDatos(DB_KEYS.rutas);
    gps = obtenerDatos(DB_KEYS.gps);
    hijos = obtenerDatos(DB_KEYS.hijos);
    padres = obtenerDatos(DB_KEYS.padres);
    busetas = obtenerDatos(DB_KEYS.busetas);
    conductores = obtenerDatos(DB_KEYS.conductores);

    cargarHijosDelUsuario();
}

function cargarHijosDelUsuario() {
    const usuario = obtenerUsuarioActual();

    const padre = padres.find(function (item) {
        return item.usuarioId === usuario.id;
    });

    const select = document.getElementById("selectHijoMapa");

    select.innerHTML = "";

    const hijosUsuario = hijos.filter(function (hijo) {
        return hijo.padreId === padre.id && hijo.estado === "activo";
    });

    hijosUsuario.forEach(function (hijo) {
        const option = document.createElement("option");

        option.value = hijo.id;
        option.textContent = hijo.nombre;

        select.appendChild(option);
    });

    if (hijosUsuario.length > 0) {
        cargarRutaPorHijo(hijosUsuario[0].id);
    }

    select.addEventListener("change", function () {
        cargarRutaPorHijo(Number(this.value));
    });
}

function cargarRutaPorHijo(hijoId) {
    hijoActual = hijos.find(function (hijo) {
        return hijo.id === Number(hijoId);
    });

    rutaActual = rutas.find(function (ruta) {
        return ruta.id === hijoActual.rutaId;
    });

    gpsActual = gps.find(function (item) {
        return item.rutaId === rutaActual.id;
    });

    busetaActual = busetas.find(function (buseta) {
        return buseta.id === rutaActual.busetaId;
    });

    conductorActual = conductores.find(function (conductor) {
        return conductor.id === rutaActual.conductorId;
    });

    prepararEstadoGPS();

    indiceActual = gpsActual.indiceActual || 0;

    cargarInformacionRuta();
    crearMapa();

    if (intervaloMovimiento) {
        clearInterval(intervaloMovimiento);
    }

    iniciarMovimientoBuseta();
}

function prepararEstadoGPS() {
    if (!hijoActual.ubicacionActual) {
        hijoActual.ubicacionActual = "casa";
    }

    if (!gpsActual.sentido) {
        gpsActual.sentido = "ida";
    }

    if (gpsActual.indiceActual === undefined) {
        gpsActual.indiceActual = 0;
    }

    const horaActual = obtenerMinutosActuales();
    const horaRegreso = convertirHoraAMinutos(rutaActual.horaRegreso);

    if (
        hijoActual.ubicacionActual === "escuela" &&
        gpsActual.estado !== "En la escuela"
    ) {
        gpsActual.sentido = "regreso";

        if (gpsActual.indiceActual === undefined || gpsActual.indiceActual === null) {
            gpsActual.indiceActual = 0;
        }

        gpsActual.estado = "Regresando a casa";
    }

    if (
        hijoActual.ubicacionActual === "casa" &&
        gpsActual.estado !== "En camino a la escuela" &&
        gpsActual.estado !== "En la escuela"
    ) {
        gpsActual.sentido = "ida";

        if (gpsActual.indiceActual === undefined || gpsActual.indiceActual === null) {
            gpsActual.indiceActual = 0;
        }

        gpsActual.estado = "En camino a la escuela";
    }

    if (
        gpsActual.estado === "En la escuela" &&
        horaActual >= horaRegreso
    ) {
        gpsActual.sentido = "regreso";
        gpsActual.indiceActual = 0;
        gpsActual.estado = "Regresando a casa";
    }

    guardarEstadoGPS();
}

function cargarInformacionRuta() {
    document.getElementById("nombreRuta").textContent = rutaActual.nombre;

    if (gpsActual.sentido === "ida") {
        document.getElementById("descripcionRuta").textContent = rutaActual.descripcion;
    } else {
        document.getElementById("descripcionRuta").textContent = "Ruta de regreso hacia casa";
    }

    document.getElementById("estadoBuseta").textContent = gpsActual.estado;
    document.getElementById("ultimaActualizacion").textContent = "Actualizado hace unos segundos";

    document.getElementById("nombreBuseta").textContent = busetaActual.nombre;
    document.getElementById("placaBuseta").textContent = busetaActual.placa;

    document.getElementById("nombreConductor").textContent = conductorActual.nombre;
    document.getElementById("telefonoConductor").textContent = conductorActual.telefono;
    document.getElementById("fotoConductor").src = conductorActual.imagen;

    document.getElementById("velocidadBuseta").textContent = gpsActual.velocidad + " km/h";

    actualizarPanelRuta();
}

function obtenerRecorridoActual() {
    if (gpsActual.sentido === "regreso") {
        return gpsActual.recorrido.slice().reverse();
    }

    return gpsActual.recorrido;
}

function crearMapa() {
    if (mapa) {
        mapa.remove();
    }

    const recorridoOriginal = gpsActual.recorrido.map(function (punto) {
        return [punto.lat, punto.lng];
    });

    const recorrido = obtenerRecorridoActual().map(function (punto) {
        return [punto.lat, punto.lng];
    });

    const inicio = recorrido[indiceActual];

    mapa = L.map("mapaLeaflet", {
        zoomControl: true
    }).setView(inicio, 16);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap © CARTO"
    }).addTo(mapa);

    lineaRuta = L.polyline(recorridoOriginal, {
        color: "#F59E0B",
        weight: 7,
        opacity: .95,
        lineCap: "round",
        lineJoin: "round"
    }).addTo(mapa);

    const recorridoInicial = recorrido.slice(0, indiceActual + 1);

    lineaRecorrida = L.polyline(recorridoInicial, {
        color: "#7AA83B",
        weight: 7,
        opacity: .95,
        lineCap: "round",
        lineJoin: "round"
    }).addTo(mapa);

    crearMarcadoresParadas();

    const iconoBuseta = L.divIcon({
        html: `
            <div class="buseta-marker">
                <i class="fa-solid fa-bus-simple"></i>
            </div>
        `,
        className: "icono-buseta",
        iconSize: [60, 60],
        iconAnchor: [30, 30]
    });

    marcadorBuseta = L.marker(inicio, {
        icon: iconoBuseta
    }).addTo(mapa);

    mapa.fitBounds(lineaRuta.getBounds(), {
        padding: [90, 90]
    });

    setTimeout(function () {
        mapa.invalidateSize();
    }, 300);

    document.getElementById("btnCentrarMapa").onclick = function () {
        mapa.panTo(marcadorBuseta.getLatLng(), {
            animate: true
        });
    };
}

function crearMarcadoresParadas() {
    rutaActual.paradas.forEach(function (parada, index) {
        const esDestino = index === rutaActual.paradas.length - 1;

        const html = esDestino
            ? `
                <div class="destino-marker">
                    <i class="fa-solid fa-school"></i>
                </div>
            `
            : `
                <div class="parada-numero">
                    ${index + 1}
                </div>
            `;

        const icono = L.divIcon({
            html: html,
            className: "marker-limpio",
            iconSize: esDestino ? [72, 72] : [44, 44],
            iconAnchor: esDestino ? [36, 36] : [22, 22]
        });

        let lat = parada.lat;
        let lng = parada.lng;

        if (!esDestino && index === 0) {
            lat += 0.00022;
            lng -= 0.00008;
        }

        if (!esDestino && index === 1) {
            lat -= 0.00008;
            lng += 0.00003;
        }

        const marker = L.marker([lat, lng], {
            icon: icono
        }).addTo(mapa);

        if (!esDestino) {
            marker.bindTooltip(
                `<strong>${parada.nombre}</strong><br>${parada.hora}`,
                {
                    direction: "top",
                    offset: [0, -18],
                    opacity: 1,
                    className: "tooltip-parada"
                }
            );
        }
    });
}

function iniciarMovimientoBuseta() {
    intervaloMovimiento = setInterval(function () {
        const recorrido = obtenerRecorridoActual();

        if (gpsActual.estado === "En la escuela") {
            const horaActual = obtenerMinutosActuales();
            const horaRegreso = convertirHoraAMinutos(rutaActual.horaRegreso);

            if (horaActual >= horaRegreso) {
                gpsActual.sentido = "regreso";
                gpsActual.indiceActual = 0;
                gpsActual.estado = "Regresando a casa";
                indiceActual = 0;
                guardarEstadoGPS();
            } else {
                clearInterval(intervaloMovimiento);
                return;
            }
        }

        if (gpsActual.estado === "Llegó a casa") {
            clearInterval(intervaloMovimiento);
            return;
        }

        if (indiceActual >= recorrido.length - 1) {
            if (gpsActual.sentido === "ida") {
                gpsActual.estado = "En la escuela";
                gpsActual.indiceActual = recorrido.length - 1;

                actualizarUbicacionHijo("escuela", "En la escuela");
            } else {
                gpsActual.estado = "Llegó a casa";
                gpsActual.indiceActual = recorrido.length - 1;

                actualizarUbicacionHijo("casa", "En casa");
            }

            guardarEstadoGPS();
            cargarInformacionRuta();
            clearInterval(intervaloMovimiento);
            return;
        }

        indiceActual++;

        gpsActual.indiceActual = indiceActual;

        const nuevaPosicion = [
            recorrido[indiceActual].lat,
            recorrido[indiceActual].lng
        ];

        gpsActual.lat = nuevaPosicion[0];
        gpsActual.lng = nuevaPosicion[1];

        marcadorBuseta.setLatLng(nuevaPosicion);

        mapa.panTo(nuevaPosicion, {
            animate: true,
            duration: 1
        });

        const recorridoActual = recorrido
            .slice(0, indiceActual + 1)
            .map(function (punto) {
                return [punto.lat, punto.lng];
            });

        lineaRecorrida.setLatLngs(recorridoActual);

        guardarEstadoGPS();
        actualizarPanelRuta();

    }, 3500);
}

function actualizarPanelRuta() {
    const parada = obtenerProximaParada();

    document.getElementById("proximaParada").textContent = parada.nombre;
    document.getElementById("horaParada").textContent = "Llegada aprox. " + parada.hora;

    document.getElementById("tiempoEstimado").textContent =
        calcularTiempoEstimado() + " min";
}

function obtenerProximaParada() {
    if (gpsActual.estado === "En la escuela") {
        return {
            nombre: "En la escuela",
            hora: rutaActual.horaLlegada
        };
    }

    if (gpsActual.estado === "Llegó a casa") {
        return {
            nombre: "En casa",
            hora: rutaActual.horaRegreso
        };
    }

    const paradas = gpsActual.sentido === "regreso"
        ? rutaActual.paradas.slice().reverse()
        : rutaActual.paradas;

    const total = obtenerRecorridoActual().length;
    const porcentaje = indiceActual / total;

    if (porcentaje < .45) {
        return paradas[1] || paradas[0];
    }

    return paradas[paradas.length - 1];
}

function calcularTiempoEstimado() {
    if (gpsActual.estado === "En la escuela" || gpsActual.estado === "Llegó a casa") {
        return 0;
    }

    const total = obtenerRecorridoActual().length;
    const restante = total - indiceActual;

    return Math.max(1, Math.ceil(restante * 0.4));
}

function guardarEstadoGPS() {
    const gpsActualizado = gps.map(function (item) {
        if (item.id === gpsActual.id) {
            return gpsActual;
        }

        return item;
    });

    gps = gpsActualizado;

    guardarDatos(DB_KEYS.gps, gps);
}

function convertirHoraAMinutos(hora) {
    const partes = hora.split(":");

    const horas = Number(partes[0]);
    const minutos = Number(partes[1]);

    return horas * 60 + minutos;
}

function obtenerMinutosActuales() {
    const fecha = new Date();

    return fecha.getHours() * 60 + fecha.getMinutes();
}

function actualizarUbicacionHijo(nuevaUbicacion, nuevoEstadoEntrega) {
    hijos = hijos.map(function (hijo) {
        if (hijo.id === hijoActual.id) {
            hijo.ubicacionActual = nuevaUbicacion;
            hijo.estadoEntrega = nuevoEstadoEntrega;

            hijoActual.ubicacionActual = nuevaUbicacion;
            hijoActual.estadoEntrega = nuevoEstadoEntrega;
        }

        return hijo;
    });

    guardarDatos(DB_KEYS.hijos, hijos);
}