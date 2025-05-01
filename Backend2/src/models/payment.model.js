const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Loan = require('./loan.model');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  loan_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Loan,
      key: 'id'
    }
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
    allowNull: false,
    validate: {
      min: 0
    }
  },
  payment_method: {
    type: DataTypes.ENUM('mpesa', 'bank_transfer', 'cash', 'cheque'),
    allowNull: false
  },
  transaction_reference: {
    type: DataTypes.STRING,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'payments',
  underscored: true
});

// Associations
Payment.belongsTo(Loan, {
  foreignKey: 'loan_id',
  as: 'loan'
});

Payment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Loan.hasMany(Payment, {
  foreignKey: 'loan_id',
  as: 'payments'
});

module.exports = Payment;
