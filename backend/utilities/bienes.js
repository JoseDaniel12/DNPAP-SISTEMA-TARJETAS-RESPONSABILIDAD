const { mysql_exec_query } = require("../database/mysql/mysql_exec");


async function encontrarModelo(descripcion, precio, marca, codigo) {
    let query = `
        SELECT * from modelo
        WHERE (
            descripcion = '${descripcion}' AND
            precio = '${precio}' AND
            marca = '${marca}' AND
            codigo = '${codigo}'
        )
        LIMIT 1;
    `;

    let [modelo] = await mysql_exec_query(query);
    if (modelo) return modelo;
    return null;
}


async function crearModelo(descripcion, precio, marca, codigo) {
    let modelo = await encontrarModelo(descripcion, precio, marca, codigo);
    if (modelo) return modelo;

    let query = `
        INSERT INTO modelo (descripcion, precio, marca, codigo)
        VALUES ('${descripcion}', ${precio}, '${marca}', '${codigo}');
    `;
    let { insertId: id_modelo } = await mysql_exec_query(query);

    // Recuperar el modelo creado
    query = `
        SELECT * from modelo
        WHERE id_modelo = ${id_modelo}
        LIMIT 1;
    `;
    ([modelo] = await mysql_exec_query(query));
    if (!modelo) return null;
    return modelo;
}

module.exports = {
    encontrarModelo,
    crearModelo
}