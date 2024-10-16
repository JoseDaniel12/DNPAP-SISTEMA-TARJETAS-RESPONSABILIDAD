import requestSettings from './requestSettings';

const tarjetasURL = `${import.meta.env.VITE_BACKEND_URL}/tarjetas`;

const tarjetasRequests = {
    getNumeroTarjetasNecesarias: async (body) => {
        const url = `${tarjetasURL}/calcular-numero-tarjetas-necesarias`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => response.json());
    },

    numeroDisponible: async (id_tarjeta_responsabilidad) => {
        const url = `${tarjetasURL}/numero-disponible`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify({ id_tarjeta_responsabilidad })
        }).then(response => response.json());
    },

    cambiarNumeroTarjeta: async (id_tarjeta_responsabilidad, nuevoNumero) => {
        const url = `${tarjetasURL}/cambiar-numero/${id_tarjeta_responsabilidad}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'PUT',
            body: JSON.stringify({ nuevoNumero })
        }).then(response => response.json());
    },

    getTarjetaConBienes: async (id_tarjeta_responsabilidad) => {
        const url = `${tarjetasURL}/bienes-activos-tarjeta/${id_tarjeta_responsabilidad}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    getRegistrosTarjeta: async (id_tarjeta_responsabilidad) => {
        const url = `${tarjetasURL}/registros-tarjeta/${id_tarjeta_responsabilidad}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    generarExcel: async (id_tarjeta_responsabilidad) => {
        const url = `${tarjetasURL}/generar-excel-tarjeta/${id_tarjeta_responsabilidad}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.blob());
    },
};

export default tarjetasRequests;