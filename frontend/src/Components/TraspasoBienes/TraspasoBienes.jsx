import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { useToast } from '../../hooks/useToast';
import AgregacionNumerosTarjeta from '../AgregacionNumerosTarjetas/AgregacionNumerosTarjetas';

import { accionesTarjeta } from '../../types/accionesTarjeta';
import empleadoRequests from '../../Requests/empleadoRequests';
import tarjetasRequests from '../../Requests/tarjetasReuests';


function TraspasoBienes() {
    const toast = useToast('bottom-right');
    const params = useParams();
    const id_empleado_emisor = parseInt(params.id_empleado_emisor);
    const navigate = useNavigate();

    // Filtros de la tabla de empleados
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState(null);
    const [filtrosAplicados, setFiltrosAplicados] = useState(false);

    const [empleados, setEmpleados] = useState([]);
    const [empleadoReceptor, setEmpleadoReceptor] = useState(null);

    const [bienes, setBienes] = useState([]);
    const [bienesPorTraspasar, setBienesPorTraspasar] = useState([]);

    const [cantTarjetasEmisor, setCantTarjetasEmisor] = useState(0);
    const [cantTarjetasReceptor, setCantTarjetasReceptor] = useState(0);
    const cantTarjetasNesecarias = cantTarjetasEmisor + cantTarjetasReceptor;
    const [tarjetas, setTarjetas] = useState([]);

    const [numeroTarjetaEmisor, setNumeroTarjetEmisor] = useState('');
    const [numerosTarjetasEmisor, setNumerosTarjetasEmisor] = useState([]);
    
    const [numeroTarjetaReceptor, setNumeroTarjetaReceptor] = useState([]);
    const [numerosTarjetasReceptor, setNumerosTarjetasReceptor] = useState([]);

    const [errorEmpleadoReceptor, setErrorEmpleadoReceptor] = useState(true);


    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    
    const handleSeleccionarEmpleado = (id_empleado) => {
        const empleadoSeleccionado = empleados.find(empleado => empleado.id_empleado === id_empleado);
        setEmpleadoReceptor(empleadoSeleccionado);
        setErrorEmpleadoReceptor(false);
    };


    const handleAgregarBien = (id_bien) => {
        const bienSeleccionado = bienes.find(bien => bien.id_bien === id_bien);
        setBienesPorTraspasar(prevBienes => [...prevBienes, bienSeleccionado]);
        setBienes(prevBienes => prevBienes.filter(bien => bien.id_bien !== id_bien));
    };

    const validarNumTarjeta = async numeroTarjeta => {
        if (
            numerosTarjetasEmisor.includes(numeroTarjeta) ||
            numerosTarjetasReceptor.includes(numeroTarjeta)
        ) return false;
        return await tarjetasRequests.numeroDisponible(numeroTarjeta).then(res => res.data);
    };

    const handleAgregarTarjetaEmisor = async () => {
        if (numeroTarjetaEmisor === '') return;
        const numDisponible = await validarNumTarjeta(numeroTarjetaEmisor);
        if (!numDisponible) {
            const error = `El numero de tarjeta ${numeroTarjetaEmisor} ya existe.`;
            toast.current.show({severity:'error', summary: 'Error', detail: error, life: 2500, position: 'top-center'});
        } else {
            setNumerosTarjetasEmisor(prevNumeros => [...prevNumeros, numeroTarjetaEmisor]);
        }
        setNumeroTarjetEmisor('');
    };

    const handleAgregarTarjetaReceptor = async () => {
        if (numeroTarjetaReceptor === '') return;
        const numDisponible = await validarNumTarjeta(numeroTarjetaReceptor);
        if (!numDisponible) {
            const error = `El numero de tarjeta ${numeroTarjetaReceptor} ya existe.`;
            toast.current.show({severity:'error', summary: 'Error', detail: error, life: 2500, position: 'top-center'});
        } else {
            setNumerosTarjetasReceptor(prevNumeros => [...prevNumeros, numeroTarjetaReceptor]);
        }
        setNumeroTarjetaReceptor('');
    };


    const handleTraspasarBienes = async () => {
        if (!bienesPorTraspasar.length) return;
        if (tarjetas.length !== cantTarjetasNesecarias) {
            const error = 'Debes ingresar la cantidad de tarjetas indicada.'
            return toast.current.show({severity:'error', summary: 'Error', detail: error, life: 2500, position: 'top-center'});
        }

        const response = await empleadoRequests.trapasarBienes({
            idEmpleadoEmisor: id_empleado_emisor,
            idEmpleadoReceptor: empleadoReceptor.id_empleado,
            idsBienes: bienesPorTraspasar.map(bien => bien.id_bien),
            numerosTarjetaEmisor: tarjetas.slice(0, cantTarjetasEmisor),
            numerosTarjetaReceptor: tarjetas.slice(cantTarjetasEmisor, cantTarjetasNesecarias)
        });
        if (response.error) {
            toast.current.show({severity:'error', summary: 'Error', detail: response.error, life: 3000});
        } else  {
            setBienesPorTraspasar([]);
            toast.current.show({severity:'success', summary: 'Éxito', detail: response.message, life: 2500});
            navigate(-1);
        }
    }


    const handleEliminarBien = (id_bien) => {
        const bienSeleccionado = bienesPorTraspasar.find(bien => bien.id_bien === id_bien);
        setBienes(prevBienes => [...prevBienes, bienSeleccionado]);
        setBienesPorTraspasar(prevBienes => prevBienes.filter(bien => bien.id_bien !== id_bien));
    }


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
        const idsBienes = bienesPorTraspasar.map(b => b.id_bien);
        tarjetasRequests
        .getNumeroTarjetasNecesarias({id_empleado: id_empleado_emisor, idsBienes, operacion: accionesTarjeta.TRASPASO})
        .then(res => {
          setCantTarjetasEmisor(res.data);
        });

        tarjetasRequests
        .getNumeroTarjetasNecesarias({id_empleado: empleadoReceptor?.id_empleado, idsBienes, operacion: accionesTarjeta.TRASPASO})
        .then(res => {
            setCantTarjetasReceptor(res.data);
        });
    }, [bienesPorTraspasar]);

    
    useEffect(() => {
        empleadoRequests.getEmpleados().then(response => {
            const empleados = response.data.empleados.filter(empleado => empleado.id_empleado !== id_empleado_emisor);
            setEmpleados(empleados);
        });

        empleadoRequests.getBienes(id_empleado_emisor).then(response => {
            setBienes(response.data);
        });
    }, []);


    return (
        <div className='grid col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-12 text-center'>
                <h1 className='mb-1 text-black-alpha-70'>Traspaso de Bienes a Otro Empleado</h1>
            </div>

            <div className='col-12 mb-2'>
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
                    className='mb-2'
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
                    value={empleadoReceptor? [empleadoReceptor] : []}
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
                    className='mb-2'
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
                                onClick={() => handleAgregarBien(bien.id_bien)}
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
                    className='mb-2'
                    header = {
                        <div className='p-0'>
                            <p>Bienes por Traspasar a Tarjeta No. 12583853:</p>
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
                    <Column header="Eliminar" body = {
                        (bien) => (
                            <Button 
                                severity='danger' label='Eliminar' icon='pi pi-times'
                                className='p-button-success p-button-outlined w-auto'
                                onClick={() => handleEliminarBien(bien.id_bien)}
                            />
                        )
                    } />
                </DataTable>
            </div>

            <div className='col-12 grid'>        
                {/* <div className='col-12 md:col'>
                    <p>Se requieren <b>{cantTarjetasEmisor}</b> tarjetas nuevas para el <b>Emisor:</b> </p>
                    <div className='field col max-w-max p-0'>
                        <label className='font-bold text-black-alpha-80 block'>Agregar Tarjeta:</label>
                        <div className='flex flex-wrap gap-1'>
                            <div className='col p-0'>
                                <InputText 
                                    id='search' type='text' placeholder='No. Tarjeta'
                                    value={numeroTarjetaEmisor}
                                    onChange={e => setNumeroTarjetEmisor(e.target.value)}
                                />
                            </div>
                            <div className='col-12 lg:max-w-max p-0'>
                                <Button 
                                    severity='success' label='Agregar' icon='pi pi-plus'
                                    onClick={handleAgregarTarjetaEmisor}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="card flex flex-wrap gap-2 mb-4">
                        {
                            numerosTarjetasEmisor.map(numero => (
                                <Chip
                                    key={numero}
                                    label={numero} className="p-mr-2 p-mb-2" removable
                                    onRemove={() => {}}
                                />
                            ))
                        }
                    </div>
                </div> */}
{/* 
                <Divider layout='vertical hidden md:inline'/> */}

                <div className='col-12'>
                    { errorEmpleadoReceptor && <Message severity='error' text='Se debe seleccionar al empleado receptor.' className='mt-1 p-1'/> }

                    <AgregacionNumerosTarjeta
                        cantTarjetas={cantTarjetasNesecarias}
                        numerosTarjetas={tarjetas}
                        setNumerosTarjetas={setTarjetas}
                    />

                    {/* <p>Se requieren <b>{cantTarjetasReceptor}</b> tarjetas nuevas para el <b>Recepetor:</b> </p>
                    <div className='field col max-w-max p-0'>
                        <label className='font-bold text-black-alpha-80 block'>Agregar Tarjeta:</label>
                        <div className='flex flex-wrap gap-1'>
                            <div className='col p-0'>
                                <InputText 
                                    id='search' type='text' placeholder='No. Tarjeta'
                                    value={numeroTarjetaReceptor}
                                    onChange={e => setNumeroTarjetaReceptor(e.target.value)}
                                />
                            </div>
                            <div className='col-12 lg:max-w-max p-0'>
                                <Button 
                                    severity='success' label='Agregar' icon='pi pi-plus'
                                    onClick={handleAgregarTarjetaReceptor}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="card flex flex-wrap gap-2 mb-4">
                        {
                            numerosTarjetasReceptor.map(numero => (
                                <Chip
                                    key={numero}
                                    label={numero} className="p-mr-2 p-mb-2" removable
                                    onRemove={() => {}}
                                />
                            ))
                        }
                    </div> */}
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
                            onClick={handleTraspasarBienes}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TraspasoBienes;
