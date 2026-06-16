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