import requestSettings from './requestSettings';

const authRequests = {
    verificarDisponibilidadDpi: async (dpi, rol) => {
        let url = `http://localhost:5000/auth/verificar-disponibilidad-dpi/${dpi}/${rol}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

}

export default authRequests;