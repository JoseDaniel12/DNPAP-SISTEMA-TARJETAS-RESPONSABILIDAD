import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../Auth/Auth';
import Login from '../Components/Login/Login';
import Dashboard from "../Components/Dashboard/Dashboard";
import RegistroBien from '../Components/Bienes/RegistroBien/RegistroBien';
import EdicionBienDesasignado from '../Components/Bienes/EdicionBienDesasignado/EdicionBienDesasignado';
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
import HistorialPropiedad from '../Components/Reportes/HistorialPropiedad/HistorialPropiedad';
import HistorialModificaciones from '../Components/Reportes/HistorialModificaciones/HistorialModificaciones';
import AgrupacionBienes from '../Components/AgrupacionBienes/AgrupacionBienes';
import NotFound from '../Components/NotFound/NotFound';
import { userRoles } from '../types/userRoles';

function Rutas() {
    const {loginData, setLoginData} = useAuth();
    const usuario = loginData?.usuario;

    const rutasCoordinador = (
        <>
          <Route index element={<GestionEmpleados />} />
          <Route path="agrupar-bienes" element={<AgrupacionBienes />} />
          <Route path="registar-bienes" element={<RegistroBien />} />
          <Route path="editar-bien-desasignado" element={<EdicionBienDesasignado />} />
          <Route path="asignar-bienes/:id_empleado" element={<AgregarBienesTarjeta />} />
          <Route path="traspasar-bienes/:id_empleado_emisor/:id_tarjeta_responsabilidad" element={<TraspasoBienes />} />
          <Route path="desasignar-bienes/:id_empleado" element={<DesasignacionBienes />} />
          <Route path="gestionar-auxiliares" element={<GestionAuxiliares />} />
          <Route path="gestionar-empleados" element={<GestionEmpleados />} />
          <Route path="registrar-empleado" element={<RegistroEmpleado />} />
          <Route path="editar-empleado" element={<EdicionEmpleado />} />
          <Route path="tarjetas-empleado" element={<TarjetasEmpleado />} />
          <Route path="gestionar-departamentos" element={<GestionDepartamentos />} />
          <Route path="gestionar-programas" element={<GestionProgramas />} />
          <Route path="historial-propiedad" element={<HistorialPropiedad />} />
          <Route path="historial-modificaciones" element={<HistorialModificaciones/>} />
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
