const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Loan = sequelize.define('Loan', {
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  term: {
    type: DataTypes.INTEGER, // in months
    allowNull: false
  },
  interestRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'disbursed', 'completed', 'defaulted'),
    defaultValue: 'pending'
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE
  },
  disbursedAt: {
    type: DataTypes.DATE
  },
  dueDate: {
    type: DataTypes.DATE
  },
  mlScore: {
    type: DataTypes.FLOAT,
    comment: 'ML model prediction score for loan repayment probability'
  },
  totalRepaymentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  remainingBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  nextPaymentDue: {
    type: DataTypes.DATE
  },
  bankStatementUrl: {
    type: DataTypes.STRING,
    comment: 'URL to uploaded bank statement for ML analysis'
  }
});

module.exports = Loan;
