import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import  { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup'
import { v4 as uuidv4 } from 'uuid';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { DataTable } from "primereact/datatable";
import { Column } from 'primereact/column';
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { FilterMatchMode } from 'primereact/api';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';

import { useToast } from '../../../hooks/useToast';
import useTableFilters from '../../../hooks/useTableFilters';
import { quetzalesTemplate } from '../../TableColumnTemplates';
import bienesRequests from '../../../Requests/bienesRequests';
import modelosRequests from '../../../Requests/modelosRequests';

const estadosBien = {
    ASIGNADO: 'Asignado',
    SIN_ASIGNAR: 'Sin asignar'
}

function GestionBienes() {
    const toast = useToast('bottom-right');
    const navigate = useNavigate();

    const { id_modelo } = useParams();
    const [modelo, setModelo] = useState({});
    const [bienes, setBienes] = useState([]);
    const [bienesSeleccionados, setBienesSeleccionados] = useState([]);
    const [idBienEnEdicion, setIdBienEnEdicion] = useState(null);

    const bienSchema = yup.object({
        sicoin: yup.string(),
        no_serie: yup.string(),
        no_inventario: yup.string()    
    });

    const defaultValues = {
        sicoin: '',
        no_serie: '',
        no_inventario: '',
    };

    const formBien = useForm({
        defaultValues,
        resolver: yupResolver(bienSchema),
        mode: 'onSubmit'
    });

    const { 
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = formBien;


    // ______________________________  Filtros ______________________________
    const filtrosBienes = useTableFilters({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        sicoin: { value: null, matchMode: FilterMatchMode.CONTAINS },
        no_serie: { value: null, matchMode: FilterMatchMode.CONTAINS },
        no_inventario: { value: null, matchMode: FilterMatchMode.CONTAINS },
        estado: { value: null, matchMode: FilterMatchMode.EQUALS },
    });
    // ______________________________________________________________________
    


    const handleSelectAll = () => {
        if (bienesSeleccionados.length === 0) {
            let bienesSinAsignar = bienes.filter(b => b.id_tarjeta_responsabilidad === null);
            setBienesSeleccionados(bienesSinAsignar);
        } else {
            setBienesSeleccionados([]);
        }
    };


    const handleSingleSelect = (e) => {
        setBienesSeleccionados(e.value.filter(b => b.id_tarjeta_responsabilidad === null));
    };


    const handleDescargarEjmploArchivoCarga = async () => {
        const blob = await modelosRequests.getEjemploArchvioCargaBienes();
        const url = window.URL.createObjectURL(blob);
        // Creación de un enlace temporal y simulación de un clic en él para iniciar la descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = `EjemploCargaMasivaDeBienes.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };


    const validateDisponibilidadnoSerie = async (no_serie) => {
        if (no_serie === '') return true;
        for (const bien of bienes) {
            if (bien.no_serie === no_serie) {
               return  false;
            }
        }
        const response = await bienesRequests.validarDisponibilidadNoSerie(no_serie);
        return response.data;
    };


    const handleAgregarBien = async (bien) => {
        const noSerieDisponible = await validateDisponibilidadnoSerie(bien.no_serie);
        if (!noSerieDisponible) setError('no_serie', {
            type: 'manual',
            message: 'No. Serie ya registrado.'
        });

        if (Object.keys(formBien.formState.errors).length > 0) return;

        bien.id_modelo = id_modelo;
        bien.estado = estadosBien.SIN_ASIGNAR;

        bienesRequests.registrarBienesComunes({ bienes: [bien]}).then(response => {
            if (!response.error) {
                setBienes(prevBienes => [...prevBienes, bien]);
                toast.current.show({severity: 'success', summary: 'Registrar bien', detail: 'Bien registrado exitosamente.', life: 3000});
                formBien.reset();
            } else {
                toast.current.show({severity: 'error', summary: 'Registrar bien', detail: response.error, life: 3000});
            }
        });
    };


    const handleActivarEdicion = (bien) => {
        setIdBienEnEdicion(bien.id_bien);
        formBien.reset(bien);
    };

    const handleCancelarEdicion = () => {
        setIdBienEnEdicion(null);
        formBien.reset(defaultValues);
    };


    const editarBien = () => {
        bienesRequests.editarBien(idBienEnEdicion, formBien.getValues()).then(response => {
            if (!response.error) {
                const bienActualizado = response.data;
                setBienes(prevBienes => prevBienes.map(b => b.id_bien === idBienEnEdicion ? bienActualizado : b));
                toast.current.show({severity: 'success', summary: 'Edición de Bien', detail: 'Bien editado exitosamente.', life: 3000});
                setIdBienEnEdicion(null);
                formBien.reset(defaultValues);
            } else {
                toast.current.show({severity: 'error', summary: 'Edición de Bien', detail: response.error, life: 3000});
            }
        });
    };


    const handleEditarBien = () => {
        confirmDialog({
            header: 'Edición de Bien',
            message: '¿Está seguro que desea editar el Bien?',
            icon: 'pi pi-exclamation-triangle',
            accept: editarBien,
            reject: () => {}
        });
    };

    
    const eliminarBienes = bienes => {
        const idsBienes = bienes.map(b => b.id_bien);
        bienesRequests.eliminarBienes({idsBienes}).then(response => {
            if (!response.error) {
                setBienes(prevBienes => prevBienes.filter(b => !idsBienes.includes(b.id_bien)));
                toast.current.show({severity: 'success', summary: 'Eliminación', detail: 'Eliminación exitosa.', life: 3000});
            } else {
                toast.current.show({severity: 'error', summary: 'Eliminación', detail: response.error, life: 3000});
            }
        });
    };


    const handleEliminarBienes = bienes => {
        confirmDialog({
            header: 'Eliminación',
            message: '¿Estas seguro de realizar la eliminación?',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => eliminarBienes(bienes)
        });
    };


    useEffect(() => {
        // Cargar el modelo
        modelosRequests.getModelo(id_modelo).then(response => {
            const modelo = response.data;
            setModelo(modelo);
        });

        // Cargar los bienes del modelo
        modelosRequests.getBienesModelo(id_modelo).then(response => {
            let bienes = response.data;
            bienes = bienes.map(b =>  {
                b.estado = b.id_tarjeta_responsabilidad ? estadosBien.ASIGNADO : estadosBien.SIN_ASIGNAR;
                return b;
            });
            setBienes(bienes);
        });
    }, []);


    const tableHeaderTemplate = () => {
        return (
            <div className='grid'>
                <div className='col-12 -mb-1'>
                    <div className='grid'>
                        <div className='col-12 md:col grid flex flex-wrap justify-content-center md:justify-content-start m-0 p-0'>
                            <div className='col md:max-w-max'>
                                <Button 
                                    label='Importar Excel'
                                    icon='pi pi-file-import'
                                    className='p-button-outlined'
                                    style={{color: '#217346'}}
                                    onClick={() => navigate(`/cargar-bienes-modelo/${id_modelo}`)}
                                />
                            </div>
                            <div className='col max-w-max px-0'>
                                <Button
                                    tooltip='Descargar Ejemplo de Archivo de Carga'
                                    tooltipOptions={{ position: 'bottom' }}
                                    icon='pi pi-file-excel'
                                    className='p-button-outlined'
                                    style={{color: '#217346'}}
                                    onClick={handleDescargarEjmploArchivoCarga}
                                />
                            </div>
                        </div>

                        {
                            bienesSeleccionados.length > 0 && (
                                <div className='col-12 md:max-w-max justify-self-end'>
                                        <Button 
                                            label ='Eliminar Seleccionados'
                                            severity='danger'
                                            icon='pi pi-times'
                                            className='p-button-outlined'
                                            onClick={() => handleEliminarBienes(bienesSeleccionados)}
                                        />
                                </div>
                            )
                        }
                    </div>
                </div>

                <div className='col-12 flex gap-1 -mb-3'>
                    <div className='p-input-icon-left flex align-items-center'>
                        <i className='pi pi-search'/>
                        <InputText
                            id='busquedaEmpleado'
                            value={filtrosBienes.globalFilterValue}
                            placeholder='Buscar por valor clave'
                            onChange={filtrosBienes.onGlobalFilterChange} 
                        />
                    </div>
                    <Button
                        tooltip='Limpiar Filtros'
                        tooltipOptions={{ position: 'bottom' }}
                        icon='pi pi-filter-slash'
                        severity='help'
                        className='w-max-auto p-button-outlined'
                        onClick={filtrosBienes.initFilters}
                    />
                </div>
            </div>
        );
    };


    const accionesTemplate = (bien) => {
        if (bien.estado === estadosBien.ASIGNADO) {
            return (
                <Button
                    tooltip='Ir a Tarjeta'
                    tooltipOptions={{ position: 'bottom' }}
                    icon='pi pi-arrow-right'
                    severity='info'
                    className='p-button-rounded p-button-outlined'
                    onClick={() => navigate(`/tarjetas-empleado/${bien.id_empleado}?id_tarjeta_responsabilidad=${bien.id_tarjeta_responsabilidad}`) }
                />
            );
        }


        return (
            <div className='flex justify-content-start gap-2'>
                <Button
                    tooltip='Editar'
                    tooltipOptions={{ position: 'bottom' }}
                    icon='pi pi-pencil'
                    severity='warning'
                    className='p-button-rounded p-button-outlined'
                    onClick={() => handleActivarEdicion(bien)}
                />
                <Button
                    tooltip='Eliminar'
                    tooltipOptions={{ position: 'bottom' }}
                    icon='pi pi-times'
                    severity='danger'
                    className='p-button-rounded p-button-outlined'
                    onClick={() => handleEliminarBienes([bien])}
                />
            </div>
        );
    };


    const estadoBienBodyTemplate = (bien) => {
        const etiqueta = bien.id_tarjeta_responsabilidad ? 'Asignado' : 'Sin asignar';
        const severity = etiqueta === 'Asignado' ? 'info' : 'warning';
        return <Tag value={etiqueta} severity={severity}  className='text-sm font-medium'/>;
    };


    const estadoBienItemTemplate = (estado) => {
        const severity = estado === 'Asignado' ? 'info' : 'warning';
        return <Tag value={estado} severity={severity}  className='text-sm font-medium'/>;
    };


    const estadoBienFilterTemplate = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={[estadosBien.ASIGNADO, estadosBien.SIN_ASIGNAR]}
                onChange={e => options.filterCallback(e.value, options.index)}
                itemTemplate={estadoBienItemTemplate}
                className='p-column-filter'
                showClear
            />
        );
    };


    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <ConfirmDialog dismissableMask={true} />

            <div className='col-12 relative'>
                <div className='mb-3 md:absolute md:max-w-max'>
                    <Button
                        label='Regresar'
                        severity='warning'
                        icon='pi pi-arrow-left'
                        className='p-button-outlined'
                        onClick={() => navigate(-1)}
                    />
                </div>
                <div className='text-center'>
                    <h1 className='text-black-alpha-70 m-0 mb-2'>Gestion de Bienes de Modelo</h1>
                </div>
            </div>

            <div className='col-12 mb-1'>
                <DataTable 
                    value={[modelo]}
                    selectionMode='single'
                    scrollable
                    scrollHeight='120px'
                    showGridlines
                >
                    <Column field='descripcion' header='Descripción del Modelo' />
                    <Column field='marca' header='Marca' />
                    <Column field='codigo' header='Codigo' />
                    <Column field='precio' header='Precio' body={row => quetzalesTemplate(row.precio)} dataType='numeric'/>
                </DataTable>
            </div>

            <div className='col-12 md:col-3'>
                <h1 className='text-lg'>Datos de Bien:</h1>

                <div className='field col-12 mb-0'>
                    <label htmlFor='sicoin' className='font-bold block'>SICOIN: </label>
                    <InputText 
                        id='sicoin'
                        placeholder='SICOIN del bien'
                        { ...register('sicoin') }
                    />
                    { errors.sicoin && <Message severity='error' text={errors.sicoin?.message} className='mt-1 p-1'/> }
                </div>

                <div className='field col-12 mb-0'>
                    <label htmlFor='no_serie' className='font-bold block'>No serie: </label>
                    <InputText 
                        id='no_serie'
                        placeholder='No. Serie del bien' 
                        { ...register('no_serie') }
                    />
                    { errors.no_serie && <Message severity='error' text={errors.no_serie?.message} className='mt-1 p-1'/> }
                </div>

                <div className='field col-12 mb-0'>
                    <label htmlFor='no_inventario' className='font-bold block'>No Inventario: </label>
                    <InputText
                        id='no_inventario'
                        placeholder='No. inventario del bien'
                        { ...register('no_inventario') }
                    />
                </div>

                <div className='col-12'>
                    {
                        idBienEnEdicion !== null ? (
                            <div className='grid'>
                                <div className='col-12 md:col-6'>
                                    <Button
                                        tooltip='Cancelar'
                                        tooltipOptions={{ position: 'bottom' }}
                                        severity='info'
                                        icon='pi pi-arrow-left'
                                        iconPos='left'
                                        onClick={handleCancelarEdicion}
                                        className='w-full'
                                    />
                                </div>
                                <div className='col-12 md:col-6'>
                                    <Button
                                        severity='warning'
                                        label='Editar'
                                        icon='pi pi-pencil'
                                        iconPos='left'
                                        onClick={handleEditarBien}
                                        className='w-full'
                                    />
                                </div>
                            </div>
                        ) : (
                            <Button 
                                type='submit'
                                severity='success'
                                label='Agregar Bien'
                                icon='pi pi-plus'
                                iconPos='left'
                                onClick={handleSubmit(handleAgregarBien)}
                                className='w-full'
                            />
                        )
                    }

                </div>
            </div>

            <div className='col-12 md:col-9'>
                <DataTable 
                    value={bienes}
                    selectionMode='checkbox'
                    selection={bienesSeleccionados}
                    onSelectAllChange={handleSelectAll}
                    onSelectionChange={handleSingleSelect}
                    filters={filtrosBienes.filters}
                    paginator
                    paginatorPosition='top'
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Bien {first} a {last} de  {totalRecords}'
                    rows={20}
                    scrollable
                    scrollHeight='400px'
                    showGridlines
                    stripedRows
                    header={tableHeaderTemplate}
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                    <Column field='sicoin' header='Sicoin'  filter filterPlaceholder='Buscar por sicoin'/>
                    <Column field='no_serie' header='No. Serie' filter filterPlaceholder='Buscar por No. serie' />
                    <Column field='no_inventario' header='No. Inventario'  filter filterPlaceholder='Buscar por No. inventario'/>
                    <Column field='estado' header='Estado' body={estadoBienBodyTemplate} filter filterMenuStyle={{ width: '14rem' }} filterElement={estadoBienFilterTemplate} />
                    <Column header='Acciones' body={accionesTemplate} />
                </DataTable>
            </div>
        </div>
    );
}

export default GestionBienes;
