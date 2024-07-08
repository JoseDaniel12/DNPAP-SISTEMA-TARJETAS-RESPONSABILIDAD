import { Route, Routes } from 'react-router-dom';
import { useAuth } from '../Auth/Auth';
import Login from '../Components/Login/Login';
import Dashboard from "../Components/Dashboard/Dashboard";
import UnsignedUserLayout from '../Components/UnsignedUserLayout/UnsignedUserLayout';
import NotFound from '../Components/NotFound/NotFound';

// Modelos de Bienes
import GestionModelos from '../Components/Bienes/Modelos/GestionModelos/GestionModelos';
import RegistroModelo from '../Components/Bienes/Modelos/RegistroModelo/RegistroModelo';
import EdicionModelo from '../Components/Bienes/Modelos/EdicionModelo/EdicionModelo';

// Bienes
import GestionBienes from '../Components/Bienes/GestionBienes/GestionBienes';
import CargaBienesModelo from '../Components/Bienes/CargaBienesModelo/CargaBienesModelo';
import BusquedaBienesRegistrados from '../Components/Bienes/GestionBienes/BusquedaBienesRegistrados';

// Personal
import GestionAuxiliares from '../Components/Auxiliares/GestionAuxiliares/GestionAuxiliares';
import GestionEmpleados from '../Components/Empleados/GestionEmpleados/GestionEmpleados';
import RegistroEmpleado from '../Components/Empleados/RegistroEmpleado/RegistroEmpleado';
import EdicionEmpleado from '../Components/Empleados/EdicionEmpleado/EdicionEmpleado';

// Unidades de Servicio
import GestionDepartamentos from '../Components/Departamentos/GestionDepartamentos/GestionDepartamentos';
import GestionProgramas from '../Components/Programas/GestionProgramas/GestionProgramas';

 // Tarjetas y Transacciones de Bienes
import AgregarBienesTarjeta from '../Components/AgregarBienesTarjeta/AgregarBienesTarjeta';
import DesasignacionBienes from '../Components/DesasignacionBienes/DesasignacionBienes';
import TraspasoBienes from '../Components/TraspasoBienes/TraspasoBienes';
import TarjetasEmpleado from '../Components/TarjetasEmpleado/TarjetasEmpleado';

// Reportes
import BienesAsignados from '../Components/Reportes/BienesAsignados/BienesAsignados';
import Bitacora from '../Components/Reportes/Bitacora/Bitacora';


function Rutas() {
    const { loginData } = useAuth();
    const usuario = loginData?.usuario;

    const rutas = (
        <>
          <Route index element={<GestionEmpleados />} />

          // Modelos de Bienes
          <Route path="modelos" element={<GestionModelos/>} />
          <Route path="registrar-modelo" element={<RegistroModelo/>} />
          <Route path="editar-modelo/:id_modelo" element={<EdicionModelo/>} />

          // Bienes
          <Route path="gestionar-bienes-modelo/:id_modelo" element={<GestionBienes />} />
          <Route path="cargar-bienes-modelo/:id_modelo" element={<CargaBienesModelo />} />
          <Route path="buscar-bienes-registrados" element={<BusquedaBienesRegistrados />} />

          // Personal
          <Route path="gestionar-auxiliares" element={<GestionAuxiliares />} />
          <Route path="gestionar-empleados" element={<GestionEmpleados />} />
          <Route path="registrar-empleado" element={<RegistroEmpleado />} />
          <Route path="editar-empleado" element={<EdicionEmpleado />} />
      
          // Unidades de Servicio
          <Route path="gestionar-departamentos" element={<GestionDepartamentos />} />
          <Route path="gestionar-programas" element={<GestionProgramas />} />

          // Tarjetas y Transacciones de Bienes
          <Route path="asignar-bienes/:id_empleado" element={<AgregarBienesTarjeta />} />
          <Route path="desasignar-bienes/:id_empleado" element={<DesasignacionBienes />} />
          <Route path="traspasar-bienes/:id_empleado_emisor" element={<TraspasoBienes />} />
          <Route path="tarjetas-empleado/:id_empleado" element={<TarjetasEmpleado />} />

          // Reportes
          <Route path="bienes-asignados" element={<BienesAsignados />} />
          <Route path="bitacora" element={<Bitacora/>} />
        </>
    );

    return (
      <Routes>
          <Route path="/login" element={<Login/>} />
          {
            !usuario? (
              <>
                <Route index element={<Login/>} />
                <Route path='/' element={<UnsignedUserLayout />}>
                  <Route path="empleados" element={<GestionEmpleados />}/>
                  <Route path="tarjetas-empleado/:id_empleado" element={<TarjetasEmpleado />} />
                </Route>
                <Route path="/*" element={<Login/>}/>
              </>
            ) : (
              <>
                <Route path="/" element={<Dashboard/>}>
                  {rutas}
                </Route>
                <Route path="/*" element={<NotFound/>}/>
              </>
            )
          }
      </Routes>
    );
}

export default Rutas;
