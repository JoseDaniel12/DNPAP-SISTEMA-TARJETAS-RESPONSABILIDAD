import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../Auth/Auth';
import Login from '../Components/Login/Login';
import Dashboard from "../Components/Dashboard/Dashboard";
import RegistroBien from '../Components/RegistroBien/RegistroBien';
import ListaEmpleados from '../Components/ListaEmpleados/ListaEmpleados';
import AgregarBienesTarjeta from '../Components/AgregarBienesTarjeta/AgregarBienesTarjeta';
import TraspasoBienes from '../Components/TraspasoBienes/TraspasoBienes';
import TarjetasEmpleado from '../Components/TarjetasEmpleado/TarjetasEmpleado';
import GestionDepartamentos from '../Components/GestionDepartamentos/GestionDepartamentos';
import GestionProgramas from '../Components/GestionProgramas/GestionProgramas';
import GestionAuxiliares from '../Components/GestionAuxiliares/GestionAuxiliares';
import GestionarEmpleados from '../Components/GestionEmpleados/GestionEmpleados';
import HistorialPropiedad from '../Components/Reportes/HistorialPropiedad/HistorialPropiedad';
import HistorialModificaciones from '../Components/Reportes/HistorialModificaciones/HistorialModificaciones';
import NotFound from '../Components/NotFound/NotFound';
import { userRoles } from '../types/userRoles';

function Rutas() {
    const {loginData, setLoginData} = useAuth();
    const usuario = loginData?.usuario;

    const rutasCoordinador = (
        <>
          <Route index element={<ListaEmpleados />} />
          <Route path="registar-bienes" element={<RegistroBien />} />
          <Route path="administrar-tarjetas" element={<ListaEmpleados />} />
          <Route path="tarjetas-empleado" element={<TarjetasEmpleado />} />
          <Route path="asignar-bienes/:id_empleado" element={<AgregarBienesTarjeta />} />
          <Route path="traspasar-bienes/:id_empleado_emisor/:id_tarjeta_responsabilidad" element={<TraspasoBienes />} />
          <Route path="pruebas" element={<AgregarBienesTarjeta />} />
          <Route path="gestionar-departamentos" element={<GestionDepartamentos />} />
          <Route path="gestionar-programas" element={<GestionProgramas />} />
          <Route path="gestionar-auxiliares" element={<GestionAuxiliares />} />
          <Route path="gestionar-empleados" element={<GestionarEmpleados />} />
          <Route path="historial-propiedad" element={<HistorialPropiedad />} />
          <Route path="historial-modificaciones" element={<HistorialModificaciones/>} />
        </>
    );

    const rutasAuxiliar = (
        <>
            <Route index element={<RegistroBien />} />
            <Route path="registar-bienes" element={<RegistroBien />} />
            <Route path="administrar-tarjetas" element={<ListaEmpleados />} />
            <Route path="tarjetas-empleado" element={<TarjetasEmpleado />} />
            <Route path="asignar-bienes/:id_empleado" element={<AgregarBienesTarjeta />} />
            <Route path="traspasar-bienes" element={<TraspasoBienes />} />
            <Route path="pruebas" element={<AgregarBienesTarjeta />} />
        </>
    );
      
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
