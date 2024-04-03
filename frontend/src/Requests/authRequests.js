import requestSettings from './requestSettings';

const authUrl = `${import.meta.env.VITE_BACKEND_URL}/auth`;

const authRequests = {
    verificarDisponibilidadDpi: async (dpi, rol) => {
        const url = `${authUrl}/verificar-disponibilidad-dpi/${dpi}/${rol}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

}

export default authRequests;