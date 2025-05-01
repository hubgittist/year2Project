const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');

const Deposit = sequelize.define('Deposit', {
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
  method: {
    type: DataTypes.ENUM('bank_transfer', 'mpesa', 'cash', 'cheque'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  transaction_reference: {
    type: DataTypes.STRING,
    unique: true
  },
  verified_at: {
    type: DataTypes.DATE
  },
  verified_by: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'deposits',
  underscored: true
});

// Define associations
Deposit.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Deposit.belongsTo(User, {
  foreignKey: 'verified_by',
  as: 'verifier'
});

User.hasMany(Deposit, {
  foreignKey: 'user_id',
  as: 'deposits'
});

module.exports = Deposit;
