import requestSettings from './requestSettings';

const tarjetasRequests = {
    getNumeroTarjetasNecesarias: async (body) => {
        let url = 'http://localhost:5000/tarjetas/calcular-numero-tarjetas-necesarias';
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => response.json());
    },

    getTarjetasEmpleado: async (id_empleado) => {
        let url = `http://localhost:5000/empleados/obtener-tarjetas/${id_empleado}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },


    generarPDF: async (id_tarjeta_responsabilidad, fecha) => {
        let url = `http://localhost:5000/tarjetas/generar-pdf-tarjeta/${id_tarjeta_responsabilidad}/${fecha}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',

        }).then(response => response.blob());
    },
}

export default tarjetasRequests;