const express = require('express');
const HTTPResponseBody  = require('./HTTPResponseBody');
const jwt = require('jsonwebtoken');

const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const { validar_dato_encriptado } = require('../helpers/encryption');

const REFRESH_TOKENS_KEY = 'refresh_tokens';

const get_refresh_tokens = async () => {
    // const logs = await redis_client.get(REFRESH_TOKENS_KEY);
    // if (!logs) {
    //     return [];
    // }
    // return JSON.parse(logs);
    return '';
}

const save_refresh_tokes = async(refresh_token) => {
    // let logs = await get_refresh_tokens();
    // logs.push(refresh_token);
    // await redis_client.set(REFRESH_TOKENS_KEY, JSON.stringify(logs));
};


const router = express.Router();

// Verifica credenciales y retorna un token en caso de que el usuario sea valido
router.post('/login', async (req, res) => {
    const { correo, contrasenia } = req.body;

    // Busqueda del usuario con las credenciales ingresadas
    let [usuario] = await mysql_exec_query(`
        SELECT
        empleado.*,
        rol.nombre as rol
        FROM empleado
        INNER JOIN rol USING (id_rol) 
        WHERE correo = '${correo}'
        LIMIT 1;
    `);

    if (!usuario) {
        return res.status(400).json({ 
            error: 'Usuario no registrado.' 
        });
    } else if (!validar_dato_encriptado(contrasenia, usuario.contrasenia)) {
        return res.status(400).json({ 
            error: 'Contraseña incorrecta.' 
        });
    }

    // Se crea el token con el que se harán peticiones posteriormente
    const access_token = jwt.sign(usuario,  process.env.ACCESS_TOKEN_SECRET);

    // Se crea y guarda el token para refrescar el token de acceso.
    const refresh_token = jwt.sign(usuario,  process.env.REFRESH_TOKEN_SECRET);
    await save_refresh_tokes(refresh_token);

    // Se obtiene la direccion a la bajo la que se encuentra el usuario
    let id_unidad_superior = id_unidad_servicio = usuario.id_unidad_servicio;
    while (id_unidad_superior != null) {
        let query = `
            SELECT id_unidad_superior
            FROM unidad_servicio
            WHERE id_unidad_servicio = ${id_unidad_servicio};
        `;
        let [unidad_superior] = await mysql_exec_query(query);
        id_unidad_servicio = id_unidad_superior;
        id_unidad_superior = unidad_superior.id_unidad_superior;
    }
    usuario.idDireccion = id_unidad_servicio;

    delete usuario.contrasenia;
    return res.status(200).json({usuario, access_token, refresh_token});
});


router.get('/verificar-disponibilidad-dpi/:dpi/:rol', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { dpi, rol } = req.params;
        let query = `
            SELECT empleado.*
            FROM empleado
            INNER JOIN rol USING (id_rol)
            WHERE dpi = '${dpi}' AND rol.nombre = '${rol}';
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


module.exports = router;