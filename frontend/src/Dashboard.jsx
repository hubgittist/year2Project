import React, { useEffect, useState } from "react";
import UserHeader from "./components/UserHeader";
import { Link } from "react-router-dom";

const dashboardLinks = {
  member: [
    { to: "/loans/apply", label: "Apply for Loan", icon: "💸" },
    { to: "/loans/my", label: "My Loans", icon: "📋" },
    { to: "/deposits", label: "Make Deposit", icon: "🏦" },
    { to: "/repayments", label: "Repay Loan", icon: "💳" },
  ],
  loan_officer: [
    { to: "/loans/pending", label: "Pending Loans", icon: "🕒" },
    { to: "/loans/approved", label: "Approved Loans", icon: "✅" },
    { to: "/members", label: "Members", icon: "👥" },
  ],
  accountant: [
    { to: "/transactions", label: "All Transactions", icon: "💰" },
    { to: "/reports", label: "Financial Reports", icon: "📈" },
    { to: "/audit", label: "Audit Logs", icon: "📝" },
  ],
  admin: [
    { to: "/users", label: "Manage Users", icon: "🛠️" },
    { to: "/settings", label: "System Settings", icon: "⚙️" },
    { to: "/overview", label: "SACCO Overview", icon: "🌐" },
  ],
};

export default function Dashboard() {
  const [user, setUser] = useState({
    fullName: "",
    role: localStorage.getItem("role") || "",
    avatar: null
  });

  useEffect(() => {
    // Fetch user profile from backend for freshest info
    async function fetchProfile() {
      try {
        const res = await fetch("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(u => ({ ...u, ...data }));
        }
      } catch (err) {
        // Optionally handle error (e.g., redirect to login)
      }
    }
    fetchProfile();
  }, []);

  function renderRoleDashboard(role) {
    const links = dashboardLinks[role] || [];
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 w-full max-w-3xl">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center hover:bg-blue-50 transition border border-blue-100 group"
          >
            <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">{link.icon}</span>
            <span className="font-semibold text-blue-800 text-lg mb-1">{link.label}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex flex-col">
      {/* Top left user info */}
      <div className="flex justify-start">
        <UserHeader user={user} />
      </div>
      <div className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-900 drop-shadow">Welcome, {user.fullName ? user.fullName.split(' ')[0] : ''}</h1>
        <div className="mb-2 text-blue-700 text-lg font-medium capitalize">{user.role} dashboard</div>
        {renderRoleDashboard(user.role)}
      </div>
    </div>
  );
}
