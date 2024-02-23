USE dnpap;

# _______________________ Departamentos guate _______________________
ALTER TABLE departamento_guate AUTO_INCREMENT = 1;
INSERT INTO departamento_guate (nombre) VALUES ('Guatemala');
INSERT INTO departamento_guate (nombre) VALUES ('Sacatepéquez');
INSERT INTO departamento_guate (nombre) VALUES ('Sacatepéquez');
INSERT INTO departamento_guate (nombre) VALUES ('Escuintla');
INSERT INTO departamento_guate (nombre) VALUES ('Santa Rosa');
INSERT INTO departamento_guate (nombre) VALUES ('Sololá');
INSERT INTO departamento_guate (nombre) VALUES ('Totonicapán');
INSERT INTO departamento_guate (nombre) VALUES ('Quetzaltenango');
INSERT INTO departamento_guate (nombre) VALUES ('Suchitepéquez');
INSERT INTO departamento_guate (nombre) VALUES ('Retalhuleu');
INSERT INTO departamento_guate (nombre) VALUES ('San Marcos');
INSERT INTO departamento_guate (nombre) VALUES ('Huehuetenango');
INSERT INTO departamento_guate (nombre) VALUES ('Quiché');
INSERT INTO departamento_guate (nombre) VALUES ('Baja Verapaz');
INSERT INTO departamento_guate (nombre) VALUES ('Alta Verapaz');
INSERT INTO departamento_guate (nombre) VALUES ('Petén');
INSERT INTO departamento_guate (nombre) VALUES ('Izabal');
INSERT INTO departamento_guate (nombre) VALUES ('Zacapa');
INSERT INTO departamento_guate (nombre) VALUES ('Chiquimula');
INSERT INTO departamento_guate (nombre) VALUES ('Jalapa');
INSERT INTO departamento_guate (nombre) VALUES ('Jutiapa');
INSERT INTO departamento_guate (nombre) VALUES ('El Progreso');


# _______________________ Municipios _______________________
# Gautemala
INSERT INTO municipio (nombre, id_departamento_guate) VALUES ('Guatemala', 1);
# Sacatepéquez
INSERT INTO municipio (nombre, id_departamento_guate) VALUES ('Antigua Guatemala', 2);
INSERT INTO municipio (nombre, id_departamento_guate) VALUES ('Ciudad Vieja', 2);
# Chimaltenango
INSERT INTO municipio (nombre, id_departamento_guate) VALUES ('Chimaltenango', 3);
INSERT INTO municipio (nombre, id_departamento_guate) VALUES ('San Pedro Sacatepéquez', 3);

# _______________________ Tipos de Unidades de Servicio _______________________
INSERT INTO tipo_unidad_servicio (nombre) VALUES ('Dirección');
INSERT INTO tipo_unidad_servicio (nombre) VALUES ('Departamento');
INSERT INTO tipo_unidad_servicio (nombre) VALUES ('Programa');


# _______________________ Unidades de Servicio _______________________
# Direcciones:
INSERT INTO unidad_servicio (nombre_nuclear, siglas, id_tipo_unidad_servicio, id_municipio)
VALUES ('Direccion de Normatividad de Programas de Atención a las Personas', 'DNPAP', 1, 1);
# Departamentos:
INSERT INTO unidad_servicio (nombre_nuclear, siglas, id_unidad_superior,  id_tipo_unidad_servicio)
VALUES ('Departamento de Inmunizaciones', 'DI', 1, 2);
# Programas:
INSERT INTO unidad_servicio (nombre_nuclear, siglas, id_unidad_superior,  id_tipo_unidad_servicio)
VALUES ('Programa de Salud Buco Dental', 'PSBD', 2, 3);


# _______________________ Roles _______________________
ALTER TABLE rol AUTO_INCREMENT = 1;
INSERT INTO rol (nombre) VALUES ('Coordinador');
INSERT INTO rol (nombre) VALUES ('Auxiliar');
INSERT INTO rol (nombre) VALUES ('Ordinario');


# _______________________ Empleados _______________________
INSERT INTO empleado (correo, contrasenia, nombres, apellidos, dpi, nit, cargo, id_unidad_servicio, id_rol)
VALUES ('admin@gmail.com', '$2a$10$7NSD5Ga8QsMnabFWp0txL.7l9Lyf2MaUGdj2AfYQUbGt0/zRh2Aka', 'José Miguel', 'Alvarado Aguilar', '3645832900101', '3645832900', 'Admin1', 1, 1);
INSERT INTO empleado (correo, contrasenia, nombres, apellidos, dpi, nit, cargo, id_unidad_servicio, id_rol)
VALUES ('admin2@gmail.com', '$2a$10$7NSD5Ga8QsMnabFWp0txL.7l9Lyf2MaUGdj2AfYQUbGt0/zRh2Aka', 'Paco Sebastian', 'Batres Feuntes', '89530993422102', '78345678', 'Admin2', 1, 1);
INSERT INTO empleado (correo, contrasenia, nombres, apellidos, dpi, nit, cargo, id_unidad_servicio, id_rol)
VALUES ('auxiliar@gmail.com', '$2a$10$7NSD5Ga8QsMnabFWp0txL.7l9Lyf2MaUGdj2AfYQUbGt0/zRh2Aka', 'Daniel  Armando', 'Fajardo Figueroa', '7356343899272', '3645832900', 'Auxiliar1', 2, 2);
INSERT INTO empleado (nombres, apellidos, dpi, nit, cargo, id_unidad_servicio, id_rol)
VALUES ('Mario Ernesto', 'Montes Recions', '756342567723', '5645832900', 'Empleado1', 3, 3);
INSERT INTO empleado (nombres, apellidos, dpi, nit, cargo, id_unidad_servicio, id_rol)
VALUES ('Pedro Paco', 'Gutierrez Lopez', '89356743455152', '893567434', 'Empleado2', 3, 3);
