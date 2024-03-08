import requestSettings from './requestSettings';

const authUrl = 'http://localhost:5000/auth';

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