/* =======================================
AUTH - AUTENTICACIÓN LITTLE RIDERS
No maneja formularios ni validaciones visuales.
========================================= */

/* Obtener sesión actual */
function obtenerSesion() {
    const sesion = localStorage.getItem(DB_KEYS.sesion);

    if (!sesion) {
        return null;
    }

    return JSON.parse(sesion);
}

/* Guardar sesión */
function guardarSesion(usuario) {
    const sesion = {
        usuarioId: usuario.id,
        nombre: usuario.nombre,
        cedula: usuario.cedula,
        correo: usuario.correo,
        rol: usuario.rol,
        fechaInicio: new Date().toISOString()
    };

    localStorage.setItem(DB_KEYS.sesion, JSON.stringify(sesion));
}

/* Iniciar sesión usando cédula y contraseña */
function iniciarSesion(cedula, password) {
    const usuarios = obtenerDatos(DB_KEYS.usuarios);

    const usuarioEncontrado = usuarios.find(function(usuario) {
        return usuario.cedula === cedula &&
               usuario.password === password &&
               usuario.estado === "activo";
    });

    if (!usuarioEncontrado) {
        return {
            ok: false,
            mensaje: "Cédula o contraseña incorrecta."
        };
    }

    if (usuarioEncontrado.rol !== "admin" && usuarioEncontrado.rol !== "padre") {
        return {
            ok: false,
            mensaje: "Este usuario no tiene acceso al sistema."
        };
    }

    guardarSesion(usuarioEncontrado);

    return {
        ok: true,
        usuario: usuarioEncontrado
    };
}

/* Registrar padre */
function registrarPadre(datosPadre) {
    const usuarios = obtenerDatos(DB_KEYS.usuarios);

    const existeCedula = usuarios.some(function(usuario) {
        return usuario.cedula === datosPadre.cedula;
    });

    if (existeCedula) {
        return {
            ok: false,
            mensaje: "Ya existe una cuenta con esa cédula."
        };
    }

    const existeCorreo = usuarios.some(function(usuario) {
        return usuario.correo.toLowerCase() === datosPadre.correo.toLowerCase();
    });

    if (existeCorreo) {
        return {
            ok: false,
            mensaje: "Ya existe una cuenta con ese correo electrónico."
        };
    }

    const nuevoUsuario = agregarDato(DB_KEYS.usuarios, {
        nombre: datosPadre.nombre,
        cedula: datosPadre.cedula,
        correo: datosPadre.correo,
        password: datosPadre.password,
        rol: "padre",
        estado: "activo"
    });

    const nuevoPadre = agregarDato(DB_KEYS.padres, {
        usuarioId: nuevoUsuario.id,
        nombre: datosPadre.nombre,
        cedula: datosPadre.cedula,
        telefono: datosPadre.telefono,
        correo: datosPadre.correo,
        direccion: datosPadre.direccion,
        estado: "activo"
    });

    return {
        ok: true,
        usuario: nuevoUsuario,
        padre: nuevoPadre,
        mensaje: "Cuenta creada correctamente."
    };
}

/* Cerrar sesión */
function cerrarSesion() {
    localStorage.removeItem(DB_KEYS.sesion);
    window.location.href = "login.html";
}

/* Proteger páginas privadas */
function protegerPagina(rolesPermitidos) {
    const sesion = obtenerSesion();

    if (!sesion) {
        window.location.href = "login.html";
        return;
    }

    if (!rolesPermitidos.includes(sesion.rol)) {
        alert("No tiene permisos para acceder a esta página.");
        window.location.href = "login.html";
    }
}

/* Eliminar cuenta de forma lógica */
function eliminarCuenta(usuarioId) {
    actualizarDato(DB_KEYS.usuarios, usuarioId, {
        estado: "inactivo"
    });

    const sesion = obtenerSesion();

    if (sesion && sesion.usuarioId === Number(usuarioId)) {
        cerrarSesion();
    }

    return {
        ok: true,
        mensaje: "Cuenta desactivada correctamente."
    };
}

/* Verificar si hay usuario conectado */
function haySesionActiva() {
    return obtenerSesion() !== null;
}

/* Obtener usuario completo desde la sesión */
function obtenerUsuarioActual() {
    const sesion = obtenerSesion();

    if (!sesion) {
        return null;
    }

    return obtenerPorId(DB_KEYS.usuarios, sesion.usuarioId);
}