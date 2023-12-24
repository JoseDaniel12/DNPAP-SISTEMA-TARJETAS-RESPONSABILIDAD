const express = require('express');
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

    delete usuario.contrasenia;
    return res.status(200).json({usuario, access_token, refresh_token});
});


module.exports = router;