import React, { createContext, useState, useEffect } from 'react';
import { Loan, User, LoanStatus } from '../types';
import { MOCK_LOANS, MOCK_USERS } from '../utils/mockData';

interface DataContextType {
  loans: Loan[];
  users: User[];
  loading: boolean;
  updateLoanStatus: (loanId: string, newStatus: LoanStatus, lenderId?: string) => Promise<void>;
  createLoan: (loanData: Omit<Loan, 'id' | 'status' | 'requestDate' | 'repaymentSchedule'>) => Promise<void>;
  addRepayment: (loanId: string, amount: number) => Promise<void>;
  createUser: (userData: Omit<User, 'id' | 'password'>) => Promise<User>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await new Promise(res => setTimeout(res, 500));
      setLoans(MOCK_LOANS);
      setUsers(MOCK_USERS);
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  const updateLoanStatus = async (loanId: string, newStatus: LoanStatus, lenderId?: string) => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 500));
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.id === loanId) {
          const updatedLoan = { ...loan, status: newStatus };
          if (lenderId) {
            updatedLoan.lenderId = lenderId;
          }
          if (newStatus === LoanStatus.Funded) {
             updatedLoan.status = LoanStatus.Repaying;
             const monthlyPayment = (updatedLoan.amount * (1 + updatedLoan.interestRate / 100)) / updatedLoan.term;
             updatedLoan.repaymentSchedule = Array.from({ length: updatedLoan.term }, (_, i) => {
                const dueDate = new Date();
                dueDate.setMonth(dueDate.getMonth() + i + 1);
                return {
                    id: `repay-${loanId}-${i}`,
                    amount: parseFloat(monthlyPayment.toFixed(2)),
                    date: dueDate.toISOString().split('T')[0],
                    status: 'Due'
                };
             });
          }
          return updatedLoan;
        }
        return loan;
      })
    );
    setLoading(false);
  };

  const createLoan = async (loanData: Omit<Loan, 'id' | 'status' | 'requestDate' | 'repaymentSchedule'>) => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 500));
    const newLoan: Loan = {
      ...loanData,
      id: `loan-${Date.now()}`,
      status: LoanStatus.Pending,
      requestDate: new Date().toISOString().split('T')[0],
      repaymentSchedule: [],
    };
    setLoans(prevLoans => [...prevLoans, newLoan]);
    setLoading(false);
  };
  
  const addRepayment = async (loanId: string, amount: number) => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 500));
    setLoans(prevLoans => 
      prevLoans.map(loan => {
        if (loan.id === loanId) {
          const updatedLoan = { ...loan };
          const firstDueRepayment = updatedLoan.repaymentSchedule.find(r => r.status === 'Due');
          if (firstDueRepayment && amount >= firstDueRepayment.amount) {
            firstDueRepayment.status = 'Paid';
            firstDueRepayment.date = new Date().toISOString().split('T')[0];
          }

          const allPaid = updatedLoan.repaymentSchedule.every(r => r.status === 'Paid');
          if (allPaid) {
            updatedLoan.status = LoanStatus.Paid;
          }
          return updatedLoan;
        }
        return loan;
      })
    );
    setLoading(false);
  };

  const createUser = async (userData: Omit<User, 'id' | 'password'>): Promise<User> => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 500));
    const password = Math.random().toString(36).slice(2, 10); // Generate 8 char random password
    const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        password,
    };
    
    // Store the full user object, including the password for the new login flow.
    setUsers(prevUsers => [...prevUsers, newUser]);
    
    setLoading(false);
    return newUser; // Return user with password to be displayed once.
  };

  const value = { loans, users, loading, updateLoanStatus, createLoan, addRepayment, createUser };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};