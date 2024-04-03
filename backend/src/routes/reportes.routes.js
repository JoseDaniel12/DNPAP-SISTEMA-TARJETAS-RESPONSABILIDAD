const express = require('express');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const XlsxPopulate = require('xlsx-populate');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

const router = express.Router();
const HTTPResponseBody  = require('./HTTPResponseBody');
const { fill } = require('lodash');


router.get('/resumen-bienes-asignados', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        let query = `
            SELECT * FROM reporte_bienes_activos;
        `;
        const outcome = await mysql_exec_query(query);
        if (outcome.error) throw outcome.error;
        respBody.setData(outcome);
        res.status(200).send(respBody.getLiteralObject());
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
});


router.post('/excel-resumen-bienes-asignados', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        let filas = req.body;
        const excel = await XlsxPopulate.fromBlankAsync();
        const hoja = excel.sheet(0);

        const estiloQuetzales = {
            numberFormat: '_(Q* #,##0.00_);_(Q* (#,##0.00);_(@_)'
        }

        const estiloTextoCeldaAlineado = {
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
            wrapText: true,
        }

        for (let i = 1; i <= 20; i++) {
            hoja.column(i).style(estiloTextoCeldaAlineado);
        }

        let noFila = 1;
        let noColumna = 1;
        // Colocación de encabezados
        const rango = hoja.range('A1:M1');
        rango.style({ 
            bold: true,
            fill: {
                type: 'solid',
                color: 'a5a5a5'
            },
        });
        hoja.row(noFila).cell(noColumna++).value('Unidad de Servicio');
        hoja.row(noFila).cell(noColumna++).value('Responsables');
        hoja.row(noFila).cell(noColumna++).value('No. Tarjeta');
        hoja.row(noFila).cell(noColumna++).value('Cantidad');
        hoja.row(noFila).cell(noColumna++).value('Descripción');
        hoja.row(noFila).cell(noColumna++).value('Marca');
        hoja.row(noFila).cell(noColumna++).value('Modelo');
        hoja.row(noFila).cell(noColumna++).value('No. Serie');
        hoja.row(noFila).cell(noColumna++).value('No. Inventario');
        hoja.row(noFila).cell(noColumna++).value('Sicoin');
        hoja.row(noFila).cell(noColumna++).value('Precio Unitario');
        hoja.row(noFila).cell(noColumna++).value('Monto');
        hoja.row(noFila).cell(noColumna++).value('Saldo Tarjeta');
        noFila++;

        for (let fila of filas) {
            let noColumna = 1;
            hoja.row(noFila).cell(noColumna++).value(fila.unidad);
            hoja.row(noFila).cell(noColumna++).value(fila.responsable);
            hoja.row(noFila).cell(noColumna++).value(fila.no_tarjeta);
            hoja.row(noFila).cell(noColumna++).value(fila.cant_bien);
            hoja.row(noFila).cell(noColumna++).value(fila.descripcion);
            hoja.row(noFila).cell(noColumna++).value(fila.marca);
            hoja.row(noFila).cell(noColumna++).value(fila.modelo);
            hoja.row(noFila).cell(noColumna++).value(fila.no_serie);
            hoja.row(noFila).cell(noColumna++).value(fila.no_inventario);
            hoja.row(noFila).cell(noColumna++).value(fila.sicoin);
            hoja.row(noFila).cell(noColumna++).value(fila.precio_unitario).style(estiloQuetzales);
            hoja.row(noFila).cell(noColumna++).value(fila.monto).style(estiloQuetzales);
            hoja.row(noFila).cell(noColumna++).value(fila.saldo_tarjeta).style(estiloQuetzales);
            noFila++;
        }

        let rangoCuerpoTabla = hoja.range(2, 1, noFila - 1, 13);
        rangoCuerpoTabla.style({ 
            fill: {
                type: 'solid',
                color: 'c2d69b'
            },
        });

        let rangoTabla = hoja.range(1, 1, noFila - 1, 13);
        rangoTabla.style({
            border: true
        });

    
        
        const blob = await excel.outputAsync();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte.xlsx');
        res.send(blob);
    } catch (error) {
        console.log(error)
        respBody.setError(error.toString());
        res.status(500).send(respBody.getLiteralObject());
    }
    
});



router.get('/pdf-resumen-tarjetas', async (req, res) => {
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



router.get('/logs-bitacora-actividades', async (req, res) => {
    const respBody = new HTTPResponseBody();
    try {
        let query = `
            SELECT * FROM log_actividad
            ORDER BY fecha DESC;
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



module.exports = router;