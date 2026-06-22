const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        menuItems.forEach(i =>
            i.classList.remove("active")
        );

        item.classList.add("active");

    });

});

/*
    Inicializa las funciones principales
    cuando la página termina de cargar.
*/
document.addEventListener("DOMContentLoaded", function () {

    protegerPagina(["padre", "admin"]);

    cargarPerfilUsuario();
    activarMenuPerfil();
    activarModalCuenta();
    activarCambioFoto();

});

/*
    cargarPerfilUsuario()

    Carga la información del usuario que inició sesión
    y la muestra en el perfil y en el modal.
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