use dnpap;

select * from departamento_guate;
select * from municipio;
select * from unidad_servicio;
select * from rol;
select * from empleado;
select * from tarjeta_responsabilidad;
select * from registro;
select * from log_actividad;
select * from modelo;
select * from bien;
select * from kit;
select * from registro_bien;
select * from tipo_unidad_servicio;

SELECT GROUP_CONCAT(no_serie SEPARATOR ';') AS bienes
FROM bien;