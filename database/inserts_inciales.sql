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

# _______________________ Administradores _______________________
DELETE FROM administrador;
ALTER TABLE administrador AUTO_INCREMENT = 1;
INSERT INTO administrador (alias, contrasenia, nombre, dpi, correo, id_unidad_servicio) 
VALUES ('jose', '123', '3645832900101', 'josedaniel.alvaradof@gmail.com', 1);

