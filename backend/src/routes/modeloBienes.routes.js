const express = require('express');
const HTTPResponseBody  = require('./HTTPResponseBody');

const router = express.Router();

router.post('/crear-modelo-bien' , async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const { descripcion, precio, marca, codigo } = req.body;
        let query = `
            INSERT INTO modelo (descripcion, precio, marca, codigo)
            VALUES ('${descripcion}', ${precio}, '${marca}', '${codigo}');
        `;
        const result = await mysql_exec_query(query);
        respBody.setData(result.insertId);
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
        let query = `SELECT * FROM modelo;`;
        const result = await mysql_exec_query(query);
        respBody.setData(result);
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
        let query = `
            SELECT * 
            FROM modelo
            WHERE id_modelo = ${id_modelo}
            LIMIT 1;
        `;
        const result = await mysql_exec_query(query);
        const [modelo] = result;
        respBody.setData(modelo);
        return res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


module.exports = router;