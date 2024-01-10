const express = require('express');
const url = require('url');
const querystring = require('querystring');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const { determinarTarjetasRequeridas, obtenerTarjeta, generarPDF } = require('../utilities/tarjetas');
const HTTPResponseBody  = require('./HTTPResponseBody');
const fs = require('fs');

const router = express.Router();

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