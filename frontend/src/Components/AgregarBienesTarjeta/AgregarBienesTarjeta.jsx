import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useToast } from '../../hooks/useToast';
import useTableFilters from '../../hooks/useTableFilters';
import  AgregacionNumerosTarjeta from '../AgregacionNumerosTarjetas/AgregacionNumerosTarjetas';
import { quetzalesTemplate } from '../TableColumnTemplates';

import bienesRequests from '../../Requests/bienesRequests';
import tarjetasRequests from '../../Requests/tarjetasRequests';
import empleadoRequests from '../../Requests/empleadoRequests';


function AgregarBienesTarjeta() {
    const toast = useToast('bottom-right');
    const { id_empleado } = useParams();
    const navigate = useNavigate();
    const [bienesSinAsignar, setBienesSinAsignar] = useState([]);
    const [bienesPorAsignar, setBienesPorAsignar] = useState([]);

    const [cantTarjetasNesecarias, setCantTarjetasNecesarias] = useState(0);
    const [numerosTarjetas, setNumerosTarjetas] = useState([]);


    // ______________________________  Filtros ______________________________
    const confFiltrosBienes = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        sicoin: { value: null, matchMode: FilterMatchMode.CONTAINS },
        no_serie: { value: null, matchMode: FilterMatchMode.CONTAINS },
        no_inventario: { value: null, matchMode: FilterMatchMode.CONTAINS },
        descripcion: { value: null, matchMode: FilterMatchMode.CONTAINS },
        marca: { value: null, matchMode: FilterMatchMode.CONTAINS },
        codigo: { value: null, matchMode: FilterMatchMode.CONTAINS },
        precio: { value: null, matchMode: FilterMatchMode.CONTAINS },
    }

    const filtrosBienesSinVincular = useTableFilters(confFiltrosBienes);
    const filtrosBienesPorAgregar = useTableFilters(confFiltrosBienes);
    // ______________________________________________________________________


    const handleAgregarBien = (id_bien) => {
        const bien = bienesSinAsignar.find(b => b.id_bien === id_bien);
        setBienesPorAsignar(prevBiens => [...prevBiens, bien]);
        setBienesSinAsignar(prevBiens => prevBiens.filter(b => b.id_bien !== id_bien));
    }


    const handleEliminarBien = (id_bien) => {
        const bien = bienesPorAsignar.find(b => b.id_bien === id_bien);
        setBienesSinAsignar(prevBiens => [...prevBiens, bien]);
        setBienesPorAsignar(prevBiens => prevBiens.filter(b => b.id_bien !== id_bien));
    }


    const handleAgregarBienes = async () => {
        if (!bienesPorAsignar.length) return;
        if (numerosTarjetas.length !== cantTarjetasNesecarias) {
            const error = 'Debes ingresar la cantidad de tarjetas indicada.'
            return toast.current.show({severity:'error', summary: 'Error', detail: error, life: 2500, position: 'top-center'});
        }
        
        const idsBienes = bienesPorAsignar.map(b => b.id_bien);
        const response = await empleadoRequests.asignarBienes({id_empleado, idsBienes, numerosTarjetas});
        if (response.error) {
            toast.current.show({severity:'error', summary: 'Error', detail: response.error, life: 3000});
        } else  {
            setBienesPorAsignar([]);
            toast.current.show({severity:'success', summary: 'Éxito', detail: response.message, life: 2500});
            navigate(-1);
        }
    }


    useEffect(() => {
        const idsBienes = bienesPorAsignar.map(b => b.id_bien);
        tarjetasRequests
        .getNumeroTarjetasNecesarias({id_empleado, idsBienes, operacion: 'ASIGNAR'})
        .then(res => {
           setCantTarjetasNecesarias(res.data);
        });
    }, [bienesPorAsignar]);


    useEffect(() => {
        bienesRequests.getBienesSinAsignar().then(res => setBienesSinAsignar(res.data));
        filtrosBienesSinVincular.initFilters();
        filtrosBienesPorAgregar.initFilters();
    }, []);


    const tableHeaderTemplate = (
        <div>
            <div className='col-12 pb-0'>
                <p>Bienes sin vincular:</p>
            </div>
            <div className='col-12  flex justify-content-end'>
                <span className='p-input-icon-left flex align-items-center'>
                    <i className='pi pi-search' />
                    <InputText
                        value={filtrosBienesSinVincular.globalFilterValue}
                        onChange={filtrosBienesSinVincular.onGlobalFilterChange} 
                        placeholder='Buscar por valor clave'
                    />
                </span>
            </div>
        </div>
    );


    return (
        <div className='grid col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-12 text-center'>
                <h1 className='text-black-alpha-70 mb-1'>Asignar Bienes</h1>
            </div>

            <div className='col-12'>
                <DataTable
                    value={bienesSinAsignar}
                    rows={10}
                    filters={filtrosBienesSinVincular.filters}
                    paginator
                    scrollable
                    scrollHeight='280px'
                    showGridlines
                    stripedRows 
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Bien {first} a {last} de  {totalRecords}'
                    className='mb-2'
                    header={tableHeaderTemplate}
                >
                    <Column field='sicoin' header='SICOIN'/>
                    <Column field='no_serie' header='No. Serie'/>
                    <Column field='no_inventario' header='Inventario'/>
                    <Column field='descripcion' header='Descripcion'/>
                    <Column field='marca' header='Marca'/>
                    <Column field='codigo' header='Modelo'/>
                    <Column field='precio' header='Precio' body={bien => quetzalesTemplate(bien.precio)}/>
                    <Column 
                        header='Agregar'
                        body = {
                            bien =>  (
                                <Button
                                    type='button' 
                                    icon='pi pi-plus'
                                    className='p-button-success p-button-outlined w-auto'
                                    label='Agregar'
                                    onClick={() => handleAgregarBien(bien.id_bien)}
                                />
                            )
                        }
                    />
                </DataTable>

                <DataTable
                    value={bienesPorAsignar}
                    filters={filtrosBienesPorAgregar.filters}
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
                                <p>Bienes Por Agregar:</p>
                            </div>
                            <div className='col-12  flex justify-content-end'>
                                <span className='p-input-icon-left flex align-items-center'>
                                    <i className='pi pi-search' />
                                    <InputText
                                        placeholder='Buscar por valor clave'
                                        value={filtrosBienesPorAgregar.globalFilterValue}
                                        onChange={filtrosBienesPorAgregar.onGlobalFilterChange} 
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
                    <Column field='marca' header='Marca'/>
                    <Column field='codigo' header='Modelo'/>
                    <Column field='precio' header='Precio' body={bien => quetzalesTemplate(bien.precio)}/>
                    <Column 
                        header='Eliminar'
                        body = {
                            bien =>  (
                                <Button 
                                    type='button' 
                                    icon='pi pi-times'
                                    className='p-button-danger p-button-outlined w-auto'
                                    label='Eliminar'
                                    onClick={() => handleEliminarBien(bien.id_bien)}
                                />
                            )
                        }
                    />
                </DataTable>
            </div>

            <div className='col-12'>
                <AgregacionNumerosTarjeta
                    cantTarjetas={cantTarjetasNesecarias}
                    numerosTarjetas={numerosTarjetas}
                    setNumerosTarjetas={setNumerosTarjetas}
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
                            severity='info' label='Asignar Bienes' icon='pi pi-arrow-up'
                            onClick={handleAgregarBienes}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AgregarBienesTarjeta;
