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

    getBienesAsignados: async () => {
        let url = 'http://localhost:5000/bienes/bienes-asignados';
        return await fetch(url, {
            ...requestSettings,
            method: 'GET'
        }).then(response => response.json());
    },

    getBien: async (id_bien) => {
        let url = `http://localhost:5000/bienes/bien/${id_bien}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET'
        }).then(response => response.json());
    },

    editarBien: async (id_bien, requestBody) => {
        let url = `http://localhost:5000/bienes/editar-bien/${id_bien}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'PUT',
            body: JSON.stringify(requestBody)
        }).then(response => response.json());
    },

    eliminarBien: async (id_bien) => {
        let url = `http://localhost:5000/bienes/eliminar-bien/${id_bien}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'DELETE'
        }).then(response => response.json());
    }
}

export default bienesRequests;