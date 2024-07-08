import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button'
import { DataTable } from "primereact/datatable";
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';

import { useToast } from '../../../hooks/useToast';
import useTableFilters from '../../../hooks/useTableFilters';
import { quetzalesTemplate } from '../../../Components/TableColumnTemplates';
import bienesRequests from '../../../Requests/bienesRequests';
import modelosRequests from '../../../Requests/modelosRequests';
        

function CargaBienesModelo() {
    const navgiate = useNavigate();
    const toast = useToast('bottom-right');
    const fileUploadRef = useRef(null);

    const { id_modelo } = useParams();
    const [modelo, setModelo] = useState({});
    const [bienesIncorrectos, setBienesIncorrectos] = useState([]);

    // ______________________________  Filtros ______________________________
    const filtrosBienes = useTableFilters({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        numeroFila: { value: null, matchMode: FilterMatchMode.EQUALS },
        sicoin: { value: null, matchMode: FilterMatchMode.CONTAINS },
        no_serie: { value: null, matchMode: FilterMatchMode.CONTAINS },
        no_inventario: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    // ______________________________________________________________________

    const chooseOptions = { icon: 'pi pi-fw pi-file-excel', className: 'custom-choose-btn p-button-rounded p-button-outlined' };
    const uploadOptions = { icon: 'pi pi-fw pi-cloud-upload', className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined' };
    const cancelOptions = { icon: 'pi pi-fw pi-times', className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined' };

    const fileSelectHandler = () => {
        setBienesIncorrectos([]);
    };

    const UploadHandler = (e) => {
        const file = e.files[0];
        const formData = new FormData();
        formData.append('bienes', file);

        modelosRequests.cargarBinesModeloMasivamente(id_modelo, formData).then(response => {
            if (!response.error) {
                const data = response.data;
                if (data.bienesIncorrectos.length > 0) {
                    setBienesIncorrectos(data.bienesIncorrectos);
                    toast.current.show({severity: 'warn', summary: 'Carga de Bienes', detail: `Bienes cargados: ${data.bienesCorrectos.length}/${data.bienesIncorrectos.length + data.bienesCorrectos.length}`, life: 3000});
                } else {
                    toast.current.show({severity: 'success', summary: 'Carga de Bienes', detail: `Se cargaron ${data.bienesCorrectos.length} bienes.`, life: 3000});
                }
                fileUploadRef.current.clear();
            } else {
                toast.current.show({severity: 'error', summary: 'Error al cargar Bienes', detail: response.error, life: 3000});
            }
        });
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


    useEffect(() => {
        filtrosBienes.initFilters();
        modelosRequests.getModelo(id_modelo).then(response => {
            const modelo = response.data;
            setModelo(modelo);
        });
    }, []);


    const headerTemplate = (options) => {
        const { className, chooseButton, uploadButton, cancelButton } = options;

        return (
            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                <Button
                    tooltip='Descargar Ejemplo de Archivo de Carga'
                    tooltipOptions={{ position: 'right' }}
                    icon='pi pi-file-excel'
                    className='p-button-outlined p-button-rounded'
                    style={{ width: '50px'}}
                    onClick={handleDescargarEjmploArchivoCarga}
                />
                {chooseButton}
                {uploadButton}
                {cancelButton}
            </div>
        );
    };


    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column" >
                <i className="pi pi-file mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
                <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
                    Arrastre o Seleccione un Archivo .xls
                </span>
            </div>
        );
    };


    const bienesIncorrectosHeaderTemplate = () => {
        return (
            <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
                Bienes Incorrectos
            </span>
        );
    };


    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-12 relative'>
                <div className='mb-3 md:absolute md:max-w-max'>
                    <Button
                        label='Regresar'
                        severity='warning'
                        icon='pi pi-arrow-left'
                        className='p-button-outlined'
                        onClick={() => navgiate(-1)}
                    />
                </div>
                <div className='text-center'>
                    <h1 className='text-black-alpha-70 m-0 mb-2'>Carga Masiva de Bienes a Modelo</h1>
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


            <div className='col-12 md:col-6'>
                <FileUpload
                    ref={fileUploadRef}
                    accept='.xls,.xlsx'
                    multiple={false}
                    name="bienes"
                    customUpload={true}
                    onSelect={fileSelectHandler}
                    uploadHandler={UploadHandler}
                    maxFileSize={1000000}
                    emptyTemplate={emptyTemplate}
                    headerTemplate={headerTemplate}
                    chooseOptions={chooseOptions}
                    uploadOptions={uploadOptions}
                    cancelOptions={cancelOptions}
                />
            </div>

            <div className='col-12 md:col-6'>
                <DataTable 
                    value={bienesIncorrectos}
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
                    header={bienesIncorrectosHeaderTemplate}
                >
                    <Column field='numeroFila' header='No. Fila' dataType='numeric' filter filterPlaceholder='Buscar por No. fila'/>
                    <Column field='sicoin' header='Sicoin'  filter filterPlaceholder='Buscar por sicoin'/>
                    <Column field='no_serie' header='No. Serie' filter filterPlaceholder='Buscar por No. serie' />
                    <Column field='no_inventario' header='No. Inventario'  filter filterPlaceholder='Buscar por No. inventario'/>
                </DataTable>
            </div>
        </div>
    );
}

export default CargaBienesModelo;