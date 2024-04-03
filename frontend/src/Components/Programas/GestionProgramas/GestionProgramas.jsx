import React, { useEffect, useState } from 'react'
import RegistroPrograma from '../RegistroPrograma/RegistroPrograma';
import EdicionPrograma from '../EdicionPrograma/EdicionPrograma';
import ListaProgramas from '../ListaProgramas/ListaProgramas';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';

import { useToast } from '../../../hooks/useToast';
import unidadesServicioRequests from '../../../Requests/unidadesServicioRequests';
import { tiposUnidadesServicio } from '../../../types/unidadesServicio';


function GestionProgramas() {
    const toast = useToast('bottom-right');

    // Programas
    const [programas, setProgramas] = useState([]);
    const [idProgramaSeleccionado, setIdProgramaSeleccionado] = useState(null);

    const [enEdicion, setEnEdicion] = useState(false);
    const [departamentos, setDepartamentos] = useState([]);


    const onSelectPrograma = (idPrograma) => {
        setIdProgramaSeleccionado(idPrograma);
    }


    const onSelectModoEdicion = () => {
        setEnEdicion(true);
    }


    const onProgramaRegistrado = (programa) => {
        setProgramas(prevProgramas => [...prevProgramas, programa]);
    }


    const onCancelEdicion = () => {
        setEnEdicion(false);
    }


    const onProgramaEditado = (programaEditado) => {
        setProgramas(prevProgramas => prevProgramas.map(programa => {
            if (programa.id_unidad_servicio !== programaEditado.id_unidad_servicio) return programa;
            return programaEditado;
        }));
    };


    const eliminarPrograma = (idPrograma) => {
        unidadesServicioRequests.eliminarUnidadServicio(idPrograma).then(response => {
            if (!response.error) {
                setProgramas(prevProgramas => prevProgramas.filter(programa => programa.id_unidad_servicio !== idPrograma));
                toast.current.show({severity: 'info', summary: 'Eliminación de Programa', detail: 'Eliminación exitosa.', life: 3000});
            } else  {
                toast.current.show({severity: 'error', summary: 'Eliminación de Departamento', detail: response.error, life: 5000});
            }
        });
    };


    const onSelectModoEliminacion = () => {
        setEnEdicion(false);
        confirmDialog({
            header: 'Eliminación de Programa',
            message: 'Estas Seguro de eliminar este Programa?',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => eliminarPrograma(idProgramaSeleccionado),
            reject: () => {}
        });
    }


    useEffect(() => {
        unidadesServicioRequests.getUnidadesServicio(tiposUnidadesServicio.PROGRAMA).then(response => {
            setProgramas(response.data.unidadesServicio);
        });

        unidadesServicioRequests.getUnidadesServicio(tiposUnidadesServicio.DEPARTAMENTO).then(response => {
            setDepartamentos(response.data.unidadesServicio);
        });
    }, []);


    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <ConfirmDialog dismissableMask={true} />

            <div className='col-12 text-center'>
                <h1 className='text-black-alpha-70 m-0 mb-2'>Gestión de Programas</h1>
            </div>

            <div className='col-12 md:col-4'>
                {
                    enEdicion
                    ? <EdicionPrograma
                        idProgramaSeleccionado={idProgramaSeleccionado}
                        onCancelEdicion={onCancelEdicion}
                        onProgramaEditado={onProgramaEditado}
                        departamentos={departamentos}
                    />
                    : <RegistroPrograma
                        onProgramaRegistrado={onProgramaRegistrado}
                    />
                }
            </div>  
            <div className='col-12 md:col-8'>
                <ListaProgramas 
                    programas={programas}
                    onSelectPrograma={onSelectPrograma}
                    onSelectModoEdicion={onSelectModoEdicion}
                    onSelectModoEliminacion={onSelectModoEliminacion}
                />
            </div>
        </div>
    );
}

export default GestionProgramas;