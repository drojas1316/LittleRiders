/* =======================================
CONDUCTORES - LITTLE RIDERS
Muestra las tarjetas de conductores con su
buseta asignada y su ruta si existe.
========================================= */


/*
Cuando la base de datos está lista:
- protege la página
- carga las tarjetas de conductores
*/
document.addEventListener("baseDatosLista", function () {
    protegerPagina(["padre", "admin"]);
    cargarConductores();
});


/*
Carga todos los conductores y crea una tarjeta por cada uno.

Según tu estructura:
- El conductor tiene busetaId.
- La ruta también tiene busetaId.
- Entonces primero buscamos la buseta del conductor.
- Luego buscamos si esa buseta tiene ruta.
*/
function cargarConductores() {
    const contenedor = document.getElementById("conductoresList");

    if (!contenedor) {
        return;
    }

    const conductores = obtenerDatos(DB_KEYS.conductores);
    const busetas = obtenerDatos(DB_KEYS.busetas);
    const rutas = obtenerDatos(DB_KEYS.rutas);

    if (conductores.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-conductores">
                <i class="fa-solid fa-user-tie"></i>
                <h3>No hay conductores registrados</h3>
                <p>Cuando administración registre conductores, aparecerán aquí.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = "";

    conductores.forEach(function (conductor) {

        const buseta = busetas.find(function (buseta) {
            return buseta.id === conductor.busetaId;
        });

        const ruta = rutas.find(function (ruta) {
            return ruta.busetaId === conductor.busetaId;
        });

        const nombreBuseta = buseta ? buseta.nombre : "Sin buseta asignada";
        const placaBuseta = buseta ? buseta.placa : "No registrada";
        const modeloBuseta = buseta ? buseta.modelo : "No registrado";

        const nombreRuta = ruta ? ruta.nombre : "Sin ruta asignada";
        const horaSalida = ruta ? ruta.horaSalida : "No registrada";
        const horaLlegada = ruta ? ruta.horaLlegada : "No registrada";
        const horaRegreso = ruta ? ruta.horaRegreso : "No registrada";

        const imagenConductor = conductor.imagen || "img/usuarios/fotoPerfil1.png";

        const estado = conductor.estado || "Activo";
        const estadoMinuscula = estado.toLowerCase();

        const claseEstado = estadoMinuscula.includes("inactivo")
            ? "inactivo"
            : "activo";

        contenedor.innerHTML += `
            <article class="conductor-card">

                <div class="conductor-img">
                    <img src="${imagenConductor}" alt="${conductor.nombre}">
                </div>

                <div class="conductor-info">

                    <div class="conductor-top">
                        <div>
                            <h3>${conductor.nombre}</h3>
                            <p class="conductor-licencia">
                                Licencia: ${conductor.licencia || "No registrada"}
                            </p>
                        </div>

                        <span class="conductor-estado ${claseEstado}">
                            ${estado}
                        </span>
                    </div>

                    <div class="conductor-datos">

                        <div class="conductor-dato">
                            <i class="fa-solid fa-id-card"></i>
                            <span>Cédula: ${conductor.cedula || "No registrada"}</span>
                        </div>

                        <div class="conductor-dato">
                            <i class="fa-solid fa-phone"></i>
                            <span>Teléfono: ${conductor.telefono || "No registrado"}</span>
                        </div>

                        <div class="conductor-dato">
                            <i class="fa-solid fa-briefcase"></i>
                            <span>Experiencia: ${conductor.experiencia || 0} años</span>
                        </div>

                        <div class="conductor-dato">
                            <i class="fa-solid fa-star"></i>
                            <span>Calificación: ${conductor.calificacion || "Sin calificación"}</span>
                        </div>

                    </div>

                    <div class="conductor-asignacion">
                        <h4>Buseta asignada</h4>

                        <p>
                            <strong>Buseta:</strong> ${nombreBuseta}
                        </p>

                        <p>
                            <strong>Placa:</strong> ${placaBuseta}
                        </p>

                        <p>
                            <strong>Modelo:</strong> ${modeloBuseta}
                        </p>

                    </div>

                    <div class="conductor-asignacion ruta-box">
                        <h4>Ruta asignada</h4>

                        <span class="conductor-ruta">
                            ${nombreRuta}
                        </span>

                        <p>
                            <strong>Salida:</strong> ${horaSalida}
                        </p>

                        <p>
                            <strong>Llegada:</strong> ${horaLlegada}
                        </p>

                        <p>
                            <strong>Regreso:</strong> ${horaRegreso}
                        </p>
                    </div>

                </div>

            </article>
        `;
    });
}