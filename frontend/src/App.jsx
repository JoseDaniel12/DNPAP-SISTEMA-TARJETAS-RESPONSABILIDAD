import { Route, Routes } from 'react-router-dom';
import Login from './Components/Login/Login';
import { PrimeReactProvider } from 'primereact/api';
import Dashboard from "./Components/Dashboard/Dashboard";
import RegistroBien from './Components/RegistroBien/RegistroBien';

import "primereact/resources/themes/lara-light-cyan/theme.css";
import "/node_modules/primeflex/primeflex.css";
import 'primeicons/primeicons.css';

import { locale, addLocale } from 'primereact/api';
import langConfig from './assets/langConfig.json';
locale('es');
addLocale('es', langConfig.es);

function App() {
  return (
    <PrimeReactProvider>
      <Routes>
        // Rutas de autenticación
        <Route index element={<Login />} />
        <Route path="/login" element={<Login />} />

        // Rutas de la aplicación
        <Route path="/dashboard" element={<Dashboard />}>

          // Rutas del usuario Auxiliar
          <Route index element={<RegistroBien/>} />
          <Route path="/dashboard/registar-bienes" element={<RegistroBien/>} />
        </Route>

      </Routes>
    </PrimeReactProvider>
  );
}

export default App;