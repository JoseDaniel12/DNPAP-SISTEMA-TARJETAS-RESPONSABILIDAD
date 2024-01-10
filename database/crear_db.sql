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
    FOREIGN KEY (id_departamento_guate) REFERENCES departamento_guate(id_departamento_guate) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS tipo_unidad_servicio (
    id_tipo_unidad_servicio INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(250)
);


CREATE TABLE IF NOT EXISTS unidad_servicio (
    id_unidad_servicio INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre_nuclear VARCHAR(250),

    id_unidad_superior INT,
    id_tipo_unidad_servicio INT,
    id_municipio INT,
    FOREIGN KEY (id_unidad_superior) REFERENCES unidad_servicio(id_unidad_servicio) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo_unidad_servicio) REFERENCES tipo_unidad_servicio(id_tipo_unidad_servicio) ON DELETE CASCADE,
    FOREIGN KEY (id_municipio) REFERENCES municipio(id_municipio) ON DELETE CASCADE
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

    id_rol INT,
    id_unidad_servicio INT,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol) ON DELETE CASCADE,
    FOREIGN KEY (id_unidad_servicio) REFERENCES unidad_servicio(id_unidad_servicio) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS tarjeta_responsabilidad (
	id_tarjeta_responsabilidad INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    numero VARCHAR(250),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    saldo_que_viene DECIMAL(10, 3),
    unidad_servicio VARCHAR(250),
    departamento_guate VARCHAR(250),
    municipio VARCHAR(250),
    nombre_empleado VARCHAR(250),
    nit_empleado VARCHAR(250),
    cargo_empleado VARCHAR(250),
    saldo DECIMAL(13, 3) UNSIGNED,
    lineas_restantes_anverso INT DEFAULT 34,
    lineas_restantes_reverso INT DEFAULT 34,

	id_empleado INT,
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS registro (
	id_registro INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    fecha DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    cantidad INT UNSIGNED,
    descripcion VARCHAR(250),
    precio DECIMAL(10, 3),
    ingreso TINYINT(1),
    anverso TINYINT(1),
    id_tarjeta_emisora INT,
    id_tarjeta_receptora INT,

    id_tarjeta_responsabilidad INT,
    FOREIGN KEY (id_tarjeta_responsabilidad) REFERENCES tarjeta_responsabilidad(id_tarjeta_responsabilidad) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS log (
	id_log INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    descripcion VARCHAR(250),
    fecha DATETIME,

    id_registro INT,
    id_empleado INT,
    FOREIGN KEY (id_registro) REFERENCES registro(id_registro) ON DELETE CASCADE,
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS modelo (
	id_modelo INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	descripcion VARCHAR(250),
    precio DECIMAL(10, 3)
);


CREATE TABLE IF NOT EXISTS kit (
	id_kit INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    descripcion VARCHAR(250),
    precio DECIMAL(10, 3)
);


CREATE TABLE IF NOT EXISTS bien (
	id_bien INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	sicoin VARCHAR(250),
    no_serie VARCHAR(250),
	no_inventario VARCHAR(250),
    fecha_registro DATE,

    id_modelo INT,
    id_kit INT,
    FOREIGN KEY (id_modelo) REFERENCES modelo(id_modelo) ON DELETE CASCADE,
    FOREIGN KEY (id_kit) REFERENCES kit(id_kit) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS registro_bien (
	id_registro_bien INT PRIMARY KEY NOT NULL AUTO_INCREMENT,

    id_registro INT,
    id_bien INT,
    FOREIGN KEY (id_registro) REFERENCES registro(id_registro) ON DELETE CASCADE,
    FOREIGN KEY (id_bien) REFERENCES bien(id_bien) ON DELETE CASCADE
);
