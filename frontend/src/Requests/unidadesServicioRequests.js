import requestSettings from './requestSettings';

const unidadesServicioRequests = {
    getUnidadesServicio: async () => {
        const url = 'http://localhost:5000/unidadesServicio';
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },
}

export default unidadesServicioRequests;