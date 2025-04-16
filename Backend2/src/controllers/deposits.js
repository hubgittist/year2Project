const db = require("../config/db");

exports.makeDeposit = (req, res) => {
    const { member_ID, amount, method } = req.body;

    const query = `
        INSERT INTO Deposits (member_ID, amount, method)
        VALUES (?, ?, ?)
    `;

    db.query(query, [member_ID, amount, method], (err, results) => {
        if (err) {
            console.error("Error inserting deposit:", err);
            return res.status(500).json({ message: "Server error" });
        }
        res.status(201).json({ message: "Deposit successful", depositID: results.insertId });
    });
};
