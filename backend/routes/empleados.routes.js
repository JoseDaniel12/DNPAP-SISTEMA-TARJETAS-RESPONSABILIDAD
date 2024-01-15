const express = require('express');
const _ = require('lodash');
const HTTPResponseBody  = require('./HTTPResponseBody');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const { obtenerUltimaTarjeta } = require('../utilities/empleado');
const { 
    colocarRegistro, crearTarjeta,
    getDescripcionRegistro, getNoLineas, formatearDescripcionBien,
    generarRegistrosDesvinculados
} = require('../utilities/tarjetas');
const { determinarTarjetasRequeridas } = require('../utilities/tarjetas');

const router = express.Router();


router.get('/lista-empleados', async (req, res,) => {
    const empleados = await mysql_exec_query('SELECT * FROM empleado');
    return res.status(200).json({empleados});
});


router.get('/obtener-tarjetas/:id_empleado', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_empleado } = req.params;
        const tarjetas = await mysql_exec_query(`
            SELECT * FROM tarjeta_responsabilidad
            WHERE id_empleado = ${id_empleado}
            ORDER BY tarjeta_responsabilidad.fecha DESC;
        `);

        // Agregar los registros de cada tarjeta
        for (const tarjeta of tarjetas) {
            const registros = await mysql_exec_query(`
                SELECT *
                FROM tarjeta_responsabilidad
                INNER JOIN registro USING(id_tarjeta_responsabilidad)
                WHERE registro.id_tarjeta_responsabilidad = ${tarjeta.id_tarjeta_responsabilidad}
                ORDER BY registro.fecha;
            `);

            let saldo = 0;
            registros.map(registro => {
                if (registro.ingreso) {
                    registro.debe = parseFloat(registro.precio); 
                    saldo += parseFloat(registro.precio);
                } else {
                    registro.haber = parseFloat(registro.precio);
                    saldo -= parseFloat(registro.precio);
                }
                registro.saldo = saldo;
            });
            tarjeta.registros = registros;
            
        }

        // Indexar las tarjetas por su numero
        const tarjetasPorNumero = _.keyBy(tarjetas, 'numero');
        respBody.setData(tarjetasPorNumero);



        res.status(200).send(respBody.getLiteralObject());
    } catch(error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


const gestionarVinculacionBienes = async (id_empleado, idsBienes, numerosTarjetas, action) => {
    // Obtener el empleado al cual se le dueño que recibira los bienes
    const [empleado] = await mysql_exec_query(`
        SELECT
            empleado.*,
            unidad_servicio.nombre_nuclear AS unidad_servicio_nuclear,
            municipio.nombre AS municipio,
            departamento_guate.nombre AS departamento_guate
        FROM empleado
        INNER JOIN unidad_servicio ON empleado.id_unidad_servicio = unidad_servicio.id_unidad_servicio
        INNER JOIN municipio ON unidad_servicio.id_municipio = municipio.id_municipio
        INNER JOIN departamento_guate ON municipio.id_departamento_guate = departamento_guate.id_departamento_guate
        WHERE id_empleado = ${id_empleado}
        LIMIT 1;
    `);

    // Obtener ultima tarjeta del empleado
    let ultimaTarjeta = await obtenerUltimaTarjeta(id_empleado);
    if (!ultimaTarjeta) {
        const numeroTarjeta = numerosTarjetas.shift();
        ultimaTarjeta = await crearTarjeta(empleado, numeroTarjeta, 0);
    }

    const registros = await generarRegistrosDesvinculados(idsBienes);

    // Para cada registro se determina en que tarjeta y lado debe ir y se vincula a las tarjetas relacionadas
    for (const registro of registros) {
	    // Por defecto se inteara colocar en el anverso
		if (registro.lineas > ultimaTarjeta.lineas_restantes_anverso) {
            // Si no cabe en el lado anverso, verificar si cabe en el lado reverso
			if (registro.lineas <= ultimaTarjeta.lineas_restantes_reverso) {
				// Se coloca en el lado reverso, esto deshabilitará el lado anverso al colocarse
                registro.anverso = false;
			} else {
				// Si no cabe en el lado reverso, se crea una nueva tarjeta para colocar el bien
                const numeroTarjeta = numerosTarjetas.shift();
                ultimaTarjeta = await crearTarjeta(empleado, numeroTarjeta, ultimaTarjeta.saldo);
			}
        }

        // Se vinculan las tarjetas relacionadas al registro y se establece como un ingreso o egreso
        registro.id_tarjeta_responsabilidad = ultimaTarjeta.id_tarjeta_responsabilidad;
        switch (action.type) {
            case 'Asignación':
                registro.ingreso = true;
                registro.id_tarjeta_receptora = ultimaTarjeta.id_tarjeta_responsabilidad;
                break;
            case 'Taspaso':
                registro.ingreso = registro.id_tarjeta_responsabilidad !== action.payload.id_tarjeta_emisora;
                registro.id_tarjeta_emisora = action.payload.id_tarjeta_emisora;
                registro.id_tarjeta_receptora = ultimaTarjeta.id_tarjeta_responsabilidad;
                break;
            case 'Desasignación':
                registro.ingreso = false;
                registro.id_tarjeta_emisora = ultimaTarjeta.id_tarjeta_responsabilidad;
                break;
        }

        // Una vez completa la información del registro se coloca en la tarjeta correspondiente
        await colocarRegistro(ultimaTarjeta, registro);
	}
}


router.post('/asignar-bienes', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_empleado, idsBienes, numerosTarjetas } = req.body;
        const action = { type: 'Asignación' }
        gestionarVinculacionBienes(id_empleado, idsBienes, numerosTarjetas, action);
        respBody.setMessage('Bienes asignados correctamente');
        res.send(respBody.getLiteralObject());
    } catch(error) {
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.post('/traspasar-bienes', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { 
            idEmpleadoEmisor,
            id_tarjeta_emisora,
            idEmpleadoReceptor,
            idsBienes,
            numerosTarjetaEmisor,
            numerosTarjetaReceptor
        } = req.body;

        const action = {
            type: 'Taspaso',
            payload: {
                id_tarjeta_emisora,
            }
        }
        // Se descargan los bienes del emisor
        await gestionarVinculacionBienes(idEmpleadoEmisor, idsBienes, numerosTarjetaEmisor, action);
        // Se cargan los bienes al receptor 
        await gestionarVinculacionBienes(idEmpleadoReceptor, idsBienes, numerosTarjetaReceptor, action);

        respBody.setMessage('Bienes traspasados correctamente');
        res.send(respBody.getLiteralObject());
    } catch(error) {
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});

module.exports = router;