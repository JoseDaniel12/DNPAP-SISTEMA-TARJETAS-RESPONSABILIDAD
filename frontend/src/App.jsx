import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from './Auth/Auth';
import { ToastProvider } from './hooks/useToast';
import Rutas from './Rutas/Rutas';

import "primereact/resources/themes/lara-light-cyan/theme.css";
import "/node_modules/primeflex/primeflex.css";
import 'primeicons/primeicons.css';
import { locale, addLocale } from 'primereact/api';
import langConfig from './assets/langConfig.json';
locale('es');
addLocale('es', langConfig.es);

function App() {
  return (
    <AuthProvider>
      <PrimeReactProvider>
        <ToastProvider>
          <Rutas/>
        </ToastProvider>
      </PrimeReactProvider>
    </AuthProvider>
  );
}

export default App;