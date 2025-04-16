const express = require("express");
const { ses } = require("./config/aws"); // your aws.js file

const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { to, subject, message } = req.body;

  const params = {
    Source: "your_verified_email@example.com", // Must be verified in SES
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: { Data: subject },
      Body: {
        Text: { Data: message },
      },
    },
  };

  try {
    await ses.sendEmail(params).promise();
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Email sending failed" });
  }
});
