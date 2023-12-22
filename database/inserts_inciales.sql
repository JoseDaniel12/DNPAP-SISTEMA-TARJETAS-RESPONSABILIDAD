USE dnpap;

# _______________________ Programas _______________________
DELETE FROM programa;
ALTER TABLE programa AUTO_INCREMENT = 1;
INSERT INTO programa (nombre) VALUES ('Jefatura');
INSERT INTO programa (nombre) VALUES ('Inmunizaciones');

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

# _______________________ Usuarios _______________________
DELETE FROM usuario;
ALTER TABLE usuario AUTO_INCREMENT = 1;
INSERT INTO usuario (alias, contrasenia, nombre, dpi, correo, id_tipo_usuario, id_unidad_servicio)
VALUES ('jose', '$2a$10$pzaqGy/uyL8yRdQpyrNQf.5CM7U21zLHU5eFlDRzlI3e.IEU4KLkO', 'José Alvarado', '3645832900101', 'josedaniel.alvaradof@gmail.com', 1, 1);
INSERT INTO usuario (alias, contrasenia, nombre, dpi, correo, id_tipo_usuario, id_unidad_servicio)
VALUES ('daniel', '$2a$10$pzaqGy/uyL8yRdQpyrNQf.5CM7U21zLHU5eFlDRzlI3e.IEU4KLkO', 'Daniel Alvarado', '3645832900101', 'josedaniel.alvaradof@gmail.com', 2, 1);

# _______________________ Empleados _______________________
DELETE FROM empleado;
ALTER TABLE empleado AUTO_INCREMENT = 1;
INSERT INTO empleado (nombres, apellidos, dpi, nit, cargo, saldo, id_unidad_servicio)
VALUES ('Carlos Leonel', 'Muñoz Lemus', '1234567890124', '123456710', 'gerente', 5000, 1);
INSERT INTO empleado (nombres, apellidos, dpi, nit, cargo, saldo, id_unidad_servicio)
VALUES ('Helen Janneth' , 'Martinez Sum', '1234567890123', '123456789', 'secretaria', 3000.50, 1);

# _______________________ Tarjetas de Responsabilidad _______________________
DELETE FROM tarjeta_responsabilidad;
ALTER TABLE tarjeta_responsabilidad AUTO_INCREMENT = 1;
INSERT INTO tarjeta_responsabilidad (numero, saldo , id_empleado)
VALUES ('10733', 3000, 1);
INSERT INTO tarjeta_responsabilidad (numero, saldo , id_empleado)
VALUES ('10788', 450.50, 1);

# _______________________ Registros de Tarjetas _______________________
DELETE FROM registro_tarjeta;
ALTER TABLE registro_tarjeta AUTO_INCREMENT = 1;
INSERT INTO registro_tarjeta (fecha, cantidad, es_ingreso, id_tarjeta_responsabilidad, id_usuario)
VALUES ('05/12/2023', 8, 1, 1, 1);
INSERT INTO registro_tarjeta (fecha, cantidad, es_ingreso, id_tarjeta_responsabilidad, id_usuario)
VALUES ('05/12/2023', 2, 0, 1, 1);

 