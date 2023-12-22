const express = require('express');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');

const router = express.Router();

router.post('/registro-bienes-comunes', async (req, res) => {
    let {
        idPrograma,
        precio,
        descripcion,
        fecha,
        datos_espeficos_bienes,
    } = req.body;

    bienes = datos_espeficos_bienes.map(bien => ({
        idPrograma,
        precio,
        descripcion,
        fecha,
        ...bien,
    }));

    bienes.map(bien => {
        mysql_exec_query(`
            INSERT INTO bien (
                descripcion,
                precio,
                sicoin,
                no_serie,
                no_inventario, 
                fecha_registro,
                id_programa,
                id_registro_tarjeta
            )
            VALUES (
                '${bien.descripcion}',
                '${bien.precio}', 
                '${bien.sicoin}',
                '${bien.noSerie}',
                '${bien.noInventario}',
                STR_TO_DATE('${bien.fecha}', '%d/%m/%Y'),
                '${bien.idPrograma}',
                NULL
            );
        `);
    })

    
    return res.status(200).json({ msg: 'Bienes registrados correctamente.', bienes });
});

module.exports = router;