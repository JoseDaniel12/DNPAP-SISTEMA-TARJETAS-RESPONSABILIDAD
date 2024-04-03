import React, { useEffect, useState } from 'react'
import RegistroDepartamento from '../RegistroDepartamento/RegistroDepartamento';
import EdicionDepartamento from '../EdicionDepartamento/EdicionDepartamento';
import ListaDepartamentos from '../ListaDepartamentos/ListaDepartamentos';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';

import { useToast } from '../../../hooks/useToast';
import unidadesServicioRequests from '../../../Requests/unidadesServicioRequests';
import { tiposUnidadesServicio } from '../../../types/unidadesServicio';


function GestionDepartamentos() {
    const toast = useToast('bottom-right');

    // Departamentos
    const [departamentos, setDepartamentos] = useState([]);
    const [enEdicion, setEnEdicion] = useState(false);
    const [idDepartamentoSeleccionado, setIdDepartamentoSeleccionado] = useState(null);


    const onSelectDepartamento = (idDepartamento) => {
        setIdDepartamentoSeleccionado(idDepartamento);
    }


    const onSelectModoEdicion = () => {
        setEnEdicion(true);
    }


    const onDepartamentoRegistrado = (departamento) => {
        setDepartamentos(prevDepartamentos => [...prevDepartamentos, departamento]);
    }


    const onCancelEdicion = () => {
        setEnEdicion(false);
    }


    const onDepartamentoEditado = (departamento) => {
        setDepartamentos(prevDepas => prevDepas.map(depa => {
            if (depa.id_unidad_servicio !== departamento.id_unidad_servicio) return depa;
            return departamento;
        }));
    };


    const eliminarDepartamento = (idDepartamento) => {
        unidadesServicioRequests.eliminarUnidadServicio(idDepartamento).then(response => {
            if (!response.error) {
                setDepartamentos(prevDepas => prevDepas.filter(depa => depa.id_unidad_servicio !== idDepartamento));
                toast.current.show({severity: 'info', summary: 'Eliminación de Departamento', detail: 'Eliminación exitosa.', life: 3000});
            } else {
                toast.current.show({severity: 'error', summary: 'Eliminación de Departamento', detail: response.error, life: 5000});
            }
        });
    };


    const onSelectModoEliminacion = () => {
        setEnEdicion(false);
        confirmDialog({
            header: 'Eliminación de Departamento',
            message: 'Estas Seguro de eliminar este Departamento?',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => eliminarDepartamento(idDepartamentoSeleccionado),
            reject: () => {}
        });
    }


    useEffect(() => {
        unidadesServicioRequests.getUnidadesServicio(tiposUnidadesServicio.DEPARTAMENTO).then(response => {
            setDepartamentos(response.data.unidadesServicio);
        });
    }, []);


    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <ConfirmDialog dismissableMask={true} />

            <div className='col-12 text-center'>
                <h1 className='text-black-alpha-70 m-0 mb-2'>Gestión de Departamentos</h1>
            </div>

            <div className='col-12 md:col-4'>
                {
                    enEdicion
                    ? <EdicionDepartamento
                        idDepartamentoSeleccionado={idDepartamentoSeleccionado}
                        onCancelEdicion={onCancelEdicion}
                        onDepartamentoEditado={onDepartamentoEditado}
                    />
                    : <RegistroDepartamento
                        onDepartamentoRegistrado={onDepartamentoRegistrado}
                    />
                }
            </div>  
            <div className='col-12 md:col-8'>
                <ListaDepartamentos 
                    departamentos={departamentos}
                    onSelectDepartamento={onSelectDepartamento}
                    onSelectModoEdicion={onSelectModoEdicion}
                    onSelectModoEliminacion={onSelectModoEliminacion}
                />
            </div>
        </div>
    );
}

export default GestionDepartamentos;