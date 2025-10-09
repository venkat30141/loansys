import React, { createContext, useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { useData } from '../hooks/useData';

interface UserSelectionContextType {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  availableUsers: User[];
}

export const UserSelectionContext = createContext<UserSelectionContextType | undefined>(undefined);

export const UserSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users: availableUsers } = useData();

  const [selectedUser, setSelectedUserInternal] = useState<User | null>(() => {
    try {
        const storedUser = sessionStorage.getItem('selectedUser');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Failed to parse selected user from sessionStorage", error);
        return null;
    }
  });

  useEffect(() => {
    if (!selectedUser && availableUsers.length > 0) {
      // Default to first user if none selected
      setSelectedUserInternal(availableUsers[0]);
    }
  }, [availableUsers, selectedUser]);

  const setSelectedUser = (user: User | null) => {
    setSelectedUserInternal(user);
    if (user) {
      sessionStorage.setItem('selectedUser', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('selectedUser');
    }
  };
  
  const value = useMemo(() => ({ selectedUser, setSelectedUser, availableUsers }), [selectedUser, availableUsers]);

  return <UserSelectionContext.Provider value={value}>{children}</UserSelectionContext.Provider>;
};
