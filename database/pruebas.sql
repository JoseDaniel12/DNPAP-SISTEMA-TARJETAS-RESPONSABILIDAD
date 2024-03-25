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

select * from registro

SELECT
    ROW_NUMBER() OVER (ORDER BY fecha) AS no_registro,
    registro.*
FROM registro
INNER JOIN tarjeta_responsabilidad USING(id_tarjeta_responsabilidad)
WHERE id_registro = ${id_registro};



WITH reg AS (
    SELECT *
    FROM registro
    WHERE id_registro = ${id_registro}
)

SELECT
    ROW_NUMBER() OVER (ORDER BY fecha) AS no_registro,
    registro.*
FROM tarjeta_responsabilidad
INNER JOIN registro USING(id_tarjeta_responsabilidad)




select * from log_actividad
select * from registro

select *
from registro
inner join log_actividad USING(fecha)