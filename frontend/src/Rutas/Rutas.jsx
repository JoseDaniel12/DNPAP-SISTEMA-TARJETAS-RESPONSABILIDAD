import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../Auth/Auth';
import Login from '../Components/Login/Login';
import Dashboard from "../Components/Dashboard/Dashboard";
import UnsignedUserLayout from '../Components/UnsignedUserLayout/UnsignedUserLayout';
import GestionBienes from '../Components/Bienes/GestionBienes/GestionBienes';
import RegistroBien from '../Components/Bienes/RegistroBien/RegistroBien';
import EdicionBien from '../Components/Bienes/EdicionBien/EdicionBien';
import GestionEmpleados from '../Components/Empleados/GestionEmpleados/GestionEmpleados';
import GestionAuxiliares from '../Components/Auxiliares/GestionAuxiliares/GestionAuxiliares';
import AgregarBienesTarjeta from '../Components/AgregarBienesTarjeta/AgregarBienesTarjeta';
import TraspasoBienes from '../Components/TraspasoBienes/TraspasoBienes';
import DesasignacionBienes from '../Components/DesasignacionBienes/DesasignacionBienes';
import TarjetasEmpleado from '../Components/TarjetasEmpleado/TarjetasEmpleado';
import GestionDepartamentos from '../Components/Departamentos/GestionDepartamentos/GestionDepartamentos';
import GestionProgramas from '../Components/Programas/GestionProgramas/GestionProgramas';
import RegistroEmpleado from '../Components/Empleados/RegistroEmpleado/RegistroEmpleado';
import EdicionEmpleado from '../Components/Empleados/EdicionEmpleado/EdicionEmpleado';
import BienesAsignados from '../Components/Reportes/BienesAsignados/BienesAsignados';
import Bitacora from '../Components/Reportes/Bitacora/Bitacora';
import NotFound from '../Components/NotFound/NotFound';
import { userRoles } from '../types/userRoles';

function Rutas() {
    const {loginData, setLoginData} = useAuth();
    const usuario = loginData?.usuario;

    const rutasCoordinador = (
        <>
          <Route index element={<GestionEmpleados />} />
          <Route path="gestionar-bienes" element={<GestionBienes />} />
          <Route path="registar-bienes" element={<RegistroBien />} />
          <Route path="editar-bien/:id_bien" element={<EdicionBien />} />
          <Route path="asignar-bienes/:id_empleado" element={<AgregarBienesTarjeta />} />
          <Route path="traspasar-bienes/:id_empleado_emisor" element={<TraspasoBienes />} />
          <Route path="desasignar-bienes/:id_empleado" element={<DesasignacionBienes />} />
          <Route path="gestionar-auxiliares" element={<GestionAuxiliares />} />
          <Route path="gestionar-empleados" element={<GestionEmpleados />} />
          <Route path="registrar-empleado" element={<RegistroEmpleado />} />
          <Route path="editar-empleado" element={<EdicionEmpleado />} />
          <Route path="tarjetas-empleado/:id_empleado" element={<TarjetasEmpleado />} />
          <Route path="gestionar-departamentos" element={<GestionDepartamentos />} />
          <Route path="gestionar-programas" element={<GestionProgramas />} />
          <Route path="bienes-asignados" element={<BienesAsignados />} />
          <Route path="bitacora" element={<Bitacora/>} />
        </>
    );

    const rutasAuxiliar = rutasCoordinador;
      
    const rutas = usuario?.rol === userRoles.COORDINADOR ? rutasCoordinador : rutasAuxiliar;

    return (
        <Routes>
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
          <Route path="/login" element={<Login/>} />
        </Routes>
    );
}

export default Rutas;
