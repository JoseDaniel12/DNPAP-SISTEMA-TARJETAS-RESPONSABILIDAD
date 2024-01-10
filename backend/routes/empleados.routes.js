const express = require('express');
const _ = require('lodash');
const HTTPResponseBody  = require('./HTTPResponseBody');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const { obtenerUltimaTarjeta } = require('../utilities/empleado');
const { colocarRegistro, crearTarjeta, getDescripcionRegistro, getNoLineas } = require('../utilities/tarjetas');

const router = express.Router();


router.get('/lista-empleados', async (req, res,) => {
    const empleados = await mysql_exec_query('SELECT * FROM empleado');
    return res.status(200).json({empleados});
});


const asingarBienes = async (id_empleado, idsBienes, numerosTarjetas) => {
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


    // Obtener los la información de los bienes a los que se les crearan registros
    let query = `
        SELECT *
        FROM bien
        INNER JOIN modelo USING(id_modelo)
        WHERE (
            bien.id_bien IN (${idsBienes.join(',')})
        )
    `;
    const bienes = await mysql_exec_query(query);

    // Agrupar los bienes por modelo para luego crear los registros
    const biensPorModelo = _.groupBy(bienes, 'id_modelo');

    // Obtener ultima tarjeta del empleado
    let ultimaTarjeta = await obtenerUltimaTarjeta(id_empleado);
    if (!ultimaTarjeta) {
        const numeroTarjeta = numerosTarjetas.shift();
        ultimaTarjeta = await crearTarjeta(empleado, numeroTarjeta, 0);
    }

    // Se genera los registros con algunos de sus datos
    const registros = Object.values(biensPorModelo).map(bienes => {
        const descripcionRegistro = getDescripcionRegistro(bienes);
        return {
            descripcion: descripcionRegistro,
            anverso: true,
            lineas: getNoLineas(descripcionRegistro),
            precio: bienes.reduce((precio, bien) => precio + parseFloat(bien.precio), 0),
            cantidad: bienes.length,
            id_tarjeta_emisora: ultimaTarjeta.id_tarjeta_responsabilidad,
            id_tarjeta_receptora: ultimaTarjeta.id_tarjeta_responsabilidad,
            bienes
        };
    });

    // Para cada registro se determina en que tarjeta debe ir
    for (const registro of registros) {
	    // Verificar si el registro cabe en el lado anverso
		if (registro.lineas <= ultimaTarjeta.lineas_restantes_anverso) {
            await colocarRegistro(ultimaTarjeta, registro);
		} else {
            // Si no cabe en el lado anverso, verificar si cabe en el lado reverso
			if (registro.lineas <= ultimaTarjeta.lineas_restantes_reverso) {
				// Se coloca en el lado reverso, esto deshabilitará el lado anverso
                registro.anverso = false;
                await colocarRegistro(ultimaTarjeta, registro);
			} else {
				// Si no cabe en el lado reverso, se crea una nueva tarjeta
                const numeroTarjeta = numerosTarjetas.shift();
                ultimaTarjeta = await crearTarjeta(empleado, numeroTarjeta, ultimaTarjeta.saldo);
				// Se coloca el bien en el lado anverso de la nueva tarjeta
                await colocarRegistro(ultimaTarjeta, registro);
			}
        }
	}
}


router.post('/asignar-bienes', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_empleado, idsBienes, numerosTarjetas } = req.body;
        asingarBienes(id_empleado, idsBienes, numerosTarjetas);
        respBody.setMessage('Bienes asignados correctamente');
        res.send(respBody.getLiteralObject());
    } catch(error) {
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
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

module.exports = router;