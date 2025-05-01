const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Protected routes
router.use(authenticate);

// Make a payment
router.post('/make-payment', paymentController.makePayment);

// Get payment history for a loan
router.get('/history/:loanId', paymentController.getPaymentHistory);

module.exports = router;
