import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'manager' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      // Mock profile fetch
      if (token.startsWith('mock-token-')) {
        const mockUser = {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'customer' as const
        };
        setUser(mockUser);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Mock authentication - works immediately
    if (email && password) {
      const mockUser = {
        id: '1',
        name: email.split('@')[0],
        email: email,
        role: 'customer' as const
      };
      const mockToken = 'mock-token-' + Date.now();
      
      localStorage.setItem('token', mockToken);
      setUser(mockUser);
      return;
    }
    throw new Error('Please enter email and password');
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    // Mock registration - works immediately
    if (name && email && password) {
      const mockUser = {
        id: '1',
        name: name,
        email: email,
        role: (role as 'customer' | 'manager' | 'admin') || 'customer'
      };
      const mockToken = 'mock-token-' + Date.now();
      
      localStorage.setItem('token', mockToken);
      setUser(mockUser);
      return;
    }
    throw new Error('Please fill all fields');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};