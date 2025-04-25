const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  loanId: {
    type: DataTypes.UUID,
    references: {
      model: 'Loans',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('deposit', 'withdrawal', 'loan_disbursement', 'loan_repayment'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('mpesa', 'bank_transfer', 'cash'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  reference: {
    type: DataTypes.STRING,
    unique: true
  },
  description: {
    type: DataTypes.STRING
  },
  paymentProof: {
    type: DataTypes.STRING,
    comment: 'URL to payment proof document if applicable'
  },
  processedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  processedAt: {
    type: DataTypes.DATE
  }
});

module.exports = Transaction;
