const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all jobs
router.get("/", (req, res) => {
  db.query("SELECT * FROM jobs", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// Post new job
router.post("/", (req, res) => {
  const { title, description, recruiter_id } = req.body;
  db.query(
    "INSERT INTO jobs (title, description, recruiter_id) VALUES (?, ?, ?)",
    [title, description, recruiter_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Job created successfully", id: result.insertId });
    }
  );
});

module.exports = router;
