import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { format } from 'date-fns'
import AgregarBienesTarjeta from '../AgregarBienesTarjeta/AgregarBienesTarjeta';

import registros from './registros';
import tarjetasRequests from '../../Requests/tarjetasReuests';
  

function TarjetasEmpleado() {
    const navigate = useNavigate();
    const location = useLocation();
    const { empleado, tarjetasEditables} = location.state;

    const [tarjetas, setTarjetas] = useState({});
    const [tarjeta, setTarjeta] = useState('');
    const [registrosSeleccionados, setRegistrosSeleccionados] = useState([]);

    // Apartir de esta fecha se colocara letra a color al momento de generar un pdf
    const [fecha, setFecha] = useState(null);


    const handleSelectRegistro = (e) => {
        const registroSeleccionado = e.data;
        setFecha(registroSeleccionado.fecha);
        const registrosSeleccionados = [
            registroSeleccionado,
            ...tarjeta.registros.filter(registro => registro.fecha > registroSeleccionado.fecha)
        ];
        setRegistrosSeleccionados(registrosSeleccionados);
    };


    const handleDeseleccionarRegistro = (e) => {
        setFecha(null);
        setRegistrosSeleccionados([]);
    }


    const handleGenerarPDF = async () => {
        const blob = await tarjetasRequests.generarPDF(tarjeta.id_tarjeta_responsabilidad, fecha);
        const url = window.URL.createObjectURL(blob);
        // Creación de un enlace temporal y simulación de un clic en él para iniciar la descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tarjeta.numero}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };


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
        if (isNaN(precio)) return;
        return (
            <span>{formatoMonedaGTQ.format(precio)}</span>
        );
    };

    const formatDate = (date) => {
        return format(date, 'dd/MM/yyyy');
    };

    const dateBodyTemplate = (fila) => {
        return formatDate(fila.fecha);
    };


    useEffect(() => {
        tarjetasRequests.getTarjetasEmpleado(empleado.id_empleado).then((response) => {
            const tarejasPorNumero = response.data;
            const numeros = Object.keys(tarejasPorNumero);
            if (numeros.length) setTarjeta(tarejasPorNumero[numeros[0]]);
            setTarjetas(tarejasPorNumero);
        });
    }, []);


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
                    onClick={() => navigate(`/asignar-bienes/${empleado.id_empleado}`)}
                />
            </div>


            <Divider/>
            <div className='col-12 flex flex-wrap justify-content-between xl:justify-content-between'>
                <div className='field col max-w-max'>
                    <label className='font-bold text-black-alpha-70 block'>Tarjeta No. {tarjeta.numero}</label>
                    <Button 
                        label='Generar PDF de Tarjeta'
                        severity='help'
                        icon='pi pi-file-pdf'
                        className='md:w-auto flex-shrink-2'
                        onClick={handleGenerarPDF}
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
                    {/* <div className='flex flex-wrap gap-1'>
                        <div className='col p-0'>
                            <InputText id='search' type='text' placeholder='No. Tarjeta'/>
                        </div>
                        <div className='col-12 lg:max-w-max p-0'>
                            <Button label='buscar' icon='pi pi-search'/>
                        </div>
                    </div> */}
                    <div className='flex flex-wrap gap-1'>
                        <div className='col-12 p-0'>
                        <Dropdown 
                            optionLabel='numero' filter 
                            placeholder='Seleccione una tarjeta'
                            options={Object.values(tarjetas)} 
                            value={tarjeta?.numero || null}
                            onChange={e => setTarjeta(e.value)}
                        />
                        </div>
                    </div>

                </div>
            </div>

            <Divider/>

            <div className='col-12 mb-6'>
                <DataTable
                    className='mb-6'
                    value={tarjeta.registros}
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
                    selectionMode='checkbox'
                    selection={registrosSeleccionados}
                    onRowSelect={handleSelectRegistro}
                    onRowUnselect={handleDeseleccionarRegistro}
                    dataKey='id_registro'
                >
                    <Column selectionMode='multiple'></Column>
                    <Column field='fecha' header='Fecha' dataType='date' body={dateBodyTemplate}/>
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
