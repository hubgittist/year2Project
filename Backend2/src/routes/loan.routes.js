const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Protected routes (require authentication)
router.use(authenticate);

// Member routes
router.get('/my-loans', loanController.getMyLoans);
router.post('/apply', loanController.applyLoan);

// Loan Officer routes
router.get('/applicants', checkRole(['loan_officer', 'admin']), loanController.getLoanApplicants);
router.get('/pending', checkRole(['loan_officer', 'admin']), loanController.getPendingLoans);
router.get('/approved', checkRole(['loan_officer', 'admin']), loanController.getApprovedLoans);
router.post('/:id/process', checkRole(['loan_officer', 'admin']), loanController.processLoanApplication);

// This should be last as it's a catch-all for IDs
router.get('/:id', loanController.getLoanById);

function checkRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

module.exports = router;
