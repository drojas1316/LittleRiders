/* =======================================
MIS HIJOS - LITTLE RIDERS
Este archivo controla la página donde el padre puede ver,
agregar y editar los datos de sus hijos.
========================================= */


/* 
Cuando la base de datos del localStorage ya está lista,
se protege la página, se cargan los datos del usuario,
se muestran los hijos y se configura el modal una sola vez.
*/
document.addEventListener("baseDatosLista", function () {
    protegerPagina(["padre"]);
    cargarDatosHeader();
    cargarHijosPadre();

    if (!modalHijoConfigurado) {
        configurarModalHijo();
        modalHijoConfigurado = true;
    }
});


/* 
Carga en el header los datos del usuario que inició sesión:
nombre, correo y foto de perfil.
*/
function cargarDatosHeader() {
    const sesion = obtenerSesion();

    if (!sesion) {
        return;
    }

    const nombreHeader = document.getElementById("nombreUsuarioHeader");
    const correoHeader = document.getElementById("correoUsuarioHeader");
    const fotoHeader = document.getElementById("fotoPerfilHeader");

    if (nombreHeader) {
        nombreHeader.textContent = sesion.nombre;
    }

    if (correoHeader) {
        correoHeader.textContent = sesion.correo;
    }

    if (fotoHeader) {
        fotoHeader.src = sesion.foto || "img/usuarios/fotoPerfil1.png";
    }
}


