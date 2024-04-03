import requestSettings from './requestSettings';

const unidadesServicioURL = `${import.meta.env.VITE_BACKEND_URL}/unidadesServicio`;

const unidadesServicioRequests = {
    getUnidadesServicio: async (tipoUnidades) => {
        const url = `${unidadesServicioURL}/${tipoUnidades}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    getUnidadServicio: async (id_unidad_servicio) => {
        const url = `${unidadesServicioURL}/unidad-serivicio/${id_unidad_servicio}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    verificarDisponibilidadNombre: async (nombre) => {
        const url = `${unidadesServicioURL}/disponibilidad-nombre/${nombre}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    verificarDisponibilidadSiglas: async (siglas) => {
        const url = `${unidadesServicioURL}/disponibilidad-siglas/${siglas}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    registrarDepartamento: async (body) => {
        const url = `${unidadesServicioURL}/registrar-departamento`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body),
        }).then(response => response.json());
    },

    editarDepartamento: async (idDepartamento, body) => {
        const url = `${unidadesServicioURL}/editar-departamento/${idDepartamento}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'PUT',
            body: JSON.stringify(body),
        }).then(response => response.json());
    },

    registrarPrograma: async (body) => {
        const url = `${unidadesServicioURL}/registrar-programa`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body),
        }).then(response => response.json());
    },

    editarPrograma: async (idPrograma, body) => {
        const url = `${unidadesServicioURL}/editar-programa/${idPrograma}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'PUT',
            body: JSON.stringify(body),
        }).then(response => response.json());
    },

    eliminarUnidadServicio: async (idUnidad) => {
        const url = `${unidadesServicioURL}/eliminar-unidadesServicio/${idUnidad}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'DELETE',
        }).then(response => response.json());
    },
}

export default unidadesServicioRequests;