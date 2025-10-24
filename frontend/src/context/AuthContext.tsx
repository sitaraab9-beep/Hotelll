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
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
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
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      setUser(data.user);
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, role })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      setUser(data.user);
    } else {
      throw new Error(data.message || 'Registration failed');
    }
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