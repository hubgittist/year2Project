const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Protected routes
router.use(authenticate);

// Get admin overview data
router.get('/overview', adminController.getOverview);

module.exports = router;
