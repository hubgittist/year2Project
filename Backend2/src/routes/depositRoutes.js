const express = require("express");
const router = express.Router();
const depositController = require("../controllers/deposits");

router.post("/deposits", depositController.makeDeposit);

module.exports = router;
