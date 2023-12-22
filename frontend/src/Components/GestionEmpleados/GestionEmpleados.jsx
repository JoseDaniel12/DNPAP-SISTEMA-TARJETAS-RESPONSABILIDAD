import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { RadioButton } from "primereact/radiobutton";

import { empleados } from "./mockData";

function GestionEmpleados() {
    const [dpi, setDpi] = useState('');


    const busquedaEmpleado = (
        <div className="col-12 -ml-2">
            <label className='block mb-3'>Empleados Registrados:</label>
            <span className="p-input-icon-left flex align-items-center">
                <i className="pi pi-search" />
                <InputText value={null} onChange={() =>{}} 
                    placeholder="Buscar por valor clave"
                />
            </span>
        </div>
    );

    const editarEmpleadoTemplate = (
        <Button
            icon='pi pi-pencil'
            severity="warning"
            onClick={() => {}}
        />
    );

    const eliminarEmpleadoTemplate = (
        <Button 
            icon='pi pi-times'
            severity="danger"
            onClick={() => {}}
        />
    );


    return (
        <div className='grid col-11 md:col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <form className='col-12 md:col-5 flex flex-wrap align-content-start'>
                <div className="col-12 m-0 ">
                    <h1 className='justify-self-end text-black-alpha-80 text-lg'>
                        Registrar Empleado:
                    </h1>
                </div>

                <div className='col-12 md:col-4 field m-0'>
                    <label htmlFor='dpi' className='font-bold text-black-alpha-70 block'> DPI: </label>
                    <InputText 
                        type='text' 
                        id='dpi'
                        name='dpi'
                        placeholder='DPI'
                        value={dpi} 
                        onChange={e => setDpi(e.target.value)}
                        className='w-full p-2'
                        style={{display: 'block'}}
                    />
                </div>
                <div className='col-12 md:col-4 field m-0'>
                    <label className='font-bold text-black-alpha-70 block'> NIT: </label>
                    <InputText 
                        type='text' field m-0
                        id='nit'
                        name='nit'
                        placeholder='NIT'
                        value={''} 
                        onChange={() => {}}
                        className='w-full p-2'
                        style={{display: 'block'}}
                    />
                </div>
                <div className='col-12 md:col-4 field m-0'>
                    <label className='font-bold text-black-alpha-70 block'> Cargo: </label>
                    <InputText 
                        type='text' 
                        id='cargo'
                        name='cargo'
                        placeholder='Cargo'
                        value={''} 
                        onChange={() => {}}
                        className='w-full p-2'
                        style={{display: 'block'}}
                    />
                </div>

                <div className='col-12 md:col-6 field m-0'>
                    <label className='font-bold text-black-alpha-70 block'> Nombres: </label>
                    <InputText 
                        type='text' 
                        id='nombres'
                        name='nombres'
                        placeholder='Nombres'
                        value={''} 
                        onChange={() => {}}
                        className='w-full p-2'
                        style={{display: 'block'}}
                    />
                </div>

                <div className='col-12 md:col-6 field m-0 '>
                    <label className='font-bold text-black-alpha-70 block'>Apellidos: </label>
                    <InputText 
                        type='text' 
                        id='apellidos'
                        name='apellidos'
                        placeholder='Apellidos'
                        value={''} 
                        onChange={() => {}}
                        className='w-full p-2'
                        style={{display: 'block'}}
                    />
                </div>

                <div className='col-12 field m-0 '>
                    <label className='font-bold text-black-alpha-70 block'> Correo: </label>
                    <InputText 
                        type='text' 
                        id='correo'
                        name='correo'
                        placeholder='Correo Electrónico'
                        value={''} 
                        onChange={() => {}}
                        className='w-full p-2'
                        style={{display: 'block'}}
                    />
                </div>

                <div className='col-12 md:col-6 field m-0 '>
                    <label className='font-bold text-black-alpha-70 block'> Contraseña: </label>
                    <InputText 
                        type='password' 
                        id='contrasenia'
                        name='contrasenia'
                        placeholder='Contraseña'
                        value={''} 
                        onChange={() => {}}
                        className='w-full p-2'
                        style={{display: 'block'}}
                    />
                </div>

                <div className='col-12 md:col-6 field m-0 '>
                    <label className='font-bold text-black-alpha-70 block'>Contraseña: </label>
                    <InputText 
                        type='password' 
                        id='contrasenia2'
                        name='contrasenia2'
                        placeholder='Confirmar Contraseña'
                        value={''} 
                        onChange={() => {}}
                        className='w-full p-2'
                        style={{display: 'block'}}
                    />
                </div>

                
                <div className='col-12 field m-0'>
                    <label className='font-bold text-black-alpha-70 block'>Unidad de Servicio: </label>
                    <div className='flex flex-wrap gap-2 mb-2'>
                        <div className="flex align-items-center mr-2">
                            <RadioButton  inputId="ingredient1" name="pizza" value="Cheese"  onChange={() => {}} />
                            <label htmlFor="ingredient1" className="ml-2">Dirección</label>
                        </div>
                        <div className="flex align-items-center mr-2">
                            <RadioButton  inputId="ingredient1" name="pizza" value="Cheese"  onChange={() => {}} />
                            <label htmlFor="ingredient1" className="ml-2">Departamento</label>
                        </div>
                        <div className="flex align-items-center mr-2">
                            <RadioButton  inputId="ingredient1" name="pizza" value="Cheese"  onChange={() => {}} />
                            <label htmlFor="ingredient1" className="ml-2">Porgrama</label>
                        </div>
                    </div>
                    <Dropdown 
                        inputId="programa" 
                        options={[]}
                        optionLabel='nombre'
                        value={null}
                        placeholder='Seleccione un programa'
                        className="w-full"
                        onChange={() => {}}
                    />
                </div>


                <div className="col-12">
                    <Button
                        severity="info"
                        label="Crear"
                        icon="pi pi-plus"
                        iconPos="left"
                        onClick={() => {}}
                        className='w-full'
                    />
                </div>
            </form>

            <div className='col-12 md:col-7'>
                <DataTable
                    value={empleados}
                    paginator
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="Empleado {first} a {last} de  {totalRecords}"
                    rows={20}
                    scrollabel
                    scrollHeight="500px"
                    showGridlines
                    stripedRows
                    header={busquedaEmpleado}
                >
                    <Column field="dpi" header="DPI"/>
                    <Column field="nit" header="NIT"/>
                    <Column field="nombres" header="Nombres"/>
                    <Column field="apellidos" header="Apellidos"/>
                    <Column field="correo" header="Correo"/>
                    <Column field="correo" header="Correo"/>
                    <Column header="Editar" body={editarEmpleadoTemplate}/>
                    <Column header="Eliminar" body={eliminarEmpleadoTemplate}/>
                </DataTable>
            </div>
        </div>
    );
}

export default GestionEmpleados;
