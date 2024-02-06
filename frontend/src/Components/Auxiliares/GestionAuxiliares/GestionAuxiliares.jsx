import React, { useEffect, useState } from 'react'
import RegistroAuxiliar from '../RegistroAuxiliar/RegistroAuxiliar';
import EdicionAuxiliar from '../EdicionAuxiliar/EdicionAuxiliar';
import ListaAuxiliares from '../ListaAuxiliares/ListaAuxiliares';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';

import { useToast } from '../../../hooks/useToast';
import empleadoRequests from '../../../Requests/empleadoRequests';


function GestionAuxiliares() {
    const toast = useToast('bottom-right');

    // Auxiliares
    const [auxiliares, setAuxiliares] = useState([]);
    const [enEdicion, setEnEdicion] = useState(false);
    const [idAuxiliarSeleccionado, setIdAuxiliarSeleccionado] = useState(null);


    const onSelectAuxiliar = (idAuxiliar) => {
        setIdAuxiliarSeleccionado(idAuxiliar);
    }


    const onSelectModoEdicion = () => {
        setEnEdicion(true);
    }


    const onSelectModoEliminacion = () => {
        setEnEdicion(false);
        confirmDialog({
            header: 'Eliminación de Auxiliar',
            message: 'Estas Seguro de eliminar este Auxiliar?',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => eliminarAuxiliar(idAuxiliarSeleccionado),
            reject: () => {}
        });
    }


    const onAuxiliarRegistrado = (auxiliar) => {
        setAuxiliares(prevAuxiliares => [...prevAuxiliares, auxiliar]);
    }


    const onCancelEdicion = () => {
        setIdAuxiliarSeleccionado(null);
        setEnEdicion(false);
    }


    const onAuxiliarEditado = (auxiliar) => {
        setAuxiliares(prevAuxs => prevAuxs.map(aux => {
            if (aux.id_empleado !== auxiliar.id_empleado) return aux;
            return auxiliar;
        }));
    };


    const eliminarAuxiliar = (idAuxiliar) => {
        empleadoRequests.eliminarEmpleado(idAuxiliar).then(response => {
            if (!response.error) {
                setAuxiliares(prevAuxs => prevAuxs.filter(aux => aux.id_empleado !== idAuxiliar));
                toast.current.show({severity: 'info', summary: 'Eliminación de Auxiliar', detail: 'Eliminación exitosa.', life: 3000});
            }
        });
    };


    useEffect(() => {
        empleadoRequests.getListaAuxiliares().then(response => {
            setAuxiliares(response.data.auxiliares);
        });
    }, []);


    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <ConfirmDialog dismissableMask={true} />

            <div className='col-12 text-center'>
                <h1 className='text-black-alpha-70 m-0 mb-2'>Gestión de Auxiliares</h1>
            </div>

            <div className='col-12 md:col-5'>
                {
                    enEdicion
                    ? <EdicionAuxiliar
                        idAuxiliarSeleccionado={idAuxiliarSeleccionado}
                        onCancelEdicion={onCancelEdicion}
                        onAuxiliarEditado={onAuxiliarEditado}
                    />
                    : <RegistroAuxiliar
                        onAuxiliarRegistrado={onAuxiliarRegistrado}
                    />
                }
            </div>  
            <div className='col-12 md:col-7'>
                <ListaAuxiliares 
                    auxiliares={auxiliares}
                    onSelectAuxiliar={onSelectAuxiliar}
                    onSelectModoEdicion={onSelectModoEdicion}
                    onSelectModoEliminacion={onSelectModoEliminacion}
                />
            </div>
        </div>
    );
}

export default GestionAuxiliares;