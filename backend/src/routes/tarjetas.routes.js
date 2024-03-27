const express = require('express');
const _ = require('lodash');
const accionesTarjeta = require('../types/accionesTarjeta');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const { 
    determinarTarjetasRequeridas, 
    obtenerTarjeta, generarPDF, generarExcel, getNoLineas,
    formatearDescripcionBien, getDescripcionRegistro
} = require('../utilities/tarjetas');
const HTTPResponseBody  = require('./HTTPResponseBody');

const router = express.Router();

router.get('/registros-tarjeta/:id_tarjeta_responsabilidad', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const id_tarjeta_responsabilidad = parseInt(req.params.id_tarjeta_responsabilidad);
        const tarjeta = await obtenerTarjeta(id_tarjeta_responsabilidad, true);
        const registros = tarjeta.registros;
        let saldoAcumulado = tarjeta.saldo_que_viene;
        registros.map(registro => {
            if (registro.es_nota) return registro;
            if (registro.ingreso) {
                registro.debe = registro.precio;
                saldoAcumulado += registro.precio;
            } else {
                registro.haber = registro.precio;
                saldoAcumulado -= registro.precio;
            }
            registro.saldo = saldoAcumulado;
            return registro;
        });
        respBody.setData(registros);
        res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});

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
        const { id_empleado, operacion, comentario, idsBienes } = req.body;

        if (operacion === accionesTarjeta.COMENTACION) {
            const lineasRequeridas = getNoLineas(formatearDescripcionBien(comentario));
            const cantTarjetas = await determinarTarjetasRequeridas(id_empleado, [lineasRequeridas]);
            respBody.setData(cantTarjetas);
            return res.status(200).send(respBody.getLiteralObject());
        } 

        if (!idsBienes.length) {
            respBody.setData(0);
            return res.status(200).send(respBody.getLiteralObject());
        }

        // Obtener la información de los bienes a los cuales se crearan los registros en las tarjetas
        let query = `
            SELECT *
            FROM bien
            INNER JOIN modelo USING(id_modelo)
            WHERE (
                bien.id_bien IN (${idsBienes.join(',')})
            )
        `;
        const bienes = await mysql_exec_query(query);

        // Agrupar los bienes por modelo para obtener los registros que se crearan en las tarjetas
        const binesPorModelo = _.groupBy(bienes, 'id_modelo');
        const registros = Object.values(binesPorModelo).map(bienes => {
            return getNoLineas(formatearDescripcionBien(getDescripcionRegistro(bienes)));
        });

        const cantTarjetas = await determinarTarjetasRequeridas(id_empleado, registros);
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


router.get('/generar-excel-tarjeta/:id_tarjeta_responsabilidad', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        let { id_tarjeta_responsabilidad } = req.params;
        const tarjeta = await obtenerTarjeta(id_tarjeta_responsabilidad, true);
        const excel = await generarExcel(tarjeta);
        const blob = await excel.outputAsync();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${tarjeta.numero}.xlsx`);
        res.send(blob);
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});


router.post('/numero-disponible', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_tarjeta_responsabilidad } = req.body;
        let query = `
            SELECT tarjeta_responsabilidad.numero FROM tarjeta_responsabilidad
            WHERE tarjeta_responsabilidad.numero = '${id_tarjeta_responsabilidad}';
        `;
        const tarjetas = await mysql_exec_query(query);
        respBody.setData(tarjetas.length === 0);
        return res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});


router.put('/cambiar-numero/:id_tarjeta_responsabilidad', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const id_tarjeta_responsabilidad = parseInt(req.params.id_tarjeta_responsabilidad);
        const { nuevoNumero } = req.body;

        const tarjeta = await obtenerTarjeta(id_tarjeta_responsabilidad);

        // Se acutaliza el numero de la tarjeta
        let query = `
            UPDATE tarjeta_responsabilidad
            SET numero = '${nuevoNumero}'
            WHERE id_tarjeta_responsabilidad = ${id_tarjeta_responsabilidad};
        `;
        await mysql_exec_query(query);

        // Se actualiza la descripción de todos aquellos registros en los que se referenciaba
        // al numero de tarjeta
        query = `
            UPDATE registro
            SET descripcion = REPLACE(descripcion, 'No. ${tarjeta.numero}', 'No. ${nuevoNumero}')
        `;
        await mysql_exec_query(query);

        // De igual forma se actualizan todos los logs de la bitacora de actividades con referencia al numero de tarjeta
        query = `
            UPDATE log_actividad
            SET no_tarjeta = REPLACE(no_tarjeta, '${tarjeta.numero}', '${nuevoNumero}')
            WHERE no_tarjeta = '${tarjeta.numero}';
        `;
        await mysql_exec_query(query);

        respBody.setMessage('Numero de tarjeta actualizado correctamente.');
        return res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});

module.exports = router;