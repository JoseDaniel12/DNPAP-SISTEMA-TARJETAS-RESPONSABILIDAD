const express = require('express');

const router = express.Router();

// Login de Administrador
router.post('/login', (req, res) => {
    return res.status(400).json({
        error: 'Datos erroneos.'
    })
});


module.exports = router;