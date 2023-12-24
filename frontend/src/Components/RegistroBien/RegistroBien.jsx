import { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';

import { Divider } from 'primereact/divider';
        
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

function RegistroBien() {

    // Filtros de la tabla de bienes
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState(null);
    const [filtrosAplicados, setFiltrosAplicados] = useState(false);

    // Listado de programas en el backend
    const [programas, setProgramas] = useState([]);

    // Datos generales de los bienes
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState(null);
    const [fecha, setFecha] = useState(new Date());

    // Datos especificos de los bienes
    const [sicoin, setSicoin] = useState('');
    const [sicoinError, setSicoinError] = useState('');
    const [noSerie, setNoSerie] = useState('');
    const [noSerieError, setNoSerieError] = useState('');
    const [noInventario, setNoInventario] = useState('');

    // Listado de bienes (cada bien solo tiene los datos especificos)
    const [bienes, setBienes] = useState([]);


    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            sicoin: { value: null, matchMode: FilterMatchMode.EQUALS },
            noSerie: { value: null, matchMode: FilterMatchMode.EQUALS },
            noInventario: { value: null, matchMode: FilterMatchMode.EQUALS },
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


    const handleRegistrarBienes = e => {
        e.preventDefault();
        fetch('http://localhost:5000/bienes/registro-bienes-comunes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                descripcion,
                precio: precio === null ? 0 : precio,
                fecha_registro: fecha,
                datos_espeficos_bienes: bienes
            })
        }).then(res => {    
            if (res.ok) {
                alert('exito');
            } else {
                alert('error');
            }
        });
    }


    const handleAgregarBien = () => {
        setSicoinError('');
        setNoSerieError('');
        if ([sicoin, noSerie, noInventario].every(valor => valor === '')) return;

        let errors = false;
        if (bienes.some(bien => bien.sicoin === sicoin)) {
            setSicoinError('SICOIN ya registrado');
            errors = true;
        }
        if (bienes.some(bien => bien.noSerie === noSerie)) {
            setNoSerieError('No. Serie ya registrado');
            errors = true;
        }
        if (errors) return;

        const bien = {
            sicoin,
            noSerie,
            noInventario
        }
        setBienes(prevBienes => [...prevBienes, bien]);
        setSicoin('');
        setNoSerie('');
        setNoInventario('');
    }


    const handleEditarBien = (bien) => {
        setSicoin(bien.sicoin);
        setNoSerie(bien.noSerie);
        setNoInventario(bien.noInventario);
        setBienes(prevBienes => prevBienes.filter(b  => {
            if (
                bien.sicoin !== b.sicoin && 
                bien.noSerie !== b.noSerie
            ) return true;
        }));
    }


    useEffect(() => {
        fetch('http://localhost:5000/programas/obtener-programas')
        .then(res => res.json())
        .then(res => setProgramas(res.programas));
        initFilters();
    }, []);

    
    return (
        <div className='grid col-11 md:col-9 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <h1 className='col-12 flex justify-content-center mb-0 text-black-alpha-80'>Registro de Bienes</h1>

            <Divider className='mb-0'/>
            <h2 className='col-12 mb-0 text-black-alpha-80'>Datos en Comun:</h2>

            <div className='field col-12 mb-0'>
                <label htmlFor='descripcion' className='font-bold block'>Descripción: </label>
                <InputTextarea 
                    id='descripcion'
                    placeholder='Caracteristicas y Especificaciones'  
                    rows={4}
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    className='f-wull' 
                    style={{resize: 'none'}}
                />
            </div>

            <div className='field col-12 md:col-4 mb-0'>
                <label htmlFor='precio' className='font-bold block'>Precio: </label>
                <InputNumber 
                    inputId='precio'
                    name='precio'
                    placeholder='Q 0.00'
                    minFractionDigits={2}
                    maxFractionDigits={5}
                    mode='currency' currency='GTQ' locale='es-GT'
                    value={precio}
                    min={0}
                    onChange={e => setPrecio(e.value)}
                />
            </div>

            <div className='field col-12 md:col-4 mb-0'>
                <label htmlFor='fecha' className='font-bold block'>Fecha: </label>
                <Calendar
                    inputId='fecha'
                    name='fecha'
                    showIcon
                    todayButtonClassName='p-button-'
                    placeholder='dd/mm/aaaa'
                    dateFormat='dd/mm/yy'
                    value={fecha}
                    onChange={e => setFecha(e.target.value)}
                />
            </div>

            <Divider className='mb-0'/>
            <h2 className='col-12 mb-0 text-black-alpha-80'>Datos Especificos:</h2>


            <div className='col-12 md:col-4'>
                {/* <div className=' col-12'>
                    {
                        errorDatosEspecificos && <Message severity='error' text='Se requiere almenos un dato' className='mt-1 p-1'/>
                    }
                </div> */}

                <div className='field col-12 mb-0'>
                    <label htmlFor='sicoin' className='font-bold block'>SICOIN: </label>
                    <InputText 
                        id='sicoin'
                        placeholder='SICOIN del bien'
                        value={sicoin}
                        onChange={e => setSicoin(e.target.value)}
                    />
                    { sicoinError && <Message severity='error' text={sicoinError} className='mt-1 p-1'/> }
                </div>
                <div className='field col-12 mb-0'>
                    <label htmlFor='noSerie' className='font-bold block'>No serie: </label>
                    <InputText 
                        id='noSerie'
                        placeholder='No. Serie del bien' 
                        value={noSerie}
                        onChange={e => setNoSerie(e.target.value)}
                    />
                    { noSerieError && <Message severity='error' text={noSerieError} className='mt-1 p-1'/> }
                </div>
                <div className='field col-12 mb-0'>
                    <label htmlFor='noInventario' className='font-bold block'>No Inventario: </label>
                    <InputText
                        id='noInventario'
                        placeholder='No. inventario del bien'
                        value={noInventario}
                        onChange={e => setNoInventario(e.target.value)}
                    />
                </div>
                <div className='col-12'>
                    <Button 
                        type='button'
                        severity='success'
                        label='Agregar Bien'
                        icon='pi pi-plus'
                        iconPos='left'
                        onClick={handleAgregarBien}
                        className='w-full'
                    />
                </div>

            </div>

            <div className='col-12 md:col-8'>
                <DataTable 
                    onFilter={(event) => {
                        event.filters && setFilters(event.filters);
                        setFiltrosAplicados(event.filters && Object.values(event.filters).some(filtro => filtro && filtro.value !== null));
                    }}
                    value={bienes} 
                    filters={filters}
                    paginator
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Bien {first} a {last} de  {totalRecords}'
                    rows={10}
                    scrollable
                    scrollHeight='280px'
                    showGridlines
                    stripedRows
                    header={
                        <div className='flex flex-wrap md:flex-row-reverse'>
                            <div className='col-12 md:col-4'>
                                <Button 
                                    severity='warning' icon='pi pi-upload' label='Carga (XLSX)' 
                                />
                            </div>
                            {/* {
                                filtrosAplicados && <div className='col-6 md:col-4'>
                                    <Button
                                        type='button'
                                        icon='pi pi-filter-slash'
                                        label='Quitar Filtros'
                                        outlined
                                        onClick={() => {
                                            initFilters();
                                            setFiltrosAplicados(false);
                                        }}
                                    />
                                </div>
                            } */}
                            <div className='col-12 md:col-8 flex justify-content-end'>
                                <span className='p-input-icon-left flex align-items-center'>
                                    <i className='pi pi-search' />
                                    <InputText id='busquedaBien' value={globalFilterValue} onChange={onGlobalFilterChange} 
                                        placeholder='Buscar por valor clave'
                                    />
                                </span>
                            </div>
                        </div>
                    }
                >   
                    <Column field='sicoin' header='SICOIN' />
                    <Column field='noSerie' header='No. Serie' />
                    <Column field='noInventario' header='No. Inventario' />
                    <Column 
                        header='Editar'
                        body = {
                            bien => (
                                <Button 
                                    type='button' className='p-button-warning p-button-rounded p-button-text' icon='pi pi-pencil'
                                    onClick={() => handleEditarBien(bien)} 
                                />
                            )
                        }
                    />
                    <Column 
                        header='Eliminar'
                        body = {
                            bien => (
                                <Button 
                                    type='button' 
                                    icon='pi pi-trash'
                                    onClick={() => {
                                        setBienes(prevBienes => prevBienes.filter(b  => {
                                            if (
                                                bien.sicoin !== b.sicoin && 
                                                bien.noSerie !== b.noSerie && 
                                                bien.noInventario !== b.noInventario
                                            ) return true;
                                        }));
                                    }}
                                    className='p-button-danger p-button-rounded p-button-text'
                                />
                            )
                        }
                    />
                </DataTable>
            </div>

            <div  className='sm:col-12 md:col-4 ml-auto mt-2' >
                <Button 
                    label='Registrar Bienes' icon='pi pi-save' iconPos='left'
                    onClick={handleRegistrarBienes}
                />
            </div>
        </div>
    );
}

export default RegistroBien;
