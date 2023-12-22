const adminOptions = [
    {
        label: 'Bienes',
        icon: 'pi pi-box',
        url: '/registar-bienes'
    },
    {
        label: 'Tarjetas',
        icon: 'pi pi-fw pi-file',
        url: '/administrar-tarjetas'
    },
    {
        label: 'Auxiliares',
        icon: 'pi pi-users',
        url: '/gestionar-auxiliares'
    },
    {
        label: 'Departamentos',
        icon: 'pi pi-sitemap',
        url: '/gestionar-departamentos'
    },
    {
        label: 'Programas',
        icon: 'pi pi-sitemap',
        url: '/gestionar-programas'
    },
    {
        label: 'Empleados',
        icon: 'pi pi-users',
        url: '/gestionar-empleados'
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
    },

];

export default adminOptions;