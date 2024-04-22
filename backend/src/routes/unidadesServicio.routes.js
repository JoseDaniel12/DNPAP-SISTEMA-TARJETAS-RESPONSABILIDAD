const express = require('express');
const HTTPResponseBody  = require('./HTTPResponseBody');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const tiposUnidadesServicio = require('../types/unidadesServicio');

const router = express.Router();


router.get('/disponibilidad-nombre/:nombre', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { nombre } = req.params;
        let query = `
            SELECT 
                unidad_jerarquizada.*
            FROM unidad_jerarquizada
            WHERE nombre_nuclear = '${nombre}';
        `;
        const outcome = await mysql_exec_query(query);
        if (outcome.length) {
            respBody.setData({disponibilidad: false});
        } else {
            respBody.setData({disponibilidad: true});
        }
        res.send(respBody.getLiteralObject());
    } catch(error) {
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.get('/disponibilidad-siglas/:siglas', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { siglas } = req.params;
        let query = `
            SELECT 
                unidad_jerarquizada.*
            FROM unidad_jerarquizada
            WHERE siglas = '${siglas}';
        `;
        const outcome = await mysql_exec_query(query);
        if (outcome.length) {
            respBody.setData({disponibilidad: false});
        } else {
            respBody.setData({disponibilidad: true});
        }
        res.send(respBody.getLiteralObject());
    } catch(error) {
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.get('/:tipoUnidades', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { tipoUnidades } = req.params;
        let query = `
            SELECT 
                unidad_jerarquizada.*,
                tipo_unidad_servicio.nombre AS tipo_unidad_servicio
            FROM unidad_jerarquizada
            INNER JOIN tipo_unidad_servicio USING (id_tipo_unidad_servicio)
            WHERE tipo_unidad_servicio.nombre = '${tipoUnidades}'
        `;
        const unidadesServicio = await mysql_exec_query(query);
        respBody.setData({unidadesServicio});
        res.send(respBody.getLiteralObject());
    } catch(error) {
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.get('/unidad-serivicio/:id_unidad_servicio', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_unidad_servicio } = req.params;
        let query = `
            SELECT unidad_jerarquizada.*
            FROM unidad_jerarquizada
            WHERE id_unidad_servicio = ${id_unidad_servicio}
        `;
        const [unidadServicio] = await mysql_exec_query(query);
        respBody.setData({unidadServicio});
        res.send(respBody.getLiteralObject());
    } catch(error) {
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.post('/registrar-departamento', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { nombre, siglas, idDireccion } = req.body;

        // Obtención del id del tipo de servicio para Departamentos
        let query = `
            SELECT 
                id_tipo_unidad_servicio
            FROM tipo_unidad_servicio
            WHERE nombre = '${tiposUnidadesServicio.DEPARTAMENTO}';
        `;
        let [unidad] = await mysql_exec_query(query);
        const id_tipo_unidad_servicio = unidad.id_tipo_unidad_servicio;

        // Obtener municipio de la direccion a la que pertence el departamento
        query = `
            SELECT id_municipio
            FROM unidad_servicio
            INNER JOIN municipio USING (id_municipio)
            WHERE id_unidad_servicio = ${idDireccion};
        `;
        let [municipio] = await mysql_exec_query(query);
        const id_municipio = municipio.id_municipio;

        // Crear el departamento
        query = `
            INSERT INTO unidad_servicio (
                nombre_nuclear,
                siglas,
                id_unidad_superior,
                id_tipo_unidad_servicio,
                id_municipio
            )
            VALUES (
                '${nombre}',
                '${siglas}',
                ${idDireccion},
                ${id_tipo_unidad_servicio},
                ${id_municipio}
            );
        `;
        const { insertId: id_departamento } = await mysql_exec_query(query);

        // Obtener el departamento creado
        query = `
            SELECT *
            FROM unidad_jerarquizada
            WHERE id_unidad_servicio = ${id_departamento};
        `;
        const [departamento] = await mysql_exec_query(query);
        respBody.setData({departamento});
        respBody.setMessage('Departamento registrado correctamente');
        res.send(respBody.getLiteralObject());
    } catch(error) {
        console.log(error);
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.put('/editar-departamento/:idDepartamento', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const idDepartamento = parseInt(req.params.idDepartamento);
        const { nombre, siglas } = req.body;

        // Actualizacion del departamento
        let query = `
            UPDATE unidad_servicio
            SET nombre_nuclear = '${nombre}', 
                siglas = '${siglas}'
            WHERE id_unidad_servicio = ${idDepartamento};
        `;
        await mysql_exec_query(query);

        // Obtener el departamento actualizado
        query = `
            SELECT *
            FROM unidad_jerarquizada
            WHERE id_unidad_servicio = ${idDepartamento};
        `;
        const [departamento] = await mysql_exec_query(query);
        respBody.setData({departamento});
        res.send(respBody.getLiteralObject());
    } catch(error) {
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.post('/registrar-programa', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { nombre, siglas, idDepartamento } = req.body;

        // Obtención del id del tipo de servicio para Programas
        let query = `
            SELECT id_tipo_unidad_servicio
            FROM tipo_unidad_servicio
            WHERE nombre = '${tiposUnidadesServicio.PROGRAMA}';
        `;
        let [tipoUnidad] = await mysql_exec_query(query);
        const id_tipo_unidad_servicio = tipoUnidad.id_tipo_unidad_servicio;

        // Crear el Programa
        query = `
            INSERT INTO unidad_servicio (
                nombre_nuclear,
                siglas,
                id_unidad_superior,
                id_tipo_unidad_servicio
            )
            VALUES (
                '${nombre}',
                '${siglas}',
                ${idDepartamento},
                ${id_tipo_unidad_servicio}
            );
        `;
        const { insertId: idPrograma } = await mysql_exec_query(query);

        // Obtener el programa creado
        query = `
            SELECT *
            FROM unidad_jerarquizada
            WHERE id_unidad_servicio = ${idPrograma};
        `;
        const [programa] = await mysql_exec_query(query);
        respBody.setData({programa});
        respBody.setMessage('Programa registrado correctamente');
        res.send(respBody.getLiteralObject());
    } catch(error) {
        console.log(error);
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.put('/editar-programa/:idPrograma', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const idPrograma = parseInt(req.params.idPrograma);
        const { nombre, siglas, idDepartamento } = req.body;

        // Actualizacion del programa
        let query = `
            UPDATE unidad_servicio
            SET nombre_nuclear = '${nombre}', 
                siglas = '${siglas}',
                id_unidad_superior = ${idDepartamento}
            WHERE id_unidad_servicio = ${idPrograma};
        `;
        await mysql_exec_query(query);

        // Obtener el programa actualizado
        query = `
            SELECT *
            FROM unidad_jerarquizada
            WHERE id_unidad_servicio = ${idPrograma};
        `;
        const [programa] = await mysql_exec_query(query);
        respBody.setData({programa});
        
        res.send(respBody.getLiteralObject());
    } catch(error) {
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.delete('/eliminar-unidadesServicio/:idUnidad', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const idUnidad = parseInt(req.params.idUnidad);

        // Actualizacion del departamento
        let query = `
            DELETE FROM unidad_servicio
            WHERE id_unidad_servicio = ${idUnidad};
        `;
        const outcome = await mysql_exec_query(query);
        if (!outcome?.error) {
            respBody.setData({idUnidad});
            respBody.setMessage('Unidad de Servicio eliminada correctamente');
        } else {
            respBody.setError('Asegurese de que la unidad de servicio no tenga dependencias como subdivisiones o empleados.');
        }
        res.send(respBody.getLiteralObject());
    } catch(error) {
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


module.exports = router;