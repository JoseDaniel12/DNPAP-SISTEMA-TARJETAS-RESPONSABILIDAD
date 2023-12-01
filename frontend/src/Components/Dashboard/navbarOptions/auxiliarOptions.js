import { useNavigate } from 'react-router-dom';

const auxiliarOptions = [
    {
        label: 'Registrar Bienes',
        icon: 'pi pi-arrow-up',
        url: '/dashboard/registar-bienes'
    },
    {
        label: 'Administrar Tarjetas',
        icon: 'pi pi-file-edit',
        url: '/dashboard/administrar-tarjetas'
    }
];

export default auxiliarOptions;