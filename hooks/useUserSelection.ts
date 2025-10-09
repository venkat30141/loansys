import { useContext } from 'react';
import { UserSelectionContext } from '../contexts/UserSelectionContext';

export const useUserSelection = () => {
  const context = useContext(UserSelectionContext);
  if (context === undefined) {
    throw new Error('useUserSelection must be used within a UserSelectionProvider');
  }
  return context;
};
