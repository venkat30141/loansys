import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login, loading: isDataLoading } = useAuth();
  const navigate = useNavigate();

  // State for Forgot Password modal
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    const user = await login(email, password);
    setIsSubmitting(false);
    if (user) {
      switch (user.role) {
        case Role.Admin:
          navigate('/admin');
          break;
        case Role.Borrower:
          navigate('/borrower');
          break;
        case Role.Lender:
          navigate('/lender');
          break;
        case Role.Analyst:
          navigate('/analyst');
          break;
        default:
          navigate('/');
      }
    } else {
      setError('Login failed. Invalid email or password.');
    }
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('sending');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Password reset requested for: ${resetEmail}`);
    setResetStatus('sent');
  };
  
  const closeResetModal = () => {
    setIsForgotPasswordOpen(false);
    setTimeout(() => {
        setResetEmail('');
        setResetStatus('idle');
    }, 300); // allow for closing animation
  };


  const getButtonText = () => {
    if (isDataLoading) return 'Loading data...';
    if (isSubmitting) return 'Logging in...';
    return 'Login';
  }

  return (
    <>
      <div className="flex items-center justify-center mt-10">
        <div className="w-full max-w-md">
          <form 
            onSubmit={handleLogin} 
            className="bg-white dark:bg-gray-800 shadow-lg rounded-xl px-8 pt-6 pb-8 mb-4"
          >
            <h2 className="text-center text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
              Login
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******************"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 mb-1 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                required
              />
              <div className="text-right">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsForgotPasswordOpen(true);
                  }}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Forgot Password?
                </a>
              </div>
            </div>
            
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isDataLoading || isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300"
              >
                {getButtonText()}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Reset Your Password</h3>
            {resetStatus === 'sent' ? (
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  If an account with the email <strong>{resetEmail}</strong> exists, you will receive a password reset link shortly.
                </p>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={closeResetModal}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordResetRequest}>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                  Enter your email address and we will send you a link to reset your password.
                </p>
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={closeResetModal}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetStatus === 'sending' || !resetEmail}
                    className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {resetStatus === 'sending' ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;