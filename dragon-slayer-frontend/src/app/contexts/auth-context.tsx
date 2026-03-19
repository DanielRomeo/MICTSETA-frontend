// app/contexts/auth-context.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

interface User {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'student' | 'lecturer';
    avatarUrl?: string;
    authProvider?: 'local' | 'google';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    getToken: () => Promise<string | null>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // -------------------------------------------------------------------------
    // Fetch user data from /api/auth/me (proxies to backend GET /users/me)
    // Backend returns: { statusCode: 200, data: { id, email, role, ... } }
    // -------------------------------------------------------------------------
    const fetchUserData = async (token: string): Promise<User | null> => {
        console.log('Fetching user data with token:', token);
        try {
            const response = await axios.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('Raw response from /api/auth/me:', response);

            const raw = response.data?.data ?? response.data;

            if (!raw?.id) return null;

            return {
                id: raw.id,
                email: raw.email,
                firstName: raw.firstName ?? undefined,
                lastName: raw.lastName ?? undefined,
                role: raw.role ?? 'student',
                avatarUrl: raw.avatarUrl ?? undefined,
                authProvider: raw.authProvider ?? 'local',
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    };

    // -------------------------------------------------------------------------
    // On mount: restore session from localStorage
    // Also handles Google OAuth callback (?token=xxx in URL)
    // -------------------------------------------------------------------------
    useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true);

            // Check for Google OAuth callback token in URL
            const params = new URLSearchParams(window.location.search);
            const googleToken = params.get('token');

            if (googleToken) {
                localStorage.setItem('access_token', googleToken);
                // Clean the token out of the URL
                window.history.replaceState({}, '', window.location.pathname);
            }

            const token = googleToken || localStorage.getItem('access_token');

            if (token) {
                const userData = await fetchUserData(token);
                if (userData) {
                    setUser(userData);
                } else {
                    localStorage.removeItem('access_token');
                }
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    // -------------------------------------------------------------------------
    // Axios interceptor — attach token to every request automatically
    // -------------------------------------------------------------------------
    useEffect(() => {
        const interceptor = axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('access_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => axios.interceptors.request.eject(interceptor);
    }, []);

    const getToken = async () => localStorage.getItem('access_token');

    // -------------------------------------------------------------------------
    // Local email/password login
    // -------------------------------------------------------------------------
   const login = async (email: string, password: string) => {
    try {
        const response = await axios.post('/api/auth/login', { email, password });
        const accessToken = response.data?.data?.access_token;
        if (!accessToken) throw new Error('No access token received');

        localStorage.setItem('access_token', accessToken);

        const userData = await fetchUserData(accessToken);
        if (!userData) throw new Error('Failed to fetch user data after login');

        setUser(userData);
        router.push('/dashboard');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response) throw new Error('Network error - No server response');
            const errorMessages: Record<number, string> = {
                401: 'Invalid email or password',
                404: 'Login service not found',
                500: 'Server error - Please try again later',
            };
            throw new Error(errorMessages[error.response.status] || 'Login failed');
        }
        throw new Error('An unexpected error occurred during login');
    }
};

    
    const logout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
        router.push('/signin');
    };

    if (isLoading) {
        return null;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                getToken,
                login,
                // loginWithGoogle,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};