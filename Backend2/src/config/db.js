const mysql = require("mysql2");

// Create a connection to the database
const db = mysql.createConnection({
  host: "127.0.0.1",   // Replace with your database host
  user: "root",        // Replace with your MySQL username
  password: "", // Replace with your MySQL password
  database: "" // Replace with your database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL Database");
});

module.exports = db; 