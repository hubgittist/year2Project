const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('member', 'loan_officer', 'admin', 'accountant'),
    defaultValue: 'member'
  },
  memberNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  lastLogin: {
    type: DataTypes.DATE
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true, 
    validate: {
      isBeforeToday(value) {
        if (!value) return; 
        if (value >= new Date()) {
          throw new Error('Date of birth must be in the past');
        }
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          throw new Error('Must be at least 18 years old');
        }
      }
    }
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true 
  },
  nationalId: {
    type: DataTypes.STRING,
    allowNull: true, 
    unique: true,
    validate: {
      isNumeric: true,
      len: [7, 8] 
    }
  }
}, {
  tableName: 'users',
  underscored: true,
  hooks: {
    beforeValidate: (user) => {
      if (user.isNewRecord) {
        if (!user.dateOfBirth) {
          throw new Error('Date of birth is required');
        }
        if (!user.gender) {
          throw new Error('Gender is required');
        }
        if (!user.nationalId) {
          throw new Error('National ID is required');
        }
      }
    },
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;
