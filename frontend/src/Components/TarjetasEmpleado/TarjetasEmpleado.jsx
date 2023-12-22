import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import AgregarBienesTarjeta from '../AgregarBienesTarjeta/AgregarBienesTarjeta';

import registros from './registros';
  

function TarjetasEmpleado() {
    const navigate = useNavigate();
    const location = useLocation();
    const { empleado, tarjetasEditables} = location.state;

    const botonTraspasarTemplate = (registro) => {
        if (registro.haber) return;
        return (
            <Button 
                type='button' 
                icon='pi pi-arrow-right-arrow-left'
                className='p-button-warning p-button-outlined w-auto'
                label='Traspasar'
                onClick={() => navigate('/traspasar-bienes')}
            />
        );
    };

    const botonDescargarTemplate = (registro) => {
        if (registro.haber) return;
        return (
            <Button 
                type='button' 
                icon='pi pi-trash'
                className='p-button-danger p-button-outlined w-auto'
                label='Descargar'
                onClick={() => {}}
            />
        );
    };

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


    return (
        <div className='grid col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>

            <div className='col-12 text-center'>
                <h1 className=' mb-0 text-black-alpha-70'>Tarjetas de {empleado.nombres}</h1>
            </div>

            <div className='col-12 -mb-2 flex justify-content-end'>
                <Button 
                    label='Asignar Bienes'
                    severity='success'
                    icon='pi pi-plus'
                    className='p-button-rounded shadow-1 md:w-auto'
                    onClick={() => navigate('/asignar-bienes')}
                />
            </div>


            <Divider/>
            <div className='col-12 flex flex-wrap justify-content-between xl:justify-content-between'>
                <div className='field col max-w-max'>
                    <label className='font-bold text-black-alpha-70 block'>Tarjeta No. 10733</label>
                    <Button 
                        label='Generar PDF de Tarjeta'
                        severity='help'
                        icon='pi pi-file-pdf'
                        className='md:w-auto flex-shrink-2'
                    />
                </div>
                <div className='field col max-w-max'>
                    <label className='font-bold text-black-alpha-70 block'>Cambiar No. Tarjeta</label>
                    <div className='flex flex-wrap gap-1'>
                        <div className='col p-0'>
                            <InputText id='search' type='text' placeholder='Nuevo No. Tarjeta'/>
                        </div>
                        <div className='col-12 lg:max-w-max p-0'>
                            <Button severity='danger' label='Cambiar' icon='pi pi-pencil'/>
                        </div>
                    </div>
                </div>
                <div className='field col max-w-max'>
                    <label htmlFor='search' className='font-bold text-black-alpha-70 block'>Buscar otra de sus tarjetas:</label>
                    <div className='flex flex-wrap gap-1'>
                        <div className='col p-0'>
                            <InputText id='search' type='text' placeholder='No. Tarjeta'/>
                        </div>
                        <div className='col-12 lg:max-w-max p-0'>
                            <Button label='buscar' icon='pi pi-search'/>
                        </div>
                    </div>

                </div>
            </div>

            <Divider/>

            <div className='col-12 mb-6'>
                <DataTable
                    className='mb-6'
                    value={registros}
                    paginator
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Registro {first} a {last} de  {totalRecords}'
                    rows={20}
                    scrollable
                    scrollHeight='400px'
                    showGridlines
                    stripedRows
                    header={
                        <div className='col-12  flex justify-content-end'>
                            <span className='p-input-icon-left flex align-items-center'>
                                <i className='pi pi-search' />
                                <InputText  
                                    placeholder='Buscar por valor clave'
                                />
                            </span>
                        </div>
                    }
                >
                    <Column field='fecha' header='Fecha'/>
                    <Column field='cantidad' header='Cantidad'/>
                    <Column field='descripcion' header='Descripción'/>
                    <Column field='debe' header='Debe'  body={row => precioTemplate(row.debe)}/>
                    <Column field='haber' header='Haber' body={row => precioTemplate(row.haber)}/>
                    <Column field='saldo' header='Saldo'  body={row => precioTemplate(row.saldo)}/>
                    <Column field='nota' header='Nota'/>
                    <Column 
                        header='Traspasar'
                        body = {botonTraspasarTemplate}
                    />
                    <Column 
                        header='Descargar'
                        body = {botonDescargarTemplate}
                    />
                </DataTable>

            </div>
        </div>
    );
}

export default TarjetasEmpleado;
