import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { format } from 'date-fns';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
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

    const precioTemplate = (precio, row) => {
        if (row.es_nota || isNaN(precio)) return;
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

    const rowClass  = (row) => {
        if (row.es_nota) return 'font-bold';
    }


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

            <div className='col-12 text-center text-center mt-0 pt-0'>
                <h1 className='text-black-alpha-70'>Tarjetas de {empleado.nombres}</h1>
            </div>

            <div className='col-12 grid m-0'>
                <div className='col-12 md:max-w-10rem'>
                    <Button 
                        label='Volver'
                        icon='pi pi-arrow-left'
                        className='p-button-outlined'
                        onClick={() => navigate(-1)}
                    />
                </div>

                <div className='col-12 md:col grid flex flex-wrap justify-content-center md:justify-content-end m-0 p-0'>
                    <div className='col-12 md:max-w-max'>
                        <Dropdown 
                            optionLabel='numero' filter 
                            placeholder='Seleccionar Tarjeta'
                            options={Object.values(tarjetas)} 
                            value={tarjeta?.numero || null}
                            style={{borderColor: '#878787b3'}}
                            onChange={e => setTarjeta(e.value)}
                        />
                    </div>
                    <div className='col-12 md:max-w-max'>
                        <Button 
                            label='Asignar Bienes'
                            severity='success'
                            icon='pi pi-plus'
                            className='p-button-rounded md:w-auto p-button-outlined'
                            onClick={() => navigate(`/asignar-bienes/${empleado.id_empleado}`)}
                        />
                    </div>
                    <div className='col-12 md:max-w-max'>
                        <Button
                            type='button'
                            label='Traspasar Bienes'
                            severity='warning'
                            icon='pi pi-arrow-right-arrow-left'
                            className='p-button-rounded md:w-auto p-button-outlined'
                            onClick={() => navigate(`/traspasar-bienes/${empleado.id_empleado}/${tarjeta.id_tarjeta_responsabilidad}`)}
                        />
                    </div>
                    <div className='col-12 md:max-w-max'>
                        <Button 
                            label='Desasignar Bienes'
                            severity='danger'
                            icon='pi pi-trash'
                            className='p-button-rounded md:w-auto p-button-outlined'
                            onClick={() => navigate(`/desasignar-bienes/${empleado.id_empleado}`)}
                        />
                    </div>
                </div>
            </div>


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
                        <div className='grid p-0'>
                            <div className='col-12 flex flex-wrap align-items-end justify-content-between pb-0'>
                                <div className='field col max-w-max'>
                                    <label className='font-bold text-black-alpha-70 block'>No. Tarjeta:</label>
                                    <h1 className='p-0 m-0  text-black-alpha-70'>{tarjeta.numero}</h1>
                                </div>
                                <div className='field col max-w-max'>
                                    <label className='font-bold text-black-alpha-70 block'>Tarjeta No. {tarjeta.numero}</label>
                                    <Button 
                                        label='Generar PDF de Tarjeta'
                                        severity='help'
                                        icon='pi pi-file-pdf'
                                        className='md:w-auto flex-shrink-2 p-button-outlined'
                                        onClick={handleGenerarPDF}
                                    />
                                </div>
                                <div className='field col max-w-max'>
                                    <label className='font-bold text-black-alpha-70 block'>Cambiar No. Tarjeta:</label>
                                    <div className='flex flex-wrap gap-1 p-0'>
                                        <div className='col p-0'>
                                            <InputText id='search' type='text' placeholder='Nuevo No. Tarjeta'/>
                                        </div>
                                        <div className='col-12 lg:max-w-max p-0'>
                                            <Button severity='danger' label='Cambiar' icon='pi pi-pencil' className='p-button-outlined'/>
                                        </div>
                                    </div>
                                </div>
                                {/* <div className='field col max-w-max'>
                                    <label className='font-bold text-black-alpha-70 block'>Bienes de Tarjeta:</label>
                                    <Button 
                                        type='button'
                                        severity='warning'
                                        label='Traspasar Bienes a Otro Empleado'
                                        icon='pi pi-arrow-right-arrow-left'
                                        className='md:w-auto flex-shrink-1 p-button-outlined'
                                        onClick={() => navigate(`/traspasar-bienes/${empleado.id_empleado}/${tarjeta.id_tarjeta_responsabilidad}`)}
                                    />
                                </div> */}
                            </div>
                            <div className='col-12  flex justify-content-end'>
                                <span className='p-input-icon-left flex align-items-center'>
                                    <i className='pi pi-search' />
                                    <InputText
                                        id='busquedaEmpleado'
                                        placeholder='Buscar por valor clave'
                                    />
                                </span>
                            </div>
                        </div>
                    }
                    selectionMode='checkbox'
                    selection={registrosSeleccionados}
                    onRowSelect={handleSelectRegistro}
                    onRowUnselect={handleDeseleccionarRegistro}
                    dataKey='id_registro'
                    rowClassName={rowClass}
                >
                    <Column selectionMode='multiple'></Column>
                    <Column field='fecha' header='Fecha' dataType='date' body={dateBodyTemplate}/>
                    <Column field='cantidad' header='Cantidad' body={row  => {
                        if (row.es_nota) {
                            return <b>Nota</b>;
                        }
                        return <span>{row.cantidad}</span>;
                    }}/>
                    <Column field='descripcion' header='Descripción' />
                    <Column field='debe' header='Debe'  body={row => precioTemplate(row.debe ,row)}/>
                    <Column field='haber' header='Haber' body={row => precioTemplate(row.haber, row)}/>
                    <Column field='saldo' header='Saldo'  body={row => precioTemplate(row.saldo, row)}/>
                </DataTable>

            </div>
        </div>
    );
}

export default TarjetasEmpleado;
