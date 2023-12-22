import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup'
import {InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../../Auth/Auth';

const validationSchema = yup.object({
    alias: yup.string().required('El alias es requerido'),
    contrasenia: yup.string().required('La contraseña es requerida')
});


function Login() {
    const { setLoginData } = useAuth();
    const navigate = useNavigate();

    const [credencialesIncorrectas, setCredencialesIncorrectas] = useState(false);

    const handleLoginSubmit = async (values, actions) => {
        const response = await fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(values)
        });

        const data = await response.json();
        if (response.status !== 200) {
            setCredencialesIncorrectas(true);
            return;
        }
    
        setLoginData(data);
        navigate('/');

        actions.resetForm();
    }

    const {values, errors, touched, handleBlur, handleChange, handleSubmit} = useFormik({
        initialValues: {
            alias: '',
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
                    <label htmlFor='alias'>Nombre de Usuario:</label>
                    <InputText 
                        type='text' 
                        id='alias' 
                        name='alias' 
                        value={values.alias} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        className='w-full p-2'
                        style={{display: 'block'}}
                    />
                    {errors.alias && touched.alias && <Message severity="error" text={errors.alias} className='mt-1 p-1'/>}
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
