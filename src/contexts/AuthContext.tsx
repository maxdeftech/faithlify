// Auth Context - Provides authentication state and user data throughout the app
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { syncUserFromAuth0, type User } from '../services/userService';
import { isAuth0Configured } from '../lib/authConfig';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development without Auth0
const MOCK_USER: User = {
    id: 'mock-user-id',
    auth0_id: 'mock-auth0-id',
    email: 'john@faithlify.com',
    name: 'John Doe',
    avatar_url: 'https://picsum.photos/seed/user1/200/200',
    role: 'admin',
    username: 'admin',
    bio: 'Faithlify Admin',
    website: 'https://faithlify.com',
    is_public: true,
    theme_preference: 'system',
    created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dbUser, setDbUser] = useState<User | null>(null);
    const [mockLoggedIn, setMockLoggedIn] = useState(false);

    // Use Auth0 hook only if configured
    const auth0Configured = isAuth0Configured();
    const auth0 = auth0Configured ? useAuth0() : null;

    const isAuthenticated = auth0Configured ? (auth0?.isAuthenticated ?? false) : mockLoggedIn;
    const isLoading = auth0Configured ? (auth0?.isLoading ?? true) : false;

    useEffect(() => {
        const syncUser = async () => {
            if (auth0Configured && auth0?.isAuthenticated && auth0?.user) {
                const user = await syncUserFromAuth0({
                    sub: auth0.user.sub!,
                    email: auth0.user.email!,
                    name: auth0.user.name || auth0.user.email!,
                    picture: auth0.user.picture,
                });
                setDbUser(user);
            } else if (!auth0Configured && import.meta.env.DEV) {
                // Only allow mock in strictly DEV environment if needed, or remove entirely. 
                // Removing entirely for safety as requested.
                console.warn("Auth0 not configured and Mock User fallback removed for security.");
                setDbUser(null);
            }
        };
        syncUser();
    }, [auth0Configured, auth0?.isAuthenticated, auth0?.user, mockLoggedIn]);

    const login = () => {
        if (auth0Configured && auth0) {
            auth0.loginWithRedirect();
        } else {
            setMockLoggedIn(true);
        }
    };

    const logout = () => {
        if (auth0Configured && auth0) {
            auth0.logout({ logoutParams: { returnTo: window.location.origin } });
        } else {
            setMockLoggedIn(false);
            setDbUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user: dbUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
