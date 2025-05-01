const express = require("express");
const router = express.Router();
const userController = require("../controllers/usercontrol");
const { authenticate } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// Registration and login
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Profile endpoints (protected)
router.get("/profile", authenticate, userController.getProfile);
router.put("/profile", authenticate, upload.single('avatar'), userController.updateProfile);

// Add this route for getting all users
router.get('/all', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  await userController.getAllUsers(req, res);
});

module.exports = router;
