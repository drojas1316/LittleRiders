/* =======================================
MENSAJES - LITTLE RIDERS
Permite comunicación entre padres y administración.
========================================= */

let contactoSeleccionado = null;


/*
Cuando la base de datos está lista:
- protege la página
- carga la conversación disponible
- configura el formulario
*/
document.addEventListener("baseDatosLista", function () {
    protegerPagina(["padre", "admin"]);
    cargarConversaciones();
    configurarFormularioMensaje();
});


/*
Carga la lista de conversaciones.

Padre:
- solo puede ver Administración.

Admin:
- puede ver los padres que tienen conversación con administración.
*/
function cargarConversaciones() {
    const contenedor = document.getElementById("conversacionesList");

    if (!contenedor) {
        return;
    }

    const usuario = obtenerUsuarioActual();

    if (!usuario) {
        return;
    }

    let contactos = [];

    if (usuario.rol === "padre") {
        const usuarios = obtenerDatos(DB_KEYS.usuarios);

        const admin = usuarios.find(function (usuario) {
            return usuario.rol === "admin";
        });

        contactos = [
            {
                tipo: "admin",
                id: admin ? admin.id : 1,
                nombre: "Administración",
                descripcion: admin ? admin.nombre : "Soporte Little Riders",
                imagen: admin ? admin.foto : null,
                icono: "fa-headset"
            }
        ];
    }

    if (usuario.rol === "admin") {
        contactos = obtenerPadresConMensajes();
    }

    if (contactos.length === 0) {
        contenedor.innerHTML = `
            <div class="chat-empty">
                <i class="fa-solid fa-comments"></i>
                <h3>No hay conversaciones</h3>
                <p>Aún no hay mensajes disponibles.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = "";

    contactos.forEach(function (contacto) {
        const imagen = contacto.imagen
            ? `<img src="${contacto.imagen}" alt="${contacto.nombre}">`
            : `<i class="fa-solid ${contacto.icono}"></i>`;

        contenedor.innerHTML += `
            <article 
                class="conversacion-card"
                data-tipo="${contacto.tipo}"
                data-id="${contacto.id}"
            >
                <div class="conversacion-avatar">
                    ${imagen}
                </div>

                <div class="conversacion-info">
                    <h3>${contacto.nombre}</h3>
                    <p>${contacto.descripcion}</p>
                    <span class="estado-linea">Disponible</span>
                </div>
            </article>
        `;
    });

    activarClickConversaciones();

    if (usuario.rol === "padre") {
        const primeraConversacion = document.querySelector(".conversacion-card");

        if (primeraConversacion) {
            primeraConversacion.click();
        }
    }
}


/*
Para administración, obtiene todos los padres que tengan mensajes.
*/
function obtenerPadresConMensajes() {
    const mensajes = obtenerDatos(DB_KEYS.mensajes);
    const usuarios = obtenerDatos(DB_KEYS.usuarios);

    const padresIds = [];

    mensajes.forEach(function (mensaje) {
        if (mensaje.emisorTipo === "padre" && !padresIds.includes(mensaje.emisorId)) {
            padresIds.push(mensaje.emisorId);
        }

        if (mensaje.receptorTipo === "padre" && !padresIds.includes(mensaje.receptorId)) {
            padresIds.push(mensaje.receptorId);
        }
    });

    return padresIds.map(function (padreId) {
        const padre = usuarios.find(function (usuario) {
            return usuario.id === padreId;
        });

        return {
            tipo: "padre",
            id: padreId,
            nombre: padre ? padre.nombre : "Padre de familia",
            descripcion: "Padre de familia",
            imagen: padre ? padre.foto : null,
            icono: "fa-user"
        };
    });
}


/*
Activa el click en cada conversación.
*/
function activarClickConversaciones() {
    const tarjetas = document.querySelectorAll(".conversacion-card");

    tarjetas.forEach(function (tarjeta) {
        tarjeta.addEventListener("click", function () {
            tarjetas.forEach(function (item) {
                item.classList.remove("active");
            });

            tarjeta.classList.add("active");

            contactoSeleccionado = {
                tipo: tarjeta.dataset.tipo,
                id: Number(tarjeta.dataset.id)
            };

            cargarHeaderChat();
            cargarMensajesChat();
        });
    });
}


/*
Carga el header del chat según el contacto seleccionado.
*/
function cargarHeaderChat() {
    const chatHeader = document.getElementById("chatHeader");

    if (!chatHeader || !contactoSeleccionado) {
        return;
    }

    const contacto = obtenerDatosContacto(contactoSeleccionado.tipo, contactoSeleccionado.id);

    const imagen = contacto.imagen
        ? `<img src="${contacto.imagen}" alt="${contacto.nombre}">`
        : `<i class="fa-solid ${contacto.icono}"></i>`;

    chatHeader.innerHTML = `
        <div class="chat-contacto">
            <div class="chat-avatar">
                ${imagen}
            </div>

            <div>
                <h2>${contacto.nombre}</h2>
                <p>${contacto.descripcion}</p>
            </div>
        </div>
    `;
}


/*
Carga los mensajes de la conversación seleccionada.
*/
function cargarMensajesChat() {
    const contenedor = document.getElementById("chatMensajes");

    if (!contenedor || !contactoSeleccionado) {
        return;
    }

    const usuario = obtenerUsuarioActual();
    const mensajes = obtenerDatos(DB_KEYS.mensajes);

    let mensajesConversacion = mensajes.filter(function (mensaje) {
        return perteneceAConversacion(mensaje, usuario, contactoSeleccionado);
    });

    mensajesConversacion.sort(function (a, b) {
        return new Date(a.fecha.replace(" ", "T")) - new Date(b.fecha.replace(" ", "T"));
    });

    if (mensajesConversacion.length === 0) {
        contenedor.innerHTML = `
            <div class="chat-empty">
                <i class="fa-solid fa-comments"></i>
                <h3>No hay mensajes todavía</h3>
                <p>Escribe el primer mensaje de esta conversación.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = "";

    mensajesConversacion.forEach(function (mensaje) {
        const enviadoPorUsuario =
            mensaje.emisorTipo === usuario.rol &&
            mensaje.emisorId === usuario.id;

        contenedor.innerHTML += `
            <div class="mensaje-burbuja ${enviadoPorUsuario ? "enviado" : "recibido"}">
                <p>${mensaje.mensaje}</p>
                <span>${formatearHoraMensaje(mensaje.fecha)}</span>
            </div>
        `;
    });

    contenedor.scrollTop = contenedor.scrollHeight;
}


/*
Verifica si un mensaje pertenece a la conversación actual.
*/
function perteneceAConversacion(mensaje, usuario, contacto) {
    if (usuario.rol === "padre" && contacto.tipo === "admin") {
        return (
            (mensaje.emisorTipo === "padre" &&
                mensaje.emisorId === usuario.id &&
                mensaje.receptorTipo === "admin") ||

            (mensaje.emisorTipo === "admin" &&
                mensaje.receptorTipo === "padre" &&
                mensaje.receptorId === usuario.id)
        );
    }

    if (usuario.rol === "admin" && contacto.tipo === "padre") {
        return (
            (mensaje.emisorTipo === "padre" &&
                mensaje.emisorId === contacto.id &&
                mensaje.receptorTipo === "admin") ||

            (mensaje.emisorTipo === "admin" &&
                mensaje.receptorTipo === "padre" &&
                mensaje.receptorId === contacto.id)
        );
    }

    return false;
}


/*
Configura el formulario para enviar mensajes.
*/
function configurarFormularioMensaje() {
    const form = document.getElementById("formMensaje");

    if (!form) {
        return;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        enviarMensaje();
    });
}


