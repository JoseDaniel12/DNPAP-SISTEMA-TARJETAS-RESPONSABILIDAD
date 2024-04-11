const express = require('express');
const { getMysqlConnection } = require('../database/mysql/mysql_conn');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const _ = require('lodash');
const { encriptar } = require('../helpers/encryption');
const HTTPResponseBody  = require('./HTTPResponseBody');
const { obtenerEmepleado } = require('../utilities/empleado');
const { 
    getNoLineas,
    formatearDescripcionBien,
    generarRegistrosDesvinculados
} = require('../utilities/tarjetas');
const { ejecutarAccionTarjeta } = require('../utilities/tarjetas');
const userRoles = require('../types/userRoles');
const accionesTarjeta = require('../types/accionesTarjeta');
const router = express.Router();


router.get('/verificar-disponibilidad-correo/:correo', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { correo } = req.params;
        let query = `
            SELECT * FROM empleado
            WHERE correo = '${correo}';
        `;
        const outcome = await mysql_exec_query(query);
        if (outcome.length > 0) {
            respBody.setData({disponibilidad: false});
        } else {
            respBody.setData({disponibilidad: true});
        }
        res.status(200).send(respBody.getLiteralObject());
    } catch(error) {
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.post('/registar-auxiliar', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { dpi, nombres, apellidos, correo, contrasenia, idDireccion } = req.body;
        const contraseniaEncriptada = encriptar(contrasenia);

        // Se obtiene el id del rol de auxiliar
        let query = `
            SELECT id_rol FROM rol
            WHERE nombre = '${userRoles.AUXILIAR}';
        `;
        const [{ id_rol }] = await mysql_exec_query(query);


        query = `
            INSERT INTO empleado (
                dpi,
                nombres,
                apellidos,
                correo,
                contrasenia,
                id_rol,
                id_unidad_servicio
            ) VALUES (
                '${dpi}',
                '${nombres}',
                '${apellidos}',
                '${correo}',
                '${contraseniaEncriptada}',
                ${id_rol},
                ${idDireccion}
            );
        `;
        const { insertId: id_empleado } = await mysql_exec_query(query);
        const auxiliar = {
            ...req.body,
            id_empleado
        }
        respBody.setData({auxiliar});
        res.status(200).send(respBody.getLiteralObject());
    } catch(error) {
        console.log(error);
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.get('/lista-auxiliares', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        let query = `
            SELECT
                empleado.*
            FROM empleado
            INNER JOIN rol USING (id_rol)
            WHERE rol.nombre = '${userRoles.AUXILIAR}';
        `;
        const auxiliares = await mysql_exec_query(query);
        respBody.setData({auxiliares});
        res.status(200).json(respBody.getLiteralObject());
    } catch(error) {
        return res.status(500).json({error: error.toString()});
    }
});


router.put('/editar-auxiliar/:idAuxiliar', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const idAuxiliar = parseInt(req.params.idAuxiliar);
        const { dpi, nombres, apellidos, correo, acutalizarContrasenia, contrasenia } = req.body;

        let query = `
            UPDATE empleado
            SET dpi = '${dpi}',
                nombres = '${nombres}',
                apellidos = '${apellidos}',
                correo = '${correo}'
            WHERE id_empleado = ${idAuxiliar};
        `;

        if (acutalizarContrasenia) {
            const  contraseniaEncriptada = encriptar(contrasenia);
            query = `
                UPDATE empleado
                SET dpi = '${dpi}',
                    nombres = '${nombres}',
                    apellidos = '${apellidos}',
                    correo = '${correo}',
                    contrasenia = '${contraseniaEncriptada}'
                WHERE id_empleado = ${idAuxiliar};
            `;
        }

        await mysql_exec_query(query);

        // Obtener el auxiliar actualizado
        query = `
            SELECT *
            FROM empleado
            WHERE id_empleado = ${idAuxiliar};
        `;
        const [auxiliar] = await mysql_exec_query(query);
        respBody.setData({auxiliar});
        res.status(200).json(respBody.getLiteralObject());
    } catch(error) {
        return res.status(500).json({error: error.toString()});
    }
});

router.delete('/eliminar-auxiliar/:idAuxiliar', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const idAuxiliar = parseInt(req.params.idAuxiliar);
        let query = `
            DELETE FROM empleado
            WHERE id_empleado = ${idAuxiliar};
        `;
        await mysql_exec_query(query);
        respBody.setData({idAuxiliar});
        respBody.setMessage('Auxiliar eliminado correctamente');
        res.status(200).json(respBody.getLiteralObject());
    } catch(error) {
        console.log(error);
        respBody.setError(error.toString());
        return res.status(500).json(respBody.getLiteralObject());
    }
});


