import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import BorrowerDashboard from './pages/BorrowerDashboard';
import LenderDashboard from './pages/LenderDashboard';
import AnalystDashboard from './pages/AnalystDashboard';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { Role } from './types';

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          <HashRouter>
            <div className="min-h-screen flex flex-col text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900">
              <Navbar />
              <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/borrower" element={<ProtectedRoute roles={[Role.Borrower]}><BorrowerDashboard /></ProtectedRoute>} />
                  <Route path="/lender" element={<ProtectedRoute roles={[Role.Lender]}><LenderDashboard /></ProtectedRoute>} />
                  <Route path="/analyst" element={<ProtectedRoute roles={[Role.Analyst]}><AnalystDashboard /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </HashRouter>
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;