import requestSettings from './requestSettings';


const reportesURL = 'http://localhost:5000/reportes';

const reportesRequests = {
    resumenBienesAsignados: async () => {
        const url = `${reportesURL}/resumen-bienes-asignados`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET'
        }).then(response => response.json());
    }
}

export default reportesRequests;