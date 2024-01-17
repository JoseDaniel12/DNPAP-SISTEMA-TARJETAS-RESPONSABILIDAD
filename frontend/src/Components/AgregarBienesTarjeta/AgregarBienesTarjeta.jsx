import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { Toast } from 'primereact/toast';
import bienesRequests from '../../Requests/bienesRequests';
import tarjetasRequests from '../../Requests/tarjetasReuests';
import empleadoRequests from '../../Requests/empleadoRequests';


function AgregarBienesTarjeta() {
    const toast = useRef(null);
    const { id_empleado } = useParams();
    const navigate = useNavigate();
    const [bienesSinAsignar, setBienesSinAsignar] = useState([]);
    const [bienesPorAsignar, setBienesPorAsignar] = useState([]);

    // Filtros de la tabla de empleados
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState(null);
    const [filtrosAplicados, setFiltrosAplicados] = useState(false);

    const [cantTarjetasNesecarias, setCantTarjetasNecesarias] = useState(0);
    const [numeroTarjeta, setNumeroTarjeta] = useState('');
    const [numerosTarjetas, setNumerosTarjetas] = useState([]);


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

    const handleAgregarTarjeta = () => {
        if (numeroTarjeta === '') return;
        setNumerosTarjetas(prevNumeros => [...prevNumeros, numeroTarjeta]);
        setNumeroTarjeta('');
    }

    const handleEliminarTarjeta = (numero) => {
        setNumerosTarjetas(prevNumeros => prevNumeros.filter(n => n !== numero));
    }

    const handleAgregarBienes = async () => {
        if (!bienesPorAsignar.length) return;
        if (numerosTarjetas.length !== cantTarjetasNesecarias) {
            const error = 'Debes ingresar la cantidad de tarjetas indicada.'
            return toast.current.show({severity:'error', summary: 'Error', detail: error, life: 2500});
        }
        
        const idsBienes = bienesPorAsignar.map(b => b.id_bien);
        const response = await empleadoRequests.asignarBienes({id_empleado, idsBienes, numerosTarjetas});
        if (response.error) {
            toast.current.show({severity:'error', summary: 'Error', detail: response.error, life: 3000});
        } else  {
            setBienesPorAsignar([]);
            const milisegundos = 2500;
            toast.current.show({severity:'success', summary: 'Éxito', detail: response.message, life: milisegundos});
            setTimeout(() => navigate(-1), milisegundos);
        }
    }


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

    const preciosTemplate = (precio) => {
        return (
            <span>{formatoMonedaGTQ.format(precio)}</span>
        );
    };


    useEffect(() => {
        const idsBienes = bienesPorAsignar.map(b => b.id_bien);
        tarjetasRequests
        .getNumeroTarjetasNecesarias({id_empleado, idsBienes, operacion: 'ASIGNAR'})
        .then(res => {
           setCantTarjetasNecesarias(res.data);
        });
    }, [bienesPorAsignar]);


    useEffect(() => {
        bienesRequests.getBienesSinAsignar().then(res => setBienesSinAsignar(res.data.bienesSinAsignar));
    }, []);


    return (
        <div className='grid col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <Toast ref={toast}  position="bottom-right"/>
            <div className='col-12 text-center'>
                <h1 className=' -mb-4 text-black-alpha-70'>Agregar Bienes de un Mismo Tipo</h1>
                <h1 className='text-black-alpha-70'>a la Tarjeta No. 10733</h1>
            </div>

            <div className='col-12'>
                <DataTable
                    value={bienesSinAsignar}
                    rows={10}
                    paginator
                    scrollable
                    scrollHeight="280px"
                    showGridlines
                    stripedRows 
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="Bien {first} a {last} de  {totalRecords}"
                    className='mb-2'
                    header = {
                        <div>
                            <div className='col-12 pb-0'>
                                <p>Bienes sin vincular:</p>
                            </div>
                            <div className="col-12  flex justify-content-end">
                                <span className="p-input-icon-left flex align-items-center">
                                    <i className="pi pi-search" />
                                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} 
                                        placeholder="Buscar por valor clave"
                                    />
                                </span>
                            </div>
                        </div>
                    }
                >
                    <Column field="sicoin" header="SICOIN"/>
                    <Column field="no_serie" header="No. Serie"/>
                    <Column field="no_inventario" header="Inventario"/>
                    <Column field="descripcion" header="Descripcion"/>
                    <Column field="precio" header="Precio" body={bien => preciosTemplate(bien.precio)}/>
                    <Column 
                        header="Agregar"
                        body = {
                            bien =>  (
                                <Button 
                                    type='button' 
                                    icon='pi pi-plus'
                                    className='p-button-success p-button-outlined w-auto'
                                    label="Agregar"
                                    onClick={() => handleAgregarBien(bien.id_bien)}
                                />
                            )
                        }
                    />
                </DataTable>

                <DataTable
                    value={bienesPorAsignar}
                    rows={10}
                    paginator
                    scrollable
                    scrollHeight="280px"
                    showGridlines
                    stripedRows 
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="Bien {first} a {last} de  {totalRecords}"
                    header = {
                        <div>
                            <div className='col-12 pb-0'>
                                <p>Bienes Por Agregar:</p>
                            </div>
                            <div className="col-12  flex justify-content-end">
                                <span className="p-input-icon-left flex align-items-center">
                                    <i className="pi pi-search" />
                                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} 
                                        placeholder="Buscar por valor clave"
                                    />
                                </span>
                            </div>
                        </div>
                    }
                >
                    <Column field="sicoin" header="SICOIN"/>
                    <Column field="no_serie" header="No. Serie"/>
                    <Column field="no_inventario" header="Inventario"/>
                    <Column field="descripcion" header="Descripcion"/>
                    <Column field="precio" header="Precio" body={bien => preciosTemplate(bien.precio)}/>
                    <Column 
                        header="Eliminar"
                        body = {
                            bien =>  (
                                <Button 
                                    type='button' 
                                    icon='pi pi-times'
                                    className='p-button-danger p-button-outlined w-auto'
                                    label="Eliminar"
                                    onClick={() => handleEliminarBien(bien.id_bien)}
                                />
                            )
                        }
                    />
                </DataTable>
            </div>

            <div className='col-12'>
                <p>Se requieren <b>{cantTarjetasNesecarias}</b> tarjetas nuevas: </p>
                <div className='field col max-w-max p-0'>
                    <label className='font-bold text-black-alpha-80 block'>Agregar Tarjeta:</label>
                    <div className='flex flex-wrap gap-1'>
                        <div className='col p-0'>
                            <InputText 
                                id='search' type='text' placeholder='No. Tarjeta'
                                value={numeroTarjeta}
                                onChange={(e) => setNumeroTarjeta(e.target.value)}
                            />
                        </div>
                        <div className='col-12 lg:max-w-max p-0'>
                            <Button 
                                severity='success' label='Agregar' icon='pi pi-plus'
                                onClick={handleAgregarTarjeta}
                            />
                        </div>
                    </div>
                </div>
                <div className="card flex flex-wrap gap-2 mb-4">
                    {
                        numerosTarjetas.map((numero, index) => (
                            <Chip
                                key={numero}
                                label={numero} className="p-mr-2 p-mb-2" removable
                                onRemove={() => handleEliminarTarjeta(numero)}
                            />
                        ))
                    }
                </div>
                <div className='flex flex-wrap justify-content-between'>
                    <div className='col-12 md:col-6'>
                        <Button 
                            severity='warning' label='Regresar' icon='pi pi-arrow-left'
                            onClick={() => navigate(-1)}
                        />
                    </div>

                    <div className='col-12 md:col-6'>
                        <Button
                            severity='info' label='Agregar Bienes' icon='pi pi-plus'
                            onClick={handleAgregarBienes}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AgregarBienesTarjeta;
