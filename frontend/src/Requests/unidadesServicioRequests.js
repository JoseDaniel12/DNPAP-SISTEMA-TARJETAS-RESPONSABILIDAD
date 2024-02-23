import requestSettings from './requestSettings';

const unidadesServicioRequests = {
    getUnidadesServicio: async (tipoUnidades) => {
        const url = `http://localhost:5000/unidadesServicio/${tipoUnidades}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    getUnidadServicio: async (id_unidad_servicio) => {
        const url = `http://localhost:5000/unidadesServicio/unidad-serivicio/${id_unidad_servicio}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    verificarDisponibilidadNombre: async (nombre) => {
        const url = `http://localhost:5000/unidadesServicio/disponibilidad-nombre/${nombre}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    verificarDisponibilidadSiglas: async (siglas) => {
        const url = `http://localhost:5000/unidadesServicio/disponibilidad-siglas/${siglas}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    registrarDepartamento: async (body) => {
        const url = `http://localhost:5000/unidadesServicio/registrar-departamento`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body),
        }).then(response => response.json());
    },

    editarDepartamento: async (idDepartamento, body) => {
        const url = `http://localhost:5000/unidadesServicio/editar-departamento/${idDepartamento}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'PUT',
            body: JSON.stringify(body),
        }).then(response => response.json());
    },

    registrarPrograma: async (body) => {
        const url = `http://localhost:5000/unidadesServicio/registrar-programa`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body),
        }).then(response => response.json());
    },

    editarPrograma: async (idPrograma, body) => {
        const url = `http://localhost:5000/unidadesServicio/editar-programa/${idPrograma}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'PUT',
            body: JSON.stringify(body),
        }).then(response => response.json());
    },

    eliminarUnidadServicio: async (idUnidad) => {
        const url = `http://localhost:5000/unidadesServicio/eliminar-unidadesServicio/${idUnidad}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'DELETE',
        }).then(response => response.json());
    },
}

export default unidadesServicioRequests;