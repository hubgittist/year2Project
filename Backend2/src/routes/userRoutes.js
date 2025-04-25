const express = require("express");
const router = express.Router();
const userController = require("../controllers/usercontrol");
const { authenticate } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// Registration and login
router.post("/users/register", userController.registerUser);
router.post("/users/login", userController.loginUser);

// Profile endpoints (protected)
router.get("/users/profile", authenticate, userController.getProfile);
router.put("/users/profile", authenticate, upload.single('avatar'), userController.updateProfile);

module.exports = router;
