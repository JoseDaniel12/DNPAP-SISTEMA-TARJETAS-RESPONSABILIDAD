const express = require('express');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');

const router = express.Router();

router.get('/obtener-programas', async (req, res) => {
    const programas = await mysql_exec_query('SELECT * FROM programa');
    return res.status(200).json({programas});
});

module.exports = router;