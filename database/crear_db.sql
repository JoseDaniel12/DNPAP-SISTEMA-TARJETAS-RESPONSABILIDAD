DROP DATABASE IF EXISTS dnpap;
CREATE DATABASE IF NOT EXISTS dnpap;

USE dnpap;

CREATE TABLE IF NOT EXISTS departamento_guate (
    id_departamento_guate INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(250)
);


CREATE TABLE IF NOT EXISTS municipio (
    id_municipio INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(250),

    id_departamento_guate INT,
    FOREIGN KEY (id_departamento_guate) REFERENCES departamento_guate(id_departamento_guate)
);


CREATE TABLE IF NOT EXISTS tipo_unidad_servicio (
    id_tipo_unidad_servicio INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(250)
);


CREATE TABLE IF NOT EXISTS unidad_servicio (
    id_unidad_servicio INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre_nuclear VARCHAR(250),
    siglas VARCHAR(250),

    id_unidad_superior INT,
    id_tipo_unidad_servicio INT,
    id_municipio INT,
    FOREIGN KEY (id_unidad_superior) REFERENCES unidad_servicio(id_unidad_servicio),
    FOREIGN KEY (id_tipo_unidad_servicio) REFERENCES tipo_unidad_servicio(id_tipo_unidad_servicio),
    FOREIGN KEY (id_municipio) REFERENCES municipio(id_municipio)
);


CREATE TABLE IF NOT EXISTS rol (
    id_rol INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(250)
);


CREATE TABLE IF NOT EXISTS empleado (
	id_empleado INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    correo VARCHAR(250),
    contrasenia VARCHAR(250),
	nombres VARCHAR(250),
    apellidos VARCHAR(250),
    dpi VARCHAR(250),
    nit VARCHAR(250),
    cargo VARCHAR(250),
    saldo DECIMAL(13, 3) UNSIGNED DEFAULT 0,
    activo TINYINT(1) DEFAULT 1,

    id_rol INT,
    id_unidad_servicio INT,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    FOREIGN KEY (id_unidad_servicio) REFERENCES unidad_servicio(id_unidad_servicio)
);


CREATE TABLE IF NOT EXISTS tarjeta_responsabilidad (
	id_tarjeta_responsabilidad INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    numero VARCHAR(250),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    saldo_que_viene DECIMAL(10, 2) DEFAULT 0,
    unidad_servicio VARCHAR(250),
    departamento_guate VARCHAR(250),
    municipio VARCHAR(250),
    nombre_empleado VARCHAR(250),
    nit_empleado VARCHAR(250),
    cargo_empleado VARCHAR(250),
    saldo_anverso DECIMAL(13, 3) UNSIGNED,
    saldo DECIMAL(13, 3) UNSIGNED,
    lineas_restantes_anverso INT,
    lineas_restantes_reverso INT,

    id_tarjeta_anterior INT,
    id_tarjeta_posterior INT,
    id_empleado INT,
    FOREIGN KEY (id_tarjeta_anterior) REFERENCES tarjeta_responsabilidad(id_tarjeta_responsabilidad),
    FOREIGN KEY (id_tarjeta_posterior) REFERENCES tarjeta_responsabilidad(id_tarjeta_responsabilidad),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);


