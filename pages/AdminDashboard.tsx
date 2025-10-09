import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { Loan, LoanStatus, Role, User } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import { useAuth } from '../hooks/useAuth';

const statusColors: { [key in LoanStatus]: string } = {
  [LoanStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [LoanStatus.Approved]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [LoanStatus.Funded]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [LoanStatus.Repaying]: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  [LoanStatus.Paid]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [LoanStatus.Rejected]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const AdminDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const { loans, users, updateLoanStatus, createUser, createLoan, loading } = useData();
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [selectedLender, setSelectedLender] = useState<string>('');
    
    // State for user creation modal
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState<Role | ''>('');
    const [newUserCreditScore, setNewUserCreditScore] = useState<number>(0);

    // State for loan creation modal
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const [newLoanAmount, setNewLoanAmount] = useState('');
    const [newLoanBorrowerId, setNewLoanBorrowerId] = useState('');
    const [newLoanInterestRate, setNewLoanInterestRate] = useState('');
    const [newLoanTerm, setNewLoanTerm] = useState('');


    // State for displaying new user credentials
    const [newUserCredentials, setNewUserCredentials] = useState<{ username: string, password: string } | null>(null);

    // State for confirmation modal
    const [confirmModalState, setConfirmModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        variant: 'neutral' as 'positive' | 'destructive' | 'neutral',
        confirmButtonText: 'Confirm'
    });

    // If an admin is logged in, use them. Otherwise, find the default admin user.
    // This allows the page to be viewed without authentication.
    const adminUser = currentUser && currentUser.role === Role.Admin
        ? currentUser
        : users.find(u => u.role === Role.Admin);

    const lenders = users.filter(user => user.role === Role.Lender);
    const borrowers = users.filter(user => user.role === Role.Borrower);

    const handleApprove = (loan: Loan) => {
        setConfirmModalState({
            isOpen: true,
            title: 'Confirm Loan Approval',
            message: `Are you sure you want to approve the $${loan.amount.toLocaleString()} loan for ${findUserName(loan.borrowerId)}?`,
            onConfirm: () => confirmApprove(loan.id),
            variant: 'positive',
            confirmButtonText: 'Approve'
        });
    };

    const handleReject = (loan: Loan) => {
        setConfirmModalState({
            isOpen: true,
            title: 'Confirm Loan Rejection',
            message: `Are you sure you want to reject the $${loan.amount.toLocaleString()} loan for ${findUserName(loan.borrowerId)}? This action cannot be undone.`,
            onConfirm: () => confirmReject(loan.id),
            variant: 'destructive',
            confirmButtonText: 'Reject'
        });
    };
    
    const closeConfirmModal = () => {
        setConfirmModalState({ ...confirmModalState, isOpen: false });
    };

    const confirmApprove = async (loanId: string) => {
        await updateLoanStatus(loanId, LoanStatus.Approved);
        closeConfirmModal();
    };

    const confirmReject = async (loanId: string) => {
        await updateLoanStatus(loanId, LoanStatus.Rejected);
        closeConfirmModal();
    };

    const handleAssignLender = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedLoan && selectedLender) {
            await updateLoanStatus(selectedLoan.id, selectedLoan.status, selectedLender);
            setSelectedLoan(null);
            setSelectedLender('');
        }
    };
    
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserName || !newUserEmail || !newUserRole) return;
        
        const newUser = await createUser({
            name: newUserName,
            email: newUserEmail,
            role: newUserRole,
            creditScore: newUserRole === Role.Borrower ? newUserCreditScore : 0,
        });

        setIsUserModalOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserRole('');
        setNewUserCreditScore(0);

        if (newUser && newUser.password) {
            setNewUserCredentials({ username: newUser.email, password: newUser.password });
        }
    };

    const handleCreateLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLoanAmount || !newLoanBorrowerId || !newLoanInterestRate || !newLoanTerm) return;

        await createLoan({
            amount: parseFloat(newLoanAmount),
            borrowerId: newLoanBorrowerId,
            interestRate: parseFloat(newLoanInterestRate),
            term: parseInt(newLoanTerm, 10),
        });

        setIsLoanModalOpen(false);
        setNewLoanAmount('');
        setNewLoanBorrowerId('');
        setNewLoanInterestRate('');
        setNewLoanTerm('');
    };

    const findUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'N/A';
    
    if (!adminUser && !loading) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold">Admin User Not Found</h1>
                <p className="text-gray-500 dark:text-gray-400">Could not find a default admin user in the system data.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

            {/* Loan Management */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Loan Management</h2>
                    <button onClick={() => setIsLoanModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">Create New Loan</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Borrower</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Lender</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loans.length > 0 ? loans.map(loan => (
                                <tr key={loan.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">{findUserName(loan.borrowerId)}</td>
                                    <td className="px-6 py-4">${loan.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${statusColors[loan.status]}`}>
                                            {loan.status}
                                        </span>
                                    </td>
                                     <td className="px-6 py-4">{loan.lenderId ? findUserName(loan.lenderId) : 'Unassigned'}</td>
                                    <td className="px-6 py-4 space-x-2">
                                        {loan.status === LoanStatus.Pending && (
                                            <>
                                                <button onClick={() => handleApprove(loan)} className="font-medium text-green-600 dark:text-green-500 hover:underline disabled:opacity-50" disabled={loading}>Approve</button>
                                                <button onClick={() => handleReject(loan)} className="font-medium text-red-600 dark:text-red-500 hover:underline disabled:opacity-50" disabled={loading}>Reject</button>
                                            </>
                                        )}
                                        {loan.status === LoanStatus.Approved && !loan.lenderId && (
                                            <button onClick={() => setSelectedLoan(loan)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline disabled:opacity-50" disabled={loading}>Assign Lender</button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">No loans found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* User Management */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">User Management</h2>
                    <button onClick={() => setIsUserModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">Create New User</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? users.map(user => (
                                <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{user.role}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Loan Modal */}
            {isLoanModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Create New Loan</h3>
                        <form onSubmit={handleCreateLoan}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Borrower</label>
                                    <select value={newLoanBorrowerId} onChange={e => setNewLoanBorrowerId(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                        <option value="" disabled>Select a borrower</option>
                                        {borrowers.map(borrower => (
                                            <option key={borrower.id} value={borrower.id}>{borrower.name} (Credit: {borrower.creditScore})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Loan Amount ($)</label>
                                    <input type="number" placeholder="5000" value={newLoanAmount} onChange={e => setNewLoanAmount(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interest Rate (%)</label>
                                    <input type="number" step="0.1" placeholder="5.5" value={newLoanInterestRate} onChange={e => setNewLoanInterestRate(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Term (months)</label>
                                    <input type="number" placeholder="12" value={newLoanTerm} onChange={e => setNewLoanTerm(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-6">
                                <button type="button" onClick={() => setIsLoanModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400" disabled={loading}>Create Loan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Lender Modal */}
            {selectedLoan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Assign Lender</h3>
                        <p className="mb-4">Assign a lender to the loan of ${selectedLoan.amount.toLocaleString()} for {findUserName(selectedLoan.borrowerId)}.</p>
                        <form onSubmit={handleAssignLender}>
                            <select value={selectedLender} onChange={(e) => setSelectedLender(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 mb-4">
                                <option value="" disabled>Select a lender</option>
                                {lenders.map(lender => (
                                    <option key={lender.id} value={lender.id}>{lender.name}</option>
                                ))}
                            </select>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setSelectedLoan(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400" disabled={!selectedLender || loading}>Assign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

             {/* Create User Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Create New User</h3>
                        <form onSubmit={handleCreateUser}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                    <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                    <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as Role)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                        <option value="" disabled>Select a role</option>
                                        {Object.values(Role).map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                                {newUserRole === Role.Borrower && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Credit Score</label>
                                        <input type="number" value={newUserCreditScore} onChange={e => setNewUserCreditScore(parseInt(e.target.value, 10))} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end space-x-2 mt-6">
                                <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400" disabled={loading}>Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New User Credentials Modal */}
            {newUserCredentials && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">User Created Successfully</h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">Please save these credentials. They will not be shown again.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username (Email)</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input type="text" readOnly value={newUserCredentials.username} className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-2" />
                                    <button onClick={() => navigator.clipboard.writeText(newUserCredentials.username)} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 text-gray-500 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                                        Copy
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input type="text" readOnly value={newUserCredentials.password} className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-2" />
                                    <button onClick={() => navigator.clipboard.writeText(newUserCredentials.password)} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 text-gray-500 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={() => setNewUserCredentials(null)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">Close</button>
                        </div>
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

export default AdminDashboard;