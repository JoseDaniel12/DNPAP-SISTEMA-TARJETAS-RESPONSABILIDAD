import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom';
import { Image } from 'primereact/image';
import { Menubar } from 'primereact/menubar';
import { Dropdown } from 'primereact/dropdown';
import {useLocalStorage} from '../../hooks/useLocalStorage';
import adminOptions from './navbarOptions/adminOptions';
import auxiliarOptions from './navbarOptions/auxiliarOptions';

import dnpapLogo from '../../assets/imgs/logo_dnpap.png';

const userOptions = {
    "ADMIN": adminOptions,
    "AUXILIAR": auxiliarOptions
}

function Dashboard() {  
    const navigate = useNavigate();

    const [loginData, setLoginData] = useLocalStorage('loginData', null);
    if (!loginData) {
        return <div>F</div>
    }
    const [usuario, setUsuario] = useState(loginData.usuario);

    const getMenuObject = (userOptions) => {
        let options = userOptions.map(userOp => {
            let option = {};
            if (userOp.label) option.label = userOp.label;
            if (userOp.icon) option.icon = userOp.icon;
            if (userOp.url) option.command = () => navigate(userOp.url);
            if (userOp.separator) option.separator = userOp.separator;
            if (userOp.items) option.items = getMenuObject(userOp.items);  
            return option;
        });
        return options;
    }

    const [menubarOptions, setMenubarOptions] = useState([]);
    useEffect(() => {
        setMenubarOptions(getMenuObject(userOptions[usuario.tipo_usuario]));
    }, []);

    const userMenu = (
        <Dropdown 
            placeholder={
                <div className='flex align-items-center'>
                    <i className='pi pi-fw pi-user mr-2'></i>
                    <span className='p-menuitem-text '>{usuario.alias}</span>
                </div>
            }
            options={[
                { label: 'Editar Perfil', value: '/perfil', icon: 'pi pi-user-edit'},
                { label: 'Salir', value: '/login', icon: 'pi pi-sign-out'},
            ]} 
            itemTemplate={(option) => (
                <div className='flex align-items-center'>
                    <i className={`mr-2 ${option.icon}`}></i>
                    <span className='p-menuitem-text' data-pc-section='label'>{option.label}</span>
                </div>
            )}
            onChange={e => navigate(e.value)}
            style={{backgroundColor: 'transparent', border: 'none'}}
        />
    );

    const dnpapImage = <Image src={dnpapLogo} width='50' className='hidden sm:block mx-2'/>;

    return (
        <div className="card">
            <Menubar 
                className='bg-orange mb-4' 
                model={menubarOptions} 
                start={dnpapImage} 
                end={userMenu}
                onChange={e => alert(e)}
            />
            <Outlet />
        </div>
    );
}

export default Dashboard;
