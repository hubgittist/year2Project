import React, { useState, useEffect } from "react";

export default function PendingLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingLoan, setProcessingLoan] = useState(null);

  useEffect(() => {
    fetchPendingLoans();
  }, []);

  async function fetchPendingLoans() {
    try {
      const res = await fetch("http://localhost:5000/api/loans/pending", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLoans(data);
      } else {
        setError("Failed to fetch pending loans");
      }
    } catch (err) {
      setError("Failed to fetch pending loans");
    } finally {
      setLoading(false);
    }
  }

  async function processLoan(loanId, action, note) {
    if (!note) {
      return setError("Please provide a note explaining your decision");
    }
    
    setProcessingLoan(loanId);
    setError("");
    
    try {
      const res = await fetch(`http://localhost:5000/api/loans/${loanId}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ action, note }),
      });

      if (res.ok) {
        // Remove the processed loan from the list
        setLoans(loans.filter(loan => loan.id !== loanId));
      } else {
        const data = await res.json();
        setError(data.message || "Failed to process loan");
      }
    } catch (err) {
      setError("Failed to process loan");
    } finally {
      setProcessingLoan(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Loading pending loans...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Pending Loan Applications</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {loans.length === 0 ? (
        <div className="text-center text-gray-600 p-8">
          No pending loan applications
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <h3 className="font-semibold text-lg">
                  {loan.user.fullName}
                </h3>
                <p className="text-sm text-gray-600">{loan.user.email}</p>
                {loan.user.phoneNumber && (
                  <p className="text-sm text-gray-600">{loan.user.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <p>
                  <span className="font-medium">Amount:</span> KES{" "}
                  {loan.amount.toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Term:</span> {loan.term} months
                </p>
                <p>
                  <span className="font-medium">Interest Rate:</span>{" "}
                  {loan.interest_rate}%
                </p>
                <p>
                  <span className="font-medium">Total Repayment:</span> KES{" "}
                  {loan.total_repayment_amount.toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Purpose:</span>
                  <br />
                  {loan.purpose}
                </p>
                <p className="text-sm text-gray-600">
                  Applied on: {new Date(loan.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-3">
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Add a note about your decision..."
                  rows="2"
                  id={`note-${loan.id}`}
                ></textarea>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => processLoan(
                      loan.id,
                      'approve',
                      document.getElementById(`note-${loan.id}`).value
                    )}
                    disabled={processingLoan === loan.id}
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {processingLoan === loan.id ? "Processing..." : "Approve"}
                  </button>
                  
                  <button
                    onClick={() => processLoan(
                      loan.id,
                      'reject',
                      document.getElementById(`note-${loan.id}`).value
                    )}
                    disabled={processingLoan === loan.id}
                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {processingLoan === loan.id ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
