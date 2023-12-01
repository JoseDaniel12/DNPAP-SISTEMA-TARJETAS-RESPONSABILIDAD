import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';

import { Divider } from 'primereact/divider';
        
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

function RegistroBien() {
    return (
        <form className='grid col-11 md:col-8 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <h1 className='col-12 flex justify-content-center mb-0 text-black-alpha-80'>Registro de Bienes</h1>

            <Divider className='mb-0'/>
            <h2 className='col-12 mb-0 text-black-alpha-80'>Datos en Comun:</h2>

            <div className='field col-12 md:col-6 mb-0'>
                <label htmlFor="program" className='font-bold block'>Programa: </label>
                <Dropdown inputId="program"/>
            </div>
            <div className='field col-12 md:col-6 mb-0'>
                <label htmlFor="precio" className='font-bold block'>Precio: </label>
                <InputNumber inputId="precio"  minFractionDigits={2} maxFractionDigits={5} />
            </div>
            <div className='field col-12 mb-0'>
                <label htmlFor="descripcion" className='font-bold block'>Descripción: </label>
                <InputTextarea  rows={4} className='f-wull' style={{resize: 'none'}}/>
            </div>

            <Divider className='mb-0'/>
            <h2 className='col-12 mb-0 text-black-alpha-80'>Datos Especificos:</h2>

            <div className='col-12 md:col-4'>
                <div className='field col-12 mb-0'>
                    <label htmlFor="program" className='font-bold block'>SICOIN: </label>
                    <InputNumber inputId="sicoin"/>
                </div>
                <div className='field col-12 mb-0'>
                    <label htmlFor="program" className='font-bold block'>No serie: </label>
                    <InputNumber inputId="sicoin"/>
                </div>
                <div className='field col-12 mb-0'>
                    <label htmlFor="program" className='font-bold block'>No Inventario: </label>
                    <InputNumber inputId="sicoin"/>
                </div>
                <div className='col-12'>
                    <Button severity="success" label="Agregar Bien" icon="pi pi-plus" iconPos="left" className='w-full' />
                </div>

            </div>

            <div className='col-12 md:col-8'>
                <DataTable value={[]} 
                    header={
                        <div className='flex justify-content-end'>
                            <Button severity="warning" icon="pi pi-upload" label="Carga Masiva (CSV)" className='col-12 md:w-auto'/>
                        </div>
                    }

                >
                    <Column field="code" header="No."></Column>
                    <Column field="code" header="No. Serie" filter filterPlaceholder="No. Serie"></Column>
                    <Column field="name" header="SICOIN" filter filterPlaceholder="SICOIN"></Column>
                    <Column field="category" header="No. Inventario" filter filterPlaceholder="No. Inventario"></Column>
                    <Column field="quantity" header="Acciones"></Column>
                </DataTable>
            </div>
            <Button label="Guardar Bienes" icon="pi pi-save" iconPos="left" className='sm:col-12 md:col-4 ml-auto mt-2' />
        </form>
    );
}

export default RegistroBien;
