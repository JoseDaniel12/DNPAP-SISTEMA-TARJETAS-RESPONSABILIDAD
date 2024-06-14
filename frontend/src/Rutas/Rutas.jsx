import { Route, Routes } from 'react-router-dom';
import { useAuth } from '../Auth/Auth';
import Login from '../Components/Login/Login';
import Dashboard from "../Components/Dashboard/Dashboard";
import UnsignedUserLayout from '../Components/UnsignedUserLayout/UnsignedUserLayout';
import GestionModelos from '../Components/Bienes/Modelos/GestionModelos/GestionModelos';
import RegistroModelo from '../Components/Bienes/Modelos/RegistroModelo/RegistroModelo';
import EdicionModelo from '../Components/Bienes/Modelos/EdicionModelo/EdicionModelo';
import GestionBienes2 from '../Components/Bienes/GestionBienes/GestionBienes2';
import CargaBienesModelo from '../Components/Bienes/CargaBienesModelo/CargaBienesModelo';

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

function Rutas() {
    const { loginData } = useAuth();
    const usuario = loginData?.usuario;

    const rutas = (
        <>
          <Route index element={<GestionEmpleados />} />
          <Route path="modelos" element={<GestionModelos/>} />
          <Route path="registrar-modelo" element={<RegistroModelo/>} />
          <Route path="editar-modelo/:id_modelo" element={<EdicionModelo/>} />
          <Route path="gestionar-bienes2/:id_modelo" element={<GestionBienes2 />} />

          <Route path="cargar-bienes-modelo/:id_modelo" element={<CargaBienesModelo />} />
          
          <Route path="gestionar-bienes" element={<GestionBienes />} />
          <Route path="registar-bienes" element={<RegistroBien />} />
          <Route path="editar-bien/:id_bien" element={<EdicionBien />} />
          <Route path="gestionar-auxiliares" element={<GestionAuxiliares />} />
          <Route path="gestionar-empleados" element={<GestionEmpleados />} />
          <Route path="registrar-empleado" element={<RegistroEmpleado />} />
          <Route path="editar-empleado" element={<EdicionEmpleado />} />
          <Route path="gestionar-departamentos" element={<GestionDepartamentos />} />
          <Route path="gestionar-programas" element={<GestionProgramas />} />
          <Route path="asignar-bienes/:id_empleado" element={<AgregarBienesTarjeta />} />
          <Route path="desasignar-bienes/:id_empleado" element={<DesasignacionBienes />} />
          <Route path="traspasar-bienes/:id_empleado_emisor" element={<TraspasoBienes />} />
          <Route path="tarjetas-empleado/:id_empleado" element={<TarjetasEmpleado />} />
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
