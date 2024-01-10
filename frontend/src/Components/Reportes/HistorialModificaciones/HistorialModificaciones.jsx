import { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';

import { modificaciones } from './mockData.js';

function HistorialModificaciones() {
    // Filtros de la tabla
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState(null);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            descripcion: { value: null, matchMode: FilterMatchMode.EQUALS },
            fecha: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
            },
            autor: { value: null, matchMode: FilterMatchMode.EQUALS },
            dpi: { value: null, matchMode: FilterMatchMode.EQUALS },
        });
        setGlobalFilterValue("");
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };


    useEffect(() => {
        initFilters();
    }, []);


    const formatDate = (date) => {
        const dateObject = date;
        
        if (isNaN(dateObject.getTime())) {
            return 'Invalid Date';
        }

        const day = (dateObject.getDate() ).toString().padStart(2, '0');
        const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObject.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const dateBodyTemplate = (fila) => {
        return formatDate(fila.fecha);
    };

    const dateFilterTemplate = (options) => {
        return (
          <Calendar
            value={options.value}
            onChange={(e) => options.filterCallback(e.value, options.index)}
            dateFormat="dd/mm/yy"
            placeholder="dd/mm/yyyy"
            mask="99/99/9999"
          />
      );
    }

    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-12 text-center mb-2'>
                <h1 className=' mb-0 text-black-alpha-70'>
                    Historial de Modificaciones
                </h1>
            </div>

            <div className='col-12'>
                <DataTable
                    value={modificaciones}
                    filters={filters}
                    paginator
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Modificación {first} a {last} de  {totalRecords}'
                    rows={4}
                    scrollable
                    scrollHeight='360px'
                    showGridlines
                    stripedRows
                    header = {
                        <div className='col-12  flex justify-content-end'>
                            <span className='p-input-icon-left flex align-items-center'>
                                <i className='pi pi-search' />
                                <InputText
                                    id='busquedaEmpleado'
                                    value={''}
                                    placeholder='Buscar por valor clave'
                                    onChange={() => {}} 
                                />
                            </span>
                        </div>
                    }
                >
                    <Column field='descripcion' header='Descripción' filter filterPlaceholder='descripcion'/>
                    <Column field='fecha' header='Fecha' body={dateBodyTemplate} filterField="fecha" dataType="date" filter filterPlaceholder='fecha' filterElement={dateFilterTemplate}/>
                    <Column field='autor' header='Autor' filter filterPlaceholder='autor'/>
                    <Column field='dpi' header='DPI' filter filterPlaceholder='dpi'/>
                </DataTable>    
            </div>
        </div>
    );
}

export default HistorialModificaciones;
