const adminOptions = [
    {
        label: 'Bienes',
        icon: 'pi pi-box',
        url: '/registar-bienes'
    },
    // {
    //     label: 'Agrupar Bienes',
    //     icon: 'pi pi-box',
    //     url: '/agrupar-bienes'
    // },
    {
        label: 'Personal',
        icon: 'pi pi-users',
        items: [
            {
                label: 'Gestionar Empleados',
                url: '/gestionar-empleados',
            },
            {
                label: 'Gestionar Auxiliares',
                url: '/gestionar-auxiliares',
            }
        ]
    },
    {
        label: 'Organización',
        icon: 'pi pi-sitemap',
        items: [
            {
                label: 'Departamentos',
                url: '/gestionar-departamentos'
            },
            {
                label: 'Programas',
                url: '/gestionar-programas'
            },
        ]
    },
    {
        label: 'Reportes',
        icon: 'pi pi-align-left',
        url: '',
        items: [
            {
                label: 'Historial de Propiedad',
                icon: 'pi pi-history',
                url: '/historial-propiedad',
            },
            {
                label: 'Historial Modificaciones',
                icon: 'pi pi-history',
                url: '/historial-modificaciones',
            }
        ]
    }
];

export default adminOptions;