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

select * from empleado where id_empleado = 6;
        SELECT
            empleado.*,
            rol.nombre AS rol,
            unidad_jerarquizada.nombre_nuclear AS unidad_servicio,
            unidad_jerarquizada.siglas_jerarquicas,
            unidad_jerarquizada.tipo_unidad_servicio,
            municipio.nombre AS municipio,
            departamento_guate.nombre AS departamento_guate
        FROM empleado
        INNER JOIN rol ON empleado.id_rol = rol.id_rol
        INNER JOIN unidad_jerarquizada ON empleado.id_unidad_servicio = unidad_jerarquizada.id_unidad_servicio
        INNER JOIN municipio ON unidad_jerarquizada.id_municipio = municipio.id_municipio
        INNER JOIN departamento_guate ON municipio.id_departamento_guate = departamento_guate.id_departamento_guate
        WHERE id_empleado = 6
        LIMIT 1;