const express = require('express');
const url = require('url');
const querystring = require('querystring');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const { determinarTarjetasRequeridas, obtenerTarjeta, generarPDF } = require('../utilities/tarjetas');
const HTTPResponseBody  = require('./HTTPResponseBody');
const fs = require('fs');

const router = express.Router();

router.get('/bienes-activos-tarjeta/:id_tarjeta_responsabilidad', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_tarjeta_responsabilidad } = req.params;
        let query = `
            # Bienes que tiene un empleado y que estan activos en una tarjeta determinada
            SELECT
                bienes_empleado.id_bien,
                bienes_empleado.sicoin,
                bienes_empleado.no_serie,
                bienes_empleado.no_inventario,
                bienes_empleado.fecha_registro,
                bienes_empleado.id_modelo,
                bienes_empleado.id_kit
            FROM (
                # Bienes activos de empleados
                SELECT
                    empleado.id_empleado,
                    bien.*,
                    (
                        SUM(CASE WHEN ingreso = true THEN 1 ELSE 0 END) -
                        SUM(CASE WHEN ingreso = false THEN 1 ELSE 0 END)
                    ) AS disponible
                FROM empleado
                INNER JOIN tarjeta_responsabilidad ON empleado.id_empleado = tarjeta_responsabilidad.id_empleado
                INNER JOIN registro ON tarjeta_responsabilidad.id_tarjeta_responsabilidad = registro.id_tarjeta_responsabilidad
                INNER JOIN registro_bien ON registro.id_registro = registro_bien.id_registro
                INNER JOIN bien ON registro_bien.id_bien = bien.id_bien
                GROUP BY empleado.id_empleado, bien.id_bien
                HAVING disponible = true
            ) AS bienes_empleado
            INNER JOIN tarjeta_responsabilidad USING(id_empleado)
            WHERE tarjeta_responsabilidad.id_tarjeta_responsabilidad = ${id_tarjeta_responsabilidad};
        `;
        const bienes = await mysql_exec_query(query);
        respBody.setData(bienes);
        return res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.post('/calcular-numero-tarjetas-necesarias', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_empleado, idsBienes, operacion } = req.body;
        const cantTarjetas = await determinarTarjetasRequeridas(id_empleado, idsBienes, operacion);
        respBody.setData(cantTarjetas);
        return res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});

router.get('/generar-pdf-tarjeta/:id_tarjeta_responsabilidad/:fecha', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        let {id_tarjeta_responsabilidad,  fecha } = req.params;
        fecha = (fecha == 'null')? null : new Date(fecha);
        const tarjeta = await obtenerTarjeta(id_tarjeta_responsabilidad, true);
        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=${tarjeta.numero}.pdf`
        });
        generarPDF(
            tarjeta,
            fecha,
            data => stream.write(data),
            () => stream.end()
        );
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});

module.exports = router;