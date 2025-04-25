const Loan = require("../models/loan.model");
const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");
const MLService = require("../services/ml.service");
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

// Helper: calculate deposit total
async function getDepositTotal(userId) {
  const result = await Transaction.sum('amount', {
    where: { userId, type: 'deposit', status: 'completed' }
  });
  return result || 0;
}

// Helper: send notification email
async function sendNotificationEmail(to, subject, message) {
  // Configure transporter (use your SMTP or service credentials)
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or use SES, etc
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: message
  });
}

// Apply for a loan with eligibility checks
exports.applyLoan = async (req, res) => {
  try {
    const { nationality, dob, employment, income, amount, purpose } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Eligibility checks
    if (nationality !== 'Kenyan') return res.status(400).json({ message: 'Only Kenyan nationals are eligible.' });
    const age = dob ? Math.floor((Date.now() - new Date(dob)) / (365.25*24*60*60*1000)) : 0;
    if (age < 18) return res.status(400).json({ message: 'You must be at least 18 years old.' });
    if (employment !== 'salaried') return res.status(400).json({ message: 'Only salaried members can apply.' });
    if (Number(income) < 15000) return res.status(400).json({ message: 'Monthly income must be at least Ksh 15,000.' });
    const depositTotal = await getDepositTotal(user.id);
    if (depositTotal < 15000) return res.status(400).json({ message: 'You must have at least Ksh 15,000 in deposits.' });
    if (Number(amount) > depositTotal * 5) return res.status(400).json({ message: `You can only borrow up to 5x your deposit (Max: Ksh ${depositTotal*5}).` });
    if (!amount || Number(amount) <= 0) return res.status(400).json({ message: 'Enter a valid loan amount.' });
    if (!purpose) return res.status(400).json({ message: 'Enter the loan purpose.' });
    // Save loan application
    const loan = await Loan.create({
      userId: user.id,
      amount,
      term: 12, // default 12 months, or accept from form
      interestRate: 15, // default 15%, or accept from form
      purpose,
      status: 'pending',
      totalRepaymentAmount: amount * 1.15,
      remainingBalance: amount * 1.15
    });
    // Send email notification to applicant
    try {
      await sendNotificationEmail(user.email, 'Loan Application Received', `Dear ${user.fullName},\n\nYour loan application for Ksh ${amount} has been received and is pending processing.\n\nThank you.`);
    } catch (e) {
      // Log email error, but don't block application
      console.error('Email error:', e);
    }
    // Optionally: Notify loan officer (find by role)
    const officer = await User.findOne({ where: { role: 'loan_officer', status: 'active' } });
    if (officer) {
      try {
        await sendNotificationEmail(officer.email, 'New Loan Application', `A new loan application from ${user.fullName} (Ksh ${amount}) is awaiting your review.`);
      } catch (e) {
        console.error('Officer email error:', e);
      }
    }
    res.status(201).json({ message: "Loan application submitted", loan });
  } catch (error) {
    console.error("Loan application error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all loans for the logged-in user
exports.getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll({ where: { userId: req.user.id } });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Loan officer: get all pending loans
exports.getPendingLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll({ where: { status: 'pending' } });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Loan officer: approve or reject a loan
exports.reviewLoan = async (req, res) => {
  const { loanId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'
  try {
    const loan = await Loan.findByPk(loanId);
    if (!loan || loan.status !== 'pending') {
      return res.status(404).json({ message: "Loan not found or not pending" });
    }
    if (action === 'approve') {
      loan.status = 'approved';
      loan.approvedBy = req.user.id;
      loan.approvedAt = new Date();
      await loan.save();
      // TODO: send email notification here
      return res.json({ message: "Loan approved", loan });
    } else if (action === 'reject') {
      loan.status = 'rejected';
      loan.rejectedBy = req.user.id;
      loan.rejectedAt = new Date();
      await loan.save();
      // TODO: send email notification here
      return res.json({ message: "Loan rejected", loan });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin/accountant: get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll();
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
