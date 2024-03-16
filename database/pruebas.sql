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


SELECT
    tarjeta_responsabilidad.numero AS no_tarjeta,
    CONCAT(empleado.nombres, ' ', empleado.apellidos) AS responsable,
    (
        SELECT tr.numero
        FROM tarjeta_responsabilidad tr
        WHERE tr.id_tarjeta_responsabilidad = registro.id_tarjeta_receptora
    ) AS no_tarjeta_receptora,
    (
        SELECT CONCAT(e.nombres, ' ', e.apellidos) AS nuevo_responsable
        FROM tarjeta_responsabilidad tr
        INNER JOIN empleado e ON tr.id_empleado = e.id_empleado
        WHERE tr.id_tarjeta_responsabilidad = registro.id_tarjeta_receptora
    ) AS nuevo_responsable,
    registro.cantidad,
    modelo.descripcion,
    bien.no_inventario,
    unidad_jerarquizada.nombre_nuclear AS unidad,
    bien.sicoin,
    modelo.precio,
    tarjeta_responsabilidad.saldo AS monto_tarjeta
FROM unidad_jerarquizada
INNER JOIN empleado ON unidad_jerarquizada.id_unidad_servicio = empleado.id_unidad_servicio
INNER JOIN tarjeta_responsabilidad ON empleado.id_empleado = tarjeta_responsabilidad.id_empleado
INNER JOIN registro ON tarjeta_responsabilidad.id_tarjeta_responsabilidad = registro.id_tarjeta_responsabilidad
INNER JOIN registro_bien ON registro.id_registro = registro_bien.id_registro
INNER JOIN bien ON registro_bien.id_bien = bien.id_bien
INNER JOIN modelo ON bien.id_modelo = modelo.id_modelo
ORDER BY registro.fecha