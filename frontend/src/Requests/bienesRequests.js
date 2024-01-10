import requestSettings from './requestSettings';

const bienesRequests = {
    validarDisponibilidadSicoin: async (sicoin) => {
        let url = 'http://localhost:5000/bienes/verificar-disponibilidad-sicoin';
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify({ sicoin })
        }).then(response => response.json());
    },

    validarDisponibilidadNoSerie: async (noSerie) => {
        let url = 'http://localhost:5000/bienes/verificar-disponibilidad-noSerie';
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify({ noSerie })
        }).then(response => response.json());
    },

    registrarBienesComunes: async (requestBody) => {
        let url = 'http://localhost:5000/bienes/registro-bienes-comunes';
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(requestBody)
        }).then(response => response.json());
    },

    getBienesSinAsignar: async () => {
        let url = 'http://localhost:5000/bienes/bienes-sin-asignar';
        return await fetch(url, {
            ...requestSettings,
            method: 'GET'
        }).then(response => response.json());
    },
}

export default bienesRequests;