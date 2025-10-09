import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { Loan, LoanStatus, Role } from '../types';
import { useAuth } from '../hooks/useAuth';


const statusColors: { [key in LoanStatus]: string } = {
  [LoanStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [LoanStatus.Approved]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [LoanStatus.Funded]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [LoanStatus.Repaying]: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  [LoanStatus.Paid]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [LoanStatus.Rejected]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const CheckCircleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const ClockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
);

const BorrowerDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const { loans, users, createLoan, addRepayment, loading } = useData();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
    const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
    const [loanAmount, setLoanAmount] = useState('');
    const [loanTerm, setLoanTerm] = useState('');
    const [loanInterestRate, setLoanInterestRate] = useState('');
    const [repaymentAmount, setRepaymentAmount] = useState<number>(0);
    const [selectedLoanDetails, setSelectedLoanDetails] = useState<Loan | null>(null);
    
    if (!currentUser) return null; // Should be handled by ProtectedRoute

    const borrowerLoans = loans.filter(loan => loan.borrowerId === currentUser?.id);
    const totalLoans = borrowerLoans.length;
    const activeLoans = borrowerLoans.filter(loan => loan.status === LoanStatus.Repaying).length;
    
    const handleRequestLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser) {
            await createLoan({
                amount: parseFloat(loanAmount),
                borrowerId: currentUser.id,
                interestRate: parseFloat(loanInterestRate),
                term: parseInt(loanTerm),
            });
            setIsRequestModalOpen(false);
            setLoanAmount('');
            setLoanTerm('');
            setLoanInterestRate('');
        }
    };
    
    const handleRepay = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedLoanId) {
            await addRepayment(selectedLoanId, repaymentAmount);
            setIsRepayModalOpen(false);
            
            // Refresh loan details in modal after repayment
            const updatedLoan = loans.find(l => l.id === selectedLoanDetails?.id);
            if(updatedLoan) {
                // This will not re-render immediately as loans is from context. A better solution would involve re-fetching or a more complex state management.
                // For this mock setup, we can manually update the selected loan details.
                const refreshedLoan = { ...updatedLoan };
                const firstDue = refreshedLoan.repaymentSchedule.find(r => r.status === 'Due');
                if (firstDue) firstDue.status = 'Paid';
                const allPaid = refreshedLoan.repaymentSchedule.every(r => r.status === 'Paid');
                if (allPaid) refreshedLoan.status = LoanStatus.Paid;
                setSelectedLoanDetails(refreshedLoan);
            }
            setSelectedLoanId(null);
        }
    };

    const openRepayModal = (loanId: string) => {
        const loan = borrowerLoans.find(l => l.id === loanId);
        const dueRepayment = loan?.repaymentSchedule.find(r => r.status === 'Due');
        if (dueRepayment) {
            setRepaymentAmount(dueRepayment.amount);
            setSelectedLoanId(loanId);
            setIsRepayModalOpen(true);
        }
    };

    const findUserName = (userId?: string) => users.find(u => u.id === userId)?.name || 'N/A';

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Loans</h1>
                <button onClick={() => setIsRequestModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">Request New Loan</button>
            </div>

            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Total Loans</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalLoans}</p>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Active Loans</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeLoans}</p>
                </div>
            </div>

            {borrowerLoans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {borrowerLoans.map(loan => (
                        <div key={loan.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">${loan.amount.toLocaleString()}</h3>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[loan.status]}`}>{loan.status}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Lender: {findUserName(loan.lenderId)}</p>
                                 <p className="text-sm text-gray-500 dark:text-gray-400">Term: {loan.term} months @ {loan.interestRate}%</p>
                            </div>
                             <div className="mt-4">
                                {(loan.status === LoanStatus.Repaying || loan.status === LoanStatus.Paid) && (
                                     <button onClick={() => setSelectedLoanDetails(loan)} className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 dark:bg-gray-700 dark:text-indigo-400 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        View Details
                                    </button>
                                )}
                             </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No loans yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by requesting a new loan.</p>
                    <div className="mt-6">
                        <button
                            onClick={() => setIsRequestModalOpen(true)}
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Request New Loan
                        </button>
                    </div>
                </div>
            )}
            
            {/* Loan Request Modal */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">New Loan Request</h3>
                        <form onSubmit={handleRequestLoan}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Loan Amount ($)</label>
                                    <input id="loanAmount" type="number" placeholder="e.g., 5000" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} required className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <div>
                                    <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Term (months)</label>
                                    <input id="loanTerm" type="number" placeholder="e.g., 12" value={loanTerm} onChange={e => setLoanTerm(e.target.value)} required className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <div>
                                    <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Desired Interest Rate (%)</label>
                                    <input id="interestRate" type="number" step="0.1" placeholder="e.g., 5.5" value={loanInterestRate} onChange={e => setLoanInterestRate(e.target.value)} required className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-6">
                                <button type="button" onClick={() => setIsRequestModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={loading}>Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Repayment Modal */}
            {isRepayModalOpen && selectedLoanId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Make Repayment</h3>
                        <form onSubmit={handleRepay}>
                            <p className="mb-4">You are about to pay ${repaymentAmount} for your loan.</p>
                             <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsRepayModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded" disabled={loading}>Confirm Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Loan Details Modal */}
            {selectedLoanDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Loan Details & Schedule</h3>
                            <button onClick={() => setSelectedLoanDetails(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mb-4">
                            <p><strong>Amount:</strong> ${selectedLoanDetails.amount.toLocaleString()}</p>
                            <p><strong>Interest Rate:</strong> {selectedLoanDetails.interestRate}%</p>
                            <p><strong>Term:</strong> {selectedLoanDetails.term} months</p>
                            <p><strong>Lender:</strong> {findUserName(selectedLoanDetails.lenderId)}</p>
                        </div>
                        <h4 className="font-semibold mb-2">Repayment Schedule</h4>
                        <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
                            {selectedLoanDetails.repaymentSchedule.length > 0 ? selectedLoanDetails.repaymentSchedule.map(repayment => (
                                <li key={repayment.id} className={`flex items-center justify-between rounded-lg p-3 ${repayment.status === 'Due' ? 'bg-yellow-100 dark:bg-yellow-500/20 border border-yellow-200 dark:border-yellow-500/30' : ''}`}>
                                    <div className="flex items-center">
                                        {repayment.status === 'Paid' ? <CheckCircleIcon /> : <ClockIcon />}
                                        <div className="ml-3">
                                            <p className={`text-sm font-medium ${repayment.status === 'Paid' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                                ${repayment.amount.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {repayment.status === 'Paid' ? `Paid on ${new Date(repayment.date).toLocaleDateString()}` : `Due on ${new Date(repayment.date).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                    </div>
                                    {repayment.status === 'Due' && (
                                        <button onClick={() => openRepayModal(selectedLoanDetails.id)} className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 disabled:bg-gray-400" disabled={loading}>
                                            Pay Now
                                        </button>
                                    )}
                                </li>
                            )) : <p className="text-sm text-gray-500 dark:text-gray-400">Repayment schedule will be generated upon funding.</p>}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BorrowerDashboard;