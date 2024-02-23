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
            empleado.*,
            unidad_servicio.nombre_nuclear AS unidad_servicio_nuclear
        FROM empleado
        INNER JOIN unidad_servicio ON empleado.id_unidad_servicio = unidad_servicio.id_unidad_servicio
        WHERE id_empleado = 4
        LIMIT 1;