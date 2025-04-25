const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const cors = require('cors');
app.use(express.json());

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Sequelize sync for dev: force recreate tables to match models
// const sequelize = require('./config/database');
// sequelize.sync({ force: true }).then(() => {
//   console.log('Database & tables synced!');
// });

// Import routes
const userRoutes = require("./routes/userRoutes");
const loanRoutes = require("./routes/loanRoutes");
const depositRoutes = require("./routes/depositRoutes");
const paymentRoutes = require("./routes/paymentRoutes");


app.use(cors(corsOptions));
// Use routes
app.use("/api", userRoutes);
app.use("/api", loanRoutes);
app.use("/api", depositRoutes);
app.use("/api", paymentRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
