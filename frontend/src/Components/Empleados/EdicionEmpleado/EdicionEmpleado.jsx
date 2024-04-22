import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import  { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';
        

import { useToast } from '../../../hooks/useToast';
import { tiposUnidadesServicio } from '../../../types/unidadesServicio';
import { userRoles } from '../../../types/userRoles';
import unidadesServicioRequests from '../../../Requests/unidadesServicioRequests';
import empleadoRequests from '../../../Requests/empleadoRequests';


function EdicionEmpleado() {
    const navigate = useNavigate();
    const { state: { empleado } } = useLocation();
    const toast = useToast('bottom-right');

    const [tipoUnidadServicio, setTipoUnidadServicio] = useState(tiposUnidadesServicio.DIRECCION);
    const [unidadesServicio, setUnidadesServicio] = useState([]);
    const [unidadServicioSeleccionada, setUnidadServicioSeleccionada] = useState({});

    const empleadoFormSchema = yup.object({
        dpi: yup.string().required('DPI requerido'),
        nit: yup.string().required('Nit requerido'),
        nombres: yup.string().required('Nombres requeridos'),
        apellidos: yup.string().required('Apellidos requeridos'),
        cargo: yup.string().required('Cargo requerido'),
        id_unidad_servicio: yup.number().required('Unidad de servicio requerida')
    });

    const empleadoForm = useForm({
        defaultValues: {
            dpi: empleado.dpi,
            nit: empleado.nit,
            nombres: empleado.nombres,
            apellidos: empleado.apellidos,
            cargo: empleado.cargo,
            id_unidad_servicio: null
        },
        resolver: yupResolver(empleadoFormSchema),
        mode: 'onSubmit'
    });
 
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = empleadoForm;


    const handleCambioTipoUnidadServicio = (e) => {
        setTipoUnidadServicio(e.target.value);
        setUnidadServicioSeleccionada(null);
        empleadoForm.setValue('id_unidad_servicio', null);
    };


    const handleCambioUnidadServicio = (e) => {
        setUnidadServicioSeleccionada(e.value);
        empleadoForm.setValue('id_unidad_servicio', e.value.id_unidad_servicio);
        empleadoForm.clearErrors('id_unidad_servicio');
    };


    const editarEmpleado = async () => {
        const datosEmpleado = empleadoForm.getValues();
        empleadoRequests.editarEmpleado(empleado.id_empleado, datosEmpleado).then(response => {
            if (!response.error) {
                toast.current.show({severity: 'success', summary: 'Registro de Empleado', detail: 'Registro exitoso.', life: 3000});
            } else {
                toast.current.show({severity: 'error', summary: 'Registro de Empleado', detail: response.error, life: 3000});
            }
        });
    };


    const validateDisponibilidadDPI = async (dpi) => {
        const response = await empleadoRequests.verificarDisponibilidadDpi(dpi, userRoles.ORDINARIO);
        return response.data?.disponibilidad || false;
    };


    const handleEditarEmpleado = async (datosEmpleado) => {
        const disponibilidadDPI = await validateDisponibilidadDPI(datosEmpleado.dpi);
        if (empleadoForm.getFieldState('dpi').isDirty && !disponibilidadDPI) {
            setError('dpi', {
                message: 'El DPI ya está registrado',
                type: 'manual'
            });
        }

        if (Object.keys(empleadoForm.formState.errors).length > 0) return;

        confirmDialog({
            header: 'Edición de Empleado Ordinario',
            message: '¿Está seguro que desea editar el empleado?',
            icon: 'pi pi-exclamation-triangle',
            accept: editarEmpleado,
            reject: () => {}
        });
    };


    useEffect(() => {
        unidadesServicioRequests.getUnidadServicio(empleado.id_unidad_servicio).then(response => {
            const { unidadServicio } = response.data;
            setTipoUnidadServicio(unidadServicio.tipo_unidad_servicio);
            setUnidadServicioSeleccionada(unidadServicio);
            empleadoForm.setValue('id_unidad_servicio', unidadServicio.id_unidad_servicio);
        })
    }, []);


    useEffect(() => {
        unidadesServicioRequests.getUnidadesServicio(tipoUnidadServicio).then(response => {
            setUnidadesServicio(response.data.unidadesServicio);
        });
    }, [tipoUnidadServicio]);


    return (
        <div className='grid col-8 mx-auto p-4 p-fluid bg-gray-50 border-round shadow-1 mb-4'>
            <ConfirmDialog />

            <div className='col-12 m-0'>
                <h1 className='text-lg text-black-alpha-80 m-0 mb-1'>
                    Editar Empleado:
                </h1>
            </div>

            <div className='col-12 md:col-6 field m-0'>
                <label htmlFor='dpi' className='font-bold text-black-alpha-70 block'> DPI: </label>
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
                <label htmlFor='nit' className='font-bold text-black-alpha-70 block'> Nit: </label>
                <InputText 
                    type='text' 
                    id='nit'
                    name='nit'
                    placeholder='Nit'
                    className='w-full p-2'
                    { ...register('nit') }
                />
                { errors.nit && <Message severity='error' text={errors.nit?.message} className='mt-1 p-1'/> }
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
                <label className='font-bold text-black-alpha-70 block'>Unidad de Servicio: </label>
                <div className='flex flex-wrap gap-3 my-2'>
                    <div className='flex align-items-center'>
                        <RadioButton 
                            inputId='direccion' name='unidadServicio' value={tiposUnidadesServicio.DIRECCION}
                            checked={tipoUnidadServicio === tiposUnidadesServicio.DIRECCION}
                            onChange={handleCambioTipoUnidadServicio}
                        />
                        <label htmlFor='direccion' className='ml-1'>Dirección</label>
                    </div>
                    <div className='flex align-items-center '>
                        <RadioButton 
                            inputId='departamento' name='unidadServicio' value={tiposUnidadesServicio.DEPARTAMENTO}
                            checked={tipoUnidadServicio === tiposUnidadesServicio.DEPARTAMENTO}
                            onChange={handleCambioTipoUnidadServicio}
                        />
                        <label htmlFor='departamento' className='ml-1'>{tiposUnidadesServicio.DEPARTAMENTO}</label>
                    </div>
                    <div className='flex align-items-center '>
                        <RadioButton 
                            inputId='programa' name='unidadServicio' value={tiposUnidadesServicio.PROGRAMA}
                            checked={tipoUnidadServicio === tiposUnidadesServicio.PROGRAMA}
                            onChange={handleCambioTipoUnidadServicio}
                        />
                        <label htmlFor='programa' className='ml-1'>{tiposUnidadesServicio.PROGRAMA}</label>
                    </div>
                </div>
                <Dropdown
                    filter
                    options={unidadesServicio.filter(u => u.tipo_unidad_servicio === tipoUnidadServicio)}
                    value={unidadServicioSeleccionada}
                    optionLabel='siglas_jerarquicas'
                    placeholder='Seleccione una Unidad'
                    onChange={handleCambioUnidadServicio}
                />
                { errors.id_unidad_servicio && <Message severity='error' text={errors.id_unidad_servicio?.message} className='mt-1 p-1'/> }
            </div>

            <div className='col-12 field'>
                <label className='font-bold text-black-alpha-70 block'>Cargo: </label>
                <InputText 
                    type='text' 
                    id='apellidos'
                    name='cargo'
                    placeholder='Cargo'
                    className='w-full p-2'
                    { ...register('cargo') }
                />
                { errors.cargo && <Message severity='error' text={errors.cargo?.message} className='mt-1 p-1'/> }
            </div>

            <div className='col-12 flex flex-wrap justify-content-between gap-2'>
                <div className='col-12 md:col p-0'>
                    <Button 
                        severity='warning' label='Regresar' icon='pi pi-arrow-left'
                        onClick={() => navigate(-1)}
                    />
                </div>
                <div className='col-12 md:col p-0'>
                    <Button
                        severity='info' label='Editar Empleado' icon='pi pi-pencil'
                        className='w-full'
                        onClick={handleSubmit(handleEditarEmpleado)}
                    />
                </div>
            </div>
        </div>
    );
}

export default EdicionEmpleado;
