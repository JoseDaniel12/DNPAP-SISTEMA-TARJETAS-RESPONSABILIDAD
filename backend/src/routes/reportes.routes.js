const express = require('express');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const { jsPDF } = require('jspdf');
require('jspdf-autotable')


const router = express.Router();

router.get('/resumen-tarjetas', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        const doc = new jsPDF();

        const data = [
            { nombre: "Juan", apellido: "Perez", edad: 30 },
            { nombre: "Maria", apellido: "Gomez", edad: 25 },
            { nombre: "Carlos", apellido: "Lopez", edad: 35 }
        ];

        let query = `

        `;	

        doc.autoTable({
            head: [[
                'No. Tarjeta',
                'Responsable',
                'Pasa a la tarjeta No.',
                'Nuevo Responsable',
                'Cantidad del bien',
                'Descripción del bien',
                'Inventario del programa',
                'PROGRAMA Y/UNIDAD',
                'SICOIN No.',
                'Valor de Bien',
                'Monto (Q) de tarjeta.'
            ]],
            body: data.map(row => [row.nombre, row.apellido, row.edad]), // Cuerpo de la tabla
            startY: 20
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=tabla.pdf');
        res.send(doc.output());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
    
});

module.exports = router;