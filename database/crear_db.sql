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

    FOREIGN KEY (id_departamento) REFERENCES departamento(id_departamento)
);

CREATE TABLE IF NOT EXISTS unidad_servicio (
    id_unidad_servicio INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(250),
    id_municipio INT,

    FOREIGN KEY (id_municipio) REFERENCES municipio(id_municipio)
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

    FOREIGN KEY (id_tipo_usuario) REFERENCES tipo_usuario(id_tipo_usuario),
    FOREIGN KEY (id_unidad_servicio) REFERENCES unidad_servicio(id_unidad_servicio)
);

