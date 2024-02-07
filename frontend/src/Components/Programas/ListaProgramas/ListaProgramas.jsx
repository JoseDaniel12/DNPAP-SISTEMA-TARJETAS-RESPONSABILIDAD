import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';


function ListaDepartamentos({ departamentos, onSelectDepartamento, onSelectModoEdicion, onSelectModoEliminacion }) {
    const [filaSelccionada, setFilaSelccionada] = useState(null);

    // ______________________________  Filtros ______________________________
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState(null);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
            siglas: { value: null, matchMode: FilterMatchMode.CONTAINS },
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

    const handleSelectionRow = (e) => {
        setFilaSelccionada(e.value); 
        onSelectDepartamento(e.value.id_unidad_servicio);
    };
   

    const handleSelectModoEdicion = () => {
        if (!filaSelccionada) return;
        onSelectModoEdicion();
    };

    const handleSelectModoEliminacion = () => {
        if (!filaSelccionada) return;
        onSelectModoEliminacion();
    };


    useEffect(() => {
        initFilters();
    }, []);


    const tableHeaderTemplate = () => {
        return (
            <div className='grid'>
                <div className='col'>
                    <span className='p-input-icon-left flex align-items-center'>
                        <i className='pi pi-search' />
                        <InputText
                            id='busquedaDepartamento'
                            value={globalFilterValue}
                            placeholder='Buscar por valor clave'
                            onChange={onGlobalFilterChange} 
                        />
                    </span>
                </div>

                <div className='col-12 md:max-w-max p-0 grid flex flex-wrap justify-content-center md:justify-content-end m-0 p-0'>
                    <div className='col-12 md:max-w-max'>
                        <Button
                            type='button'
                            label='Editar'
                            severity='warning'
                            icon='pi pi-pencil'
                            className='p-button-rounded md:w-auto p-button-outlined'
                            onClick={handleSelectModoEdicion}                    
                        />
                    </div>
                    <div className='col-12 md:max-w-max'>
                        <Button 
                            label='Eliminar'
                            severity='danger'
                            icon='pi pi-trash'
                            className='p-button-rounded md:w-auto p-button-outlined'
                            onClick={handleSelectModoEliminacion}
                        />
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className='col-12'>
            <DataTable 
                value={departamentos}
                selectionMode='single'
                selection={filaSelccionada}
                onSelectionChange={handleSelectionRow}
                rowClassName={fila => filaSelccionada?.id_unidad_servicio === fila.id_unidad_servicio ? 'bg-primary-100' : ''}
                filters={filters}
                paginator
                paginatorPosition='top'
                paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                currentPageReportTemplate='Departamento {first} a {last} de  {totalRecords}'
                rows={20}
                scrollable
                scrollHeight='268px'
                showGridlines
                stripedRows
                header={tableHeaderTemplate}
            >
                <Column field='nombre_nuclear' header='Nombre' />
                <Column field='siglas' header='Siglas' />
                <Column field='siglas_jerarquicas' header='Siglas Jerarquicas' />
            </DataTable>
        </div>
    );
}

export default ListaDepartamentos;