CREATE TABLE IF NOT EXISTS registro (
	id_registro INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    fecha DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    cantidad INT UNSIGNED,
    descripcion LONGTEXT,
    precio DECIMAL(10, 2),
    saldo DECIMAL(10, 2),
    ingreso TINYINT(1),
    anverso TINYINT(1),
    es_nota TINYINT(1) DEFAULT 0,

    id_tarjeta_emisora INT,
    id_tarjeta_receptora INT,
    id_tarjeta_responsabilidad INT,
    FOREIGN KEY (id_tarjeta_emisora) REFERENCES tarjeta_responsabilidad(id_tarjeta_responsabilidad) ON DELETE SET NULL,
    FOREIGN KEY (id_tarjeta_receptora) REFERENCES tarjeta_responsabilidad(id_tarjeta_responsabilidad) ON DELETE SET NULL,
    FOREIGN KEY (id_tarjeta_responsabilidad) REFERENCES tarjeta_responsabilidad(id_tarjeta_responsabilidad) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS log_actividad (
	id_log_actividad INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    fecha DATETIME(3),
    dpi VARCHAR(250),
    nit VARCHAR(250),
    nombres VARCHAR(250),
    apellidos VARCHAR(250),
    tipo_accion VARCHAR(250),
    no_tarjeta VARCHAR(250),
    no_registro INT,

    id_registro INT,
    id_autor INT,
    FOREIGN KEY (id_registro) REFERENCES registro(id_registro) ON DELETE SET NULL,
    FOREIGN KEY (id_autor) REFERENCES empleado(id_empleado) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS modelo (
	id_modelo INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    marca VARCHAR(250),
    codigo VARCHAR(250),
	descripcion LONGTEXT,
    precio DECIMAL(10, 2)
);


CREATE TABLE IF NOT EXISTS bien (
	id_bien INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	sicoin VARCHAR(250),
    no_serie VARCHAR(250),
	no_inventario VARCHAR(250),
    fecha_registro DATE,
    es_raiz_kit TINYINT(1) DEFAULT 0,

    id_modelo INT,
    id_tarjeta_responsabilidad INT,
    FOREIGN KEY (id_modelo) REFERENCES modelo(id_modelo) ON DELETE CASCADE,
    FOREIGN KEY (id_tarjeta_responsabilidad) REFERENCES tarjeta_responsabilidad(id_tarjeta_responsabilidad) ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS registro_bien (
	id_registro_bien INT PRIMARY KEY NOT NULL AUTO_INCREMENT,

    id_registro INT,
    id_bien INT,
    FOREIGN KEY (id_registro) REFERENCES registro(id_registro) ON DELETE CASCADE,
    FOREIGN KEY (id_bien) REFERENCES bien(id_bien) ON DELETE CASCADE
);


DELIMITER //
CREATE TRIGGER update_saldos_tarjeta
AFTER INSERT ON registro
FOR EACH ROW
BEGIN
    IF NOT NEW.es_nota THEN
        -- Si el saldo va en el lado anverso se acutaliza el saldo anverso
        IF NEW.anverso THEN
            UPDATE tarjeta_responsabilidad
            SET saldo_anverso = IF (NEW.ingreso = TRUE, saldo_anverso + NEW.precio, saldo_anverso - NEW.precio)
            WHERE tarjeta_responsabilidad.id_tarjeta_responsabilidad = NEW.id_tarjeta_responsabilidad;
        END IF;

        -- Se acutaliza el saldo general de la tarjeta (anverso/reverso)
        UPDATE tarjeta_responsabilidad
        SET saldo = IF (NEW.ingreso = TRUE, saldo + NEW.precio, saldo - NEW.precio)
        WHERE tarjeta_responsabilidad.id_tarjeta_responsabilidad = NEW.id_tarjeta_responsabilidad;
    END IF;
END;
//
DELIMITER ;


DELIMITER //
CREATE TRIGGER update_saldo_empleado
AFTER UPDATE ON tarjeta_responsabilidad
FOR EACH ROW
BEGIN
    -- Se actualiza el saldo del empleado al modifcar sus tarjetas, que por logica siempre se modifica la ultima tarjeta
    UPDATE empleado
    SET empleado.saldo = (
        SELECT tarjeta_responsabilidad.saldo
        FROM tarjeta_responsabilidad
        WHERE tarjeta_responsabilidad.id_empleado = NEW.id_empleado
        ORDER BY tarjeta_responsabilidad.fecha DESC
        LIMIT 1
    )
    WHERE empleado.id_empleado = NEW.id_empleado;
END;
//
DELIMITER ;


CREATE VIEW bien_activo AS
# Bien con su dueño y tarjeta en la que lo posee (tarjeta en la que esta el bien como tal)
SELECT
    empleado.id_empleado,
    bien.id_bien,
    tarjeta_responsabilidad.id_tarjeta_responsabilidad
FROM bien
INNER JOIN tarjeta_responsabilidad ON bien.id_tarjeta_responsabilidad = tarjeta_responsabilidad.id_tarjeta_responsabilidad
INNER JOIN empleado ON tarjeta_responsabilidad.id_empleado = empleado.id_empleado;



CREATE VIEW bien_inactivo AS
# Bienes sin dueño asignado
SELECT bien.id_bien
FROM bien_activo
RIGHT JOIN bien ON bien_activo.id_bien = bien.id_bien
WHERE bien_activo.id_bien IS NULL;


CREATE VIEW unidad_jerarquizada AS
WITH RECURSIVE unidad_jerarquizada AS (
    SELECT
        us.*,
        us.id_unidad_servicio AS id_direccion,
        us.siglas AS siglas_jerarquicas
    FROM unidad_servicio us
    WHERE id_unidad_superior IS NULL
    UNION
    SELECT
        us.id_unidad_servicio,
        us.nombre_nuclear,
        us.siglas,
        us.id_unidad_superior,
        us.id_tipo_unidad_servicio,
        uj.id_municipio,
        uj.id_direccion,
        CONCAT_WS('/', us.siglas, uj.siglas_jerarquicas) AS siglas_jerarquicas
    FROM unidad_jerarquizada uj
    INNER JOIN unidad_servicio us ON us.id_unidad_superior = uj.id_unidad_servicio
)
SELECT
    uj.*,
    tipo_unidad_servicio.nombre AS tipo_unidad_servicio
FROM unidad_jerarquizada uj
INNER JOIN tipo_unidad_servicio USING (id_tipo_unidad_servicio);


CREATE VIEW reporte_bienes_activos AS
SELECT
    empleado.id_empleado,
    MIN(unidad_jerarquizada.nombre_nuclear) AS unidad,
    MIN(CONCAT(empleado.nombres, ' ', empleado.apellidos)) AS responsable,
    MIN(tarjeta_responsabilidad.numero) AS no_tarjeta,
    COUNT(*) AS cant_bien,
    MIN(modelo.descripcion) AS descripcion,
    MIN(modelo.marca) AS marca,
    MIN(modelo.codigo) AS modelo,
    GROUP_CONCAT(bien.no_serie SEPARATOR ', ') AS no_serie,
    GROUP_CONCAT(DISTINCT bien.no_inventario SEPARATOR ', ') AS no_inventario,
    GROUP_CONCAT(bien.sicoin SEPARATOR ', ') AS sicoin,
    MIN(modelo.precio) AS precio_unitario,
    (COUNT(*) * modelo.precio) AS monto,
    tarjeta_responsabilidad.saldo AS saldo_tarjeta
FROM unidad_jerarquizada
INNER JOIN empleado ON unidad_jerarquizada.id_unidad_servicio = empleado.id_unidad_servicio
INNER JOIN tarjeta_responsabilidad ON empleado.id_empleado = tarjeta_responsabilidad.id_empleado
INNER JOIN bien_activo ON tarjeta_responsabilidad.id_tarjeta_responsabilidad = bien_activo.id_tarjeta_responsabilidad
INNER JOIN bien ON bien_activo.id_bien = bien.id_bien
INNER JOIN modelo ON bien.id_modelo = modelo.id_modelo
WHERE bien_activo.id_tarjeta_responsabilidad = tarjeta_responsabilidad.id_tarjeta_responsabilidad
GROUP BY empleado.id_empleado, tarjeta_responsabilidad.id_tarjeta_responsabilidad, modelo.id_modelo
ORDER BY empleado.id_empleado;