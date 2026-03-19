// app/contexts/auth-context.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
	id: number;
	email: string;
	role: 'student' | 'instructor' | 'admin';
	firstName?: string;
	lastName?: string;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	getToken: () => string | null;
	login: (email: string, password: string) => Promise<void>;
	signup: (email: string, password: string, role?: string) => Promise<void>;
	logout: () => void;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	// Fetch user data from backend
	const fetchUserData = async (token: string): Promise<User | null> => {
		try {
			const response = await axios.get('/api/auth/me', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// console.log('Fetched user data:', response);
			if (response.status === 200 && response.data) {
				return {
					id: response.data.data.id,
					email: response.data.data.email,
					role: response.data.data.role,
				};
			}
			return null;
		} catch (error) {
			console.error('Error fetching user data:', error);
			return null;
		}
	};

	// Refresh user data - memoized with useCallback
	const refreshUser = useCallback(async () => {
		const token = localStorage.getItem('access_token');
		if (token) {
			const userData = await fetchUserData(token);
			// console.log('Setting user data in refreshUser:', userData);
			setUser(userData);
		}
	}, []);

	// Initialize auth on mount
	useEffect(() => {
		const initializeAuth = async () => {
			setIsLoading(true);
			const token = localStorage.getItem('access_token');

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

	// Axios interceptor to add token to requests
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

		return () => {
			axios.interceptors.request.eject(interceptor);
		};
	}, []);

	const getToken = (): string | null => {
		return localStorage.getItem('access_token');
	};

	const login = async (email: string, password: string) => {
		try {
			const response = await axios.post('/api/auth/login', {
				email,
				password,
			});

			const accessToken = response.data.data.access_token;
			if (!accessToken) {
				throw new Error('No access token received from server');
			}

			// Save token
			localStorage.setItem('access_token', accessToken);

			// Fetch user data
			const userData = await fetchUserData(accessToken);
			if (!userData) {
				throw new Error('Failed to fetch user data after login');
			}

			setUser(userData);

			// navigate based on role:
			// Navigate based on role
			if (userData.role === 'instructor') {
				router.push('/dashboard');
			} else {
				router.push('/dashboard');
			}
		} catch (error) {
			console.error('Login error:', error);
			localStorage.removeItem('access_token');

			if (axios.isAxiosError(error)) {
				if (!error.response) {
					throw new Error('Network error - No server response');
				}

				const errorMessages: Record<number, string> = {
					401: 'Invalid email or password',
					404: 'Login service not found',
					422: 'Invalid input - Please check your email and password',
					500: 'Server error - Please try again later',
				};

				throw new Error(
					errorMessages[error.response.status] ||
						error.response.data?.message ||
						'Login failed'
				);
			}

			throw new Error('An unexpected error occurred during login');
		}
	};

	const signup = async (email: string, password: string, role: string = 'student') => {
		try {
			const response = await axios.post('/api/auth/signup', {
				email,
				password,
				role,
			});

			if (response.status === 201) {
				// Auto-login after signup
				await login(email, password);
			}
		} catch (error) {
			console.error('Signup error:', error);

			if (axios.isAxiosError(error)) {
				if (!error.response) {
					throw new Error('Network error - No server response');
				}

				const errorMessages: Record<number, string> = {
					409: 'Email already exists',
					422: 'Invalid input - Please check your details',
					500: 'Server error - Please try again later',
				};

				throw new Error(
					errorMessages[error.response.status] ||
						error.response.data?.message ||
						'Signup failed'
				);
			}

			throw new Error('An unexpected error occurred during signup');
		}
	};

	const logout = () => {
		localStorage.removeItem('access_token');
		setUser(null);
		router.push('/signin');
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				isLoading,
				getToken,
				login,
				signup,
				logout,
				refreshUser,
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
