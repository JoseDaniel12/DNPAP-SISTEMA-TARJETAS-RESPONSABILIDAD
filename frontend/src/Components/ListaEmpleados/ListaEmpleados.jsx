import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Column } from 'primereact/column';
import { useAuth } from '../../Auth/Auth'

function ListaEmpleados({ tarjetasEditables = false }) {
    const navigate = useNavigate();
    const { loginData } = useAuth();
    const editable = true;
    // const editable = loginData?.usuario.tipo_usuario === 'AUXILIAR';

    // Filtros de la tabla de empleados
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState(null);
    const [filtrosAplicados, setFiltrosAplicados] = useState(false);

    // Empleados
    const [empleados, setEmpleados] = useState([]);


    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            dpi: { value: null, matchMode: FilterMatchMode.CONTAINS },
            nit: { value: null, matchMode: FilterMatchMode.CONTAINS },
            nombres: { value: null, matchMode: FilterMatchMode.CONTAINS },
            apellidos: { value: null, matchMode: FilterMatchMode.CONTAINS },
            cargo: { value: null, matchMode: FilterMatchMode.CONTAINS },
            saldo: { value: null, matchMode: FilterMatchMode.CONTAINS },
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


    const formatoMonedaGTQ = new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: 'GTQ',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });


    let titulo = (
        <>
            <h1 className=' mb-0 text-black-alpha-70'>Buscar Empleado a Visualizar Tarjetas</h1>
        </>
    );
    if (editable)  {
        titulo = (
            <>
                <h1 className=' mb-0 text-black-alpha-70'>Administrar Tarjetas de Responsabilidad</h1>
                <h1 className=' mt-0 text-black-alpha-70'>de Empleados del DNPAP</h1>
            </>
        );
    }



    const obtenerVinculoTarjeta = empleado  => {
        if (editable) {
            return (
                <Button 
                    type='button' 
                    icon='pi pi-file-edit'
                    className='p-button-warning p-button-outlined w-auto'
                    label='Editar Tarjetas'
                    onClick={() => {
                        navigate('/tarjetas-empleado', { state: { empleado } });
                    }}
                />
            );
        } 
        return (
            <Button 
                type='button' 
                icon='pi pi-eye'
                className='p-button-info p-button-outlined w-auto'
                label='Ver Tarjetas'
                onClick={() => {
                    navigate('/tarjetas-empleado', { state: { empleado } });
                }}
            />
        );
    }


    const columnaMontoTemplate = (empleado) => {
        return (
            <span>{formatoMonedaGTQ.format(empleado.saldo)}</span>
        );
    };


    useEffect(() => {
        fetch('http://localhost:5000/empleados/lista-empleados')
        .then(res => res.json())
        .then(data => setEmpleados(data.empleados));

        initFilters();
    }, []);


    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-12 text-center'>
                {titulo}
            </div>

            <div className='col-12'>
                <DataTable 
                    value={empleados} 
                    filters={filters}
                    paginator
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Empleado {first} a {last} de  {totalRecords}'
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
                                    id='busquedaEmpleado'
                                    value={globalFilterValue}
                                    placeholder='Buscar por valor clave'
                                    onChange={onGlobalFilterChange} 
                                />
                            </span>
                        </div>
                    }
                >
                    <Column field='Index' header='No.' body={(data, props) => props.rowIndex + 1}/>
                    <Column field='dpi' header='DPI' />
                    <Column field='nombres' header='Nombres' />
                    <Column field='apellidos' header='Apellidos' />
                    <Column field='cargo' header='Cargo' />
                    <Column 
                        field='saldo'
                        header='Saldo' 
                        body={columnaMontoTemplate}
                    />
                    <Column 
                        header='Accion' 
                        body = { obtenerVinculoTarjeta }
                    />
                </DataTable>
            </div>
        </div>
    );
}

export default ListaEmpleados;
