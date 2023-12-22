DROP DATABASE IF EXISTS dnpap;
CREATE DATABASE IF NOT EXISTS dnpap;

USE dnpap;

CREATE TABLE IF NOT EXISTS departamento (
    id_departamento INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(250)
);

CREATE TABLE IF NOT EXISTS municipio (
    id_municipio INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(250),
    id_departamento INT,

    FOREIGN KEY (id_departamento) REFERENCES departamento(id_departamento) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS unidad_servicio (
    id_unidad_servicio INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(250),
    id_municipio INT,

    FOREIGN KEY (id_municipio) REFERENCES municipio(id_municipio) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tipo_usuario (
    id_tipo_usuario INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(250)
);

CREATE TABLE IF NOT EXISTS usuario (
	id_usuario INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    alias VARCHAR(250),
    contrasenia VARCHAR(250),
	nombre VARCHAR(250),
    dpi VARCHAR(250),
	correo VARCHAR(250),
    id_tipo_usuario INT,
    id_unidad_servicio INT,

    FOREIGN KEY (id_tipo_usuario) REFERENCES tipo_usuario(id_tipo_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_unidad_servicio) REFERENCES unidad_servicio(id_unidad_servicio) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS empleado (
	id_empleado INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombres VARCHAR(250),
    apellidos VARCHAR(250),
    dpi VARCHAR(250),
	nit VARCHAR(250),
    cargo VARCHAR(250),
	saldo VARCHAR(250),
    id_unidad_servicio INT,

    FOREIGN KEY (id_unidad_servicio) REFERENCES unidad_servicio(id_unidad_servicio) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tarjeta_responsabilidad (
	id_tarjeta_responsabilidad INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    numero VARCHAR(250),
    saldo DECIMAL,
	id_empleado INT,

    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS registro_tarjeta (
	id_registro_tarjeta INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    fecha VARCHAR(250),
    cantidad DECIMAL,
	es_ingreso TINYINT(1),
    id_tarjeta_responsabilidad INT,
    id_usuario INT,

    FOREIGN KEY (id_tarjeta_responsabilidad) REFERENCES tarjeta_responsabilidad(id_tarjeta_responsabilidad) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS programa (
	id_programa INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(250)
);

CREATE TABLE IF NOT EXISTS bien (
	id_bien INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    descripcion VARCHAR(250),
    precio DECIMAL,
	sicoin VARCHAR(250),
    no_serie VARCHAR(250),
	no_inventario VARCHAR(250),
    fecha_registro DATE,
    id_programa INT,
    id_registro_tarjeta INT,

    FOREIGN KEY (id_programa) REFERENCES programa(id_programa) ON DELETE CASCADE,
    FOREIGN KEY (id_registro_tarjeta) REFERENCES registro_tarjeta(id_registro_tarjeta) ON DELETE CASCADE
);


