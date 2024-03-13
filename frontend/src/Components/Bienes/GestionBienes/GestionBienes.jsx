
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectButton } from 'primereact/selectbutton';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { useToast } from '../../../hooks/useToast';
import { quetzalesTemplate } from '../../TableColumnTemplates';
import bienesRequests from '../../../Requests/bienesRequests';

function GestionBienes() {
    const toast = useToast('bottom-right');
    const navigate = useNavigate();

    const [asignados, setAsiganos] = useState(true);
    const tiposBienes = [
        {  value: 'Asignados' },
        {  value: 'Desasignados' }
    ];

    const [bienes, setBienes] = useState([]);


    // ______________________________  Filtros ______________________________
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState(null);
    const [filtrosAplicados, setFiltrosAplicados] = useState(false);


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
    // ______________________________________________________________________


    const eliminarBien = (id_bien) => {
        bienesRequests.eliminarBien(id_bien).then(response => {
            if (!response.error) {
                setBienes(prev => prev.filter(b => b.id_bien !== id_bien));
                toast.current.show({ severity: 'success', summary: 'Eliminación de Bien', detail: response.message });
            } else {
                toast.current.show({ severity: 'error', summary: 'Eliminación de Bien', detail: response.message });
            }
        });
    };


    const handleEliminarBien = (id_bien) => {
        confirmDialog({
            header: 'Eliminación de Bien',
            message: '¿Estas seguro de eliminar el Bien?',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => eliminarBien(id_bien)
        });
    };

    
    useEffect(() => {
        initFilters();
    }, []);

    useEffect(() => {
        if (asignados) {
            bienesRequests.getBienesAsignados().then(response => {
                setBienes(response.data);
            });
        } else {
            bienesRequests.getBienesSinAsignar().then(response => {
                setBienes(response.data);
            });
        }
    }, [asignados]);


    const encabezadoTablaBienesTemplate = () => (
        <div className='col-12  flex justify-content-end'>
            <span className='p-input-icon-left flex align-items-center'>
                <i className='pi pi-search' />
                <InputText
                    id='busquedaBien'
                    value={globalFilterValue}
                    placeholder='Buscar por valor clave'
                    onChange={onGlobalFilterChange} 
                />
            </span>
        </div>
    );


    const accionesTemplate = (row) => {
        const bien = bienes.find(b => b.id_bien === row.id_bien);

        return (
            <div className='flex justify-content-center gap-2'>
                {
                    asignados  && (
                        <Button
                            tooltip='Ir a tarjeta'
                            tooltipOptions={{ position: 'bottom' }}
                            icon='pi pi-arrow-right'
                            severity='info'
                            className='p-button-rounded p-button-outlined'
                            onClick={() => navigate(`/tarjetas-empleado/${bien.id_empleado}?id_tarjeta_responsabilidad=${bien.id_tarjeta_responsabilidad}`) }
                        />
                    )
                }

                {
                    !asignados  && (
                        <>
                            <Button
                                tooltip='Editar'
                                tooltipOptions={{ position: 'bottom' }}
                                icon='pi pi-pencil'
                                severity='warning'
                                className='p-button-rounded p-button-outlined'
                                onClick={() => navigate(`/editar-bien/${bien.id_bien}`)}
                            />

                            <Button
                                tooltip='Eliminar'
                                tooltipOptions={{ position: 'bottom' }}
                                icon='pi pi-times'
                                severity='danger'
                                className='p-button-rounded p-button-outlined'
                                onClick={() => handleEliminarBien(bien.id_bien)}
                            />
                        </>
                    )
                }
            </div>
        )
    };


    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <ConfirmDialog dismissableMask={true} />

            <div className='col-12 text-center'>
                <h1 className='text-black-alpha-70 m-0 mb-2'>Gestion de Bienes</h1>
            </div>

            <div className='col-12 grid'>
                <div className='col-12 md:col-8'>
                    <SelectButton  
                        options={tiposBienes} optionLabel='value'
                        value={asignados ? 'Asignados' : 'Desasignados'}
                        onChange={e => setAsiganos(e.value === 'Asignados')}
                    />
                </div>

                <div className='col-12 md:col-4'>
                    <Button
                        label='Registrar Bienes'
                        icon='pi pi-plus'
                        severity='success'
                        className='p-button-outlined p-button-rounded'
                        onClick={() => navigate('/registar-bienes')}
                    />
                </div>
            </div>

            <div className='col-12'>
                <DataTable 
                    value={bienes}
                    filters={filters}
                    paginator
                    paginatorPosition='top'
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Bien {first} a {last} de  {totalRecords}'
                    rows={20}
                    scrollable
                    scrollHeight='400px'
                    showGridlines
                    stripedRows 
                    header={encabezadoTablaBienesTemplate}
                >
                    <Column field='sicoin' header='Sicoin' />
                    <Column field='no_serie' header='No. Serie' />
                    <Column field='no_inventario' header='No. Inventario' />
                    <Column field='codigo' header='Codigo Modelo' />
                    <Column field='marca' header='Marca' />
                    <Column field='precio' header='Precio' body={row => quetzalesTemplate(row.precio)} />
                    <Column field='descripcion' header='Descripción' />
                    <Column header='Acciones' body={accionesTemplate}/>
                </DataTable>
            </div>
        </div>
    );
}

export default GestionBienes;
