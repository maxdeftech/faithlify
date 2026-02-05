import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { auth0Config, isAuth0Configured } from './src/lib/authConfig';
import { AuthProvider } from './src/contexts/AuthContext';
import App from './App';

const Root: React.FC = () => {
  const content = (
    <AuthProvider>
      <App />
    </AuthProvider>
  );

  if (!isAuth0Configured()) {
    console.warn('Auth0 not configured. Running in dev mode with mock auth.');
    return content;
  }

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={auth0Config.authorizationParams}
      cacheLocation="localstorage"
    >
      {content}
    </Auth0Provider>
  );
};

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<Root />);
}
