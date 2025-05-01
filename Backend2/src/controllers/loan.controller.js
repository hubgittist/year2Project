const Loan = require('../models/loan.model');
const User = require('../models/user.model');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/email');

// Get all loans for the authenticated user
exports.getMyLoans = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Only get loans for the authenticated user
    const loans = await Loan.findAll({
      where: { 
        user_id: userId  // This ensures we only get loans for this specific user
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['fullName', 'email', 'phoneNumber']
      }, {
        model: User,
        as: 'approvedByUser',
        attributes: ['fullName']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ message: 'Failed to fetch loans' });
  }
};

// Get loan by ID
exports.getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findOne({
      where: { id: req.params.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['fullName', 'email', 'phoneNumber']
      }]
    });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    res.json(loan);
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({ message: 'Failed to fetch loan' });
  }
};

// Get all pending loans (for loan officers)
exports.getPendingLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll({
      where: { status: 'pending' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['fullName', 'email', 'phoneNumber']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(loans);
  } catch (error) {
    console.error('Error fetching pending loans:', error);
    res.status(500).json({ message: 'Failed to fetch pending loans' });
  }
};

// Get all approved loans (for loan officers)
exports.getApprovedLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll({
      where: { 
        status: {
          [Op.in]: ['approved', 'active', 'completed']  // Include 'approved' status
        }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['fullName', 'email', 'phoneNumber']
      }, {
        model: User,
        as: 'approvedByUser',
        attributes: ['fullName']
      }],
      order: [['approved_at', 'DESC']]  // Order by approval date
    });
    res.json(loans);
  } catch (error) {
    console.error('Error fetching approved loans:', error);
    res.status(500).json({ message: 'Failed to fetch approved loans' });
  }
};

// Process loan application (approve/reject)
exports.processLoanApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body;
    const officerId = req.user.id;

    const loan = await Loan.findOne({
      where: { id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['fullName', 'email']
      }]
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ message: 'Loan has already been processed' });
    }

    let emailSubject, emailText;

    if (action === 'approve') {
      await loan.update({
        status: 'approved',  // Set to 'approved' first
        approved_at: new Date(),
        approved_by: officerId,
        officer_note: note
      });

      // Then update to 'active' after approval details are set
      await loan.update({
        status: 'active'
      });

      emailSubject = 'Loan Application Approved';
      emailText = `
Dear ${loan.user.fullName},

We are pleased to inform you that your loan application has been approved!

Loan Details:
- Amount: KES ${loan.amount.toLocaleString()}
- Term: ${loan.term} months
- Interest Rate: ${loan.interest_rate}%
- Total Repayment: KES ${loan.total_repayment_amount.toLocaleString()}

Officer's Note: ${note || 'N/A'}

You can now view your loan details and make payments through your account dashboard.

Best regards,
Your Loan Management Team
      `;
    } else if (action === 'reject') {
      await loan.update({
        status: 'rejected',
        rejected_at: new Date(),
        rejected_by: officerId,
        officer_note: note
      });

      emailSubject = 'Loan Application Update';
      emailText = `
Dear ${loan.user.fullName},

We regret to inform you that your loan application has been declined.

Officer's Note: ${note || 'N/A'}

You may contact our support team for more information or submit a new application after addressing the concerns mentioned above.

Best regards,
Your Loan Management Team
      `;
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    // Send email notification
    await sendEmail({
      to: loan.user.email,
      subject: emailSubject,
      text: emailText
    });

    res.json({ message: `Loan ${action}ed successfully` });
  } catch (error) {
    console.error('Error processing loan:', error);
    res.status(500).json({ message: 'Failed to process loan' });
  }
};

// Apply for a loan
exports.applyLoan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, term, purpose } = req.body;

    // Check for existing pending or active loans
    const existingLoan = await Loan.findOne({
      where: {
        user_id: userId,
        status: {
          [Op.in]: ['pending', 'active']
        }
      }
    });

    if (existingLoan) {
      return res.status(400).json({
        message: 'You already have a pending or active loan'
      });
    }

    // Calculate interest rate based on term
    let interestRate;
    if (term <= 6) interestRate = 12;
    else if (term <= 12) interestRate = 15;
    else interestRate = 18;

    // Calculate total repayment
    const interest = (amount * interestRate * term) / (12 * 100);
    const totalRepayment = amount + interest;

    const loan = await Loan.create({
      user_id: userId,
      amount,
      term,
      interest_rate: interestRate,
      purpose,
      status: 'pending',
      total_repayment_amount: totalRepayment,
      remaining_balance: totalRepayment
    });

    // Send email notification
    const user = await User.findByPk(userId);
    sendEmail({
      to: user.email,
      subject: 'Loan Application Received',
      text: `
Dear ${user.fullName},

Your loan application has been received and is under review.

Application Details:
- Amount: KES ${amount.toLocaleString()}
- Term: ${term} months
- Purpose: ${purpose}
- Interest Rate: ${interestRate}%
- Total Repayment: KES ${totalRepayment.toLocaleString()}

We will notify you once our loan officer reviews your application.

Best regards,
Your Loan Management Team
      `
    }).catch(console.error);

    res.status(201).json(loan);
  } catch (error) {
    console.error('Error applying for loan:', error);
    res.status(500).json({ message: 'Failed to apply for loan' });
  }
};

// Get all loan applicants with their loan details
exports.getLoanApplicants = async (req, res) => {
  try {
    const applicants = await User.findAll({
      include: [{
        model: Loan,
        as: 'loans',
        attributes: ['id', 'amount', 'term', 'purpose', 'status', 'created_at'],
        required: true // This makes it an INNER JOIN
      }],
      where: {
        role: 'member'
      },
      attributes: ['id', 'fullName', 'email', 'phoneNumber'],
      order: [[{ model: Loan, as: 'loans' }, 'created_at', 'DESC']]
    });

    // Transform the data to make it easier to use in the frontend
    const formattedApplicants = applicants.map(applicant => ({
      id: applicant.id,
      fullName: applicant.fullName,
      email: applicant.email,
      phoneNumber: applicant.phoneNumber,
      loan: applicant.loans[0] // Get the most recent loan since we ordered by created_at DESC
    }));

    res.json(formattedApplicants);
  } catch (error) {
    console.error('Error fetching loan applicants:', error);
    res.status(500).json({ message: 'Failed to fetch loan applicants' });
  }
};
