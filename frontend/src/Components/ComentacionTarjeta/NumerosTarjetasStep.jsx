import { useState, useEffect } from 'react';
import AgregacionNumerosTarjetas from "../AgregacionNumerosTarjetas/AgregacionNumerosTarjetas";
import { useToast } from '../../hooks/useToast';

import { accionesTarjeta } from '../../types/accionesTarjeta';
import tarjetasRequests from '../../Requests/tarjetasReuests';

function NumerosTarjetasStep({ id_empleado, comentario, numerosTarjetas, updateFields }) {
    const toast = useToast('bottom-right');

    const [cantTarjetas, setCantTarjetas] = useState(0);
    const [numsTarjetas, setNumsTarjetas] = useState(numerosTarjetas);

    useEffect(() => {
        tarjetasRequests.getNumeroTarjetasNecesarias({ id_empleado, operacion: accionesTarjeta.COMENTACION, comentario  }).then(res => {
            if (!res.error) {
                setCantTarjetas(res.data);
            } else {
                toast.current.show({ severity: 'error', summary: 'Error', detail: res.error, sticky: true});
            }
        });
    }, []);

    useEffect(() => {
        updateFields({ numerosTarjetas: numsTarjetas });
    }, [numsTarjetas]);

    return (
        <div>
            <AgregacionNumerosTarjetas 
                cantTarjetas={cantTarjetas}
                numerosTarjetas={numsTarjetas}
                setNumerosTarjetas={setNumsTarjetas}
            />
        </div>
    );
}

export default NumerosTarjetasStep;
