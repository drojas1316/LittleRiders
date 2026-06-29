const login = document.getElementById("login");
const register = document.getElementById("register");
const indicator = document.getElementById("indicator");
const tabs = document.querySelectorAll(".tab");

/* Muestra el formulario de inicio de sesión y oculta el de registro. */
function showLogin() {
    // 1. Desliza el indicador amarillo a la izquierda
    indicator.style.transform = "translateX(0%)";

    // 2. Transición del formulario
    register.style.display = "none";
    login.style.display = "block";
    login.style.opacity = "0";
    setTimeout(() => {
        login.style.opacity = "1";
    }, 10);

    // 3. Manejo de clases activas para el texto
    tabs[0].classList.add("active");
    tabs[1].classList.remove("active");
}

/* Muestra el formulario de registro y oculta el de inicio de sesión. */
function showRegister() {
    // 1. Desliza el indicador amarillo a la derecha
    indicator.style.transform = "translateX(100%)";

    // 2. Transición del formulario
    login.style.display = "none";
    register.style.display = "block";
    register.style.opacity = "0";
    setTimeout(() => {
        register.style.opacity = "1";
    }, 10);

    // 3. Manejo de clases activas para el texto
    tabs[1].classList.add("active");
    tabs[0].classList.remove("active");
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

/* =======================================
LOGIN - VALIDACIONES Y ENVÍO
========================================= */

document.getElementById("loginForm").addEventListener("submit", function (e) {

    e.preventDefault();

    const cedula = document.getElementById("loginIdentificacion");
    const password = document.getElementById("loginPassword");

    if (cedula.value.length !== 9) {
        mostrarMensaje(
            "Cédula inválida",
            "La cédula debe tener exactamente 9 dígitos.",
            "warning"
        );
        cedula.focus();
        return;
    }

    if (password.value.length < 6) {
        mostrarMensaje(
            "Contraseña inválida",
            "La contraseña debe tener mínimo 6 caracteres.",
            "warning"
        );
        password.focus();
        return;
    }

    const resultado = iniciarSesion(cedula.value.trim(), password.value.trim());

    if (!resultado.ok) {
        mostrarMensaje(
            "No se pudo iniciar sesión",
            resultado.mensaje,
            "error"
        );
        return;
    }

    if (resultado.usuario.rol === "admin") {
        window.location.href = "admin.html";
    } else if (resultado.usuario.rol === "padre") {
        window.location.href = "principal.html";
    }

});

/* =======================================
REGISTRO - VALIDACIONES Y ENVÍO
========================================= */

document.getElementById("registerForm").addEventListener("submit", function (e) {

    e.preventDefault();

    const nombre = document.getElementById("nombre");
    const identificacion = document.getElementById("identificacion");
    const correo = document.getElementById("correo");
    const telefono = document.getElementById("telefono");
    const direccion = document.getElementById("direccion");
    const password = document.getElementById("password");

    if (nombre.value.trim().length < 3) {
        mostrarMensaje(
            "Nombre inválido",
            "El nombre debe tener al menos 3 caracteres.",
            "warning"
        );
        nombre.focus();
        return;
    }

    if (identificacion.value.length !== 9) {
        mostrarMensaje(
            "Cédula inválida",
            "La cédula debe tener exactamente 9 dígitos.",
            "warning"
        );
        identificacion.focus();
        return;
    }

    if (!correo.checkValidity()) {
        mostrarMensaje(
            "Correo inválido",
            "Ingrese un correo válido.",
            "warning"
        );
        correo.focus();
        return;
    }

    if (telefono.value.length !== 8) {
        mostrarMensaje(
            "Teléfono inválido",
            "El teléfono debe tener 8 dígitos.",
            "warning"
        );
        telefono.focus();
        return;
    }

    if (direccion.value.trim() === "") {
        mostrarMensaje(
            "Dirección inválida",
            "Ingrese una dirección.",
            "warning"
        );
        direccion.focus();
        return;
    }

    if (password.value.length < 6) {
        mostrarMensaje(
            "Contraseña inválida",
            "La contraseña debe tener mínimo 6 caracteres.",
            "warning"
        );
        password.focus();
        return;
    }

    const resultado = registrarPadre({
        nombre: nombre.value.trim(),
        cedula: identificacion.value.trim(),
        correo: correo.value.trim(),
        telefono: telefono.value.trim(),
        direccion: direccion.value.trim(),
        password: password.value.trim()
    });

    if (!resultado.ok) {
        mostrarMensaje(
            "No se pudo registrar",
            resultado.mensaje,
            "error"
        );
        return;
    }

    mostrarMensaje(
        "Cuenta creada",
        "Su cuenta fue creada correctamente. Ahora puede iniciar sesión.",
        "success"
    );

    document.getElementById("registerForm").reset();

    showLogin();

});

/* =======================================
SOLO NUMEROS
========================================= */

["identificacion", "loginIdentificacion", "telefono"].forEach(id => {

    document.getElementById(id).addEventListener("input", function () {

        this.value = this.value.replace(/\D/g, "");

    });

});

/* =======================================
CONTRASEÑA
========================================= */

/* Alterna la visibilidad del texto de una contraseña.
   Parámetros:
   - inputId: id del input relacionado.
   - icon: elemento visual del ícono del ojo.
*/
function togglePassword(inputId, icon) {

    const input = document.getElementById(inputId);

    if (input.type === "password") {

        input.type = "text";

        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");

    } else {

        input.type = "password";

        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}


/* =======================================
NOTIFICACIÓN PERSONALIZADA
========================================= */

let notificationTimeout;

function mostrarMensaje(titulo, mensaje, tipo = "info") {
    const notification = document.getElementById("notification");
    const notificationTitle = document.getElementById("notificationTitle");
    const notificationMessage = document.getElementById("notificationMessage");
    const icon = notification.querySelector(".notification-icon i");

    if (!notification) {
        return;
    }

    notification.className = "notification";

    notification.classList.add(tipo);

    notificationTitle.textContent = titulo;
    notificationMessage.textContent = mensaje;

    icon.className = obtenerIconoMensaje(tipo);

    notification.classList.add("show");

    clearTimeout(notificationTimeout);

    notificationTimeout = setTimeout(function () {
        cerrarMensaje();
    }, 4000);
}

function cerrarMensaje() {
    const notification = document.getElementById("notification");

    if (!notification) {
        return;
    }

    notification.classList.remove("show");
}

function obtenerIconoMensaje(tipo) {
    if (tipo === "success") {
        return "fa-solid fa-circle-check";
    }

    if (tipo === "error") {
        return "fa-solid fa-circle-xmark";
    }

    if (tipo === "warning") {
        return "fa-solid fa-triangle-exclamation";
    }

    return "fa-solid fa-circle-info";
}
