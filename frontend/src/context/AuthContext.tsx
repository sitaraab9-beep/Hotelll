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
        const savedUserData = localStorage.getItem('userData');
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);
          setUser(userData);
        } else {
          // No saved data, clear token
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Mock authentication - works immediately
    if (email && password) {
      // Try to find existing user in all registered users
      const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
      let mockUser = allUsers.find((u: User) => u.email === email);
      
      console.log('Login attempt for:', email);
      console.log('All users:', allUsers);
      console.log('Found user:', mockUser);
      
      if (!mockUser) {
        // User not found, create new customer
        mockUser = {
          id: Date.now().toString(),
          name: email.split('@')[0],
          email: email,
          role: 'customer' as const
        };
        allUsers.push(mockUser);
        localStorage.setItem('allUsers', JSON.stringify(allUsers));
        console.log('Created new customer user:', mockUser);
      }
      
      const mockToken = 'mock-token-' + Date.now();
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('userData', JSON.stringify(mockUser));
      setUser(mockUser);
      console.log('Login successful, user set to:', mockUser);
      return;
    }
    throw new Error('Please enter email and password');
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    // Mock registration - works immediately
    if (name && email && password) {
      const mockUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        role: (role as 'customer' | 'manager' | 'admin') || 'customer'
      };
      const mockToken = 'mock-token-' + Date.now();
      
      console.log('Registering user with role:', role, 'Final user:', mockUser);
      
      // Save user to all users list
      const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
      // Remove existing user with same email if exists
      const filteredUsers = allUsers.filter((u: any) => u.email !== email);
      filteredUsers.push(mockUser);
      localStorage.setItem('allUsers', JSON.stringify(filteredUsers));
      
      // Save current user data
      localStorage.setItem('token', mockToken);
      localStorage.setItem('userData', JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }
    throw new Error('Please fill all fields');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
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