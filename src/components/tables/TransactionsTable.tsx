'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TransactionsTable() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        setTransactions(data?.recentTransactions || []);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Transactions</h2>
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="text-left py-2">Date</th>
            <th className="text-left py-2">Description</th>
            <th className="text-left py-2">Category</th>
            <th className="text-right py-2">Amount</th>
            <th className="text-left py-2">Type</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500">
                No transactions
              </td>
            </tr>
          ) : (
            transactions.map((transaction, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-2">{transaction.date}</td>
                <td className="py-2">{transaction.description}</td>
                <td className="py-2">{transaction.category}</td>
                <td className={`py-2 text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                </td>
                <td className="py-2">{transaction.type}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
