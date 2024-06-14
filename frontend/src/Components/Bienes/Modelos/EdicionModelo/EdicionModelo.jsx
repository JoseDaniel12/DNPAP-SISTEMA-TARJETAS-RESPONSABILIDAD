import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import  { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup'; 
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';

import { useToast } from '../../../../hooks/useToast';
import modelosRequests from '../../../../Requests/modelosRequests';


function EdicionModelo() {
    const navigate = useNavigate();
    const toast = useToast('bottom-right');
    const { id_modelo } = useParams();

    const modeloSchema = yup.object({
        descripcion: yup.string().required('Descripción requerida'),
        precio: yup.number().required('Precio requerido'),
        marca: yup.string(),
        codigo: yup.string()
    });

    const formModelo = useForm({
        defaultValues: {
            descripcion: '',
            precio: null,
            marca: '',
            codigo: ''
        },
        resolver: yupResolver(modeloSchema),
        mode: 'onSubmit'
    });

    const { 
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = formModelo;


    // Funcion para evitar que se haga un salto de linea al presionar enter en la descripción
    const handleKeyDowDescripcion = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
        }
    }


    const editarModelo = async () => {
        const datosModelo = formModelo.getValues();
        modelosRequests.editarModelo(id_modelo, datosModelo).then(response => {
            if (!response.error) {
                formModelo.reset(datosModelo);
                toast.current.show({severity: 'success', summary: 'Edición de Modelo de Bien', detail: 'Edición exitosa.', life: 3000});
            } else {
                toast.current.show({severity: 'error', summary: 'Edición de Modelo de Bien', detail: response.error, life: 3000});
            }
        });
    };



    const handleEditarModelo = async (data) => {
        confirmDialog({
            header: 'Edición de Modelo de Bien',
            message: '¿Está seguro que desea editar el modelo?',
            icon: 'pi pi-exclamation-triangle',
            accept: editarModelo
        });
    };


    useEffect(() => {
        modelosRequests.getModelo(id_modelo).then(response => {
            const modelo = response.data;
            formModelo.reset({
                descripcion: modelo.descripcion,
                precio: modelo.precio,
                marca: modelo.marca,
                codigo: modelo.codigo
            });
        });
    }, []);


    return (
        <div className='grid col-11 md:col-9 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4 md:row-gap-3'>
            <ConfirmDialog />

            <div className='col-12 text-center'>
                <h1 className='text-black-alpha-70 m-0 mb-2'>Registro de Modelo</h1>
            </div>

            <div className='field col-12 mb-0'>
                <label htmlFor='descripcion' className='font-bold block'>Descripción: </label>
                <InputTextarea
                    id='descripcion'
                    name='descripcion'
                    placeholder='Caracteristicas y Especificaciones. No incluir el precio, marca y modelo.'  
                    rows={4}
                    className='f-wull' 
                    style={{resize: 'none'}}
                    onKeyDown={handleKeyDowDescripcion}
                    { ...register('descripcion') }
                    onChange={e => formModelo.setValue('descripcion', e.target.value.replace(/[\r\n]+/gm, ''))}
                />
                { errors.descripcion && <Message severity='error' text={errors.descripcion?.message} className='mt-1 p-1'/> }
            </div>

            <div className='field col-12 md:col-4 mb-0'>
                <label htmlFor='precio' className='font-bold block'>Precio: </label>
                <InputNumber 
                    inputId='precio'
                    name='precio'
                    placeholder='Q 0.00'
                    minFractionDigits={2}
                    maxFractionDigits={2}
                    mode='currency' currency='GTQ' locale='es-GT'
                    min={0}
                    className='w-full'
                    { ...register('precio') }
                    value={formModelo.watch('precio')}
                    onChange={e => formModelo.setValue('precio', e.value)}
                />
                { errors.precio && <Message severity='error' text={errors.precio?.message} className='mt-1 p-1'/> }
            </div>

            <div className='field col-12 md:col-4 mb-0'>
                <label htmlFor='precio' className='font-bold block'>Marca: </label>
                <InputText 
                    id='marca'
                    placeholder='Sin marca'
                    { ...register('marca') }
                />
                { errors.marca && <Message severity='error' text={errors.marca?.message} className='mt-1 p-1'/> }
            </div>

            <div className='field col-12 md:col-4 mb-0'>
                <label htmlFor='precio' className='font-bold block'>Codigo de Modelo: </label>
                <InputText 
                    id='codigo'
                    placeholder='Sin modelo'
                    { ...register('codigo') }
                />
                { errors.codigo && <Message severity='error' text={errors.codigo?.message} className='mt-1 p-1'/> }
            </div>

            <div className='col-12 flex flex-wrap justify-content-between gap-2 md:mt-4'>
                <div className='col-12 md:col p-0'>
                    <Button 
                        severity='warning' label='Regresar' icon='pi pi-arrow-left'
                        onClick={() => navigate(-1)}
                    />
                </div>
                <div className='col-12 md:col p-0'>
                    <Button
                        severity='info' label='Editar Modelo' icon='pi pi-pencil'
                        className='w-full'
                        onClick={handleSubmit(handleEditarModelo)}
                    />
                </div>
            </div>
        </div>
    );
}

export default EdicionModelo;
