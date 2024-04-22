import { useForm } from 'react-hook-form';
import  { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

import { useAuth } from '../../../Auth/Auth';
import { userRoles } from '../../../types/userRoles';
import empleadoRequests from '../../../Requests/empleadoRequests';



function RegistroAuxiliar({ onAuxiliarRegistrado }) {
    const { loginData } = useAuth();

    const auxiliarFormSchema = yup.object({
        dpi: yup.string().required('DPI requerido'),
        nombres: yup.string().required('Nombres requeridos'),
        apellidos: yup.string().required('Apellidos requeridos'),
        correo: yup.string().email('Correo inválido').required('Correo requerido'),
        contrasenia: yup.string().required('Contraseña requerida'),
        confirmContrasenia: yup.string().required('Confirmación requerida'),
        idDireccion: yup.number()
    });

    const auxiliarForm = useForm({
        defaultValues: {
            dpi: '',
            nombres: '',
            apellidos: '',
            correo: '',
            contrasenia: '',
            confirmContrasenia: '',
            idDireccion: loginData.usuario.idDireccion
        },
        resolver: yupResolver(auxiliarFormSchema),
        mode: 'onSubmit'
    });

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = auxiliarForm;


    const validateDisponibilidadDPI = async (dpi) => {
        const response = await empleadoRequests.verificarDisponibilidadDpi(dpi, userRoles.AUXILIAR);
        return response.data?.disponibilidad || false;
    }

    const validateDisponibilidadCorreo = async (correo) => {
        const response = await empleadoRequests.verificarDisponibilidadCorreo(correo);
        return response.data?.disponibilidad || false;
    };


    const validateConfirmacionContrasenia = (contrasenia, confirmContrasenia) => {
        return contrasenia === confirmContrasenia;
    };
    

    const handleRegistrarAuxiliar = async (datosAuxiliar) => {
        let errores = false;

        const disponibilidadDPI = await validateDisponibilidadDPI(datosAuxiliar.dpi);
        if (!disponibilidadDPI) {
            setError('dpi', {
                message: 'El DPI ya está registrado',
                type: 'manual'
            });
            errores = true;
        }

        const disponibilidadCorreo = await validateDisponibilidadCorreo(datosAuxiliar.correo);
        if (!disponibilidadCorreo) {
            setError('correo', {
                message: 'El correo ya está registrado',
                type: 'manual'
            });
            errores = true;
        }

        const confirmacionContrasenia = validateConfirmacionContrasenia(datosAuxiliar.contrasenia, datosAuxiliar.confirmContrasenia);
        if (!confirmacionContrasenia) {
             setError('confirmContrasenia', {
                message: 'Las contraseñas no coinciden',
                type: 'manual'
            });
            errores = true;
        }

        if (errores) return;

        empleadoRequests.registrarAuxiliar(datosAuxiliar).then(response => {
            if (!response.error) {
                auxiliarForm.reset();
                onAuxiliarRegistrado(response.data.auxiliar);
            } else {
                alert('Error al registrar el auxiliar');
            }
        });
    };


    return (
        <div className='col-12 flex flex-wrap align-content-start'>
            <div className='col-12 m-0'>
                <h1 className='justify-self-end text-black-alpha-80 text-lg m-0'>
                    Reigstrar Usuario Auxiliar:
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
                    id='contrasenia2'
                    name='contrasenia2'
                    placeholder='Confirmar Contraseña'
                    className='w-full p-2'
                    { ...register('confirmContrasenia') }
                />
                { errors.confirmContrasenia && <Message severity='error' text={errors.confirmContrasenia?.message} className='mt-1 p-1'/> }
            </div>

            <div className='col-12'>
                <Button
                    severity='info'
                    label='Registrar'
                    icon='pi pi-plus'
                    iconPos='left'
                    onClick={handleSubmit(handleRegistrarAuxiliar)}
                    className='w-full'
                />
            </div>
        </div>
    );
}

export default RegistroAuxiliar;
