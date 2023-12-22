const express = require('express');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');

const router = express.Router();

router.get('/lista-empleados', async (req, res) => {
    const empleados = await mysql_exec_query('SELECT * FROM empleado');
    return res.status(200).json({empleados});
});

module.exports = router;