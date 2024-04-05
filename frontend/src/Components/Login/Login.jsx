import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup'
import {InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../../Auth/Auth';

import authRequests from '../../Requests/authRequests';

const validationSchema = yup.object({
    correo: yup.string().required('El correo es requerido.').email('El correo no es valido.'),
    contrasenia: yup.string().required('La contraseña es requerida')
});


function Login() {
    const { setLoginData } = useAuth();
    const navigate = useNavigate();

    const [credencialesIncorrectas, setCredencialesIncorrectas] = useState(false);

    const handleLoginSubmit = async (values, actions) => {
        const response = await authRequests.login(values);
        if (response.error) {
            setCredencialesIncorrectas(true);
            return;
        }
    
        setLoginData(response);
        navigate('/');

        actions.resetForm();
    }

    const {values, errors, touched, handleBlur, handleChange, handleSubmit} = useFormik({
        initialValues: {
            correo: '',
            contrasenia: ''
        },
        validationSchema,
        onSubmit: handleLoginSubmit
    }); 
    

    return (
        <form onSubmit={handleSubmit} className='col-12 md:col-5 mx-auto mt-8 formgrid flex-column align-items-center'>
            <Card>
                { credencialesIncorrectas && <Message severity="error" text='Credenciales incorrectas' className='w-full mb-3'/>}

                <div className='field w-full'>
                    <label htmlFor='correo'>Correo:</label>
                    <InputText 
                        type='mail' 
                        id='correo'
                        name='correo' 
                        value={values.correo} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        className='w-full p-2'
                        style={{display: 'block'}}
                    />
                    {errors.correo && touched.correo && <Message severity="error" text={errors.correo} className='mt-1 p-1'/>}
                </div>
                <div className='field w-full'>
                    <label htmlFor='contrasenia'>Contraseña:</label>
                    <InputText 
                        type='password' 
                        id='contrasenia'
                        name='contrasenia' 
                        value={values.contrasenia} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className='w-full p-2'
                        style={{display: 'block'}}
                    />
                    {errors.contrasenia && touched.contrasenia && <Message severity="error" text={errors.contrasenia}  className='mt-1 p-1'/>}
                </div>
                <Button className='w-full' type='submit' label='Iniciar Sesion'/>
            </Card>
        </form>
    );
}

export default Login;
