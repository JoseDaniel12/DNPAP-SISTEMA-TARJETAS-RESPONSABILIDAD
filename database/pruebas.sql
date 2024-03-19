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

drop view reporte_bienes_activos;



SELECT
    ROW_NUMBER() OVER(PARTITION BY id_empleado ORDER BY id_empleado) AS no_correlativo,
    reporte_bienes_activos.*
FROM reporte_bienes_activos
INNER JOIN (
    WITH di
    SELECT
        COUNT(DISTINCT id_empleado)
    FROM reporte_bienes_activos
) AS f1;

SELECT
    (
        SELECT COUNT(DISTINCT id_empleado) AS no_correlativo,
        rba.id_empleado
        FROM reporte_bienes_activos
    ) AS no_correlativo,
    rba.*
FROM
    reporte_bienes_activos rba
GROUP BY
