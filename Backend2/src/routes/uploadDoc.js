const express = require("express");
const multer = require("multer");
const { s3 } = require("./config/aws"); // your aws.js file

const app = express();

// Set up multer for file parsing
const storage = multer.memoryStorage(); // store file in memory
const upload = multer({ storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${Date.now()}-${file.originalname}`, // unique filename
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read", // Optional: make file public
    };

    const uploadResult = await s3.upload(params).promise();

    res.status(200).json({ message: "File uploaded", url: uploadResult.Location });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});
