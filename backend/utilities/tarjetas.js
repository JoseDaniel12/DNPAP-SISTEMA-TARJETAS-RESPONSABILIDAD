const { mysql_exec_query } = require("../database/mysql/mysql_exec");
const { format } = require('date-fns');
const PDFDocument = require('pdfkit');
const _ = require('lodash');

const opracionesTarjetas = {
    ASIGNACION: 'Asignacion',
    DESCARGO: 'Descargo'
}

const DIMENSION_TARJETA = {
    LAYOUR: 'lanscape',
    SIZE: 'A4',

    // Especificaciones para la columna de descripciones
    LINEAS_POR_PAGINA: 34,
    CARACTERES_POR_LINEA: 98,

    // Posiciones en el eje horizontal donde cominzan las columnas
    POS_X_COL_FECHA: 22.6772,
    POS_X_COL_CANTIDAD: 73.7008,
    POS_X_COL_DESCRIPCION: 133.228,
    POS_X_COL_DEBE: 487.5591,
    POS_X_COL_HABER: 569.7638,	
    POS_X_COL_SALDO: 649.1339,
}


function getNoLineas(texto) {
    return texto.split('\n').length; 
}


function formatearDescripcionBien(descripcion) {
    const caracteresPorLinea = DIMENSION_TARJETA.CARACTERES_POR_LINEA;
    const palabras = descripcion.split(' ');
    let resultado = '';
    let lineaActual = '';
    for (const palabra of palabras) {
    if ((lineaActual + palabra).length > caracteresPorLinea) {
        resultado += lineaActual.trim() + '\n';
        lineaActual = '';
    }
    lineaActual += palabra + ' ';
    }
    resultado += lineaActual.trim();
    return resultado;
}


function getDescripcionRegistro(bienes) {
    if (!bienes.length) return '';

    if (bienes.length === 1) {
        let descripcion = bienes[0].descripcion;
        descripcion += `\nPrecio unitario: ${bienes[0].precio}`;
        descripcion += `\nSCOIN No.: ${bienes[0].sicoin}`;
        descripcion += `\nNo. de Serie: ${bienes[0].no_serie}`;
        descripcion += `\nNo. de Inventario: ${bienes[0].no_inventario}`;
        return descripcion;
    }

    let descripcionGrupo = bienes[0].descripcion;
    descripcionGrupo += `\nPrecio unitario: ${bienes[0].precio}`;

    descripcionGrupo += `\nSCOIN Nos.: `;
    for (const bien of bienes) {
        descripcionGrupo += `${bien.sicoin} `;
    }
    descripcionGrupo.trim();

    descripcionGrupo += `\nNos. de Serie: `;
    for (const bien of bienes) {
        descripcionGrupo += `${bien.no_serie} `;
    }
    descripcionGrupo.trim();

    descripcionGrupo += `\nNos. de Inventarios: `;
    for (const bien of bienes) {
        descripcionGrupo += `${bien.no_inventario} `;
    }
    descripcionGrupo.trim();
    return descripcionGrupo;
}


