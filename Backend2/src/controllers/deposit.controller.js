const Deposit = require('../models/deposit.model');
const { sequelize } = require('../config/database');

// Get total deposits for a user
exports.getDepositTotal = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Deposit.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: {
        user_id: userId,
        status: 'completed'
      }
    });

    const total = result ? result.get('total') || 0 : 0;
    res.json({ total });
  } catch (error) {
    console.error('Error fetching deposit total:', error);
    res.status(500).json({ message: 'Failed to fetch deposit total' });
  }
};

// Create a new deposit
exports.createDeposit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, method } = req.body;

    const deposit = await Deposit.create({
      user_id: userId,
      amount,
      method,
      status: 'pending',
      transaction_reference: `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    res.status(201).json(deposit);
  } catch (error) {
    console.error('Error creating deposit:', error);
    res.status(500).json({ message: 'Failed to create deposit' });
  }
};

// Get all deposits for a user
exports.getMyDeposits = async (req, res) => {
  try {
    const userId = req.user.id;

    const deposits = await Deposit.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']]
    });

    res.json(deposits);
  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json({ message: 'Failed to fetch deposits' });
  }
};
