const jwt = require('jsonwebtoken');
const User = require("../models/user.model");
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, dateOfBirth, gender, nationalId } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Create new user
        const user = await User.create({
            fullName,
            email,
            password,
            phoneNumber,
            dateOfBirth,
            gender,
            nationalId,
            role: 'member' // Default role
        });

        res.status(201).json({ message: "Registration successful" });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(500).json({ message: "Registration failed" });
    }
};

// User login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await user.validatePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        user.lastLogin = new Date();
        await user.save();
        res.json({ token, role: user.role, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update user profile (with support for name, password, avatar)
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, phoneNumber, password } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (fullName) user.fullName = fullName;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (password && password.length > 0) {
            user.password = password; // model hook will hash
        }
        // Avatar upload support
        if (req.file) {
            // Save file and update user.avatar (assume 'uploads/avatars' dir exists)
            const avatarPath = `/uploads/avatars/${req.file.filename}`;
            user.avatar = avatarPath;
        }
        await user.save();
        res.json({ message: "Profile updated", user: { fullName: user.fullName, phoneNumber: user.phoneNumber, avatar: user.avatar } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Add this new function to get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'fullName', 'email', 'phoneNumber', 'dateOfBirth', 'gender', 'nationalId'],
      order: [['createdAt', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};