/* 
Carga y muestra en pantalla todos los hijos que pertenecen
al padre que inició sesión.
También busca su ruta, buseta y conductor asignado.
*/
function cargarHijosPadre() {
    const contenedor = document.getElementById("childrenList");

    if (!contenedor) {
        return;
    }

    const sesion = obtenerSesion();

    if (!sesion) {
        return;
    }

    const padres = obtenerDatos(DB_KEYS.padres);
    const hijos = obtenerDatos(DB_KEYS.hijos);
    const rutas = obtenerDatos(DB_KEYS.rutas);
    const busetas = obtenerDatos(DB_KEYS.busetas);
    const conductores = obtenerDatos(DB_KEYS.conductores);

    const padreActual = padres.find(function (padre) {
        return padre.usuarioId === sesion.usuarioId;
    });

    if (!padreActual) {
        contenedor.innerHTML = `
            <div class="empty-children">
                <i class="fa-solid fa-circle-exclamation"></i>
                <h3>No encontramos tu perfil de padre</h3>
                <p>Comunícate con administración para revisar tu cuenta.</p>
            </div>
        `;
        return;
    }

    const hijosPadre = hijos.filter(function (hijo) {
        return hijo.padreId === padreActual.id && hijo.estado === "activo";
    });

    if (hijosPadre.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-children">
                <i class="fa-solid fa-children"></i>
                <h3>No tienes hijos registrados</h3>
                <p>Agrega un hijo para visualizar su ruta, buseta y conductor asignado.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = "";

    hijosPadre.forEach(function (hijo) {
        const ruta = rutas.find(function (ruta) {
            return ruta.id === hijo.rutaId;
        });

        const buseta = ruta
            ? busetas.find(function (buseta) {
                return buseta.id === ruta.busetaId;
            })
            : null;

        const conductor = ruta
            ? conductores.find(function (conductor) {
                return conductor.id === ruta.conductorId;
            })
            : null;

        const fotoHijo = hijo.foto || "img/usuarios/fotoPerfil1.png";
        const nombreRuta = ruta ? ruta.nombre : "Sin ruta asignada";
        const nombreBuseta = buseta ? buseta.nombre : "Sin buseta";
        const nombreConductor = conductor ? conductor.nombre : "Sin conductor";

        contenedor.innerHTML += `
            <article class="child-row">

                <div class="child-card">

                    <div class="child-main">

                        <div class="child-photo">
                            <img src="${fotoHijo}" alt="${hijo.nombre}">
                        </div>

                        <div class="child-info">
                            <h3>${hijo.nombre}</h3>
                            <p><strong>Edad:</strong> ${hijo.edad} años</p>
                            <p><strong>Grado:</strong> ${hijo.grado}</p>
                            <p><strong>Institución:</strong> ${hijo.institucion}</p>
                        </div>

                    </div>

                    <div class="child-actions">
                        <button class="btn-edit-child" data-id="${hijo.id}">
                            <i class="fa-solid fa-pen"></i>
                            Editar
                        </button>

                        <a href="mapa.html?hijoId=${hijo.id}">
                            Ver ruta
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>

                </div>

                <div class="child-transport-card">

                    <div class="transport-icon">
                        <i class="fa-solid fa-bus"></i>
                    </div>

                    <div class="transport-info">
                        <h4>${nombreBuseta}</h4>
                        <p>Conductor: ${nombreConductor}</p>
                        <span>${nombreRuta}</span>
                    </div>

                </div>

            </article>
        `;
    });

    activarBotonesEditarHijo();
}

/* 
Variables globales del modal.
hijoEditandoId guarda el ID del hijo que se está editando.
fotoHijoSeleccionada guarda la imagen seleccionada.
modalHijoConfigurado evita configurar el modal más de una vez.
*/
let hijoEditandoId = null;
let fotoHijoSeleccionada = null;
let modalHijoConfigurado = false;


/* 
Configura todos los eventos del modal:
abrir, cerrar, cambiar foto y guardar formulario.
*/
function configurarModalHijo() {
    const btnAgregarHijo = document.getElementById("btnAgregarHijo");
    const modalHijo = document.getElementById("modalHijo");
    const cerrarModalHijo = document.getElementById("cerrarModalHijo");
    const btnEliminarHijo = document.getElementById("btnEliminarHijo");
    const formHijo = document.getElementById("formHijo");
    const fotoInput = document.getElementById("fotoHijoInput");

    cargarSelectRutas();

    if (btnAgregarHijo) {
        btnAgregarHijo.addEventListener("click", function () {
            abrirModalAgregarHijo();
        });
    }

    if (cerrarModalHijo) {
        cerrarModalHijo.addEventListener("click", function () {
            cerrarModalAgregarEditarHijo();
        });
    }

    if (modalHijo) {
        modalHijo.addEventListener("click", function (e) {
            if (e.target === modalHijo) {
                cerrarModalAgregarEditarHijo();
            }
        });
    }

    if (btnEliminarHijo) {
        btnEliminarHijo.addEventListener("click", function () {
            eliminarHijoActual();
        });
    }

    if (fotoInput) {
        fotoInput.addEventListener("change", function () {
            const archivo = fotoInput.files[0];

            if (!archivo) {
                return;
            }

            const lector = new FileReader();

            lector.onload = function (e) {
                fotoHijoSeleccionada = e.target.result;
                document.getElementById("previewFotoHijo").src = fotoHijoSeleccionada;
            };

            lector.readAsDataURL(archivo);
        });
    }

    if (formHijo) {
        formHijo.addEventListener("submit", function (e) {
            e.preventDefault();
            guardarHijoDesdeFormulario();
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            cerrarModalAgregarEditarHijo();
        }
    });
}


/* 
Carga las rutas disponibles dentro del select del formulario.
Así el padre puede escoger la ruta del hijo.
*/
function cargarSelectRutas() {
    const selectRuta = document.getElementById("hijoRuta");

    if (!selectRuta) {
        return;
    }

    const rutas = obtenerDatos(DB_KEYS.rutas);

    selectRuta.innerHTML = `<option value="">Seleccionar ruta</option>`;

    rutas.forEach(function (ruta) {
        selectRuta.innerHTML += `
            <option value="${ruta.id}">
                ${ruta.nombre}
            </option>
        `;
    });
}


/* 
Abre el modal en modo agregar.
Limpia el formulario y coloca la foto por defecto.
*/
function abrirModalAgregarHijo() {
    hijoEditandoId = null;
    fotoHijoSeleccionada = null;

    document.getElementById("tituloModalHijo").textContent = "Agregar hijo";
    document.getElementById("formHijo").reset();
    document.getElementById("previewFotoHijo").src = "img/usuarios/fotoPerfil1.png";

    const btnEliminarHijo = document.getElementById("btnEliminarHijo");

    if (btnEliminarHijo) {
        btnEliminarHijo.style.display = "none";
    }

    document.getElementById("modalHijo").classList.add("active");
}


/* 
Abre el modal en modo editar.
Busca el hijo por ID y carga sus datos en el formulario.
*/
function abrirModalEditarHijo(hijoId) {
    const hijo = obtenerPorId(DB_KEYS.hijos, hijoId);

    if (!hijo) {
        return;
    }

    hijoEditandoId = hijo.id;
    fotoHijoSeleccionada = hijo.foto || "img/usuarios/fotoPerfil1.png";

    document.getElementById("tituloModalHijo").textContent = "Editar hijo";

    document.getElementById("hijoNombre").value = hijo.nombre;
    document.getElementById("hijoEdad").value = hijo.edad;
    document.getElementById("hijoGrado").value = hijo.grado;
    document.getElementById("hijoInstitucion").value = hijo.institucion;
    document.getElementById("hijoContacto").value = hijo.contactoEmergencia || "";
    document.getElementById("hijoRuta").value = hijo.rutaId;
    document.getElementById("previewFotoHijo").src = fotoHijoSeleccionada;

    const btnEliminarHijo = document.getElementById("btnEliminarHijo");

    if (btnEliminarHijo) {
        btnEliminarHijo.style.display = "flex";
    }

    document.getElementById("modalHijo").classList.add("active");
}


/* 
Cierra el modal de agregar o editar hijo.
*/
function cerrarModalAgregarEditarHijo() {
    document.getElementById("modalHijo").classList.remove("active");
}


/* 
Obtiene los datos del formulario, valida la información
y decide si debe agregar un hijo nuevo o actualizar uno existente.
*/
/*
Obtiene los datos del formulario, valida la información
y decide si debe agregar un hijo nuevo o actualizar uno existente.
*/
function guardarHijoDesdeFormulario() {
    const sesion = obtenerSesion();

    if (!sesion) {
        mostrarNotificacion("No hay una sesión activa.", "error");
        return;
    }

    const padres = obtenerDatos(DB_KEYS.padres);

    const padreActual = padres.find(function (padre) {
        return padre.usuarioId === sesion.usuarioId;
    });

    if (!padreActual) {
        mostrarNotificacion("No se encontró el perfil del padre.", "error");
        return;
    }

    const nombre = document.getElementById("hijoNombre").value.trim();
    const edad = Number(document.getElementById("hijoEdad").value);
    const grado = document.getElementById("hijoGrado").value.trim();
    const institucion = document.getElementById("hijoInstitucion").value.trim();
    const contactoEmergencia = document.getElementById("hijoContacto").value.trim();
    const rutaId = Number(document.getElementById("hijoRuta").value);

    if (nombre.length < 3) {
        mostrarNotificacion("El nombre debe tener al menos 3 letras.", "warning");
        return;
    }

    if (!soloLetras(nombre)) {
        mostrarNotificacion("El nombre solo debe contener letras.", "warning");
        return;
    }

    if (!edad || edad < 3 || edad > 18) {
        mostrarNotificacion("La edad debe estar entre 3 y 18 años.", "warning");
        return;
    }

    if (grado.length < 1) {
        mostrarNotificacion("Debes ingresar el grado del hijo.", "warning");
        return;
    }

    if (institucion.length < 3) {
        mostrarNotificacion("Debes ingresar una institución válida.", "warning");
        return;
    }

    if (contactoEmergencia.length < 8) {
        mostrarNotificacion("El contacto de emergencia debe tener al menos 8 dígitos.", "warning");
        return;
    }

    if (!soloNumeros(contactoEmergencia)) {
        mostrarNotificacion("El contacto de emergencia solo debe contener números.", "warning");
        return;
    }

    if (!rutaId) {
        mostrarNotificacion("Debes seleccionar una ruta.", "warning");
        return;
    }

    const datosHijo = {
        padreId: padreActual.id,
        nombre: nombre,
        edad: edad,
        grado: grado,
        institucion: institucion,
        contactoEmergencia: contactoEmergencia,
        rutaId: rutaId,
        estado: "activo",
        foto: fotoHijoSeleccionada || "img/usuarios/fotoPerfil1.png"
    };

    if (hijoEditandoId) {
        datosHijo.id = hijoEditandoId;

        actualizarDato(DB_KEYS.hijos, hijoEditandoId, datosHijo);

        mostrarNotificacion("Hijo editado correctamente.", "success");
    } else {
        agregarDato(DB_KEYS.hijos, datosHijo);

        mostrarNotificacion("Hijo agregado correctamente.", "success");
    }

    cerrarModalAgregarEditarHijo();

    cargarHijosPadre();
}


/*
Elimina lógicamente el hijo actual.
No lo borra del localStorage, solo cambia su estado a inactivo.
*/
function eliminarHijoActual() {
    if (!hijoEditandoId) {
        mostrarNotificacion("No hay un hijo seleccionado para eliminar.", "warning");
        return;
    }

    const hijo = obtenerPorId(DB_KEYS.hijos, hijoEditandoId);

    if (!hijo) {
        mostrarNotificacion("No se encontró el hijo seleccionado.", "error");
        return;
    }

    Swal.fire({
        title: "¿Eliminar hijo?",
        text: `Esta acción quitará a ${hijo.nombre} de tu lista de hijos.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "#64748B",
        reverseButtons: true
    }).then(function (resultado) {
        if (!resultado.isConfirmed) {
            return;
        }

        const hijoEliminado = {
            ...hijo,
            estado: "inactivo"
        };

        actualizarDato(DB_KEYS.hijos, hijoEditandoId, hijoEliminado);

        mostrarNotificacion("Hijo eliminado correctamente.", "success");

        cerrarModalAgregarEditarHijo();

        cargarHijosPadre();
    });
}

/*
Valida que un texto tenga solo letras y espacios.
También acepta tildes y ñ.
*/
function soloLetras(texto) {
    const patron = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    return patron.test(texto);
}


/*
Valida que un texto tenga solo números.
*/
function soloNumeros(texto) {
    const patron = /^[0-9]+$/;
    return patron.test(texto);
}

/* 
Activa todos los botones de editar.
Se llama después de crear las tarjetas porque los botones
se generan dinámicamente con innerHTML.
*/
function activarBotonesEditarHijo() {
    const botonesEditar = document.querySelectorAll(".btn-edit-child");

    botonesEditar.forEach(function (boton) {
        boton.addEventListener("click", function () {
            const hijoId = Number(boton.dataset.id);
            abrirModalEditarHijo(hijoId);
        });
    });
}
