import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function RepayLoan() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    amount: '',
    paymentMethod: 'mpesa'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch loan details
  useEffect(() => {
    async function fetchLoan() {
      try {
        const res = await fetch(`http://localhost:5000/api/loans/${loanId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLoan(data);
        }
      } catch (err) {
        setError('Failed to fetch loan details');
      }
    }
    fetchLoan();
  }, [loanId]);

  // Fetch payment history
  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch(`http://localhost:5000/api/payments/history/${loanId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPayments(data);
        }
      } catch (err) {
        console.error('Failed to fetch payment history');
      }
    }
    fetchPayments();
  }, [loanId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/payments/make-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          loanId,
          amount: Number(form.amount),
          paymentMethod: form.paymentMethod
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess('Payment processed successfully!');
        setForm({ amount: '', paymentMethod: 'mpesa' });
        // Update loan balance
        setLoan(prev => ({
          ...prev,
          remaining_balance: data.remaining_balance
        }));
        // Add new payment to history
        setPayments(prev => [data.payment, ...prev]);
      } else {
        setError(data.message || 'Failed to process payment');
      }
    } catch (err) {
      setError('Failed to process payment');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  if (!loan) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Loan Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-blue-800">Loan Details</h2>
          <div className="space-y-3">
            <p>
              <span className="font-semibold">Total Amount:</span> KES {loan.amount?.toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Remaining Balance:</span> KES {loan.remaining_balance?.toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{' '}
              <span className={`px-2 py-1 rounded text-sm ${
                loan.status === 'completed' ? 'bg-green-100 text-green-800' :
                loan.status === 'active' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {loan.status}
              </span>
            </p>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-blue-800">Make Payment</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Amount (KES)</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                min="0"
                max={loan.remaining_balance}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Payment Method</label>
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="mpesa">M-PESA</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading || loan.status === 'completed'}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Make Payment'}
            </button>
          </form>
        </div>
      </div>

      {/* Payment History */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    KES {payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-sm ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.transaction_reference}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No payment history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
