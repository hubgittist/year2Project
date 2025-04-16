const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const router = express.Router();
const userController = require("../controllers/usercontrol");
app.use("/api", userController)
const depositController = require("../controllers/deposits");

dotenv.config();

const app = express();
app.use(express.json());

// Connect to the database
connectDB();

const userRoutes = require("./routes/userRoutes");
app.use("/api", userRoutes);


module.exports = router;


const depositRoutes = require("./routes/depositRoutes");
app.use("/api", depositRoutes);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
