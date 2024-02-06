const express = require('express');
const HTTPResponseBody  = require('./HTTPResponseBody');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');

const router = express.Router();

router.get('/', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        let query = 'SELECT * FROM unidad_jerarquizada;';
        const unidadesSerivicio = await mysql_exec_query(query);
        respBody.setData(unidadesSerivicio);
        return res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    } 
});

module.exports = router;