const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');

const Loan = sequelize.define('Loan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
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
  interest_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'active', 'rejected', 'completed', 'defaulted'),
    defaultValue: 'pending'
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false
  },
  approved_by: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE
  },
  disbursed_at: {
    type: DataTypes.DATE
  },
  due_date: {
    type: DataTypes.DATE
  },
  ml_score: {
    type: DataTypes.FLOAT,
    comment: 'ML model prediction score for loan repayment probability'
  },
  total_repayment_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  remaining_balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  next_payment_due: {
    type: DataTypes.DATE
  },
  bank_statement_url: {
    type: DataTypes.STRING,
    comment: 'URL to uploaded bank statement for ML analysis'
  },
  officer_note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'loans',
  underscored: true
});

// Define associations
Loan.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Loan.belongsTo(User, {
  foreignKey: 'approved_by',
  as: 'approvedByUser'
});

User.hasMany(Loan, {
  foreignKey: 'user_id',
  as: 'loans'
});

module.exports = Loan;
