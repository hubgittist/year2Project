import React from "react";
import { Banknote, PiggyBank, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  function handleExploreDashboard() {
    // Only allow if logged in (token exists)
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 animate-gradient bg-fixed flex flex-col">
      <header className="p-6 shadow-md bg-white/80 backdrop-blur-sm flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-800">SACCO Portal</h1>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-2xl w-full">
          <h2 className="text-4xl font-extrabold text-blue-700 mb-4">Welcome Back!</h2>
          <p className="text-gray-600 text-lg mb-6">
            Manage your finances with ease. Apply for loans, track repayments, make deposits, and more — all in one place.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-6">
            <div className="flex items-start gap-3">
              <Banknote className="text-blue-500 w-6 h-6 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-800">Loan Applications</h4>
                <p className="text-sm text-gray-500">Quick and simple loan application process.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PiggyBank className="text-blue-500 w-6 h-6 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-800">Smart Deposits</h4>
                <p className="text-sm text-gray-500">Track and manage your deposits easily.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowRight className="text-blue-500 w-6 h-6 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-800">Fast Repayments</h4>
                <p className="text-sm text-gray-500">Stay on top of your loan repayments in real time.</p>
              </div>
            </div>
          </div>

          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full shadow transition"
            onClick={handleExploreDashboard}
          >
            Explore Your Dashboard
          </button>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-600 py-4">
        &copy; {new Date().getFullYear()} SACCO System. All rights reserved.
      </footer>
    </div>
  );
}