async function determinarTarjetasRequeridas(id_empleado, idsBienes, operacion) {
    if (!idsBienes.length) return 0;

    // Obtener la información de los bienes a los cuales se les crearan registros en las tarjetas
    let query = `
        SELECT *
        FROM bien
        INNER JOIN modelo USING(id_modelo)
        WHERE (
            bien.id_bien IN (${idsBienes.join(',')})
        )
    `;
    const bienes = await mysql_exec_query(query);

    // Agrupar los bienes por modelo para obtener los registros que se crearan en las tarjetas
    const biensPorModelo = _.groupBy(bienes, 'id_modelo');
    const lineasRegistros = Object.values(biensPorModelo).map(bienes => {
        return getNoLineas(formatearDescripcionBien(getDescripcionRegistro(bienes)));
    });

    let noTarjetasNecesarioas = 0;
	let espacioRestanteAnverso = 0;
	let espacioRestanteReverso = 0;

    // Obtener el espacio restante de la ultima tarjeta del empleado
    query = `
        SELECT 
        tarjeta_responsabilidad.lineas_restantes_anverso,
        tarjeta_responsabilidad.lineas_restantes_reverso
        FROM empleado
        INNER JOIN tarjeta_responsabilidad USING(id_empleado)
        WHERE (
            id_empleado = ${id_empleado} AND
            tarjeta_responsabilidad.fecha = (
                SELECT MAX(tarjeta_responsabilidad.fecha)
                FROM empleado
                INNER JOIN tarjeta_responsabilidad USING(id_empleado)
                WHERE (
                id_empleado = ${id_empleado}
                )
            )
        )
        LIMIT 1;
    `;

    // Si empleado ya tenia tarjetas se toma en cuneta el espacio que que aun tiene disponible
    const outcome = await mysql_exec_query(query);
    if (outcome.length) {
        const [ultimaTarjeta] = outcome;
        espacioRestanteAnverso = ultimaTarjeta.lineas_restantes_anverso;
        espacioRestanteReverso = ultimaTarjeta.lineas_restantes_reverso;
    }

	for (const lineasRegistro of lineasRegistros) {
		// Verificar si el bien cabe en el lado anverso
		if (lineasRegistro <= espacioRestanteAnverso) {
            // Si cabe en el lado anverso, colocarlo ahi
			espacioRestanteAnverso -= lineasRegistro
		} else {
            // Si no cabe en el lado anverso, verificar si cabe en el lado reverso
			if (lineasRegistro <= espacioRestanteReverso) {
				// Se coloca en el lado reverso y se desabilita el lado anverso
				espacioRestanteReverso -= lineasRegistro;
				espacioRestanteAnverso = 0;
			} else {
				// Si no cabe en el lado reverso, se agrega una nueva tarjeta
				noTarjetasNecesarioas += 1;
				// Se reinicia el espacio de los lados de la tarjeta, ya que se ha creado una nueva
				espacioRestanteAnverso = DIMENSION_TARJETA.LINEAS_POR_PAGINA;
				espacioRestanteReverso = DIMENSION_TARJETA.LINEAS_POR_PAGINA;
				// Se coloca el bien en el lado anverso de la nueva tarjeta
				espacioRestanteAnverso -=  lineasRegistro;
			}
        }
	}

  return noTarjetasNecesarioas;
}


async function colocarRegistro(tarjeta, registro) {
    // Se inserta el registro en la db
    let query = `
        INSERT INTO registro (
            anverso,
            ingreso,
            id_tarjeta_emisora,
            id_tarjeta_receptora,
            cantidad,
            descripcion,
            precio,
            id_tarjeta_responsabilidad
        ) VALUES (
            ${registro.anverso? 1 : 0},
            ${registro.ingreso? 1 : 0},
            ${registro.id_tarjeta_emisora},
            ${registro.id_tarjeta_receptora},
            ${registro.cantidad},
            '${registro.descripcion}',
            ${parseFloat(registro.precio)},
            ${tarjeta.id_tarjeta_responsabilidad}
        );
    `;
    const  { insertId: registroId } = await mysql_exec_query(query);

    // Se actualiza el espacio restante en la tarjeta donde se inserto el registro
    if (registro.anverso) {
        tarjeta.lineas_restantes_anverso -= registro.lineas;
    } else {
        tarjeta.lineas_restantes_reverso -= registro.lineas;
        tarjeta.lineas_restantes_anverso = 0;
    }
    query = `
        UPDATE tarjeta_responsabilidad
        SET
            lineas_restantes_anverso = ${tarjeta.lineas_restantes_anverso},
            lineas_restantes_reverso = ${tarjeta.lineas_restantes_reverso}
        WHERE id_tarjeta_responsabilidad = ${tarjeta.id_tarjeta_responsabilidad};
    `
    await mysql_exec_query(query);

    // Se vincula el registro con los bienes que utilizo para su creación
    for (const bien of registro.bienes) {
        query = `
            INSERT INTO registro_bien (id_registro, id_bien) 
            VALUES (${registroId}, ${bien.id_bien});
        `;
        await mysql_exec_query(query);
    }

    // Esperar un milisgundo para que el siguiente registro tenga fecha distinta
    await new Promise(resolve => setTimeout(resolve, 1));
}


async function crearTarjeta(empleado, numeroTarjeta, saldoQueViene) {
    let query = `
        INSERT INTO tarjeta_responsabilidad (
            numero,
            saldo_que_viene,
            unidad_servicio,
            departamento_guate,
            municipio,
            nombre_empleado,
            nit_empleado,
            cargo_empleado,
            saldo,
            lineas_restantes_anverso,
            lineas_restantes_reverso,
            id_empleado
        ) VALUES (
            '${numeroTarjeta}',
            ${saldoQueViene},
            'Unidad de Servicio Pendiente',
            '${empleado.departamento_guate}',
            '${empleado.municipio}',
            '${empleado.nombre}',
            '${empleado.nit}',
            '${empleado.cargo}',
            ${saldoQueViene},
            ${DIMENSION_TARJETA.LINEAS_POR_PAGINA},
            ${DIMENSION_TARJETA.LINEAS_POR_PAGINA},
            ${empleado.id_empleado}
        );
    `;
    const { insertId } = await mysql_exec_query(query);
    query = `
        SELECT * FROM tarjeta_responsabilidad
        WHERE id_tarjeta_responsabilidad = ${insertId}
    `;
    const [tarjeta] = await mysql_exec_query(query);
    return tarjeta;
}


