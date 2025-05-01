const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const cors = require('cors');

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import database and models
const sequelize = require('./config/database');
const User = require('./models/user.model');
const Deposit = require('./models/deposit.model');
const Loan = require('./models/loan.model');

// Sequelize sync for dev: force recreate tables to match models
sequelize.sync({ alter: true }).then(() => {
  console.log('Database & tables synced!');
});



// Import routes
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const loanRoutes = require("./routes/loan.routes");
const depositRoutes = require("./routes/deposit.routes");
const adminRoutes = require("./routes/admin.routes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/members", depositRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
