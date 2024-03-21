import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { useToast } from '../../hooks/useToast';

import tarjetasRequests from '../../Requests/tarjetasRequests';


function AgregacionNumerosTarjetas({cantTarjetas, numerosTarjetas, setNumerosTarjetas}) {
    const toast = useToast('bottom-right');
    const [numeroTarjeta, setNumeroTarjeta] = useState('');

    const validarNumTarjeta = async numeroTarjeta => {
        if (numerosTarjetas.includes(numeroTarjeta)) return false;
        return await tarjetasRequests.numeroDisponible(numeroTarjeta).then(res => res.data);
    };

    const handleAgregarTarjeta = async () => {
        if (numeroTarjeta === '') return;
        if (numerosTarjetas.length === cantTarjetas) return;

        const numDisponible = await validarNumTarjeta(numeroTarjeta);
        if (numDisponible) {
            setNumerosTarjetas(prevNumeros => [...prevNumeros, numeroTarjeta]);
            setNumeroTarjeta('');
        } else {
            const error = `El numero de tarjeta ${numeroTarjeta} ya existe.`;
            toast.current.show({severity:'error', summary: 'Ingreso de Tarjetas', detail: error, life: 2500});
        }
    };

    const handleEliminarTarjeta = numeroTarjeta => {
        setNumerosTarjetas(prevNumeros => prevNumeros.filter(num => num !== numeroTarjeta));
    };


    return (
        <div className='w-full'>
            <div>
                <p>Tarjetas Ingresadas: <b>{numerosTarjetas.length}/{cantTarjetas}</b> </p>
            </div>
            <div className='field max-w-max p-0 mb-1'>
                <label className='font-bold text-black-alpha-80 block'>Agregar Tarjeta:</label>
                <div className='flex flex-wrap gap-1'>
                    <div className='col p-0'>
                        <InputText 
                            id='search' type='text' placeholder='No. Tarjeta'
                            value={numeroTarjeta}
                            onChange={e => setNumeroTarjeta(e.target.value)}
                        />
                    </div>
                    <div className='col-12 lg:max-w-max p-0'>
                        <Button 
                            severity='success' 
                            label='Agregar' 
                            icon='pi pi-plus'
                            onClick={handleAgregarTarjeta}
                        />
                    </div>
                </div>
            </div>
            <div className='w-full my-2' style={{maxHeight: '80px', overflowY: 'scroll'}}>
                <div className='flex flew-row flex-wrap align-items-start gap-2'>
                    {
                        numerosTarjetas.map(numero => (
                            <Chip
                                key={numero}
                                label={numero}
                                removable
                                onRemove={() => handleEliminarTarjeta(numero)}
                            />
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

export default AgregacionNumerosTarjetas;