router.post('/registar-empleado', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { dpi, nit, nombres, apellidos, id_unidad_servicio, cargo } = req.body;

        // Se obtiene el id del rol de trabajador
        let query = `
            SELECT id_rol FROM rol
            WHERE nombre = '${userRoles.ORDINARIO}';
        `;
        const [{ id_rol }] = await mysql_exec_query(query);


        query = `
            INSERT INTO empleado (
                dpi,
                nit,
                nombres,
                apellidos,
                cargo,
                id_rol,
                id_unidad_servicio
            ) VALUES (
                '${dpi}',
                '${nit}',
                '${nombres}',
                '${apellidos}',
                '${cargo}',
                ${id_rol},
                '${id_unidad_servicio}'
            );
        `;
        const { insertId: id_empleado } = await mysql_exec_query(query);
        const empleado = {
            ...req.body,
            id_empleado
        }
        respBody.setData({empleado});

        res.status(200).send(respBody.getLiteralObject());
    } catch(error) {
        console.log(error);
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.get('/lista-empleados', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        let query = `
            SELECT
                empleado.*
            FROM empleado
            INNER JOIN rol USING (id_rol)
            WHERE rol.nombre = '${userRoles.ORDINARIO}' AND empleado.activo = TRUE;
        `;
        const empleados = await mysql_exec_query(query);
        respBody.setData({empleados});
        res.status(200).json(respBody.getLiteralObject());
    } catch(error) {
        return res.status(500).json({error: error.toString()});
    }
});


router.get('/empleado/:id_empleado', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const id_empleado = parseInt(req.params.id_empleado);
        const empleado = await obtenerEmepleado(id_empleado);
        respBody.setData({empleado});
        res.status(200).json(respBody.getLiteralObject());
    } catch(error) {
        console.log(error);
        return res.status(500).json({error: error.toString()});
    }
});


router.put('/dar-baja-empleado/:id_empleado', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const id_empleado = parseInt(req.params.id_empleado);

        // Se verifica que no tenga bienes asignados
        let query = `
            SELECT COUNT(*) AS cant_bienes
            FROM bien_activo
            WHERE id_empleado = ${id_empleado}
        `;
        let outcome = await mysql_exec_query(query);
        const { cant_bienes } = outcome[0];
        if (cant_bienes > 0) {
            throw new Error('No se puede dar de baja a un empleado con bienes asignados.');
        }
        
        // Si no tiene bienes asignados se da baja
        query = `
            UPDATE empleado
            SET activo = 0
            WHERE id_empleado = ${id_empleado};
        `;
        await mysql_exec_query(query);
        respBody.setData({id_empleado});
        respBody.setMessage('Empleado dado de baja correctamente.');
        res.status(200).json(respBody.getLiteralObject());
    } catch(error) {
        console.log(error);
        respBody.setError(error.toString());
        return res.status(400).json(respBody.getLiteralObject());
    }
});


router.get('/empleados-de-baja', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        let query = `
            SELECT
                empleado.*
            FROM empleado
            INNER JOIN rol USING (id_rol)
            WHERE rol.nombre = '${userRoles.ORDINARIO}' AND empleado.activo = False;
        `;
        const empleados = await mysql_exec_query(query);
        respBody.setData({empleados});
        res.status(200).json(respBody.getLiteralObject());
    } catch(error) {
        return res.status(500).json({error: error.toString()});
    }
});


router.put('/activar-empleado/:id_empleado', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const id_empleado = parseInt(req.params.id_empleado);
        let query = `
            UPDATE empleado
            SET activo = TRUE
            WHERE id_empleado = ${id_empleado};
        `;
        await mysql_exec_query(query);
        respBody.setMessage('Empleado activado correctamente.');
        respBody.setData({id_empleado});
        res.status(200).json(respBody.getLiteralObject());
    } catch(error) {
        console.log(error);
        respBody.setError(error.toString());
        res.status(400).json(respBody.getLiteralObject());
    }
});


router.delete('/eliminar-empleado/:id_empleado', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const id_empleado = parseInt(req.params.id_empleado);

        // Se verifica que el empleado este de baja 
        let query = `
            SELECT activo
            FROM empleado
            WHERE id_empleado = ${id_empleado};
        `;
        let outcome = await mysql_exec_query(query);
        const { activo } = outcome[0];
        if (activo) {
            throw new Error('No se puede eliminar a un empleado activo.');
        }

        query = `
            DELETE FROM empleado
            WHERE id_empleado = ${id_empleado};
        `;
        await mysql_exec_query(query);
        respBody.setData({id_empleado});
        respBody.setMessage('Empleado eliminado correctamente');
        res.status(200).json(respBody.getLiteralObject());
    } catch(error) {
        console.log(error);
        return res.status(500).json({error: error.toString()});
    }
});


router.put('/editar-empleado/:id_empleado', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const id_empleado = parseInt(req.params.id_empleado);
        const { dpi, nit, nombres, apellidos, id_unidad_servicio, cargo } = req.body;

        let query = `
            UPDATE empleado
            SET
                dpi = '${dpi}',
                nit = '${nit}',
                nombres = '${nombres}',
                apellidos = '${apellidos}',
                cargo = '${cargo}',
                id_unidad_servicio = '${id_unidad_servicio}'
            WHERE id_empleado = ${id_empleado};
        `;
        await mysql_exec_query(query);

        // Obtener el empleado actualizado
        query = `
            SELECT *
            FROM empleado
            WHERE id_empleado = ${id_empleado};
        `;
        const [empleado] = await mysql_exec_query(query);
        respBody.setData({empleado});
        res.status(200).json(respBody.getLiteralObject());
    } catch(error) {
        console.log(error);
        return res.status(500).json({error: error.toString()});
    }
});


