import React from 'react';

type ConfirmButtonVariant = 'positive' | 'destructive' | 'neutral';

const buttonStyles: Record<ConfirmButtonVariant, string> = {
    positive: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    destructive: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    neutral: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
};

const iconContainerStyles: Record<ConfirmButtonVariant, string> = {
    positive: 'bg-green-100 dark:bg-green-900',
    destructive: 'bg-red-100 dark:bg-red-900',
    neutral: 'bg-indigo-100 dark:bg-indigo-900',
};

const iconStyles: Record<ConfirmButtonVariant, string> = {
    positive: 'text-green-600 dark:text-green-400',
    destructive: 'text-red-600 dark:text-red-400',
    neutral: 'text-indigo-600 dark:text-indigo-400',
};

const icons: Record<ConfirmButtonVariant, React.ReactNode> = {
    positive: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
    ),
    destructive: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    neutral: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};


interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isLoading?: boolean;
  variant?: ConfirmButtonVariant;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  isLoading = false,
  variant = 'neutral',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex items-start">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${iconContainerStyles[variant]}`}>
                <div className={iconStyles[variant]}>
                    {icons[variant]}
                </div>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white" id="modal-title">
                    {title}
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                        {message}
                    </p>
                </div>
            </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed ${buttonStyles[variant]}`}
          >
            {isLoading ? 'Processing...' : confirmButtonText}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            {cancelButtonText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
            0% {
                transform: scale(0.95);
                opacity: 0;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        .animate-fade-in-scale {
            animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;
