const Payment = require('../models/payment.model');
const Loan = require('../models/loan.model');
const { sendEmail } = require('../utils/email');
const { sequelize } = require('../config/database');

exports.makePayment = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const { loanId, amount, paymentMethod } = req.body;

    // Validate the loan exists and belongs to user
    const loan = await Loan.findOne({
      where: {
        id: loanId,
        user_id: userId,
        status: 'active'
      }
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found or not active' });
    }

    // Validate payment amount
    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    if (amount > loan.remaining_balance) {
      return res.status(400).json({ 
        message: 'Payment amount exceeds remaining balance',
        remaining_balance: loan.remaining_balance
      });
    }

    // Create payment record
    const payment = await Payment.create({
      loan_id: loanId,
      user_id: userId,
      amount,
      payment_method: paymentMethod,
      transaction_reference: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed'
    }, { transaction: t });

    // Update loan balance
    const newBalance = loan.remaining_balance - amount;
    await loan.update({
      remaining_balance: newBalance,
      status: newBalance === 0 ? 'completed' : 'active'
    }, { transaction: t });

    await t.commit();

    // Send email notification
    const user = req.user;
    sendEmail({
      to: user.email,
      subject: 'Loan Payment Confirmation',
      text: `
Dear ${user.fullName},

Your loan payment of KES ${amount} has been received and processed successfully.

Payment Details:
- Transaction Reference: ${payment.transaction_reference}
- Payment Method: ${paymentMethod}
- Remaining Balance: KES ${newBalance}

Thank you for your payment.

Best regards,
Your Loan Management Team
      `
    }).catch(console.error); // Don't wait for email to send

    res.json({
      message: 'Payment processed successfully',
      payment,
      remaining_balance: newBalance
    });

  } catch (error) {
    await t.rollback();
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Failed to process payment' });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { loanId } = req.params;

    const payments = await Payment.findAll({
      where: {
        loan_id: loanId,
        user_id: userId
      },
      order: [['created_at', 'DESC']]
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
};
