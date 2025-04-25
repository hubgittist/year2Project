const Transaction = require("../models/transaction.model");
const Loan = require("../models/loan.model");
const nodemailer = require('nodemailer');
const PaymentService = require("../services/payment.service");

// Helper: send notification email
async function sendNotificationEmail(to, subject, message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
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

// Make a deposit (savings)
exports.makeDeposit = async (req, res) => {
  const { amount, paymentMethod, source, origin, phoneNumber, cardDetails } = req.body;
  try {
    let paymentResult = { success: true };
    // Payment integration
    if (paymentMethod === 'mpesa') {
      if (!phoneNumber) return res.status(400).json({ message: 'Phone number required for M-Pesa payment.' });
      paymentResult = await PaymentService.initiateMpesaPayment(phoneNumber, amount, `Deposit-${Date.now()}`);
      if (!paymentResult.success) return res.status(400).json({ message: 'M-Pesa payment failed.' });
    } else if (paymentMethod === 'visa' || paymentMethod === 'mastercard') {
      // Simulate card payment (replace with real integration in production)
      if (!cardDetails || !cardDetails.number) return res.status(400).json({ message: 'Card details required.' });
      // In production, call your card payment provider API here
      paymentResult = { success: true, reference: `CARD-${Date.now()}` };
    }
    // Save transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      type: 'deposit',
      amount,
      paymentMethod,
      status: paymentResult.success ? 'completed' : 'failed',
      description: `Source: ${source}, Origin: ${origin}`
    });
    // Email notification to member
    try {
      const user = req.user;
      await sendNotificationEmail(user.email, 'Deposit Received', `Dear ${user.fullName},\n\nYour deposit of Ksh ${amount} via ${paymentMethod} has been received.\n\nThank you.`);
    } catch (e) {
      console.error('Deposit email error:', e);
    }
    res.status(201).json({ message: "Deposit successful", transaction });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Make a loan repayment
exports.makeRepayment = async (req, res) => {
  const { loanId, amount, paymentMethod, reference, phoneNumber, cardDetails } = req.body;
  try {
    const loan = await Loan.findByPk(loanId);
    if (!loan || loan.userId !== req.user.id) {
      return res.status(404).json({ message: "Loan not found" });
    }
    if (loan.status !== 'approved' && loan.status !== 'disbursed') {
      return res.status(400).json({ message: "Loan not in repayment status" });
    }
    let paymentResult = { success: true };
    // Payment integration
    if (paymentMethod === 'mpesa') {
      if (!phoneNumber) return res.status(400).json({ message: 'Phone number required for M-Pesa payment.' });
      paymentResult = await PaymentService.initiateMpesaPayment(phoneNumber, amount, `Repayment-${Date.now()}`);
      if (!paymentResult.success) return res.status(400).json({ message: 'M-Pesa payment failed.' });
    } else if (paymentMethod === 'visa' || paymentMethod === 'mastercard') {
      // Simulate card payment (replace with real integration in production)
      if (!cardDetails || !cardDetails.number) return res.status(400).json({ message: 'Card details required.' });
      // In production, call your card payment provider API here
      paymentResult = { success: true, reference: `CARD-${Date.now()}` };
    }
    // Save transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      loanId,
      type: 'loan_repayment',
      amount,
      paymentMethod,
      status: paymentResult.success ? 'completed' : 'failed',
      reference
    });
    loan.remainingBalance = parseFloat(loan.remainingBalance) - parseFloat(amount);
    if (loan.remainingBalance <= 0) {
      loan.status = 'completed';
      loan.remainingBalance = 0;
    }
    await loan.save();
    // TODO: Audit log, notification
    res.status(201).json({ message: "Repayment successful", transaction, loan });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// View transactions (member: own, admin/accountant: all)
exports.getTransactions = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'member') {
      where.userId = req.user.id;
    }
    const transactions = await Transaction.findAll({ where });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
