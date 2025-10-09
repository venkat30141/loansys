import React, { createContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useData } from '../hooks/useData';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  availableUsers: User[];
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const { users: availableUsers, loading } = useData();

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = availableUsers.find(u => u.email === email && u.password === password);
        if (user) {
          setCurrentUser(user);
          resolve(user);
        } else {
          resolve(null);
        }
      }, 500);
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const value = { currentUser, login, logout, availableUsers, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};