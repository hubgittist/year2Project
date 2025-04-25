import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const roles = ["member", "loan_officer", "accountant", "admin"];

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSuccess("Registration successful! Please login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Register</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <input
          type="text"
          placeholder="Full Name"
          className="mb-2 w-full px-3 py-2 border rounded"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="mb-2 w-full px-3 py-2 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-2 w-full px-3 py-2 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          className="mb-2 w-full px-3 py-2 border rounded"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
        />
        <select
          className="mb-4 w-full px-3 py-2 border rounded"
          value={role}
          onChange={e => setRole(e.target.value)}
          required
        >
          {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded w-full" type="submit">Register</button>
        <div className="mt-4 text-sm text-gray-600 text-center">
          Already have an account? <a href="/login" className="text-blue-700 underline">Login</a>
        </div>
      </form>
    </div>
  );
}
