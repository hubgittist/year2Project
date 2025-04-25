import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Login</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
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
          className="mb-4 w-full px-3 py-2 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded w-full" type="submit">Login</button>
        <div className="mt-4 text-sm text-gray-600 text-center">
          Don't have an account? <a href="/register" className="text-blue-700 underline">Register</a>
        </div>
      </form>
    </div>
  );
}
