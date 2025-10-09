import React, { useMemo } from 'react';
import { useData } from '../hooks/useData';
import { LoanStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AIAnalystAssistant from '../components/AIAnalystAssistant';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d'];

const AnalystDashboard: React.FC = () => {
    const { loans, users, loading } = useData();

    const loanStatusData = useMemo(() => {
        const statusCounts = loans.reduce((acc, loan) => {
            acc[loan.status] = (acc[loan.status] || 0) + 1;
            return acc;
        }, {} as Record<LoanStatus, number>);

        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [loans]);

    const loanAmountDistribution = useMemo(() => {
        const bins = [
            { name: '< $5k', count: 0 },
            { name: '$5k - $10k', count: 0 },
            { name: '$10k - $20k', count: 0 },
            { name: '> $20k', count: 0 },
        ];
        loans.forEach(loan => {
            if (loan.amount < 5000) bins[0].count++;
            else if (loan.amount <= 10000) bins[1].count++;
            else if (loan.amount <= 20000) bins[2].count++;
            else bins[3].count++;
        });
        return bins;
    }, [loans]);
    
    const borrowerCreditScoreData = useMemo(() => {
        const borrowers = users.filter(u => u.role === 'Borrower');
        const bins = [
            { name: '< 670 (Poor)', count: 0},
            { name: '670-739 (Good)', count: 0},
            { name: '740-799 (V. Good)', count: 0},
            { name: '> 800 (Excellent)', count: 0},
        ];
        borrowers.forEach(b => {
            if (b.creditScore < 670) bins[0].count++;
            else if (b.creditScore <= 739) bins[1].count++;
            else if (b.creditScore <= 799) bins[2].count++;
            else bins[3].count++;
        });
        return bins;
    }, [users]);


    if (loading) return <div>Loading analytics...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AIAnalystAssistant />

                {/* Loan Status Distribution */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Loan Status Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={loanStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                {loanStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Loan Amount Distribution */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Loan Amount Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={loanAmountDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#82ca9d" name="Number of Loans" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                 {/* Borrower Credit Scores */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Borrower Credit Score Distribution</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={borrowerCreditScoreData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="Number of Borrowers" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalystDashboard;