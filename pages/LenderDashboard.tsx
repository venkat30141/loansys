import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { Loan, LoanStatus, Role } from '../types';
import { useAuth } from '../hooks/useAuth';
import ConfirmationModal from '../components/ConfirmationModal';

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

const LenderDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const { loans, users, updateLoanStatus, loading } = useData();
    const [selectedLoanDetails, setSelectedLoanDetails] = useState<Loan | null>(null);

     // State for confirmation modal
    const [confirmModalState, setConfirmModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        variant: 'neutral' as 'positive' | 'destructive' | 'neutral',
        confirmButtonText: 'Confirm'
    });
    
    if (!currentUser) return null; // Should be handled by ProtectedRoute

    const lenderLoans = loans.filter(loan => loan.lenderId === currentUser?.id);
    
    const handleFundLoan = (loan: Loan) => {
        setConfirmModalState({
            isOpen: true,
            title: 'Confirm Loan Funding',
            message: `Are you sure you want to fund the $${loan.amount.toLocaleString()} loan for ${findUserName(loan.borrowerId)}? This will transfer the funds and initiate the repayment schedule.`,
            onConfirm: () => confirmFundLoan(loan.id),
            variant: 'positive',
            confirmButtonText: 'Fund Loan'
        });
    };

    const closeConfirmModal = () => {
        setConfirmModalState({ ...confirmModalState, isOpen: false });
    };
    
    const confirmFundLoan = async (loanId: string) => {
        await updateLoanStatus(loanId, LoanStatus.Funded);
        closeConfirmModal();
    };

    const findUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'N/A';
    
    const totalInvested = lenderLoans.filter(l => l.status === LoanStatus.Repaying || l.status === LoanStatus.Paid || l.status === LoanStatus.Funded).reduce((sum, loan) => sum + loan.amount, 0);
    const activeLoans = lenderLoans.filter(l => l.status === LoanStatus.Repaying).length;
    const totalProfit = lenderLoans.reduce((totalProfitSum, loan) => {
        const principalPerPayment = loan.amount / loan.term;
        const profitFromThisLoan = loan.repaymentSchedule
            .filter(repayment => repayment.status === 'Paid')
            .reduce((loanProfitSum, repayment) => {
                const interestPortion = repayment.amount - principalPerPayment;
                return loanProfitSum + (interestPortion > 0 ? interestPortion : 0);
            }, 0);
        return totalProfitSum + profitFromThisLoan;
    }, 0);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lender Dashboard</h1>

            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Total Invested</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalInvested.toLocaleString()}</p>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Active Loans</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeLoans}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Total Profit</h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">${totalProfit.toFixed(2)}</p>
                </div>
            </div>

            {/* Assigned Loans */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">My Assigned Loans</h2>
                {lenderLoans.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Borrower</th>
                                    <th scope="col" className="px-6 py-3">Amount</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Progress</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lenderLoans.map(loan => {
                                    const paidRepayments = loan.repaymentSchedule.filter(r => r.status === 'Paid').length;
                                    const totalRepayments = loan.repaymentSchedule.length;
                                    const progress = totalRepayments > 0 ? (paidRepayments / totalRepayments) * 100 : 0;

                                    return (
                                    <tr key={loan.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4">{findUserName(loan.borrowerId)}</td>
                                        <td className="px-6 py-4">${loan.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${statusColors[loan.status]}`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(loan.status === LoanStatus.Repaying || loan.status === LoanStatus.Paid) && totalRepayments > 0 ? (
                                                <div>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{paidRepayments} / {totalRepayments} paid</span>
                                                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{progress.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                            {loan.status === LoanStatus.Approved && (
                                                <button onClick={() => handleFundLoan(loan)} className="font-medium text-green-600 dark:text-green-500 hover:underline disabled:opacity-50" disabled={loading}>
                                                    Fund Loan
                                                </button>
                                            )}
                                            {(loan.status === LoanStatus.Repaying || loan.status === LoanStatus.Paid) && (
                                                <button onClick={() => setSelectedLoanDetails(loan)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">
                                                    View Schedule
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">You have no assigned loans.</p>
                    </div>
                )}
            </div>

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
                            <p><strong>Borrower:</strong> {findUserName(selectedLoanDetails.borrowerId)}</p>
                            <p><strong>Amount:</strong> ${selectedLoanDetails.amount.toLocaleString()}</p>
                            <p><strong>Interest Rate:</strong> {selectedLoanDetails.interestRate}%</p>
                            <p><strong>Term:</strong> {selectedLoanDetails.term} months</p>
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
                                </li>
                            )) : <p className="text-sm text-gray-500 dark:text-gray-400">Repayment schedule not yet available.</p>}
                        </ul>
                    </div>
                </div>
            )}
            
            <ConfirmationModal 
                isOpen={confirmModalState.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModalState.onConfirm}
                title={confirmModalState.title}
                message={confirmModalState.message}
                variant={confirmModalState.variant}
                confirmButtonText={confirmModalState.confirmButtonText}
                isLoading={loading}
            />
        </div>
    );
};

export default LenderDashboard;