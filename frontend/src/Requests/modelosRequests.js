import requestSettings from './requestSettings';

const modelosURL = `${import.meta.env.VITE_BACKEND_URL}/modelos`;

const modelosReuests = {
    registrarModelo: async (requestBody) => {
        const url = `${modelosURL}/crear-modelo-bien`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(requestBody)
        }).then(response => response.json());
    },

    getModelos: async () => {
        const url = `${modelosURL}/modelos-bienes`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET'
        }).then(response => response.json());
    },

    getModelo: async (id_modelo) => {
        const url = `${modelosURL}/modelo/${id_modelo}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET'
        }).then(response => response.json());
    },

    editarModelo: async (id_modelo, requestBody) => {
        const url = `${modelosURL}/modelo/${id_modelo}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'PUT',
            body: JSON.stringify(requestBody)
        }).then(response => response.json());
    },

    eliminarModelo: async (id_modelo) => {
        const url = `${modelosURL}/modelo/${id_modelo}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'DELETE'
        }).then(response => response.json());
    },

    getBienesModelo: async (id_modelo) => {
        const url = `${modelosURL}/bienes-de-modelo/${id_modelo}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET'
        }).then(response => response.json());
    },

    getEjemploArchvioCargaBienes: async () => {
        const url = `${modelosURL}/platilla-carga-bienes`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET'
        }).then(response => response.blob());
    },

    cargarBinesModeloMasivamente: async (id_modelo, formData) => {
        const url = `${modelosURL}/carga-masiva-bienes-modelo/${id_modelo}`;
        return await fetch(url, {
            ...requestSettings,
            headers: {},
            method: 'POST',
            body: formData
        }).then(response => response.json());
    }
};

export default modelosReuests;