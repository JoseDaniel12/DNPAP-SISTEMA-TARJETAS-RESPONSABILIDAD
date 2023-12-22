import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { bienes, historialPropietarios, bienSeleccionado } from './mockData';

function HistorialPropiedad() {

    const formatoMonedaGTQ = new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: 'GTQ',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const precioTemplate = (precio) => {
        if (!precio) return;
        return (
            <span>{formatoMonedaGTQ.format(precio)}</span>
        );
    };


    const seleccionarBienButton = (fila) => {
        return (
            <Button
                type='button' 
                icon='pi pi-check'
                className='p-button-success p-button-outlined w-auto'
                label='Seleccionar'
                size='small'
                onClick={() => {}}
            />
        );
    }

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

    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-12 text-center mb-2'>
                <h1 className=' mb-0 text-black-alpha-70'>
                    Historial de Propiedad
                </h1>
            </div>

            <div className='col-12'>
                <DataTable
                    value={bienes}
                    filters={{}}
                    paginator
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Bien {first} a {last} de  {totalRecords}'
                    rows={4}
                    scrollable
                    scrollHeight='360px'
                    showGridlines
                    stripedRows
                    size='small'
                    header={
                        <div className="col-12 -ml-2">
                        <label className='block mb-3'>Bienes en el sistema:</label>
                        <span className="p-input-icon-left flex align-items-center">
                            <i className="pi pi-search" />
                            <InputText value={null} onChange={() =>{}} 
                                placeholder="Buscar por valor clave"
                            />
                        </span>
                    </div>
                    }
                >
                    <Column field='sicoin' header='SICOIN'/>
                    <Column field='noSerie' header='No. Serie'/>
                    <Column field='noInventario' header='No. Inventario'/>
                    <Column field='descripcion' header='Descripción'/>
                    <Column field='precio' header='Precio' body={row => precioTemplate(row.precio)}/>
                    <Column field='fecha' header='Fecha Registro' body={dateBodyTemplate}/>
                    <Column header='Seleccionar' body={seleccionarBienButton}/>
                </DataTable>
            </div>

            <div className='col-12'>
                <DataTable
                    value={historialPropietarios}
                    filters={{}}
                    paginator
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Propietario {first} a {last} de  {totalRecords}'
                    rows={4}
                    scrollable
                    scrollHeight='360px'
                    showGridlines
                    stripedRows
                    size='small'
                    header={
                        <div className="col-12 -ml-2">
                        <label className='block mb-3'>Historial de propiedad del bien seleccionado:</label>
                        <DataTable
                            className='mb-2'
                            value={[bienSeleccionado]}
                        >
                            <Column field='sicoin' header='SICOIN'/>
                            <Column field='noSerie' header='No. Serie'/>
                            <Column field='noInventario' header='No. Inventario'/>
                            <Column field='descripcion' header='Descripción'/>
                            <Column field='precio' header='Precio' body={row => precioTemplate(row.precio)}/>
                            <Column field='fecha' header='Fecha Registro' body={dateBodyTemplate}/>
                        </DataTable>
                        <span className="p-input-icon-left flex align-items-center">
                            <i className="pi pi-search" />
                            <InputText value={null} onChange={() =>{}} 
                                placeholder="Buscar por valor clave"
                            />
                        </span>
                    </div>
                    }
                >
                    <Column field='nombre' header='Nombre Propietario'/>
                    <Column field='fecha' header='Fecha' sortable body={dateBodyTemplate}/>
                </DataTable>
            </div>

        </div>
    );
}

export default HistorialPropiedad;
