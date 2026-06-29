/* =======================================
VARIABLES GLOBALES DEL MAPA
========================================= */
// Mantienen el estado del mapa, la ruta activa, el hijo seleccionado y el recorrido simulado.
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

/* =======================================
INICIALIZACIÓN DEL MÓDULO
========================================= */
// Se ejecuta cuando la página termina de cargar y dispara la carga inicial del mapa.
document.addEventListener("DOMContentLoaded", function () {
    cargarDatosMapa();
});

/* Carga en memoria todas las colecciones necesarias para construir la vista del mapa.
    No recibe parámetros y utiliza los datos guardados en localStorage.
*/
function cargarDatosMapa() {
    rutas = obtenerDatos(DB_KEYS.rutas);
    gps = obtenerDatos(DB_KEYS.gps);
    hijos = obtenerDatos(DB_KEYS.hijos);
    padres = obtenerDatos(DB_KEYS.padres);
    busetas = obtenerDatos(DB_KEYS.busetas);
    conductores = obtenerDatos(DB_KEYS.conductores);

    cargarHijosDelUsuario();
}

/* Construye la lista desplegable de hijos del padre autenticado.
    Recorre los hijos activos y genera un botón por cada uno para seleccionar la ruta asociada.
*/
function cargarHijosDelUsuario() {
    const usuario = obtenerUsuarioActual();

    const padre = padres.find(function (item) {
        return item.usuarioId === usuario.id;
    });

    const contenedorSelect = document.getElementById("customSelectHijo");
    const btnSelect = document.getElementById("btnSelectHijo");
    const textoSeleccionado = document.getElementById("textoHijoSeleccionado");
    const opcionesHijos = document.getElementById("opcionesHijos");

    opcionesHijos.innerHTML = "";

    const hijosUsuario = hijos.filter(function (hijo) {
        return hijo.padreId === padre.id && hijo.estado === "activo";
    });

    hijosUsuario.forEach(function (hijo, index) {
        const boton = document.createElement("button");

        boton.type = "button";
        boton.classList.add("custom-option-hijo");
        boton.dataset.id = hijo.id;

        boton.innerHTML = `
            <span class="custom-option-avatar">
                <i class="fa-solid fa-child"></i>
            </span>

            <span>${hijo.nombre}</span>

            <i class="fa-solid fa-check custom-option-check"></i>
        `;

        boton.addEventListener("click", function () {
            seleccionarHijoDropdown(hijo.id, hijo.nombre);
        });

        opcionesHijos.appendChild(boton);

        if (index === 0) {
            seleccionarHijoDropdown(hijo.id, hijo.nombre);
        }
    });

    btnSelect.addEventListener("click", function () {
        contenedorSelect.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
        if (!contenedorSelect.contains(e.target)) {
            contenedorSelect.classList.remove("active");
        }
    });
}

/* Marca un hijo como seleccionado en el dropdown y dispara la carga de su ruta.
    Parámetros:
    - hijoId: identificador del hijo elegido.
    - nombreHijo: texto que se mostrará en el selector visual.
*/
function seleccionarHijoDropdown(hijoId, nombreHijo) {
    const contenedorSelect = document.getElementById("customSelectHijo");
    const textoSeleccionado = document.getElementById("textoHijoSeleccionado");
    const opciones = document.querySelectorAll(".custom-option-hijo");

    textoSeleccionado.textContent = nombreHijo;

    opciones.forEach(function (opcion) {
        opcion.classList.remove("active");

        if (Number(opcion.dataset.id) === Number(hijoId)) {
            opcion.classList.add("active");
        }
    });

    contenedorSelect.classList.remove("active");

    cargarRutaPorHijo(Number(hijoId));
}

/* Carga la ruta completa del hijo seleccionado, incluyendo su GPS, buseta y conductor.
    Parámetros:
    - hijoId: identificador del hijo cuyo recorrido se desea mostrar.
*/
async function cargarRutaPorHijo(hijoId) {
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
    await crearMapa();

    if (intervaloMovimiento) {
        clearInterval(intervaloMovimiento);
    }

    iniciarMovimientoBuseta();
}

