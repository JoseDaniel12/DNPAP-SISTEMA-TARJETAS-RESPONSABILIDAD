import { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import useTableFilters from '../../../hooks/useTableFilters';

import { quetzalesTemplate } from '../../TableColumnTemplates'

import reportesRequests from '../../../Requests/reportesRequests';


function BienesAsignados() {
    const [filas, setFilas] = useState([]);

    // ______________________________  Filtros ______________________________
    const filtrosBienes = useTableFilters({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        unidad: { value: null, matchMode: FilterMatchMode.CONTAINS },
        responsable: { value: null, matchMode: FilterMatchMode.CONTAINS },
        no_tarjeta: { value: null, matchMode: FilterMatchMode.CONTAINS },
        cant_bien: { value: null, matchMode: FilterMatchMode.EQUALS },
        descripcion: { value: null, matchMode: FilterMatchMode.CONTAINS },
        marca: { value: null, matchMode: FilterMatchMode.CONTAINS },
        modelo: { value: null, matchMode: FilterMatchMode.CONTAINS },
        no_serie: { value: null, matchMode: FilterMatchMode.CONTAINS },
        no_inventario: { value: null, matchMode: FilterMatchMode.CONTAINS },
        sicoin: { value: null, matchMode: FilterMatchMode.CONTAINS },
        precio_unitario: { value: null, matchMode: FilterMatchMode.EQUALS },
        monto: { value: null, matchMode: FilterMatchMode.EQUALS },
        saldo_tarjeta: { value: null, matchMode: FilterMatchMode.EQUALS },
    });
    // ______________________________________________________________________


    useEffect(() => {
        reportesRequests.resumenBienesAsignados().then(response => {
            setFilas(response.data);
        });
    }, []);


    const encabezadoTablaBienesTemplate = () => (
        <div className='grid'>
            <div className='col-12 md:max-w-max'>
                <Button
                    type='button'
                    icon='pi pi-filter-slash'
                    label='Limpiar Filtros'
                    style={{ color: '#6366f1' }}
                    outlined
                    onClick={filtrosBienes.initFilters}
                />
            </div>
            <div className='col'>
                <span className='p-input-icon-left flex align-items-center'>
                    <i className='pi pi-search' />
                    <InputText
                        id='busquedaBien'
                        value={filtrosBienes.globalFilterValue}
                        placeholder='Buscar por valor clave'
                        onChange={filtrosBienes.onGlobalFilterChange} 
                    />
                </span>
            </div>
            <div className='col-12 md:max-w-max'>
                <Button
                    type='button'
                    icon='pi pi-file-excel'
                    label='Generar Excel'
                    style={{color: '#217346'}}
                    outlined
                    onClick={() => {}}
                />
            </div>
            <div className='col-12 md:max-w-max'>
                <Button
                    type='button'
                    icon='pi pi-file-pdf'
                    label='Generar PDF'
                    style={{color: '#f20f00'}}
                    outlined
                    onClick={() => {}}
                />
            </div>
        </div>
    );


    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-12 text-center'>
                <h1 className='text-black-alpha-70 m-0 mb-2'>Reporte Bienes Asignados</h1>
            </div>

            <div className='col-12'>
                <DataTable 
                    value={filas}
                    filters={filtrosBienes.filters}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    paginatorPosition='top'
                    scrollable
                    scrollHeight='800px'
                    showGridlines
                    stripedRows 
                    header={encabezadoTablaBienesTemplate}
                >
                    <Column field='unidad' header='Unidad de Servicio' filter filterPlaceholder='Buscar por unidad'/>
                    <Column field='responsable' header='Responsable' filter filterPlaceholder='Buscar por responsable'/>
                    <Column field='no_tarjeta' header='No. Tarjeta' filter filterPlaceholder='Buscar por tarjeta'/>
                    <Column field='cant_bien' header='Cantidad' dataType='numeric' filter filterPlaceholder='Buscar por cantidad'/>
                    <Column field='descripcion' header='Descripción' filter filterPlaceholder='Buscar por descripción'/>
                    <Column field='marca' header='Marca' filter filterPlaceholder='Buscar por marca'/>
                    <Column field='modelo' header='Modelo' filter filterPlaceholder='Buscar por modelo'/>
                    <Column field='no_serie' header='No. Serie' filter filterPlaceholder='Buscar por  No. de serie'/>
                    <Column field='no_inventario' header='No. Inventario' filter filterPlaceholder='Buscar por  No. de inventario'/>
                    <Column field='sicoin' header='Sicoin' filter filterPlaceholder='Buscar por sicoin'/>
                    <Column field='precio_unitario' header='Precio Unitario' dataType='numeric'  filter filterPlaceholder='Buscar por precio unitario' body={row => quetzalesTemplate(row.precio_unitario)}/>
                    <Column field='monto' header='Monto' dataType='numeric'  filter filterPlaceholder='Buscar por monto' body={row => quetzalesTemplate(row.monto)}/>
                    <Column field='saldo_tarjeta' header='Saldo de Tarjeta' dataType='numeric'  filter filterPlaceholder='Buscar por saldo de tarjeta' body={row => quetzalesTemplate(row.saldo_tarjeta)}/>
                </DataTable>
            </div>
        </div>
    );
}

export default BienesAsignados;
