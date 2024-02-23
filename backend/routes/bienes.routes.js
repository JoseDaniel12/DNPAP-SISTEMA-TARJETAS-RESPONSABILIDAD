const express = require('express');
const HTTPResponseBody  = require('./HTTPResponseBody'); 
const conn = require('../database/mysql/mysql_conn');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const { format } = require('date-fns');
const router = express.Router();

router.post('/registro-bienes-comunes', async (req, res) => {
    const respBody = new HTTPResponseBody();
    conn.beginTransaction();
    try {
        let {
            descripcion,
            precio,
            marca,
            codigoModelo,
            fecha_registro,
            datos_espeficos_bienes,
        } = req.body;
    
        bienes = datos_espeficos_bienes.map(bien => ({
            descripcion,
            precio,
            marca,
            codigoModelo,
            fecha_registro,
            ...bien,
        }));
    
        // Se verifica si el modelo ya existe o si se debe crear uno nuevo
        let query = `
            SELECT * from modelo
            WHERE (
                descripcion = '${descripcion}' AND
                precio = '${precio}' AND
                marca = '${marca}' AND
                codigo = '${codigoModelo}'
            )
            LIMIT 1;
        `;
        let [modelo] = await mysql_exec_query(query);
        let idModelo = modelo?.id_modelo;
        if (!idModelo) {
            let { insertId } = await mysql_exec_query(`
                INSERT INTO modelo (descripcion, precio, marca, codigo)
                VALUES ('${descripcion}', ${precio}, '${marca}', '${codigoModelo}');
            `);
            idModelo = insertId;
        } 
    
        // Se registran los bienes en el modelo creado o enctrado
        for (const bien of bienes) {
            let result = await mysql_exec_query(`
                INSERT INTO bien (
                    sicoin,
                    no_serie,
                    no_inventario, 
                    fecha_registro,
                    id_modelo
                )
                VALUES (
                    '${bien.sicoin}',
                    '${bien.noSerie}', 
                    '${bien.noInventario}',
                    '${format(bien.fecha_registro, 'yyyy-MM-dd')}',
                    '${idModelo}'
                );
            `);
            if (result.error) throw new Error(result.error.message);
        }
        conn.commit();
        respBody.setMessage('Bienes registrados correctamente.');
        respBody.setData({bienes});
        return res.status(200).json(respBody.getLiteralObject());
    } catch (error) {
        conn.rollback();
        respBody.setError(error.toString());
        return res.status(500).json(respBody.getLiteralObject());
    } 
});


router.post('/verificar-disponibilidad-sicoin', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { sicoin } = req.body;
        let query = `SELECT * FROM bien WHERE sicoin = '${sicoin}'`;
        const outcome = await mysql_exec_query(query);
        if (outcome.length > 0) {
            respBody.setData({disponibilidad: false});
            respBody.setError('Ya existe un bien con el sicoin ingresado.');
            return res.send(respBody.getLiteralObject());
        }
        respBody.setData({disponibilidad: true});
        return res.send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});


router.post('/verificar-disponibilidad-noSerie', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { noSerie } = req.body;
        let query = `SELECT * FROM bien WHERE no_serie = '${noSerie}'`;
        const outcome = await mysql_exec_query(query);
        if (outcome.length > 0) {
            respBody.setData({disponibilidad: false});
            respBody.setError('Ya existe un bien con el número de serie ingresado.');
            return res.send(respBody.getLiteralObject());
        }
        respBody.setData({disponibilidad: true});
        return res.send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});


router.get('/bienes-sin-asignar', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const query = `
            SELECT * FROM bien
            INNER JOIN modelo USING(id_modelo)
            LEFT OUTER JOIN tarjeta_responsabilidad USING(id_tarjeta_responsabilidad)
            WHERE bien.id_tarjeta_responsabilidad IS NULL;
        `;
        const bienesSinAsignar = await mysql_exec_query(query);
        respBody.setData({bienesSinAsignar});
        res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});


router.post('/crear-kit', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { precio, idsBienes, idBienRaiz } = req.body;
        // Se crea el kit
        let query = `
            INSERT INTO kit (precio)
            VALUES (${precio});
        `;
        const { insertId: id_kit } = await mysql_exec_query(query);

        // se agregan los bienes al kit
        query = `
            UPDATE bien
            SET id_kit = ${id_kit}
            WHERE id_bien IN (${idsBienes.join(',')});
        `;
        await mysql_exec_query(query);

        // Se configura el bien raiz (el que tentra el precio del kit)
        query = `
            UPDATE bien
            SET es_raiz_kit = TRUE
            WHERE id_bien = ${idBienRaiz};
        `;
        await mysql_exec_query(query);

        respBody.setData('Bienes asignados correctamente.');
        res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});


router.put('/acutalizar-kit', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_kit, idBiens, idBienRaiz } = req.body;
        // Se desvinculan los bienes anteriores del kit
        let query = `
            UPDATE bien
            SET id_kit = NULL, es_raiz_kit = FALSE
            WHERE id_kit = ${id_kit};
        `;

        // se vinculan los nuevos bienes al kit
        query = `
            UPDATE bien
            SET id_kit = ${id_kit}
            WHERE id_bien IN (${idsBienes.join(',')});
        `;
        await mysql_exec_query(query);

        // Se configura el bien raiz (el que tentra el precio del kit)
        query = `
            UPDATE bien
            SET es_raiz_kit = TRUE
            WHERE id_bien = ${idBienRaiz};
        `;
        await mysql_exec_query(query);

        respBody.setData('Bienes asignados correctamente.');
        res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});


module.exports = router;