async function obtenerTarjeta(id_tarjeta, conRegistros = false) {
    let query = `
        SELECT * FROM tarjeta_responsabilidad
        WHERE id_tarjeta_responsabilidad = ${id_tarjeta};
    `;
    const [tarjeta] = await mysql_exec_query(query);
    if (conRegistros) {
        let query = `
            SELECT *
            FROM tarjeta_responsabilidad
            INNER JOIN registro USING(id_tarjeta_responsabilidad)
            WHERE id_tarjeta_responsabilidad = ${id_tarjeta}
            ORDER BY registro.fecha;
        `
        let registros = await mysql_exec_query(query);
        tarjeta.registros = registros;
    }
    return tarjeta;
}


function generarPDF(tarjeta, fecha, dataCallback, endCallback) {
    const doc = new PDFDocument({
        layout: 'lanscape',
        size: 'A4',
    });
    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    let posX = 100;
    let posY = 100;
    const offset =  10;

    let enReverso = false;    
    for (const registro of tarjeta.registros) {
        // Si el registro va en el reverso y aun no se esta en el reverso entonces, se crea 
        // una nueva pagina para el reverso y se coloca en ella
        if (!registro.anverso && !enReverso) {
            doc.addPage();
            enReverso = true;
            posY = 0;
        }

        // Se determina si el registro debe ser impreso a color o no, si la fecha es null se 
        // imprimen todos los registros a color, de lo contrario unicamente si los reigstros
        // tienen fecha mayor a la indicada.
        if (fecha === null || registro.fecha >= fecha) {
            doc.fillColor('#000000');
        } else {
            doc.fillColor('white');
        }

        // Fecha del Registro
        posX = DIMENSION_TARJETA.POS_X_COL_FECHA;
        const fechaString = format(new Date(registro.fecha), 'dd/MM/yyyy');
        doc.fontSize(10).text(fechaString, posX, posY);

        // Cantidad de bienes en el registro
        posX = DIMENSION_TARJETA.POS_X_COL_CANTIDAD;
        const cantidad = registro.cantidad.toFixed(2);
        doc.fontSize(10).text(cantidad, posX, posY);

        // Descripción del registro
        posX = DIMENSION_TARJETA.POS_X_COL_DESCRIPCION;
        doc.fontSize(10).text(registro.descripcion, posX, posY);

        posY += doc.heightOfString(registro.descripcion) + 10;
    }

    // Agrega la pagina del reverso en caso de no haberla utilizado
    if (!enReverso) doc.addPage();

    doc.end();
}

async function generarRegistrosDesvinculados(idsBienes) {
    // Obtener la información de los bienes de los cuales se crearan registros
    let query = `
        SELECT *
        FROM bien
        INNER JOIN modelo USING(id_modelo)
        WHERE (
            bien.id_bien IN (${idsBienes.join(',')})
        )
    `;
    const bienes = await mysql_exec_query(query);

    // Agrupar los bienes por modelo para luego crear los registros
    const biensPorModelo = _.groupBy(bienes, 'id_modelo');

    // Se generan los registros
    const registros = Object.values(biensPorModelo).map(bienes => {
        const descripcionRegistro = formatearDescripcionBien(getDescripcionRegistro(bienes));
        return {
            descripcion: descripcionRegistro,
            anverso: true,
            ingreso: true,
            lineas: getNoLineas(descripcionRegistro),
            precio: bienes.reduce((precio, bien) => precio + parseFloat(bien.precio), 0),
            cantidad: bienes.length,
            id_tarjeta_emisora: null,
            id_tarjeta_receptora: null,
            id_tarjeta_responsabilidad: null,
            bienes
        };
    });

    return registros;
}

module.exports = {
    getNoLineas,
    formatearDescripcionBien,
    getDescripcionRegistro,
    determinarTarjetasRequeridas,
    colocarRegistro,
    crearTarjeta,
    obtenerTarjeta,
    generarRegistrosDesvinculados,
    generarPDF
}