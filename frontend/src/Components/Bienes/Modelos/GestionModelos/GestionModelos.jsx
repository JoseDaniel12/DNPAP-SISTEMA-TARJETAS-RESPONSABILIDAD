import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from "primereact/datatable";
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import useTableFilters from '../../../../hooks/useTableFilters';
import { useToast } from '../../../../hooks/useToast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';

import { quetzalesTemplate } from '../../../TableColumnTemplates';
import modelosRequests from '../../../../Requests/modelosRequests';

function GestionModelos() {
    const toast = useToast('bottom-right');
    const navigate = useNavigate();
    const [modelos, setModelos] = useState([]);

    const [registroModeloVisible, setRegistroModeloVisible] = useState(false);

    // ______________________________  Filtros ______________________________
    const filtrosModelos = useTableFilters({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        descripcion: { value: null, matchMode: FilterMatchMode.CONTAINS },
        marca: { value: null, matchMode: FilterMatchMode.CONTAINS },
        codigo: { value: null, matchMode: FilterMatchMode.CONTAINS },
        precio: { value: null, matchMode: FilterMatchMode.EQUALS },
        cant_bienes: { value: null, matchMode: FilterMatchMode.EQUALS },
    });
    // ______________________________________________________________________


    const eliminarModelo = (id_modelo) => {
        modelosRequests.eliminarModelo(id_modelo).then(response => {
            if (!response.error) {
                setModelos(prev => prev.filter(m => m.id_modelo !== id_modelo));
                toast.current.show({ severity: 'success', summary: 'Eliminación de Modelo', detail: response.message });
            } else {
                toast.current.show({ severity: 'error', summary: 'Eliminación de Modelo', detail: response.error, life: 6000});
            }
        });
    };


    const handleEliminarModelo = (id_modelo) => {
        confirmDialog({
            header: 'Eliminación de Modelo de Bien',
            message: '¿Estas seguro de eliminar el Modelo?, eliminara todos sus bienes con él.',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => eliminarModelo(id_modelo)
        });
    };

    useEffect(() => {
        modelosRequests.getModelos().then(response => {
            setModelos(response.data);
        });
    }, []);


    const tableHeaderTemplate = (
        <div className='grid'>
            <div className='col-12 md:col-8 flex gap-1'>
                <div className='p-input-icon-left flex align-items-center'>
                    <i className='pi pi-search'/>
                    <InputText
                        id='busquedaEmpleado'
                        value={filtrosModelos.globalFilterValue}
                        placeholder='Buscar por valor clave'
                        onChange={filtrosModelos.onGlobalFilterChange} 
                    />
                </div>
                <Button
                    tooltip='Limpiar Filtros'
                    tooltipOptions={{ position: 'bottom' }}
                    icon='pi pi-filter-slash'
                    severity='help'
                    className='w-max-auto p-button-outlined'
                    onClick={filtrosModelos.initFilters}
                />
            </div>

            <div className='col'>
                <Button
                    icon='pi pi-plus'
                    severity='success'
                    label='Registrar Modelo'
                    className='p-button-outlined'
                    onClick={() => navigate(`/registrar-modelo`) }
                />  
            </div>
        </div>
    );


    const accionesTemplate = (row) => {
        const modelo = modelos.find(m => m.id_modelo === row.id_modelo);

        return (
            <div className='flex justify-content-center gap-2'>
                <Button
                    tooltip='Gestionar Bienes del Modelo'
                    tooltipOptions={{ position: 'bottom' }}
                    icon='pi pi-box'
                    severity='info'
                    className='p-button-rounded p-button-outlined'
                    onClick={() => navigate(`/gestionar-bienes2/${modelo.id_modelo}`) }
                />
                <Button
                    tooltip='Editar'
                    tooltipOptions={{ position: 'bottom' }}
                    icon='pi pi-pencil'
                    severity='warning'
                    className='p-button-rounded p-button-outlined'
                    onClick={() => navigate(`/editar-modelo/${modelo.id_modelo}`)}
                />
                <Button
                    tooltip='Eliminar'
                    tooltipOptions={{ position: 'bottom' }}
                    icon='pi pi-times'
                    severity='danger'
                    className='p-button-rounded p-button-outlined'
                    onClick={() => handleEliminarModelo(modelo.id_modelo)}
                />
            </div>
        );
    };
    

    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <ConfirmDialog dismissableMask={true} />

            <div className='col-12 text-center'>
                <h1 className='text-black-alpha-70 m-0 mb-2'>Gestionar Modelos de Bienes</h1>
            </div>

            <div className='col-12'>
                <DataTable 
                    value={modelos}
                    selectionMode='single'
                    filters={filtrosModelos.filters}
                    paginator
                    paginatorPosition='top'
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Modelo {first} a {last} de  {totalRecords}'
                    rows={20}
                    scrollable
                    scrollHeight='400px'
                    showGridlines
                    stripedRows 
                    header={tableHeaderTemplate}
                >
                    <Column field='descripcion' header='Descripción' filter filterPlaceholder='Buscar por descripción'/>
                    <Column field='marca' header='Marca' filter filterPlaceholder='Buscar por marca' />
                    <Column field='codigo' header='Codigo'  filter filterPlaceholder='Buscar por codigo'/>
                    <Column field='precio' header='Precio' body={row => quetzalesTemplate(row.precio)} dataType='numeric' filter filterPlaceholder='Buscar por precio'/>
                    <Column field='cant_bienes' header='Cant. Bienes' dataType='numeric' filter filterPlaceholder='Buscar por cant. de bienes'/>
                    <Column header='Acciones' body={accionesTemplate} />
                </DataTable>
            </div>
        </div>
    );
}

export default GestionModelos;
