import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';

import { bienesGenerales, bienesPorAgregar } from './mockData';

function AgregarBienesTarjeta({visibilidad, setVisibilidad}) {
    const navigate = useNavigate();

    // Filtros de la tabla de empleados
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState(null);
    const [filtrosAplicados, setFiltrosAplicados] = useState(false);

    
    const [numeroTarjeta, setNumeroTarjeta] = useState('');
    const [numerosTarjetas, setNumerosTarjetas] = useState([]);


    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };


    useEffect(() => {
        fetch('http://localhost:5000/bienes/lista-bienes')
        .then(res => res.json())
        .then(data => setBienesGenerales(data.bienes));
    }, []);


    const formatoMonedaGTQ = new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: 'GTQ',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const preciosTemplate = (precio) => {
        return (
            <span>{formatoMonedaGTQ.format(precio)}</span>
        );
    };


    return (
        <div className='grid col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-12 text-center'>
                <h1 className=' -mb-4 text-black-alpha-70'>Agregar Bienes de un Mismo Tipo</h1>
                <h1 className='text-black-alpha-70'>a la Tarjeta No. 10733</h1>
            </div>

            <div className='col-12'>
                <DataTable
                    value={bienesGenerales}
                    rows={10}
                    paginator
                    scrollable
                    scrollHeight="280px"
                    showGridlines
                    stripedRows 
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="Bien {first} a {last} de  {totalRecords}"
                    className='mb-2'
                    header = {
                        <div>
                            <div className='col-12 pb-0'>
                                <p>Bienes sin vincular:</p>
                            </div>
                            <div className="col-12  flex justify-content-end">
                                <span className="p-input-icon-left flex align-items-center">
                                    <i className="pi pi-search" />
                                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} 
                                        placeholder="Buscar por valor clave"
                                    />
                                </span>
                            </div>
                        </div>
                    }
                >
                    <Column field="sicoin" header="SICOIN"/>
                    <Column field="noSerie" header="No. Serie"/>
                    <Column field="noInventario" header="Inventario"/>
                    <Column field="descripcion" header="Descripcion"/>
                    <Column field="precio" header="Precio" body={bien => preciosTemplate(bien.precio)}/>
                    <Column 
                        header="Agregar"
                        body = {
                            bien =>  (
                                <Button 
                                    type='button' 
                                    icon='pi pi-plus'
                                    className='p-button-success p-button-outlined w-auto'
                                    label="Agregar"
                                    onClick={() => {}}
                                />
                            )
                        }
                    />
                </DataTable>

                <DataTable
                    value={bienesPorAgregar}
                    rows={10}
                    paginator
                    scrollable
                    scrollHeight="280px"
                    showGridlines
                    stripedRows 
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="Bien {first} a {last} de  {totalRecords}"
                    header = {
                        <div>
                            <div className='col-12 pb-0'>
                                <p>Bienes Por Agregar:</p>
                            </div>
                            <div className="col-12  flex justify-content-end">
                                <span className="p-input-icon-left flex align-items-center">
                                    <i className="pi pi-search" />
                                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} 
                                        placeholder="Buscar por valor clave"
                                    />
                                </span>
                            </div>
                        </div>
                    }
                >
                    <Column field="sicoin" header="SICOIN"/>
                    <Column field="noSerie" header="No. Serie"/>
                    <Column field="noInventario" header="Inventario"/>
                    <Column field="descripcion" header="Descripcion"/>
                    <Column field="precio" header="Precio" body={bien => preciosTemplate(bien.precio)}/>
                    <Column 
                        header="Eliminar"
                        body = {
                            bien =>  (
                                <Button 
                                    type='button' 
                                    icon='pi pi-times'
                                    className='p-button-danger p-button-outlined w-auto'
                                    label="Eliminar"
                                    onClick={() => {}}
                                />
                            )
                        }
                    />
                </DataTable>
            </div>

            <div className='col-12'>
                <p>Se requieren <b>2</b> tarjetas nuevas: </p>
                <div className='field col max-w-max p-0'>
                    <label className='font-bold text-black-alpha-80 block'>Agregar Tarjeta:</label>
                    <div className='flex flex-wrap gap-1'>
                        <div className='col p-0'>
                            <InputText id='search' type='text' placeholder='No. Tarjeta'/>
                        </div>
                        <div className='col-12 lg:max-w-max p-0'>
                            <Button severity='success' label='Agregar' icon='pi pi-plus'/>
                        </div>
                    </div>
                </div>
                <div className="card flex flex-wrap gap-2 mb-4">
                        <Chip label="10733-1" className="p-mr-2 p-mb-2" removable/>
                        <Chip label="10733-1" className="p-mr-2 p-mb-2" removable/>
                </div>
                <div className='flex flex-wrap justify-content-between'>
                    <div className='col-12 md:col-6'>
                        <Button 
                            severity='warning' label='Regresar' icon='pi pi-arrow-left'
                            onClick={() => navigate(-1)}
                        />
                    </div>

                    <div className='col-12 md:col-6'>
                        <Button
                            severity='info' label='Agregar Bienes' icon='pi pi-plus'
                            onClick={() => navigate(-1)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AgregarBienesTarjeta;
