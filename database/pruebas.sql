use dnpap;

select * from departamento_guate;
select * from municipio;
select * from direccion;
select * from departamento;
select * from programa;
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