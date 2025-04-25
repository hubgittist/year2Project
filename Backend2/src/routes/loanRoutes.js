const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loancontrol");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// Member applies for a loan
router.post("/loans/apply", authenticate, authorize('member'), loanController.applyLoan);
// Member views their loans
router.get("/loans/my", authenticate, authorize('member'), loanController.getMyLoans);
// Loan officer views pending loans
router.get("/loans/pending", authenticate, authorize('loan_officer'), loanController.getPendingLoans);
// Loan officer reviews a loan (approve/reject)
router.post("/loans/:loanId/review", authenticate, authorize('loan_officer'), loanController.reviewLoan);
// Admin/accountant views all loans
router.get("/loans/all", authenticate, authorize('admin', 'accountant'), loanController.getAllLoans);

module.exports = router;
