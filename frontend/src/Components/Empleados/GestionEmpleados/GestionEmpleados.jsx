import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { quetzalesTemplate } from '../../TableColumnTemplates';


import empleadoRequests from '../../../Requests/empleadoRequests';


function GestionEmpleados() {
    const navigate = useNavigate();

    const [empleados, setEmpleados] = useState([]);
    const [filaSelccionada, setFilaSelccionada] = useState(null);

    // ______________________________  Filtros ______________________________
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState(null);
    const [filtrosAplicados, setFiltrosAplicados] = useState(false);


    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            dpi: { value: null, matchMode: FilterMatchMode.CONTAINS },
            nit: { value: null, matchMode: FilterMatchMode.CONTAINS },
            nombres: { value: null, matchMode: FilterMatchMode.CONTAINS },
            apellidos: { value: null, matchMode: FilterMatchMode.CONTAINS },
            cargo: { value: null, matchMode: FilterMatchMode.CONTAINS },
            saldo: { value: null, matchMode: FilterMatchMode.CONTAINS },
        });
        setGlobalFilterValue('');
    };  


    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };
    // ______________________________________________________________________


    const handleGestionarBienesTarjetas = () => {
        if (!filaSelccionada) return;
        const empleado = empleados.find(e => e.id_empleado === filaSelccionada.id_empleado);
        navigate(`/tarjetas-empleado/${empleado.id_empleado}`);
    };


    const handleEditarEmpleado = () => {
        if (!filaSelccionada) return;
        const empleado = empleados.find(e => e.id_empleado === filaSelccionada.id_empleado);
        navigate('/editar-empleado', { state: { empleado } });
    };


    const eliminarEmpleado = () => {
        empleadoRequests.eliminarEmpleado(filaSelccionada.id_empleado).then(response => {
            if (!response.error) {
                setEmpleados(prevEmpleados => prevEmpleados.filter(e => e.id_empleado !== filaSelccionada.id_empleado));
            }
        });
    };


    const handleEliminarEmpleado = () => {
        if (!filaSelccionada) return;
        confirmDialog({
            header: 'Eliminación de Empleado',
            message: '¿Estas seguro de eliminar al empleado?, Se eliminaran todas sus tarjetas con él.',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: eliminarEmpleado
        });
    };


    useEffect(() => {
        empleadoRequests.getEmpleados().then(response => {
            setEmpleados(response.data?.empleados);
        })

        initFilters();
    }, []);


    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <ConfirmDialog dismissableMask={true} />

            <div className='col-12 text-center'>
                <h1 className='text-black-alpha-70 m-0 mb-2'>Gestionar Empleados</h1>
            </div>

            <div className='col-12 md:max-w-max align-self-start'>
                    <Button 
                        label='Registrar Empleado'
                        severity='success'
                        icon='pi pi-plus'
                        className='md:w-auto p-button-outlined'
                        onClick={() => navigate('/registrar-empleado')}
                    />
            </div>

            <div className='col-12 md:col grid flex flex-wrap justify-content-center md:justify-content-end m-0 p-0'>
                <div className='col-12 md:max-w-max'>
                    <Button 
                        label='Gestionar Bines y Tarjetas'
                        severity='info'
                        icon='pi pi-file-edit'
                        className='md:w-auto p-button-outlined'
                        onClick={handleGestionarBienesTarjetas}
                    />
                </div>
                <div className='col-12 md:max-w-max'>
                    <Button
                        type='button'
                        label='Editar Empleado'
                        severity='warning'
                        icon='pi pi-pencil'
                        className='md:w-auto p-button-outlined'
                        onClick={handleEditarEmpleado}                    
                    />
                </div>
                <div className='col-12 md:max-w-max'>
                    <Button 
                        label='Eliminar Empleado'
                        severity='danger'
                        icon='pi pi-trash'
                        className='md:w-auto p-button-outlined'
                        onClick={handleEliminarEmpleado}                    
                    />
                </div>
            </div>

            <div className='col-12'>
                <DataTable 
                    value={empleados}
                    selectionMode='single'
                    selection={filaSelccionada}
                    onSelectionChange={e => setFilaSelccionada(e.value)}
                    rowClassName={fila => filaSelccionada?.id_empleado === fila.id_empleado ? 'bg-primary-100' : ''}
                    filters={filters}
                    paginator
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Empleado {first} a {last} de  {totalRecords}'
                    rows={20}
                    scrollable
                    scrollHeight='400px'
                    showGridlines
                    stripedRows 
                    header={
                        <div className='col-12  flex justify-content-end'>
                            <span className='p-input-icon-left flex align-items-center'>
                                <i className='pi pi-search' />
                                <InputText
                                    id='busquedaEmpleado'
                                    value={globalFilterValue}
                                    placeholder='Buscar por valor clave'
                                    onChange={onGlobalFilterChange} 
                                />
                            </span>
                        </div>
                    }
                >
                    <Column field='dpi' header='DPI' />
                    <Column field='nit' header='NIT' />
                    <Column field='nombres' header='Nombres' />
                    <Column field='apellidos' header='Apellidos' />
                    <Column field='cargo' header='Cargo' />
                    <Column field='saldo' header='Saldo' body={row => quetzalesTemplate(row.saldo)}/>
                </DataTable>
            </div>
        </div>
    );
}

export default GestionEmpleados;