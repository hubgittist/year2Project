const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// Member: make deposit
router.post("/deposits", authenticate, authorize('member'), paymentController.makeDeposit);
// Member: make loan repayment
router.post("/repayments", authenticate, authorize('member'), paymentController.makeRepayment);
// Member: view own transactions, Admin/Accountant: view all
router.get("/transactions", authenticate, authorize('member', 'admin', 'accountant'), paymentController.getTransactions);

module.exports = router;
