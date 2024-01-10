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


delete from modelo;
ALTER TABLE modelo AUTO_INCREMENT = 1;

delete from bien;
ALTER TABLE bien AUTO_INCREMENT = 1;

delete from registro;
ALTER TABLE registro AUTO_INCREMENT = 1;

delete from registro_bien;
ALTER TABLE registro_bien AUTO_INCREMENT = 1;


            SELECT * FROM tarjeta_responsabilidad
            WHERE id_empleado = ${id_empleado}
            ORDER BY tarjeta_responsabilidad.fecha DESC;

SET time_zone = 'America/Guatemala';
 SELECT CURRENT_TIMESTAMP(6)
 SELECT NOW(6);

 SELECT @@session.time_zone;
SHOW VARIABLES LIKE '%time_zone%';
                SELECT
                    tarjeta_responsabilidad.fecha
                FROM tarjeta_responsabilidad
                INNER JOIN registro USING(id_tarjeta_responsabilidad)
                WHERE registro.id_tarjeta_responsabilidad = ${tarjeta.id_tarjeta_responsabilidad}
                ORDER BY registro.fecha DESC;