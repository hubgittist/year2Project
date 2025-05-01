import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./HomePage";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import RequireAuth from "./RequireAuth";
import React from "react";
// Member pages
import ApplyLoan from "./member/ApplyLoan";
import MyLoans from "./member/MyLoans";
import Deposits from "./member/Deposits";
//import Repayments from "./member/Repayments";
import RepayLoan from "./member/RepayLoan";
// Loan Officer pages
import PendingLoans from "./loan_officer/PendingLoans";
import ApprovedLoans from "./loan_officer/ApprovedLoans";
import Members from "./loan_officer/Members";
// Accountant pages
import Transactions from "./accountant/Transactions";
import Reports from "./accountant/Reports";
import Audit from "./accountant/Audit";
// Admin pages
import Users from "./admin/Users";
import Settings from "./admin/Settings";
import Overview from "./admin/Overview";
// Account settings
import AccountSettings from "./account/AccountSettings";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<RequireAuth allowedRoles={['member','loan_officer','accountant','admin']}><Dashboard /></RequireAuth>} />
          {/* Member routes */}
          <Route path="/loans/apply" element={<RequireAuth allowedRoles={['member']}><ApplyLoan /></RequireAuth>} />
          <Route path="/loans/my" element={<RequireAuth allowedRoles={['member']}><MyLoans /></RequireAuth>} />
          <Route path="/deposits" element={<RequireAuth allowedRoles={['member']}><Deposits /></RequireAuth>} />
          
          <Route path="/loans/:loanId/repay" element={<RequireAuth allowedRoles={['member']}><RepayLoan /></RequireAuth>} />
          {/* Loan Officer routes */}
          <Route path="/loans/pending" element={<RequireAuth allowedRoles={['loan_officer']}><PendingLoans /></RequireAuth>} />
          <Route path="/loans/approved" element={<RequireAuth allowedRoles={['loan_officer']}><ApprovedLoans /></RequireAuth>} />
          <Route path="/members" element={<RequireAuth allowedRoles={['loan_officer']}><Members /></RequireAuth>} />
          {/* Accountant routes */}
          <Route path="/transactions" element={<RequireAuth allowedRoles={['accountant']}><Transactions /></RequireAuth>} />
          <Route path="/reports" element={<RequireAuth allowedRoles={['accountant']}><Reports /></RequireAuth>} />
          <Route path="/audit" element={<RequireAuth allowedRoles={['accountant']}><Audit /></RequireAuth>} />
          {/* Admin routes */}
          <Route path="/users" element={<RequireAuth allowedRoles={['admin']}><Users /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth allowedRoles={['admin']}><Settings /></RequireAuth>} />
          <Route path="/overview" element={<RequireAuth allowedRoles={['admin']}><Overview /></RequireAuth>} />
          {/* Account settings */}
          <Route path="/account/settings" element={<RequireAuth allowedRoles={['member','loan_officer','accountant','admin']}><AccountSettings /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;