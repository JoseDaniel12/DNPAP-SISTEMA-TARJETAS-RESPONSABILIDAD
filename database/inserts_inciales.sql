USE dnpap;

# _______________________ Departamentos _______________________
DELETE FROM departamento;
ALTER TABLE departamento AUTO_INCREMENT = 1;
INSERT INTO departamento (nombre) VALUES ('Guatemala');


# _______________________ Municipios _______________________
DELETE FROM municipio;
ALTER TABLE municipio AUTO_INCREMENT = 1;
INSERT INTO municipio (nombre, id_departamento) VALUES ('Guatemala', 1);


# _______________________ Unidades de Servicio _______________________
DELETE FROM unidad_servicio;
ALTER TABLE unidad_servicio AUTO_INCREMENT = 1;
INSERT INTO unidad_servicio (nombre, id_municipio) VALUES ('DNPAP', 1);

# _______________________ Tipos de Usuario _______________________
DELETE FROM tipo_usuario;
ALTER TABLE tipo_usuario AUTO_INCREMENT = 1;
INSERT INTO tipo_usuario (nombre) VALUES ('ADMIN');
INSERT INTO tipo_usuario (nombre) VALUES ('AUXILIAR');
INSERT INTO tipo_usuario (nombre) VALUES ('EMPLEADO');

# _______________________ usuarios _______________________
DELETE FROM usuario;
ALTER TABLE usuario AUTO_INCREMENT = 1;
INSERT INTO usuario (alias, contrasenia, nombre, dpi, correo, id_tipo_usuario, id_unidad_servicio)
VALUES ('jose', '$2a$10$pzaqGy/uyL8yRdQpyrNQf.5CM7U21zLHU5eFlDRzlI3e.IEU4KLkO', 'José Alvarado', '3645832900101', 'josedaniel.alvaradof@gmail.com', 1, 1);
INSERT INTO usuario (alias, contrasenia, nombre, dpi, correo, id_tipo_usuario, id_unidad_servicio)
VALUES ('daniel', '$2a$10$pzaqGy/uyL8yRdQpyrNQf.5CM7U21zLHU5eFlDRzlI3e.IEU4KLkO', 'Daniel Alvarado', '3645832900101', 'josedaniel.alvaradof@gmail.com', 2, 1);


