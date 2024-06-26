const express = require('express');
const HTTPResponseBody  = require('./HTTPResponseBody');
const { getMysqlConnection } = require('../database/mysql/mysql_conn');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const modelosUtilities = require('../utilities/modelos');
const multer  = require('multer');
const XlsxPopulate = require('xlsx-populate');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.post('/crear-modelo-bien' , async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { descripcion, precio, marca, codigo } = req.body;

        // Se verifica si el modelo ya existe o si se debe crear uno nuevo
        let query = `
            SELECT * from modelo
            WHERE (
                descripcion = '${descripcion}' AND
                precio = '${precio}' AND
                marca = '${marca}' AND
                codigo = '${codigo}'
            )
            LIMIT 1;
        `;
        let [modelo] = await mysql_exec_query(query);
        if (!modelo) {
            query = `
                INSERT INTO modelo (descripcion, precio, marca, codigo)
                VALUES ('${descripcion}', ${precio}, '${marca}', '${codigo}');
            `;
            let { insertId } = await mysql_exec_query(query);
            modelo = modelosUtilities.obtenerModeloPorId(insertId);
        } 
        respBody.setData(modelo);
        return res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.get('/modelos-bienes', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const modelos = await modelosUtilities.obtenerModelos();
        respBody.setData(modelos);
        return res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.get('/modelo/:id_modelo', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_modelo } = req.params;
        const modelo = await modelosUtilities.obtenerModeloPorId(id_modelo);
        if (!modelo) {
            respBody.setError('Modelo no encontrado');
            return res.status(404).send(respBody.getLiteralObject());
        }
        respBody.setData(modelo);
        return res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.put('/modelo/:id_modelo', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_modelo } = req.params;
        const { descripcion, precio, marca, codigo } = req.body;

        // Se verifica que el modelo por actualizar no tenga bienes asociados que esten asignados
        let query = `
            SELECT 
                COUNT(*) AS cant_bienes
            FROM bien
            WHERE id_modelo = ${id_modelo} AND id_tarjeta_responsabilidad IS NOT NULL
            LIMIT 1;
        `;
        let result = await mysql_exec_query(query);
        const { cant_bienes } = result[0];
        if (cant_bienes > 0) {
            respBody.setError('El modelo tiene bienes asignados asociados a él, no se puede actualizar.');
            return res.status(400).send(respBody.getLiteralObject());
        }

        // Se busca si ya existe un modelo con las nuevas caracteristicas ingresadas
        query = `
            SELECT * from modelo
            WHERE (
                descripcion = '${descripcion}' AND
                precio = '${precio}' AND
                marca = '${marca}' AND
                codigo = '${codigo}'
            )
            LIMIT 1;
        `;
        let [modelo] = await mysql_exec_query(query);

        if (modelo) {
            // Si ya existe un modelo con las caracteristicas ingresadas se traspasan los bienes
            // al modelo existente
            query = `
                UPDATE bien
                SET id_modelo = ${modelo.id_modelo}
                WHERE id_modelo = ${id_modelo};
            `;
            await mysql_exec_query(query);

            // Se elimina el modelo que ya no tiene bienes asociados
            query = `
                DELETE FROM modelo
                WHERE id_modelo = ${id_modelo};
            `;
            await mysql_exec_query(query);
        } else {
            // Si no existe se actualiza el modelo
            query = `
                UPDATE modelo
                SET descripcion = '${descripcion}',
                    precio = ${precio},
                    marca = '${marca}',
                    codigo = '${codigo}'
                WHERE id_modelo = ${id_modelo};
            `;
            await mysql_exec_query(query);
            modelo = await modelosUtilities.obtenerModeloPorId(id_modelo);
        }

        respBody.setData(modelo);
        return res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.delete('/modelo/:id_modelo', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_modelo } = req.params;

        // Se verifica que el modelo por eliminar no tenga bienes asociados que esten asignados
        let query = `
            SELECT 
                COUNT(*) AS cant_bienes
            FROM bien
            WHERE id_modelo = ${id_modelo} AND id_tarjeta_responsabilidad IS NOT NULL
            LIMIT 1;
        `;
        let result = await mysql_exec_query(query);
        const { cant_bienes } = result[0];
        if (cant_bienes > 0) {
            respBody.setError('El modelo tiene bienes asignados asociados a él, no se puede eliminar.');
            return res.status(400).send(respBody.getLiteralObject());
        }

        // Se elimina el modelo
        query = `
            DELETE FROM modelo
            WHERE id_modelo = ${id_modelo};
        `;
        await mysql_exec_query(query);

        respBody.setMessage('Modelo eliminado existosamente.');
        return res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.get('/bienes-de-modelo/:id_modelo', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { id_modelo } = req.params;
        const query = `
            SELECT 
                bien.*,
                empleado.id_empleado
            FROM bien
            LEFT JOIN tarjeta_responsabilidad USING (id_tarjeta_responsabilidad)
            LEFT JOIN empleado USING (id_empleado)
            WHERE id_modelo = ${id_modelo};
        `;
        const outcome = await mysql_exec_query(query);
        respBody.setData(outcome);
        res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


const upload = multer({ dest: 'uploads/' });
router.post('/carga-masiva-bienes-modelo/:id_modelo', upload.single('bienes'), async (req, res) => {
    const respBody = new HTTPResponseBody();
    const mysql_conn = await getMysqlConnection();
    mysql_conn.beginTransaction();
    try {
        const id_modelo = parseInt(req.params.id_modelo);

        const excel = await XlsxPopulate.fromFileAsync(req.file.path);
        const hoja = excel.sheet(0);

        if (hoja.row(1).cell('A').value() !== 'SICOIN') {
            throw new Error('La celda A1 debe tener el titulo \'SICOIN\'.');
        }
        if (hoja.row(1).cell('B').value() !== 'SERIE') {
            throw new Error('La celda B1 debe tener el titulo \'SERIE\'.');
        }
        if (hoja.row(1).cell('C').value() !== 'INVENTARIO') {
            throw new Error('La celda C1 debe tener el titulo \'INVENTARIO\'.');
        }

        const indiceFilaFinal = hoja.find('#')[0]?.rowNumber() - 1;
        if (isNaN(indiceFilaFinal)) {
            throw new Error('Debe indicar el final de las filas con el simbolo \'#\'.');
        }
    
        // Se cargan los bienes del excel
        const bienes = [];
        for (let i = 2; i <= indiceFilaFinal; i++) {
            bienes.push({
                numeroFila: i,
                sicoin: hoja.row(i).cell('A').value(), 
                no_serie: hoja.row(i).cell('B').value(), 
                no_inventario: hoja.row(i).cell('C').value(),
            });
        }

        // Se borra el archivo luego de procesarlo
        fs.unlinkSync(req.file.path);

        let query = `
            SELECT GROUP_CONCAT(no_serie SEPARATOR ';') AS nosSerie
            FROM bien
            WHERE no_serie != '';
        `;
        const result = await mysql_exec_query(query);
        const nosSerie = result[0].nosSerie;

        // Se clasifican los bienes como validos o no
        const bienesCorrectos = [];
        const bienesIncorrectos = [];
        for (const bien of bienes) {
            if (nosSerie.includes(bien.no_serie)) {
                bienesIncorrectos.push(bien);
            } else {
                bienesCorrectos.push(bien);
            }
        }

        // Se cargan los bienes correctos al modelo
        if (bienesCorrectos.length > 0) {
            const values = bienesCorrectos.map(bien => `('${bien.sicoin}', '${bien.no_serie}', '${bien.no_inventario}', ${id_modelo})`);
            query = `
                INSERT INTO bien (sicoin, no_serie, no_inventario, id_modelo)
                VALUES ${values.join(', ')};
            `;
            try {
                await mysql_exec_query(query);
            } catch (error) {
                throw new Error(error.toString());
            }
        }

        mysql_conn.commit();
        respBody.setData({
            bienesCorrectos,
            bienesIncorrectos,
        });
        res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        mysql_conn.rollback();
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.get('/platilla-carga-bienes', async (req, res) => {
    const respBody = new HTTPResponseBody();
    const rutaEjemplo = path.join(__dirname, '../PlantillasExcel/EjemploCargaMasivaDeBienes.xlsx');
    fs.readFile(rutaEjemplo, (err, data) => {
        if (err) {
            respBody.setError(err.toString());
            return res.status(500).send(respBody.getLiteralObject());
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="EjemploCargaMasivaDeBienes.xlsx"');
        res.send(data);
    });
});


module.exports = router;