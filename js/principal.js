/* =======================================
PRINCIPAL - LITTLE RIDERS
Este archivo controla funciones generales del dashboard:
menú lateral, perfil del usuario, modal de cuenta,
cerrar sesión, eliminar cuenta y cambiar foto de perfil.
========================================= */

const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        menuItems.forEach(i =>
            i.classList.remove("active")
        );

        item.classList.add("active");

    });

});

/* Inicializa las funciones principales del dashboard
   cuando la página termina de cargar.
*/
document.addEventListener("DOMContentLoaded", function () {

    protegerPagina(["padre", "admin"]);

    cargarPerfilUsuario();
    activarMenuPerfil();
    activarModalCuenta();
    activarCambioFoto();

});

/* Carga la información del usuario actual y la muestra
   tanto en el header como en el modal de cuenta.
*/
function cargarPerfilUsuario() {

    const usuario = obtenerUsuarioActual();

    if (!usuario) {
        return;
    }

    const fotoDefault = "img/usuarios/fotoPerfil1.png";

    // Elementos del perfil
    const nombreHeader = document.getElementById("nombreUsuarioHeader");
    const correoHeader = document.getElementById("correoUsuarioHeader");
    const fotoHeader = document.getElementById("fotoPerfilHeader");
    const fotoModal = document.getElementById("fotoPerfilModal");

    if (nombreHeader) {
        nombreHeader.textContent = usuario.nombre;
    }

    if (correoHeader) {
        correoHeader.textContent = usuario.correo;
    }

    if (fotoHeader) {
        fotoHeader.src = usuario.foto || fotoDefault;
    }

    if (fotoModal) {
        fotoModal.src = usuario.foto || fotoDefault;
    }

    const padres = obtenerDatos(DB_KEYS.padres);

    const padre = padres.find(function (item) {
        return item.usuarioId === usuario.id;
    });

    const cuentaNombre = document.getElementById("cuentaNombre");
    const cuentaCedula = document.getElementById("cuentaCedula");
    const cuentaCorreo = document.getElementById("cuentaCorreo");
    const cuentaTelefono = document.getElementById("cuentaTelefono");
    const cuentaDireccion = document.getElementById("cuentaDireccion");
    const cuentaRol = document.getElementById("cuentaRol");

    if (cuentaNombre) {
        cuentaNombre.textContent = usuario.nombre;
    }

    if (cuentaCedula) {
        cuentaCedula.textContent = usuario.cedula;
    }

    if (cuentaCorreo) {
        cuentaCorreo.textContent = usuario.correo;
    }

    if (cuentaTelefono) {
        cuentaTelefono.textContent = padre ? padre.telefono : "No registrado";
    }

    if (cuentaDireccion) {
        cuentaDireccion.textContent = padre ? padre.direccion : "No registrada";
    }

    if (cuentaRol) {
        cuentaRol.textContent =
            usuario.rol === "admin" ? "Administrador" : "Padre de familia";
    }
}

/*
    activarMenuPerfil()

    Abre y cierra el menú desplegable del perfil.
*/
function activarMenuPerfil() {

    const btnPerfil = document.getElementById("btnPerfil");
    const profileMenu = document.getElementById("profileMenu");

    if (!btnPerfil || !profileMenu) {
        return;
    }

    btnPerfil.addEventListener("click", function (e) {

        e.stopPropagation();

        profileMenu.classList.toggle("active");
        btnPerfil.classList.toggle("active");

    });

    profileMenu.addEventListener("click", function (e) {
        e.stopPropagation();
    });

    document.addEventListener("click", function () {

        profileMenu.classList.remove("active");
        btnPerfil.classList.remove("active");

    });
}

/*
    activarModalCuenta()

    Controla la apertura del modal de cuenta,
    el cierre de sesión y la eliminación de la cuenta.
*/
function activarModalCuenta() {

    const btnMiCuenta = document.getElementById("btnMiCuenta");
    const modalCuenta = document.getElementById("modalCuenta");
    const cerrarModal = document.getElementById("cerrarModal");
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");
    const btnEliminarCuenta = document.getElementById("btnEliminarCuenta");

    const modalEliminar = document.getElementById("modalEliminarCuenta");
    const btnCancelarEliminar = document.getElementById("btnCancelarEliminar");
    const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");

    const modalCerrarSesion = document.getElementById("modalCerrarSesion");
    const btnCancelarCerrarSesion = document.getElementById("btnCancelarCerrarSesion");
    const btnConfirmarCerrarSesion = document.getElementById("btnConfirmarCerrarSesion");

    const btnCerrarSesionSidebar = document.getElementById("btnCerrarSesionSidebar");

    if (btnMiCuenta && modalCuenta) {

        btnMiCuenta.addEventListener("click", function () {

            modalCuenta.classList.add("active");

            const profileMenu = document.getElementById("profileMenu");

            if (profileMenu) {
                profileMenu.classList.remove("active");
            }

        });
    }

    if (cerrarModal && modalCuenta) {

        cerrarModal.addEventListener("click", function () {
            modalCuenta.classList.remove("active");
        });
    }

    /* CERRAR SESIÓN */

    if (btnCerrarSesionSidebar && modalCerrarSesion) {

        btnCerrarSesionSidebar.addEventListener("click", function (e) {

            e.preventDefault();

            modalCerrarSesion.classList.add("active");

        });
    }

    if (btnCerrarSesion && modalCerrarSesion) {

        btnCerrarSesion.addEventListener("click", function () {
            modalCerrarSesion.classList.add("active");
        });
    }

    if (btnCancelarCerrarSesion && modalCerrarSesion) {

        btnCancelarCerrarSesion.addEventListener("click", function () {
            modalCerrarSesion.classList.remove("active");
        });
    }

    if (btnConfirmarCerrarSesion) {

        btnConfirmarCerrarSesion.addEventListener("click", function () {
            cerrarSesion();
        });
    }

    if (btnEliminarCuenta && modalEliminar) {

        btnEliminarCuenta.addEventListener("click", function () {
            modalEliminar.classList.add("active");
        });
    }

    if (btnCancelarEliminar && modalEliminar) {

        btnCancelarEliminar.addEventListener("click", function () {
            modalEliminar.classList.remove("active");
        });
    }

    if (btnConfirmarEliminar) {

        btnConfirmarEliminar.addEventListener("click", function () {

            const usuario = obtenerUsuarioActual();

            if (!usuario) {
                return;
            }

            const resultado = eliminarCuenta(usuario.id);
        });
    }
}

