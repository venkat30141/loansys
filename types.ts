
export enum Role {
  Admin = 'Admin',
  Borrower = 'Borrower',
  Lender = 'Lender',
  Analyst = 'Analyst',
}

export enum LoanStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Funded = 'Funded',
  Repaying = 'Repaying',
  Paid = 'Paid',
  Rejected = 'Rejected',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  creditScore: number;
  password: string;
}

export interface Repayment {
  id:string;
  amount: number;
  date: string;
  status: 'Paid' | 'Due';
}

export interface Loan {
  id: string;
  amount: number;
  borrowerId: string;
  lenderId?: string;
  status: LoanStatus;
  requestDate: string;
  repaymentSchedule: Repayment[];
  interestRate: number;
  term: number; // in months
}