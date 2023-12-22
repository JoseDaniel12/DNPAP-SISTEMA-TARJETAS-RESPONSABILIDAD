import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [loginData, setLoginData] = useLocalStorage('loginData', null);

    return (
        <AuthContext.Provider value={{ loginData, setLoginData }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthProvider, useAuth };
