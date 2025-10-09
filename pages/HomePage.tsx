import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow-2xl max-w-2xl transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          Welcome to <span className="text-indigo-600 dark:text-indigo-400">LoanSys</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          The all-in-one platform for managing loans seamlessly. Whether you're a borrower, lender, or administrator, we have the tools you need to succeed.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/login"
            className="px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
          >
            Get Started
          </Link>
          <Link
            to="/admin"
            className="px-8 py-3 text-lg font-semibold text-gray-700 bg-gray-200 dark:text-gray-200 dark:bg-gray-700 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
          >
            View Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}