/*
    activarCambioFoto()

    Permite seleccionar y actualizar la foto de perfil.
*/
function activarCambioFoto() {

    const inputFoto = document.getElementById("inputFoto");

    if (!inputFoto) {
        return;
    }

    inputFoto.addEventListener("change", function () {

        const archivo = this.files[0];

        if (!archivo) {
            return;
        }

        const lector = new FileReader();

        lector.onload = function (e) {

            const nuevaFoto = e.target.result;

            const usuario = obtenerUsuarioActual();

            actualizarDato(DB_KEYS.usuarios, usuario.id, {
                foto: nuevaFoto
            });

            const sesion = obtenerSesion();

            sesion.foto = nuevaFoto;

            localStorage.setItem(
                DB_KEYS.sesion,
                JSON.stringify(sesion)
            );

            cargarPerfilUsuario();
        };

        lector.readAsDataURL(archivo);

    });
}

document.addEventListener("DOMContentLoaded", function () {
    cargarInicioPrincipal();
});

document.addEventListener("baseDatosLista", function () {
    cargarInicioPrincipal();
});

function cargarInicioPrincipal() {
    cargarNombreInicio();
    cargarActividadInicio();
}

function cargarNombreInicio() {
    const usuario = obtenerUsuarioActual();
    const nombreTexto = document.getElementById("nombreInicioUsuario");

    if (!usuario || !nombreTexto) {
        return;
    }

    const primerNombre = usuario.nombre
        ? usuario.nombre.split(" ")[0]
        : "Usuario";

    nombreTexto.textContent = primerNombre;
}

function cargarActividadInicio() {
    const contenedor = document.getElementById("listaActividadInicio");

    if (!contenedor) {
        return;
    }

    const usuario = obtenerUsuarioActual();

    if (!usuario) {
        return;
    }

    const alertas = obtenerDatos(DB_KEYS.alertas);
    const hijos = obtenerDatos(DB_KEYS.hijos);
    const padres = obtenerDatos(DB_KEYS.padres);

    const padre = padres.find(function (item) {
        return item.usuarioId === usuario.id;
    });

    if (!padre) {
        contenedor.innerHTML = `
            <div class="actividad-item">
                <div class="actividad-icono">
                    <i class="fa-solid fa-circle-info"></i>
                </div>
                <div>
                    <h3>Sin actividad reciente</h3>
                    <p>No hay hijos asociados a esta cuenta.</p>
                </div>
            </div>
        `;
        return;
    }

    const hijosUsuario = hijos.filter(function (hijo) {
        return hijo.padreId === padre.id;
    });

    const idsHijos = hijosUsuario.map(function (hijo) {
        return hijo.id;
    });

    let alertasHijos = alertas.filter(function (alerta) {
        return idsHijos.includes(alerta.hijoId);
    });

    alertasHijos.sort(function (a, b) {
        return new Date(b.fecha.replace(" ", "T")) - new Date(a.fecha.replace(" ", "T"));
    });

    alertasHijos = alertasHijos.slice(0, 5);

    if (alertasHijos.length === 0) {
        contenedor.innerHTML = `
            <div class="actividad-item">
                <div class="actividad-icono">
                    <i class="fa-solid fa-bell"></i>
                </div>
                <div>
                    <h3>Sin actividad reciente</h3>
                    <p>Aquí aparecerán las salidas y llegadas de tus hijos.</p>
                </div>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = "";

    alertasHijos.forEach(function (alerta) {
        const hijo = hijos.find(function (item) {
            return item.id === alerta.hijoId;
        });

        const nombreHijo = hijo ? hijo.nombre : "Estudiante";

        contenedor.innerHTML += `
            <div class="actividad-item">
                <div class="actividad-icono">
                    <i class="fa-solid ${obtenerIconoActividad(alerta.tipo)}"></i>
                </div>

                <div>
                    <h3>${nombreHijo}</h3>
                    <p>${alerta.mensaje}</p>
                </div>
            </div>
        `;
    });
}

function obtenerIconoActividad(tipo) {
    if (tipo === "llegada") {
        return "fa-circle-check";
    }

    if (tipo === "demora") {
        return "fa-clock";
    }

    if (tipo === "incidente") {
        return "fa-triangle-exclamation";
    }

    if (tipo === "comunicado") {
        return "fa-bell";
    }

    return "fa-bell";
}