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
select * from registro_bien;

# Bienes que tiene un empleado y que estan activos en una tarjeta determinada
SELECT
    bienes_empleado.id_bien,
    bienes_empleado.sicoin,
    bienes_empleado.no_serie,
    bienes_empleado.no_inventario,
    bienes_empleado.fecha_registro,
    bienes_empleado.id_modelo,
    bienes_empleado.id_kit
FROM (
    # Bienes por empleado
    SELECT
        empleado.id_empleado,
        bien.*,
        (
            SUM(CASE WHEN ingreso = true THEN 1 ELSE 0 END) -
            SUM(CASE WHEN ingreso = false THEN 1 ELSE 0 END)
        ) AS disponible
    FROM empleado
    INNER JOIN tarjeta_responsabilidad ON empleado.id_empleado = tarjeta_responsabilidad.id_empleado
    INNER JOIN registro ON tarjeta_responsabilidad.id_tarjeta_responsabilidad = registro.id_tarjeta_responsabilidad
    INNER JOIN registro_bien ON registro.id_registro = registro_bien.id_registro
    INNER JOIN bien ON registro_bien.id_bien = bien.id_bien
    GROUP BY empleado.id_empleado, bien.id_bien
    HAVING disponible = true
) AS bienes_empleado
INNER JOIN tarjeta_responsabilidad USING(id_empleado)
WHERE tarjeta_responsabilidad.id_tarjeta_responsabilidad = 2;



# Bienes por empleado
SELECT
    empleado.id_empleado,
    bien.*,
    (
        SUM(CASE WHEN ingreso = true THEN 1 ELSE 0 END) -
        SUM(CASE WHEN ingreso = false THEN 1 ELSE 0 END)
    ) AS disponible
FROM empleado
INNER JOIN tarjeta_responsabilidad ON empleado.id_empleado = tarjeta_responsabilidad.id_empleado
INNER JOIN registro ON tarjeta_responsabilidad.id_tarjeta_responsabilidad = registro.id_tarjeta_responsabilidad
INNER JOIN registro_bien ON registro.id_registro = registro_bien.id_registro
INNER JOIN bien ON registro_bien.id_bien = bien.id_bien
GROUP BY empleado.id_empleado, bien.id_bien
HAVING disponible = true;

