import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaMoneyBillWave, FaCreditCard } from "react-icons/fa";

export default function Overview() {
  const [data, setData] = useState({
    loans: { total: 0, pendingApprovals: 0 },
    payments: { total: 0, recentCount: 0 },
    recentMembers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const localhost = process.env.VITE_PUBLIC_URL

  async function fetchOverviewData() {
    try {
      const res = await fetch(`${localhost}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const overview = await res.json();
        setData(overview);
      } else {
        setError("Failed to fetch overview data");
      }
    } catch (err) {
      setError("Failed to fetch overview data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Loading overview data...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8 text-blue-800">Admin Dashboard</h1>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Members Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Members Overview</h2>
            <FaUsers className="text-blue-600 text-2xl" />
          </div>
          
          <div className="space-y-4">
            {data.recentMembers.map(member => (
              <div key={member.id} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {member.fullName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{member.fullName}</p>
                  <p className="text-sm text-gray-600">
                    Joined {new Date(member.joinedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/members"
            className="mt-6 block text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            View all Members
          </Link>
        </div>

        {/* Loans Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Loans Overview</h2>
            <FaCreditCard className="text-blue-600 text-2xl" />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Total Loans</p>
              <p className="text-2xl font-bold text-red-600">
                Ksh {data.loans.total.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-red-600">
                {data.loans.pendingApprovals}
              </p>
            </div>
          </div>

          <Link
            to="/loans/manage"
            className="mt-6 block text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Manage Loans
          </Link>
        </div>

        {/* Payments Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Payments Overview</h2>
            <FaMoneyBillWave className="text-blue-600 text-2xl" />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-red-600">
                Ksh {data.payments.total.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-gray-600">Recent Payments</p>
              <p className="text-2xl font-bold text-red-600">
                {data.payments.recentCount}
              </p>
            </div>
          </div>

          <Link
            to="/payments"
            className="mt-6 block text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            View Payments
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
