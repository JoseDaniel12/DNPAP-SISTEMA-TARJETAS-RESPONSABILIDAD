import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Steps } from 'primereact/steps';
import { useToast } from '../../hooks/useToast';
import { useMultistepForm } from '../../hooks/useMultiStepForm';
import ComentarioStep from './comentarioStep';
import NumerosTarjetasStep from './NumerosTarjetasStep';

import empleadoRequests from '../../Requests/empleadoRequests';


function ComentacionTarjeta({visible, setVisible, id_empleado, onComentarTarjeta}) {
    const toast = useToast('bottom-right');

    const initialData = {
        id_empleado: id_empleado,
        comentario: '',
        numerosTarjetas: []
    };

    const [data, setData] = useState(initialData);
    const updateFields = fields => setData(prev => { 
        return { ...prev, ...fields }
    });

    const { currentStepIndex, step, isFirstStep, isLastStep, goTo, back, next } = useMultistepForm([
        <ComentarioStep {...data} updateFields={updateFields}/>,
        <NumerosTarjetasStep {...data} updateFields={updateFields}/>
    ]);

    const items = [
        {
            label: 'Comentario'
        },
        {
            label: 'Tarjeta'
        }
    ];


    const resetData = () => {
        setData(initialData);
        goTo(0);
    };


    const onHide = () => {
        resetData();
        setVisible(false);
    };


    const handleComentarTarjetas = async () => {
        if (data.comentario === '') {
            return onHide();
        };

        const res = await empleadoRequests.comentarTarjetas(id_empleado, data);
        if (!res.error) {
            const tarjetaConNuevoRegistro = res.data;
            onComentarTarjeta(tarjetaConNuevoRegistro);
            toast.current.show({ severity: 'success', summary: 'Exito', detail: res.message });
            onHide();
         
        } else {
            toast.current.show({ severity: 'error', summary: 'Error', detail: res.error, sticky: true});
        }
    };


    const header = (
        <h2 className='font-semibold text-xl p-0 m-0'>Comentación de Tarjetas</h2>
    );


    return (
        <Dialog
            header={header}
            resizable={false}
            visible={visible}
            onHide={onHide}
            className='p-fluid bg-orange-800 w-11 md:w-5'
        >
            <Steps model={items} activeIndex={currentStepIndex} />

            <div className='py-3'>
                {step}
            </div>

            <div className='flex flex-wrap justify-content-between gap-2'>
                <div className='col p-0'>
                    {
                        !isFirstStep && (
                            <Button
                                type='button'
                                severity='warning'
                                label='Volver'
                                icon='pi pi-arrow-left'
                                onClick={back}
                            />
                        )
                    }
                </div>

                <div className='col p-0'>
                    {
                        !isLastStep ? (
                            <Button
                                type='button'
                                severity='warning'
                                label='Siguiente'
                                icon='pi pi-arrow-right'
                                onClick={next}
                            />
                        ) : (
                            <Button
                                type='button'
                                severity='info'
                                label='Comentar'
                                icon='pi pi-check'
                                onClick={handleComentarTarjetas}
                            />
                        )
                    }
                </div>
            </div>
        </Dialog>
    );
}

export default ComentacionTarjeta;