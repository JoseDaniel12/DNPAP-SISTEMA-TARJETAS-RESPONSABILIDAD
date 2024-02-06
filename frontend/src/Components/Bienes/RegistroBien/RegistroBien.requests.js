import requestSettings from "../../../Requests/requestSettings";

export async function verficiarDisponibilidadSicoin(sicoin) {
    const url = 'http://localhost:5000/bienes/verificar-disponibilidad-sicoin';
    return await fetch(url, {
        ...requestSettings,
        method: 'POST',
        body: JSON.stringify({ sicoin })
    }).then(response => response.json());
}