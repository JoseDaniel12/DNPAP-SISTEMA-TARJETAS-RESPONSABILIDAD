import requestSettings from './requestSettings';

const reportesURL = `${import.meta.env.VITE_BACKEND_URL}/reportes`;

const reportesRequests = {
    resumenBienesAsignados: async () => {
        const url = `${reportesURL}/resumen-bienes-asignados`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET'
        }).then(response => response.json());
    },

    excelResumenBienesAsignados: async (data) => {
        const url = `${reportesURL}/excel-resumen-bienes-asignados`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(data)
        }).then(response => response.blob());
    },

    getLogsBitacoraActividades: async () => {
        const url = `${reportesURL}/logs-bitacora-actividades`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET'
        }).then(response => response.json());
    },
};

export default reportesRequests;