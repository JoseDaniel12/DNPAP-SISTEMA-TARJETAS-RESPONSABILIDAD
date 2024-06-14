import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button'
import { DataTable } from "primereact/datatable";
import { Column } from 'primereact/column';

import { useToast } from '../../../hooks/useToast';
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


    useEffect(() => {
        modelosRequests.getModelo(id_modelo).then(response => {
            const modelo = response.data;
            setModelo(modelo);
        });
    }, []);


    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column" >
                <i className="pi pi-file mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
                <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
                    Arrastre o Seleccione un archiov .xls
                </span>
            </div>
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


            <div className='col-12 md:col-5'>
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
                />
            </div>

            <div className='col-12 md:col-7'>
                <DataTable 
                    value={bienesIncorrectos}
                    // filters={filtrosBienes.filters}
                    paginator
                    paginatorPosition='top'
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Bien {first} a {last} de  {totalRecords}'
                    rows={20}
                    scrollable
                    scrollHeight='400px'
                    showGridlines
                    stripedRows
                    // header={tableHeaderTemplate}
                >
                    <Column field='numeroFila' header='No. Fila'  filter filterPlaceholder='Buscar por No. fila'/>
                    <Column field='sicoin' header='Sicoin'  filter filterPlaceholder='Buscar por sicoin'/>
                    <Column field='no_serie' header='No. Serie' filter filterPlaceholder='Buscar por No. serie' />
                    <Column field='no_inventario' header='No. Inventario'  filter filterPlaceholder='Buscar por No. inventario'/>
                </DataTable>
            </div>
        </div>
    );
}

export default CargaBienesModelo
