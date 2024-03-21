const XlsxPopulate = require('xlsx-populate');
const path = require('path');
const { format } = require('date-fns');
const _ = require('lodash');
const { mysql_exec_query } = require('../database/mysql/mysql_exec');
const accionesTarjeta = require('../types/accionesTarjeta');
const { obtenerNombreJerarquico } = require('./unidadServicio');
const { obtenerEmepleado, obtenerUltimaTarjeta } = require('../utilities/empleado');


const FORMATO_TARJETA = {
    POS_UNIDAD_SERVICIO: { fila: 2, columna: 4 },
    POS_MUNICIPIO: { fila: 2, columna: 5 },
    POS_DEPARTAMENTO: { fila: 2, columna: 8 },
    POS_EMPLEADO: { fila: 3, columna: 3 },
    POS_NIT: { fila: 3, columna: 5 },
    POS_CARGO: { fila: 3, columna: 7 },

    LINEAS_POR_PAGINA: 30,      // No incluye las 2 lineas de saldo entrante y saliente
    CARACTERES_POR_LINEA: 65,
    FONT: 'Courier New',
    FONT_SIZE: 9,
    FORMATO_PRECIO: '_(Q* #,##0.00_);_(Q* (#,##0.00);_(@_)',
    FILA_PRIMER_REGISTRO: 5,
    COL_FECHA: 2,
    COL_CANTIDAD: 3,
    COL_DESCRIPCION: 4,
    COL_DEBE: 5,
    COL_HABER: 6,
    COL_SALDO: 7,
}


function getNoLineas(texto) {
    if (texto === '') return 0;
    return texto.split('\n').length; 
}


function formatearDescripcionBien(descripcion) {
    const caracteresPorLinea = FORMATO_TARJETA.CARACTERES_POR_LINEA;
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


    let trozosDescripcionRegistro = [];

    const bienBase = bienes[0];
    trozosDescripcionRegistro.push(bienBase.descripcion);
    if (bienBase.marca) trozosDescripcionRegistro.push(`Marca: ${bienBase.marca}`);
    if (bienBase.codigo) trozosDescripcionRegistro.push(`Codigo de Modelo: ${bienBase.codigo}`);
    

    if (bienes.length === 1) {
        trozosDescripcionRegistro.push(`Precio: Q ${bienBase.precio.toFixed(2)}`);
        if (bienBase.sicoin) trozosDescripcionRegistro.push(`No. de SICOIN: ${bienBase.sicoin}`);
        if (bienBase.no_serie) trozosDescripcionRegistro.push(`No. de Serie: ${bienBase.no_serie}`);
        if (bienBase.no_inventario) trozosDescripcionRegistro.push(`No. de Inventario: ${bienBase.no_inventario}`);
        return trozosDescripcionRegistro.join('. ') + '.';
    }

    trozosDescripcionRegistro.push(`Precio unitario: Q ${bienBase.precio.toFixed(2)}`);

    const numerosSICOIN = bienes.map(bien => ['', undefined, null].includes(bien.sicoin) ? '-' : bien.sicoin);
    if (numerosSICOIN.length) {
        trozosDescripcionRegistro.push(`Nos. de SCOIN: ${numerosSICOIN.join(', ')}`);
    }

    const numerosSerie = bienes.map(bien => ['', undefined, null].includes(bien.no_serie) ? '-' : bien.no_serie);
    if (numerosSerie.length) {
        trozosDescripcionRegistro.push(`Nos. de Serie: ${numerosSerie.join(', ')}`);
    }

    const numerosInventario = bienes.map(bien => ['', undefined, null].includes(bien.no_inventario) ? '-' : bien.no_inventario);
    if (numerosInventario.length) {
        trozosDescripcionRegistro.push(`Nos. de Inventario: ${numerosInventario.join(', ')}`);
    }

    return trozosDescripcionRegistro.join('. ') + '.';
}


