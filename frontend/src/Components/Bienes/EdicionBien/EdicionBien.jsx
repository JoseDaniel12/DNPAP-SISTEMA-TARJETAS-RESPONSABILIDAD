import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import  { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Message } from 'primereact/message';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';

import { useToast } from '../../../hooks/useToast';

import bienesRequests from '../../../Requests/bienesRequests';

function EdicionBien() {
    const toast = useToast('bottom-right');
    const navigate = useNavigate();
    const { id_bien } = useParams();

    const bienFormSchema = yup.object({
        descripcion: yup.string().required('Descripción requerida'),
        precio: yup.number().required('Precio requerido'),
        marca: yup.string(),
        codigoModelo: yup.string(),
        sicoin: yup.string(),
        noSerie: yup.string(),
        noInventario: yup.string(),
        id_modelo: yup.number()
    });

    const bienForm = useForm({
        resolver: yupResolver(bienFormSchema),
        mode: 'onSubmit'
    });

    const { register, handleSubmit, formState: { errors } } = bienForm;

    // Funcion para evitar que se haga un salto de linea al presionar enter en la descripción
    const handleKeyDowDescripcion = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
        }
    }


    const editarBien = async () => {
        bienesRequests.editarBien(id_bien, bienForm.getValues()).then(response => {
            if (!response.error) {
                bienForm.reset(bienForm.getValues());
                toast.current.show({severity: 'success', summary: 'Edición de Bien', detail: 'Bien editado exitosamente.', life: 3000});
            } else {
                toast.current.show({severity: 'error', summary: 'Edición de Bien', detail: 'Error al editar el Bien.', life: 3000});
            }
        });
    };


    const hadleEditarBien = async () => {
        const formData = bienForm.getValues();
        if (bienForm.getFieldState('sicoin').isDirty) {
            const sicoinDisponible = (await bienesRequests.validarDisponibilidadSicoin(formData.sicoin)).data;
            if (!sicoinDisponible) bienForm.setError('sicoin', { 
                type: 'manual', 
                message: 'Sicoin ya registrado.'
            });
        }

        if (bienForm.getFieldState('noSerie').isDirty) {
            const noSerieDisponible = (await bienesRequests.validarDisponibilidadNoSerie(formData.noSerie)).data;
            if (!noSerieDisponible) bienForm.setError('noSerie', {
                type: 'manual',
                message: 'No. Serie ya registrado.'
            });
        }

        if (Object.keys(bienForm.formState.errors).length > 0) return;


        confirmDialog({
            header: 'Edición de Bien',
            message: '¿Está seguro que desea editar el Bien?',
            icon: 'pi pi-exclamation-triangle',
            accept: editarBien
        });
    };


    useEffect(() => {
        bienesRequests.getBien(id_bien).then(response => {
            const bien = response.data;
            bienForm.reset({
                descripcion: bien.descripcion,
                precio: bien.precio,
                marca: bien.marca,
                codigoModelo: bien.codigo,
                sicoin: bien.sicoin,
                noSerie: bien.no_serie,
                noInventario: bien.no_inventario,
                id_modelo: bien.id_modelo
            })
        });
    }, []);


    return (
        <div className='grid col-11 md:col-8 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <ConfirmDialog />

            <div className='col-12 text-center'>
                <h1 className='text-black-alpha-70 m-0'>Edición Bien</h1>
            </div>

            <Divider className='mb-0'/>
            <h2 className='col-12 mb-0 text-black-alpha-80'>Datos del Modelo:</h2>

            <div className='col-12 field m-0'>
                <label htmlFor='descripcion' className='font-bold block'>Descripción: </label>
                <InputTextarea
                    id='descripcion'
                    name='descripcion'
                    placeholder='Caracteristicas y Especificaciones. Incluir precio, marca y modelo.'  
                    rows={4}
                    className='f-wull' 
                    style={{resize: 'none'}}
                    onKeyDown={handleKeyDowDescripcion}
                    { ...register('descripcion') }
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
                    maxFractionDigits={5}
                    mode='currency' currency='GTQ' locale='es-GT'
                    min={0}
                    value={bienForm.watch('precio')}
                    { ...register('precio') }
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
                <label htmlFor='codigoModelo' className='font-bold block'>Codigo de Modelo: </label>
                <InputText 
                    id='codigoModelo'
                    placeholder='Sin modelo'
                    { ...register('codigoModelo') }
                />
                { errors.modelo && <Message severity='error' text={errors.modelo?.message} className='mt-1 p-1'/> }
            </div>

            <Divider className='mb-0'/>
            <h2 className='col-12 mb-0 text-black-alpha-80'>Datos Especificos:</h2>


            <div className='field col-12 md:col-4 mb-0'>
                <label htmlFor='precio' className='font-bold block'>Sicoin: </label>
                <InputText 
                    id='sicoin'
                    placeholder='Sin Sicoin'
                    { ...register('sicoin') }
                />
                { errors.sicoin && <Message severity='error' text={errors.sicoin?.message} className='mt-1 p-1'/> }
            </div>

            <div className='field col-12 md:col-4 mb-0'>
                <label htmlFor='precio' className='font-bold block'>No. Serie: </label>
                <InputText 
                    id='noSerie'
                    placeholder='Sin No. Serie'
                    { ...register('noSerie') }
                />
                { errors.noSerie && <Message severity='error' text={errors.noSerie?.message} className='mt-1 p-1'/> }
            </div>

            <div className='field col-12 md:col-4 mb-0'>
                <label htmlFor='precio' className='font-bold block'>No. Inventario: </label>
                <InputText 
                    id='noInventario'
                    placeholder='Sin No. Inventario'
                    { ...register('noInventario') }
                />
                { errors.noInventario && <Message severity='error' text={errors.noInventario?.message} className='mt-1 p-1'/> }
            </div>

            <div className='col-12 flex flex-wrap justify-content-between gap-2 mt-3'>
                <div className='col-12 md:col p-0'>
                    <Button 
                        severity='warning' label='Regresar' icon='pi pi-arrow-left'
                        onClick={() => navigate(-1)}
                    />
                </div>
                <div className='col-12 md:col p-0'>
                    <Button
                        severity='info' label='Editar Bien' icon='pi pi-pencil'
                        className='w-full'
                        onClick={handleSubmit(hadleEditarBien)}
                    />
                </div>
            </div>
        </div>
    );
}

export default EdicionBien;
