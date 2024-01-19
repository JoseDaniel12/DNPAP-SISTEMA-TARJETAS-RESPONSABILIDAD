import { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

const ToastContext = createContext();

const ToastProvider = ({ children }) => {
    const toastRefs = {
        'top-center': useRef(null),
        'top-left': useRef(null),
        'top-right': useRef(null),
        'center': useRef(null),
        'bottom-left': useRef(null),
        'bottom-center': useRef(null),
        'bottom-right': useRef(null),
    }


    return (
        <ToastContext.Provider value={toastRefs}>
            <Toast ref={toastRefs['top-left']} position='top-left' />
            <Toast ref={toastRefs['top-center']} position='top-center' />
            <Toast ref={toastRefs['top-right']} position='top-right' />
            <Toast ref={toastRefs['center']} position='center' />
            <Toast ref={toastRefs['bottom-left']} position='bottom-left' />
            <Toast ref={toastRefs['bottom-center']} position='bottom-center' />
            <Toast ref={toastRefs['bottom-right']} position='bottom-right' />
            {children}
        </ToastContext.Provider>
    );
};

const useToast = (position) => {
    const toastRefs = useContext(ToastContext);
    return toastRefs[position];
};

export { ToastProvider, useToast };
