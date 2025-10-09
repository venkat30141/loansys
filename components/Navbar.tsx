import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Role } from '../types';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              LoanSys
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
             {currentUser?.role === Role.Admin && <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">Admin</Link>}
            {currentUser?.role === Role.Borrower && <Link to="/borrower" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">Borrower</Link>}
            {currentUser?.role === Role.Lender && <Link to="/lender" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">Lender</Link>}
            {currentUser?.role === Role.Analyst && <Link to="/analyst" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">Analyst</Link>}
            
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Welcome, {currentUser.name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">Admin</Link>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Login
                </Link>
              </div>
            )}

            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;