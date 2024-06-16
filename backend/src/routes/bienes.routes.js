const express = require('express');
const HTTPResponseBody  = require('./HTTPResponseBody');
const { getMysqlConnection } = require('../database/mysql/mysql_conn');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const { format } = require('date-fns');
const { crearModelo, encontrarModelo } = require('../utilities/bienes');
const router = express.Router();


router.get('/', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        let query = `
            SELECT 
                bien.*,
                modelo.*,
                empleado.id_empleado
            FROM bien
            INNER JOIN modelo USING (id_modelo)
            LEFT JOIN tarjeta_responsabilidad USING (id_tarjeta_responsabilidad)
            LEFT JOIN empleado USING (id_empleado)
        `;
        const bienes = await mysql_exec_query(query);
        respBody.setData(bienes);
        res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.post('/verificar-disponibilidad-sicoin', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { sicoin } = req.body;
        let query = `SELECT * FROM bien WHERE sicoin = '${sicoin}'`;
        const outcome = await mysql_exec_query(query);
        if (outcome.length > 0) {
            respBody.setData(false);
            respBody.setMessage('Ya existe un bien con el sicoin ingresado.');
            return res.send(respBody.getLiteralObject());
        }
        respBody.setData(true);
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
            respBody.setData(false);
            respBody.setMessage('Ya existe un bien con el número de serie ingresado.');
            return res.send(respBody.getLiteralObject());
        }
        respBody.setData(true);
        return res.send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});


router.post('/registro-bienes-comunes', async (req, res) => {
    const respBody = new HTTPResponseBody();
    const conn = await getMysqlConnection();
    conn.beginTransaction();
    try {
        let { bienes } = req.body;
    
        // Se registran los bienes en el modelo al que pertenecen
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
                    '${bien.no_serie}', 
                    '${bien.no_inventario}',
                    '${format(new Date(), 'yyyy-MM-dd')}',
                    '${bien.id_modelo}'
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


router.get('/bien/:id_bien', async (req, res) => {
    const respBody = new HTTPResponseBody();
    const { id_bien } = req.params;
    try {
        const query = `
            SELECT *
            FROM bien
            INNER JOIN modelo USING (id_modelo)
            WHERE id_bien = ${id_bien};
        `;
        const outcome = await mysql_exec_query(query);
        if (!outcome.length ) return null
        const [bien] = outcome;
        respBody.setData(bien);
        res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});


router.delete('/eliminar-bien/:id_bien', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const id_bien = parseInt(req.params.id_bien);
        let query = `DELETE FROM bien WHERE id_bien = ${id_bien}`;
        await mysql_exec_query(query);
        respBody.setMessage('Bien Eliminado correctamente.');
        res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.delete('/eliminar-bienes', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { idsBienes } = req.body;
        console.log(idsBienes)
        let query = `
            DELETE FROM bien 
            WHERE id_bien IN (${idsBienes.join(',')});
        `;
        await mysql_exec_query(query);
        respBody.setMessage('Bienes Eliminados correctamente.');
        res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.put('/editar-bien/:id_bien', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const id_bien = parseInt(req.params.id_bien);
        const { sicoin, no_serie, no_inventario } = req.body;

        // Se actualizan los datos especificos del bien
        let query = `
            UPDATE bien
            SET sicoin = '${sicoin}',
                no_serie = '${no_serie}',
                no_inventario = '${no_inventario}'
            WHERE id_bien = ${id_bien};
        `;
        await mysql_exec_query(query);

        // Se obtiene el bien actualizado
        query = `
            SELECT *
            FROM bien
            INNER JOIN modelo USING (id_modelo)
            WHERE id_bien = ${id_bien};
        `;
        const [bien] = await mysql_exec_query(query);
        
        respBody.setMessage('Bien Editado correctamente.');
        respBody.setData(bien);
        res.status(200).send(respBody.getLiteralObject());
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
            SELECT *
            FROM bien_inactivo
            INNER JOIN bien USING (id_bien)
            INNER JOIN modelo USING (id_modelo);
        `;
        const bienesSinAsignar = await mysql_exec_query(query);
        respBody.setData(bienesSinAsignar);
        res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});


router.get('/bienes-asignados', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const query = `
            SELECT *
            FROM bien_activo
            INNER JOIN bien USING (id_bien)
            INNER JOIN modelo USING (id_modelo);
        `;
        const bienes = await mysql_exec_query(query);
        respBody.setData(bienes);
        res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});


module.exports = router;