
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SelectButton } from 'primereact/selectbutton';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';

import useTableFilters from '../../../hooks/useTableFilters';
import { quetzalesTemplate } from '../../TableColumnTemplates';
import bienesRequests from '../../../Requests/bienesRequests';

function GestionBienes() {
    const navigate = useNavigate();

    const tiposBienes = [
        {  value: 'Asignados' },
        {  value: 'Desasignados' }
    ];

    const [bienes, setBienes] = useState([]);


    // ______________________________  Filtros ______________________________
    const filtrosBienes = useTableFilters({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        sicoin: { value: null, matchMode: FilterMatchMode.CONTAINS },
        no_serie: { value: null, matchMode: FilterMatchMode.CONTAINS },
        no_inventario: { value: null, matchMode: FilterMatchMode.CONTAINS },
        codigo: { value: null, matchMode: FilterMatchMode.CONTAINS },
        marca: { value: null, matchMode: FilterMatchMode.CONTAINS },
        precio: { value: null, matchMode: FilterMatchMode.EQUALS },
        descripcion: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    // ______________________________________________________________________

    
    useEffect(() => {
        filtrosBienes.initFilters();
        bienesRequests.getBienes().then(response => {
            setBienes(response.data);
        })
    }, []);
    

    const encabezadoTablaBienesTemplate = () => (
        <div className='flex gap-1'>
            <div className='p-input-icon-left flex align-items-center'>
                <i className='pi pi-search'/>
                <InputText
                    id='busquedaEmpleado'
                    value={filtrosBienes.globalFilterValue}
                    placeholder='Buscar por valor clave'
                    onChange={filtrosBienes.onGlobalFilterChange} 
                />
            </div>
            <Button
                tooltip='Limpiar Filtros'
                tooltipOptions={{ position: 'bottom' }}
                icon='pi pi-filter-slash'
                severity='help'
                className='w-max-auto p-button-outlined'
                onClick={filtrosBienes.initFilters}
            />
        </div>
    );


    const accionesTemplate = (row) => {
        const bien = bienes.find(b => b.id_bien === row.id_bien);

        return (
            <div className='flex justify-content-start gap-2'>
                <Button
                    tooltip='Ir a Modelo del Bien'
                    tooltipOptions={{ position: 'bottom' }}
                    icon='pi pi-folder'
                    severity='warning'
                    className='p-button-rounded p-button-outlined'
                    onClick={() => navigate(`/gestionar-bienes2/${bien.id_modelo}`)}
                />

                {
                    row.id_tarjeta_responsabilidad && (
                        <Button
                            tooltip='Ir a tarjeta'
                            tooltipOptions={{ position: 'bottom' }}
                            icon='pi pi-arrow-right'
                            severity='info'
                            className='p-button-rounded p-button-outlined'
                            onClick={() => navigate(`/tarjetas-empleado/${bien.id_empleado}?id_tarjeta_responsabilidad=${bien.id_tarjeta_responsabilidad}`) }
                        />
                    )
                }
            </div>
        )
    };


    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <ConfirmDialog dismissableMask={true} />

            <div className='col-12 text-center'>
                <h1 className='text-black-alpha-70 m-0 mb-2'>Buscar Bienes Registrados</h1>
            </div>

            <div className='col-12'>
                <DataTable 
                    value={bienes}
                    filters={filtrosBienes.filters}
                    paginator
                    paginatorPosition='top'
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Bien {first} a {last} de  {totalRecords}'
                    rows={20}
                    scrollable
                    scrollHeight='400px'
                    showGridlines
                    stripedRows 
                    header={encabezadoTablaBienesTemplate}
                >
                    <Column field='sicoin' header='Sicoin' filter filterPlaceholder='Buscar por sicoin'/>
                    <Column field='no_serie' header='No. Serie' filter filterPlaceholder='Buscar por No. serie'/>
                    <Column field='no_inventario' header='No. Inventario' filter filterPlaceholder='Buscar por No. inventario'/>
                    <Column field='codigo' header='Codigo Modelo' filter filterPlaceholder='Buscar por codigo de modelo'/>
                    <Column field='marca' header='Marca' filter filterPlaceholder='Buscar por marca'/>
                    <Column field='precio' header='Precio' body={row => quetzalesTemplate(row.precio)} dataType='numeric' filter filterPlaceholder='Buscar por precio'/>
                    <Column field='descripcion' header='Descripción' filter filterPlaceholder='Buscar por descripcion'/>
                    <Column header='Acciones' body={accionesTemplate}/>
                </DataTable>
            </div>
        </div>
    );
}

export default GestionBienes;
