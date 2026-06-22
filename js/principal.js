const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        menuItems.forEach(i =>
            i.classList.remove("active")
        );

        item.classList.add("active");

    });

});

document.addEventListener("DOMContentLoaded", function(){

    protegerPagina(["padre", "admin"]);

    cargarPerfilUsuario();
    activarMenuPerfil();
    activarModalCuenta();
    activarCambioFoto();

});

function cargarPerfilUsuario(){

    const usuario = obtenerUsuarioActual();

    if(!usuario){
        return;
    }

    const fotoDefault = "img/usuarios/fotoPerfil1.png";

    document.getElementById("nombreUsuarioHeader").textContent =
        usuario.nombre;

    document.getElementById("rolUsuarioHeader").textContent =
        usuario.rol === "admin" ? "Administrador" : "Padre de familia";

    document.getElementById("fotoPerfilHeader").src =
        usuario.foto || fotoDefault;

    document.getElementById("fotoPerfilModal").src =
        usuario.foto || fotoDefault;

    document.getElementById("cuentaNombre").textContent =
        usuario.nombre;

    document.getElementById("cuentaCedula").textContent =
        usuario.cedula;

    document.getElementById("cuentaCorreo").textContent =
        usuario.correo;

    document.getElementById("cuentaRol").textContent =
        usuario.rol;
}

function activarMenuPerfil(){

    const btnPerfil = document.getElementById("btnPerfil");
    const profileMenu = document.getElementById("profileMenu");

    btnPerfil.addEventListener("click", function(){
        profileMenu.classList.toggle("active");
        btnPerfil.classList.toggle("active");
    });

    document.addEventListener("click", function(e){

        if(
            !btnPerfil.contains(e.target) &&
            !profileMenu.contains(e.target)
        ){
            profileMenu.classList.remove("active");
            btnPerfil.classList.remove("active");
        }

    });
}

function activarModalCuenta(){

    const btnMiCuenta = document.getElementById("btnMiCuenta");
    const modalCuenta = document.getElementById("modalCuenta");
    const cerrarModal = document.getElementById("cerrarModal");
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");
    const btnEliminarCuenta = document.getElementById("btnEliminarCuenta");

    btnMiCuenta.addEventListener("click", function(){
        modalCuenta.classList.add("active");
    });

    cerrarModal.addEventListener("click", function(){
        modalCuenta.classList.remove("active");
    });

    btnCerrarSesion.addEventListener("click", function(){
        cerrarSesion();
    });

    btnEliminarCuenta.addEventListener("click", function(){

        const usuario = obtenerUsuarioActual();

        if(!usuario){
            return;
        }

        const confirmar = confirm(
            "¿Está seguro de que desea eliminar su cuenta?"
        );

        if(confirmar){
            eliminarCuenta(usuario.id);
        }

    });
}

function activarCambioFoto(){

    const inputFoto = document.getElementById("inputFoto");

    inputFoto.addEventListener("change", function(){

        const archivo = this.files[0];

        if(!archivo){
            return;
        }

        const lector = new FileReader();

        lector.onload = function(e){

            const nuevaFoto = e.target.result;

            const usuario = obtenerUsuarioActual();

            actualizarDato(DB_KEYS.usuarios, usuario.id, {
                foto:nuevaFoto
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