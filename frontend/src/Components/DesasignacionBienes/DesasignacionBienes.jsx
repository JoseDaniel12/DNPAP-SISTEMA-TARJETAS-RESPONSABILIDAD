import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useToast } from '../../hooks/useToast';
import useTableFilters from '../../hooks/useTableFilters';
import AgregacionNumerosTarjetas from '../AgregacionNumerosTarjetas/AgregacionNumerosTarjetas';

import tarjetasRequests from '../../Requests/tarjetasReuests';
import empleadoRequests from '../../Requests/empleadoRequests';


function DesasignacionBienes() {
    const toast = useToast('bottom-right');
    const { id_empleado } = useParams();
    const navigate = useNavigate();
    const [bienesEmpleado, setBienesEmpleado] = useState([]);
    const [bienesPorDesasignar, setBienesPorDesasignar] = useState([]);

    const [cantTarjetasNesecarias, setCantTarjetasNecesarias] = useState(0);
    const [numeroTarjeta, setNumeroTarjeta] = useState('');
    const [numerosTarjetas, setNumerosTarjetas] = useState([]);

    // ______________________________  Filtros ______________________________
    const confFiltrosBienes = {
        global: { value: '', matchMode: FilterMatchMode.CONTAINS }
    };

    const filtrosBienesEmpleado = useTableFilters(confFiltrosBienes)
    const filtrosBienesPorDesasignar = useTableFilters(confFiltrosBienes);
    // ______________________________________________________________________


    const handleQuitarBien = (id_bien) => {
        const bien = bienesEmpleado.find(b => b.id_bien === id_bien);
        setBienesPorDesasignar(prevBiens => [...prevBiens, bien]);
        setBienesEmpleado(prevBiens => prevBiens.filter(b => b.id_bien !== id_bien));
    }


    const handleDevolverBien = (id_bien) => {
        const bien = bienesPorDesasignar.find(b => b.id_bien === id_bien);
        setBienesEmpleado(prevBiens => [...prevBiens, bien]);
        setBienesPorDesasignar(prevBiens => prevBiens.filter(b => b.id_bien !== id_bien));
    }


    const handleQuitarBienes = async () => {
        if (!bienesPorDesasignar.length) return;
        if (numerosTarjetas.length !== cantTarjetasNesecarias) {
            const error = 'Debes ingresar la cantidad de tarjetas indicada.'
            return toast.current.show({severity:'error', summary: 'Error', detail: error, life: 2500, position: 'top-center'});
        }
        
        const idsBienes = bienesPorDesasignar.map(b => b.id_bien);
        const response = await empleadoRequests.desasignarBienes({id_empleado, idsBienes, numerosTarjetas});
        if (response.error) {
            toast.current.show({severity:'error', summary: 'Error', detail: response.error, life: 3000});
        } else  {
            setBienesPorDesasignar([]);
            toast.current.show({severity:'success', summary: 'Éxito', detail: response.message, life: 2500});
            navigate(-1);
        }
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
        const idsBienes = bienesPorDesasignar.map(b => b.id_bien);
        tarjetasRequests
        .getNumeroTarjetasNecesarias({id_empleado, idsBienes, operacion: 'ASIGNAR'})
        .then(res => {
           setCantTarjetasNecesarias(res.data);
        });
    }, [bienesPorDesasignar]);


    useEffect(() => {
        empleadoRequests.getBienes(id_empleado).then(res => setBienesEmpleado(res.data));

        filtrosBienesEmpleado.initFilters();
        filtrosBienesPorDesasignar.initFilters();
    }, []);


    return (
        <div className='grid col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-12 text-center'>
                <h1 className='text-black-alpha-70 mb-1'>Desasignar Bienes</h1>
            </div>

            <div className='col-12'>
                <DataTable
                    value={bienesEmpleado}
                    filters={filtrosBienesEmpleado.filters}
                    rows={10}
                    paginator
                    scrollable
                    scrollHeight='280px'
                    showGridlines
                    stripedRows 
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Bien {first} a {last} de  {totalRecords}'
                    className='mb-2'
                    header = {
                        <div>
                            <div className='col-12 pb-0'>
                                <p>Bienes del empleado:</p>
                            </div>
                            <div className='col-12  flex justify-content-end'>
                                <span className='p-input-icon-left flex align-items-center'>
                                    <i className='pi pi-search' />
                                    <InputText
                                        placeholder='Buscar por valor clave'
                                        value={filtrosBienesEmpleado.globalFilterValue}
                                        onChange={filtrosBienesEmpleado.onGlobalFilterChange}
                                    />
                                </span>
                            </div>
                        </div>
                    }
                >
                    <Column field='sicoin' header='SICOIN'/>
                    <Column field='no_serie' header='No. Serie'/>
                    <Column field='no_inventario' header='Inventario'/>
                    <Column field='descripcion' header='Descripcion'/>
                    <Column field='precio' header='Precio' body={bien => preciosTemplate(bien.precio)}/>
                    <Column 
                        header='Quitar'
                        body = {
                            bien =>  (
                                <Button 
                                    type='button'
                                    severity='danger'
                                    icon='pi pi-trash'
                                    className='p-button-success p-button-outlined w-auto'
                                    label='Quitar'
                                    onClick={() => handleQuitarBien(bien.id_bien)}
                                />
                            )
                        }
                    />
                </DataTable>

                <DataTable
                    value={bienesPorDesasignar}
                    filters={filtrosBienesPorDesasignar.filters}
                    rows={10}
                    paginator
                    scrollable
                    scrollHeight='280px'
                    showGridlines
                    stripedRows 
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Bien {first} a {last} de  {totalRecords}'
                    header = {
                        <div>
                            <div className='col-12 pb-0'>
                                <p>Bienes Por Desasignar:</p>
                            </div>
                            <div className='col-12  flex justify-content-end'>
                                <span className='p-input-icon-left flex align-items-center'>
                                    <i className='pi pi-search' />
                                    <InputText
                                        placeholder='Buscar por valor clave'
                                        value={filtrosBienesPorDesasignar.globalFilterValue}
                                        onChange={filtrosBienesPorDesasignar.onGlobalFilterChange}
                                    />
                                </span>
                            </div>
                        </div>
                    }
                >
                    <Column field='sicoin' header='SICOIN'/>
                    <Column field='no_serie' header='No. Serie'/>
                    <Column field='no_inventario' header='Inventario'/>
                    <Column field='descripcion' header='Descripcion'/>
                    <Column field='precio' header='Precio' body={bien => preciosTemplate(bien.precio)}/>
                    <Column 
                        header='Devolver'
                        body = {
                            bien =>  (
                                <Button 
                                    type='button' 
                                    severity='warning'
                                    icon='pi pi-arrow-left'
                                    className='p-button-outlined w-auto'
                                    label='Devolver'
                                    onClick={() => handleDevolverBien(bien.id_bien)}
                                />
                            )
                        }
                    />
                </DataTable>
            </div>

            <div className='col-12'>
                <AgregacionNumerosTarjetas
                    cantTarjetas={cantTarjetasNesecarias}
                    numerosTarjetas={numerosTarjetas}
                    setNumeroTarjeta={setNumeroTarjeta}
                />
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
                            severity='info' label='Desasignar Bienes' icon='pi pi-arrow-down'
                            onClick={handleQuitarBienes}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DesasignacionBienes;
