const { mysql_exec_query } = require("../database/mysql/mysql_exec");
let _ = require('lodash');


async function obtenerEmepleado(id_empleado) {
    let query = `
        SELECT *
        FROM empleado
        WHERE id_empleado = ${id_empleado}
        LIMIT 1;
    `;
    const outcome = await mysql_exec_query(query);
    if (outcome.length) {
        const [empleado] = outcome;
        return empleado;
    }
    return null;
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
    if (outcome.length) {
        const [ultimaTarjeta] = outcome;
        return ultimaTarjeta;
    }
    return null;
}

module.exports = {
    obtenerUltimaTarjeta
}