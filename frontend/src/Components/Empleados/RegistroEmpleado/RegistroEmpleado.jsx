import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import  { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { Message } from 'primereact/message';

import { tiposUnidadesServicio } from '../../../types/unidadesServicio';
import { userRoles } from '../../../types/userRoles';
import authRequests from '../../../Requests/authRequests';
import unidadesServicioRequests from '../../../Requests/unidadesServicioRequests';
import empleadoRequests from '../../../Requests/empleadoRequests';


function RegistroEmpleado() {
    const [tipoUnidadServicio, setTipoUnidadServicio] = useState(tiposUnidadesServicio.DIRECCION);
    const [unidadesServicio, setUnidadesServicio] = useState([]);
    const [rol, setRol] = useState(userRoles.ORDINARIO);
    
    const empleadoFormSchema = yup.object({
        dpi: yup.string().required('Requerido'),
        nit: yup.string().required('Requerido'),
        cargo: yup.string().required('Requerido'),
        nombres: yup.string().required('Nombres requeridos'),
        apellidos: yup.string().required('Apellidos Requeridos'),
        correo: yup.string().email('Correo inválido').required('Correo requerido'),
        contrasenia: yup.string().required('Contraseña requerida'),
        confirmContrasenia: yup.string().required('Confirmación requerida'),
        unidadServicio: yup.number().required('Unidad de servicio requerida'),
        darPermisosAuxiliar: yup.boolean()
    });

    const empleadoForm = useForm({
        defaultValues: { darPermisosAuxiliar: false },
        resolver: yupResolver(empleadoFormSchema),
        mode: 'onSubmit'
    });
 
    const {
        watch,
        register,
        setValue,
        handleSubmit,
        reset,
        formState: { errors },
        setError,
    } = empleadoForm;

    const darPermisosAuxiliar = watch('darPermisosAuxiliar');


    const handleCambiarTipoUnidadServicio = (e) => {
        setTipoUnidadServicio(e.value);
        setValue('unidadServicio', null);
    };

    const handleSetRolAuxiliar = (e) => {
        if (e.value) {
            setRol(userRoles.AUXILIAR);
        } else {
            setRol(userRoles.ORDINARIO);
        }
    }


    const validateDisponibilidadDPI = async (dpi) => {
        const response = await authRequests.verificarDisponibilidadDpi(dpi, userRoles.ORDINARIO);
        return response.data?.disponibilidad || false;
    }

    
    const validateDisponibilidadCorreo = async (correo) => {
        const response = await empleadoRequests.verificarDisponibilidadCorreo(correo);
        return response.data?.disponibilidad || false;
    };


    const validateConfirmacionContrasenia = (contrasenia, confirmContrasenia) => {
        return contrasenia === confirmContrasenia;
    }


    const handleCrearEmpleado = async (datosEmpleado) => {
        let errores = false;

        const confirmacionContrasenia = validateConfirmacionContrasenia(datosEmpleado.contrasenia, datosEmpleado.confirmContrasenia);
        if (!confirmacionContrasenia) {
             setError('confirmContrasenia', {
                message: 'Las contraseñas no coinciden',
                type: 'manual'
            });
            errores = true;
        }

        const disponibilidadDPI = await validateDisponibilidadDPI(datosEmpleado.dpi);
        if (!disponibilidadDPI) {
            setError('dpi', {
                message: 'El DPI ya está registrado',
                type: 'manual'
            });
            errores = true;
        }

        const disponibilidadCorreo = await validateDisponibilidadCorreo(datosEmpleado.correo);
        if (!disponibilidadCorreo) {
            setError('correo', {
                message: 'El correo ya está registrado',
                type: 'manual'
            });
            errores = true;
        }

        if (errores) return;
    };


    useEffect(() => {
        unidadesServicioRequests.getUnidadesServicio().then(response => {
            setUnidadesServicio(response.data);
        });
    }, []); 


    const busquedaEmpleado = (
        <div className='col-12 -ml-2'>  
            <label className='block mb-3'>Empleados Registrados:</label>
            <span className='p-input-icon-left flex align-items-center'>
                <i className='pi pi-search' />
                <InputText value={'a'} onChange={() =>{}} 
                    placeholder='Buscar por valor clave'
                />
            </span>
        </div>
    );


    const editarEmpleadoTemplate = (
        <Button
            icon='pi pi-pencil'
            severity='warning'
            onClick={() => {}}
        />
    );

    const eliminarEmpleadoTemplate = (
        <Button 
            icon='pi pi-times'
            severity='danger'
            onClick={() => {}}
        />
    );

    return (
        <div className='grid col-8 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <div className='col-12 flex flex-wrap align-content-start'>
                <div className='col-12 m-0'>
                    <h1 className='justify-self-end text-black-alpha-80 text-lg m-0 mb-1'>
                        Registrar Empleado:
                    </h1>
                </div>

                <div className='col-12 field m-0'>
                    <label htmlFor='dpi' className='font-bold text-black-alpha-70 block'> DPI: </label>
                    <InputText 
                        type='text' 
                        id='dpi'
                        name='dpi'
                        placeholder='DPI'
                        className='w-full p-2'
                        style={{display: 'block'}}
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
                        style={{display: 'block'}}
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
                        style={{display: 'block'}}
                        { ...register('apellidos') }
                    />
                    { errors.apellidos && <Message severity='error' text={errors.apellidos?.message} className='mt-1 p-1'/> }
                </div>

                <div className='col-12'>
                    <Button
                        severity='info'
                        label='Crear'
                        icon='pi pi-plus'
                        iconPos='left'
                        onClick={handleSubmit(handleCrearEmpleado)}
                        className='w-full'
                    />
                </div>
            </div>
        </div>
    );
}

export default RegistroEmpleado;