async function determinarTarjetasRequeridas(id_empleado, registros) {
    if (!registros.length) return 0;

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

	for (const lineasRegistro of registros) {
        if (lineasRegistro.length === 0) continue;

        // Si el registro excede el formato de la tarjeta se lanza un error
        if (lineasRegistro > FORMATO_TARJETA.LINEAS_POR_PAGINA) {
            throw new Error(`Los registros de tarjetas no deben execderse de ${FORMATO_TARJETA.LINEAS_POR_PAGINA} lineas, con ${FORMATO_TARJETA.CARACTERES_POR_LINEA} caracteres c/u.`);
        }

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
				espacioRestanteAnverso = FORMATO_TARJETA.LINEAS_POR_PAGINA;
				espacioRestanteReverso = FORMATO_TARJETA.LINEAS_POR_PAGINA;
				// Se coloca el bien en el lado anverso de la nueva tarjeta
				espacioRestanteAnverso -=  lineasRegistro;
			}
        }
	}

  return noTarjetasNecesarioas;
}


async function colocarRegistro(tarjeta, registro, action) {
    // Dada la acción bajo la que se coloca el registro se determina si es un ingreso o egreso
    // y se establece la tarjeta emisora y receptora
    switch (action.type) {
        case accionesTarjeta.ASIGNACION:
            registro.ingreso = true;
            registro.id_tarjeta_receptora = tarjeta.id_tarjeta_responsabilidad;
            break;
        case accionesTarjeta.DESASIGNACION:
            registro.ingreso = false;
            registro.id_tarjeta_emisora = tarjeta.id_tarjeta_responsabilidad;
            break;
        case accionesTarjeta.TRASPASO:
            registro.ingreso = action.payload.esRecepcion;
            const plantillaNumeroTarjeta = '╦'.repeat(8);
            if (action.payload.esRecepcion) {
                registro.id_tarjeta_emisora = action.payload.id_tarjeta_emisora;
                registro.id_tarjeta_receptora = tarjeta.id_tarjeta_responsabilidad;
            }
            const tarjetaEmisora = await obtenerTarjeta(registro.id_tarjeta_emisora);
            const tarjetaReceptora = await obtenerTarjeta(registro.id_tarjeta_receptora);
            registro.descripcion = registro.descripcion.replace(plantillaNumeroTarjeta + 'E', tarjetaEmisora.numero);
            registro.descripcion = registro.descripcion.replace(plantillaNumeroTarjeta + 'R', tarjetaReceptora.numero);
            break;
    }

    // Se establece la consulta para insertar el registro dependinedo si es una nota o no
    let query = `
        INSERT INTO registro (
            anverso,
            descripcion,
            es_nota,
            id_tarjeta_responsabilidad
        ) VALUES (
            ${registro.anverso},
            '${registro.descripcion}',
            ${true},
            ${tarjeta.id_tarjeta_responsabilidad}
        )
    `;
    if (!registro.es_nota) {
        query = `
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
                ${registro.anverso},
                ${registro.ingreso},
                ${registro.id_tarjeta_emisora},
                ${registro.id_tarjeta_receptora},
                ${registro.cantidad},
                '${registro.descripcion}',
                ${parseFloat(registro.precio)},
                ${tarjeta.id_tarjeta_responsabilidad}
            );
        `;
    }

    // Se inserta el registro en la db
    let outcome = await mysql_exec_query(query);
    if (outcome.error) throw new Error('Falla al insertar el registro de tarjeta.');
    const  { insertId: id_registro } = outcome;

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
    outcome = await mysql_exec_query(query);
    if (outcome.error) throw new Error('Falla al actualizar el espacio restante de la tarjeta.');


    if (!registro.es_nota) {
        // Se vincula el registro con los bienes que utilizo para su creación
        for (const bien of registro.bienes) {
            query = `
                INSERT INTO registro_bien (id_registro, id_bien) 
                VALUES (${id_registro}, ${bien.id_bien});
            `;
            outcome = await mysql_exec_query(query);
            if (outcome.error) throw new Error('Falla al vincular registro con sus bienes.');
        }

        // Se establecen los bienes como activos dentro de la tarjeta correspondiente
        for (const bien of registro.bienes) {
            let query = `
                UPDATE bien
                SET id_tarjeta_responsabilidad = ${registro.id_tarjeta_receptora}
                WHERE id_bien = ${bien.id_bien};
            `;
            outcome = await mysql_exec_query(query);
            if (outcome.error) throw new Error('Falla al actualizar el estado de los bienes.');
        }
    }

    // Se obtiene el registro insertado en la db
    query = `
        SELECT * FROM registro
        WHERE id_registro = ${id_registro};
    `;
    outcome = await mysql_exec_query(query);
    if (outcome.error) throw new Error('Falla al obtener registro insertado.');
    const [registroInsertado] = outcome;

    // Esperar un milisgundo para que el siguiente registro que se cree tenga una fecha distinta
    await new Promise(resolve => setTimeout(resolve, 1));

    return registroInsertado;
}


