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
    // Initialize persistent users that survive deployments
    let allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    
    const persistentUsers = [
      {
        id: 'manager1',
        name: 'Hotel Manager',
        email: 'hman@gmail.com',
        role: 'manager'
      },
      {
        id: 'admin1',
        name: 'System Admin',
        email: 'admin@gmail.com',
        role: 'admin'
      },
      {
        id: 'user1',
        name: 'Savita User',
        email: 'user@gmail.com',
        role: 'customer'
      }
    ];
    
    // Always ensure persistent users exist
    persistentUsers.forEach(persistentUser => {
      const existingIndex = allUsers.findIndex((u: any) => u.email === persistentUser.email);
      if (existingIndex === -1) {
        allUsers.push(persistentUser);
      } else {
        // Update existing user to ensure role is correct
        allUsers[existingIndex] = persistentUser;
      }
    });
    
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
    
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
      const mockUser = allUsers.find((u: User) => u.email === email);
      
      if (!mockUser) {
        throw new Error('User not found. Please register first.');
      }
      
      const mockToken = 'mock-token-' + Date.now();
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('userData', JSON.stringify(mockUser));
      setUser(mockUser);
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
      
      // Save user to all users list with persistence
      const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
      // Remove existing user with same email if exists
      const filteredUsers = allUsers.filter((u: any) => u.email !== email);
      filteredUsers.push(mockUser);
      localStorage.setItem('allUsers', JSON.stringify(filteredUsers));
      
      // Also save to a backup storage for persistence
      localStorage.setItem('registeredUsers', JSON.stringify(filteredUsers));
      
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