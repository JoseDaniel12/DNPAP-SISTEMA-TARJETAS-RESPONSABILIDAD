import requestSettings from './requestSettings';

const empleadoRequests = {
    asignarBienes: async (body) => {
        let url = 'http://localhost:5000/empleados/asignar-bienes';
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => response.json());
    },

}

export default empleadoRequests;