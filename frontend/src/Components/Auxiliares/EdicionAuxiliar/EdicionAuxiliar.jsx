import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import  { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { InputSwitch } from "primereact/inputswitch";
import { confirmDialog } from 'primereact/confirmdialog';
        
import { useToast } from '../../../hooks/useToast';
import { userRoles } from '../../../types/userRoles';
import authRequests from '../../../Requests/authRequests';
import empleadoRequests from '../../../Requests/empleadoRequests';


function EdicionAuxiliar({ idAuxiliarSeleccionado, onCancelEdicion, onAuxiliarEditado }) {
    const toast = useToast('bottom-right');

    const auxiliarFormSchema = yup.object({
        acutalizarContrasenia: yup.boolean(),
        dpi: yup.string().required('DPI Requerido'),
        nombres: yup.string().required('Nombres requeridos'),
        apellidos: yup.string().required('Apellidos Requeridos'),
        correo: yup.string().email('Correo inválido').required('Correo requerido'),
        contrasenia: yup.string().when('acutalizarContrasenia', {
            is: true,
            then: () => yup.string().required('Contraseña requerida'),
            otherwise: () => yup.string()
        }),
        confirmContrasenia: yup.string().when(['acutalizarContrasenia', 'contrasenia'], {
            is: (acutalizarContrasenia, contrasenia) => acutalizarContrasenia && contrasenia,
            then: () => yup
            .string()
            .oneOf([yup.ref('contrasenia'), null], 'Las contraseñas no coinciden')
            .required('Confirmación requerida'),
            otherwise: () => yup.string()
        }),
    });

    const auxiliarForm = useForm({
        resolver: yupResolver(auxiliarFormSchema),
        mode: 'onSubmit'
    });

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = auxiliarForm;

    const acutalizarContrasenia = auxiliarForm.watch('acutalizarContrasenia');


    const validateDisponibilidadDPI = async (dpi) => {
        const response = await authRequests.verificarDisponibilidadDpi(dpi, userRoles.AUXILIAR);
        return response.data?.disponibilidad || false;
    }


    const validateDisponibilidadCorreo = async (correo) => {
        const response = await empleadoRequests.verificarDisponibilidadCorreo(correo);
        return response.data?.disponibilidad || false;
    };
    

    const editarAuxiliar = async () => {
        empleadoRequests.editarAuxiliar(idAuxiliarSeleccionado, auxiliarForm.getValues()).then(response => {
            if (response.error) {
                alert("error")
            } else {
                onAuxiliarEditado(response.data.auxiliar);
                toast.current.show({ severity: 'success', summary: 'Exito', detail: 'Auxiliar editado correctamente.' });
            }
        });
    };


    const handleEditarAuxiliarSubmit = async (formData) => {
        const disponibilidadDPI = await validateDisponibilidadDPI(formData.dpi);
        if (auxiliarForm.getFieldState('dpi').isDirty && !disponibilidadDPI) {
            setError('dpi', {
                message: 'El DPI ya está registrado',
                type: 'manual'
            });
        }

        const disponibilidadCorreo = await validateDisponibilidadCorreo(formData.correo);
        if (auxiliarForm.getFieldState('correo').isDirty && !disponibilidadCorreo) {
            setError('correo', {
                message: 'El correo ya está registrado',
                type: 'manual'
            });
        }

        if (Object.keys(auxiliarForm.formState.errors).length > 0) return;

        confirmDialog({
            header: 'Edición de Auxiliar',
            message: 'Está seguro que desea editar el auxiliar?',
            icon: 'pi pi-exclamation-triangle',
            accept: editarAuxiliar,
            reject: () => {}
        });
    };

    
    useEffect(() => {
        empleadoRequests.getEmpleado(idAuxiliarSeleccionado).then(response => {
            console.log(response)
            if (!response.error) {
                const auxiliar = response.data.empleado;
                auxiliarForm.reset({
                    dpi: auxiliar.dpi,
                    nombres: auxiliar.nombres,
                    apellidos: auxiliar.apellidos,
                    correo: auxiliar.correo
                });
            }
        });
    }, [idAuxiliarSeleccionado]);


    return (
        <div className='col-12 flex flex-wrap align-content-start'>

            <div className='col-12 m-0'>
                <h1 className='justify-self-end text-black-alpha-80 text-lg m-0'>
                    Editar Auxiliar:
                </h1>
            </div>

            <div className='col-12 field m-0'>
                <label className='font-bold text-black-alpha-70 block'> DPI: </label>
                <InputText 
                    type='text'
                    id='dpi'
                    name='dpi'
                    placeholder='DPI'
                    className='w-full p-2'
                    { ...register('dpi') }
                />
                { errors.dpi && <Message severity='error' text={errors.dpi?.message} className='mt-1 p-1'/> }
            </div>

            <div className='col-12 md:col-6 field m-0'>
                <label className='font-bold text-black-alpha-70 block'> Nombres: </label>
                <InputText 
                    type='text' 
                    id='nombres'
                    name='nombres'
                    placeholder='Nombres'
                    className='w-full p-2'
                    { ...register('nombres') }
                />
                { errors.nombres && <Message severity='error' text={errors.nombres?.message} className='mt-1 p-1'/> }
            </div>

            <div className='col-12 md:col-6 field m-0 '>
                <label className='font-bold text-black-alpha-70 block'>Apellidos: </label>
                <InputText 
                    type='text' 
                    id='apellidos'
                    name='apellidos'
                    placeholder='Apellidos'
                    className='w-full p-2'
                    { ...register('apellidos') }
                />
                { errors.apellidos && <Message severity='error' text={errors.apellidos?.message} className='mt-1 p-1'/> }
            </div>

            <div className='col-12 field m-0 '>
                <label className='font-bold text-black-alpha-70 block'> Correo: </label>
                <InputText 
                    type='text' 
                    id='correo'
                    name='correo'
                    placeholder='Correo Electrónico'
                    className='w-full p-2'
                    { ...register('correo') }
                />
                { errors.correo && <Message severity='error' text={errors.correo?.message} className='mt-1 p-1'/> }
            </div>

            <div className='col-12 field m-0 '>
                <label className='font-bold text-black-alpha-70 block'> Actualizar Contraseña: </label>
                <InputSwitch  checked={acutalizarContrasenia} onChange={e => auxiliarForm.setValue('acutalizarContrasenia', e.value)}/>
            </div>

            {
                acutalizarContrasenia && (
                    <>
                        <div className='col-12 md:col-6 field m-0 '>
                            <label className='font-bold text-black-alpha-70 block'> Contraseña: </label>
                            <InputText 
                                type='password' 
                                id='contrasenia'
                                name='contrasenia'
                                placeholder='Contraseña'
                                className='w-full p-2'
                                { ...register('contrasenia') }
                            />
                            { errors.contrasenia && <Message severity='error' text={errors.contrasenia?.message} className='mt-1 p-1'/> }
                        </div>

                        <div className='col-12 md:col-6 field m-0 '>
                            <label className='font-bold text-black-alpha-70 block'>Contraseña: </label>
                            <InputText 
                                type='password' 
                                id='confirmContrasenia'
                                name='confirmContrasenia'
                                placeholder='Confirmar Contraseña'
                                className='w-full p-2'
                                { ...register('confirmContrasenia') }
                            />
                            { errors.confirmContrasenia && <Message severity='error' text={errors.confirmContrasenia?.message} className='mt-1 p-1'/> }
                        </div>
                    </>
                )
            }

            <div className='col-6'>
                <Button
                    severity='info'
                    label='Volver'
                    icon='pi pi-arrow-left'
                    iconPos='left'
                    onClick={onCancelEdicion}
                    className='w-full'
                />
            </div>

            <div className='col-6'>
                <Button
                    severity='warning'
                    label='Editar'
                    icon='pi pi-pencil'
                    iconPos='left'
                    onClick={handleSubmit(handleEditarAuxiliarSubmit)}
                    className='w-full'
                />
            </div>
        </div>
    );
}

export default EdicionAuxiliar;