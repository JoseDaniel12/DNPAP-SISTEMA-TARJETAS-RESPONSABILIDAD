import { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Calendar } from 'primereact/calendar';
import { fechaTemplate } from '../../TableColumnTemplates';
import useTableFilters from '../../../hooks/useTableFilters';

import reportesRequests from '../../../Requests/reportesRequests';

function Bitacora() {
    const [logs, setLogs] = useState([]);
    
    // ______________________________  Filtros ______________________________
    const filtrosBitacora = useTableFilters({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        fecha: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
        dpi: { value: null, matchMode: FilterMatchMode.CONTAINS },
        nombres: { value: null, matchMode: FilterMatchMode.CONTAINS },
        apellidos: { value: null, matchMode: FilterMatchMode.CONTAINS },
        tipo_accion: { value: null, matchMode: FilterMatchMode.CONTAINS },
        no_tarjeta: { value: null, matchMode: FilterMatchMode.CONTAINS },
        no_registro: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    // ______________________________________________________________________


    useEffect(() => {
        reportesRequests.getLogsBitacoraActividades().then(response => {
            const logs = response.data;
            logs.map(l => l.fecha = new Date(l.fecha));
            setLogs(logs);
        });
        filtrosBitacora.initFilters();
    }, []);


    const dateFilterTemplate = (options) => {
        return <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" mask="99/99/9999" />;
    };

    const encabezadoTemplate = () => (
        <div className='grid'>
            <div className='col-12 md:max-w-max'>
                <Button
                    type='button'
                    icon='pi pi-filter-slash'
                    label='Limpiar Filtros'
                    style={{ color: '#6366f1' }}
                    outlined
                    onClick={filtrosBitacora.initFilters}
                />
            </div>
            <div className='col'>
                <span className='p-input-icon-left flex align-items-center'>
                    <i className='pi pi-search' />
                    <InputText
                        id='busquedaEmpleado'
                        value={filtrosBitacora.globalFilterValue}
                        placeholder='Buscar por valor clave'
                        onChange={filtrosBitacora.onGlobalFilterChange}
                    />
                </span>
            </div>
        </div>
    );

    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-12 text-center'>
                <h1 className='text-black-alpha-70 m-0 mb-2'>Bitacora de Actividades</h1>
            </div>

            <div className='col-12'>
                <DataTable
                    value={logs}
                    filters={filtrosBitacora.filters}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    paginatorPosition='top'
                    paginatorTemplate='CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageInput RowsPerPageDropdown w-auto'
                    currentPageReportTemplate='({currentPage} de  {totalRecords})'
                    scrollable
                    scrollHeight='800px'
                    showGridlines
                    stripedRows
                    header={encabezadoTemplate}
                >
                    <Column
                        field='fecha' header='Fecha' dataType='date' 
                        filter
                        filterElement={dateFilterTemplate}
                        body={row => fechaTemplate(row.fecha)}
                    />
                    <Column field='dpi' header='DPI' filter filterPlaceholder='Buscar por dpi'/>
                    <Column field='nombres' header='Nombres' filter filterPlaceholder='Buscar por nombres'/>
                    <Column field='apellidos' header='Apellidos' filter filterPlaceholder='Buscar por apellidos'/>
                    <Column field='tipo_accion' header='Tipo de Actividad' filter filterPlaceholder='Buscar por actividad'/>
                    <Column field='no_tarjeta' header='No. Tarjeta'  filter filterPlaceholder='Buscar por No. Tarjeta'/>
                    <Column field='no_registro' header='No. Registro' dataType='numeric' filter filterPlaceholder='Buscar por No. Registro'/>
                </DataTable>
            </div>
        </div>
    );
}

export default Bitacora;
