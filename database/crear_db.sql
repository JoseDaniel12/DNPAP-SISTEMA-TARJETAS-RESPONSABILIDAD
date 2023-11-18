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
    id_departamento,

    foreign key (id_departamento) references departamento(id_departamento)
);

CREATE TABLE IF NOT EXISTS unidad_servicio (
    id_unidad_servicio INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(250),
    id_municipio INT,

    foreign key (id_municipio) references municipio(id_municipio)
);

CREATE TABLE IF NOT EXISTS administrador (
	id_administrador INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    alias VARCHAR(250),
    contrasenia VARCHAR(250),
	nombre VARCHAR(250),
    dpi VARCHAR(250),
	correo VARCHAR(250),
    id_unidad_servicio INT,

    foreign key (id_unidad_servicio) references unidad_servicio(id_unidad_servicio)
);

