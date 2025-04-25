import React, { useState } from "react";

export default function Deposits() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    source: "",
    origin: "Kenya",
    infoCorrect: false,
    amount: "",
    paymentMethod: "",
    phoneNumber: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: ""
  });
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function validateStep1() {
    const errs = [];
    if (!form.source) errs.push("Select the source of funds.");
    if (!form.origin) errs.push("Select the origin of funds.");
    if (!form.infoCorrect) errs.push("You must confirm the information is correct.");
    return errs;
  }

  function validateStep2() {
    const errs = [];
    if (!form.amount || Number(form.amount) <= 0) errs.push("Enter a valid deposit amount.");
    if (!form.paymentMethod) errs.push("Select a payment method.");
    if (form.paymentMethod === "mpesa" && !form.phoneNumber) errs.push("Phone number required for M-Pesa.");
    if ((form.paymentMethod === "visa" || form.paymentMethod === "mastercard") && (!form.cardNumber || !form.cardExpiry || !form.cardCVC)) errs.push("Enter all card details.");
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSuccess("");
    if (step === 1) {
      const errs = validateStep1();
      if (errs.length) return setErrors(errs);
      setStep(2);
      return;
    }
    // Step 2: submit deposit
    const errs = validateStep2();
    if (errs.length) return setErrors(errs);
    setLoading(true);
    let cardDetails = null;
    if (form.paymentMethod === "visa" || form.paymentMethod === "mastercard") {
      cardDetails = {
        number: form.cardNumber,
        expiry: form.cardExpiry,
        cvc: form.cardCVC
      };
    }
    try {
      const res = await fetch("http://localhost:5000/api/deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          source: form.source,
          origin: form.origin,
          amount: form.amount,
          paymentMethod: form.paymentMethod,
          phoneNumber: form.paymentMethod === "mpesa" ? form.phoneNumber : undefined,
          cardDetails
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Deposit successful! Check your email for confirmation.");
        setStep(1);
        setForm({ source: "", origin: "Kenya", infoCorrect: false, amount: "", paymentMethod: "", phoneNumber: "", cardNumber: "", cardExpiry: "", cardCVC: "" });
      } else {
        setErrors([data.message || "Failed to make deposit."]);
      }
    } catch {
      setErrors(["Failed to make deposit."]);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Make a Deposit</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <>
            <div>
              <label className="block font-semibold mb-1">Source of Funds</label>
              <select name="source" value={form.source} onChange={handleChange} className="w-full border rounded px-3 py-2">
                <option value="">Select...</option>
                <option value="salary">Salary</option>
                <option value="self_employment">Self Employment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Origin of Funds</label>
              <select name="origin" value={form.origin} onChange={handleChange} className="w-full border rounded px-3 py-2">
                <option value="Kenya">Kenya</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                name="infoCorrect"
                checked={form.infoCorrect}
                onChange={handleChange}
                className="mr-2"
                id="infoCorrect"
              />
              <label htmlFor="infoCorrect" className="text-gray-700">I confirm that the information provided is correct.</label>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div>
              <label className="block font-semibold mb-1">Amount to Deposit (Ksh)</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="1"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Payment Method</label>
              <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="w-full border rounded px-3 py-2">
                <option value="">Select...</option>
                <option value="mpesa">M-Pesa Kenya</option>
                <option value="visa">Visa Card</option>
                <option value="mastercard">Master Card</option>
              </select>
            </div>
            {form.paymentMethod === "mpesa" && (
              <div>
                <label className="block font-semibold mb-1">M-Pesa Phone Number</label>
                <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="07XXXXXXXX" />
              </div>
            )}
            {(form.paymentMethod === "visa" || form.paymentMethod === "mastercard") && (
              <div className="space-y-2">
                <label className="block font-semibold mb-1">Card Number</label>
                <input type="text" name="cardNumber" value={form.cardNumber} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Card Number" maxLength={19} />
                <label className="block font-semibold mb-1">Expiry (MM/YY)</label>
                <input type="text" name="cardExpiry" value={form.cardExpiry} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="MM/YY" maxLength={5} />
                <label className="block font-semibold mb-1">CVC</label>
                <input type="text" name="cardCVC" value={form.cardCVC} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="CVC" maxLength={4} />
              </div>
            )}
          </>
        )}
        {errors.length > 0 && <div className="bg-red-100 border border-red-300 text-red-700 rounded p-3">
          <ul className="list-disc pl-4">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>}
        {success && <div className="bg-green-100 border border-green-300 text-green-700 rounded p-3">{success}</div>}
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow" disabled={loading}>
          {loading ? "Processing..." : (step === 1 ? "Next" : "Make Deposit")}
        </button>
        {step === 2 && (
          <button type="button" className="ml-4 text-blue-700 underline" onClick={() => setStep(1)}>
            Back
          </button>
        )}
      </form>
    </div>
  );
}
