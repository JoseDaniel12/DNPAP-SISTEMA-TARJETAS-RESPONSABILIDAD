use dnpap;

select * from departamento;
select * from municipio;
select * from unidad_servicio;
select * from usuario;

SELECT
    usuario.*,
    tipo_usuario.nombre as tipo_usuario
FROM usuario
INNER JOIN tipo_usuario USING (id_tipo_usuario)
WHERE alias = 'jose' AND contrasenia = '123'
LIMIT 1;