router.post('/asignar-bienes', async (req, res) => {
    const respBody = new HTTPResponseBody();
    const mysql_conn = await getMysqlConnection();
    mysql_conn.beginTransaction();
    try {
        const { id_autor, id_empleado, idsBienes, numerosTarjetas } = req.body;
        const action = { type: accionesTarjeta.ASIGNACION }
        const registros = await generarRegistrosDesvinculados(idsBienes, action);
        await ejecutarAccionTarjeta(id_autor, id_empleado, registros, numerosTarjetas, action);
        mysql_conn.commit();
        respBody.setMessage('Bienes asignados correctamente');
        res.send(respBody.getLiteralObject());
    } catch(error) {
        console.log(true)
        mysql_conn.rollback();
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.post('/traspasar-bienes', async (req, res) => {
    const respBody = new HTTPResponseBody();
    const mysql_conn = await getMysqlConnection();
    mysql_conn.beginTransaction();
    try {
        const {
            id_autor,
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


        const biensPorIdTarjeta = _.groupBy(bienesConTarjeta, 'id_tarjeta_responsabilidad');
        for (let idTarjeta in biensPorIdTarjeta) {
            const actionTraspasoEmisor = {
                type: accionesTarjeta.TRASPASO,
                payload: {
                    id_tarjeta_emisora: parseInt(idTarjeta),
                    esRecepcion: false
                }
            };
    
            const actionTraspasoRecepetor = {
                type: accionesTarjeta.TRASPASO,
                payload: {
                    id_tarjeta_emisora: parseInt(idTarjeta),
                    esRecepcion: true
                }
            };
            const idsBienes = biensPorIdTarjeta[idTarjeta].map(bien => bien.id_bien);
            const registrosEmisor = await generarRegistrosDesvinculados(idsBienes, actionTraspasoEmisor);
            const registrosReceptor = await generarRegistrosDesvinculados(idsBienes, actionTraspasoRecepetor);
    
            // Se cargan los bienes al receptor, aqui se establece la tarjeta receptora de los registros
            await ejecutarAccionTarjeta(id_autor, idEmpleadoReceptor, registrosReceptor, numerosTarjetaReceptor, actionTraspasoRecepetor);
            // Se descargan los bienes del emisor
            for (let i = 0; i < registrosEmisor.length; i++) {
                let regEmisor = registrosEmisor[i];
                let regReceptor = registrosReceptor[i];
                regEmisor.id_tarjeta_emisora = regReceptor.id_tarjeta_emisora;
                regEmisor.id_tarjeta_receptora = regReceptor.id_tarjeta_receptora;
            }
            await ejecutarAccionTarjeta(id_autor, idEmpleadoEmisor, registrosEmisor, numerosTarjetaEmisor, actionTraspasoEmisor);
        }

        mysql_conn.commit();
        respBody.setMessage('Bienes traspasados correctamente.');
        res.status(200).send(respBody.getLiteralObject());
    } catch(error) {
        console.log(error)
        mysql_conn.rollback();
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.post('/desasignar-bienes', async (req, res) => {
    const respBody = new HTTPResponseBody();
    const mysql_conn = await getMysqlConnection();
    mysql_conn.beginTransaction();
    try {
        const { id_autor, id_empleado, idsBienes, numerosTarjetas } = req.body;
        const action = { type: accionesTarjeta.DESASIGNACION }
        const registros = await generarRegistrosDesvinculados(idsBienes, action);
        await ejecutarAccionTarjeta(id_autor, id_empleado, registros, numerosTarjetas, action);
        mysql_conn.commit();
        respBody.setMessage('Bienes desasignados correctamente');
        res.send(respBody.getLiteralObject());
    } catch(error) {
        mysql_conn.rollback();
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.post('/comentar-tarjeta/:id_empleado', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const id_empleado = parseInt(req.params.id_empleado);
        const { id_autor, numerosTarjetas, comentario } = req.body;

        // Se formatea el comentario que ira en la descripción del registro
        const descripcionFormateada = formatearDescripcionBien(comentario);
        const cantLineas = getNoLineas(descripcionFormateada);
        const registro = {
            descripcion: descripcionFormateada,
            lineas: cantLineas,
            es_nota: true  
        };
        
        const tarjetasConNuevosRegistros = await ejecutarAccionTarjeta(id_autor, id_empleado, [registro], numerosTarjetas, { type: accionesTarjeta.COMENTACION });
        const tarjetaConNuevoRegistro = Object.values(tarjetasConNuevosRegistros)[0];
        respBody.setData(tarjetaConNuevoRegistro);
        respBody.setMessage('Comentario agregado correctamente.');
        return res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
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
        respBody.setData(tarjetas);
        res.status(200).send(respBody.getLiteralObject());
    } catch(error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
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


module.exports = router;