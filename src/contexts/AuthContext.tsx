import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, RoleType } from '../types';
import usersData from '../data/users.json';

interface LoginCredentials {
  email: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'krishimitra-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedSession) {
        const parsedUser = JSON.parse(storedSession) as User;
        setUser(parsedUser);
      }
    } catch (err) {
      console.error('Failed to parse auth session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    return new Promise<void>((resolve, reject) => {
      // Simulate slight network delay
      setTimeout(() => {
        const foundUser = usersData.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );

        if (foundUser) {
          const authUser: User = {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role as RoleType,
            department: foundUser.department,
            designation: foundUser.designation,
          };
          
          setUser(authUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          resolve();
        } else {
          reject(new Error('Invalid Government Email ID or Password.'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
