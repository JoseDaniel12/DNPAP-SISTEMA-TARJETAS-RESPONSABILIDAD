const express = require('express');
const { encriptar } = require('../helpers/encryption');
const userRoles = require('../types/userRoles');
const HTTPResponseBody  = require('./HTTPResponseBody');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const _ = require('lodash');

const router = express.Router();


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


router.put('/registar-auxiliar', async (req, res) => {
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


module.exports = router;