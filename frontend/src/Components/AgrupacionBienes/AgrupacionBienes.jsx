import { useState } from 'react';
import { OrderList } from 'primereact/orderlist';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
        

function AgrupacionBienes() {
    const [bienes, setBienes] = useState([
        {
            id: 1,
            name: 'Bien 1',
        },
        {
            id: 2,
            name: 'Bien 2',
        }
    ]);

    const itemTemplate = (item) => {
        return (
            <div> {item.name} </div>
        );
    }


    return (
        <div className='grid col-11 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-6'>
                <OrderList
                    dataKey='id' header='Bienes Sin Agrupar' 
                    filter filterBy='name'
                    value={bienes} itemTemplate={itemTemplate} 
                    onChange={(e) => setBienes(e.value)}
                />
            </div>
            <div className='col-6'>
                <OrderList
                    dataKey='id' header='Grupo Por Crear' 
                    filter filterBy='name'
                    value={bienes} itemTemplate={itemTemplate} 
                    onChange={(e) => setBienes(e.value)}
                />
            </div>
            <div className='col-12'>
                <TreeTable value={[]} tableStyle={{ minWidth: '50rem' }}>
                    <Column field="name" header="Name" expander></Column>
                    <Column field="size" header="Size"></Column>
                    <Column field="type" header="Type"></Column>
                </TreeTable>
            </div>
        </div>
    );
}

export default AgrupacionBienes;
