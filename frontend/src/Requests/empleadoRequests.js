import requestSettings from './requestSettings';

const empleadoRequests = {
    obtenerEmpleados: async (body) => {
        let url = 'http://localhost:5000/empleados/lista-empleados';
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    asignarBienes: async (body) => {
        let url = 'http://localhost:5000/empleados/asignar-bienes';
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => response.json());
    },

    trapasarBienes: async (body) => {
        let url = 'http://localhost:5000/empleados/traspasar-bienes';
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => response.json());
    },
}

export default empleadoRequests;