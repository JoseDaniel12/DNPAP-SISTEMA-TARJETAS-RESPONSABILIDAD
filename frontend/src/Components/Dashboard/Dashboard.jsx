import React, { useState, useRef, useEffect  } from 'react'
import { Outlet, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { Image } from 'primereact/image';

import { useAuth } from '../../Auth/Auth';
import navbarOptions from './navbarOptions';
import dnpapLogo from '../../assets/imgs/logo_dnpap.png';


function Dashboard() {
    const navigate = useNavigate();
    const { loginData, setLoginData } = useAuth();

    if (!loginData) {
        return <div>Inicio de Sesion Requerido.</div>
    }

    const usuario = loginData.usuario;

    const getMenubarItems = (userOptions) => {
        let options = userOptions.map(userOp => {
            let option = {};
            if (userOp.label) option.label = userOp.label;
            if (userOp.icon) option.icon = userOp.icon;
            if (userOp.url) option.command = () => {
                if (!option.className) {
                    options.forEach(op => op.className = '');
                    option.className = 'selected';
                }
                navigate(userOp.url);
            };
            if (userOp.separator) option.separator = userOp.separator;
            if (userOp.items) option.items = getMenubarItems(userOp.items);  
            return option;
        });
        return options;
    };

    const [menubarItems, setMenubarItems] = useState([]);
    useEffect(() => {
        setMenubarItems(getMenubarItems(navbarOptions));
    }, []);

    const userMenuRef = useRef(null);
    const userMenuOptions = [
        { 
            label: 'Salir', 
            icon: 'pi pi-sign-out',
            command: () => {
                setLoginData(null);
                window.localStorage.removeItem('loginData');
                navigate('/');
            }
        },
    ];
    
    const dnpapImage = <Image src={dnpapLogo} width='50' className='hidden sm:block mx-2'/>;

    const userMenu = (
        <>
            <Button
                className='text-color-secondary'
                style={{backgroundColor: 'transparent', border: 'none', padding: '0.55rem'}}
                onClick={e => userMenuRef.current.toggle(e)}
            >
                <div className='flex align-items-center'>
                    <i className='pi pi-fw pi-user mr-2'></i>
                    <span className='p-menuitem-text mr-2'>{usuario.nombres}</span>
                    <i className='pi pi-angle-down text-xl'></i>
                </div>
            </Button>
            <Menu ref={userMenuRef} model={userMenuOptions} popup popupAlignment='right'/>
        </>
    );

    return (
        <div className='card'>
            <Menubar 
                className='bg-orange mb-4' 
                model={menubarItems} 
                start={dnpapImage} 
                end={userMenu}
                style={{'position': 'sticky', 'top': '0', 'zIndex': '1000'}}
            />
            <Outlet />
        </div>
    );
}

export default Dashboard;
