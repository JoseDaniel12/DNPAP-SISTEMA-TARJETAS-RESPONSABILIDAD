const adminOptions = [
    {
        label: 'Bienes',
        icon: 'pi pi-box',
        url: '/gestionar-bienes'
    },
    {
        label: 'Personal',
        icon: 'pi pi-users',
        items: [
            {
                label: 'Empleados',
                url: '/gestionar-empleados',
            },
            {
                label: 'Auxiliares',
                url: '/gestionar-auxiliares',
            }
        ]
    },
    {
        label: 'Unides de Servicio',
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
                label: 'Resumen de Bienes Asignados',
                url: '/bienes-asignados',
            },
            {
                label: 'Bitacora de Actividades',
                url: '/bitacora',
            }
        ]
    }
];

export default adminOptions;