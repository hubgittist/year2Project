const express = require('express');
const router = express.Router();
const depositController = require('../controllers/deposit.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Protected routes (require authentication)
router.use(authenticate);

// Get total deposits
router.get('/deposit-total', depositController.getDepositTotal);

// Get all deposits
router.get('/deposits', depositController.getMyDeposits);

// Create new deposit
router.post('/deposits', depositController.createDeposit);

module.exports = router;
