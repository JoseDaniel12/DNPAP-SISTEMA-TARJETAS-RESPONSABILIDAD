import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../Auth/Auth';
import useTableFilters from '../../hooks/useTableFilters';
import AgregacionNumerosTarjeta from '../AgregacionNumerosTarjetas/AgregacionNumerosTarjetas';
import { quetzalesTemplate } from '../TableColumnTemplates';

import { accionesTarjeta } from '../../types/accionesTarjeta';
import empleadoRequests from '../../Requests/empleadoRequests';
import tarjetasRequests from '../../Requests/tarjetasRequests';
import { set } from 'date-fns';


function TraspasoBienes() {
    const toast = useToast('bottom-right');
    const { loginData: { usuario } } = useAuth();
    const controllerRef = useRef();

    const params = useParams();
    const id_empleado_emisor = parseInt(params.id_empleado_emisor);
    const navigate = useNavigate();

    const [empleadoEmisor, setEmpleadoEmisor] = useState(null);
    const [empleados, setEmpleados] = useState([]);
    const [empleadoReceptor, setEmpleadoReceptor] = useState(null);
    const [errorEmpleadoReceptor, setErrorEmpleadoReceptor] = useState(true);

    const [bienes, setBienes] = useState([]);
    const [bienesPorTraspasar, setBienesPorTraspasar] = useState([]);

    const [cantTarjetasEmisor, setCantTarjetasEmisor] = useState(0);
    const [cantTarjetasReceptor, setCantTarjetasReceptor] = useState(0);
    const [tarjetas, setTarjetas] = useState([]);
    const cantTarjetasNesecarias = cantTarjetasEmisor + cantTarjetasReceptor;

    // ______________________________  Filtros ______________________________
    const filtrosListaEmpleados = useTableFilters({
        global: { value: '', matchMode: FilterMatchMode.CONTAINS }

    })

    const confFiltrosBienes = {
        global: { value: '', matchMode: FilterMatchMode.CONTAINS }
    };

    const filtrosBienesEmpleadoEmisor = useTableFilters(confFiltrosBienes);
    const filtrosBienesPorTraspasar = useTableFilters(confFiltrosBienes);
    // ______________________________________________________________________


    
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


    const handleTraspasarBienes = async () => {
        if (!bienesPorTraspasar.length) return;
        if (tarjetas.length !== cantTarjetasNesecarias) {
            const error = 'Debes ingresar la cantidad de tarjetas indicada.'
            return toast.current.show({severity:'error', summary: 'Error', detail: error, life: 2500, position: 'top-center'});
        }

        if (controllerRef.current) controllerRef.current.abort();
        controllerRef.current = new AbortController();
        const signal = controllerRef.current.signal;

        const response = await empleadoRequests.trapasarBienes({
            id_autor: usuario.id_empleado,
            idEmpleadoEmisor: id_empleado_emisor,
            idEmpleadoReceptor: empleadoReceptor.id_empleado,
            idsBienes: bienesPorTraspasar.map(bien => bien.id_bien),
            numerosTarjetaEmisor: tarjetas.slice(0, cantTarjetasEmisor),
            numerosTarjetaReceptor: tarjetas.slice(cantTarjetasEmisor, cantTarjetasNesecarias)
        }, signal);
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
        empleadoRequests.getEmpleado(id_empleado_emisor).then(response => setEmpleadoEmisor(response.data.empleado));

        empleadoRequests.getEmpleados().then(response => {
            const empleados = response.data.empleados.filter(empleado => empleado.id_empleado !== id_empleado_emisor);
            setEmpleados(empleados);
        });

        empleadoRequests.getBienes(id_empleado_emisor).then(response => {
            setBienes(response.data);
        });

        filtrosListaEmpleados.initFilters();
        filtrosBienesEmpleadoEmisor.initFilters();
        filtrosBienesPorTraspasar.initFilters();
    }, []);


    return (
        <div className='grid col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-12 text-center'>
                <h1 className='mb-1 text-black-alpha-70'>Traspaso de Bienes a Otro Empleado</h1>
            </div>

            <div className='col-12'>
                <DataTable
                    value={[empleadoEmisor]}
                    header= {
                        <p>Empleado Emisor:</p>
                    }
                >
                    <Column field='dpi' header='DPI'/>
                    <Column field='nit' header='NIT'/>
                    <Column field='nombres' header='Nombres'/>
                    <Column field='apellidos' header='Apellidos'/>
                    <Column field='cargo' header='Cargo'/>
                </DataTable>
            </div>

            <div className='col-12 mb-2'>
                <DataTable
                    value={empleados}
                    filters={filtrosListaEmpleados.filters}
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
                                    value={filtrosListaEmpleados.globalFilterValue}
                                    onChange={filtrosListaEmpleados.onGlobalFilterChange}
                                />
                            </span>
                        </div>
                    }
                >
                    <Column field="dpi" header="DPI"/>
                    <Column field="nit" header="NIT"/>
                    <Column field="nombres" header="Nombres"/>
                    <Column field="apellidos" header="Apellidos"/>
                    <Column field="cargo" header="Cargo" />
                    <Column field="saldo" header="Saldo" body={empleado => quetzalesTemplate(empleado.saldo)}/>
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
                    <Column field="nit" header="NIT"/>
                    <Column field="nombres" header="Nombres"/>
                    <Column field="apellidos" header="Apellidos"/>
                    <Column field="cargo" header="Cargo" />
                    <Column field="saldo" header="Saldo" body={empleado => quetzalesTemplate(empleado.saldo)}/>
                </DataTable>

                <DataTable
                    value={bienes}
                    filters={filtrosBienesEmpleadoEmisor.filters}
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
                            <p>Bienes de Empleado Emisor:</p>
                            <span className="p-input-icon-left flex align-items-center">
                                <i className="pi pi-search" />
                                <InputText  
                                    placeholder="Buscar por valor clave"
                                    value={filtrosBienesEmpleadoEmisor.globalFilterValue}
                                    onChange={filtrosBienesEmpleadoEmisor.onGlobalFilterChange}
                                />
                            </span>
                        </div>
                    }
                >
                    <Column field='sicoin' header='SICOIN'/>
                    <Column field='no_serie' header='No. Serie'/>
                    <Column field='no_inventario' header='Inventario'/>
                    <Column field='descripcion' header='Descripcion'/>
                    <Column field='marca' header='Marca'/>
                    <Column field='codigo' header='Modelo'/>
                    <Column field='precio' header='Precio' body={bien => quetzalesTemplate(bien.precio)}/>
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
                    filters={filtrosBienesPorTraspasar.filters}
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
                            <p>Bienes por Traspasar:</p>
                            <span className="p-input-icon-left flex align-items-center">
                                <i className="pi pi-search" />
                                <InputText  
                                    placeholder="Buscar por valor clave"
                                    value={filtrosBienesPorTraspasar.globalFilterValue}
                                    onChange={filtrosBienesPorTraspasar.onGlobalFilterChange}
                                />
                            </span>
                        </div>
                    }
                >
                    <Column field='sicoin' header='SICOIN'/>
                    <Column field='no_serie' header='No. Serie'/>
                    <Column field='no_inventario' header='Inventario'/>
                    <Column field='descripcion' header='Descripcion'/>
                    <Column field='marca' header='Marca'/>
                    <Column field='codigo' header='Modelo'/>
                    <Column field='precio' header='Precio' body={bien => quetzalesTemplate(bien.precio)}/>
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
                <div className='col-12'>
                    { errorEmpleadoReceptor && <Message severity='error' text='Se debe seleccionar al empleado receptor.' className='mt-1 p-1'/> }

                    <AgregacionNumerosTarjeta
                        cantTarjetas={cantTarjetasNesecarias}
                        numerosTarjetas={tarjetas}
                        setNumerosTarjetas={setTarjetas}
                    />
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
