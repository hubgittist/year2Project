import React, { useState, useEffect } from "react";

export default function ApplyLoan() {
  const [form, setForm] = useState({
    nationality: "Kenyan",
    dob: "",
    employment: "",
    income: "",
    amount: "",
    purpose: "",
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
    if (deposit < 15000) errs.push("You must have at least Ksh 15,000 in deposits.");
    if (form.employment !== "salaried") errs.push("Only salaried members can apply.");
    if (Number(form.income) < 15000) errs.push("Monthly income must be at least Ksh 15,000.");
    if (Number(form.amount) > deposit * 5) errs.push(`You can only borrow up to 5x your deposit (Max: Ksh ${deposit*5}).`);
    if (!form.amount || Number(form.amount) <= 0) errs.push("Enter a valid loan amount.");
    if (!form.purpose) errs.push("Enter the loan purpose.");
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
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Loan application submitted! Check your email for confirmation.");
        setForm({ nationality: "Kenyan", dob: "", employment: "", income: "", amount: "", purpose: "" });
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
            <option value="unemployed">Unemployed</option>
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
          <label className="block font-semibold mb-1">Loan Purpose</label>
          <input type="text" name="purpose" value={form.purpose} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        {errors.length > 0 && <div className="bg-red-100 border border-red-300 text-red-700 rounded p-3">
          <ul className="list-disc pl-4">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>}
        {success && <div className="bg-green-100 border border-green-300 text-green-700 rounded p-3">{success}</div>}
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow" disabled={loading}>
          {loading ? "Submitting..." : "Apply for Loan"}
        </button>
      </form>
    </div>
  );
}
