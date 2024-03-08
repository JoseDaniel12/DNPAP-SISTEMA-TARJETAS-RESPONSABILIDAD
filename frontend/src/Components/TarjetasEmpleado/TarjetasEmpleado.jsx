import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { useToast } from '../../hooks/useToast';
import ComentacionTarjeta from '../ComentacionTarjeta/ComentacionTarjeta';
import { quetzalesTemplate, fechaTemplate } from '../TableColumnTemplates';

import tarjetasRequests from '../../Requests/tarjetasReuests';
import empleadoRequests from '../../Requests/empleadoRequests';
  

function TarjetasEmpleado() {
    const toast = useToast('bottom-right');
    const navigate = useNavigate();

    let { id_empleado } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const id_tarjeta_responsabilidad = searchParams.get('id_tarjeta_responsabilidad');

    const [empleado, setEmpleado] = useState(null);
    const [tarjetas, setTarjetas] = useState({});
    const [tarjeta, setTarjeta] = useState(null);
    const [registros, setRegistros] = useState([]);

    const [visbilidadDialogComentario, setVisbilidadDialogComentario] = useState(false);

    const [nuevoNumeroTarjeta, setNuevoNumeroTarjeta] = useState('');


    const cambiarNumeroTarjeta = async () => {
        await tarjetasRequests.cambiarNumeroTarjeta(tarjeta.id_tarjeta_responsabilidad, nuevoNumeroTarjeta).then(res => {
            if (res.error) {
                return toast.current.show({severity:'error', summary: 'Cambio de No. de Tarjeta', detail: res.error, life: 2500});
            }
            toast.current.show({severity:'success', summary: 'Cambio de Nol Tarjeta', detail: res.message, life: 2500});
            setTarjeta(prev => ({...prev, numero: nuevoNumeroTarjeta}));
            setNuevoNumeroTarjeta('');
        });
    }


    const handleCambiarNumeroTarjeta = async () => {
        if (nuevoNumeroTarjeta === '') return;
        const disponibilidad = await tarjetasRequests.numeroDisponible(nuevoNumeroTarjeta).then(res => res.data);
        if (!disponibilidad) {
            return toast.current.show({severity:'error', summary: 'Cambio de No. de Tarjeta', detail: `El numero de tarjeta ${nuevoNumeroTarjeta} ya existe.`, life: 2500});        
        };

        confirmDialog({
            header: 'Cambio de No. de Tarjeta',
            message: '¿Está seguro que desea cambiar el número de tarjeta?',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'reject',
            accept: cambiarNumeroTarjeta       
        });
    };


    const handleGenerarExcel = async () => {
        const blob = await tarjetasRequests.generarExcel(tarjeta.id_tarjeta_responsabilidad);
        const url = window.URL.createObjectURL(blob);
        // Creación de un enlace temporal y simulación de un clic en él para iniciar la descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tarjeta.numero}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };


    const hanldeComentarTarjeta = async (tarjetaConNuevoRegistro) => {
        if (tarjeta?.id_tarjeta_responsabilidad === tarjetaConNuevoRegistro.id_tarjeta_responsabilidad) {
            setRegistros(prev => [...prev, tarjetaConNuevoRegistro.registros[0]]);
        } else {
            delete tarjetaConNuevoRegistro.registros;
            setTarjetas(prev => [tarjetaConNuevoRegistro , ...prev]);
            setTarjeta(tarjetaConNuevoRegistro);
        }
    };
    
    const precioTemplate = (precio, row) => {
        if (row.es_nota || isNaN(precio)) return;
        return quetzalesTemplate(precio);
    };

    const rowClass = (row) => {
        if (row.es_nota) return 'font-bold';
    }


    const sideTemplate = (registro) => {
        const label = registro.anverso ? 'Anverso' : 'Reverso';
        const severity = registro.anverso ? 'primary' : 'warning';
        return <Tag value={label} severity={severity} className='p-2 text-sm'></Tag>;
    }


    useEffect(() => {
        empleadoRequests.getEmpleado(id_empleado).then((response) => {
            const empleado = response.data.empleado;
            setEmpleado(empleado);

            tarjetasRequests.getTarjetasEmpleado(empleado.id_empleado).then((response) => {
                const tarjetas = response.data;
                setTarjetas(tarjetas);

                if (id_tarjeta_responsabilidad) {
                    const tarjeta = tarjetas.find(tarjeta => tarjeta.id_tarjeta_responsabilidad === id_tarjeta_responsabilidad);
                    if (tarjeta) {
                        setTarjeta(tarjeta);
                    }
                }

                if (!tarjeta && tarjetas.length > 0) {
                    setTarjeta(tarjetas[0]);
                }
            });
        });
    }, []);


    useEffect(() => {
        if (!tarjeta) return;
        tarjetasRequests.getRegistrosTarjeta(tarjeta.id_tarjeta_responsabilidad).then((response) => {
            const registros = response.data;
            setRegistros(registros);
        });
    }, [tarjeta]);


    return (
        <div className='grid col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <ConfirmDialog  dismissableMask={true}/>

            <div className='col-12 text-center text-center mt-0 pt-0'>
                <h1 className='text-black-alpha-70'>Tarjetas de {empleado?.nombres}</h1>
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
                        <Button 
                            label='Comentar en Tarjetas'
                            severity='help'
                            icon='pi pi-file-edit'
                            className='p-button-rounded md:w-auto p-button-outlined'
                            onClick={() => setVisbilidadDialogComentario(true)}
                        />
                        <ComentacionTarjeta
                            visible={visbilidadDialogComentario}
                            setVisible={setVisbilidadDialogComentario}
                            onComentarTarjeta={hanldeComentarTarjeta}
                            id_empleado={empleado?.id_empleado}
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
                            onClick={() => navigate(`/traspasar-bienes/${empleado.id_empleado}`)}
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
                    value={registros}
                    paginator
                    paginatorPosition='top'
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Registro {first} a {last} de  {totalRecords}'
                    rows={20}
                    scrollable
                    scrollHeight='800px'
                    showGridlines
                    stripedRows
                    header={
                        <div className='grid p-0'>
                            <div className='col-12 flex flex-wrap justify-content-between pb-0'>
                                <div className='field col max-w-max'>
                                    <label className='font-bold text-black-alpha-70 block'>No. Tarjeta:</label>
                                    <h1 className='p-0 m-0 text-black-alpha-70'>{tarjeta?.numero}</h1>
                                </div>
                    
                                <div className='col-12 md:col max-w-max'>
                                    <label className='font-bold text-black-alpha-70 block mb-1 md:mb-2'>Saldo de Tarjeta:</label>
                                    <label className='font-bold text-black-alpha-70 block '>
                                        Entrante: <span className='font-normal'>{tarjeta?.saldo_que_viene}</span>
                                    </label>
                                    <label className='font-bold text-black-alpha-70 block'>
                                        Saliente: <span className='font-normal'>{tarjeta?.saldo}</span>
                                    </label>
                                </div>

                                <div className='field col max-w-max'>
                                    <label className='font-bold text-black-alpha-70 block'>Cambiar No. Tarjeta:</label>
                                    <div className='flex flex-wrap gap-1 p-0'>
                                        <div className='col p-0'>
                                            <InputText 
                                                id='search' type='text' placeholder='Nuevo No. Tarjeta'
                                                value={nuevoNumeroTarjeta}
                                                onChange={e => setNuevoNumeroTarjeta(e.target.value)}
                                            />
                                        </div>
                                        <div className='col-12 lg:max-w-max p-0'>
                                            <Button
                                                severity='danger' label='Cambiar' icon='pi pi-pencil' className='p-button-outlined'
                                                onClick={handleCambiarNumeroTarjeta}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='field col max-w-max lg:align-self-end'>
                                    <Button 
                                        label='Generar EXCEL de Tarjeta'
                                        icon='pi pi-file-excel'
                                        className='md:w-auto flex-shrink-2 p-button-outlined'
                                        style={{color: '#217346'}}
                                        onClick={handleGenerarExcel}
                                    />
                                </div>

                                <div className='field col max-w-max lg:align-self-end'>
                                    <Dropdown 
                                        optionLabel='numero' filter
                                        placeholder='Seleccionar Tarjeta'
                                        options={tarjetas} 
                                        style={{borderColor: '#878787b3'}}
                                        onChange={e => {
                                            setTarjeta(e.value);
                                            setSearchParams(prev => ({
                                                ...prev,
                                               id_tarjeta_responsabilidad: e.value.id_tarjeta_responsabilidad
                                            }));
                                        }}
                                    />
                                </div>
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

                    dataKey='id_registro'
                    rowClassName={rowClass}
                >
                    <Column field='fecha' header='Fecha' dataType='date' body={row => fechaTemplate(row.fecha)}/>
                    <Column field='cantidad' header='Cantidad'/>
                    <Column field='descripcion' header='Descripción' />
                    <Column field='debe' header='Debe'  body={row => precioTemplate(row.debe, row)}/>
                    <Column field='haber' header='Haber' body={row => precioTemplate(row.haber, row)}/>
                    <Column field='saldo' header='Saldo'  body={row => precioTemplate(row.saldo, row)}/>
                    <Column field='anverso' header='Lado'  body={sideTemplate}/>
                </DataTable>

            </div>
        </div>
    );
}

export default TarjetasEmpleado;