/*
Envía un nuevo mensaje y lo guarda en localStorage.
*/
function enviarMensaje() {
    const input = document.getElementById("inputMensaje");
    const usuario = obtenerUsuarioActual();

    if (!input) {
        return;
    }

    if (!usuario) {
        mostrarNotificacion("No hay una sesión activa.", "error");
        return;
    }

    if (!contactoSeleccionado) {
        mostrarNotificacion("Selecciona una conversación primero.", "warning");
        return;
    }

    const texto = input.value.trim();

    if (texto.length < 2) {
        mostrarNotificacion("Escribe un mensaje válido.", "warning");
        return;
    }

    const nuevoMensaje = crearMensaje(usuario, contactoSeleccionado, texto);

    if (!nuevoMensaje) {
        mostrarNotificacion("No se pudo crear el mensaje.", "error");
        return;
    }

    agregarDato(DB_KEYS.mensajes, nuevoMensaje);

    input.value = "";

    cargarConversaciones();
    restaurarConversacionSeleccionada();
    cargarHeaderChat();
    cargarMensajesChat();
}


/*
Crea el objeto del mensaje según el rol actual.
*/
function crearMensaje(usuario, contacto, texto) {
    if (usuario.rol === "padre") {
        return {
            emisorTipo: "padre",
            emisorId: usuario.id,
            receptorTipo: "admin",
            receptorId: contacto.id,
            mensaje: texto,
            fecha: obtenerFechaActualMensaje(),
            leido: false
        };
    }

    if (usuario.rol === "admin") {
        return {
            emisorTipo: "admin",
            emisorId: usuario.id,
            receptorTipo: "padre",
            receptorId: contacto.id,
            mensaje: texto,
            fecha: obtenerFechaActualMensaje(),
            leido: false
        };
    }

    return null;
}


