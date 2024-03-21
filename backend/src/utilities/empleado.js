const { mysql_exec_query } = require("../database/mysql/mysql_exec");
let _ = require('lodash');


async function obtenerEmepleado(id_empleado) {
    let query = `
        SELECT
            empleado.*,
            rol.nombre AS rol,
            unidad_jerarquizada.nombre_nuclear AS unidad_servicio,
            unidad_jerarquizada.siglas_jerarquicas,
            unidad_jerarquizada.tipo_unidad_servicio,
            municipio.nombre AS municipio,
            departamento_guate.nombre AS departamento_guate
        FROM empleado
        INNER JOIN rol ON empleado.id_rol = rol.id_rol
        INNER JOIN unidad_jerarquizada ON empleado.id_unidad_servicio = unidad_jerarquizada.id_unidad_servicio
        INNER JOIN municipio ON unidad_jerarquizada.id_municipio = municipio.id_municipio
        INNER JOIN departamento_guate ON municipio.id_departamento_guate = departamento_guate.id_departamento_guate
        WHERE id_empleado = ${id_empleado}
        LIMIT 1;
    `;
    const outcome = await mysql_exec_query(query);
    if (outcome.error) throw Error(`No se pudo obtener al empleado con id = ${id_empleado}.`);
    if (!outcome.length) return null;
    const [empleado] = outcome;
    return empleado;
}


async function obtenerUltimaTarjeta(id_empleado) {
    query = `
        SELECT 
            tarjeta_responsabilidad.*
        FROM empleado
        INNER JOIN tarjeta_responsabilidad USING(id_empleado)
        WHERE (
            id_empleado = ${id_empleado} AND
            tarjeta_responsabilidad.fecha = (
                SELECT MAX(tarjeta_responsabilidad.fecha)
                FROM empleado
                INNER JOIN tarjeta_responsabilidad USING(id_empleado)
                WHERE (
                    id_empleado = ${id_empleado}
                )
            )
        )
        LIMIT 1;
    `;
    const outcome = await mysql_exec_query(query);
    if (outcome.error) throw Error('No se pudo obtener la ultima tarjeta del empleado.');
    if (outcome.length) {
        const [ultimaTarjeta] = outcome;
        return ultimaTarjeta;
    }
    return null;
}

module.exports = {
    obtenerEmepleado,
    obtenerUltimaTarjeta
}