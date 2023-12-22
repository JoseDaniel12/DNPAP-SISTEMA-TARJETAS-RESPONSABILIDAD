import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { InputNumber } from 'primereact/inputnumber';

import { tipoBien, empleado, empleados } from './mockData';

function TraspasoBienes() {
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
                <h1 className=' -mb-4 text-black-alpha-70'>Traspaso de Bienes a Otro Empleado</h1>
            </div>

            <div className='col-12'>
                <DataTable
                    value={[tipoBien]}
                    rows={10}
                    showGridlines
                    className='mb-2'
                    header = {
                        <div className='-ml-2'>
                            <div className='col-12 pb-0'>
                                <p>Tipo de Bien por Traspasar:</p>
                            </div>
                        </div>
                    }
                >
                    <Column field="sicoin" header="SICOIN"/>
                    <Column field="noSerie" header="No. Serie"/>
                    <Column field="noInventario" header="Inventario"/>
                    <Column field="descripcion" header="Descripción"/>
                    <Column field="precio" header="Precio" body={bien => preciosTemplate(bien.precio)}/>
                    <Column field="cantDisponible" header="Cantidad Disponible" />
                </DataTable>

                <DataTable
                    value={[empleado]}
                    rows={10}
                    showGridlines
                    className='mb-2'
                    header = {
                        <div className='-ml-2'>
                            <div className='col-12 pb-0'>
                                <p>Empleado Receptor:</p>
                            </div>
                        </div>
                    }
                >
                    <Column field="dpi" header="DPI"/>
                    <Column field="nombre" header="Nombre"/>
                    <Column field="apellidos" header="Apellidos"/>
                    <Column field="cargo" header="Cargo" />
                    <Column field="saldo" header="Saldo" body={empleado => preciosTemplate(empleado.saldo)}/>
                </DataTable>

                <DataTable
                    value={empleados}
                    filters={filters}
                    paginator
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="Empleado {first} a {last} de  {totalRecords}"
                    rows={20}
                    scrollable
                    scrollHeight="300px"
                    showGridlines
                    stripedRows 
                    header = {
                        <div className='-ml-0'>
                            <p>Lista de Empleados:</p>
                            <span className="p-input-icon-left flex align-items-center">
                                <i className="pi pi-search" />
                                <InputText  
                                    placeholder="Buscar por valor clave"
                                />
                            </span>
                        </div>
                    }
                >
                    <Column header="No." body={(data, props) => props.rowIndex + 1}/>
                    <Column field="dpi" header="DPI"/>
                    <Column field="nombre" header="Nombre"/>
                    <Column field="apellidos" header="Apellidos"/>
                    <Column field="cargo" header="Cargo" />
                    <Column field="saldo" header="Saldo" body={empleado => preciosTemplate(empleado.saldo)}/>
                    <Column header="Seleccionar" body = {
                        (empleado) => (
                            <Button 
                                severity='info' label='Seleccionar' icon='pi pi-check'
                                className='p-button-success p-button-outlined w-auto'
                                onClick={() => navigate(-1)}
                            />
                        )
                    } />
                </DataTable>
            </div>

            <div className='col-12'>
                <div className='field col max-w-max p-0'>
                    <label className='font-bold text-black-alpha-80 block'>Cantidad de bienes por traspasar:</label>
                    <InputNumber value={0} onValueChange={() => {}} showButtons min={1} max={8}
                        decrementButtonClassName="p-button-primary"
                        incrementButtonClassName="p-button-primary"
                    />
                </div>

                <div className='flex flex-wrap justify-content-between'>
                    <div className='col-12 md:col-6 pl-0'>
                        <Button 
                            severity='warning' label='Regresar' icon='pi pi-arrow-left'
                            onClick={() => navigate(-1)}
                        />
                    </div>

                    <div className='col-12 md:col-6 pr-0'>
                        <Button
                            severity='info' label='Traspasar Bienes' icon='pi pi-arrow-right-arrow-left'
                            onClick={() => navigate(-1)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TraspasoBienes;
