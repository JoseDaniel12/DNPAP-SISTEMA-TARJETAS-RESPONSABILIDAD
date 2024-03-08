import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Column } from 'primereact/column';
import { SelectButton } from 'primereact/selectbutton';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { quetzalesTemplate } from '../../TableColumnTemplates';
import { useToast } from '../../../hooks/useToast';

import empleadoRequests from '../../../Requests/empleadoRequests';


function GestionEmpleados() {
    const toast = useToast('bottom-right');
    const navigate = useNavigate();

    const tiposEmpleados = [
        {  value: 'Activos' },
        {  value: 'De Baja' }
    ];

    const [empleados, setEmpleados] = useState([]);
    const [mostrarEmpleadosActivos, setMostrarEmpleadosActivos] = useState(true);
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


    const handleActivacionEmpleado = () => {
        empleadoRequests.activarEmpleado(filaSelccionada.id_empleado).then(response => {
            if (!response.error) {
                setEmpleados(prevEmpleados => prevEmpleados.filter(e => e.id_empleado !== filaSelccionada.id_empleado));
                toast.current.show({ severity: 'success', summary: 'Activar Empleado', detail: response.message, time: 3000 });
            } else  {
                toast.current.show({ severity: 'error', summary: 'Activar Empleado', detail: response.error, time: 3000 });
            }
        });
    };


    const darBajaEmpleado = () => {
        empleadoRequests.darBajaEmpleado(filaSelccionada.id_empleado).then(response => {
            if (!response.error) {
                setEmpleados(prevEmpleados => prevEmpleados.filter(e => e.id_empleado !== filaSelccionada.id_empleado));
                toast.current.show({ severity: 'success', summary: 'Baja Empleado', detail: response.message, time: 3000 });
            } else  {
                toast.current.show({ severity: 'error', summary: 'Baja Empleado', detail: response.error, time: 3000 });
            }
        });
    };


    const handleBajaEmpleado = () => {
        if (!filaSelccionada) return;
        confirmDialog({
            header: 'Baja de Empleado',
            message: '¿Estas seguro de dar de baja al empleado?',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: darBajaEmpleado
        });
    };


    const eliminarEmpleado = () => {
        empleadoRequests.eliminarEmpleado(filaSelccionada.id_empleado).then(response => {
            if (!response.error) {
                setEmpleados(prevEmpleados => prevEmpleados.filter(e => e.id_empleado !== filaSelccionada.id_empleado));
                toast.current.show({ severity: 'success', summary: 'Eliminar Empleado', detail: response.message, time: 3000 });
            } else  {
                toast.current.show({ severity: 'error', summary: 'Eliminar Empleado', detail: response.error, time: 3000 });
            }
        });
    };


    const handleEliminarEmpleado = () => {
        if (!filaSelccionada) return;
        confirmDialog({
            header: 'Eliminar Empleado',
            message: '¿Estas seguro de eliminar al empleado?',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: eliminarEmpleado
        });
    };


    useEffect(() => {
        if (mostrarEmpleadosActivos) {
            empleadoRequests.getEmpleados().then(response => {
                setEmpleados(response.data?.empleados);
            })
        } else {
            empleadoRequests.getEmpleadosDeBaja().then(response => {
                setEmpleados(response.data?.empleados);
            })
        }

        initFilters();
    }, [mostrarEmpleadosActivos]);


    const tableHeaderTemplate = () => (
        <div className='grid p-0'>
            <div className='col-12 md:col-8'>
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
            <div className='col md:min-w-max'>
                <SelectButton
                    options={tiposEmpleados} optionLabel='value'
                    value={mostrarEmpleadosActivos ? 'Activos' : 'De Baja'}
                    onChange={e => setMostrarEmpleadosActivos(e.value === 'Activos')}
                />
            </div>
        </div>
    );


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

                {
                    mostrarEmpleadosActivos ? (
                        <>
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
                                    type='button'
                                    label='Baja a Empleado'
                                    severity='danger'
                                    icon='pi pi-trash'
                                    className='md:w-auto p-button-outlined'
                                    onClick={handleBajaEmpleado}                    
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='col-12 md:max-w-max'>
                                <Button
                                    type='button'
                                    label='Activar Empleado'
                                    severity='help'
                                    icon='pi pi-check-circle'
                                    className='md:w-auto p-button-outlined'
                                    onClick={handleActivacionEmpleado}                    
                                />
                            </div>
                            <div className='col-12 md:max-w-max'>
                                <Button
                                    type='button'
                                    label='Eliminar Empleado'
                                    severity='danger'
                                    icon='pi pi-times'
                                    className='md:w-auto p-button-outlined'
                                    onClick={handleEliminarEmpleado}
                                />
                            </div>
                        </>
                    )
                }
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
                    paginatorPosition='top'
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Empleado {first} a {last} de  {totalRecords}'
                    rows={20}
                    scrollable
                    scrollHeight='400px'
                    showGridlines
                    stripedRows 
                    header={tableHeaderTemplate}
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