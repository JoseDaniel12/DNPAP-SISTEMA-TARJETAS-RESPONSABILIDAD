const { mysql_exec_query } = require("../database/mysql/mysql_exec");


const obtenerModeloPorId = async (id_modelo) => {
    let query = `
        SELECT * 
        FROM modelo
        WHERE id_modelo = ${id_modelo}
        LIMIT 1;
    `;
    let [modelo] = await mysql_exec_query(query);
    if (modelo) return modelo;
    return null;
}


const obtenerModelos = async () => {
    let query = `
        SELECT
        modelo.*,
        (
            SELECT COUNT(*)
            FROM bien
            WHERE bien.id_modelo = modelo.id_modelo
        ) AS cant_bienes
        FROM modelo;
    `;
    return await mysql_exec_query(query);
}

module.exports = {
    obtenerModeloPorId,
    obtenerModelos
}