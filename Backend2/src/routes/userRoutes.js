const express = require("express");
const router = express.Router();
const userController = require("../controllers/usercontrol");

router.post("/users/register", userController.registerUser);

module.exports = router;
