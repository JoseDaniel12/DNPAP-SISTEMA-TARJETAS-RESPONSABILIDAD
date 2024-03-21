import requestSettings from './requestSettings';


const reportesURL = 'http://localhost:5000/reportes';

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
    }
}

export default reportesRequests;