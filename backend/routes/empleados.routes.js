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


router.get('/obtener-bienes/:id_empleado', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_empleado } = req.params;
        // let query = `
        //     SELECT bien.*
        //     FROM empleado
        //     INNER JOIN tarjeta_responsabilidad USING(id_empleado)
        //     INNER JOIN bien USING(id_tarjeta_responsabilidad)
        //     WHERE empleado.id_empleado = ${id_empleado};       
        // `;
        let query = `
            SELECT *
            FROM bien_activo
            INNER JOIN bien USING(id_bien)
            INNER JOIN modelo USING(id_modelo)
            WHERE bien_activo.id_empleado = ${id_empleado};
        `;
        const bienes = await mysql_exec_query(query);
        respBody.setData(bienes);
        res.status(200).send(respBody.getLiteralObject());
    } catch(error) {
        console.log(error)
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


const ejecutarAccionTarjeta = async (id_empleado, registros, numerosTarjetas, action) => {
    // Obtener el empleado al cual se le cargaran los registros
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

    // Obtener la ultima tarjeta del empleado
    let ultimaTarjeta = await obtenerUltimaTarjeta(id_empleado);
    if (!ultimaTarjeta) {
        const numeroTarjeta = numerosTarjetas.shift();
        ultimaTarjeta = await crearTarjeta(empleado, numeroTarjeta, 0);
    }

    // Para cada registro se determina en que tarjeta y lado debe ir y se establece su
    // tarjeta emisora y receptora
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

        // Una vez completa la información del registro se coloca en la tarjeta correspondiente
        await colocarRegistro(ultimaTarjeta, registro, action);
	}
}


router.post('/asignar-bienes', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_empleado, idsBienes, numerosTarjetas } = req.body;
        const action = { type: 'Asignación' }
        const registros = await generarRegistrosDesvinculados(idsBienes, action);
        ejecutarAccionTarjeta(id_empleado, registros, numerosTarjetas, action);
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
            idEmpleadoReceptor,
            idsBienes,
            numerosTarjetaEmisor,
            numerosTarjetaReceptor
        } = req.body;


        // obtener el id de la tarjeta que contiene cada bien
        const bienesConTarjeta = await Promise.all(idsBienes.map(async id_bien =>  {
            let query = `
                SELECT * FROM bien_activo
                WHERE id_bien = ${id_bien};
            `;
            const [bien] = await mysql_exec_query(query);
            return bien;
        }));


        const biensPorTarjeta = _.groupBy(bienesConTarjeta, 'id_tarjeta_responsabilidad');
        for (let tarjeta in biensPorTarjeta) {
            const actionTraspasoEmisor = {
                type: 'Traspaso',
                payload: {
                    id_tarjeta_emisora: tarjeta,
                    esRecepcion: false
                }
            };
    
            const actionTraspasoRecepetor = {
                type: 'Traspaso',
                payload: {
                    id_tarjeta_emisora: tarjeta,
                    esRecepcion: true
                }
            };
            const idsBienes = biensPorTarjeta[tarjeta].map(bien => bien.id_bien);
            const registrosEmisor = await generarRegistrosDesvinculados(idsBienes, actionTraspasoEmisor, actionTraspasoEmisor);
            const registrosReceptor = await generarRegistrosDesvinculados(idsBienes, actionTraspasoRecepetor, actionTraspasoRecepetor);
    
            // Se cargan los bienes al receptor, aqui se establece la tarjeta receptora de los registros
            await ejecutarAccionTarjeta(idEmpleadoReceptor, registrosReceptor, numerosTarjetaReceptor, actionTraspasoRecepetor);
            // Se descargan los bienes del emisor
            for (let i = 0; i < registrosEmisor.length; i++) {
                let regEmisor = registrosEmisor[i];
                let regReceptor = registrosReceptor[i];
                regEmisor.id_tarjeta_emisora = regReceptor.id_tarjeta_emisora;
                regEmisor.id_tarjeta_receptora = regReceptor.id_tarjeta_receptora;
            }
            await ejecutarAccionTarjeta(idEmpleadoEmisor, registrosEmisor, numerosTarjetaEmisor, actionTraspasoEmisor);
        }

        respBody.setMessage('Bienes traspasados correctamente');
        res.send(respBody.getLiteralObject());
    } catch(error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.post('/desasignar-bienes', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_empleado, idsBienes, numerosTarjetas } = req.body;
        const action = { type: 'Desasignación' }
        const registros = await generarRegistrosDesvinculados(idsBienes, action);
        ejecutarAccionTarjeta(id_empleado, registros, numerosTarjetas, action);
        respBody.setMessage('Bienes desasignados correctamente');
        res.send(respBody.getLiteralObject());
    } catch(error) {
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


module.exports = router;