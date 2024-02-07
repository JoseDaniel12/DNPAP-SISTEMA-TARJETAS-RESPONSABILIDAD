import { useForm } from 'react-hook-form';
import  { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../../../Auth/Auth';

import unidadesServicioRequests from '../../../Requests/unidadesServicioRequests';


function RegistroDepartamento({ onDepartamentoRegistrado }) {
    const { loginData } = useAuth();

    const departamentoFormSchema = yup.object({
        nombre: yup.string().required('Nombre requerido'),
        siglas: yup.string().required('Siglas requeridas'),
    });

    const departamentoForm = useForm({
        defaultValues: {
            nombre: '',
            siglas: ''
        },
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


    const handleRegistrarDepartamento = async (datosDepartamento) => {
        const disponibilidadNombre = await validateDisponibilidadNombre(datosDepartamento.nombre);
        if (!disponibilidadNombre) {
            setError('nombre', {
                message: 'El nombre ya está registrado',
                type: 'manual'
            });
        }

        const disponibilidadSiglas = await validateDisponibilidadSiglas(datosDepartamento.siglas);
        if (!disponibilidadSiglas) {
            setError('siglas', {
                message: 'Las siglas ya estpan registradas',
                type: 'manual'
            });
        }

        if (Object.keys(departamentoForm.formState.errors).length > 0) return;

        datosDepartamento.idDireccion = loginData.usuario.idDireccion;
        unidadesServicioRequests.registrarDepartamento(datosDepartamento).then(response => {
            if (!response.error) {
                departamentoForm.reset();
                onDepartamentoRegistrado(response.data.departamento);
            } else {
                alert('Error al registrar el departamento');
            }
        });
    };


    return (
        <div className='col-12 flex flex-wrap align-content-start'>
            <div className='col-12 m-0'>
                <h1 className='justify-self-end text-black-alpha-80 text-lg m-0'>
                    Registrar Departamento:
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
                    id='sgilas'
                    name='nombre'
                    placeholder='Siglas'
                    className='w-full p-2'
                    { ...register('siglas') }
                />
                { errors.siglas && <Message severity='error' text={errors.siglas?.message} className='mt-1 p-1'/> }
            </div>

            <div className='col-12'>
                <Button
                    severity='success'
                    label='Registrar'
                    icon='pi pi-plus'
                    iconPos='left'
                    onClick={handleSubmit(handleRegistrarDepartamento)}
                    className='w-full'
                />
            </div>
        </div>
    );
}

export default RegistroDepartamento;
