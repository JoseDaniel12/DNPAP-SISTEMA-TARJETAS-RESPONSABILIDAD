import requestSettings from './requestSettings';

const tarjetasRequests = {
    getTarjetaConBienes: async (id_tarjeta_responsabilidad) => {
        let url = `http://localhost:5000/tarjetas/bienes-activos-tarjeta/${id_tarjeta_responsabilidad}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    getRegistrosTarjeta: async (id_tarjeta_responsabilidad) => {
        let url = `http://localhost:5000/tarjetas/registros-tarjeta/${id_tarjeta_responsabilidad}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

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

    generarExcel: async (id_tarjeta_responsabilidad, fecha) => {
        let url = `http://localhost:5000/tarjetas/generar-excel-tarjeta/${id_tarjeta_responsabilidad}/${fecha}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',

        }).then(response => response.blob());
    },
    

    numeroDisponible: async (id_tarjeta_responsabilidad) => {
        let url = `http://localhost:5000/tarjetas/numero-disponible`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify({ id_tarjeta_responsabilidad })
        }).then(response => response.json());
    },
}

export default tarjetasRequests;