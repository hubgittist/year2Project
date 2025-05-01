import React, { useState, useEffect } from "react";

export default function ApplyLoan() {
  const [form, setForm] = useState({
    nationality: "Kenyan",
    dob: "",
    employment: "",
    income: "",
    amount: "",
    purpose: "",
    term: "6" // Default to 6 months
  });
  const [deposit, setDeposit] = useState(0);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch deposit total for current user
  useEffect(() => {
    async function fetchDeposit() {
      try {
        const res = await fetch("http://localhost:5000/api/members/deposit-total", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDeposit(data.total || 0);
        }
      } catch {}
    }
    fetchDeposit();
  }, []);

  function validate() {
    const errs = [];
    const age = form.dob ? Math.floor((Date.now() - new Date(form.dob)) / (365.25*24*60*60*1000)) : 0;
    if (form.nationality !== "Kenyan") errs.push("Only Kenyan nationals are eligible.");
    if (age < 18) errs.push("You must be at least 18 years old.");
    if (form.employment !== "salaried") errs.push("Only salaried members can apply.");
    if (Number(form.income) < 15000) errs.push("Monthly income must be at least Ksh 15,000.");
    if (!form.amount || Number(form.amount) <= 0) errs.push("Enter a valid loan amount.");
    if (!form.purpose) errs.push("Enter the loan purpose.");
    if (!form.term) errs.push("Select a loan term.");
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSuccess("");
    const errs = validate();
    if (errs.length) return setErrors(errs);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/loans/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: Number(form.amount),
          term: Number(form.term),
          purpose: form.purpose
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Loan application submitted! Check your email for confirmation.");
        setForm({ 
          nationality: "Kenyan", 
          dob: "", 
          employment: "", 
          income: "", 
          amount: "", 
          purpose: "",
          term: "6"
        });
      } else {
        setErrors([data.message || "Failed to apply for loan."]);
      }
    } catch {
      setErrors(["Failed to apply for loan."]);
    }
    setLoading(false);
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Loan Application</h2>
      <div className="mb-4 text-blue-700">Your current deposit: <span className="font-bold">Ksh {deposit.toLocaleString()}</span></div>
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-semibold mb-1">Nationality</label>
          <select name="nationality" value={form.nationality} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="Kenyan">Kenyan</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Date of Birth</label>
          <input type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Employment Status</label>
          <select name="employment" value={form.employment} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="">Select...</option>
            <option value="salaried">Salaried</option>
            <option value="self-employed">Self-employed</option>
            <option value="business">Business Owner</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Monthly Income (Ksh)</label>
          <input type="number" name="income" value={form.income} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Loan Amount (Ksh)</label>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Loan Term (Months)</label>
          <select name="term" value={form.term} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Loan Purpose</label>
          <textarea name="purpose" value={form.purpose} onChange={handleChange} className="w-full border rounded px-3 py-2" rows="3"></textarea>
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
