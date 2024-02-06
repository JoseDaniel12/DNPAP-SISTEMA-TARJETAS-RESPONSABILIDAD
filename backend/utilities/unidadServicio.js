const { mysql_exec_query } = require('../database/mysql/mysql_exec');

async function obtenerNombreJerarquico(id_unidad_servicio) {
    let nombreJerarquico = '';
    while (id_unidad_servicio !== null) {
        let query = `
            SELECT * FROM unidad_servicio
            WHERE id_unidad_servicio = ${id_unidad_servicio};
        `;
        const [unidadServicio] = await mysql_exec_query(query);
        nombreJerarquico += '/';
        for (const caracter of unidadServicio.nombre_nuclear) {
            if (caracter === caracter.toUpperCase() && caracter !== caracter.toLowerCase()) {
                nombreJerarquico += caracter;
            }
        }
        id_unidad_servicio = unidadServicio.id_unidad_superior;
    }
    if (nombreJerarquico.charAt(0) === '/') nombreJerarquico = nombreJerarquico.slice(1);
    return nombreJerarquico;
}

module.exports = {
    obtenerNombreJerarquico
}