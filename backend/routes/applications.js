const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Student applies for job
router.post("/apply", authenticateToken, authorizeRoles("student"), (req, res) => {
  const studentUserId = req.user.id;
  const { job_id, resume } = req.body;
  if (!job_id) return res.status(400).json({ error: "job_id required" });

  // Optionally save resume snapshot in users table or applications.resume
  db.query(
    "INSERT INTO applications (student_id, job_id, status) VALUES (?, ?, ?)",
    [studentUserId, job_id, "applied"],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Applied successfully", applicationId: result.insertId });
    }
  );
});

// Get applications for logged-in user (student)
router.get("/my", authenticateToken, authorizeRoles("student"), (req, res) => {
  const studentUserId = req.user.id;
  db.query(
    `SELECT a.id, a.job_id, a.status, a.applied_at, j.title, j.description
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     WHERE a.student_id = ? ORDER BY a.applied_at DESC`,
    [studentUserId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});

// Admin: view all applications
router.get("/", authenticateToken, authorizeRoles("admin","recruiter"), (req, res) => {
  db.query(
    `SELECT a.id, a.student_id, a.job_id, a.status, a.applied_at, u.name as student_name, j.title as job_title
     FROM applications a
     JOIN users u ON a.student_id = u.id
     JOIN jobs j ON a.job_id = j.id
     ORDER BY a.applied_at DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});

// Admin: update status
router.patch("/:id/status", authenticateToken, authorizeRoles("admin","recruiter"), (req, res) => {
  const appId = req.params.id;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "status required" });

  db.query("UPDATE applications SET status = ? WHERE id = ?", [status, appId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Status updated" });
  });
});

module.exports = router;
