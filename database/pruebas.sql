use dnpap;

select * from departamento_guate;
select * from municipio;
select * from unidad_servicio;
select * from rol;
select * from empleado;
select * from tarjeta_responsabilidad;
select * from registro;
select * from log;
select * from modelo;
select * from bien;
select * from kit;
select * from registro_bien;
select * from tipo_unidad_servicio;

SELECT * FROM bien_activo;

select * from bien_inactivo;



SELECT
    bien.id_bien,
    empleado.id_empleado,
    (
        SUM(CASE WHEN registro.ingreso = true THEN 1 ELSE 0 END) -
        SUM(CASE WHEN registro.ingreso = false THEN 1 ELSE 0 END)
    ) as prueba
FROM empleado
INNER JOIN tarjeta_responsabilidad ON empleado.id_empleado = tarjeta_responsabilidad.id_empleado
INNER JOIN registro ON tarjeta_responsabilidad.id_tarjeta_responsabilidad = registro.id_tarjeta_responsabilidad
INNER JOIN registro_bien ON registro.id_registro = registro_bien.id_registro
INNER JOIN bien ON registro_bien.id_bien = bien.id_bien
GROUP BY empleado.id_empleado, bien.id_bien
HAVING (
    SUM(CASE WHEN registro.ingreso = true THEN 1 ELSE 0 END) -
    SUM(CASE WHEN registro.ingreso = false THEN 1 ELSE 0 END)
) = 1;

drop view if exists bien_inactivo