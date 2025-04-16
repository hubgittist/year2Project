const Loan = require("../models/Loan");

const applyLoan = async (req, res) => {
  const { amount, term, income } = req.body;

  try {
    const loan = new Loan({
      user: req.user.id, // assuming req.user is already set by authentication middleware
      amount,
      term,
      income,
      status: "pending"
    });

    await loan.save();

    res.status(201).json({ message: "Loan application submitted" });
  } catch (error) {
    console.error("Loan application error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { applyLoan };
