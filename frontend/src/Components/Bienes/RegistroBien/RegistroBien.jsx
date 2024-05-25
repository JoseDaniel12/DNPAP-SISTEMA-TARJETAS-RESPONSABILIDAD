import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import  { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Divider } from 'primereact/divider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import useTableFilters from '../../../hooks/useTableFilters';

import bienesRequest from '../../../Requests/bienesRequests';


function RegistroBien() {
    const toast = useRef(null);

    // Listado de bienes (cada bien solo tiene los datos especificos)
    const [bienes, setBienes] = useState([]);

    // _______________________ Formulario de datos Generales _______________________
    const datosGeneralesSchema = yup.object({
        descripcion: yup.string().required('Descripción requerida'),
        precio: yup.number().required('Precio requerido'),
        marca: yup.string(),
        codigoModelo: yup.string(),
        fecha: yup.date(),
    });

    const formDatosGenerales = useForm({
        defaultValues: {
            descripcion: '',
            precio: null,
            marca: '',
            codigoModelo: '',
            fecha: new Date(),
        },
        resolver: yupResolver(datosGeneralesSchema),
        mode: 'onSubmit'
    });

    const { 
        register: registerDatosGenerales,
        handleSubmit: handleSubmitDatosGenerales,
        formState: {
            errors: errorsDatosGenerales
        },
        setError: setErrorDatosGenerales,
    } = formDatosGenerales;

    
    const handleRegistrarBienes = async () => {
        let errores = false;
        if (bienes.length === 0) {
            errores = true;
            setErrorDatosGenerales('bienes', {
                type: 'manual',
                message: 'Debe agregar al menos un bien'
            });
        }
        if (errores) return toast.current.show({severity:'error', summary: 'Error', detail: 'Debes corregir errores.', life: 1500});

        const { descripcion, precio, marca, codigoModelo, fecha } = formDatosGenerales.getValues();
        const bienesData = {
            descripcion,
            precio: precio === null ? 0 : precio,
            marca: marca,
            codigoModelo: codigoModelo,
            fecha_registro: fecha,
            datos_espeficos_bienes: bienes
        };
        const response = await bienesRequest.registrarBienesComunes(bienesData);
        if (response.error) {
            toast.current.show({severity:'error', summary: 'Error', detail: response.error, life: 3000});
        } else {
            setBienes([]);
            formDatosGenerales.reset();
            formDatosEspecificos.reset();
            toast.current.show({severity:'success', summary: 'Exito', detail: response.message, life: 3000});
        }
    }
    // _____________________________________________________________________________


    // ______________________ Formulario de datos Especificos _______________________
    const datosEspecificosSchema = yup.object({
        sicoin: yup.string(),
        noSeries: yup.string(),
        noInventario: yup.string()
    });

    const formDatosEspecificos = useForm({
        defaultValues: {
            sicoin: '',
            noSerie: '',
            noInventario: '',
        },
        resolver: yupResolver(datosEspecificosSchema),
        mode: 'onSubmit'
    });

    const { 
        register: registerDatosEspecificos,
        handleSubmit: handleSubmitDatosEspecificos,
        formState: {
            errors: errorsDatosEspecificos
        },
        setError: setErrorDatosEspecificos,
    } = formDatosEspecificos;
    

    const validateDisponibilidadSicoin = async (sicoin) => {
        if (sicoin === '') return true;
        for (const bien of bienes) {
            if (bien.sicoin === sicoin) {
               return  false;
            }
        }
        const response = await bienesRequest.validarDisponibilidadSicoin(sicoin);
        return response.data;
    }

    const validateDisponibilidadnoSerie = async (noSerie) => {
        if (noSerie === '') return true;
        for (const bien of bienes) {
            if (bien.noSerie === noSerie) {
               return  false;
            }
        }
        const response = await bienesRequest.validarDisponibilidadNoSerie(noSerie);
        return response.data;
    }

    const onAgregarBien = async (datosEspecificos) => {
        const { sicoin, noSerie, noInventario } = datosEspecificos;
        if ([sicoin, noSerie, noInventario].every(valor => valor === '')) return;

        // const sicoinDisponible = await validateDisponibilidadSicoin(sicoin);
        // if (!sicoinDisponible) setErrorDatosEspecificos('sicoin', {
        //     type: 'manual',
        //     message: 'SICOIN ya registrado.'
        // });

        const noSerieDisponible = await validateDisponibilidadnoSerie(noSerie);
        if (!noSerieDisponible) setErrorDatosEspecificos('noSerie', {
            type: 'manual',
            message: 'No. Serie ya registrado.'
        });

        if (Object.keys(formDatosEspecificos.formState.errors).length > 0) return;

        datosEspecificos.id = uuidv4();
        setBienes(prevBienes => [...prevBienes, datosEspecificos]);
        formDatosEspecificos.reset();
    }


    const handleEditarBien = (bien) => {
        formDatosEspecificos.setValue('sicoin', bien.sicoin);
        formDatosEspecificos.setValue('noSerie', bien.noSerie);
        formDatosEspecificos.setValue('noInventario', bien.noInventario);
        setBienes(prevBienes => prevBienes.filter(b  => b.id !== bien.id));
    }
    // _____________________________________________________________________________


    // ______________________________  Filtros ______________________________
    const filtrosDatosEspecificos = useTableFilters({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    // ______________________________________________________________________


    // Funcion para evitar que se haga un salto de linea al presionar enter en la descripción
    const handleKeyDowDescripcion = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
        }
    }


    useEffect(() => {
        filtrosDatosEspecificos.initFilters();
    }, []);

    
    return (
        <div className='grid col-11 md:col-9 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <Toast ref={toast}  position="bottom-right"/>
            <h1 className='col-12 flex justify-content-center text-black-alpha-80 m-0'>Registro de Bienes</h1>

            <Divider className='mb-0'/>
            <h2 className='col-12 mb-0 text-black-alpha-80'>Datos en Comun:</h2>

            <div className='field col-12 mb-0'>
                <label htmlFor='descripcion' className='font-bold block'>Descripción: </label>
                <InputTextarea
                    id='descripcion'
                    name='descripcion'
                    placeholder='Caracteristicas y Especificaciones. Incluir precio, marca y modelo.'  
                    rows={4}
                    className='f-wull' 
                    style={{resize: 'none'}}
                    onKeyDown={handleKeyDowDescripcion}
                    { ...registerDatosGenerales('descripcion') }
                    onChange={e => formDatosGenerales.setValue('descripcion', e.target.value.replace(/[\r\n]+/gm, ''))}
                />
                { errorsDatosGenerales.descripcion && <Message severity='error' text={errorsDatosGenerales.descripcion?.message} className='mt-1 p-1'/> }
            </div>

            <div className='field col-12 md:col-3 mb-0'>
                <label htmlFor='precio' className='font-bold block'>Precio: </label>
                <InputNumber 
                    inputId='precio'
                    name='precio'
                    placeholder='Q 0.00'
                    minFractionDigits={2}
                    maxFractionDigits={2}
                    mode='currency' currency='GTQ' locale='es-GT'
                    min={0}
                    { ...registerDatosGenerales('precio') }
                    value={formDatosGenerales.watch('precio')}
                    onChange={e => formDatosGenerales.setValue('precio', e.value)}
                />
                { errorsDatosGenerales.precio && <Message severity='error' text={errorsDatosGenerales.precio?.message} className='mt-1 p-1'/> }
            </div>

            <div className='field col-12 md:col-3 mb-0'>
                <label htmlFor='precio' className='font-bold block'>Marca: </label>
                <InputText 
                    id='marca'
                    placeholder='Sin marca'
                    { ...registerDatosGenerales('marca') }
                />
                { errorsDatosGenerales.marca && <Message severity='error' text={errorsDatosGenerales.marca?.message} className='mt-1 p-1'/> }
            </div>

            <div className='field col-12 md:col-3 mb-0'>
                <label htmlFor='precio' className='font-bold block'>Codigo de Modelo: </label>
                <InputText 
                    id='codigoModelo'
                    placeholder='Sin modelo'
                    { ...registerDatosGenerales('codigoModelo') }
                />
                { errorsDatosGenerales.codigoModelo && <Message severity='error' text={errorsDatosGenerales.codigoModelo?.message} className='mt-1 p-1'/> }
            </div>

            <div className='field col-12 md:col-3 mb-0'>
                <label htmlFor='fecha' className='font-bold block'>Fecha: </label>
                <Calendar
                    inputId='fecha'
                    name='fecha'
                    showIcon
                    todayButtonClassName='p-button-'
                    placeholder='dd/mm/aaaa'
                    dateFormat='dd/mm/yy'
                    value={new Date()}
                    { ...registerDatosGenerales('fecha') }
                />
            </div>

            <Divider className='mb-0'/>
            { errorsDatosGenerales.bienes && <Message severity='error' text={errorsDatosGenerales.bienes?.message} className='mt-1 p-1'/> }
            <h2 className='col-12 mb-0 text-black-alpha-80'>Datos Especificos:</h2>

            <div className='col-12 md:col-4'>
                <div className='field col-12 mb-0'>
                    <label htmlFor='sicoin' className='font-bold block'>SICOIN: </label>
                    <InputText 
                        id='sicoin'
                        placeholder='SICOIN del bien'
                        { ...registerDatosEspecificos('sicoin') }
                    />
                    { errorsDatosEspecificos.sicoin && <Message severity='error' text={errorsDatosEspecificos.sicoin?.message} className='mt-1 p-1'/> }
                </div>

                <div className='field col-12 mb-0'>
                    <label htmlFor='noSerie' className='font-bold block'>No serie: </label>
                    <InputText 
                        id='noSerie'
                        placeholder='No. Serie del bien' 
                        { ...registerDatosEspecificos('noSerie') }
                    />
                    { errorsDatosEspecificos.noSerie && <Message severity='error' text={errorsDatosEspecificos.noSerie?.message} className='mt-1 p-1'/> }
                </div>

                <div className='field col-12 mb-0'>
                    <label htmlFor='noInventario' className='font-bold block'>No Inventario: </label>
                    <InputText
                        id='noInventario'
                        placeholder='No. inventario del bien'
                        { ...registerDatosEspecificos('noInventario') }
                    />
                </div>

                <div className='col-12'>
                    <Button 
                        type='submit'
                        severity='success'
                        label='Agregar Bien'
                        icon='pi pi-plus'
                        iconPos='left'
                        onClick={handleSubmitDatosEspecificos(onAgregarBien)}
                        className='w-full'
                    />
                </div>
            </div>

            <div className='col-12 md:col-8'>
                <DataTable 
                    value={bienes} 
                    filters={filtrosDatosEspecificos.filters}
                    paginator
                    paginatorPosition='top'
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Bien {first} a {last} de  {totalRecords}'
                    rows={10}
                    scrollable
                    scrollHeight='280px'
                    showGridlines
                    stripedRows
                    header={
                        <div className='flex flex-wrap md:flex-row-reverse'>
                            {/* <div className='col-12 md:col-4'>
                                <Button 
                                    severity='warning' icon='pi pi-upload' label='Carga (XLSX)' 
                                />
                            </div> */}
                            <div className='col flex justify-content-end'>
                                <span className='p-input-icon-left flex align-items-center'>
                                    <i className='pi pi-search' />
                                    <InputText id='busquedaBien'
                                        value={filtrosDatosEspecificos.globalFilterValue}
                                        onChange={filtrosDatosEspecificos.onGlobalFilterChange} 
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
                            row => (
                                <Button 
                                    type='button' 
                                    icon='pi pi-trash'
                                    onClick={() => setBienes(prevBienes => prevBienes.filter(b => b.id !== row.id))}
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
                    onClick={handleSubmitDatosGenerales(handleRegistrarBienes)}
                />
            </div>
        </div>
    );
}

export default RegistroBien;
