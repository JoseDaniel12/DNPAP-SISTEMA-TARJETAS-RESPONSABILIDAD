import React, { useEffect, useState, useRef  } from 'react'
import { Outlet, useNavigate } from 'react-router-dom';
import { Image } from 'primereact/image';
import { Menubar } from 'primereact/menubar';
import adminOptions from './navbarOptions/adminOptions';
import auxiliarOptions from './navbarOptions/auxiliarOptions';
import { useAuth } from '../../Auth/Auth';
import dnpapLogo from '../../assets/imgs/logo_dnpap.png';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
        

const userOptions = {
    'Ordinario': adminOptions,
    'Auxiliar': adminOptions
}

function Dashboard() {  
    const { loginData, setLoginData } = useAuth();
    const navigate = useNavigate();

    if (!loginData) {
        return <div>F</div>
    }
    const [usuario, setUsuario] = useState(loginData.usuario);

    const [selectedItem, setSelectedItem] = useState(null);
    const getMenuObject = (userOptions) => {
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
            if (userOp.items) option.items = getMenuObject(userOp.items);  
            return option;
        });
        return options;
    }

    const [menubarOptions, setMenubarOptions] = useState([]);
    useEffect(() => {
        // setMenubarOptions(getMenuObject(userOptions[usuario.rol]));
        setMenubarOptions(getMenuObject(adminOptions));
    }, []);

    const userMenuOptions = [
        { label: 'Editar Perfil', icon: 'pi pi-user-edit', url: '/perfil'},
        { 
            label: 'Salir', 
            icon: 'pi pi-sign-out',
            command: () => {
                setLoginData(null);
                navigate('/');
            }
        },
    ];
    const userMenuButton = useRef(null);
    const userMenu = (
        <>
            <Button
                className='text-color-secondary'
                style={{backgroundColor: 'transparent', border: 'none', padding: '0.55rem'}}
                onClick={(e) => userMenuButton.current.toggle(e)}
            >
                <div className='flex align-items-center'>
                    <i className='pi pi-fw pi-user mr-2'></i>
                    <span className='p-menuitem-text mr-2'>{usuario.alias}</span>
                    <i className='pi pi-angle-down text-xl'></i>
                </div>
            </Button>
            <Menu model={userMenuOptions} ref={userMenuButton} popup popupAlignment='right'/>
        </>
    );

    const dnpapImage = <Image src={dnpapLogo} width='50' className='hidden sm:block mx-2'/>;

    return (
        <div className='card'>
            <Menubar 
                className='bg-orange mb-4' 
                model={menubarOptions} 
                start={dnpapImage} 
                end={userMenu}
            />
            <Outlet />
        </div>
    );
}

export default Dashboard;
