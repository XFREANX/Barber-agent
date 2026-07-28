import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginData, RegisterData, UpdateProfileData } from '../types/index';
import { loginUser, registerUser, fetchCurrentUser, updateProfile } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateUser: (data: UpdateProfileData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'barber_app_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  // Verify stored token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser(storedToken);
        setUser(currentUser);
        setToken(storedToken);
      } catch {
        // Token is invalid or expired
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = useCallback(async (data: LoginData) => {
    const response = await loginUser(data);
    localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.data);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response = await registerUser(data);
    localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.data);
  }, []);

  const updateUser = useCallback(async (data: UpdateProfileData) => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (!currentToken) {
      throw new Error('No authentication token found');
    }
    const updatedUser = await updateProfile(currentToken, data);
    setUser(updatedUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

