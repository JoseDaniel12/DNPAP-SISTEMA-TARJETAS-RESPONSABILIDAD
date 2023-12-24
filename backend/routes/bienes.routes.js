const express = require('express');
const conn = require('../database/mysql/mysql_conn');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const { format } = require('date-fns');

const router = express.Router();

router.post('/registro-bienes-comunes', async (req, res) => {
    try {
        conn.beginTransaction();
        let {
            descripcion,
            precio,
            fecha_registro,
            datos_espeficos_bienes,
        } = req.body;
    
        bienes = datos_espeficos_bienes.map(bien => ({
            descripcion,
            precio,
            fecha_registro,
            ...bien,
        }));
    
        // Se verifica si el modelo ya existe o si se debe crear uno nuevo
        let [modelo] = await mysql_exec_query(`
            SELECT * from modelo 
            WHERE (
                descripcion = '${descripcion}' AND
                precio = '${precio}'
            )
            LIMIT 1;
        `);
        
        let idModelo = modelo?.id_modelo;;
        if (!idModelo) {
            let { insertId } = await mysql_exec_query(`
                INSERT INTO modelo (descripcion, precio)
                VALUES ('${descripcion}', ${precio});
            `);
            idModelo = insertId;
        } 
    
        // Se registran los bienes en el modelo creado o enctrado
        for (const bien of bienes) {
            let result = await mysql_exec_query(`
                INSERT INTO bien (
                    sicoin,
                    no_serie,
                    no_inventario, 
                    fecha_registro,
                    id_modelo
                )
                VALUES (
                    '${bien.sicoin}',
                    '${bien.noSerie}', 
                    '${bien.noInventario}',
                    '${format(bien.fecha_registro, 'yyyy-MM-dd')}',
                    '${idModelo}'
                );
            `);
            if (result.error) throw new Error(result.error.message);
        }

        conn.commit();
        return res.status(200).json({ msg: 'Bienes registrados correctamente.', bienes });
    } catch (error) {
        conn.rollback();
        return res.status(500).json({ msg: 'Error al registrar los bienes.' });
    } 
});

module.exports = router;