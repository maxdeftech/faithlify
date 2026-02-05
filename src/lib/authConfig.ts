// Auth0 Configuration
export const auth0Config = {
    domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
    authorizationParams: {
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
        audience: import.meta.env.VITE_AUTH0_AUDIENCE || undefined,
    },
};

// Check if Auth0 is properly configured
export const isAuth0Configured = () => {
    return !!(auth0Config.domain && auth0Config.clientId);
};
