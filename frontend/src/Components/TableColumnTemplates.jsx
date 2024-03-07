import { format } from 'date-fns';

export const formatoMonedaGTQ = new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});


export const quetzalesTemplate = (monto) => {
    return (
        <span>{formatoMonedaGTQ.format(monto)}</span>
    );
}


export const fechaTemplate = (fecha, formato  = 'dd/MM/yyyy') => {
    return (
        <span>{format(fecha, formato)}</span>
    );
}