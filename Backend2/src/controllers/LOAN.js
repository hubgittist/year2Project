const db = require('../config/db');

exports.getAllLoans = (req, res) => {
  const query = `
    SELECT L.loan_ID, M.is_member, L.loan_amount, L.loan_status
    FROM Loans L
    JOIN Members M ON L.member_ID = M.member_ID`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching loans: ', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
};