async function crearTarjeta(empleado, numeroTarjeta, tarjetaAnterior = null) {
    let id_tarjeta_anterior = null;
    let saldo_que_viene = 0;

    if (tarjetaAnterior) {
        id_tarjeta_anterior = tarjetaAnterior.id_tarjeta_responsabilidad;
        saldo_que_viene = tarjetaAnterior.saldo;

        // Se deshabilita la tarjeta anterior
        tarjetaAnterior.lineas_restantes_reverso = 0;
        let query = `
            UPDATE tarjeta_responsabilidad
            SET lineas_restantes_reverso = 0
            WHERE id_tarjeta_responsabilidad = ${tarjetaAnterior.id_tarjeta_responsabilidad};
        `;
        let outcome = await mysql_exec_query(query);
        if (outcome.error) throw new Error('No se pudo deshabilitar tarjeta anterior, mientras se creaba una nueva.');
    }

    const nombreJerarquicoUnidad = await obtenerNombreJerarquico(empleado.id_unidad_servicio);

    // Se crea la nueva tarjeta
    query = `
        INSERT INTO tarjeta_responsabilidad (
            numero,
            saldo_que_viene,
            saldo_anverso,
            unidad_servicio,
            departamento_guate,
            municipio,
            nombre_empleado,
            nit_empleado,
            cargo_empleado,
            saldo,
            lineas_restantes_anverso,
            lineas_restantes_reverso,
            id_tarjeta_anterior,
            id_empleado
        ) VALUES (
            '${numeroTarjeta}',
            ${saldo_que_viene},
            ${saldo_que_viene},
            '${nombreJerarquicoUnidad}',
            '${empleado.departamento_guate}',
            '${empleado.municipio}',
            '${empleado.nombres + ' ' + empleado.apellidos}',
            '${empleado.nit}',
            '${empleado.cargo}',
            ${saldo_que_viene},
            ${FORMATO_TARJETA.LINEAS_POR_PAGINA},
            ${FORMATO_TARJETA.LINEAS_POR_PAGINA},
            ${id_tarjeta_anterior},
            ${empleado.id_empleado}
        );
    `;
    let outcome = await mysql_exec_query(query);
    if (outcome.error) throw new Error('No se pudo crear nueva tarjeta.');
    const { insertId } = outcome;

    // Se obtiene los datos de la tarjeta insertada
    query = `
        SELECT * FROM tarjeta_responsabilidad
        WHERE id_tarjeta_responsabilidad = ${insertId}
    `;
    outcome = await mysql_exec_query(query);
    if (outcome.error) throw new Error('No se pudo obtener la nueva tarjeta.');
    const [tarjeta] = outcome;

    if (tarjetaAnterior) {
        // Se actualiza la tarjeta anterior para que apunte a la nueva tarjeta como su sucesora
        let query = `
            UPDATE tarjeta_responsabilidad
            SET id_tarjeta_posterior = ${insertId}
            WHERE id_tarjeta_responsabilidad = ${tarjetaAnterior.id_tarjeta_responsabilidad};
        `;
        let outcome = await mysql_exec_query(query);
        if (outcome.error) throw new Error('No se pudo actualizar la tarjeta anterior para que apunte a la nueva tarjeta como su sucesora.');
    }

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


async function colocarEncabezadoTarjeta(hojaExcel, empleado) {
    // Unidad de Servicio
    let { fila, columna } = FORMATO_TARJETA.POS_UNIDAD_SERVICIO;
    hojaExcel.row(fila).cell(columna).value(empleado.unidad_servicio + ' - ' + empleado.siglas_jerarquicas);

    // Municipio    
    ({ fila, columna } = FORMATO_TARJETA.POS_MUNICIPIO);
    hojaExcel.row(fila).cell(columna).value(empleado.municipio);

    // Departamento
    ({ fila, columna } = FORMATO_TARJETA.POS_DEPARTAMENTO);
    hojaExcel.row(fila).cell(columna).value(empleado.departamento_guate);

    // Nombre del Empleado
    ({ fila, columna } = FORMATO_TARJETA.POS_EMPLEADO);
    hojaExcel.row(fila).cell(columna).value(empleado.nombres + ' ' + empleado.apellidos);

    // NIT
    ({ fila, columna } = FORMATO_TARJETA.POS_NIT);
    hojaExcel.row(fila).cell(columna).value(empleado.nit);

    // Cargo
    ({ fila, columna } = FORMATO_TARJETA.POS_CARGO);
    hojaExcel.row(fila).cell(columna).value(empleado.cargo);
}


async function generarExcel(tarjeta) {
    const rutaPlantilla = path.join(__dirname, '../PlantillasExcel/TarjetaResponsabilidad.xlsx');
    const excel = await XlsxPopulate.fromFileAsync(rutaPlantilla);
    let hoja = excel.sheet(0);
    const empleado = await obtenerEmepleado(tarjeta.id_empleado);
    colocarEncabezadoTarjeta(hoja, empleado);

    let saldoSalienteAnverso = 0;
    for (const registro of tarjeta.registros) {
        if (registro.anverso) { 
            saldoSalienteAnverso += registro.ingreso? registro.precio : -1 * registro.precio;
        } 
    }

    let fila = FORMATO_TARJETA.FILA_PRIMER_REGISTRO;
    let columna = FORMATO_TARJETA.COL_DESCRIPCION;

    // Se coloca la nota del saldo entrante y su monto en la tarjeta
    let notaSaldoEntrante = 'SALDO QUE VIENE...';
    if (tarjeta.id_tarjeta_anterior !== null) {
        const tarjetaAnterior = await obtenerTarjeta(tarjeta.id_tarjeta_anterior);
        notaSaldoEntrante = `SALDO QUE VIENE DE LA TARJETA No. ${tarjetaAnterior.numero} ...`;
    }
    hoja.row(fila).cell(columna).value(notaSaldoEntrante);

    columna = FORMATO_TARJETA.COL_SALDO;
    hoja.row(fila).cell(columna).value(tarjeta.saldo_que_viene);
    hoja.row(fila).cell(columna).style({ numberFormat: FORMATO_TARJETA.FORMATO_PRECIO });
    fila += 1;

    let enAnverso = true;
    let saldoAcumulado = tarjeta.saldo_que_viene;
    for (const registro of tarjeta.registros) {
        // Si el registro va en el reverso y aun se esta en el anverso, se cambia al reverso
        if (!registro.anverso && enAnverso) {
            // Antes de cambiar al reverso se coloca la nota del saldo saliente y su monto en el anverso
            columna = FORMATO_TARJETA.COL_DESCRIPCION;
            const celdaDescripcionSaldoSalienteAnverso = hoja.row(fila).cell(columna);
            celdaDescripcionSaldoSalienteAnverso.style({ horizontalAlignment: 'right' });
            celdaDescripcionSaldoSalienteAnverso.value('SALDO QUE VA...');

            columna = FORMATO_TARJETA.COL_SALDO;
            hoja.row(fila).cell(columna).value(tarjeta.saldo_anverso);
            hoja.row(fila).cell(columna).style({ numberFormat: FORMATO_TARJETA.FORMATO_PRECIO });

            // Se cambia al reverso y se reinicia la posicion de fila
            enAnverso = false;
            hoja = excel.sheet(1);
            colocarEncabezadoTarjeta(hoja, empleado);
            fila = FORMATO_TARJETA.FILA_PRIMER_REGISTRO;

            // Se coloca Nota del nota del saldo entrante al reverso
            columna = FORMATO_TARJETA.COL_DESCRIPCION;
            const celdaDescripcionSaldoEntranteReverso = hoja.row(fila).cell(columna);
            celdaDescripcionSaldoEntranteReverso.style({ horizontalAlignment: 'right' });
            celdaDescripcionSaldoEntranteReverso.value('SALDO QUE VIENE...');            
            columna = FORMATO_TARJETA.COL_SALDO;
            hoja.row(fila).cell(columna).value(tarjeta.saldo_anverso);
            hoja.row(fila).cell(columna).style({ numberFormat: FORMATO_TARJETA.FORMATO_PRECIO });
            fila += 1;
        }

        // Columna Fecha
        columna = FORMATO_TARJETA.COL_FECHA;
        const fechaString = format(new Date(registro.fecha), 'dd/MM/yyyy');
        hoja.row(fila).cell(columna).value(fechaString);

        if (!registro.es_nota) {
            // Columna Cantidad
            columna = FORMATO_TARJETA.COL_CANTIDAD;
            hoja.row(fila).cell(columna).value(registro.cantidad);

            // Columna de Debe o Haber
            if (registro.ingreso) {
                columna = FORMATO_TARJETA.COL_DEBE;
            } else {
                columna = FORMATO_TARJETA.COL_HABER;
            }
            hoja.row(fila).cell(columna).value(registro.precio);
            hoja.row(fila).cell(columna).style({ numberFormat: FORMATO_TARJETA.FORMATO_PRECIO });

            // Columna Saldo
            columna = FORMATO_TARJETA.COL_SALDO;
            saldoAcumulado = registro.ingreso? saldoAcumulado + registro.precio : saldoAcumulado - registro.precio;
            hoja.row(fila).cell(columna).value(saldoAcumulado);
            hoja.row(fila).cell(columna).style({ numberFormat: FORMATO_TARJETA.FORMATO_PRECIO });
        }

        // Columna Descripción
        columna = FORMATO_TARJETA.COL_DESCRIPCION;
        const lineasDescripcion = registro.descripcion.split('\n');
        for (const linea of lineasDescripcion) {
            hoja.row(fila).cell(columna).value(linea);
            fila += 1;
        }
    }

    if (tarjeta.lineas_restantes_reverso === 0 && tarjeta.id_tarjeta_posterior !== null) {
        // Se coloca la nota del saldo saliente del reverso tarjeta si ya se lleno el reverso
        const tarjetaPosterior = await obtenerTarjeta(tarjeta.id_tarjeta_posterior);
        let descripcionSaldoSalienteReverso = `SALDO QUE VA A LA TARJETA No. ${tarjetaPosterior.numero} ...`;

        columna = FORMATO_TARJETA.COL_DESCRIPCION;
        const celdaDescripcionSaldoSalienteReverso = hoja.row(fila).cell(columna);
        celdaDescripcionSaldoSalienteReverso.style({ horizontalAlignment: 'right' });
        celdaDescripcionSaldoSalienteReverso.value(descripcionSaldoSalienteReverso);
        columna = FORMATO_TARJETA.COL_SALDO;
        const saldoSalienteReversoString = tarjeta.saldo.toFixed(2).toString();
        hoja.row(fila).cell(columna).value(saldoSalienteReversoString);
    }

    return excel;
}



async function generarRegistrosDesvinculados(idsBienes, action) {
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
    const registros = [];
    for (const modelo in biensPorModelo) {
        const bienes = biensPorModelo[modelo];
        let descripcionRegistro = getDescripcionRegistro(bienes);
        if (action.type === 'Traspaso') {            
            let nota = '';
            const plantillaNumeroTarjeta = '╦'.repeat(8);
            const tarjetaEmisora = await obtenerTarjeta(action.payload.id_tarjeta_emisora);
            if (!action.payload.esRecepcion) {
                nota = `Se descarga el contenido descrito en el presente registro de la tarjeta No. ${tarjetaEmisora.numero} hacia la tarjeta No. ${plantillaNumeroTarjeta + 'R'}: `;
            } else {
                nota = `Se recibe el contenido descrito en el presente registro de la tarjeta No. ${tarjetaEmisora.numero}: `;
            }
            descripcionRegistro = nota + descripcionRegistro;
        }

        const descripcionFormateada = formatearDescripcionBien(descripcionRegistro);
        const cantLineas = getNoLineas(descripcionFormateada);

        registros.push({
            descripcion: descripcionFormateada,
            anverso: true,
            ingreso: true,
            lineas: cantLineas,
            precio: bienes.reduce((precio, bien) => precio + parseFloat(bien.precio), 0),
            cantidad: bienes.length,
            id_tarjeta_emisora: null,
            id_tarjeta_receptora: null,
            id_tarjeta_responsabilidad: null,
            bienes
        });
    }

    return registros;
}


const ejecutarAccionTarjeta = async (id_empleado, registros, numerosTarjetas, action) => {
    // Obtener el empleado al cual se le cargaran los registros
    const empleado = await obtenerEmepleado(id_empleado);
    if (!empleado) throw new Error('Empleado receptor no encontrado.');

    // Obtener la ultima tarjeta del empleado
    let ultimaTarjeta = await obtenerUltimaTarjeta(id_empleado);
    if (!ultimaTarjeta) {
        const numeroTarjeta = numerosTarjetas.shift();
        if (!numeroTarjeta) throw new Error('Registro excede el espacio de las tarjetas.');
        ultimaTarjeta = await crearTarjeta(empleado, numeroTarjeta);
    }

    const tarjetasPorIdConNuevosRegistros = {};
    // Para cada registro se determina en que tarjeta y lado debe ir y se establece su
    // tarjeta emisora y receptora
    for (let registro of registros) {
	    // Por defecto se los registros se intentarán colocar en el lado anverso
        registro.anverso = true;
		if (registro.lineas > ultimaTarjeta.lineas_restantes_anverso) {
            // Si no cabe en el lado anverso, verificar si cabe en el lado reverso
			if (registro.lineas <= ultimaTarjeta.lineas_restantes_reverso) {
				// Se coloca en el lado reverso, esto deshabilitará el lado anverso al colocarse
                registro.anverso = false;
			} else {
				// Si no cabe en el lado reverso, se crea una nueva tarjeta para colocar el bien
                const numeroTarjeta = numerosTarjetas.shift();
                if (!numeroTarjeta) throw new Error('Registro excede el espacio de las tarjetas.');
                ultimaTarjeta = await crearTarjeta(empleado, numeroTarjeta, ultimaTarjeta);
			}
        }

        // Una vez determina el destino del registro se coloca en la tarjeta correspondiente
        registro = await colocarRegistro(ultimaTarjeta, registro, action);

        if (tarjetasPorIdConNuevosRegistros[ultimaTarjeta.id_tarjeta_responsabilidad]) {
            tarjetasPorIdConNuevosRegistros[ultimaTarjeta.id_tarjeta_responsabilidad].registros.push(registro);
        } else {
            ultimaTarjeta.registros = [registro];
            tarjetasPorIdConNuevosRegistros[ultimaTarjeta.id_tarjeta_responsabilidad] = ultimaTarjeta;
        }

        return tarjetasPorIdConNuevosRegistros;
	}

    // Se las tarjetas donde se insertaron registros y los registros insertados
    return { tarjetas, registros };
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
    generarExcel,
    ejecutarAccionTarjeta
}