import requestSettings from './requestSettings';

const empleadoRequests = {
    getEmpleado: async (id_empleado) => {
        const url = `http://localhost:5000/empleados/empleado/${id_empleado}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    getEmpleados: async (body) => {
        const url = 'http://localhost:5000/empleados/lista-empleados';
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    getListaAuxiliares: async () => {
        const url = 'http://localhost:5000/auxiliares/lista-auxiliares';
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    verificarDisponibilidadCorreo: async (correo) => {
        const url = `http://localhost:5000/auxiliares/verificar-disponibilidad-correo/${correo}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    registrarAuxiliar: async (body) => {
        const url = 'http://localhost:5000/auxiliares/registar-auxiliar';
        return await fetch(url, {
            ...requestSettings,
            method: 'PUT',
            body: JSON.stringify(body),
        }).then(response => response.json());
    },

    editarAuxiliar: async (idAuxiliar, body) => {
        const url = `http://localhost:5000/empleados/editar-auxiliar/${idAuxiliar}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'PUT',
            body: JSON.stringify(body),
        }).then(response => response.json());
    },

    eliminarEmpleado: async (id_empleado) => {
        const url = `http://localhost:5000/empleados/eliminar-empleado/${id_empleado}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'DELETE',
        }).then(response => response.json());
    },

    getBienes: async (id_empleado) => {
        const url = `http://localhost:5000/empleados/obtener-bienes/${id_empleado}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    asignarBienes: async (body) => {
        const url = 'http://localhost:5000/empleados/asignar-bienes';
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => response.json());
    },

    trapasarBienes: async (body) => {
        const url = 'http://localhost:5000/empleados/traspasar-bienes';
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => response.json());
    },

    desasignarBienes: async (body) => {
        const url = 'http://localhost:5000/empleados/desasignar-bienes';
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => response.json());
    },
}

export default empleadoRequests;