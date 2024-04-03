import requestSettings from './requestSettings';


const bienesURL = `${import.meta.env.VITE_BACKEND_URL}/bienes`;

const bienesRequests = {
    validarDisponibilidadSicoin: async (sicoin) => {
        const url = `${bienesURL}/verificar-disponibilidad-sicoin`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify({ sicoin })
        }).then(response => response.json());
    },

    validarDisponibilidadNoSerie: async (noSerie) => {
        const url = `${bienesURL}/verificar-disponibilidad-noSerie`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify({ noSerie })
        }).then(response => response.json());
    },

    registrarBienesComunes: async (requestBody) => {
        const url = `${bienesURL}/registro-bienes-comunes`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(requestBody)
        }).then(response => response.json());
    },

    getBienesSinAsignar: async () => {
        const url = `${bienesURL}/bienes-sin-asignar`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET'
        }).then(response => response.json());
    },

    getBienesAsignados: async () => {
        const url = `${bienesURL}/bienes-asignados`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET'
        }).then(response => response.json());
    },

    getBien: async (id_bien) => {
        const url = `${bienesURL}/bien/${id_bien}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET'
        }).then(response => response.json());
    },

    editarBien: async (id_bien, requestBody) => {
        const url = `${bienesURL}/editar-bien/${id_bien}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'PUT',
            body: JSON.stringify(requestBody)
        }).then(response => response.json());
    },

    eliminarBien: async (id_bien) => {
        const url = `${bienesURL}/eliminar-bien/${id_bien}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'DELETE'
        }).then(response => response.json());
    }
}

export default bienesRequests;