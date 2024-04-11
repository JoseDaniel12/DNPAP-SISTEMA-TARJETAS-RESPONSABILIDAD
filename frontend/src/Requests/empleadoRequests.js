import requestSettings from './requestSettings';


const empleadosURL = `${import.meta.env.VITE_BACKEND_URL}/empleados`;

const empleadoRequests = {
    getEmpleados: async () => {
        const url = `${empleadosURL}/lista-empleados`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    getEmpleadosDeBaja: async () => {
        const url = `${empleadosURL}/empleados-de-baja`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },


    activarEmpleado: async (id_empleado) => {
        const url = `${empleadosURL}/activar-empleado/${id_empleado}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'PUT',
        }).then(response => response.json());
    },

    getEmpleado: async (id_empleado) => {
        const url = `${empleadosURL}/empleado/${id_empleado}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    getListaAuxiliares: async () => {
        const url = `${empleadosURL}/lista-auxiliares`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    verificarDisponibilidadCorreo: async (correo) => {
        const url = `${empleadosURL}/verificar-disponibilidad-correo/${correo}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    registrarAuxiliar: async (body) => {
        const url = `${empleadosURL}/registar-auxiliar`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body),
        }).then(response => response.json());
    },

    editarAuxiliar: async (idAuxiliar, body) => {
        const url = `${empleadosURL}/editar-auxiliar/${idAuxiliar}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'PUT',
            body: JSON.stringify(body),
        }).then(response => response.json());
    },

    eliminarAuxiliar: async (idAuxiliar) => {
        const url = `${empleadosURL}/eliminar-auxiliar/${idAuxiliar}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'DELETE',
        }).then(response => response.json());
    },

    registrarEmpleado: async (body) => {
        const url = `${empleadosURL}/registar-empleado`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body),
        }).then(response => response.json());
    },

    editarEmpleado: async (id_empleado, body) => {
        const url = `${empleadosURL}/editar-empleado/${id_empleado}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'PUT',
            body: JSON.stringify(body),
        }).then(response => response.json());
    },

    darBajaEmpleado: async (id_empleado) => {
        const url = `${empleadosURL}/dar-baja-empleado/${id_empleado}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'PUT',
        }).then(response => response.json());
    },

    eliminarEmpleado: async (id_empleado) => {
        const url = `${empleadosURL}/eliminar-empleado/${id_empleado}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'DELETE',
        }).then(response => response.json());
    },

    getTarjetas: async (id_empleado) => {
        const url = `${empleadosURL}/obtener-tarjetas/${id_empleado}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    getBienes: async (id_empleado) => {
        const url = `${empleadosURL}/obtener-bienes/${id_empleado}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'GET',
        }).then(response => response.json());
    },

    asignarBienes: async (body) => {
        const url = `${empleadosURL}/asignar-bienes`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => response.json());
    },

    trapasarBienes: async (body) => {
        const url = `${empleadosURL}/traspasar-bienes`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => response.json());
    },

    desasignarBienes: async (body) => {
        const url = `${empleadosURL}/desasignar-bienes`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => response.json());
    },

    comentarTarjetas: async (id_empleado, body) => {
        const url = `${empleadosURL}/comentar-tarjeta/${id_empleado}`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => response.json());
    },
}

export default empleadoRequests;