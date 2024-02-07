import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import  { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { confirmDialog } from 'primereact/confirmdialog';
        
import { useToast } from '../../../hooks/useToast';
import unidadesServicioRequests from '../../../Requests/unidadesServicioRequests';


function EdicionDepartamento({ idDepartamentoSeleccionado, onCancelEdicion, onDepartamentoEditado }) {
    const toast = useToast('bottom-right');

    const departamentoFormSchema = yup.object({
        nombre: yup.string().required('Nombre Requerido'),
        siglas: yup.string().required('Siglas requeridas'),
    });

    const departamentoForm = useForm({
        resolver: yupResolver(departamentoFormSchema),
        mode: 'onSubmit'
    });

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = departamentoForm;


    const validateDisponibilidadNombre = async (nombre) => {
        const response = await unidadesServicioRequests.verificarDisponibilidadNombre(nombre);
        return response.data?.disponibilidad || false;
    }


    const validateDisponibilidadSiglas = async (siglas) => {
        const response = await unidadesServicioRequests.verificarDisponibilidadSiglas(siglas);
        return response.data?.disponibilidad || false;
    };
    

    const editarDepartamento = async () => {
        const formData = departamentoForm.getValues();
        unidadesServicioRequests.editarDepartamento(idDepartamentoSeleccionado, formData).then(response => {
            if (response.error) {
                alert("error")
            } else {
                onDepartamentoEditado(response.data.departamento);
                toast.current.show({ severity: 'success', summary: 'Exito', detail: 'Departamento editado correctamente.' });
            }
        });
    };


    const handleEditarDepartamentoSubmit = async (formData) => {
        const disponibilidadNombre = await validateDisponibilidadNombre(formData.nombre);
        if (departamentoForm.getFieldState('nombre').isDirty && !disponibilidadNombre) {
            setError('nombre', {
                message: 'El DPI ya está registrado',
                type: 'manual'
            });
        }

        const disponibilidadSiglas = await validateDisponibilidadSiglas(formData.siglas);
        if (departamentoForm.getFieldState('siglas').isDirty && !disponibilidadSiglas) {
            setError('siglas', {
                message: 'El correo ya está registrado',
                type: 'manual'
            });
        }

        if (Object.keys(departamentoForm.formState.errors).length > 0) return;

        confirmDialog({
            header: 'Edición de Departamento',
            message: '¿Está seguro que desea editar el departamento?',
            icon: 'pi pi-exclamation-triangle',
            accept: editarDepartamento,
            reject: () => {}
        });
    };

    
    useEffect(() => {
        unidadesServicioRequests.getUnidadServicio(idDepartamentoSeleccionado).then(response => {
            if (!response.error) {
                const unidadServicio = response.data.unidadServicio;
                departamentoForm.reset({
                    nombre: unidadServicio.nombre_nuclear,
                    siglas: unidadServicio.siglas,
                });
            }
        });
    }, [idDepartamentoSeleccionado]);


    return (
        <div className='col-12 flex flex-wrap align-content-start'>

            <div className='col-12 m-0'>
                <h1 className='justify-self-end text-black-alpha-80 text-lg m-0'>
                    Editar Departamento:
                </h1>
            </div>

            <div className='col-12 field m-0'>
                <label className='font-bold text-black-alpha-70 block'> Nombre: </label>
                <InputText 
                    type='text'
                    id='nombre'
                    name='nombre'
                    placeholder='Nombre'
                    className='w-full p-2'
                    { ...register('nombre') }
                />
                { errors.nombre && <Message severity='error' text={errors.nombre?.message} className='mt-1 p-1'/> }
            </div>

            <div className='col-12 field m-0'>
                <label className='font-bold text-black-alpha-70 block'> Siglas: </label>
                <InputText 
                    type='text' 
                    id='siglas'
                    name='siglas'
                    placeholder='Siglas'
                    className='w-full p-2'
                    { ...register('siglas') }
                />
                { errors.siglas && <Message severity='error' text={errors.siglas?.message} className='mt-1 p-1'/> }
            </div>


            <div className='col-12 md:col-6'>
                <Button
                    severity='info'
                    label='Volver'
                    icon='pi pi-arrow-left'
                    iconPos='left'
                    onClick={onCancelEdicion}
                    className='w-full'
                />
            </div>

            <div className='col-12 md:col-6'>
                <Button
                    severity='warning'
                    label='Editar'
                    icon='pi pi-pencil'
                    iconPos='left'
                    onClick={handleSubmit(handleEditarDepartamentoSubmit)}
                    className='w-full'
                />
            </div>
        </div>
    );
}

export default EdicionDepartamento;