/* Ajusta el estado de la simulación según la ubicación del hijo y la hora del día.
    Evita inconsistencias al definir si la ruta va de ida o regreso.
*/
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

/* Actualiza los detalles visibles del panel lateral con los datos de la ruta activa.
    Incluye nombre de ruta, estado del recorrido, datos de la buseta y del conductor.
*/
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

/* Devuelve el recorrido que se debe mostrar según el sentido actual de la ruta.
    Si el viaje va de regreso, invierte el orden de los puntos del recorrido.
*/
function obtenerRecorridoActual() {
    if (gpsActual.sentido === "regreso") {
        return gpsActual.recorrido.slice().reverse();
    }

    return gpsActual.recorrido;
}

/* Genera y renderiza el mapa interactivo con la ruta, las paradas y la buseta animada.
    Utiliza Leaflet para mostrar la trayectoria del recorrido.
*/
async function crearMapa() {
    if (mapa) {
        mapa.remove();
    }

    await generarRecorridoPorCalles();

    const recorridoOriginal = gpsActual.recorrido.map(function (punto) {
        return [punto.lat, punto.lng];
    });

    const recorrido = obtenerRecorridoActual().map(function (punto) {
        return [punto.lat, punto.lng];
    });

    const inicio = recorrido[indiceActual];

    mapa = L.map("mapaLeaflet", {
        zoomControl: false
    }).setView(inicio, 16);

    L.control.zoom({
        position: "bottomright"
    }).addTo(mapa);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap © CARTO"
    }).addTo(mapa);

    L.polyline(recorrido, {
        color: "white",
        weight: 13,
        opacity: .95,
        lineCap: "round",
        lineJoin: "round"
    }).addTo(mapa);

    lineaRuta = L.polyline(recorrido, {
        color: "#F59E0B",
        weight: 7,
        opacity: .98,
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

/* Añade al mapa los marcadores visuales de cada parada de la ruta.
    Cada uno muestra un icono distinto según si es una parada normal o el destino final.
*/
function crearMarcadoresParadas() {
    rutaActual.paradas.forEach(function (parada, index) {
        const esDestino = index === rutaActual.paradas.length - 1;
        const numero = index + 1;

        const html = esDestino
            ? `
                <div class="destino-marker">
                    <i class="fa-solid fa-school"></i>
                </div>
            `
            : `
                <div class="parada-numero">
                    ${numero}
                </div>
            `;

        const icono = L.divIcon({
            html: html,
            className: "marker-limpio",
            iconSize: esDestino ? [72, 72] : [44, 44],
            iconAnchor: esDestino ? [36, 36] : [22, 22]
        });

        const marker = L.marker([parada.lat, parada.lng], {
            icon: icono
        }).addTo(mapa);

        const textoEstado = esDestino
            ? "Llegada estimada"
            : gpsActual.sentido === "regreso"
                ? "Dejando estudiantes"
                : "Recogiendo estudiantes";

        marker.bindTooltip(
            `
                <div class="tooltip-parada-card">
                    <strong>${parada.nombre}</strong>
                    <span>${textoEstado}</span>
                    <p>
                        <i class="fa-regular fa-clock"></i>
                        ${obtenerHoraParada(parada, index)}
                    </p>
                </div>
            `,
            {
                direction: "top",
                offset: [0, -18],
                opacity: 1,
                className: "tooltip-parada"
            }
        );
    });
}

/* Inicia la simulación del recorrido de la buseta.
    Cada intervalo avanza a la siguiente posición del recorrido y actualiza el estado del viaje.
*/
function iniciarMovimientoBuseta() {
    intervaloMovimiento = setInterval(function () {
        const recorrido = obtenerRecorridoActual();

        if (gpsActual.sentido === "ida" && indiceActual === 0) {
            crearAlertaUnaVez(
                "salio-casa-" + hijoActual.id,
                "Salida de casa",
                hijoActual.nombre + " salió de casa y va camino a la escuela.",
                "comunicado",
                "normal"
            );
        }

        if (gpsActual.pausaHasta && Date.now() < gpsActual.pausaHasta) {
            return;
        }

        if (gpsActual.pausaHasta && Date.now() >= gpsActual.pausaHasta) {
            gpsActual.pausaHasta = null;

            if (gpsActual.sentido === "ida") {
                gpsActual.estado = "En camino a la escuela";
            } else {
                gpsActual.estado = "Regresando a casa";
            }

            guardarEstadoGPS();
            cargarInformacionRuta();
        }

        if (gpsActual.estado === "En la escuela") {
            if (!gpsActual.horaLlegadaEscuela) {
                gpsActual.horaLlegadaEscuela = Date.now();
                guardarEstadoGPS();
                return;
            }

            const tiempoEsperaEscuela = 10000;

            if (Date.now() - gpsActual.horaLlegadaEscuela >= tiempoEsperaEscuela) {
                gpsActual.sentido = "regreso";
                gpsActual.indiceActual = 0;
                gpsActual.estado = "Regresando a casa";
                gpsActual.horaLlegadaEscuela = null;
                gpsActual.paradasRealizadas = [];
                indiceActual = 0;

                actualizarUbicacionHijo("buseta", "En la buseta");
                crearAlertaUnaVez(
                    "salio-escuela-" + hijoActual.id,
                    "Salida de la escuela",
                    hijoActual.nombre + " salió de la escuela y va camino a casa.",
                    "comunicado",
                    "normal"
                );
                guardarEstadoGPS();

                cargarInformacionRuta();
                crearMapa();
                return;
            }

            return;
        }

        if (gpsActual.estado === "Llegó a casa") {
            clearInterval(intervaloMovimiento);
            return;
        }

        if (indiceActual >= recorrido.length - 1) {
            if (gpsActual.sentido === "ida") {
                gpsActual.estado = "En la escuela";
                gpsActual.indiceActual = recorrido.length - 1;
                gpsActual.horaLlegadaEscuela = Date.now();

                actualizarUbicacionHijo("escuela", "En la escuela");

                crearAlertaUnaVez(
                    "llego-escuela-" + hijoActual.id,
                    "Llegada a la escuela",
                    hijoActual.nombre + " llegó a la escuela correctamente.",
                    "llegada",
                    "normal"
                );
            } else {
                gpsActual.estado = "Llegó a casa";
                gpsActual.indiceActual = recorrido.length - 1;

                actualizarUbicacionHijo("casa", "En casa");

                crearAlertaUnaVez(
                    "llego-casa-" + hijoActual.id,
                    "Llegada a casa",
                    hijoActual.nombre + " llegó a casa correctamente.",
                    "llegada",
                    "normal"
                );
            }

            guardarEstadoGPS();
            cargarInformacionRuta();
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

        revisarParadaSimulada();

        guardarEstadoGPS();
        actualizarPanelRuta();

    }, 3500);
}

/* Actualiza el panel informativo con la próxima parada, la hora estimada y el tiempo restante.
    Es la capa visual que acompaña la simulación del recorrido.
*/
function actualizarPanelRuta() {
    const datosParada = obtenerProximaParada();

    document.getElementById("proximaParada").textContent = datosParada.parada.nombre;
    document.getElementById("horaParada").textContent =
        "Llegada aprox. " + datosParada.hora;

    document.getElementById("tiempoEstimado").textContent =
        calcularTiempoEstimado() + " min";
}

/* Determina cuál es la parada más relevante según el punto actual del recorrido.
    Devuelve el nombre de la parada y la hora estimada de llegada.
*/
function obtenerProximaParada() {
    if (gpsActual.estado === "En la escuela") {
        return {
            parada: {
                nombre: "En la escuela"
            },
            hora: rutaActual.horaLlegada
        };
    }

    if (gpsActual.estado === "Llegó a casa") {
        return {
            parada: {
                nombre: "En casa"
            },
            hora: obtenerHoraParada(rutaActual.paradas[0], rutaActual.paradas.length - 1)
        };
    }

    const paradas = gpsActual.sentido === "regreso"
        ? rutaActual.paradas.slice().reverse()
        : rutaActual.paradas;

    const total = obtenerRecorridoActual().length;
    const porcentaje = indiceActual / total;

    let indexParada = 0;

    if (porcentaje < .45) {
        indexParada = 1;
    } else {
        indexParada = paradas.length - 1;
    }

    const parada = paradas[indexParada] || paradas[0];

    return {
        parada: parada,
        hora: obtenerHoraParada(parada, indexParada)
    };
}

/* Calcula el tiempo estimado restante del viaje en minutos.
    Usa la longitud del recorrido que aún falta por completar.
*/
function calcularTiempoEstimado() {
    if (gpsActual.estado === "En la escuela" || gpsActual.estado === "Llegó a casa") {
        return 0;
    }

    const total = obtenerRecorridoActual().length;
    const restante = total - indiceActual;

    return Math.max(1, Math.ceil(restante * 0.4));
}

/* Guarda en el almacenamiento local el estado actualizado del GPS actual.
    Esto permite persistir la simulación entre recargas.
*/
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

/* Convierte una hora en formato HH:MM a minutos totales para facilitar comparaciones.
    Parámetros:
    - hora: cadena textual con el formato de hora.
*/
function convertirHoraAMinutos(hora) {
    const partes = hora.split(":");

    const horas = Number(partes[0]);
    const minutos = Number(partes[1]);

    return horas * 60 + minutos;
}

/* Devuelve la hora actual en minutos desde el inicio del día.
    Se usa para comparar horarios de salida y regreso.
*/
function obtenerMinutosActuales() {
    const fecha = new Date();

    return fecha.getHours() * 60 + fecha.getMinutes();
}

/* Actualiza la ubicación y el estado de entrega del hijo en memoria y en localStorage.
    Parámetros:
    - nuevaUbicacion: valor de la ubicación nueva (casa, escuela o buseta).
    - nuevoEstadoEntrega: texto visible del estado actual del estudiante.
*/
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

/* Revisa si la buseta ha llegado a una parada del recorrido y, en ese caso,
    actualiza el estado de la simulación para mostrar una pausa o un cambio de estado.
*/
function revisarParadaSimulada() {
    if (!gpsActual.paradasRealizadas) {
        gpsActual.paradasRealizadas = [];
    }

    const paradas = gpsActual.sentido === "regreso"
        ? rutaActual.paradas.slice().reverse()
        : rutaActual.paradas;

    const recorrido = obtenerRecorridoActual();

    paradas.forEach(function (parada, index) {
        const esDestino = index === paradas.length - 1;

        if (esDestino) {
            return;
        }

        const puntoParada = buscarIndiceMasCercano(parada.lat, parada.lng, recorrido);

        if (puntoParada !== indiceActual) {
            return;
        }

        const claveParada = gpsActual.sentido + "-" + parada.id;

        if (gpsActual.paradasRealizadas.includes(claveParada)) {
            return;
        }

        gpsActual.paradasRealizadas.push(claveParada);

        if (gpsActual.sentido === "ida") {
            gpsActual.estado = "Recogiendo estudiantes";
        } else {
            gpsActual.estado = "Dejando estudiantes";
        }

        gpsActual.pausaHasta = Date.now() + 6000;

        guardarEstadoGPS();
        cargarInformacionRuta();
    });
}

/* Busca, dentro de un recorrido, el índice del punto más cercano a unas coordenadas dadas.
    Se usa para detectar si la buseta ha alcanzado una parada concreta.
*/
function buscarIndiceMasCercano(lat, lng, recorrido) {
    let indiceCercano = 0;
    let distanciaMenor = Infinity;

    recorrido.forEach(function (punto, index) {
        const distancia =
            Math.abs(punto.lat - lat) +
            Math.abs(punto.lng - lng);

        if (distancia < distanciaMenor) {
            distanciaMenor = distancia;
            indiceCercano = index;
        }
    });

    return indiceCercano;
}

/* Genera un recorrido más realista por calles utilizando la API de OSRM.
    Si ya existe un recorrido generado, evita volver a consultarlo.
*/
async function generarRecorridoPorCalles() {
    if (gpsActual.recorridoRealGenerado) {
        return;
    }

    const puntos = rutaActual.paradas.map(function (parada) {
        return parada.lng + "," + parada.lat;
    }).join(";");

    const url = `https://router.project-osrm.org/route/v1/driving/${puntos}?overview=full&geometries=geojson`;

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (!datos.routes || datos.routes.length === 0) {
            return;
        }

        const coordenadas = datos.routes[0].geometry.coordinates;

        gpsActual.recorrido = coordenadas.map(function (coord) {
            return {
                lng: coord[0],
                lat: coord[1]
            };
        });

        gpsActual.indiceActual = 0;
        gpsActual.recorridoRealGenerado = true;

        guardarEstadoGPS();

    } catch (error) {
        console.log("No se pudo generar la ruta por calles.");
    }
}

/* Devuelve la hora estimada de una parada según el sentido del recorrido.
    Parámetros:
    - parada: objeto con los datos de la parada.
    - index: posición de la parada dentro del arreglo.
*/
function obtenerHoraParada(parada, index) {
    if (gpsActual.sentido === "ida") {
        return parada.hora;
    }

    const paradasRegreso = rutaActual.paradas.slice().reverse();

    const indiceRegreso = paradasRegreso.findIndex(function (item) {
        return item.id === parada.id;
    });

    const minutosBase = convertirHoraAMinutos(rutaActual.horaRegreso);
    const minutosPorParada = 12;

    const minutosCalculados = minutosBase + (indiceRegreso * minutosPorParada);

    return convertirMinutosAHora(minutosCalculados);
}

/* Convierte un total de minutos a formato HH:MM para mostrarlo en pantalla.
    Parámetros:
    - totalMinutos: número de minutos a transformar.
*/
function convertirMinutosAHora(totalMinutos) {
    const horas = Math.floor(totalMinutos / 60) % 24;
    const minutos = totalMinutos % 60;

    const horasTexto = horas.toString().padStart(2, "0");
    const minutosTexto = minutos.toString().padStart(2, "0");

    return horasTexto + ":" + minutosTexto;
}

/* Crea una alerta de seguimiento para el padre del hijo involucrado.
    Parámetros:
    - titulo: encabezado de la notificación.
    - mensaje: texto descriptivo del evento.
    - tipo: clasificación de la alerta.
    - prioridad: prioridad visual o lógica de la alerta.
*/
function crearAlertaRuta(titulo, mensaje, tipo, prioridad) {
    const usuario = obtenerUsuarioActual();

    if (!usuario || !hijoActual || !rutaActual) {
        return;
    }

    const alertas = obtenerDatos(DB_KEYS.alertas);

    const nuevaAlerta = {
        id: obtenerNuevoId(alertas),
        usuarioId: usuario.id,
        titulo: titulo,
        mensaje: mensaje.replace("{hijo}", hijoActual.nombre),
        tipo: tipo,
        prioridad: prioridad || "normal",
        fecha: obtenerFechaActualAlerta(),
        leida: false,
        rutaId: rutaActual.id,
        hijoId: hijoActual.id
    };

    alertas.push(nuevaAlerta);
    guardarDatos(DB_KEYS.alertas, alertas);
}

/* Genera un nuevo identificador incremental para los registros de alerta.
    Parámetros:
    - lista: arreglo de elementos donde se buscará el siguiente id.
*/
function obtenerNuevoId(lista) {
    if (lista.length === 0) {
        return 1;
    }

    return Math.max(...lista.map(function (item) {
        return item.id;
    })) + 1;
}

/* Devuelve la fecha y hora actual en el formato usado por las alertas del sistema.
    Sirve para ordenar y mostrar los eventos en el tiempo.
*/
function obtenerFechaActualAlerta() {
    const fecha = new Date();

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    const hora = String(fecha.getHours()).padStart(2, "0");
    const minutos = String(fecha.getMinutes()).padStart(2, "0");

    return `${anio}-${mes}-${dia} ${hora}:${minutos}`;
}

/* Evita duplicar alertas para un mismo evento de la simulación.
    Parámetros:
    - clave: identificador único del evento.
    - titulo, mensaje, tipo, prioridad: datos de la alerta a registrar.
*/
function crearAlertaUnaVez(clave, titulo, mensaje, tipo, prioridad) {
    if (!gpsActual.alertasGeneradas) {
        gpsActual.alertasGeneradas = [];
    }

    if (gpsActual.alertasGeneradas.includes(clave)) {
        return;
    }

    gpsActual.alertasGeneradas.push(clave);

    crearAlertaRuta(titulo, mensaje, tipo, prioridad);
    guardarEstadoGPS();
}