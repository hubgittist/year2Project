const express = require("express");
const router = express.Router();
const depositController = require("../controllers/depositController");

router.post("/deposits", depositController.makeDeposit);

module.exports = router;
