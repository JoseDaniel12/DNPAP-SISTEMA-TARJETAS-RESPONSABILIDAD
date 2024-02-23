import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import  { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { confirmDialog } from 'primereact/confirmdialog';
import { useToast } from '../../../hooks/useToast';

import { tiposUnidadesServicio } from '../../../types/unidadesServicio';
import unidadesServicioRequests from '../../../Requests/unidadesServicioRequests';


function EdicionPrograma({ idProgramaSeleccionado, departamentos, onCancelEdicion, onProgramaEditado }) {
    const toast = useToast('bottom-right');
    // const [departamentos, setDepartamentos] = useState([]);
    const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(null);

    const programaFormSchema = yup.object({
        nombre: yup.string().required('Nombre requerido'),
        siglas: yup.string().required('Siglas requeridas'),
        idDepartamento: yup.number().required('Departamento requerido'),
    });

    const programaForm = useForm({
        resolver: yupResolver(programaFormSchema),
        mode: 'onSubmit'
    });

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = programaForm;

    const idDepartamento = programaForm.watch('idDepartamento');

    const validateDisponibilidadNombre = async (nombre) => {
        const response = await unidadesServicioRequests.verificarDisponibilidadNombre(nombre);
        return response.data?.disponibilidad || false;
    }


    const validateDisponibilidadSiglas = async (siglas) => {
        const response = await unidadesServicioRequests.verificarDisponibilidadSiglas(siglas);
        return response.data?.disponibilidad || false;
    };
    

    const editarPrograma = async () => {
        const formData = programaForm.getValues();
        unidadesServicioRequests.editarPrograma(idProgramaSeleccionado, formData).then(response => {
            if (response.error) {
                alert("error")
            } else {
                console.log(response.data.programa);
                onProgramaEditado(response.data.programa);
                toast.current.show({ severity: 'success', summary: 'Exito', detail: 'Programa editado correctamente.' });
            }
        });
    };


    const handleEditarProgramaSubmit = async (formData) => {
        const disponibilidadNombre = await validateDisponibilidadNombre(formData.nombre);
        if (programaForm.getFieldState('nombre').isDirty && !disponibilidadNombre) {
            setError('nombre', {
                message: 'El DPI ya está registrado',
                type: 'manual'
            });
        }

        const disponibilidadSiglas = await validateDisponibilidadSiglas(formData.siglas);
        if (programaForm.getFieldState('siglas').isDirty && !disponibilidadSiglas) {
            setError('siglas', {
                message: 'El correo ya está registrado',
                type: 'manual'
            });
        }

        if (Object.keys(programaForm.formState.errors).length > 0) return;

        confirmDialog({
            header: 'Edición de Programa',
            message: '¿Está seguro que desea editar el programa?',
            icon: 'pi pi-exclamation-triangle',
            accept: editarPrograma,
            reject: () => {}
        });
    };


    useEffect(() => {
        unidadesServicioRequests.getUnidadServicio(idProgramaSeleccionado).then(response => {
            if (!response.error) {
                const unidadServicio = response.data.unidadServicio;
                programaForm.reset({
                    nombre: unidadServicio.nombre_nuclear,
                    siglas: unidadServicio.siglas,
                    idDepartamento: unidadServicio.id_unidad_superior
                });
                setDepartamentoSeleccionado(departamentos.find(d => d.id_unidad_servicio === unidadServicio.id_unidad_superior));
            }
        });
    }, [idProgramaSeleccionado]);


    const selectedDepartamentoTemplate = (option, props) => {
        if (option)  return <div> {option.siglas_jerarquicas} </div>;
        return <div> {props.placeholder} </div>
    }


    return (
        <div className='col-12 flex flex-wrap align-content-start'>

            <div className='col-12 m-0'>
                <h1 className='justify-self-end text-black-alpha-80 text-lg m-0'>
                    Editar Programa:
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

            <div className='col-12 field m-0'>
                <label className='font-bold text-black-alpha-70 block'> Departamento: </label>
                <Dropdown 
                    options={departamentos}
                    value={departamentoSeleccionado}
                    placeholder='Seleccione un Departamento'
                    optionLabel='siglas_jerarquicas'
                    valueTemplate={selectedDepartamentoTemplate}
                    onChange={e => {
                        programaForm.setValue('idDepartamento', e.value.id_unidad_servicio);
                        setDepartamentoSeleccionado(e.value);
                    }}
                />   
                { errors.idDepartamento && <Message severity='error' text={errors.idDepartamento?.message} className='mt-1 p-1'/> }
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
                    onClick={handleSubmit(handleEditarProgramaSubmit)}
                    className='w-full'
                />
            </div>
        </div>
    );
}

export default EdicionPrograma;