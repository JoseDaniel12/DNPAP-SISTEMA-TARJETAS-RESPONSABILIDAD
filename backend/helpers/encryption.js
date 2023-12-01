const bcrypt = require("bcryptjs");

function encriptar(dato) {
    return bcrypt.hashSync(dato, 10);
}


function validar_dato_encriptado(dato_sin_encriptar, dato_encriptado) {
    return bcrypt.compareSync(dato_sin_encriptar, dato_encriptado);
}

module.exports = {
    encriptar,
    validar_dato_encriptado
};
