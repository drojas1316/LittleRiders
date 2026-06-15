const login = document.getElementById("login");
const register = document.getElementById("register");

const tabs = document.querySelectorAll(".tab");

function showLogin(){

    login.style.display = "block";
    register.style.display = "none";

    tabs[0].classList.add("active");
    tabs[1].classList.remove("active");
}

function showRegister(){

    login.style.display = "none";
    register.style.display = "block";

    tabs[1].classList.add("active");
    tabs[0].classList.remove("active");
}