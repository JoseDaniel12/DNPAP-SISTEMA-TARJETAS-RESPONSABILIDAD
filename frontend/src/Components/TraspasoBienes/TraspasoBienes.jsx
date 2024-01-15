import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { InputNumber } from 'primereact/inputnumber';
import { Divider } from 'primereact/divider';
import empleadoRequests from '../../Requests/empleadoRequests';
import tarjetasRequests from '../../Requests/tarjetasReuests';

import { tipoBien, empleado } from './mockData';

function TraspasoBienes() {
    const { id_tarjeta_responsabilidad } = useParams();
    const navigate = useNavigate();

    // Filtros de la tabla de empleados
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState(null);
    const [filtrosAplicados, setFiltrosAplicados] = useState(false);

    const [empleados, setEmpleados] = useState([]);
    const [empleado, setEmpleado] = useState(null);

    const [numeroTarjeta, setNumeroTarjeta] = useState('');
    const [numerosTarjetas, setNumerosTarjetas] = useState([]);

    const [bienes, setBienes] = useState([]);
    const [bienesPorTraspasar, setBienesPorTraspasar] = useState([]);

    const [numerosTarjetasEmisor, setNumerosTarjetasEmisor] = useState([]);
    const [numerosTarjetasReceptor, setNumerosTarjetasReceptor] = useState([]);


    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    
    const handleSeleccionarEmpleado = (id_empleado) => {
        const empleadoSeleccionado = empleados.find(empleado => empleado.id_empleado === id_empleado);
        setEmpleado(empleadoSeleccionado);
    };

    const handleAgregarBien = (id_bien) => {
        const bienSeleccionado = bienes.find(bien => bien.id_bien === id_bien);
        setBienesPorTraspasar(prevBienes => [...prevBienes, bienSeleccionado]);
    };


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


    useEffect(() => {
        empleadoRequests.obtenerEmpleados().then(response => {
            setEmpleados(response.empleados);
        });

        tarjetasRequests.getTarjetaConBienes(id_tarjeta_responsabilidad).then(response => {
            console.log(response)
            setBienes(response.data);
        });
    }, []);


    return (
        <div className='grid col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-12 text-center'>
                <h1 className='mb-1 text-black-alpha-70'>Traspaso de Bienes a Otro Empleado</h1>
            </div>

            <div className='col-12'>
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
                        <div className='p-0'>
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
                    <Column field="nombres" header="Nombres"/>
                    <Column field="apellidos" header="Apellidos"/>
                    <Column field="cargo" header="Cargo" />
                    <Column field="saldo" header="Saldo" body={empleado => preciosTemplate(empleado.saldo)}/>
                    <Column header="Seleccionar" body = {
                        (empleado) => (
                            <Button 
                                severity='info' label='Seleccionar' icon='pi pi-check'
                                className='p-button-success p-button-outlined w-auto'
                                onClick={() => handleSeleccionarEmpleado(empleado.id_empleado)}
                            />
                        )
                    } />
                </DataTable>

                <DataTable
                    value={empleado? [empleado] : []}
                    showGridlines
                    className='mb-2'
                    header = {
                        <div className='p-0'>
                            <div className='col-12 pb-0'>
                                <p>Empleado Receptor:</p>
                            </div>
                        </div>
                    }
                >
                    <Column field="dpi" header="DPI"/>
                    <Column field="nombres" header="Nombres"/>
                    <Column field="apellidos" header="Apellidos"/>
                    <Column field="cargo" header="Cargo" />
                    <Column field="saldo" header="Saldo" body={empleado => preciosTemplate(empleado.saldo)}/>
                </DataTable>

                <DataTable
                    value={bienes}
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
                        <div className='p-0'>
                            <p>Bienes de tarjeta No. 1245849:</p>
                            <span className="p-input-icon-left flex align-items-center">
                                <i className="pi pi-search" />
                                <InputText  
                                    placeholder="Buscar por valor clave"
                                />
                            </span>
                        </div>
                    }
                >
                    <Column field="fecha_registro" header="Fecha"/>
                    <Column field="sicoin" header="Sicoin"/>
                    <Column field="no_serie" header="No. Serie"/>
                    <Column field="no_inventario" header="No. Inventario" />
                    <Column header="Agregar" body = {
                        (bien) => (
                            <Button 
                                severity='info' label='Agregar' icon='pi pi-plus'
                                className='p-button-success p-button-outlined w-auto'
                                onClick={() => navigate(-1)}
                            />
                        )
                    } />
                </DataTable>

                <DataTable
                    value={bienesPorTraspasar}
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
                        <div className='p-0'>
                            <p>Bienes por Traspasar a Tarjeta No. 12583853:</p>
                            <span className="p-input-icon-left flex align-items-center">
                                <i className="pi pi-plus" />
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
                    <Column header="Eliminar" body = {
                        (empleado) => (
                            <Button 
                                severity='danger' label='Eliminar' icon='pi pi-times'
                                className='p-button-success p-button-outlined w-auto'
                                onClick={() => navigate(-1)}
                            />
                        )
                    } />
                </DataTable>
            </div>

            <div className='col-12 grid'>        
                <div className='col-12 md:col'>
                    <p>Se requieren <b>N</b> tarjetas nuevas para el <b>Emisor:</b> </p>
                    <div className='field col max-w-max p-0'>
                        <label className='font-bold text-black-alpha-80 block'>Agregar Tarjeta:</label>
                        <div className='flex flex-wrap gap-1'>
                            <div className='col p-0'>
                                <InputText 
                                    id='search' type='text' placeholder='No. Tarjeta'
                                    value={numeroTarjeta}
                                    onChange={(e) =>{}}
                                />
                            </div>
                            <div className='col-12 lg:max-w-max p-0'>
                                <Button 
                                    severity='success' label='Agregar' icon='pi pi-plus'
                                    onClick={() => {}}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="card flex flex-wrap gap-2 mb-4">
                        {/* {
                            numerosTarjetas.map((numero, index) => (
                                <Chip
                                    key={numero}
                                    label={numero} className="p-mr-2 p-mb-2" removable
                                    onRemove={() => {}}
                                />
                            ))
                        } */}
                    </div>
                </div>

                <Divider layout='vertical hidden md:inline'/>

                <div className='col-12 md:col'>
                    <p>Se requieren <b>N</b> tarjetas nuevas para el <b>Recepetor:</b> </p>
                    <div className='field col max-w-max p-0'>
                        <label className='font-bold text-black-alpha-80 block'>Agregar Tarjeta:</label>
                        <div className='flex flex-wrap gap-1'>
                            <div className='col p-0'>
                                <InputText 
                                    id='search' type='text' placeholder='No. Tarjeta'
                                    value={numeroTarjeta}
                                    onChange={(e) =>{}}
                                />
                            </div>
                            <div className='col-12 lg:max-w-max p-0'>
                                <Button 
                                    severity='success' label='Agregar' icon='pi pi-plus'
                                    onClick={() => {}}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="card flex flex-wrap gap-2 mb-4">
                        {/* {
                            numerosTarjetas.map((numero, index) => (
                                <Chip
                                    key={numero}
                                    label={numero} className="p-mr-2 p-mb-2" removable
                                    onRemove={() => {}}
                                />
                            ))
                        } */}
                    </div>
                </div>
            </div>

            <div className='col-12'>
                <div className='flex flex-wrap justify-content-between gap-2'>
                    <div className='col p-0'>
                        <Button 
                            severity='warning' label='Regresar' icon='pi pi-arrow-left'
                            onClick={() => navigate(-1)}
                        />
                    </div>

                    <div className='col p-0'>
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
