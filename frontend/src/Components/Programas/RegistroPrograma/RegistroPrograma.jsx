import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import  { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

import { tiposUnidadesServicio } from '../../../types/unidadesServicio';
import unidadesServicioRequests from '../../../Requests/unidadesServicioRequests';


function RegistroPrograma({ onProgramaRegistrado }) {
    const [departamentos, setDepartamentos] = useState([]);

    const programaFormSchema = yup.object({
        nombre: yup.string().required('Nombre requerido'),
        siglas: yup.string().required('Siglas requeridas'),
        idDepartamento: yup.number().required('Dirección requerida')
    });

    const programaForm = useForm({
        defaultValues: {
            nombre: '',
            siglas: ''
        },
        resolver: yupResolver(programaFormSchema),
        mode: 'onSubmit'
    });

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = programaForm;


    const validateDisponibilidadNombre = async (nombre) => {
        const response = await unidadesServicioRequests.verificarDisponibilidadNombre(nombre);
        return response.data?.disponibilidad || false;
    }

    const validateDisponibilidadSiglas = async (siglas) => {
        const response = await unidadesServicioRequests.verificarDisponibilidadSiglas(siglas);
        return response.data?.disponibilidad || false;
    };


    const handleRegistrarPrograma = async (datosDepartamento) => {
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

        if (Object.keys(programaForm.formState.errors).length > 0) return;

        unidadesServicioRequests.registrarPrograma(datosDepartamento).then(response => {
            if (!response.error) {
                programaForm.reset();
                onProgramaRegistrado(response.data.programa);
            } else {
                alert('Error al registrar el departamento');
            }
        });
    };


    useEffect(() => {
        unidadesServicioRequests.getUnidadesServicio(tiposUnidadesServicio.DEPARTAMENTO).then(response => {
            setDepartamentos(response.data.unidadesServicio);
        });
    }, []);


    return (
        <div className='col-12 flex flex-wrap align-content-start'>
            <div className='col-12 m-0'>
                <h1 className='justify-self-end text-black-alpha-80 text-lg m-0'>
                    Registrar Programa:
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

            <div className='col-12 field m-0'>
                <label className='font-bold text-black-alpha-70 block'> Departamento: </label>
                <Controller
                    name='idDepartamento'
                    control={programaForm.control}
                    render={({ field }) => (
                        <Dropdown
                            filter
                            {...field}
                            options={departamentos}
                            placeholder='Seleccione un Departamento'
                            optionLabel='siglas_jerarquicas'
                            optionValue='id_unidad_servicio'
                            onChange={e => field.onChange(e.value)}
                        />
                    )}
                />
                { errors.idDepartamento && <Message severity='error' text={errors.idDepartamento?.message} className='mt-1 p-1'/> }
            </div>

            <div className='col-12'>
                <Button
                    severity='success'
                    label='Registrar'
                    icon='pi pi-plus'
                    iconPos='left'
                    onClick={handleSubmit(handleRegistrarPrograma)}
                    className='w-full'
                />
            </div>
        </div>
    );
}

export default RegistroPrograma;
