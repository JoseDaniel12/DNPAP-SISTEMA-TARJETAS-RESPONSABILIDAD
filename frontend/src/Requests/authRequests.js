import requestSettings from './requestSettings';

const authUrl = `${import.meta.env.VITE_BACKEND_URL}/auth`;

const authRequests = {
    login: async (values) => {
        const url = `${authUrl}/login`;
        return await fetch(url, {
            ...requestSettings,
            method: 'POST',
            body: JSON.stringify(values)
        }).then(response => response.json());
    },
};

export default authRequests;