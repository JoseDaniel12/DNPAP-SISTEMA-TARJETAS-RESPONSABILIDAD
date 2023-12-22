import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from "primereact/divider";
import { Dropdown } from 'primereact/dropdown';

import { departamentos } from "./mockData";

function GestionDepartamentos() {

    const busquedaDepartamento = (
        <div className="col-12 -ml-2">
            <label className='block mb-2'>Departamentos Registrados:</label>
            <span className="p-input-icon-left flex align-items-center">
                <i className="pi pi-search" />
                <InputText value={null} onChange={() =>{}} 
                    placeholder="Buscar por valor clave"
                />
            </span>
        </div>
    );

    const editarDepartamentoTemplate = (
        <Button
            icon='pi pi-pencil'
            severity="warning"
            onClick={() => {}}
        />
    );

    const eliminarDepartamentoTemplate = (
        <Button 
            icon='pi pi-times'
            severity="danger"
            onClick={() => {}}
        />
    );

    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-12 text-center'>
                <h1 className=' mb-0 text-black-alpha-80'>Gestion de Departamentos</h1>
            </div>

            <div className='col-12 flex flex-wrap'>
                <form className='col-12 md:w-auto md:mr-2' >
                    <h1 className='justify-self-end text-black-alpha-80 text-lg'>
                        Registrar Departamento
                    </h1>
                    <div className='field w-full'>
                        <label htmlFor='contrasenia' className='font-bold text-black-alpha-70 block'>Nombre:</label>
                        <InputText 
                            type='text' 
                            id='contrasenia'
                            name='contrasenia' 
                            placeholder='Nombre del departamento'
                            className='w-full p-2'
                            style={{display: 'block'}}
                        />
                    </div>
                    <Button 
                        type='button' 
                        icon='pi pi-plus'
                        label="Agregar"
                        severity="success"
                        onClick={() => {}}
                    />
                </form>

                <div className='col-12 md:col'>
                    <DataTable
                        value={departamentos}
                        paginator
                        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                        currentPageReportTemplate="Departamento {first} a {last} de  {totalRecords}"
                        rows={20}
                        scrollable
                        scrollHeight="220px"
                        showGridlines
                        stripedRows
                        header={busquedaDepartamento}
                    >
                        <Column field="nombre" header="Departamento"/>
                        <Column field="siglas" header="Siglas"/>
                        <Column header="Editar" body={editarDepartamentoTemplate}/>
                        <Column header="Eliminar" body={eliminarDepartamentoTemplate}/>
                    </DataTable>
                </div>
            </div>

        </div>
    );
}

export default GestionDepartamentos;