/*
Restaura visualmente la conversación seleccionada después de recargar la lista.
*/
function restaurarConversacionSeleccionada() {
    if (!contactoSeleccionado) {
        return;
    }

    const tarjeta = document.querySelector(
        `.conversacion-card[data-tipo="${contactoSeleccionado.tipo}"][data-id="${contactoSeleccionado.id}"]`
    );

    if (tarjeta) {
        tarjeta.classList.add("active");
    }
}


/*
Obtiene los datos visuales del contacto.
*/
function obtenerDatosContacto(tipo, id) {
    if (tipo === "admin") {
        const usuarios = obtenerDatos(DB_KEYS.usuarios);

        const admin = usuarios.find(function (usuario) {
            return usuario.rol === "admin";
        });

        return {
            nombre: "Administración",
            descripcion: admin ? admin.nombre : "Soporte Little Riders",
            imagen: admin ? admin.foto : null,
            icono: "fa-headset"
        };
    }

    if (tipo === "padre") {
        const usuarios = obtenerDatos(DB_KEYS.usuarios);

        const padre = usuarios.find(function (usuario) {
            return usuario.id === id;
        });

        return {
            nombre: padre ? padre.nombre : "Padre de familia",
            descripcion: "Padre de familia",
            imagen: padre ? padre.foto : null,
            icono: "fa-user"
        };
    }

    return {
        nombre: "Contacto",
        descripcion: "Conversación",
        imagen: null,
        icono: "fa-comments"
    };
}


/*
Formatea solo la hora del mensaje.
*/
function formatearHoraMensaje(fecha) {
    if (!fecha) {
        return "";
    }

    const fechaCompatible = fecha.replace(" ", "T");
    const fechaObjeto = new Date(fechaCompatible);

    if (isNaN(fechaObjeto.getTime())) {
        return fecha;
    }

    return fechaObjeto.toLocaleTimeString("es-CR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}


/*
Genera la fecha actual en formato compatible con tus JSON.
*/
function obtenerFechaActualMensaje() {
    const fecha = new Date();

    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    const hours = String(fecha.getHours()).padStart(2, "0");
    const minutes = String(fecha.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}