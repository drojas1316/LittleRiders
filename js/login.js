const login = document.getElementById("login");
const register = document.getElementById("register");
const indicator = document.getElementById("indicator");
const tabs = document.querySelectorAll(".tab");

function showLogin(){
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

function showRegister(){
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

document.addEventListener("DOMContentLoaded", function() {

    const header = document.querySelector("header");

    if (!header) {
        return;
    }

    let ultimaPosicionScroll = window.scrollY;

    setTimeout(function() {
        header.classList.add("header-visible");
    }, 200);

    window.addEventListener("scroll", function() {

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
LOGIN
========================================= */

document.getElementById("loginForm").addEventListener("submit", function(e){

    e.preventDefault();

    const identificacion =
        document.getElementById("loginIdentificacion");

    const password =
        document.getElementById("loginPassword");

    if(identificacion.value.length !== 9){

        alert("La identificación debe tener exactamente 9 dígitos");
        identificacion.focus();
        return;
    }

    if(password.value.length < 6){

        alert("La contraseña debe tener mínimo 6 caracteres");
        password.focus();
        return;
    }

    window.location.href = "principal.html";

});

/* =======================================
REGISTRO
========================================= */

document.getElementById("registerForm").addEventListener("submit", function(e){

    e.preventDefault();

    const nombre =
        document.getElementById("nombre");

    const identificacion =
        document.getElementById("identificacion");

    const correo =
        document.getElementById("correo");

    const telefono =
        document.getElementById("telefono");

    const direccion =
        document.getElementById("direccion");

    const password =
        document.getElementById("password");

    if(nombre.value.trim().length < 3){

        alert("Ingrese un nombre válido");
        nombre.focus();
        return;
    }

    if(identificacion.value.length !== 9){

        alert("La identificación debe tener exactamente 9 dígitos");
        identificacion.focus();
        return;
    }

    if(!correo.checkValidity()){

        alert("Ingrese un correo válido");
        correo.focus();
        return;
    }

    if(telefono.value.length < 8){

        alert("El teléfono debe tener 8 dígitos");
        telefono.focus();
        return;
    }

    if(direccion.value.trim() === ""){

        alert("Ingrese una dirección");
        direccion.focus();
        return;
    }

    if(password.value.length < 6){

        alert("La contraseña debe tener mínimo 6 caracteres");
        password.focus();
        return;
    }

    window.location.href = "principal.html";

});

/* =======================================
SOLO NUMEROS
========================================= */

["identificacion", "loginIdentificacion", "telefono"].forEach(id => {

    document.getElementById(id).addEventListener("input", function() {

        this.value = this.value.replace(/\D/g, "");

    });

});

/* =======================================
CONTRASEÑA
========================================= */

function togglePassword(inputId, icon){

    const input = document.getElementById(inputId);

    if(input.type === "password"){

        input.type = "text";

        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");

    }else{

        input.type = "password";

        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

